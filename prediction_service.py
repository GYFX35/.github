import pandas as pd
import numpy as np
import boxing_game_logic as bgl # To understand GameState object
# from sklearn.ensemble import RandomForestClassifier # Would be needed if re-instantiating model
# import joblib # For loading a saved model

# Placeholder for loading the trained model
# In a real application, this would load a model file created by initial_analysis.py
# Example: LOADED_MODEL = joblib.load("boxing_outcome_predictor.joblib")
LOADED_OUTCOME_MODEL = None
OUTCOME_FEATURE_COLUMNS_ORDER = []
ACTION_MODEL = None
ACTION_FEATURE_COLUMNS_ORDER = []
ACTION_MODEL_LE_CLASSES = [] # For decoding action model predictions

def set_outcome_model_details(model, feature_order, le_classes=None):
    """Sets the outcome prediction model, its feature order, and label encoder classes."""
    global LOADED_OUTCOME_MODEL, OUTCOME_FEATURE_COLUMNS_ORDER
    LOADED_OUTCOME_MODEL = model
    OUTCOME_FEATURE_COLUMNS_ORDER = feature_order
    if model and hasattr(model, '_le_classes_for_prediction_service'):
        # If model carries its own LE classes (as set in initial_analysis.py mock example)
         model._le_classes_for_prediction_service = le_classes if le_classes is not None else model._le_classes_for_prediction_service
    elif model and le_classes is not None:
        # Attach le_classes if provided separately
        model._le_classes_for_prediction_service = le_classes

    if LOADED_OUTCOME_MODEL:
        print("Prediction service: Outcome model details set.")
    if OUTCOME_FEATURE_COLUMNS_ORDER:
        print(f"Prediction service: Outcome feature order set: {OUTCOME_FEATURE_COLUMNS_ORDER}")

def set_action_model_details(model, feature_order, le_action_classes):
    """Sets the action prediction model, its feature order, and action label encoder classes."""
    global ACTION_MODEL, ACTION_FEATURE_COLUMNS_ORDER, ACTION_MODEL_LE_CLASSES
    ACTION_MODEL = model
    ACTION_FEATURE_COLUMNS_ORDER = feature_order
    ACTION_MODEL_LE_CLASSES = le_action_classes
    if ACTION_MODEL:
        print("Prediction service: Action model details set.")
    if ACTION_FEATURE_COLUMNS_ORDER:
        print(f"Prediction service: Action feature order set: {ACTION_FEATURE_COLUMNS_ORDER}")
    if ACTION_MODEL_LE_CLASSES is not None:
        print(f"Prediction service: Action model LabelEncoder classes set: {ACTION_MODEL_LE_CLASSES}")


def preprocess_gamestate_for_outcome_prediction(game_state: bgl.GameState) -> pd.DataFrame:
    """
    Transforms a single GameState object into a one-row DataFrame suitable for prediction,
    matching the feature engineering in initial_analysis.py.
    """
    if not game_state:
        return None

    # Extract features similar to engineer_features and prepare_data_for_prediction
    # This needs to create ALL features that the model was trained on, in the correct order.

    # Flatten player and opponent stats first
    ps = game_state.player.stats
    os = game_state.opponent.stats

    data = {
        'current_round': game_state.current_round,
        'round_timer': game_state.round_timer,
        'player_hp': game_state.player.hp,
        'player_stamina': game_state.player.stamina,
        'opponent_hp': game_state.opponent.hp,
        'opponent_stamina': game_state.opponent.stamina,
        'hp_diff': game_state.player.hp - game_state.opponent.hp,
        'stamina_diff': game_state.player.stamina - game_state.opponent.stamina,

        'ps_punches_thrown': ps.get("punches_thrown", 0),
        'ps_punches_landed': ps.get("punches_landed", 0),
        'ps_damage_dealt': ps.get("damage_dealt", 0),
        'ps_knockdowns_scored': ps.get("knockdowns_scored", 0),

        'os_punches_thrown': os.get("punches_thrown", 0),
        'os_punches_landed': os.get("punches_landed", 0),
        'os_damage_dealt': os.get("damage_dealt", 0),
        'os_knockdowns_scored': os.get("knockdowns_scored", 0),
    }

    # Accuracies & Ratios
    data['player_accuracy_overall'] = (data['ps_punches_landed'] / data['ps_punches_thrown']) if data['ps_punches_thrown'] > 0 else 0
    data['opponent_accuracy_overall'] = (data['os_punches_landed'] / data['os_punches_thrown']) if data['os_punches_thrown'] > 0 else 0

    for punch_type_enum in [bgl.ActionType.JAB, bgl.ActionType.CROSS, bgl.ActionType.HOOK, bgl.ActionType.UPPERCUT]:
        pt_str = punch_type_enum.value # JAB, CROSS etc.

        # Player punch type stats
        ps_pt_stats = ps.get(punch_type_enum, {"thrown": 0, "landed": 0}) # Use enum as key for original stats dict
        data[f'ps_{pt_str}_thrown'] = ps_pt_stats.get("thrown", 0)
        data[f'ps_{pt_str}_landed'] = ps_pt_stats.get("landed", 0)
        data[f'player_{pt_str.lower()}_accuracy'] = (data[f'ps_{pt_str}_landed'] / data[f'ps_{pt_str}_thrown']) if data[f'ps_{pt_str}_thrown'] > 0 else 0

        # Opponent punch type stats
        os_pt_stats = os.get(punch_type_enum, {"thrown": 0, "landed": 0})
        data[f'os_{pt_str}_thrown'] = os_pt_stats.get("thrown", 0)
        data[f'os_{pt_str}_landed'] = os_pt_stats.get("landed", 0)
        data[f'opponent_{pt_str.lower()}_accuracy'] = (data[f'os_{pt_str}_landed'] / data[f'os_{pt_str}_thrown']) if data[f'os_{pt_str}_thrown'] > 0 else 0

    data['player_dmg_per_landed_punch'] = (data['ps_damage_dealt'] / data['ps_punches_landed']) if data['ps_punches_landed'] > 0 else 0
    data['opponent_dmg_per_landed_punch'] = (data['os_damage_dealt'] / data['os_punches_landed']) if data['os_punches_landed'] > 0 else 0

    data['player_kd_per_100_dmg'] = (data['ps_knockdowns_scored'] * 100 / data['ps_damage_dealt']) if data['ps_damage_dealt'] > 0 else 0
    data['opponent_kd_per_100_dmg'] = (data['os_knockdowns_scored'] * 100 / data['os_damage_dealt']) if data['os_damage_dealt'] > 0 else 0

    # Max rounds could come from game_state.max_rounds or a constant
    max_r = game_state.max_rounds if hasattr(game_state, 'max_rounds') else 3 # Fallback to constant
    data['is_late_round'] = 1 if game_state.current_round >= (max_r // 2 + 1) else 0

    # Create a DataFrame with a single row
    # Ensure the order of columns matches OUTCOME_FEATURE_COLUMNS_ORDER used in training
    # If OUTCOME_FEATURE_COLUMNS_ORDER is not set, this will be an issue.
    # The `initial_analysis.py` script should define this order.

    # Create a series first, then reindex if OUTCOME_FEATURE_COLUMNS_ORDER is available
    # This ensures all expected columns are present, filled with 0 if not in current data.
    # This is critical because the model expects a fixed number of features in a fixed order.

    # The list of all possible features that the outcome model MIGHT have been trained on:
    # This should be IDENTICAL to feature_columns in prepare_data_for_prediction (in initial_analysis.py)
    all_outcome_features = [ # Renamed to be specific
        'current_round', 'round_timer',
        'player_hp', 'player_stamina',
        'opponent_hp', 'opponent_stamina',
        'hp_diff', 'stamina_diff',
        'ps_punches_thrown', 'ps_punches_landed', 'ps_damage_dealt', 'ps_knockdowns_scored',
        'player_accuracy_overall', 'player_jab_accuracy', 'player_cross_accuracy',
        'player_hook_accuracy', 'player_uppercut_accuracy',
        'player_dmg_per_landed_punch', 'player_kd_per_100_dmg',
        'os_punches_thrown', 'os_punches_landed', 'os_damage_dealt', 'os_knockdowns_scored',
        'opponent_accuracy_overall', 'opponent_jab_accuracy', 'opponent_cross_accuracy',
        'opponent_hook_accuracy', 'opponent_uppercut_accuracy',
        'opponent_dmg_per_landed_punch', 'opponent_kd_per_100_dmg',
        'is_late_round',
        # Individual punch stats that might have been flattened and used (ensure these are covered)
        'ps_JAB_thrown', 'ps_JAB_landed', 'ps_CROSS_thrown', 'ps_CROSS_landed',
        'ps_HOOK_thrown', 'ps_HOOK_landed', 'ps_UPPERCUT_thrown', 'ps_UPPERCUT_landed',
        'os_JAB_thrown', 'os_JAB_landed', 'os_CROSS_thrown', 'os_CROSS_landed',
        'os_HOOK_thrown', 'os_HOOK_landed', 'os_UPPERCUT_thrown', 'os_UPPERCUT_landed'
    ]

    # Filter `data` to only include keys that are in `all_outcome_features`
    # and ensure all `all_outcome_features` are present, defaulting to 0 or NaN
    # Create a Series with all possible features, then update with values from `data`
    feature_series = pd.Series(index=all_outcome_features, dtype=np.float64)
    for key, value in data.items():
        if key in feature_series.index:
            feature_series[key] = value

    # Fill any remaining NaNs (for features not present in current 'data' dict) with 0
    feature_series = feature_series.fillna(0)

    # Convert to DataFrame
    features_df = feature_series.to_frame().T

    # Reorder if OUTCOME_FEATURE_COLUMNS_ORDER is available and matches
    if OUTCOME_FEATURE_COLUMNS_ORDER:
        # Check if all columns in OUTCOME_FEATURE_COLUMNS_ORDER are present in features_df
        missing_cols = [col for col in OUTCOME_FEATURE_COLUMNS_ORDER if col not in features_df.columns]
        if missing_cols:
            print(f"Warning: Preprocessing for outcome is missing columns required by the model: {missing_cols}. Filling with 0.")
            for col in missing_cols:
                features_df[col] = 0 # Add missing columns with 0

        # Ensure no extra columns are passed to the model
        features_df = features_df[OUTCOME_FEATURE_COLUMNS_ORDER]

    return features_df


def preprocess_gamestate_for_action_prediction(game_state: bgl.GameState) -> pd.DataFrame:
    """
    Transforms a single GameState object into a one-row DataFrame suitable for action prediction,
    matching the feature engineering in initial_analysis.py's prepare_data_for_action_prediction.
    This prepares features for the *opponent* to decide an action.
    """
    if not game_state:
        return None

    data = {
        # Opponent is 'self', Player is 'other_player'
        'self_hp': game_state.opponent.hp,
        'self_stamina': game_state.opponent.stamina,
        'other_player_hp': game_state.player.hp,
        'other_player_stamina': game_state.player.stamina,
        'hp_diff_self_vs_other': game_state.opponent.hp - game_state.player.hp,
        'stamina_diff_self_vs_other': game_state.opponent.stamina - game_state.player.stamina,
        'current_round': game_state.current_round,
        'round_timer': game_state.round_timer,
    }

    # One-hot encode 'other_player_current_action'
    action_types_for_encoding = ['IDLE', 'JAB', 'CROSS', 'HOOK', 'UPPERCUT', 'BLOCK', 'DODGE',
                                 'ADVANCE', 'RETREAT', 'SIDESTEP_LEFT', 'SIDESTEP_RIGHT']
    for act_type_str in action_types_for_encoding:
        data[f'other_player_action_{act_type_str}'] = 1 if game_state.player.current_action.value == act_type_str else 0

    # Potentially add can_perform_action flags for opponent (self)
    # for act_type_enum in bgl.ActionType:
    #     if act_type_enum not in [bgl.ActionType.ADVANCE, bgl.ActionType.RETREAT, bgl.ActionType.SIDESTEP_LEFT, bgl.ActionType.SIDESTEP_RIGHT]: # Assuming these don't have specific stamina costs in ACTION_DETAILS
    #         data[f'self_can_{act_type_enum.value.lower()}'] = 1 if game_state.opponent.can_perform_action(act_type_enum) else 0

    # This list should match features used in prepare_data_for_action_prediction
    all_action_features = [
        'self_hp', 'self_stamina', 'other_player_hp', 'other_player_stamina',
        'hp_diff_self_vs_other', 'stamina_diff_self_vs_other',
        'current_round', 'round_timer',
    ] + [f'other_player_action_{act_type_str}' for act_type_str in action_types_for_encoding]
    # Add 'self_can_action' features if implemented above...

    feature_series = pd.Series(index=all_action_features, dtype=np.float64)
    for key, value in data.items():
        if key in feature_series.index:
            feature_series[key] = value
    feature_series = feature_series.fillna(0)
    features_df = feature_series.to_frame().T

    if ACTION_FEATURE_COLUMNS_ORDER:
        missing_cols = [col for col in ACTION_FEATURE_COLUMNS_ORDER if col not in features_df.columns]
        if missing_cols:
            print(f"Warning: Preprocessing for action is missing columns: {missing_cols}. Filling with 0.")
            for col in missing_cols:
                features_df[col] = 0
        features_df = features_df[ACTION_FEATURE_COLUMNS_ORDER]

    return features_df


def predict_outcome(game_state: bgl.GameState):
    """
    Predicts the outcome of a boxing match given the current game state.
    """
    global LOADED_OUTCOME_MODEL
    if LOADED_OUTCOME_MODEL is None:
        print("Warning: Outcome prediction model not loaded. Returning dummy prediction.")
        if game_state.player.hp > game_state.opponent.hp + 20: return "Player"
        if game_state.opponent.hp > game_state.player.hp + 20: return "Opponent" # Corrected logic
        return "Draw"

    features_df = preprocess_gamestate_for_outcome_prediction(game_state)
    if features_df is None or features_df.empty:
        print("Error: Could not preprocess game state for outcome prediction.")
        return "Error in preprocessing"

    try:
        if OUTCOME_FEATURE_COLUMNS_ORDER:
             processed_features_ordered = features_df[OUTCOME_FEATURE_COLUMNS_ORDER]
        else:
            print("Warning: OUTCOME_FEATURE_COLUMNS_ORDER not set. Using columns as is from preprocessing.")
            processed_features_ordered = features_df

        prediction_encoded = LOADED_OUTCOME_MODEL.predict(processed_features_ordered)

        le_classes_ = getattr(LOADED_OUTCOME_MODEL, '_le_classes_for_prediction_service', ['Draw', 'Opponent', 'Player'])
        predicted_class_name = le_classes_[prediction_encoded[0]]
        return predicted_class_name
    except Exception as e:
        print(f"Error during outcome prediction: {e}")
        return f"Error during outcome prediction: {str(e)}"

def predict_opponent_action(game_state: bgl.GameState) -> bgl.ActionType:
    """
    Predicts the opponent's next action given the current game state.
    """
    global ACTION_MODEL, ACTION_MODEL_LE_CLASSES
    if ACTION_MODEL is None:
        print("Warning: Action prediction model not loaded. Returning dummy action (IDLE).")
        return bgl.ActionType.IDLE # Fallback to a safe action

    features_df = preprocess_gamestate_for_action_prediction(game_state)
    if features_df is None or features_df.empty:
        print("Error: Could not preprocess game state for action prediction. Returning IDLE.")
        return bgl.ActionType.IDLE

    try:
        if ACTION_FEATURE_COLUMNS_ORDER:
            processed_features_ordered = features_df[ACTION_FEATURE_COLUMNS_ORDER]
        else:
            print("Warning: ACTION_FEATURE_COLUMNS_ORDER not set for action model. Using columns as is.")
            processed_features_ordered = features_df

        prediction_encoded = ACTION_MODEL.predict(processed_features_ordered)

        if not ACTION_MODEL_LE_CLASSES:
            print("Warning: LabelEncoder classes for action model not set. Cannot decode action. Returning IDLE.")
            return bgl.ActionType.IDLE

        predicted_action_str = ACTION_MODEL_LE_CLASSES[prediction_encoded[0]]

        # Convert string back to ActionType enum
        try:
            predicted_action_enum = bgl.ActionType[predicted_action_str]
            return predicted_action_enum
        except KeyError:
            print(f"Warning: Predicted action string '{predicted_action_str}' not found in bgl.ActionType. Returning IDLE.")
            return bgl.ActionType.IDLE

    except Exception as e:
        print(f"Error during action prediction: {e}. Returning IDLE.")
        return bgl.ActionType.IDLE


if __name__ == '__main__':
    # This is for standalone testing of the service, if needed.
    # It would require a sample GameState object and a mock model.
    print("Prediction Service module loaded.")

    # Example of how set_model_details would be used by the analysis script in a real scenario
    class MockOutcomeModel:
        def predict(self, X):
            print(f"MockOutcomeModel predicting on data with shape: {X.shape}")
            # Simulate prediction based on hp_diff for testing
            if 'hp_diff' not in X.columns: # Defensive check
                print("MockOutcomeModel: hp_diff not in columns! Defaulting prediction.")
                return np.array([0])
            if X['hp_diff'].iloc[0] > 10: return np.array([2]) # Player
            elif X['hp_diff'].iloc[0] < -10: return np.array([1]) # Opponent
            return np.array([0]) # Draw

    mock_outcome_le_classes = ['Draw', 'Opponent', 'Player']
    MockOutcomeModel._le_classes_for_prediction_service = mock_outcome_le_classes


    # Define the feature order the MockOutcomeModel expects (must match training)
    # This list needs to be identical to the one used for training the actual model
    # and the one in preprocess_gamestate_for_outcome_prediction's `all_outcome_features`
    # for consistent reindexing.
    mock_outcome_feature_order = [ # Renamed for clarity
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
    # Remove duplicates just in case, though the list should be defined without them
    mock_outcome_feature_order = sorted(list(set(mock_outcome_feature_order)))
    set_outcome_model_details(MockOutcomeModel(), mock_outcome_feature_order, mock_outcome_le_classes)

    # --- Test Action Prediction Mock ---
    class MockActionModel:
        def predict(self, X):
            print(f"MockActionModel predicting on data with shape: {X.shape}")
            # Simple logic: if opponent (self) has low stamina, predict IDLE, else JAB
            if 'self_stamina' in X.columns and X['self_stamina'].iloc[0] < 20:
                return np.array([ACTION_MODEL_LE_CLASSES.index(bgl.ActionType.IDLE.value) if bgl.ActionType.IDLE.value in ACTION_MODEL_LE_CLASSES else 0])
            return np.array([ACTION_MODEL_LE_CLASSES.index(bgl.ActionType.JAB.value) if bgl.ActionType.JAB.value in ACTION_MODEL_LE_CLASSES else 0])

    mock_action_le_classes = [act.value for act in bgl.ActionType] # All action types as strings
    mock_action_feature_order = [ # From prepare_data_for_action_prediction
        'self_hp', 'self_stamina', 'other_player_hp', 'other_player_stamina',
        'hp_diff_self_vs_other', 'stamina_diff_self_vs_other',
        'current_round', 'round_timer',
    ] + [f'other_player_action_{act_type_str}' for act_type_str in ['IDLE', 'JAB', 'CROSS', 'HOOK', 'UPPERCUT', 'BLOCK', 'DODGE', 'ADVANCE', 'RETREAT', 'SIDESTEP_LEFT', 'SIDESTEP_RIGHT']]
    mock_action_feature_order = sorted(list(set(mock_action_feature_order)))


    set_action_model_details(MockActionModel(), mock_action_feature_order, mock_action_le_classes)


    # Create a sample GameState
    sample_gs = bgl.initialize_new_game()
    sample_gs.current_round = 2
    sample_gs.player.hp = 70
    sample_gs.opponent.hp = 50 # For outcome prediction
    sample_gs.player.stamina = 60
    sample_gs.opponent.stamina = 15 # For action prediction (low stamina test)
    sample_gs.player.stats["punches_thrown"] = 20
    sample_gs.player.stats["punches_landed"] = 10
    sample_gs.player.stats["damage_dealt"] = 50
    sample_gs.player.stats[bgl.ActionType.JAB]["thrown"] = 10
    sample_gs.player.stats[bgl.ActionType.JAB]["landed"] = 5
    sample_gs.player.current_action = bgl.ActionType.JAB # Player is jabbing

    print(f"\n--- Testing Outcome Prediction with Sample GameState: ---")
    features_outcome = preprocess_gamestate_for_outcome_prediction(sample_gs)
    if features_outcome is not None:
        print("Preprocessed features for outcome prediction (first row):")
        print(features_outcome.head().to_string())
        outcome_prediction = predict_outcome(sample_gs)
        print(f"Predicted outcome: {outcome_prediction}")
    else:
        print("Failed to preprocess sample GameState for outcome prediction.")

    print(f"\n--- Testing Action Prediction with Sample GameState: ---")
    features_action = preprocess_gamestate_for_action_prediction(sample_gs)
    if features_action is not None:
        print("Preprocessed features for action prediction (first row):")
        print(features_action.head().to_string())
        action_prediction = predict_opponent_action(sample_gs)
        print(f"Predicted opponent action: {action_prediction.value if isinstance(action_prediction, bgl.ActionType) else action_prediction}")
    else:
        print("Failed to preprocess sample GameState for action prediction.")

```
