document.addEventListener('DOMContentLoaded', () => {
    const API_BASE_URL = 'http://localhost:5001'; // Assuming Flask runs on port 5001
    let currentGameId = null;

    // UI Elements - General Match Info
    const roundNumberEl = document.getElementById('round-number');
    const maxRoundsEl = document.getElementById('max-rounds');
    const roundTimerEl = document.getElementById('round-timer');
    const matchStatusEl = document.getElementById('match-status');
    const matchWinnerEl = document.getElementById('match-winner');

    // UI Elements - Player
    const playerNameEl = document.getElementById('player-name'); // Though name is static for now
    const playerHpBar = document.getElementById('player-hp-bar');
    const playerHpText = document.getElementById('player-hp-text');
    const playerStaminaBar = document.getElementById('player-stamina-bar');
    const playerStaminaText = document.getElementById('player-stamina-text');
    const playerActionEl = document.getElementById('player-current-action');
    const playerScoresEl = document.getElementById('player-round-scores');

    // UI Elements - Opponent
    const opponentNameEl = document.getElementById('opponent-name'); // Static for now
    const opponentHpBar = document.getElementById('opponent-hp-bar');
    const opponentHpText = document.getElementById('opponent-hp-text');
    const opponentStaminaBar = document.getElementById('opponent-stamina-bar');
    const opponentStaminaText = document.getElementById('opponent-stamina-text');
    const opponentActionEl = document.getElementById('opponent-current-action');
    const opponentScoresEl = document.getElementById('opponent-round-scores');

    // UI Elements - Knockdown Info
    const knockdownActiveEl = document.getElementById('knockdown-active');
    const knockdownFighterEl = document.getElementById('knockdown-fighter');
    const knockdownCountEl = document.getElementById('knockdown-count');

    // UI Elements - Event Log
    const eventLogListEl = document.getElementById('event-log-list');

    // Buttons
    const startGameBtn = document.getElementById('start-game-btn');
    const actionButtons = document.querySelectorAll('.action-btn');
    const getStateBtn = document.getElementById('get-state-btn'); // Manual refresh

    // --- API Communication ---
    async function fetchAPI(endpoint, method = 'GET', body = null) {
        const options = {
            method,
            headers: {
                'Content-Type': 'application/json',
            },
        };
        if (body) {
            options.body = JSON.stringify(body);
        }
        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ error: "Network response was not ok and failed to parse error JSON." }));
                console.error('API Error:', response.status, errorData);
                updateEventLog(`API Error ${response.status}: ${errorData.error || 'Unknown error'}`);
                if(errorData.game_state) updateUI(errorData.game_state); // Update UI even on error if state is provided
                return null;
            }
            return await response.json();
        } catch (error) {
            console.error('Fetch API Error:', error);
            updateEventLog(`Fetch Error: ${error.message}`);
            return null;
        }
    }

    // --- Game Functions ---
    async function startGame() {
        console.log("Attempting to start a new game...");
        updateEventLog("Starting new game...");
        const data = await fetchAPI('/game/start', 'POST');
        if (data && data.game_id) {
            currentGameId = data.game_id;
            console.log("Game started with ID:", currentGameId, data);
            updateEventLog(`Game started. ID: ${currentGameId}`);
            updateUI(data);
            enableActionButtons(true);
        } else {
            updateEventLog("Failed to start game.");
            enableActionButtons(false);
        }
    }

    async function sendPlayerAction(action) {
        if (!currentGameId) {
            updateEventLog("No active game. Please start a new game.");
            console.warn("No game ID, action not sent.");
            return;
        }
        console.log(`Sending action: ${action} for game ID: ${currentGameId}`);
        updateEventLog(`Player action: ${action}`);
        const data = await fetchAPI(`/game/${currentGameId}/action`, 'POST', { action });
        if (data) {
            updateUI(data);
        }
    }

    async function getGameState() {
        if (!currentGameId) {
            updateEventLog("No active game to refresh.");
            console.warn("No game ID, cannot get state.");
            return;
        }
        console.log(`Fetching state for game ID: ${currentGameId}`);
        const data = await fetchAPI(`/game/${currentGameId}/state`, 'GET');
        if (data) {
            updateUI(data);
            updateEventLog("Game state refreshed manually.");
        }
    }

    // --- UI Update Functions ---
    function updateUI(gameStateData) {
        if (!gameStateData) {
            console.warn("updateUI called with no gameStateData");
            return;
        }
        console.log("Updating UI with data:", gameStateData);

        // Match Info
        roundNumberEl.textContent = gameStateData.current_round || 0;
        maxRoundsEl.textContent = gameStateData.max_rounds || 3;
        roundTimerEl.textContent = gameStateData.round_timer !== null ? gameStateData.round_timer.toFixed(1) + 's' : 'N/A';
        matchStatusEl.textContent = gameStateData.match_status || 'N/A';
        matchWinnerEl.textContent = gameStateData.winner || 'N/A';

        if (gameStateData.match_status === "MATCH_OVER" || gameStateData.winner) {
            enableActionButtons(false);
        } else if (gameStateData.is_round_active && !gameStateData.knockdown_info.is_knockdown) {
            enableActionButtons(true);
        } else {
            enableActionButtons(false); // Disable if round not active or knockdown
        }


        // Player Info
        if (gameStateData.player) {
            const player = gameStateData.player;
            // playerNameEl.textContent = player.name; // Name is usually static
            playerHpBar.value = player.hp;
            playerHpBar.max = player.max_hp;
            playerHpText.textContent = `${player.hp}/${player.max_hp}`;
            playerStaminaBar.value = player.stamina;
            playerStaminaBar.max = player.max_stamina;
            playerStaminaText.textContent = `${player.stamina.toFixed(1)}/${player.max_stamina}`;
            playerActionEl.textContent = player.current_action;
            playerScoresEl.textContent = player.round_scores ? player.round_scores.join(', ') : '';
        }

        // Opponent Info
        if (gameStateData.opponent) {
            const opponent = gameStateData.opponent;
            // opponentNameEl.textContent = opponent.name; // Name is usually static
            opponentHpBar.value = opponent.hp;
            opponentHpBar.max = opponent.max_hp;
            opponentHpText.textContent = `${opponent.hp}/${opponent.max_hp}`;
            opponentStaminaBar.value = opponent.stamina;
            opponentStaminaBar.max = opponent.max_stamina;
            opponentStaminaText.textContent = `${opponent.stamina.toFixed(1)}/${opponent.max_stamina}`;
            opponentActionEl.textContent = opponent.current_action;
            opponentScoresEl.textContent = opponent.round_scores ? opponent.round_scores.join(', ') : '';
        }

        // Knockdown Info
        if (gameStateData.knockdown_info) {
            const kd = gameStateData.knockdown_info;
            knockdownActiveEl.textContent = kd.is_knockdown ? 'Yes' : 'No';
            knockdownFighterEl.textContent = kd.fighter_down || 'N/A';
            knockdownCountEl.textContent = kd.count !== null ? kd.count.toFixed(1) + 's' : '0s';
        }

        // Event Log
        if (gameStateData.event_log && Array.isArray(gameStateData.event_log)) {
            eventLogListEl.innerHTML = ''; // Clear old logs
            gameStateData.event_log.forEach(logEntry => {
                // The log from python is already formatted with timestamp
                // If it were just the message: const message = logEntry.message || logEntry;
                const message = typeof logEntry === 'string' ? logEntry : (logEntry.message || JSON.stringify(logEntry));
                const li = document.createElement('li');
                li.textContent = message;
                eventLogListEl.appendChild(li);
            });
        }
    }

    function updateEventLog(message) {
        const li = document.createElement('li');
        const timestamp = new Date().toLocaleTimeString();
        li.textContent = `[${timestamp}] ${message}`;
        eventLogListEl.prepend(li); // Add to top
        // Keep log short
        while (eventLogListEl.children.length > 15) {
            eventLogListEl.removeChild(eventLogListEl.lastChild);
        }
    }

    function enableActionButtons(enable) {
        actionButtons.forEach(button => {
            button.disabled = !enable;
        });
    }

    // --- Event Listeners ---
    startGameBtn.addEventListener('click', startGame);

    actionButtons.forEach(button => {
        button.addEventListener('click', () => {
            const action = button.dataset.action;
            sendPlayerAction(action);
        });
    });

    getStateBtn.addEventListener('click', getGameState);

    // --- Initial State ---
    updateEventLog("Page loaded. Click 'Start New Game' to begin.");
    enableActionButtons(false); // Disable action buttons until game starts


    // --- Ad Logic Placeholders ---
    const bottomBannerAdEl = document.getElementById('bottom-banner-ad-placeholder');
    // const interstitialAdEl = document.getElementById('interstitial-ad-placeholder'); // If using the HTML placeholder

    function initializeAds() {
        // This is where you would initialize your ad network SDK
        // For example, with Google AdSense/AdMob (conceptual):
        // googletag.cmd.push(function() {
        //   googletag.defineSlot('/YOUR_NETWORK_CODE/YOUR_AD_UNIT_ID', [728, 90], 'bottom-banner-ad-placeholder').addService(googletag.pubads());
        //   googletag.pubads().enableSingleRequest();
        //   googletag.enableServices();
        // });
        // googletag.cmd.push(function() { googletag.display('bottom-banner-ad-placeholder'); });
        console.log("Conceptual: Ads SDK initialized.");
        updateEventLog("Ads SDK Initialized (Placeholder).");

        // For now, just make the placeholder visible to show it's "loaded"
        if (bottomBannerAdEl) {
            bottomBannerAdEl.style.display = 'flex'; // Assuming it's 'flex' from CSS
        }
    }

    function requestInterstitialAd() {
        // This function would be called at appropriate times (e.g., end of match)
        // Example with a conceptual AdMob-like SDK:
        // if (interstitialAd && interstitialAd.isLoaded()) {
        //    interstitialAd.show();
        // } else {
        //    console.log("Interstitial ad not ready.");
        //    // Optionally, try to load one if not already loading
        // }
        console.log("Conceptual: Interstitial ad requested.");
        updateEventLog("Interstitial Ad Requested (Placeholder).");

        // Simulate showing our HTML placeholder if it exists and is used
        // if (interstitialAdEl) {
        //     interstitialAdEl.style.display = 'flex';
        //     setTimeout(() => {
        //         interstitialAdEl.style.display = 'none'; // Hide after a few seconds
        //         updateEventLog("Interstitial Ad Closed (Placeholder).");
        //     }, 3000); // Simulate ad display time
        // }
    }


    // Modify updateUI to call requestInterstitialAd when match is over
    function updateUI(gameStateData) {
        if (!gameStateData) {
            console.warn("updateUI called with no gameStateData");
            return;
        }
        console.log("Updating UI with data:", gameStateData);

        // Match Info
        roundNumberEl.textContent = gameStateData.current_round || 0;
        maxRoundsEl.textContent = gameStateData.max_rounds || 3;
        roundTimerEl.textContent = gameStateData.round_timer !== null ? gameStateData.round_timer.toFixed(1) + 's' : 'N/A';
        matchStatusEl.textContent = gameStateData.match_status || 'N/A';
        matchWinnerEl.textContent = gameStateData.winner || 'N/A';

        if (gameStateData.match_status === "MATCH_OVER" || gameStateData.winner) {
            enableActionButtons(false);
            // Potentially request an interstitial ad here
            // Check if an interstitial hasn't been shown recently for this game session
            if (!localStorage.getItem(`interstitial_shown_game_${currentGameId}`)) {
                requestInterstitialAd();
                localStorage.setItem(`interstitial_shown_game_${currentGameId}`, 'true');
            }
        } else if (gameStateData.is_round_active && !gameStateData.knockdown_info.is_knockdown) {
            enableActionButtons(true);
        } else {
            enableActionButtons(false); // Disable if round not active or knockdown
        }


        // Player Info
        if (gameStateData.player) {
            const player = gameStateData.player;
            // playerNameEl.textContent = player.name; // Name is usually static
            playerHpBar.value = player.hp;
            playerHpBar.max = player.max_hp;
            playerHpText.textContent = `${player.hp}/${player.max_hp}`;
            playerStaminaBar.value = player.stamina;
            playerStaminaBar.max = player.max_stamina;
            playerStaminaText.textContent = `${player.stamina.toFixed(1)}/${player.max_stamina}`;
            playerActionEl.textContent = player.current_action;
            playerScoresEl.textContent = player.round_scores ? player.round_scores.join(', ') : '';
        }

        // Opponent Info
        if (gameStateData.opponent) {
            const opponent = gameStateData.opponent;
            // opponentNameEl.textContent = opponent.name; // Name is usually static
            opponentHpBar.value = opponent.hp;
            opponentHpBar.max = opponent.max_hp;
            opponentHpText.textContent = `${opponent.hp}/${opponent.max_hp}`;
            opponentStaminaBar.value = opponent.stamina;
            opponentStaminaBar.max = opponent.max_stamina;
            opponentStaminaText.textContent = `${opponent.stamina.toFixed(1)}/${opponent.max_stamina}`;
            opponentActionEl.textContent = opponent.current_action;
            opponentScoresEl.textContent = opponent.round_scores ? opponent.round_scores.join(', ') : '';
        }

        // Knockdown Info
        if (gameStateData.knockdown_info) {
            const kd = gameStateData.knockdown_info;
            knockdownActiveEl.textContent = kd.is_knockdown ? 'Yes' : 'No';
            knockdownFighterEl.textContent = kd.fighter_down || 'N/A';
            knockdownCountEl.textContent = kd.count !== null ? kd.count.toFixed(1) + 's' : '0s';
        }

        // Event Log
        if (gameStateData.event_log && Array.isArray(gameStateData.event_log)) {
            eventLogListEl.innerHTML = ''; // Clear old logs
            gameStateData.event_log.forEach(logEntry => {
                // The log from python is already formatted with timestamp
                // If it were just the message: const message = logEntry.message || logEntry;
                const message = typeof logEntry === 'string' ? logEntry : (logEntry.message || JSON.stringify(logEntry));
                const li = document.createElement('li');
                li.textContent = message;
                eventLogListEl.appendChild(li);
            });
        }
    }

    // Call initializeAds once the page is ready (or after starting a game)
    // For simplicity, let's call it after the first game state is loaded or on start game.
    // Modifying startGame to include ad initialization:
    async function startGame() {
        console.log("Attempting to start a new game...");
        updateEventLog("Starting new game...");
        localStorage.removeItem(`interstitial_shown_game_${currentGameId}`); // Reset for new game
        const data = await fetchAPI('/game/start', 'POST');
        if (data && data.game_id) {
            currentGameId = data.game_id;
            console.log("Game started with ID:", currentGameId, data);
            updateEventLog(`Game started. ID: ${currentGameId}`);
            updateUI(data);
            enableActionButtons(true);
            initializeAds(); // Initialize ads when game starts
        } else {
            updateEventLog("Failed to start game.");
            enableActionButtons(false);
        }
    }


    // --- PWA Service Worker Registration ---
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/sw.js') // Path relative to origin
                .then((registration) => {
                    console.log('ServiceWorker registration successful with scope: ', registration.scope);
                    updateEventLog('Service Worker registered successfully.');
                })
                .catch((error) => {
                    console.error('ServiceWorker registration failed: ', error);
                    updateEventLog(`Service Worker registration failed: ${error.message}`);
                });
        });
    } else {
        console.warn('Service workers are not supported in this browser.');
        updateEventLog('Service Workers not supported by this browser.');
    }
});
```
