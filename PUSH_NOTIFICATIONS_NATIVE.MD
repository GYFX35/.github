# Native Push Notifications Guide (Conceptual)

This guide provides a conceptual overview of how to implement push notifications for native app versions (iOS and Android) of this PWA, assuming it's wrapped using a tool like Capacitor. Push notifications are intended for events like "new posts" and "new announcements."

## Core Architecture

Native push notifications involve several components:
1.  **Client App (iOS/Android):** The installed native application on the user's device.
2.  **Push Notification Services:**
    *   **Firebase Cloud Messaging (FCM):** Google's service for sending push notifications to Android devices. It can also act as a bridge to send notifications to iOS devices.
    *   **Apple Push Notification service (APNs):** Apple's service for sending push notifications to iOS devices.
3.  **Your Backend Server:** A server-side application you manage, responsible for:
    *   Storing user device tokens.
    *   Deciding when to send a notification (e.g., a new post is created).
    *   Constructing the notification payload.
    *   Sending the notification request to FCM/APNs.
4.  **Capacitor Push Notifications Plugin (Example):** A plugin like `@capacitor/push-notifications` simplifies interacting with FCM and APNs from your web code running inside the native app.

## Key Steps for Implementation (Conceptual)

### 1. Setup Firebase Project
*   Go to the [Firebase Console](https://console.firebase.google.com/) and create a new project (or use an existing one).
*   **For Android:**
    *   Add an Android app to your Firebase project. Follow the setup instructions, which will involve providing your app's package name and downloading a `google-services.json` file to include in your Android app module.
*   **For iOS:**
    *   Add an iOS app to your Firebase project. Provide your app's bundle ID.
    *   Configure APNs: Upload your APNs Authentication Key (recommended) or APNs certificates to Firebase. This allows Firebase to send notifications to APNs on your behalf.
*   No server-side Firebase SDK (like Firebase Admin SDK) is strictly needed for the *client app* to *receive* notifications if you use Capacitor, but your *backend server* will use a server-side SDK (like Firebase Admin or a generic HTTP client) to *send* messages to FCM.

### 2. Install and Configure Capacitor Push Notifications Plugin
*   In your project, install the plugin:
    ```bash
    npm install @capacitor/push-notifications
    npx cap sync
    ```
*   Follow the plugin's specific setup instructions for Android and iOS. This might involve:
    *   **Android:** Ensuring `google-services.json` is correctly placed. Adding specific permissions or services to `AndroidManifest.xml`.
    *   **iOS:** Enabling "Push Notifications" capability in Xcode. Setting up "Background Modes" for remote notifications. Ensuring proper linking of frameworks.

### 3. Requesting Permission (Client-Side in App)
Your app needs to request permission from the user to receive push notifications. This is typically done at an appropriate time, like after login or in a settings page.

*Conceptual code using the Capacitor plugin:*
```javascript
// Somewhere in your React app's logic (e.g., a settings component)
import { PushNotifications } from '@capacitor/push-notifications';

const requestPermission = async () => {
  try {
    const result = await PushNotifications.requestPermissions();
    if (result.receive === 'granted') {
      // Permissions granted, now register for push notifications
      await PushNotifications.register();
    } else {
      // Permissions not granted or denied
      console.warn('Push notification permission not granted.');
    }
  } catch (e) {
    console.error('Error requesting push permission:', e);
  }
};
```

### 4. Receiving and Sending Device Token (Client-Side in App)
If permission is granted and registration is successful, the app receives a unique device token (FCM token). This token must be sent to your backend server.

*Conceptual code using the Capacitor plugin:*
```javascript
// Add listeners when your app initializes
const addPushListeners = async () => {
  PushNotifications.addListener('registration', async (token) => {
    console.info('Push registration success, token:', token.value);
    // **IMPORTANT**: Send this token.value to your backend server
    // and associate it with the logged-in user.
    // Example:
    // await fetch('YOUR_BACKEND_API/register-device', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json', /* Authorization header */ },
    //   body: JSON.stringify({ deviceToken: token.value, userId: /* currentUserId */ }),
    // });
  });

  PushNotifications.addListener('registrationError', (error) => {
    console.error('Error on push registration:', error);
  });

  // ... (listeners for received notifications - see step 7)
};
```

### 5. Storing Device Tokens (Backend Server)
*   Create a database table to store device tokens. Each token should be associated with a user ID.
*   A user might have multiple device tokens if they use the app on several devices.
*   Handle token updates: FCM tokens can sometimes be refreshed. Your app should detect this and send the new token to your server.
*   Handle token unregistration: When a user logs out or disables notifications, you might want to remove their token from your server.

### 6. Sending Push Notifications (Backend Server)
This is where your server logic for "new posts" or "new announcements" comes into play.

*   **Identify Target Users:** When a new post or announcement is made, determine which users should receive a notification (e.g., all users for announcements, or users subscribed to specific topics for new posts).
*   **Retrieve Tokens:** Get the device tokens for these target users from your database.
*   **Construct Payload:** Create the notification payload. For FCM, this is a JSON object.
    *   `to` or `registration_ids`: The device token(s).
    *   `notification`: Contains title, body, sound, badge (for iOS).
    *   `data`: Optional custom data payload that your app can receive and act upon (e.g., post ID, URL to open).
*   **Send to FCM:** Use the Firebase Admin SDK (e.g., in Node.js, Python, Java) or make direct HTTP v1 API requests to FCM to send the message. FCM will then deliver it to Android devices and relay it to APNs for iOS devices (if configured).

*Example (conceptual Node.js with Firebase Admin SDK):*
```javascript
// // On your backend server
// const admin = require('firebase-admin');
// // Initialize Firebase Admin with your server credentials

// async function sendPushNotification(deviceToken, title, body, dataPayload) {
//   const message = {
//     notification: { title, body },
//     data: dataPayload, // e.g., { postId: '123', type: 'new_post' }
//     token: deviceToken,
//   };
//   try {
//     const response = await admin.messaging().send(message);
//     console.log('Successfully sent message:', response);
//   } catch (error) {
//     console.log('Error sending message:', error);
//   }
// }
```

### 7. Handling Received Notifications (Client-Side in App)
The Capacitor plugin allows you to define how your app reacts when notifications arrive.

*Conceptual code using the Capacitor plugin:*
```javascript
// Continuing from addPushListeners()
const addPushListeners = async () => {
  // ... (registration and registrationError listeners) ...

  // Called when a push notification is received while the app is in the foreground
  PushNotifications.addListener('pushNotificationReceived', (notification) => {
    console.info('Push received in foreground:', notification);
    // You might want to display an in-app notification/alert here
    // Or update a badge count, etc.
  });

  // Called when a push notification is tapped (app was in background or closed)
  PushNotifications.addListener('pushNotificationActionPerformed', (action) => {
    console.info('Push action performed:', action);
    // Navigate to the relevant content based on notification.data
    // For example, if action.notification.data contains a postId:
    // const postId = action.notification.data.postId;
    // if (postId) {
    //   history.push(`/posts/${postId}`); // Assuming you use React Router
    // }
  });
};
```

## Important Considerations
*   **User Preferences:** Allow users to customize their notification preferences (e.g., turn off notifications for new posts but keep announcements). Your backend will need to respect these preferences when selecting device tokens.
*   **Backend Development:** The backend is the most complex part of a push notification system. It handles the core logic of sending messages and managing tokens.
*   **Testing:** Thoroughly test on both Android and iOS devices.
*   **Platform Differences:** Be aware of slight differences in how FCM and APNs handle notifications (e.g., payload structure, background behavior). Capacitor plugins aim to abstract some of this.

This conceptual guide provides a roadmap. Actual implementation requires careful attention to the documentation of Firebase, APNs, and your chosen Capacitor plugin.
