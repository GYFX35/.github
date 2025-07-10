# Love Chat Game (Conceptual Project)

## Overview

Love Chat Game is a conceptual project for a dating and relationship-building game. Players interact with AI-powered Non-Player Characters (NPCs) through dialogue, build relationships, exchange gifts (potentially as NFTs), engage in shared activities (like virtual movie dates), and solve puzzles within a conceptual "Sandbox" virtual world.

This repository contains the initial scaffolding and conceptual logic for such a game, implemented in JavaScript (Node.js environment assumed for module system).

## Core Features (Conceptual)

*   **Player and NPC Profiles**: Customizable profiles with interests, personality traits, relationship statuses, and puzzle preferences.
*   **AI-Powered Dialogue**: NPCs generate responses using a (currently mock) AI system, influenced by their personality, relationship with the player, and contextual events like puzzles or dates.
*   **Relationship Building**: A dynamic system where player choices, actions, successful dates, and puzzle outcomes affect their relationship scores and milestones with NPCs.
*   **NFT Gifts & Achievements**: Conceptual integration of blockchain for unique in-game items.
*   **Interactive Puzzles**: A system for NPCs to offer text-based puzzles (riddles, logic) that players can solve for rewards.
*   **Sandbox Integration**: Placeholder functions to simulate interactions within a generic virtual world (e.g., animations, shared activities, puzzle UIs, notifications).

## Project Structure

```
LoveChatGame/
├── core_modules/
│   ├── ai/
│   │   └── DialogueSystem.js       # Mock AI dialogue generation
│   ├── blockchain/
│   │   └── InventoryAndNFTs.js     # Manages inventory, conceptual NFT handling
│   ├── sandbox/
│   │   └── SandboxIntegration.js   # Simulates interaction with a virtual world
│   ├── NPCProfile.js             # Manages NPC data
│   └── PlayerProfile.js          # Manages player data
├── game_logic/
│   ├── RelationshipLogic.js      # Handles relationship progression
│   └── PuzzleSystem.js           # Manages puzzle mechanics
├── npc_data/                     # Placeholder for external NPC definitions
├── player_data/                  # Placeholder for persistent player save data
├── docs/                         # Additional documentation
│   └── nft_acquisition_methods.md
├── main_game_loop.js             # Text-based simulation of the game
└── README.md                     # This file
```

## Modules Explained

### `core_modules/`

*   **`PlayerProfile.js`**:
    *   Manages player data: ID, name, interests, personality, inventory, relationship statuses with NPCs (including chat history), and a list of solved puzzles.
*   **`NPCProfile.js`**:
    *   Manages NPC data: ID, name, interests, `corePersonality` (numerical traits), `descriptivePersonalityTags` (e.g., "optimistic", "sarcastic", "bookworm"), dialogue style.
    *   Includes detailed `giftPreferences` and `puzzleInteractions` (e.g., puzzles an NPC offers, their skill/interest in puzzle types, reward multipliers).
*   **`ai/DialogueSystem.js`**:
    *   **Conceptual AI**: Simulates NPC responses.
    *   Handles gift reactions, movie date invitations/dialogue (including contextual comments during/after activities like movies).
    *   Now includes logic for NPCs to offer puzzles and react to player's puzzle-related inputs (requesting hints, submitting answers) and puzzle outcomes.
    *   **Future AI Integration**: A real implementation would involve API calls to a backend service hosting a sophisticated language model.
*   **`blockchain/InventoryAndNFTs.js`**:
    *   **Conceptual NFTs**: Manages player's inventory, flexible enough for various NFT types and metadata.
    *   Includes placeholder functions (`mintOrTransferNFT`, `verifyNFTOwnershipOnChain`) for simulated blockchain interactions.
    *   See `docs/nft_acquisition_methods.md` for conceptual ways players might acquire NFTs.
*   **`sandbox/SandboxIntegration.js`**:
    *   **Conceptual Sandbox**: Simulates game actions in a virtual world.
    *   Enhanced for "virtual_movie_date" logic.
    *   Now includes `displaySandboxPuzzleUI` and `triggerSandboxPuzzleOutcomeEffect` for puzzle interactions.
    *   **Future Sandbox Integration**: Would require SDKs of specific platforms (The Sandbox Game, Decentraland, etc.).

### `game_logic/`

*   **`RelationshipLogic.js`**:
    *   Calculates and updates relationship scores. Handles "received_gift", "completed_shared_activity" (including "virtual_movie_date" enjoyment factors).
    *   Now includes logic for `puzzle_solved_with_npc` and `puzzle_failed_with_npc` interaction types, adjusting scores based on puzzle outcomes and NPC traits (e.g., `likesSolvingPuzzles`, `patience`, `puzzleRewardMultiplier`).
    *   Defines relationship milestones.
*   **`PuzzleSystem.js`**:
    *   Manages puzzle definitions (ID, description, solution, rewards, hints, difficulty, NPC exclusivity).
    *   Loads sample puzzles (riddles, logic puzzles, lyric completion).
    *   Handles starting puzzles for players, tracking active puzzles, providing hints, and checking answers.
    *   Resolves puzzles by awarding items (via `InventoryAndNFTs`) and triggering relationship updates (via `RelationshipLogic`), applying penalties for hints/attempts.
    *   Conceptually interacts with `SandboxIntegration` to display puzzle UIs and outcome effects.

### `docs/`
*   **`nft_acquisition_methods.md`**: Details conceptual ways for players to obtain NFTs.

### `main_game_loop.js`

*   A script for text-based simulation, demonstrating module interactions, including dialogue, gift-giving, movie dates, and puzzle solving.

## Assumptions about "Sandbox" Environment

This project uses "Sandbox" as a generic term for a virtual world or metaverse platform. The `SandboxIntegration.js` module assumes such an environment would provide APIs/SDK functionalities for various in-world interactions.

## How to Run the Simulation

1.  **Prerequisites**: Node.js installed.
2.  **Navigate to Project Root**: `cd LoveChatGame/`
3.  **Run**: `node main_game_loop.js`
    The console will output simulated interactions. Modify `commandQueue` in `main_game_loop.js` to test scenarios.

## Future Development Ideas

*   GUI Implementation (web or game engine).
*   Real AI Integration (backend LLM).
*   Full Blockchain Implementation (smart contracts, wallets).
*   Specific Sandbox Platform Integration.
*   Persistent Data Storage.
*   Expanded Gameplay: More quests, date scenarios, puzzle types, character customization.

This conceptual project provides a foundational blueprint for a "Love Chat Game" incorporating modern technologies.
