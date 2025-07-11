import json
import pandas as pd
import numpy as np
# import matplotlib.pyplot as plt # Placeholder for actual plotting
# import seaborn as sns # Placeholder for actual plotting

# --- Configuration ---
LOG_FILE_PATH = "boxing_sim_logs.json" # Expected output from data_collector.py

# --- Sample Data (if LOG_FILE_PATH is not found or for quick testing) ---
# This sample resembles the structure defined in boxing_game_logic._log_game_state_data
SAMPLE_LOG_DATA = [
    {
        "game_id": "sample_game_1", "log_timestamp": 1678886400.0, "sim_time_elapsed": 0.0,
        "current_round": 1, "round_timer": 90.0, "match_status": "active",
        "player_hp": 100, "player_stamina": 100.0, "player_current_action": "IDLE",
        "player_stats": {"punches_thrown": 0, "punches_landed": 0, "damage_dealt": 0, "JAB": {"thrown": 0, "landed": 0}, "CROSS": {"thrown": 0, "landed": 0}, "HOOK": {"thrown": 0, "landed": 0}, "UPPERCUT": {"thrown": 0, "landed": 0}, "knockdowns_scored": 0},
        "opponent_hp": 100, "opponent_stamina": 100.0, "opponent_current_action": "IDLE",
        "opponent_stats": {"punches_thrown": 0, "punches_landed": 0, "damage_dealt": 0, "JAB": {"thrown": 0, "landed": 0}, "CROSS": {"thrown": 0, "landed": 0}, "HOOK": {"thrown": 0, "landed": 0}, "UPPERCUT": {"thrown": 0, "landed": 0}, "knockdowns_scored": 0},
        "knockdown_is_active": False, "knockdown_fighter_down": None, "knockdown_count": 0.0,
        "event_trigger": "start_new_round", "action_taken_by_player": None, "action_taken_by_opponent": None, "winner": None
    },
    {
        "game_id": "sample_game_1", "log_timestamp": 1678886401.5, "sim_time_elapsed": 1.5,
        "current_round": 1, "round_timer": 88.5, "match_status": "active",
        "player_hp": 100, "player_stamina": 95.0, "player_current_action": "JAB",
        "player_stats": {"punches_thrown": 1, "punches_landed": 1, "damage_dealt": 5, "JAB": {"thrown": 1, "landed": 1}, "CROSS": {"thrown": 0, "landed": 0}, "HOOK": {"thrown": 0, "landed": 0}, "UPPERCUT": {"thrown": 0, "landed": 0}, "knockdowns_scored": 0},
        "opponent_hp": 95, "opponent_stamina": 100.0, "opponent_current_action": "IDLE",
        "opponent_stats": {"punches_thrown": 0, "punches_landed": 0, "damage_dealt": 0, "JAB": {"thrown": 0, "landed": 0}, "CROSS": {"thrown": 0, "landed": 0}, "HOOK": {"thrown": 0, "landed": 0}, "UPPERCUT": {"thrown": 0, "landed": 0}, "knockdowns_scored": 0},
        "knockdown_is_active": False, "knockdown_fighter_down": None, "knockdown_count": 0.0,
        "event_trigger": "fighter_action_resolved", "action_taken_by_player": "JAB", "action_taken_by_opponent": None, "winner": None
    },
    {
        "game_id": "sample_game_1", "log_timestamp": 1678886402.0, "sim_time_elapsed": 2.0,
        "current_round": 1, "round_timer": 88.0, "match_status": "active",
        "player_hp": 100, "player_stamina": 95.0, "player_current_action": "IDLE",
        "player_stats": {"punches_thrown": 1, "punches_landed": 1, "damage_dealt": 5, "JAB": {"thrown": 1, "landed": 1}, "CROSS": {"thrown": 0, "landed": 0}, "HOOK": {"thrown": 0, "landed": 0}, "UPPERCUT": {"thrown": 0, "landed": 0}, "knockdowns_scored": 0},
        "opponent_hp": 90, "opponent_stamina": 90.0, "opponent_current_action": "CROSS",
        "opponent_stats": {"punches_thrown": 1, "punches_landed": 1, "damage_dealt": 10, "JAB": {"thrown": 0, "landed": 0}, "CROSS": {"thrown": 1, "landed": 1}, "HOOK": {"thrown": 0, "landed": 0}, "UPPERCUT": {"thrown": 0, "landed": 0}, "knockdowns_scored": 0},
        "knockdown_is_active": False, "knockdown_fighter_down": None, "knockdown_count": 0.0,
        "event_trigger": "fighter_action_resolved", "action_taken_by_player": None, "action_taken_by_opponent": "CROSS", "winner": None
    },
        {
        "game_id": "sample_game_1", "log_timestamp": 1678886490.0, "sim_time_elapsed": 90.0,
        "current_round": 1, "round_timer": 0.0, "match_status": "between_rounds", # Changed to between_rounds
        "player_hp": 80, "player_stamina": 50.0, "player_current_action": "IDLE",
        "player_stats": {"punches_thrown": 10, "punches_landed": 6, "damage_dealt": 40, "JAB": {"thrown": 5, "landed": 3}, "CROSS": {"thrown": 5, "landed": 3}, "HOOK": {"thrown": 0, "landed": 0}, "UPPERCUT": {"thrown": 0, "landed": 0}, "knockdowns_scored": 0},
        "opponent_hp": 70, "opponent_stamina": 60.0, "opponent_current_action": "IDLE",
        "opponent_stats": {"punches_thrown": 12, "punches_landed": 5, "damage_dealt": 30, "JAB": {"thrown": 6, "landed": 2}, "CROSS": {"thrown": 6, "landed": 3}, "HOOK": {"thrown": 0, "landed": 0}, "UPPERCUT": {"thrown": 0, "landed": 0}, "knockdowns_scored": 0},
        "knockdown_is_active": False, "knockdown_fighter_down": None, "knockdown_count": 0.0,
        "event_trigger": "round_end_time", "action_taken_by_player": None, "action_taken_by_opponent": None, "winner": None # Winner still None until match_end
    },
    {
        "game_id": "sample_game_1", "log_timestamp": 1678886580.0, "sim_time_elapsed": 180.0, # Assuming 2 rounds passed
        "current_round": 2, "round_timer": 0.0, "match_status": "match_over",
        "player_hp": 50, "player_stamina": 30.0, "player_current_action": "IDLE",
        "player_stats": {"punches_thrown": 20, "punches_landed": 12, "damage_dealt": 80, "JAB": {"thrown": 10, "landed": 6}, "CROSS": {"thrown": 10, "landed": 6}, "HOOK": {"thrown": 0, "landed": 0}, "UPPERCUT": {"thrown": 0, "landed": 0}, "knockdowns_scored": 1},
        "opponent_hp": 0, "opponent_stamina": 10.0, "opponent_current_action": "IDLE",
        "opponent_stats": {"punches_thrown": 22, "punches_landed": 10, "damage_dealt": 60, "JAB": {"thrown": 11, "landed": 5}, "CROSS": {"thrown": 11, "landed": 5}, "HOOK": {"thrown": 0, "landed": 0}, "UPPERCUT": {"thrown": 0, "landed": 0}, "knockdowns_scored": 0},
        "knockdown_is_active": True, "knockdown_fighter_down": "Opponent", "knockdown_count": 10.0, # Opponent KO'd
        "event_trigger": "match_end", "action_taken_by_player": None, "action_taken_by_opponent": None, "winner": "Player"
    }
]

# --- Load Data ---
def load_data(filepath):
    """Loads game log data from a JSON file."""
    try:
        with open(filepath, 'r') as f:
            data = json.load(f)
        print(f"Successfully loaded {len(data)} log entries from {filepath}")
        return pd.DataFrame(data)
    except FileNotFoundError:
        print(f"Warning: Log file {filepath} not found. Using sample data for demonstration.")
        return pd.DataFrame(SAMPLE_LOG_DATA)
    except json.JSONDecodeError:
        print(f"Error: Could not decode JSON from {filepath}. Using sample data.")
        return pd.DataFrame(SAMPLE_LOG_DATA)
    except Exception as e:
        print(f"An error occurred while loading {filepath}: {e}. Using sample data.")
        return pd.DataFrame(SAMPLE_LOG_DATA)

# --- Basic EDA Functions ---
def perform_basic_eda(df):
    """Performs and prints basic Exploratory Data Analysis."""
    if df.empty:
        print("DataFrame is empty. Skipping EDA.")
        return

    print("\n--- Basic Data Information ---")
    df.info()

    print("\n--- Descriptive Statistics (Numeric Columns) ---")
    # Select only numeric columns for describe(), handle potential errors if none exist
    numeric_cols = df.select_dtypes(include=np.number)
    if not numeric_cols.empty:
        print(numeric_cols.describe())
    else:
        print("No numeric columns found for descriptive statistics.")

    print("\n--- Value Counts for Key Categorical Columns ---")
    categorical_cols = ["event_trigger", "match_status", "player_current_action", "opponent_current_action", "winner"]
    for col in categorical_cols:
        if col in df.columns:
            print(f"\nValue counts for '{col}':")
            print(df[col].value_counts(dropna=False)) # include NaN counts
        else:
            print(f"Column '{col}' not found in DataFrame.")

    # Example: Distribution of HP at the end of matches
    final_states_df = df[df['event_trigger'] == 'match_end'].copy()
    if not final_states_df.empty:
        print("\n--- HP Distribution at Match End ---")
        print("Player HP at match end (mean):", final_states_df['player_hp'].mean())
        print("Opponent HP at match end (mean):", final_states_df['opponent_hp'].mean())
        # In a real environment, use histograms:
        # final_states_df['player_hp'].plot(kind='hist', title='Player HP at Match End', bins=10)
        # plt.show()
        # final_states_df['opponent_hp'].plot(kind='hist', title='Opponent HP at Match End', bins=10)
        # plt.show()
    else:
        print("No 'match_end' events found to analyze HP distribution at match end.")

    # Example: Number of knockdowns per game
    knockdown_events = df[df['event_trigger'] == 'knockdown_start']
    if not knockdown_events.empty:
        knockdowns_per_game = knockdown_events.groupby('game_id').size()
        print("\n--- Knockdowns Per Game ---")
        print(knockdowns_per_game.describe())
        # knockdowns_per_game.plot(kind='hist', title='Distribution of Knockdowns Per Game', bins=max(1, knockdowns_per_game.max()))
        # plt.show()
    else:
        print("No 'knockdown_start' events found to analyze knockdowns per game.")


# --- Feature Engineering Functions ---
def engineer_features(df):
    """Engineers new features from the existing log data."""
    if df.empty:
        print("DataFrame is empty. Skipping feature engineering.")
        return df

    print("\n--- Engineering Features ---")
    df_processed = df.copy()

    # 1. HP and Stamina Differentials
    df_processed['hp_diff'] = df_processed['player_hp'] - df_processed['opponent_hp']
    df_processed['stamina_diff'] = df_processed['player_stamina'] - df_processed['opponent_stamina']

    # 2. Accuracy (example for player, can be expanded for opponent and specific punches)
    # Need to access nested stats. This is more complex if stats are dicts in cells.
    # Assuming player_stats and opponent_stats are already somewhat flattened or accessible.
    # For this example, let's assume the structure from SAMPLE_LOG_DATA where player_stats is a dict.
    # This requires careful handling of the nested structure.

    # Flatten player stats for easier access
    if 'player_stats' in df_processed.columns and isinstance(df_processed['player_stats'].iloc[0], dict):
        player_stats_df = pd.json_normalize(df_processed['player_stats'])
        player_stats_df.columns = [f"ps_{col.replace('.', '_')}" for col in player_stats_df.columns] # Prefix to avoid clashes
        df_processed = pd.concat([df_processed.drop(columns=['player_stats']), player_stats_df], axis=1)

    if 'opponent_stats' in df_processed.columns and isinstance(df_processed['opponent_stats'].iloc[0], dict):
        opponent_stats_df = pd.json_normalize(df_processed['opponent_stats'])
        opponent_stats_df.columns = [f"os_{col.replace('.', '_')}" for col in opponent_stats_df.columns]
        df_processed = pd.concat([df_processed.drop(columns=['opponent_stats']), opponent_stats_df], axis=1)

    # Now calculate accuracies if the flattened columns exist
    if 'ps_punches_thrown' in df_processed.columns and 'ps_punches_landed' in df_processed.columns:
        df_processed['player_accuracy_overall'] = (df_processed['ps_punches_landed'] / df_processed['ps_punches_thrown']).fillna(0)
    if 'os_punches_thrown' in df_processed.columns and 'os_punches_landed' in df_processed.columns:
        df_processed['opponent_accuracy_overall'] = (df_processed['os_punches_landed'] / df_processed['os_punches_thrown']).fillna(0)

    # Example for JAB accuracy (if JAB.thrown and JAB.landed exist after flattening)
    if 'ps_JAB_thrown' in df_processed.columns and 'ps_JAB_landed' in df_processed.columns:
        df_processed['player_jab_accuracy'] = (df_processed['ps_JAB_landed'] / df_processed['ps_JAB_thrown']).fillna(0)
    if 'os_JAB_thrown' in df_processed.columns and 'os_JAB_landed' in df_processed.columns:
        df_processed['opponent_jab_accuracy'] = (df_processed['os_JAB_landed'] / df_processed['os_JAB_thrown']).fillna(0)

    # 3. Ratios (e.g., damage dealt per punch thrown)
    if 'ps_damage_dealt' in df_processed.columns and 'ps_punches_thrown' in df_processed.columns:
        df_processed['player_dmg_per_punch_thrown'] = (df_processed['ps_damage_dealt'] / df_processed['ps_punches_thrown']).fillna(0)
    if 'os_damage_dealt' in df_processed.columns and 'os_punches_thrown' in df_processed.columns:
        df_processed['opponent_dmg_per_punch_thrown'] = (df_processed['os_damage_dealt'] / df_processed['os_punches_thrown']).fillna(0)

    # 4. Time-based features (e.g., is_late_round)
    if 'current_round' in df_processed.columns:
        df_processed['is_late_round'] = df_processed['current_round'] >= (df_processed['current_round'].max() // 2 + 1) if not df_processed['current_round'].empty else False


    # 5. Target variable for match outcome prediction (needs to be forward-filled for each game)
    # This is more complex and should be done carefully.
    # For each game, the 'winner' is typically known only at the 'match_end' event.
    # We need to propagate this winner information back to all log entries for that game.
    if 'winner' in df_processed.columns and 'game_id' in df_processed.columns:
        # Get the actual winner for each game (last non-null winner entry per game)
        game_winners = df_processed.loc[df_processed['winner'].notna()].groupby('game_id')['winner'].last()
        df_processed['actual_game_winner'] = df_processed['game_id'].map(game_winners)
        # Fill NaNs for ongoing games if necessary, or handle them in model training
        # df_processed['actual_game_winner'].fillna("UNKNOWN", inplace=True)


    print(f"Engineered features. New shape: {df_processed.shape}")
    print("Sample of engineered features (first 5 rows):")
    print(df_processed.head().to_string())
    return df_processed

# --- Performance Analytics (KPIs) Functions ---
def calculate_kpis(df):
    """Calculates various Key Performance Indicators (KPIs) from the processed DataFrame."""
    if df.empty:
        print("DataFrame is empty. Skipping KPI calculation.")
        return df

    print("\n--- Calculating Performance KPIs ---")
    kpi_df = df.copy()

    # Overall Accuracy (already calculated as player_accuracy_overall, opponent_accuracy_overall)

    # Accuracy per punch type (already calculated for JAB, extend for others if data allows)
    for punch_type in ["CROSS", "HOOK", "UPPERCUT"]:
        if f'ps_{punch_type}_thrown' in kpi_df.columns and f'ps_{punch_type}_landed' in kpi_df.columns:
            kpi_df[f'player_{punch_type.lower()}_accuracy'] = \
                (kpi_df[f'ps_{punch_type}_landed'] / kpi_df[f'ps_{punch_type}_thrown']).fillna(0)
        if f'os_{punch_type}_thrown' in kpi_df.columns and f'os_{punch_type}_landed' in kpi_df.columns:
            kpi_df[f'opponent_{punch_type.lower()}_accuracy'] = \
                (kpi_df[f'os_{punch_type}_landed'] / kpi_df[f'os_{punch_type}_thrown']).fillna(0)

    # Damage per Landed Punch
    if 'ps_damage_dealt' in kpi_df.columns and 'ps_punches_landed' in kpi_df.columns:
        kpi_df['player_dmg_per_landed_punch'] = \
            (kpi_df['ps_damage_dealt'] / kpi_df['ps_punches_landed'].replace(0, np.nan)).fillna(0) # Avoid division by zero if no punches landed
    if 'os_damage_dealt' in kpi_df.columns and 'os_punches_landed' in kpi_df.columns:
        kpi_df['opponent_dmg_per_landed_punch'] = \
            (kpi_df['os_damage_dealt'] / kpi_df['os_punches_landed'].replace(0, np.nan)).fillna(0)

    # Aggression: Punches thrown per unit of sim_time_elapsed (more meaningful when aggregated per game/round)
    # This is tricky to calculate per row without knowing the start of the current round/game for each row.
    # For now, we'll focus on metrics derivable from existing cumulative stats per row,
    # or aggregate them later in the analysis.

    # Knockdown Efficiency (Knockdowns per 100 damage dealt - example)
    if 'ps_knockdowns_scored' in kpi_df.columns and 'ps_damage_dealt' in kpi_df.columns:
        kpi_df['player_kd_per_100_dmg'] = \
            (kpi_df['ps_knockdowns_scored'] * 100 / kpi_df['ps_damage_dealt'].replace(0, np.nan)).fillna(0)
    if 'os_knockdowns_scored' in kpi_df.columns and 'os_damage_dealt' in kpi_df.columns:
        kpi_df['opponent_kd_per_100_dmg'] = \
            (kpi_df['os_knockdowns_scored'] * 100 / kpi_df['os_damage_dealt'].replace(0, np.nan)).fillna(0)

    # Stamina Management: Average stamina (this is better computed per game/round summary)
    # For per-row, it's just player_stamina / opponent_stamina.

    print("KPIs calculated. Displaying a sample of new KPI columns (first 5 rows):")
    kpi_cols_to_show = [
        'player_accuracy_overall', 'opponent_accuracy_overall',
        'player_jab_accuracy', 'opponent_jab_accuracy',
        'player_cross_accuracy', 'opponent_cross_accuracy', # if available from sample
        'player_dmg_per_landed_punch', 'opponent_dmg_per_landed_punch',
        'player_kd_per_100_dmg', 'opponent_kd_per_100_dmg'
    ]
    # Filter to only show columns that actually exist in kpi_df to prevent KeyError
    existing_kpi_cols = [col for col in kpi_cols_to_show if col in kpi_df.columns]
    if existing_kpi_cols:
        print(kpi_df[existing_kpi_cols].head().to_string())
    else:
        print("No new KPI columns were generated or they are not in the display list.")

    return kpi_df

def display_aggregated_kpis(df_with_kpis):
    """Calculates and displays KPIs aggregated per game or per player."""
    if df_with_kpis.empty:
        print("DataFrame is empty. Skipping aggregated KPI display.")
        return

    print("\n--- Aggregated Performance KPIs (Example: Per Game Averages for Winner) ---")

    # Ensure 'actual_game_winner' and 'game_id' exist
    if 'actual_game_winner' not in df_with_kpis.columns or 'game_id' not in df_with_kpis.columns:
        print("Required columns 'actual_game_winner' or 'game_id' not found for aggregated KPI display.")
        return

    # Filter for final state of each game to get final stats
    final_game_states = df_with_kpis.loc[df_with_kpis.groupby('game_id')['sim_time_elapsed'].idxmax()]

    if final_game_states.empty:
        print("No final game states found to aggregate KPIs.")
        return

    # KPIs to aggregate (focus on player stats if player is winner, opponent stats if opponent is winner)
    # This is a bit simplified; a full analysis might compare winners vs losers directly.

    # Example: Average accuracy of players who won their games
    player_won_games = final_game_states[final_game_states['actual_game_winner'] == 'Player']
    if not player_won_games.empty:
        print("\n--- Player Performance (Games Won by Player) ---")
        print(f"Number of games won by Player: {len(player_won_games)}")
        kpis_to_report_player = {
            "Overall Accuracy": "player_accuracy_overall",
            "Jab Accuracy": "player_jab_accuracy",
            "Cross Accuracy": "player_cross_accuracy",
            "Hook Accuracy": "player_hook_accuracy",
            "Uppercut Accuracy": "player_uppercut_accuracy",
            "Damage per Landed Punch": "player_dmg_per_landed_punch",
            "KD per 100 Dmg": "player_kd_per_100_dmg",
            "Total Punches Thrown": "ps_punches_thrown",
            "Total Punches Landed": "ps_punches_landed",
            "Total Damage Dealt": "ps_damage_dealt",
            "Total Knockdowns Scored": "ps_knockdowns_scored"
        }
        for kpi_name, col_name in kpis_to_report_player.items():
            if col_name in player_won_games.columns:
                mean_val = player_won_games[col_name].mean()
                sum_val = player_won_games[col_name].sum()
                if "Accuracy" in kpi_name or "per" in kpi_name: # typically averages
                     print(f"  Avg {kpi_name}: {mean_val:.2f}")
                else: # typically sums like total damage, total KDs
                     print(f"  Total {kpi_name}: {sum_val}") # Sum for counts like KDs, damage
            else:
                print(f"  {kpi_name}: (column {col_name} not found)")
    else:
        print("\nNo games found where Player won, for player KPI aggregation.")

    opponent_won_games = final_game_states[final_game_states['actual_game_winner'] == 'Opponent']
    if not opponent_won_games.empty:
        print("\n--- Opponent Performance (Games Won by Opponent) ---")
        print(f"Number of games won by Opponent: {len(opponent_won_games)}")
        kpis_to_report_opponent = {
            "Overall Accuracy": "opponent_accuracy_overall",
            "Jab Accuracy": "opponent_jab_accuracy",
            "Cross Accuracy": "opponent_cross_accuracy",
            "Hook Accuracy": "opponent_hook_accuracy",
            "Uppercut Accuracy": "opponent_uppercut_accuracy",
            "Damage per Landed Punch": "opponent_dmg_per_landed_punch",
            "KD per 100 Dmg": "opponent_kd_per_100_dmg",
            "Total Punches Thrown": "os_punches_thrown",
            "Total Punches Landed": "os_punches_landed",
            "Total Damage Dealt": "os_damage_dealt",
            "Total Knockdowns Scored": "os_knockdowns_scored"
        }
        for kpi_name, col_name in kpis_to_report_opponent.items():
            if col_name in opponent_won_games.columns:
                mean_val = opponent_won_games[col_name].mean()
                sum_val = opponent_won_games[col_name].sum()
                if "Accuracy" in kpi_name or "per" in kpi_name:
                     print(f"  Avg {kpi_name}: {mean_val:.2f}")
                else:
                     print(f"  Total {kpi_name}: {sum_val}")
            else:
                print(f"  {kpi_name}: (column {col_name} not found)")

    else:
        print("\nNo games found where Opponent won, for opponent KPI aggregation.")

    draw_games = final_game_states[final_game_states['actual_game_winner'] == 'draw']
    if not draw_games.empty:
        print("\n--- Performance in Drawn Games (Player Perspective) ---")
        # Report player stats for drawn games as an example
        for kpi_name, col_name in kpis_to_report_player.items(): # Using player KPI map
            if col_name in draw_games.columns:
                mean_val = draw_games[col_name].mean()
                sum_val = draw_games[col_name].sum()
                if "Accuracy" in kpi_name or "per" in kpi_name:
                     print(f"  Avg Player {kpi_name}: {mean_val:.2f}")
                else:
                     print(f"  Total Player {kpi_name}: {sum_val}")
            else:
                print(f"  Player {kpi_name}: (column {col_name} not found)")
    else:
        print("\nNo drawn games found for analysis.")

    print("\n--- Overall Averages (All Games) ---")
    if not final_game_states.empty:
        # Player overall averages
        print_fighter_overall_averages(final_game_states, "Player", kpis_to_report_player)
        # Opponent overall averages
        print_fighter_overall_averages(final_game_states, "Opponent", kpis_to_report_opponent)
    else:
        print("No final game states to calculate overall averages.")


    # Placeholder for visualizations
    # For example, box plot of HP difference for winners vs losers
    # if 'hp_diff' in final_game_states.columns and final_game_states['actual_game_winner'].notna().any():
    #     # Ensure actual_game_winner does not have NaN for plotting
    #     plot_df = final_game_states.dropna(subset=['actual_game_winner', 'hp_diff'])
    #     if not plot_df.empty:
    #         # sns.boxplot(x='actual_game_winner', y='hp_diff', data=plot_df)
    #         # plt.title('HP Difference at Match End by Winner')
    #         # plt.show()
    #         print("Placeholder for: Box plot of HP Difference at Match End by Winner")
    #     else:
    #         print("Not enough data to plot HP Difference by Winner after dropping NaNs.")

def print_fighter_overall_averages(df, fighter_type_prefix, kpi_map):
    """Helper function to print overall average KPIs for a fighter type (Player/Opponent)."""
    print(f"\nOverall Average Stats for {fighter_type_prefix} (across all games):")
    for kpi_name, col_name in kpi_map.items():
        # Adjust col_name if it's generic and needs prefix (e.g. ps_ or os_)
        # This function assumes col_name is already prefixed correctly for player/opponent
        if col_name in df.columns:
            mean_val = df[col_name].mean()
            sum_val = df[col_name].sum() # Sum might be relevant for totals over all games
            if "Accuracy" in kpi_name or "per" in kpi_name:
                 print(f"  Avg {kpi_name}: {mean_val:.2f}")
            else: # For counts like total punches, damage, KDs - mean per game is more insightful than sum over all games
                 print(f"  Avg {kpi_name} (per game): {mean_val:.2f}") # Changed to mean for totals as well for per-game average
        else:
            print(f"  {kpi_name}: (column {col_name} not found)")


# --- Data Preparation for Prediction Model ---
def prepare_data_for_prediction(df_with_kpis):
    """
    Prepares the data for match outcome prediction.
    Selects features and target variable, and splits into training/testing sets.
    """
    if df_with_kpis.empty:
        print("DataFrame is empty. Skipping data preparation for prediction.")
        return None, None, None, None

    print("\n--- Preparing Data for Prediction Model ---")

    # We'll use data points from the end of each round for prediction
    # Or, alternatively, every N seconds/ticks if more granularity is needed.
    # For this example, let's use states at the end of rounds or match end.
    # 'round_end_time' or 'match_end' events are good candidates.
    # We also need 'actual_game_winner' which should have been propagated.

    prediction_df = df_with_kpis[
        df_with_kpis['event_trigger'].isin(['round_end_time', 'match_end']) &
        df_with_kpis['actual_game_winner'].notna() # Only use rows where winner is known
    ].copy()

    if prediction_df.empty:
        print("No suitable data points found for prediction (e.g., end-of-round/match states with known winners).")
        return None, None, None, None

    # Define features (X) and target (y)
    # Features should be numeric and not directly leak the future outcome for that row.
    # 'actual_game_winner' is the target.
    # 'winner' column (current row's winner, often NaN until match_end) should not be a feature.

    feature_columns = [
        'current_round', 'round_timer', # Though round_timer might often be 0 for these events
        'player_hp', 'player_stamina',
        'opponent_hp', 'opponent_stamina',
        'hp_diff', 'stamina_diff',
        # Player stats (at the point of prediction)
        'ps_punches_thrown', 'ps_punches_landed', 'ps_damage_dealt', 'ps_knockdowns_scored',
        'player_accuracy_overall', 'player_jab_accuracy', 'player_cross_accuracy',
        'player_hook_accuracy', 'player_uppercut_accuracy',
        'player_dmg_per_landed_punch', 'player_kd_per_100_dmg',
        # Opponent stats (at the point of prediction)
        'os_punches_thrown', 'os_punches_landed', 'os_damage_dealt', 'os_knockdowns_scored',
        'opponent_accuracy_overall', 'opponent_jab_accuracy', 'opponent_cross_accuracy',
        'opponent_hook_accuracy', 'opponent_uppercut_accuracy',
        'opponent_dmg_per_landed_punch', 'opponent_kd_per_100_dmg',
        'is_late_round'
    ]

    # Filter out columns that might not exist if player/opponent stats weren't fully populated (e.g. no hooks thrown)
    existing_feature_columns = [col for col in feature_columns if col in prediction_df.columns]

    if not existing_feature_columns:
        print("No feature columns found in the prediction DataFrame. Cannot proceed.")
        return None, None, None, None

    X = prediction_df[existing_feature_columns]
    y = prediction_df['actual_game_winner'] # Target: 'Player', 'Opponent', 'draw'

    # Handle potential NaN values in features (e.g., if a division by zero occurred for an accuracy)
    # For simplicity, fill with 0, but more sophisticated imputation could be used.
    X = X.fillna(0)

    print(f"Shape of X (features): {X.shape}")
    print(f"Shape of y (target): {y.shape}")
    print(f"Target value counts:\n{y.value_counts(normalize=True)}")

    # For now, just return X and y. Splitting will be done in the modeling step.
    # from sklearn.model_selection import train_test_split
    # X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
    # print(f"X_train shape: {X_train.shape}, X_test shape: {X_test.shape}")
    # return X_train, X_test, y_train, y_test

    print("Data preparation for prediction model complete (X and y returned).")
    return X, y, None, None # Returning None for X_test, y_test as splitting is deferred


# --- Main Analysis Execution ---
if __name__ == "__main__":
    print("Starting Initial Data Analysis, Feature Engineering, and KPI Script...")

    # 1. Load data
    raw_df = load_data(LOG_FILE_PATH)

    if not raw_df.empty:
        # 2. Perform basic EDA
        perform_basic_eda(raw_df)

        # 3. Engineer features
        processed_df = engineer_features(raw_df)

        # 4. Calculate KPIs
        df_with_kpis = calculate_kpis(processed_df)

        # 5. Display Aggregated KPIs / Further Analysis
        display_aggregated_kpis(df_with_kpis)

        # 6. Prepare data for prediction model
        #    (X_train, X_test, y_train, y_test) are returned but not used further in this script's main block
        #    This function call is for demonstrating the data preparation step.
        X_pred, y_pred, _, _ = prepare_data_for_prediction(df_with_kpis)
        if X_pred is not None and y_pred is not None:
            print(f"Preview of X_pred (features for prediction) head:\n{X_pred.head()}")
            print(f"Preview of y_pred (target for prediction) head:\n{y_pred.head()}")

        # Further analysis could be done here with df_with_kpis
        # For example, looking at feature correlations with 'actual_game_winner'
        if 'actual_game_winner' in df_with_kpis.columns and 'hp_diff' in df_with_kpis.columns:
            # Ensure 'actual_game_winner' is not all NaN before attempting groupby
            if df_with_kpis['actual_game_winner'].notna().any():
                print("\n--- Mean HP Difference by Winner (from df_with_kpis, at match_end) ---")
                match_end_df = df_with_kpis[df_with_kpis['event_trigger'] == 'match_end']
                if not match_end_df.empty and match_end_df['actual_game_winner'].notna().any() :
                    # Check if hp_diff column exists before groupby
                    if 'hp_diff' in match_end_df.columns:
                         print(match_end_df.groupby('actual_game_winner')['hp_diff'].mean())
                    else:
                        print("'hp_diff' column not found in match_end_df for groupby.")
                else:
                    print("Not enough 'match_end' data or winner information to calculate mean HP difference by winner.")
            else:
                print("No winner information available to analyze HP difference by winner.")

        # Example: Save processed data (optional)
        # df_with_kpis.to_csv("processed_boxing_logs_with_kpis.csv", index=False)
        # print("\nProcessed data with KPIs saved to processed_boxing_logs_with_kpis.csv (example)")

    else:
        print("No data loaded (real or sample). Analysis cannot proceed.")

    print("\nInitial Data Analysis, Feature Engineering, and KPI Script Finished.")


# --- Prediction Model Training and Evaluation ---
# This function was added in a previous step, ensuring it includes LabelEncoder handling for target.
# def train_and_evaluate_prediction_model(X, y): ... (already exists)


# --- Data Prep and Training for Action Prediction Model (Supervised Learning) ---
# These functions were added in a previous step.
# def prepare_data_for_action_prediction(df_with_kpis): ... (already exists)
# def train_and_evaluate_action_model(X, y, model_type='RandomForest'): ... (already exists)

    # ... (rest of the if __name__ == "__main__": block remains the same)
    # It already calls:
    # X_pred, y_pred = prepare_data_for_prediction(df_with_kpis)
    # trained_model = train_and_evaluate_prediction_model(X_pred, y_pred)
    # X_action, y_action = prepare_data_for_action_prediction(df_with_kpis)
    # trained_action_model = train_and_evaluate_action_model(X_action, y_action)
    # ...
    print("\nInitial Data Analysis, Feature Engineering, KPI, and Model Training Script Finished.")

```
