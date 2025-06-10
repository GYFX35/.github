# Social Sharing Guide

This guide explains the social sharing functionality implemented in the application, primarily through the `src/components/ShareButton.jsx` component. It covers the use of the Web Share API and considerations for native app versions.

## `ShareButton.jsx` Component

The `ShareButton.jsx` component provides a user interface element (a button) to trigger sharing functionality.

### Features:

1.  **Web Share API (`navigator.share`)**:
    *   If the browser supports the Web Share API (common on mobile browsers and some desktop browsers like Chrome, Edge, Safari on macOS), clicking the share button will invoke the native sharing dialog of the operating system.
    *   This allows users to share content directly to apps installed on their device (e.g., social media, email, messaging apps).
    *   The component accepts `title`, `text`, and `url` props to populate the shared content.
    *   **HTTPS Requirement:** The Web Share API typically requires the page to be served over HTTPS.

2.  **Clipboard Fallback:**
    *   If `navigator.share` is not available (e.g., on some desktop browsers or older mobile browsers), the component attempts to copy the provided `url` to the user's clipboard using `navigator.clipboard.writeText()`.
    *   A feedback message ("Link copied to clipboard!" or an error message) is displayed temporarily next to the button.

### Props:

*   `title` (string): The title of the content to be shared (e.g., "Check out this Product!"). Defaults to `document.title`.
*   `text` (string): A descriptive text accompanying the shared content.
*   `url` (string): The URL to be shared. Defaults to `window.location.href`.
*   `buttonText` (string, optional): Custom text for the share button. Defaults to "Share".
*   `buttonStyle` (object, optional): Custom inline styles for the button.

### Current Integrations:

*   **App Sharing:** Located in `src/components/NavigationBar.jsx`, allows users to share the main application link.
*   **Product Sharing:** Located in `src/components/ProductDetailView.jsx`, allows users to share a link to the currently viewed product.
    *   *Note:* For product URLs to be most effective, ensure your application has distinct routes for each product detail page if possible (e.g., `/shop/product/:productId`). Currently, it shares `window.location.href`.
*   **Forum Post Sharing (Conceptual):** A note in `src/components/Forums.jsx` indicates that individual forum posts (when implemented with unique URLs) should also feature a share button.

## Native App Considerations (e.g., Using Capacitor)

When wrapping the PWA into a native application using a framework like Capacitor, you might want more robust or consistent access to native sharing capabilities, or to handle cases where the Web Share API might have limitations within a WebView.

### Capacitor Share Plugin (`@capacitor/share`)

The Capacitor Share Plugin provides a direct bridge to the native sharing mechanisms of iOS and Android.

*   **Installation:**
    ```bash
    npm install @capacitor/share
    npx cap sync
    ```

*   **Usage (Conceptual):**
    You could modify `ShareButton.jsx` or create a platform-specific sharing service to use this plugin when the app is running in a Capacitor environment.

    ```javascript
    // Conceptual modification within ShareButton.jsx or a helper function
    import { Share } from '@capacitor/share';
    import { Capacitor } from '@capacitor/core';

    const handleNativeShare = async (shareData) => {
      try {
        const canShare = await Share.canShare(); // Check if sharing is available (optional, primarily for web)
        if (!canShare.value && Capacitor.isNativePlatform()) { // On native, Share.share should generally be available
            console.warn("Capacitor Share.share might not be available on this native platform, but attempting anyway.");
        }

        await Share.share({
          title: shareData.title,
          text: shareData.text,
          url: shareData.url,
          dialogTitle: 'Share with buddies', // Optional: Custom dialog title on some platforms
        });
        console.log('Content shared successfully via Capacitor Share');
      } catch (error) {
        console.error('Error using Capacitor Share API:', error);
        // Fallback to clipboard or show an error if needed
        if (error.message !== "Share canceled") { // Example error message to ignore
            // Your clipboard fallback logic from ShareButton.jsx could go here
            alert('Sharing failed. Link copied to clipboard instead.');
            await navigator.clipboard.writeText(shareData.url);
        }
      }
    };

    // In the ShareButton's handleShare function, you might do:
    // if (Capacitor.isNativePlatform()) {
    //   await handleNativeShare(shareData);
    // } else if (navigator.share) {
    //   // ... use navigator.share ...
    // } else {
    //   // ... clipboard fallback ...
    // }
    ```

### Why Use a Native Plugin?

*   **Consistency:** Ensures a native sharing experience across all devices.
*   **Reliability:** Can be more reliable than Web Share API within WebViews, especially on older OS versions.
*   **Additional Options:** Some plugins might offer more control over the shared content or dialog appearance on specific platforms.

## Importance of Shareable URLs (Deep Linking)

For sharing specific content like products or forum posts to be effective, it's crucial that these items have unique, accessible URLs. When a user clicks a shared link, it should take them directly to that specific item within your application (this is known as deep linking).

*   **Products:** Consider URLs like `/shop/product/<product_id>`.
*   **Forum Posts:** Consider URLs like `/forums/post/<post_id>`.

Ensure your application's routing is set up to handle these types of URLs.

This guide provides a starting point for implementing and understanding social sharing in your application.
