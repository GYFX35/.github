import boxing_game_logic as bgl
import time
import json
import uuid # For unique game IDs

def run_simulation_and_collect_data(num_games=10, output_file="boxing_game_logs.json"):
    """
    Runs a specified number of simulated boxing matches and collects detailed game logs.

    Args:
        num_games (int): The number of games to simulate.
        output_file (str): The path to the JSON file where logs will be saved.

    Returns:
        list: A list containing all log entries from all simulated games.
    """
    all_games_data = []
    print(f"Starting data collection for {num_games} games...")

    for i in range(num_games):
        game_id = str(uuid.uuid4())
        print(f"\n--- Simulating Game {i+1}/{num_games} (ID: {game_id}) ---")

        bgl.clear_game_data_log() # Ensure log is clean for the new game
        game_state = bgl.initialize_new_game() # This also calls the first _log_game_state_data
        game_state.game_id = game_id # Assign unique ID for this game simulation
        game_state.game_id = game_id # Assign unique ID for this game simulation

        # Set the simulation start time reference for accurate `sim_time_elapsed` in logs
        # boxing_game_logic.initialize_new_game() sets _start_time_for_sim_elapsed via its initial log call,
        # but that uses time.time() at that moment. For multiple games, ensure last_tick_time is also reset.
        current_sim_start_time = time.time()
        game_state._start_time_for_sim_elapsed = current_sim_start_time
        game_state.last_tick_time = current_sim_start_time


        bgl.start_new_round(game_state) # Start the first round

        loop_count = 0
        # Max steps per game to prevent potential infinite loops during development/testing
        # Adjust as needed; 3000 steps at 0.01s/step = 30s simulated game time.
        # Max game time is MAX_ROUNDS * ROUND_DURATION_SECONDS, e.g. 3 * 90 = 270s.
        # At 0.01s/step, this is 27000 steps.
        simulation_step_limit = (bgl.MAX_ROUNDS * bgl.ROUND_DURATION_SECONDS) * 150 # Allow 150 ticks per simulated second


        # Simple player action queuing for variety - could be made more sophisticated
        # This plan ensures the player does something periodically.
        player_action_plan = [
            (50, bgl.ActionType.JAB),    # approx 0.5s in
            (150, bgl.ActionType.CROSS), # approx 1.5s in
            (250, bgl.ActionType.BLOCK), # approx 2.5s in
            (350, bgl.ActionType.IDLE),  # approx 3.5s in (to stop blocking)
            (450, bgl.ActionType.JAB),   # approx 4.5s in
            (550, bgl.ActionType.HOOK),  # approx 5.5s in
            # Repeat pattern or add more complex sequences
            (1000, bgl.ActionType.JAB),
            (1100, bgl.ActionType.DODGE),
            (1200, bgl.ActionType.UPPERCUT),
        ]

        # Determine which AI the opponent will use for this game
        # Example: alternate between rule-based and ML-based if ML is available
        opponent_ai_mode = bgl.DEFAULT_AI_MODE
        if bgl.ML_AI_AVAILABLE and i % 2 == 1: # Every other game, try ML AI if available
            opponent_ai_mode = "ML_BASED"
        print(f"Game {game_id}: Opponent AI mode set to {opponent_ai_mode}")


        # Main game simulation loop
        while game_state.match_status != bgl.GameStatus.MATCH_OVER and loop_count < simulation_step_limit:
            loop_count += 1

            # Queue player actions based on the simple plan (relative to loop_count)
            for step, action in player_action_plan:
                if loop_count == step: # Trigger action at specific simulation steps
                    bgl.queue_player_action_for_tick(action)
                    break

            tick_start_time = time.time()
            bgl.game_tick(game_state) # Pass the chosen AI mode to game_tick if it's to be decided there
                                      # Or, if decide_ai_action is called within game_tick, ensure it gets the mode.
                                      # Current bgl.game_tick calls bgl.decide_ai_action without mode, so it uses DEFAULT_AI_MODE
                                      # To use varied AI modes per game, decide_ai_action needs to be passed the mode,
                                      # or game_state needs to hold the current game's AI mode.
                                      # For now, assuming default AI mode or that internal decide_ai_action is modified.
                                      # Let's refine this: we'll pass ai_mode to game_tick if needed, or modify decide_ai_action call.
                                      # For now, the opponent_ai_mode is just for logging here. The actual AI mode selection
                                      # is handled by bgl.decide_ai_action's default or how it's called in game_tick.
                                      # To truly use opponent_ai_mode, game_tick would need to pass it to decide_ai_action.
                                      # This requires modification of game_tick in bgl.
                                      # For now, the data_collector will primarily use the DEFAULT_AI_MODE from bgl.

            # Control simulation speed
            elapsed_tick_processing = time.time() - tick_start_time
            # Faster simulation for data collection: target 0.001s-0.01s per tick if possible
            # Or remove sleep for max speed, but this might starve other processes.
            sleep_duration = max(0, 0.005 - elapsed_tick_processing)
            if sleep_duration > 0:
                time.sleep(sleep_duration)

        winner_val = game_state.winner.value if isinstance(game_state.winner, bgl.FighterName) else game_state.winner
        print(f"Game {game_id} ended. Status: {game_state.match_status.value}, Winner: {winner_val}, Rounds: {game_state.current_round}, Sim Steps: {loop_count}")

        if loop_count >= simulation_step_limit:
            print(f"Warning: Game {game_id} reached simulation step limit ({simulation_step_limit}). Match may be incomplete.")

        current_game_log = bgl.get_game_data_log()
        all_games_data.extend(current_game_log)
        print(f"Collected {len(current_game_log)} log entries for game {game_id}.")

    # Save all collected data to the specified JSON file
    try:
        with open(output_file, 'w') as f:
            json.dump(all_games_data, f, indent=2) # indent for readability
        print(f"\nSuccessfully saved {len(all_games_data)} log entries from {num_games} games to {output_file}")
    except IOError as e:
        print(f"Error writing data to {output_file}: {e}")
    except Exception as e: # Catch any other unexpected errors during save
        print(f"An unexpected error occurred while saving data: {e}")

    return all_games_data


if __name__ == "__main__":
    """
    Main execution block for the data collector.
    Allows running simulations from the command line.
    """
    # Example: Run 5 games and save to 'boxing_sim_logs_collected.json'
    # For actual large-scale data collection, increase num_games significantly.
    # Ensure boxing_game_logic.py's DEFAULT_AI_MODE is set as desired, or modify
    # this script to pass AI mode to game_tick if that's implemented.

    # To test different AI behaviors, one might run this script multiple times
    # with different global AI settings in boxing_game_logic.py, or by
    # modifying this script to control AI mode per game run if bgl is adapted.

    num_sim_games = 5 # Number of games to simulate
    output_log_file = "boxing_sim_logs_collected.json"

    print(f"Running data collector: Simulating {num_sim_games} games, output to {output_log_file}")
    collected_data = run_simulation_and_collect_data(num_games=num_sim_games, output_file=output_log_file)

    if collected_data:
        print(f"\nSample of first 3 log entries from the collected data:")
        for entry in collected_data[:3]: # Print first 3 entries
            print(json.dumps(entry, indent=2))
    else:
        print("\nNo data was collected.")
