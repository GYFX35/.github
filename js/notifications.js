document.addEventListener('DOMContentLoaded', () => {
    const enableNotificationsButton = document.getElementById('enableNotifications');
    const notificationStatusDiv = document.getElementById('notificationStatus');

    function displayNotificationStatus(message, isError = false) {
        if (notificationStatusDiv) {
            notificationStatusDiv.textContent = message;
            notificationStatusDiv.style.color = isError ? 'red' : 'green';
        }
    }

    function urlBase64ToUint8Array(base64String) {
        const padding = '='.repeat((4 - base64String.length % 4) % 4);
        const base64 = (base64String + padding)
            .replace(/-/g, '+')
            .replace(/_/g, '/');

        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);

        for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
        }
        return outputArray;
    }

    async function subscribeUserToPush() {
        try {
            const registration = await navigator.serviceWorker.ready;
            const existingSubscription = await registration.pushManager.getSubscription();

            if (existingSubscription) {
                console.log('User is already subscribed:', existingSubscription);
                displayNotificationStatus('You are already subscribed to notifications.');
                // Optionally, log the existing subscription again or send to backend
                console.log('Existing PushSubscription: ', JSON.stringify(existingSubscription));
                return;
            }

            // VAPID public key - REPLACE THIS WITH YOUR ACTUAL SERVER'S PUBLIC KEY
            // This is a placeholder key and will not work for actual push delivery.
            // You'd get this from your backend server that generates VAPID keys.
            const vapidPublicKey = 'YOUR_PUBLIC_VAPID_KEY_HERE';
            if (vapidPublicKey === 'YOUR_PUBLIC_VAPID_KEY_HERE') {
                console.warn('VAPID public key is a placeholder. Real push notifications will not work until this is replaced with a server-generated key.');
                // We can still proceed with subscription for testing client-side logic,
                // but the subscription won't be usable by a real push service without a valid key.
            }

            const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey);

            const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: convertedVapidKey
            });

            console.log('User is subscribed:', subscription);
            displayNotificationStatus('Successfully subscribed to notifications!');

            // IMPORTANT: Send this subscription object to your backend server!
            // For now, we just log it.
            console.log('PushSubscription: ', JSON.stringify(subscription));
            // Example: fetch('/api/subscribe', { method: 'POST', body: JSON.stringify(subscription), ... });

        } catch (error) {
            console.error('Failed to subscribe the user: ', error);
            if (error.name === 'NotAllowedError') {
                displayNotificationStatus('Notification permission was denied. Please enable it in your browser settings.', true);
            } else {
                displayNotificationStatus('Failed to subscribe to notifications: ' + error.message, true);
            }
        }
    }


    if (enableNotificationsButton) {
        enableNotificationsButton.addEventListener('click', () => {
            if (!('Notification' in window)) {
                displayNotificationStatus('This browser does not support desktop notification.', true);
                return;
            }
            if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
                displayNotificationStatus('Push messaging is not supported by this browser.', true);
                return;
            }

            Notification.requestPermission().then(permission => {
                if (permission === 'granted') {
                    displayNotificationStatus('Notification permission granted. Subscribing...');
                    subscribeUserToPush();
                } else {
                    displayNotificationStatus('Notification permission denied.', true);
                }
            });
        });
    } else {
        console.warn("Element with ID 'enableNotifications' not found.");
    }
     // Initial check for existing permission
     if ('Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window) {
        if (Notification.permission === 'granted') {
            // If already granted, you might want to ensure they are subscribed
            // or just update the UI to reflect they are already opted-in.
            // For simplicity here, we'll just let them click the button to resubscribe/check.
            // displayNotificationStatus('Notification permission is already granted.');
            // subscribeUserToPush(); // Optionally auto-subscribe or check subscription
        } else if (Notification.permission === 'denied') {
            displayNotificationStatus('Notification permission is currently denied. You can change this in your browser settings.', true);
        }
    }
});
