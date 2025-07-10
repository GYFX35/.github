// LoveChatGame/main_game_loop.js
// Basic Text-Based Simulation of the Love Chat Game

const PlayerProfile = require('./core_modules/PlayerProfile');
const NPCProfile = require('./core_modules/NPCProfile');
const DialogueSystem = require('./core_modules/ai/DialogueSystem');
const RelationshipLogic = require('./game_logic/RelationshipLogic');
const InventoryAndNFTs = require('./core_modules/blockchain/InventoryAndNFTs');
const SandboxIntegration = require('./core_modules/sandbox/SandboxIntegration');

// --- Game Setup ---
let currentPlayerId = null;
// const npcsInScene = ["npc_elara", "npc_kai", "npc_rian"]; // NPCs available to interact with (now derived from NPCProfile.npcs)

function initializeGame() {
    console.log("Initializing Love Chat Game...");

    // Create Player
    PlayerProfile.initializePlayer("player1", "Alex", ["gaming", "art", "music"], { "kindness": 8, "humor": 7 });
    currentPlayerId = "player1";

    // Create NPCs
    NPCProfile.initializeNPC(
        "npc_elara", "Elara",
        ["astronomy", "poetry", "art"], // Interests
        { "intellect": 8, "patience": 9 }, // Core Personality Traits
        ["dreamy", "introverted", "bookworm", "optimistic"], // Descriptive Personality Tags
        "thoughtful", // Dialogue Style
        {
            likesInterestsInCommon: 3,
            giftPreferences: {
                specificItems: { "star_chart_nft": 20, "poem_book_common": 5 },
                likedTypes: ["ArtPieceNFT", "PersonalizedCreationNFT", "MusicTrackNFT"],
                likedGenres: ["classical", "lofi"],
                likedStyles: ["celestial", "impressionistic"],
                cherishedRarity: "unique_personal_creation"
            }
        }
    );
    NPCProfile.initializeNPC(
        "npc_kai", "Kai",
        ["music", "skateboarding", "gaming"], // Interests
        { "creativity": 9, "wit": 6 }, // Core Personality Traits
        ["extroverted", "energetic", "sarcastic", "laid_back", "adventurous"], // Descriptive Personality Tags
        "friendly", // Dialogue Style
        {
            likesInterestsInCommon: 2,
            giftPreferences: {
                specificItems: { "concert_ticket_nft": 20, "new_deck_rare": 12 },
                likedTypes: ["MusicTrackNFT", "WearableAccessoryNFT", "ExclusiveExperienceTicketNFT"],
                likedGenres: ["rock", "electronic", "energetic"], // Kai likes energetic music
                likedStyles: ["cool", "band_logo"], // For wearables
                dislikedTypes: ["PersonalizedCreationNFT"], // Might find them cheesy initially
                cherishedRarity: "epic"
            }
        }
    );
    NPCProfile.initializeNPC(
        "npc_rian", "Rian",
        ["philosophy", "history", "chess"], // Interests
        { "analytical": 9, "patience": 7, "gratefulness": 3 }, // Core
        ["jaded", "pessimistic", "analytical", "introverted", "bookworm"], // Descriptive
        "formal", // Dialogue Style
        {
            likesInterestsInCommon: 1,
            prefersCompliments: false,
            giftPreferences: {
                specificItems: { "old_tome_nft": 25, "chess_set_rare": 10 },
                likedTypes: ["PersonalizedCreationNFT"],
                dislikedTypes: ["MusicTrackNFT", "WearableAccessoryNFT"],
                cherishedRarity: "legendary"
            },
            puzzleInteractions: {
                offersPuzzles: ["riddle_of_time", "logic_bridge_crossing"],
                likesSolvingPuzzles: true, // He might appreciate logical challenges
                goodAtPuzzleTypes: ["logic", "riddle"],
                puzzleRewardMultiplier: 1.2
            }
        }
    );
    // Give player some initial items (conceptual)
    InventoryAndNFTs.addItem(currentPlayerId, "poem_book_common", 1, "collectible_common", { description: "A book of classic poems." });
    InventoryAndNFTs.addItem(currentPlayerId, "star_chart_nft", 1, "collectible_rare_nft", {
        description: "A beautiful animated star chart NFT.",
        token_id: "SC789",
        rarity: "rare",
        style: "celestial" // For ArtPieceNFT style preference
    });
    InventoryAndNFTs.addItem(currentPlayerId, "lofi_music_track_common", 1, "MusicTrackNFT", {
        title: "Chill Evening Vibes",
        artist_name: "DJ Relaxo",
        genre: "lofi",
        duration: 180,
        token_id: "MUSIC001",
        rarity: "common"
    });
    InventoryAndNFTs.addItem(currentPlayerId, "vintage_sunglasses_nft", 1, "WearableAccessoryNFT", {
        description: "Stylish vintage sunglasses.",
        token_id: "WEAR001",
        slot: "eyes",
        style_tag: "vintage",
        rarity: "rare"
    });
     InventoryAndNFTs.addItem(currentPlayerId, "rock_anthem_track_rare", 1, "MusicTrackNFT", {
        title: "Stadium Shaker",
        artist_name: "The Power Chords",
        genre: "rock",
        duration: 240,
        token_id: "MUSIC002",
        rarity: "rare"
    });


    console.log("\nGame Initialized! Player Alex, Elara, Kai, and Rian are ready.");
    console.log("----------------------------------------------------");
}

// --- Mock Input Function (for text-based simulation) ---
// In a real game, this would come from a UI.
// For this simulation, we'll use a simple array of commands.
let commandQueue = [];
let currentNpcInteractionTarget = null;

function mockGetPlayerInput() {
    if (commandQueue.length > 0) {
        const command = commandQueue.shift();
        console.log(`\n> ALEX (Input): ${command}`);
        return command;
    }
    // If no commands, simulate some idle time or end interaction
    if (currentNpcInteractionTarget) {
        console.log(`(No more commands for ${currentNpcInteractionTarget.name}. Type 'exit' to choose another NPC or 'quit' to end game.)`);
    } else {
         console.log(`(No commands. Type 'talk <npc_name>', 'inventory', 'profile', or 'quit'.)`);
    }
    return null; // Or prompt user in a real console app
}

// --- Main Game Loop (Conceptual) ---
async function gameLoop() {
    let playing = true;

    while (playing) {
        if (!currentNpcInteractionTarget) {
            // Player is not currently talking to an NPC
            const baseCommand = mockGetPlayerInput();
            if (!baseCommand) { // Allow for empty input to re-prompt or if queue is empty
                await new Promise(resolve => setTimeout(resolve, 1000)); // Wait a bit
                continue;
            }

            if (baseCommand.startsWith("talk ")) {
                const targetName = baseCommand.split(" ")[1];
                const targetNpc = Object.values(NPCProfile.npcs).find(npc => npc.name.toLowerCase() === targetName.toLowerCase());
                if (targetNpc) {
                    currentNpcInteractionTarget = targetNpc;
                    console.log(`\n--- Interacting with ${currentNpcInteractionTarget.name} ---`);
                    await SandboxIntegration.triggerSandboxAnimation(currentPlayerId, "approach");
                    await SandboxIntegration.triggerSandboxAnimation(currentNpcInteractionTarget.npcId, "turn_to_player");
                    console.log(`${currentNpcInteractionTarget.name}: Oh, hi ${PlayerProfile.getPlayer(currentPlayerId).name}! What's up?`);
                } else {
                    console.log(`NPC "${targetName}" not found.`);
                }
            } else if (baseCommand === "inventory") {
                const inventory = InventoryAndNFTs.getPlayerInventory(currentPlayerId);
                console.log("ALEX's Inventory:", inventory);
            } else if (baseCommand === "profile") {
                console.log("ALEX's Profile:", PlayerProfile.getPlayer(currentPlayerId).viewProfile());
            }
             else if (baseCommand === "quit") {
                playing = false;
                console.log("Quitting game...");
            } else if (baseCommand) {
                console.log("Unknown command. Try: 'talk <npc_name>', 'inventory', 'profile', 'quit'.");
            }

        } else {
            // Player is interacting with currentNpcInteractionTarget
            const playerInput = mockGetPlayerInput();

            if (playerInput) {
                if (playerInput.toLowerCase() === "exit") {
                    console.log(`\n--- Ending interaction with ${currentNpcInteractionTarget.name} ---`);
                    await SandboxIntegration.triggerSandboxAnimation(currentPlayerId, "wave_goodbye");
                    await SandboxIntegration.triggerSandboxAnimation(currentNpcInteractionTarget.npcId, "wave_goodbye");
                    currentNpcInteractionTarget = null;
                    continue;
                }

                // 1. Get NPC Dialogue Response (unless it's a gift command, which is handled differently)
                let npcResponse = "";
                if (!playerInput.toLowerCase().startsWith("give ")) {
                    npcResponse = await DialogueSystem.getNPCResponse(currentPlayerId, currentNpcInteractionTarget.npcId, playerInput);
                    console.log(`${currentNpcInteractionTarget.name}: ${npcResponse}`);
                    await SandboxIntegration.displaySandboxNotification(currentPlayerId, `${currentNpcInteractionTarget.name} says: "${npcResponse.substring(0, 50)}..."`, "dialogue");
                }

                // 2. Update Relationship based on general dialogue (simplified for this demo)
                if (!playerInput.toLowerCase().startsWith("give ")) { // Don't double-dip relationship score if it's a gift
                    if (playerInput.toLowerCase().includes("love") || playerInput.toLowerCase().includes("like you")) {
                        RelationshipLogic.updateRelationshipScore(currentPlayerId, currentNpcInteractionTarget.npcId, "positive_dialogue", { intensity: 2 });
                    } else if (currentNpcInteractionTarget.interests.some(interest => playerInput.includes(interest))) {
                        RelationshipLogic.updateRelationshipScore(currentPlayerId, currentNpcInteractionTarget.npcId, "shared_interest_discussed", { interestsInCommon: 1 });
                    } else if (playerInput.length > 3) { // Basic check for some interaction
                        RelationshipLogic.updateRelationshipScore(currentPlayerId, currentNpcInteractionTarget.npcId, "positive_dialogue");
                    }
                }

                // 3. Conceptual Gift Giving
                if (playerInput.toLowerCase().startsWith("give ")) {
                    const itemName = playerInput.substring(5).trim(); // Get item name after "give "
                    const playerProfile = PlayerProfile.getPlayer(currentPlayerId);
                    const itemToGive = playerProfile.inventory[itemName];

                    if (itemToGive && itemToGive.quantity > 0) {
                        console.log(`ALEX: I'd like to give you this ${itemName}.`);
                        await SandboxIntegration.triggerSandboxAnimation(currentPlayerId, "offer_gift");
                        await SandboxIntegration.spawnObjectInWorld(itemName, {x:0,y:0,z:0} /* target NPC pos */, currentNpcInteractionTarget.npcId);

                        // Update relationship score based on the gift
                        const relationshipUpdateResult = RelationshipLogic.updateRelationshipScore(currentPlayerId, currentNpcInteractionTarget.npcId, "received_gift", { itemId: itemName });

                        // Get specific gift reaction dialogue
                        const giftPreferenceScore = currentNpcInteractionTarget.getGiftPreferenceValue(itemToGive); // Get the score NPC assigned
                        const giftReactionResponse = await DialogueSystem.getGiftReactionResponse(currentPlayerId, currentNpcInteractionTarget.npcId, itemToGive, giftPreferenceScore);
                        console.log(`${currentNpcInteractionTarget.name}: ${giftReactionResponse}`);
                        await SandboxIntegration.displaySandboxNotification(currentPlayerId, `${currentNpcInteractionTarget.name} reacts: "${giftReactionResponse.substring(0,50)}..."`, "gift_reaction");


                        if (giftPreferenceScore > 5) { // Liked or loved
                             await SandboxIntegration.triggerSandboxAnimation(currentNpcInteractionTarget.npcId, "accept_gift_happy");
                        } else if (giftPreferenceScore >= 0) { // Neutral
                            await SandboxIntegration.triggerSandboxAnimation(currentNpcInteractionTarget.npcId, "accept_gift_neutral");
                        } else { // Disliked
                            await SandboxIntegration.triggerSandboxAnimation(currentNpcInteractionTarget.npcId, "accept_gift_sad"); // or confused
                        }

                        InventoryAndNFTs.removeItem(currentPlayerId, itemName); // Remove item AFTER all logic using it

                        if (itemToGive.type.toLowerCase().includes("nft")) {
                            await InventoryAndNFTs.mintOrTransferNFT(currentNpcInteractionTarget.npcId, itemName, itemToGive.metadata.token_id || `mock_token_given_${Date.now()}`);
                            await SandboxIntegration.displaySandboxNotification(currentNpcInteractionTarget.npcId, `You received ${itemName} (NFT) from Alex!`, "achievement");
                        }
                    } else {
                        console.log(`ALEX: (I don't have a ${itemName} to give, or that item doesn't exist.)`);
                        const noItemResponse = await DialogueSystem.getNPCResponse(currentPlayerId, currentNpcInteractionTarget.npcId, "i dont have that item");
                        console.log(`${currentNpcInteractionTarget.name}: ${noItemResponse}`);
                    }
                }

                // 4. Conceptual Shared Activity
                if (playerInput.toLowerCase().includes("go for a walk") || playerInput.toLowerCase().includes("hang out")) {
                    console.log(`ALEX: Hey ${currentNpcInteractionTarget.name}, want to go for a walk in the Sandbox Park?`);
                    // NPC decides based on relationship, personality (mocked)
                    const playerProfile = PlayerProfile.getPlayer(currentPlayerId);
                        const relationshipWithTarget = playerProfile.getRelationshipWith(currentNpcInteractionTarget.npcId); // Renamed for clarity

                        // Let DialogueSystem handle initial NPC response to "wanna hang out"
                        // The actual initiation of activity will depend on this response or further player confirmation.
                        if (npcResponse.toLowerCase().includes("sure") || npcResponse.toLowerCase().includes("sounds fun") || npcResponse.toLowerCase().includes("i'd like that")) {
                            console.log(`ALEX: Great! Let's do that.`);
                            const activityResult = await SandboxIntegration.initiateSandboxActivity(currentPlayerId, currentNpcInteractionTarget.npcId, "walk_in_park");
                            if (activityResult.success) {
                                RelationshipLogic.updateRelationshipScore(currentPlayerId, currentNpcInteractionTarget.npcId, "completed_shared_activity", {
                                    activityValue: 5,
                                    activityEnjoyedByNPC: true,
                                    activityType: "walk_in_park"
                                });
                                console.log(`(You and ${currentNpcInteractionTarget.name} enjoy a pleasant walk in the virtual park.)`);
                                const postActivityDialogue = await DialogueSystem.getActivityContextualDialogue(currentNpcInteractionTarget.npcId, "walk_in_park", "after_activity_generic_positive");
                                if(postActivityDialogue) console.log(`${currentNpcInteractionTarget.name}: ${postActivityDialogue}`);
                                currentNpcInteractionTarget = null;
                            } else {
                                console.log(`${currentNpcInteractionTarget.name}: (Activity initiation failed: ${activityResult.message})`);
                            }
                    } else {
                            console.log(`ALEX: (Okay, maybe another time for a walk.)`);
                        }
                    } else if (playerInput.toLowerCase().includes("movie date") || playerInput.toLowerCase().includes("watch a movie") || playerInput.toLowerCase().startsWith("see a film")) {
                        if (npcResponse.toLowerCase().includes("i'm in") || npcResponse.toLowerCase().includes("i'd like that") || npcResponse.toLowerCase().includes("sure, let's go") || npcResponse.toLowerCase().includes("intriguing shared experience")) {
                            let movieToSuggest = "random"; // Default
                            if (playerInput.includes("'")) { // Player suggested a movie title
                                movieToSuggest = playerInput.substring(playerInput.indexOf("'") + 1, playerInput.lastIndexOf("'"));
                            }
                            console.log(`ALEX: Awesome! How about '${movieToSuggest === "random" ? "one the system picks" : movieToSuggest}'?`);

                            const activityResult = await SandboxIntegration.initiateSandboxActivity(
                                currentPlayerId,
                                currentNpcInteractionTarget.npcId,
                                "virtual_movie_date",
                                { movieTitle: movieToSuggest !== "random" ? movieToSuggest : undefined }
                            );

                            if (activityResult.success) {
                                RelationshipLogic.updateRelationshipScore(currentPlayerId, currentNpcInteractionTarget.npcId, "completed_shared_activity", {
                                    activityValue: 8,
                                    movieEnjoymentFactor: activityResult.details?.movieEnjoymentFactor || 0,
                                    activityType: "virtual_movie_date"
                                });
                                console.log(`(You and ${currentNpcInteractionTarget.name} watched ${activityResult.details?.chosenMovie || 'a movie'}.)`);

                                const duringMovieComment = await DialogueSystem.getActivityContextualDialogue(currentNpcInteractionTarget.npcId, "virtual_movie_date", "during_movie_comment", { chosenMovie: activityResult.details?.chosenMovie });
                                if(duringMovieComment) console.log(`(${currentNpcInteractionTarget.name} whispers: ${duringMovieComment})`);
                                await new Promise(resolve => setTimeout(resolve, 1000));

                                let afterMovieEvent = "after_movie_neutral";
                                if ((activityResult.details?.movieEnjoymentFactor || 0) > 3) afterMovieEvent = "after_movie_liked";
                                else if ((activityResult.details?.movieEnjoymentFactor || 0) < 0) afterMovieEvent = "after_movie_disliked";

                                const afterMovieDialogue = await DialogueSystem.getActivityContextualDialogue(currentNpcInteractionTarget.npcId, "virtual_movie_date", afterMovieEvent, { chosenMovie: activityResult.details?.chosenMovie });
                                if(afterMovieDialogue) console.log(`${currentNpcInteractionTarget.name}: ${afterMovieDialogue}`);

                                currentNpcInteractionTarget = null;
                            } else {
                                console.log(`${currentNpcInteractionTarget.name}: (Movie date initiation failed: ${activityResult.message})`);
                            }
                        } else {
                             console.log(`ALEX: (Okay, maybe another time for a movie.)`);
                    }
                    } else if (playerInput.toLowerCase().startsWith("try puzzle") || playerInput.toLowerCase().includes("riddle me this")) {
                        // NPC offers a puzzle
                        const offeredPuzzleId = currentNpcInteractionTarget.baseRelationshipFactors.puzzleInteractions?.offersPuzzles?.[0];
                        if (offeredPuzzleId) {
                            const puzzle = PuzzleSystem.startPuzzle(currentPlayerId, offeredPuzzleId, currentNpcInteractionTarget.npcId);
                            if (puzzle) {
                                console.log(`${currentNpcInteractionTarget.name}: Alright, ${playerProfile.name}, try this: ${puzzle.description}`);
                                await SandboxIntegration.displaySandboxPuzzleUI(currentPlayerId, puzzle);
                            } else {
                                console.log(`${currentNpcInteractionTarget.name}: I don't have a puzzle for you right now.`);
                            }
                        } else {
                             console.log(`${currentNpcInteractionTarget.name}: I'm not really in a puzzle mood right now.`);
                        }
                    } else if (playerInput.toLowerCase().startsWith("answer is ")) {
                        const answer = playerInput.substring(10).trim();
                        const activePuzzle = PuzzleSystem.getActivePuzzleForPlayer(currentPlayerId);
                        if (activePuzzle) {
                            const result = PuzzleSystem.submitPuzzleAnswer(currentPlayerId, answer);
                            console.log(`ALEX: I think the answer is: ${answer}`);
                            if (result.success) {
                                console.log(`${currentNpcInteractionTarget.name}: That's correct, ${playerProfile.name}! Well done!`);
                                await SandboxIntegration.triggerSandboxPuzzleOutcomeEffect(activePuzzle.id, true);
                            } else {
                                console.log(`${currentNpcInteractionTarget.name}: Hmm, that's not quite it. ${result.message.includes("maximum attempts") ? result.message : "Want to try again or ask for a hint?"}`);
                                if(result.maxAttemptsReached) await SandboxIntegration.triggerSandboxPuzzleOutcomeEffect(activePuzzle.id, false);
                            }
                        } else {
                            console.log(`ALEX: (I don't have an active puzzle to answer.)`);
                        }
                    } else if (playerInput.toLowerCase() === "hint please") {
                        const hint = PuzzleSystem.getHint(currentPlayerId);
                        console.log(`ALEX: Could I get a hint?`);
                        console.log(`${currentNpcInteractionTarget.name}: Okay, here's a hint: ${hint}`);
                }


            } else { // No input from queue for current NPC
                await new Promise(resolve => setTimeout(resolve, 1000)); // Wait a bit
                // If interaction has been idle for too long, could auto-exit
                // For now, just waits for more commands or 'exit'
            }
        }
        if (playing && commandQueue.length === 0 && !currentNpcInteractionTarget) {
             // If queue is empty and not talking to anyone, prompt for base command again
        } else if (playing && commandQueue.length === 0 && currentNpcInteractionTarget) {
            // If queue is empty but talking to someone, prompt for interaction command again
        }


        if (!playing) break;
    }
    console.log("\n--- Game Over ---");
}

// --- Start the Game ---
initializeGame();

// --- Populate Command Queue for Simulation ---
commandQueue = [
    "profile",
    "inventory",
    "talk elara", // Start talking to Elara
    "hello there!",
    "i heard you like art and poetry?",
    "give poem_book_common", // Give Elara the common poem book
    "i also have this star_chart_nft for you", // This will still fail as "give" keyword is needed.
    "give star_chart_nft", // Elara: dreamy, introverted, bookworm, optimistic. Likes ArtPieceNFTs, celestial style. This is a specific preferred item.
    "how are you doing today elara?",
    "what are your plans for the future?",
    "would you like to watch a movie with me?", // Invite Elara for a movie date
    "exit",

    "talk kai", // Kai: extroverted, energetic, sarcastic, laid_back, adventurous. Likes MusicTrackNFTs (rock/electronic), Wearables (cool).
    "hey kai, what's up?",
    "i like music and gaming too!",
    "how are you?",
    "what do you think about the future?",
    "give rock_anthem_track_rare", // Kai should like this (rock genre, rare)
    "give vintage_sunglasses_nft", // Kai might find these "cool" or "vintage" depending on his style interpretation.
    "wanna hang out in the sandbox?", // Kai should be up for this
    "exit",

    "talk rian", // Rian: jaded, pessimistic, analytical, introverted, bookworm. Dislikes Music/Wearables. Might like insightful PersonalizedCreationNFTs.
    "hello rian.",
    "how are you today?",
    "i find philosophy interesting.",
    "what are your thoughts on the future?",
    "give lofi_music_track_common", // Rian should dislike this (MusicTrackNFT, lofi genre)
    "give poem_book_common", // Rian might be neutral or slightly positive if it's profound (bookworm)
    "care to see a film? perhaps 'The Algorithm's Secret'?", // Invite Rian to a specific movie he might like
    "try puzzle", // Rian offers a puzzle
    "hint please", // Ask Rian for a hint
    "answer is a map", // Attempt to answer Rian's puzzle (assuming it's riddle_of_time)
    "exit",

    "quit"
];

// Player already has poem_book_common, star_chart_nft, lofi_music_track_common, vintage_sunglasses_nft, rock_anthem_track_rare
// Add concert_ticket_nft for Kai - though not used in the updated command queue to keep it simpler.
// Can be re-added if specific "ExclusiveExperienceTicketNFT" logic is tested.
/* InventoryAndNFTs.addItem(currentPlayerId, "concert_ticket_nft", 1, "collectible_rare_nft", {
    description: "Exclusive ticket to that band Kai likes.",
    token_id: "CT456",
    rarity: "rare"
}); */


gameLoop();
});


gameLoop();
