// LoveChatGame/core_modules/NPCProfile.js

/**
 * Manages NPC (Non-Player Character) profiles.
 * Uses an in-memory store for simplicity.
 */

const npcs = {}; // In-memory store for NPC data

class NPCProfile {
    /**
     * Creates an NPC profile.
     * @param {string} npcId - Unique ID for the NPC.
     * @param {string} name - NPC's name.
     * @param {string[]} interests - Array of interests (e.g., ["hiking", "coding"]).
     * @param {object} corePersonality - Core numerical traits (e.g., { "patience": 9, "wit": 7 }).
     * @param {string[]} descriptivePersonalityTags - Array of descriptive tags (e.g., ["optimistic", "bookworm"]).
     * @param {string} dialogueStyle - General style of dialogue (e.g., "friendly", "sarcastic").
     * @param {object} baseRelationshipFactors - Factors influencing relationship changes, including gift and puzzle preferences.
     */
    constructor(npcId, name, interests = [], corePersonality = {}, descriptivePersonalityTags = [], dialogueStyle = "friendly", baseRelationshipFactors = {}) {
        if (npcs[npcId]) {
            throw new Error(`NPC with ID ${npcId} already exists.`);
        }
        this.npcId = npcId;
        this.name = name;
        this.interests = new Set(interests.map(i => i.toLowerCase()));
        this.corePersonality = corePersonality;
        this.descriptivePersonalityTags = new Set(descriptivePersonalityTags.map(t => t.toLowerCase()));
        this.dialogueStyle = dialogueStyle;

        this.baseRelationshipFactors = {
            likesInterestsInCommon: baseRelationshipFactors.likesInterestsInCommon || 2,
            prefersCompliments: baseRelationshipFactors.prefersCompliments !== undefined ? baseRelationshipFactors.prefersCompliments : true,
            dislikesRudeness: baseRelationshipFactors.dislikesRudeness !== undefined ? baseRelationshipFactors.dislikesRudeness : true,
            giftPreferences: { // Default structure for gift preferences
                specificItems: baseRelationshipFactors.giftPreferences?.specificItems || {},
                likedTypes: baseRelationshipFactors.giftPreferences?.likedTypes || [],
                dislikedTypes: baseRelationshipFactors.giftPreferences?.dislikedTypes || [],
                likedGenres: baseRelationshipFactors.giftPreferences?.likedGenres || [],
                likedStyles: baseRelationshipFactors.giftPreferences?.likedStyles || [],
                cherishedRarity: baseRelationshipFactors.giftPreferences?.cherishedRarity || "legendary",
                valueMultiplierForInterests: baseRelationshipFactors.giftPreferences?.valueMultiplierForInterests || 1.5
            },
            puzzleInteractions: { // Default structure for puzzle interactions
                offersPuzzles: baseRelationshipFactors.puzzleInteractions?.offersPuzzles || [],
                likesSolvingPuzzles: baseRelationshipFactors.puzzleInteractions?.likesSolvingPuzzles || false,
                goodAtPuzzleTypes: baseRelationshipFactors.puzzleInteractions?.goodAtPuzzleTypes || [],
                puzzleRewardMultiplier: baseRelationshipFactors.puzzleInteractions?.puzzleRewardMultiplier || 1.0
            }
        };

        npcs[npcId] = this;
        console.log(`NPC profile created for ${name} (ID: ${npcId}) with tags: [${Array.from(this.descriptivePersonalityTags).join(', ')}]`);
    }

    static getNPC(npcId) {
        return npcs[npcId];
    }

    // The initializeNPC method remains the same as it just passes arguments to the constructor
    static initializeNPC(npcId, name, interests, corePersonality, descriptivePersonalityTags, dialogueStyle, baseRelationshipFactors) {
        if (!npcs[npcId]) {
            return new NPCProfile(npcId, name, interests, corePersonality, descriptivePersonalityTags, dialogueStyle, baseRelationshipFactors);
        }
        return npcs[npcId];
    }

    hasDescriptivePersonalityTag(tag) {
        return this.descriptivePersonalityTags.has(tag.toLowerCase());
    }

    hasInterest(interest) {
        return this.interests.has(interest.toLowerCase());
    }

    /**
     * Calculates the NPC's preference score for a given item.
     * Considers specific item preferences, liked/disliked types, genres, styles, and rarity.
     * @param {object} item - The item object from player's inventory, including type and metadata.
     *                        e.g., { itemId: "item_id", type: "MusicTrackNFT", metadata: { genre: "jazz", rarity: "rare" } }
     * @returns {number} - The preference score for the item.
     */
    getGiftPreferenceValue(item) { // This method was added in a previous step and is correct
        if (!item || !item.itemId) return 0;

        const prefs = this.baseRelationshipFactors.giftPreferences;
        let score = 0;

        if (prefs.specificItems && prefs.specificItems[item.itemId] !== undefined) {
            return prefs.specificItems[item.itemId];
        }

        const itemType = item.type || "unknown";
        const itemMetadata = item.metadata || {};

        if (prefs.dislikedTypes && prefs.dislikedTypes.includes(itemType)) {
            return -5;
        }

        score = 2;

        if (prefs.likedTypes && prefs.likedTypes.includes(itemType)) {
            score += 5;
        }

        if (itemType === "MusicTrackNFT" && itemMetadata.genre) {
            if (prefs.likedGenres && prefs.likedGenres.includes(itemMetadata.genre.toLowerCase())) {
                score += 8;
            }
        }

        if ((itemType === "WearableAccessoryNFT" || itemType === "ArtPieceNFT") && itemMetadata.style_tag) {
            if (prefs.likedStyles && prefs.likedStyles.includes(itemMetadata.style_tag.toLowerCase())) {
                score += 7;
            }
        }
         if (itemType === "ArtPieceNFT" && itemMetadata.style) {
            if (prefs.likedStyles && prefs.likedStyles.includes(itemMetadata.style.toLowerCase())) {
                score += 7;
            }
        }

        const rarityOrder = { "common": 1, "rare": 2, "epic": 3, "legendary": 4, "unique_personal_creation": 5 };
        const itemRarity = itemMetadata.rarity ? itemMetadata.rarity.toLowerCase() : "common";
        if (rarityOrder[itemRarity]) {
            score += rarityOrder[itemRarity] * 2;
        }
        if (prefs.cherishedRarity && itemRarity === prefs.cherishedRarity.toLowerCase()) {
            score += 5;
        }

        if (itemMetadata.description && Array.from(this.interests).some(interest => itemMetadata.description.toLowerCase().includes(interest))) {
            score = Math.floor(score * (prefs.valueMultiplierForInterests || 1.2));
        }
        if (itemMetadata.title && Array.from(this.interests).some(interest => itemMetadata.title.toLowerCase().includes(interest))) {
             score = Math.floor(score * (prefs.valueMultiplierForInterests || 1.2));
        }

        return Math.max(-10, Math.min(score, 30));
    }

    viewProfile() {
        return {
            npcId: this.npcId,
            name: this.name,
            interests: Array.from(this.interests),
            corePersonality: this.corePersonality,
            descriptivePersonalityTags: Array.from(this.descriptivePersonalityTags),
            dialogueStyle: this.dialogueStyle,
            relationshipFactors: this.baseRelationshipFactors // This now includes puzzleInteractions
        };
    }
}

module.exports = NPCProfile;
