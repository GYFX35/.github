// LoveChatGame/game_logic/PuzzleSystem.js

const PlayerProfile = require('../core_modules/PlayerProfile');
const NPCProfile = require('../core_modules/NPCProfile');
const RelationshipLogic = require('./RelationshipLogic');
const InventoryAndNFTs = require('../core_modules/blockchain/InventoryAndNFTs');
const SandboxIntegration = require('../core_modules/sandbox/SandboxIntegration');

let puzzles = {}; // In-memory store for all available puzzle definitions
let activePlayerPuzzles = {}; // puzzleId: { playerId, npcId (optional), startTime, attempts }

class PuzzleSystem {
    constructor() {
        console.log("PuzzleSystem initialized.");
        this.loadPuzzles([
            {
                id: "riddle_of_time",
                type: "riddle",
                title: "Riddle of Time",
                description: "I have cities, but no houses. I have mountains, but no trees. I have water, but no fish. What am I?",
                solution: "a map",
                difficulty: "easy",
                rewards: { relationshipPoints: 5, items: [{ itemId: "insight_token_common", quantity: 1, type: "collectible_common" }] },
                hints: ["Think about representations.", "What shows you places but isn't the place itself?"]
            },
            {
                id: "logic_bridge_crossing",
                type: "logic",
                title: "Bridge Crossing Puzzle",
                description: "Four people need to cross a bridge at night with one flashlight. Person A takes 1 min, B takes 2 mins, C takes 5 mins, D takes 8 mins. Max two people can cross at once, sharing the flashlight. Flashlight must be carried back and forth. What is the minimum time for all to cross?",
                // Solution is a sequence or just the final time. For simplicity, we'll check the time.
                // Sequence: A+B cross (2), A returns (1), C+D cross (8), B returns (2), A+B cross (2) = 15
                solution: "15", // Could also accept "15 minutes"
                difficulty: "medium",
                rewards: { relationshipPoints: 10, items: [{ itemId: "logic_crystal_rare_nft", quantity: 1, type: "collectible_rare_nft", metadata: {description: "A crystal awarded for keen logic.", token_id:"LC001"} }] },
                hints: ["The fastest people should do some of the returning.", "Think about who should cross together in the slowest trips."]
            },
            {
                id: "kai_song_lyric",
                type: "lyric_completion",
                title: "Kai's Missing Lyric",
                description: "Kai is stuck on a lyric for his new song: 'City lights gleam, a neon _____, chasing dreams where shadows play.' What word fits?",
                solution: "stream", // Or "dream", "gleam" - could allow multiple valid or score differently
                difficulty: "easy",
                npcExclusive: "npc_kai", // This puzzle might only be offered by Kai
                rewards: { relationshipPoints: 7, items: [{ itemId: "kai_song_demo_nft", quantity: 1, type: "MusicTrackNFT", metadata: { title: "Neon Stream - Demo", artist_name: "Kai", genre: "electronic", token_id: "MUSIC_KAI01" }}]},
                hints: ["It should rhyme with 'gleam'.", "Think of something flowing and bright."]
            }
        ]);
    }

    loadPuzzles(puzzleDataArray) {
        puzzles = {}; // Clear existing puzzles
        puzzleDataArray.forEach(puzzle => {
            puzzles[puzzle.id] = puzzle;
        });
        console.log(`${Object.keys(puzzles).length} puzzles loaded.`);
    }

    getPuzzle(puzzleId) {
        return puzzles[puzzleId];
    }

    startPuzzle(playerId, puzzleId, npcId = null) {
        const puzzle = this.getPuzzle(puzzleId);
        if (!puzzle) {
            console.error(`PuzzleSystem: Puzzle with ID ${puzzleId} not found.`);
            return null;
        }

        // Check if this puzzle is exclusive to an NPC and if that NPC is involved
        if (puzzle.npcExclusive && puzzle.npcExclusive !== npcId) {
            console.warn(`PuzzleSystem: Puzzle ${puzzleId} is exclusive to ${puzzle.npcExclusive}, cannot be started with ${npcId || 'no NPC'}.`);
            // return null; // Or let DialogueSystem handle NPC saying "I don't have that puzzle"
        }

        activePlayerPuzzles[playerId] = { // Only one active puzzle per player for simplicity
            puzzleId: puzzleId,
            npcId: npcId,
            startTime: Date.now(),
            attempts: 0,
            hintsUsed: 0
        };
        console.log(`PuzzleSystem: Player ${playerId} started puzzle '${puzzle.title}'` + (npcId ? ` with ${npcId}.` : '.'));
        SandboxIntegration.displaySandboxNotification(playerId, `New Puzzle: ${puzzle.title}! ${puzzle.description}`, "puzzle_start");
        return puzzle;
    }

    getActivePuzzleForPlayer(playerId) {
        return activePlayerPuzzles[playerId] ? this.getPuzzle(activePlayerPuzzles[playerId].puzzleId) : null;
    }

    getCurrentPuzzleStateForPlayer(playerId) {
        return activePlayerPuzzles[playerId];
    }

    getHint(playerId) {
        const activeState = activePlayerPuzzles[playerId];
        if (!activeState) return "You don't have an active puzzle.";

        const puzzle = this.getPuzzle(activeState.puzzleId);
        if (!puzzle || !puzzle.hints || puzzle.hints.length === 0) return "No hints available for this puzzle.";

        if (activeState.hintsUsed < puzzle.hints.length) {
            const hint = puzzle.hints[activeState.hintsUsed];
            activeState.hintsUsed++;
            console.log(`PuzzleSystem: Player ${playerId} used hint ${activeState.hintsUsed} for puzzle ${activeState.puzzleId}.`);
            // Penalize for using hints? Could reduce rewards.
            return hint;
        }
        return "No more hints available.";
    }

    submitPuzzleAnswer(playerId, answer) {
        const activeState = activePlayerPuzzles[playerId];
        if (!activeState) {
            console.error(`PuzzleSystem: Player ${playerId} has no active puzzle to submit an answer for.`);
            return { success: false, message: "You don't have an active puzzle." };
        }

        const puzzle = this.getPuzzle(activeState.puzzleId);
        if (!puzzle) {
            console.error(`PuzzleSystem: Active puzzle ${activeState.puzzleId} definition not found.`);
            return { success: false, message: "Error finding puzzle details." }; // Should not happen
        }

        activeState.attempts++;
        const isCorrect = answer.toLowerCase().trim() === puzzle.solution.toLowerCase().trim();

        if (isCorrect) {
            console.log(`PuzzleSystem: Player ${playerId} solved puzzle '${puzzle.title}' correctly in ${activeState.attempts} attempts!`);
            this.resolvePuzzle(playerId, activeState.npcId, activeState.puzzleId, true, activeState);
            delete activePlayerPuzzles[playerId]; // Clear active puzzle
            return { success: true, message: "Correct!", puzzleTitle: puzzle.title, rewards: puzzle.rewards };
        } else {
            console.log(`PuzzleSystem: Player ${playerId} submitted incorrect answer for '${puzzle.title}'. Attempt ${activeState.attempts}.`);
            // Potentially give feedback or check if max attempts reached
            if (activeState.attempts >= (puzzle.maxAttempts || 3) && (puzzle.maxAttempts || 3) > 0) {
                console.log(`PuzzleSystem: Player ${playerId} failed puzzle '${puzzle.title}' after max attempts.`);
                this.resolvePuzzle(playerId, activeState.npcId, activeState.puzzleId, false, activeState);
                delete activePlayerPuzzles[playerId]; // Clear active puzzle
                return { success: false, message: `Incorrect. You've reached the maximum attempts for this puzzle. The answer was: ${puzzle.solution}`, puzzleTitle: puzzle.title, maxAttemptsReached: true };
            }
            return { success: false, message: "Not quite. Try again!", puzzleTitle: puzzle.title };
        }
    }

    resolvePuzzle(playerId, npcId, puzzleId, success, puzzleState) {
        const puzzle = this.getPuzzle(puzzleId);
        if (!puzzle) return;

        const player = PlayerProfile.getPlayer(playerId);
        const npc = npcId ? NPCProfile.getNPC(npcId) : null;

        console.log(`PuzzleSystem: Resolving puzzle '${puzzle.title}' for player ${playerId}. Success: ${success}.`);
        SandboxIntegration.displaySandboxNotification(playerId, `Puzzle '${puzzle.title}' ${success ? 'Solved!' : 'Failed.'}`, success ? "puzzle_success" : "puzzle_fail");
        if (success) {
            SandboxIntegration.triggerSandboxPuzzleSolvedEffect(puzzleId); // Conceptual effect
            if (puzzle.rewards) {
                if (puzzle.rewards.relationshipPoints && npc) {
                    let points = puzzle.rewards.relationshipPoints;
                    if (puzzleState.hintsUsed > 0) points = Math.max(1, points - (puzzleState.hintsUsed * 2)); // Penalty for hints
                    if (puzzleState.attempts > 1) points = Math.max(1, points - (puzzleState.attempts -1)); // Penalty for multiple attempts

                    RelationshipLogic.updateRelationshipScore(playerId, npcId, "puzzle_solved_with_npc", { puzzleValue: points });
                }
                if (puzzle.rewards.items) {
                    puzzle.rewards.items.forEach(item => {
                        InventoryAndNFTs.addItem(playerId, item.itemId, item.quantity, item.type, item.metadata || {});
                    });
                }
                // Could unlock dialogue topics, etc.
                if (player) player.addSolvedPuzzle(puzzleId); // Conceptual: PlayerProfile.addSolvedPuzzle(puzzleId)
            }
        } else {
            // Handle failure - maybe a small relationship hit if it was a cooperative puzzle or an NPC expected help.
            if (npc) {
                RelationshipLogic.updateRelationshipScore(playerId, npcId, "puzzle_failed_with_npc", { puzzleValue: -2 });
            }
        }
    }
}
// Add addSolvedPuzzle to PlayerProfile conceptually
PlayerProfile.prototype.addSolvedPuzzle = function(puzzleId) {
    if (!this.solvedPuzzles) {
        this.solvedPuzzles = new Set();
    }
    this.solvedPuzzles.add(puzzleId);
    console.log(`${this.name} solved puzzle: ${puzzleId}`);
};
PlayerProfile.prototype.hasSolvedPuzzle = function(puzzleId) {
    return this.solvedPuzzles && this.solvedPuzzles.has(puzzleId);
};


module.exports = new PuzzleSystem(); // Singleton instance
