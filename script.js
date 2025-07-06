document.addEventListener('DOMContentLoaded', () => {
    // IMPORTANT: This URL will need to be updated to your actual deployed API Gateway URL or Load Balancer URL
    // when you deploy the backend to a cloud platform.
    // For local testing with Flask running directly: 'http://localhost:5001'
    // When running Flask inside Docker locally (if Docker maps port 8080 to host's 8080): 'http://localhost:8080'
    // For a deployed app, it might be something like: 'https://your-api-id.execute-api.your-region.amazonaws.com/prod'
    // or 'https://your-custom-domain.com/api'
    const API_BASE_URL = "YOUR_DEPLOYED_API_URL_HERE"; // Placeholder
    // const API_BASE_URL = 'http://localhost:5001'; // Example for local dev

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

    // --- Affiliate Link Click Handling (Placeholder) ---
    const affiliateLinks = document.querySelectorAll('.affiliate-link');
    affiliateLinks.forEach(link => {
        link.addEventListener('click', (event) => {
            // event.preventDefault(); // Keep default behavior to open link for actual affiliate links
            const itemName = event.target.dataset.itemName || 'Unknown Item';
            const itemUrl = event.target.href; // This will be '#' for placeholders

            const logMessage = `Affiliate link clicked for: ${itemName}. URL: ${itemUrl}`;
            console.log(logMessage);
            updateEventLog(logMessage);

            // In a real integration, you might also send this click event to your analytics
            // For example (conceptual):
            // if (typeof gtag === 'function') {
            //     gtag('event', 'click', {
            //         'event_category': 'Affiliate Link',
            //         'event_label': itemName,
            //         'value': itemUrl // or some other value if tracking revenue
            //     });
            // }

            // IMPORTANT: For actual affiliate links, you would NOT preventDefault.
            // You would let the link navigate. The href should be the actual affiliate URL.
            // The preventDefault is only useful if you were handling the navigation yourself
            // or if the link was purely for tracking before a JS redirect.
            // For our placeholders with href="#", preventDefault isn't strictly needed but doesn't hurt.
            if (itemUrl === window.location.href + "#") { // Only prevent if it's a placeholder link
                 event.preventDefault();
            }
        });
    });

    // --- Google Pay Placeholder Logic ---
    const GOOGLE_PAY_API_VERSION = { apiVersion: 2, apiVersionMinor: 0 };
    const GOOGLE_MERCHANT_ID = 'YOUR_GOOGLE_MERCHANT_ID_HERE'; // Placeholder
    const PAYMENT_GATEWAY_NAME = 'example'; // e.g., 'stripe'
    const PAYMENT_GATEWAY_MERCHANT_ID = 'YOUR_PAYMENT_GATEWAY_MERCHANT_ID_HERE'; // e.g., Stripe Publishable Key

    // Base Google Pay request configuration
    const BASE_PAYMENT_REQUEST_CONFIG = {
        apiVersion: GOOGLE_PAY_API_VERSION.apiVersion,
        apiVersionMinor: GOOGLE_PAY_API_VERSION.apiVersionMinor,
        allowedPaymentMethods: [
            {
                type: 'CARD',
                parameters: {
                    allowedAuthMethods: ["PAN_ONLY", "CRYPTOGRAM_3DS"],
                    allowedCardNetworks: ["AMEX", "DISCOVER", "JCB", "MASTERCARD", "VISA"]
                },
                tokenizationSpecification: {
                    type: 'PAYMENT_GATEWAY',
                    parameters: {
                        'gateway': PAYMENT_GATEWAY_NAME,
                        'gatewayMerchantId': PAYMENT_GATEWAY_MERCHANT_ID
                        // For Stripe, it would be:
                        // 'stripe:version': '2020-08-27', // Use a recent Stripe API version
                        // 'stripe:publishableKey': 'pk_test_YOUR_STRIPE_PUBLISHABLE_KEY'
                    }
                }
            }
        ]
    };

    let paymentsClient = null;
    const googlePayButtonContainer = document.getElementById('google-pay-button-container');

    // This function is called by the Google Pay script's `onload` attribute in index.html
    window.onGooglePayLoaded = function() {
        console.log("Google Pay API script loaded.");
        updateEventLog("Google Pay API ready.");
        if (!googlePayButtonContainer) {
            console.error("Google Pay button container not found.");
            return;
        }

        try {
            paymentsClient = new google.payments.api.PaymentsClient({
                environment: 'TEST' // Use 'PRODUCTION' with real merchant ID
                // merchantInfo: { // Optional, but good for production
                //    merchantId: GOOGLE_MERCHANT_ID,
                //    merchantName: "AR Boxing Game"
                // }
            });

            const isReadyToPayRequest = Object.assign(
                {},
                BASE_PAYMENT_REQUEST_CONFIG
                // You can add specific checks here, e.g., if merchantId is required for isReadyToPay
            );

            paymentsClient.isReadyToPay(isReadyToPayRequest)
                .then(function(response) {
                    if (response.result) {
                        const button = paymentsClient.createButton({
                            onClick: onGooglePayButtonClicked,
                            // Other button options: type, color, sizeMode
                            // See: https://developers.google.com/pay/api/web/reference/object#ButtonOptions
                            buttonType: 'buy', // 'buy', 'donate', 'plain', 'subscribe', etc.
                            buttonSizeMode: 'fill', // 'static' or 'fill'
                        });
                        googlePayButtonContainer.innerHTML = ''; // Clear any existing content
                        googlePayButtonContainer.appendChild(button);
                        updateEventLog("Google Pay button added.");
                    } else {
                        console.warn("Google Pay is not available or user is not ready to pay.", response);
                        updateEventLog("Google Pay not available on this device/browser.");
                        googlePayButtonContainer.innerHTML = '<p>Google Pay not available.</p>';
                    }
                })
                .catch(function(err) {
                    console.error("Error checking Google Pay readiness: ", err);
                    updateEventLog(`Error checking GPay readiness: ${err.statusCode || err.message}`);
                });
        } catch (err) {
            console.error("Error initializing Google Pay client: ", err);
            updateEventLog(`Error initializing GPay: ${err.message}`);
        }
    };

    function getTransactionInfo(itemName = "Premium Unlock", price = "1.99") {
        return {
            // See: https://developers.google.com/pay/api/web/reference/object#TransactionInfo
            countryCode: 'US', // Important: affects availability of payment methods
            currencyCode: 'USD',
            totalPriceStatus: 'FINAL',
            totalPrice: price,
            totalPriceLabel: `Total for ${itemName}`,
            displayItems: [ // Optional: for line item breakdown
                {
                    label: itemName,
                    type: 'LINE_ITEM',
                    price: price,
                }
            ]
            // checkoutOption: 'COMPLETE_IMMEDIATE_PURCHASE' // If no further interaction needed after GPay
        };
    }

    function onGooglePayButtonClicked() {
        if (!paymentsClient) {
            console.error("Google Pay client not initialized.");
            updateEventLog("Google Pay client not ready.");
            return;
        }

        const paymentDataRequest = Object.assign({}, BASE_PAYMENT_REQUEST_CONFIG);
        paymentDataRequest.merchantInfo = {
            merchantId: GOOGLE_MERCHANT_ID, // Required for loadPaymentData
            merchantName: "AR Boxing Game (Test)"
        };
        paymentDataRequest.transactionInfo = getTransactionInfo("Premium Game Access", "0.01"); // Use a nominal amount for testing

        console.log("Requesting payment data...", paymentDataRequest);
        updateEventLog("Google Pay transaction initiated...");

        paymentsClient.loadPaymentData(paymentDataRequest)
            .then(function(paymentData) {
                console.log("Google Pay paymentData response: ", paymentData);

                // This is where you would send paymentData.paymentMethodData.tokenizationData.token
                // to your backend server for processing with your payment gateway (e.g., Stripe).
                const paymentToken = paymentData.paymentMethodData.tokenizationData.token;
                const logMsg = `Mock Payment Success! Token (conceptual): ${paymentToken ? paymentToken.substring(0,30)+'...' : 'N/A'}`;
                console.log(logMsg);
                updateEventLog(logMsg);
                alert("Mock Payment Successful! Premium features (conceptual) unlocked.");

                // Example of sending to backend (conceptual, needs actual endpoint and error handling)
                // fetchAPI('/game/process-gpay-payment', 'POST', { paymentToken: paymentToken, gameId: currentGameId, item: "premium_access" })
                // .then(backendResponse => {
                //     if (backendResponse && backendResponse.success) {
                //         updateEventLog("Payment processed by backend (mock). Premium unlocked!");
                //         // Update UI to reflect premium status
                //     } else {
                //          updateEventLog("Backend payment processing failed (mock).");
                //     }
                // });

            })
            .catch(function(err) {
                console.error("Error loading payment data: ", err);
                updateEventLog(`Google Pay Error: ${err.statusCode || err.message || 'Transaction cancelled/failed'}`);
            });
    }

});
```
