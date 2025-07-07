from flask import Flask, request, jsonify
import uuid # For generating unique game IDs

# Assuming boxing_game_logic.py is in the same directory
import boxing_game_logic as bgl

app = Flask(__name__)

import os # For environment variables
import boto3
from botocore.exceptions import ClientError

# Initialize DynamoDB resource.
# This would typically be done once when the Lambda instance initializes (outside the handler).
# For local testing, it will also initialize when app.py is run.
DYNAMODB_TABLE_NAME = os.environ.get('DYNAMODB_TABLE_NAME', 'ARBoxingGameStates') # Get from env var, default for local
try:
    # If running on Lambda, region might be set by AWS_REGION env var automatically.
    # For local testing with DynamoDB Local or a specific AWS region, you might need to specify endpoint_url and region_name.
    # Example for DynamoDB Local:
    # dynamodb = boto3.resource('dynamodb', endpoint_url='http://localhost:8000', region_name='us-east-1')
    # For deployed Lambda, typically just boto3.resource('dynamodb') is enough if region is configured.
    dynamodb = boto3.resource('dynamodb') # Adjust region if needed for local testing against AWS
    table = dynamodb.Table(DYNAMODB_TABLE_NAME)
    # Try a simple operation to check table existence or create it (for local dev)
    # This is a simplification; table creation should be part of IaC (e.g. SAM template)
    # table.load() # Check if table exists - this might throw error if it doesn't.
except Exception as e:
    app.logger.error(f"Failed to initialize DynamoDB table '{DYNAMODB_TABLE_NAME}': {e}")
    # Fallback for local testing if DynamoDB isn't set up, to avoid crashing app.py on import.
    # In a real Lambda, if this fails, the Lambda would likely error out.
    table = None
    app.logger.warn("DynamoDB table could not be initialized. Game state will not persist if table is None.")


# Lambda handler function using serverless-wsgi
# This function will be the entry point for AWS Lambda.
try:
    from serverless_wsgi import handle_request as serverless_wsgi_handle_request
    def lambda_handler(event, context):
        # Any Lambda-specific initialization or context processing can go here
        app.logger.info(f"Lambda event: {event}") # Log the event for debugging
        return serverless_wsgi_handle_request(app, event, context)
except ImportError:
    app.logger.warn("serverless-wsgi not found. lambda_handler not defined. App will only run with dev server.")
    lambda_handler = None


# Simple in-memory store for active game states - TO BE REPLACED BY DYNAMODB
# active_games = {} # Commented out, will use DynamoDB

# The existing serialize_game_state and serialize_fighter are mostly fine.
# We just need to ensure game_id is part of the GameState object before serialization if it's read from DB.
# And ensure that any Decimal types from DynamoDB are converted to float/int before bgl logic uses them.
# The bgl.create_gamestate_from_dict should handle the latter.

def serialize_fighter_for_api(fighter: bgl.Fighter) -> dict:
    """Ensures fighter data is plain dicts/lists/primitives for JSON, converts enums."""
    if not fighter: return None
    return {
        "name": fighter.name.value,
        "hp": fighter.hp,
        "max_hp": fighter.max_hp,
        "stamina": round(fighter.stamina, 1),
        "max_stamina": fighter.max_stamina,
        "knockdowns_this_round": fighter.knockdowns_this_round,
        "total_knockdowns": fighter.total_knockdowns,
        "current_action": fighter.current_action.value,
        "stats": {k.value if isinstance(k, bgl.ActionType) else k: v for k, v in fighter.stats.items()},
        "round_scores": fighter.round_scores
    }

def serialize_game_state_for_api(game_state: bgl.GameState) -> dict:
    """Serializes GameState for API responses, ensuring all parts are JSON-friendly."""
    if not game_state: return None
    return {
        "game_id": getattr(game_state, 'game_id', None), # game_id is now part of GameState from bgl
        "match_status": game_state.match_status.value,
        "current_round": game_state.current_round,
        "max_rounds": game_state.max_rounds,
        "round_timer": round(game_state.round_timer, 1),
        "is_round_active": game_state.is_round_active,
        "between_rounds_timer": round(getattr(game_state, 'between_rounds_timer', 0), 1),
        "winner": game_state.winner.value if isinstance(game_state.winner, bgl.FighterName) else game_state.winner,
        "player": serialize_fighter_for_api(game_state.player),
        "opponent": serialize_fighter_for_api(game_state.opponent),
        "knockdown_info": {
            "is_knockdown": game_state.knockdown_info["is_knockdown"],
            "fighter_down": game_state.knockdown_info["fighter_down"].value if game_state.knockdown_info["fighter_down"] else None,
            "count": round(game_state.knockdown_info["count"], 1)
        },
        "event_log": game_state.event_log[-10:]
    }


@app.route('/game/start', methods=['POST'])
def start_game_api(): # Renamed to avoid conflict if old start_game exists
    game_id = str(uuid.uuid4())
    game_state = bgl.initialize_new_game()
    game_state.game_id = game_id # Assign game_id to the GameState object

    bgl.start_new_round(game_state)

    if table:
        try:
            # Use the API serializer which handles enums correctly for storage
            item_to_store = serialize_game_state_for_api(game_state)
            # DynamoDB expects all top-level keys for the item, game_id is already in item_to_store
            table.put_item(Item=item_to_store)
            app.logger.info(f"Game started and saved to DynamoDB with ID: {game_id}")
        except ClientError as e:
            app.logger.error(f"DynamoDB ClientError saving game: {e.response['Error']['Message']}")
            return jsonify({"error": "Failed to save initial game state"}), 500
        except Exception as e: # Catch any other unexpected errors
            app.logger.error(f"Unexpected error saving game to DynamoDB: {str(e)}")
            return jsonify({"error": "Unexpected server error during game start"}), 500
    else:
        app.logger.error("DynamoDB table not configured. Cannot save game.")
        return jsonify({"error": "Database service not available"}), 503

    return jsonify(serialize_game_state_for_api(game_state)), 200


@app.route('/game/<game_id>/action', methods=['POST'])
def player_action_api(game_id): # Renamed
    game_state_dict = None
    if table:
        try:
            response = table.get_item(Key={'game_id': game_id})
            if 'Item' not in response:
                app.logger.warn(f"Game not found in DynamoDB: {game_id}")
                return jsonify({"error": "Game not found"}), 404
            game_state_dict = response['Item']
        except ClientError as e:
            app.logger.error(f"DynamoDB ClientError fetching game {game_id}: {e.response['Error']['Message']}")
            return jsonify({"error": "Failed to retrieve game state"}), 500
        except Exception as e:
            app.logger.error(f"Unexpected error fetching game {game_id} from DynamoDB: {str(e)}")
            return jsonify({"error": "Unexpected error retrieving game state"}), 500

    else:
        app.logger.error("DynamoDB table not configured. Cannot process action.")
        return jsonify({"error": "Database service not available"}), 503

    # Deserialize the dictionary from DynamoDB back into our GameState object
    # This now uses the new helper in bgl
    game_state = bgl.create_gamestate_from_dict(game_state_dict)
    if not game_state:
        app.logger.error(f"Failed to deserialize game state for {game_id} from dict: {game_state_dict}")
        return jsonify({"error": "Failed to process game state data"}), 500

    # Ensure last_tick_time is set correctly after deserialization, as it's critical for game_tick
    if not hasattr(game_state, 'last_tick_time') or game_state.last_tick_time == 0:
        # If last_tick_time wasn't stored or was invalid, set it to now to avoid large delta_time issues.
        # However, for consistency, it's better if it's always stored and retrieved.
        # The create_gamestate_from_dict defaults it to time.time() if not found.
        pass


    if game_state.match_status == bgl.GameStatus.MATCH_OVER:
        app.logger.info(f"Action request for game {game_id} which is already over.")
        return jsonify({"error": "Match is over", "game_state": serialize_game_state_for_api(game_state)}), 400

    action_data = request.json
    if not action_data or "action" not in action_data:
        return jsonify({"error": "Missing action in request body"}), 400

    action_str = action_data["action"]
    try:
        action_type = bgl.ActionType[action_str.upper()]
    except KeyError:
        return jsonify({"error": f"Invalid action: {action_str}"}), 400

    # Process the action
    if game_state.is_round_active or game_state.knockdown_info["is_knockdown"] or game_state.match_status == bgl.GameStatus.BETWEEN_ROUNDS:
        bgl.queue_player_action_for_tick(action_type)
        bgl.game_tick(game_state) # This updates game_state in place

        # Save the updated game_state back to DynamoDB
        if table:
            try:
                updated_item_to_store = serialize_game_state_for_api(game_state)
                table.put_item(Item=updated_item_to_store)
                app.logger.info(f"Action '{action_str}' processed for game {game_id} and state saved. Player HP: {game_state.player.hp}, Opponent HP: {game_state.opponent.hp}")
            except ClientError as e:
                app.logger.error(f"DynamoDB ClientError saving updated game state {game_id}: {e.response['Error']['Message']}")
                # Decide if you should return an error to client or the potentially stale state before save failed
                return jsonify({"error": "Failed to save updated game state"}), 500
            except Exception as e:
                app.logger.error(f"Unexpected error saving updated game state {game_id} to DynamoDB: {str(e)}")
                return jsonify({"error": "Unexpected server error saving game state"}), 500
        else:
            # This case should ideally not be reached if initial checks for table are done.
            app.logger.error("DynamoDB table not configured. Cannot save updated game state.")
            return jsonify({"error": "Database service not available during action processing"}), 503
    else:
        app.logger.warn(f"Action '{action_str}' received for game {game_id} but game not in a state to process actions directly. Status: {game_state.match_status.value}")
        # Return current (un-ticked) state if no tick was processed

    return jsonify(serialize_game_state_for_api(game_state)), 200


@app.route('/game/<game_id>/state', methods=['GET'])
def get_game_state_api(game_id): # Renamed
    # game_state = active_games.get(game_id) # Old in-memory
    if table:
        try:
            response = table.get_item(Key={'game_id': game_id})
            if 'Item' in response:
                game_state_dict = response['Item']
                game_state = bgl.create_gamestate_from_dict(game_state_dict) # Deserialize
                if not game_state:
                     app.logger.error(f"Failed to deserialize game state for GET {game_id}")
                     return jsonify({"error": "Failed to process game state data"}), 500
                app.logger.info(f"State requested and retrieved from DynamoDB for game {game_id}")
                return jsonify(serialize_game_state_for_api(game_state)), 200
            else:
                app.logger.warn(f"Game not found in DynamoDB on GET request: {game_id}")
                return jsonify({"error": "Game not found"}), 404
        except ClientError as e:
            app.logger.error(f"DynamoDB ClientError fetching game state {game_id} on GET: {e.response['Error']['Message']}")
            return jsonify({"error": "Failed to retrieve game state"}), 500
        except Exception as e:
            app.logger.error(f"Unexpected error fetching game state {game_id} on GET from DynamoDB: {str(e)}")
            return jsonify({"error": "Unexpected error retrieving game state"}), 500
    else:
        app.logger.error("DynamoDB table not configured. Cannot get game state.")
        return jsonify({"error": "Database service not available"}), 503


if __name__ == '__main__':
    # The following app.run() is for local development only.
    # When deploying to production using Gunicorn, Gunicorn will serve the 'app' object
    # from this file (e.g., `gunicorn app:app`).
    # Ensure Gunicorn is listed in your requirements.txt.

    # Note on CORS (Cross-Origin Resource Sharing):
    # If your static front-end assets (HTML, JS, CSS) are served from a different domain
    # or port than this API in production, you'll need to configure CORS on the server.
    # For example, using the Flask-CORS extension:
    # from flask_cors import CORS
    # CORS(app) # This allows all origins by default.
    # For production, you should restrict it to specific origins:
    # CORS(app, resources={r"/game/*": {"origins": "https://yourfrontenddomain.com"}})

    # Note on 'active_games' persistence:
    # The current 'active_games' dictionary is an in-memory store. This means all game
    # states will be lost if the server restarts or if you scale to multiple instances
    # (as each instance would have its own separate dictionary).
    # For a production application, this should be replaced with a persistent and/or
    # shared storage solution, such as:
    # - A database (e.g., PostgreSQL, MySQL, MongoDB) for storing game states.
    # - An in-memory data store like Redis (which can also be configured for persistence)
    #   for fast access to active game sessions.

    import logging
    # Configure logging for development. Gunicorn will handle logging in production.
    if __name__ == '__main__':
        logging.basicConfig(level=logging.INFO, format='%(asctime)s %(levelname)s: %(message)s [in %(pathname)s:%(lineno)d]')
        app.logger.info("Flask app starting in development mode via app.run()...")
        bgl.PLAYER_ACTION_QUEUE.clear() # Clear any test queue items
        app.run(host='0.0.0.0', port=5001, debug=True)
```

**Self-correction/Notes for `app.py`:**
1.  **Serialization:** Added a `serialize_game_state` function to convert `GameState` and nested `Fighter` objects (including enums) into JSON-friendly dictionaries. This is crucial for `jsonify`.
2.  **Game ID:** Game states are stored in `active_games` dictionary keyed by a `uuid`. The `game_id` is also added as an attribute to the `game_state` object itself for convenience in `serialize_game_state`.
3.  **Starting the Game:** The `/game/start` endpoint now also calls `bgl.start_new_round(game_state)` because a game usually starts directly into round 1.
4.  **`game_tick` in Action Endpoint:** It's important that after a player action is received and queued, `bgl.game_tick(game_state)` is called. This processes the queued player action, allows the AI to take a turn, updates timers, stamina, etc. Without this, the game state wouldn't change immediately after a player's action.
5.  **`game_tick` in State Endpoint (Commented Out):** Considered adding `game_tick` to `GET /state` for auto-updating state, but decided against it for now to keep GET requests simpler and without side-effects. The primary driver of state change will be player actions. A polling front-end might eventually need this or a WebSocket connection.
6.  **Logging:** Added basic Flask app logging (`app.logger.info`).
7.  **Port:** Changed default port to `5001` to avoid common conflicts.
8.  **PLAYER_ACTION_QUEUE:** Added a clear for `bgl.PLAYER_ACTION_QUEUE` in `if __name__ == '__main__':` just in case of interactive re-runs where the global list might persist.

This `app.py` provides the basic API endpoints. Next, we'll create the HTML, CSS, and JS to interact with it.
