from flask import Flask, request, jsonify
import uuid # For generating unique game IDs

# Assuming boxing_game_logic.py is in the same directory
import boxing_game_logic as bgl
import prediction_service # Import the new prediction service

app = Flask(__name__)

# This is where we would ideally load the model and feature order.
# Since initial_analysis.py runs separately, we can't directly use its output here
# without a persistent model file and a mechanism to load it at app startup.
# For now, prediction_service.py has a placeholder for LOADED_MODEL.
# If we had a saved model and feature list:
# try:
#     import joblib
#     model = joblib.load("boxing_outcome_predictor.joblib")
#     # Assuming feature_columns_order.json is saved by initial_analysis.py
#     with open("feature_columns_order.json", 'r') as f:
#         feature_order = json.load(f)
#     prediction_service.set_model_details(model, feature_order)
#     app.logger.info("Prediction model and feature order loaded successfully.")
# except Exception as e:
#     app.logger.error(f"Could not load prediction model or feature order: {e}")
#     # prediction_service.set_model_details(None, []) # Ensure it's reset if loading fails

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


@app.route('/game/<game_id>/predict', methods=['GET'])
def predict_game_outcome_api(game_id):
    game_state_dict = None
    if table:
        try:
            response = table.get_item(Key={'game_id': game_id})
            if 'Item' not in response:
                app.logger.warn(f"Game not found in DynamoDB for prediction: {game_id}")
                return jsonify({"error": "Game not found"}), 404
            game_state_dict = response['Item']
        except ClientError as e:
            app.logger.error(f"DynamoDB ClientError fetching game {game_id} for prediction: {e.response['Error']['Message']}")
            return jsonify({"error": "Failed to retrieve game state for prediction"}), 500
        except Exception as e:
            app.logger.error(f"Unexpected error fetching game {game_id} for prediction from DynamoDB: {str(e)}")
            return jsonify({"error": "Unexpected error retrieving game state for prediction"}), 500
    else:
        app.logger.error("DynamoDB table not configured. Cannot get game state for prediction.")
        return jsonify({"error": "Database service not available"}), 503

    current_game_state = bgl.create_gamestate_from_dict(game_state_dict)
    if not current_game_state:
        app.logger.error(f"Failed to deserialize game state for prediction: {game_id}")
        return jsonify({"error": "Failed to process game state data for prediction"}), 500

    # Get prediction from the prediction service
    # Note: The model within prediction_service might be a placeholder if not loaded
    predicted_outcome = prediction_service.predict_outcome(current_game_state)

    return jsonify({
        "game_id": game_id,
        "current_round": current_game_state.current_round,
        "player_hp": current_game_state.player.hp,
        "opponent_hp": current_game_state.opponent.hp,
        "predicted_outcome": predicted_outcome
    }), 200


if __name__ == '__main__':
    # The following app.run() is for local development only.
    # When deploying to production using Gunicorn, Gunicorn will serve the 'app' object
    # from this file (e.g., `gunicorn app:app`).
    # Ensure Gunicorn is listed in your requirements.txt.

    import logging
    # Configure logging for development. Gunicorn will handle logging in production.
    logging.basicConfig(level=logging.INFO, format='%(asctime)s %(levelname)s: %(message)s [in %(pathname)s:%(lineno)d]')
    app.logger.info("Flask app starting in development mode via app.run()...")

    # --- Setup for prediction_service (Example for local dev) ---
    # In a real scenario, the model and feature order would be loaded from files
    # generated by the initial_analysis.py script.
    # For this example, we use the MockModel from prediction_service.py if __name__ == '__main__'
    # This is a bit of a hack due to the separate script execution model.
    # Ideally, initial_analysis.py would save its model and feature list,
    # and app.py (or a startup script) would load them.

    # If running app.py directly, try to set up the mock model in prediction_service
    # This is for demonstration; a robust solution needs model persistence.
    if prediction_service.LOADED_MODEL is None:
        app.logger.info("Attempting to set up mock model for prediction_service in local dev mode...")
        class MockModelLocal: # Define a similar mock model here or ensure prediction_service can init one
            def predict(self, X):
                app.logger.info(f"MockModelLocal predicting on data with shape: {X.shape}, columns: {X.columns.tolist()}")
                hp_diff_col = 'hp_diff' # Ensure this matches a column in X
                if hp_diff_col not in X.columns:
                    app.logger.warn(f"'{hp_diff_col}' not in preprocessed features for MockModelLocal. Prediction may be off.")
                    return np.array([0]) # Default to Draw if hp_diff is missing

                if X[hp_diff_col].iloc[0] > 10: return np.array([2]) # Player
                elif X[hp_diff_col].iloc[0] < -10: return np.array([1]) # Opponent
                return np.array([0]) # Draw
            _le_classes_for_prediction_service = ['Draw', 'Opponent', 'Player']

        # This feature order MUST match what preprocess_gamestate_for_prediction creates
        # and what the actual model would be trained on.
        # Using the 'all_possible_features' list from prediction_service directly
        # might be safer if it's kept up-to-date there.
        current_feature_order = [
            'current_round', 'round_timer', 'player_hp', 'player_stamina', 'opponent_hp', 'opponent_stamina',
            'hp_diff', 'stamina_diff', 'ps_punches_thrown', 'ps_punches_landed', 'ps_damage_dealt',
            'ps_knockdowns_scored', 'player_accuracy_overall', 'player_jab_accuracy', 'player_cross_accuracy',
            'player_hook_accuracy', 'player_uppercut_accuracy', 'player_dmg_per_landed_punch',
            'player_kd_per_100_dmg', 'os_punches_thrown', 'os_punches_landed', 'os_damage_dealt',
            'os_knockdowns_scored', 'opponent_accuracy_overall', 'opponent_jab_accuracy', 'opponent_cross_accuracy',
            'opponent_hook_accuracy', 'opponent_uppercut_accuracy', 'opponent_dmg_per_landed_punch',
            'opponent_kd_per_100_dmg', 'is_late_round',
            'ps_JAB_thrown', 'ps_JAB_landed', 'ps_CROSS_thrown', 'ps_CROSS_landed',
            'ps_HOOK_thrown', 'ps_HOOK_landed', 'ps_UPPERCUT_thrown', 'ps_UPPERCUT_landed',
            'os_JAB_thrown', 'os_JAB_landed', 'os_CROSS_thrown', 'os_CROSS_landed',
            'os_HOOK_thrown', 'os_HOOK_landed', 'os_UPPERCUT_thrown', 'os_UPPERCUT_landed'
        ]
        # Ensure no duplicates and sort for consistency if order doesn't strictly matter for this mock
        # but for a real model, the training order is KING.
        # For safety, using the list as defined, assuming it matches training.

        # Filter current_feature_order to only include columns that preprocess_gamestate_for_prediction *actually* creates
        # This means taking the intersection of all_possible_features from prediction_service and current_feature_order.
        # This is less about the model and more about what preprocess_gamestate_for_prediction can output.
        # The model then needs to be trained on exactly these (or a subset if FEATURE_COLUMNS_ORDER is used).
        # For now, let's assume `prediction_service.all_possible_features` is the definitive list.
        # This setup is primarily for making the dummy prediction in prediction_service work.

        # The FEATURE_COLUMNS_ORDER in prediction_service.py should be the source of truth,
        # ideally loaded from where initial_analysis.py saves it.
        # Here, we just pass it for the mock model setup.
        prediction_service.set_model_details(MockModelLocal(), current_feature_order)
        app.logger.info("Mock model and feature order set for prediction_service (local dev).")
    else:
        app.logger.info("Prediction model seems to be already set in prediction_service.")

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
