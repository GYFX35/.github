# Integrating Flutterwave for Dropshipping Payments (Conceptual Guide)

This guide outlines the conceptual steps to integrate Flutterwave for processing payments for dropshipping products on this platform.

## 1. Flutterwave Merchant Account Setup

*   **Create an Account:** Before you can receive payments, you (the platform owner) must create a merchant account on the [Flutterwave website](https://www.flutterwave.com/).
*   **Business Verification:** Complete any required business verification (KYC/KYB) processes.
*   **Bank Account:** Link your bank account where Flutterwave will send your payouts.
*   **API Keys:** Once your account is set up and live, you will get access to your **Public Key** and **Secret Key**.
    *   **Public Key:** Used on the client-side (your React app) to initiate transactions.
    *   **Secret Key:** Used on the server-side for secure operations like verifying transactions. **NEVER expose your Secret Key in client-side code.**

## 2. Client-Side Integration (React App)

The goal is to trigger the Flutterwave payment modal when a user clicks the "Pay with Flutterwave" button on the `ProductDetailView.jsx` component. We'll use Flutterwave's Inline JavaScript SDK.

### a. Include Flutterwave SDK
You can include this in your main `public/index.html` file:
```html
<!-- public/index.html -->
<head>
  <!-- ... other head elements ... -->
  <script src="https://checkout.flutterwave.com/v3.js"></script>
</head>
```

### b. Modify `ProductDetailView.jsx` to Initiate Payment

The `onClick` handler of the "Pay with Flutterwave" button needs to be updated.

```jsx
// src/components/ProductDetailView.jsx (Conceptual onClick modification)
// ... other imports and component code ...

function ProductDetailView({ product }) {
  // ... styles and other logic ...

  const handleFlutterwavePayment = () => {
    if (!product) return;

    // **IMPORTANT**: In a real application:
    // 1. A unique transaction reference (tx_ref) should be generated securely
    //    on your backend server BEFORE calling this function.
    // 2. The actual amount and currency should be confirmed server-side if possible,
    //    or validated rigorously to prevent tampering.
    // 3. User details (email, name, phone) might be pre-filled from user's session/profile.

    const paymentData = {
      public_key: "YOUR_FLUTTERWAVE_PUBLIC_KEY", // Replace with your actual public key
      tx_ref: `product-${product.id}-${Date.now()}`, // **NEEDS SERVER-SIDE GENERATION FOR PRODUCTION**
      amount: product.price,
      currency: "USD", // Or your operating currency (e.g., NGN, KES, GHS)
      payment_options: "card,banktransfer,mobilemoney,ussd", // Customize as needed
      redirect_url: "YOUR_WEBSITE_ORDER_CONFIRMATION_PAGE_URL", // After payment, user is redirected here
      customer: {
        email: "customer-email@example.com", // Get from logged-in user or a form
        phone_number: "08012345678", // Optional, but good for some payment methods
        name: "Customer Name", // Get from logged-in user or a form
      },
      meta: {
        product_id: product.id,
        product_name: product.name,
        // Add any other metadata you want to track
      },
      customizations: {
        title: "Your Store Name",
        description: `Payment for ${product.name}`,
        logo: "YOUR_STORE_LOGO_URL", // Optional
      },
      callback: function (data) {
        console.log("Flutterwave payment successful:", data);
        // **CRITICAL**: This client-side callback is NOT for order fulfillment.
        // Fulfillment should ONLY happen after server-side verification via webhook.
        // You can redirect the user to a success page or show a success message here,
        // but inform them that the order is pending verification.
        // Example: window.location.href = paymentData.redirect_url + "?tx_ref=" + data.tx_ref;
        alert("Payment successful! Order processing. TxRef: " + data.tx_ref);
      },
      onclose: function() {
        // Called when the user closes the payment modal
        console.log("Flutterwave payment modal closed.");
        // You might want to inform the user that the payment was not completed.
      }
    };

    // Check if FlutterwaveCheckout function is available
    if (window.FlutterwaveCheckout) {
      window.FlutterwaveCheckout(paymentData);
    } else {
      alert("Flutterwave SDK not loaded. Please try again later.");
    }
  };

  // ... JSX for the component ...
  return (
    // ...
    <button
      style={flutterwaveButtonStyle}
      onClick={handleFlutterwavePayment} // Updated onClick handler
    >
      Pay with Flutterwave
    </button>
    // ...
  );
}

export default ProductDetailView;
```

**Key Client-Side Considerations:**
*   Replace `"YOUR_FLUTTERWAVE_PUBLIC_KEY"` with your actual Flutterwave public key.
*   `tx_ref`: This transaction reference **must be unique for every transaction**. While `Date.now()` helps here, for production, it's best to have your backend generate a truly unique ID.
*   `currency`: Ensure this matches the currency of your Flutterwave account and product pricing.
*   `redirect_url`: After payment, Flutterwave redirects the user here. This page should ideally show an order status (e.g., "Processing") and not confirm the order until your backend verifies it.
*   `customer` details: Populate these from your user's session or a checkout form.
*   `meta`: Useful for passing along product IDs or other info that you'll receive in webhooks.
*   `callback`: The client-side callback is useful for updating the UI (e.g., redirecting) but **NEVER for fulfilling the order**.

## 3. Server-Side Requirements (Absolutely Crucial)

A backend server is essential for secure and reliable payment processing with Flutterwave. **This project currently does not have a backend.** You would need to build this separately (e.g., using Node.js, Python/Django, Ruby on Rails, PHP/Laravel, etc.).

### a. Generate Unique Transaction References (`tx_ref`)
Before initiating a payment on the client-side, your client could make a request to your server. The server would generate a unique `tx_ref`, possibly store initial order details with a "pending" status, and then return this `tx_ref` to the client to use with `FlutterwaveCheckout`.

### b. Webhook Endpoint for Payment Verification
Flutterwave uses webhooks to notify your server about payment events (successful, failed, etc.).

*   **Create an Endpoint:** Your server needs an HTTP endpoint (e.g., `/webhook/flutterwave`) that Flutterwave can send POST requests to.
*   **Configure Webhook URL in Flutterwave Dashboard:** Add this endpoint URL in your Flutterwave merchant dashboard.
*   **Secure Your Webhook (Highly Recommended):**
    *   **Secret Hash:** Set up a "secret hash" in your Flutterwave dashboard. Flutterwave will include a `verify-hash` header in webhook requests. Your server must calculate the hash from the webhook payload using your secret hash and compare it to the one sent by Flutterwave to ensure the request is genuinely from them.
*   **Process Webhook Data:**
    *   When your endpoint receives a webhook:
        1.  Verify the secret hash (if configured).
        2.  Extract the transaction details from the webhook payload, especially the `tx_ref` and `status`.
        3.  **Verify with Flutterwave API:** Even after a successful webhook, make a server-to-server API call to Flutterwave's transaction verification endpoint (`https://api.flutterwave.com/v3/transactions/{TRANSACTION_ID_OR_TX_REF}/verify`) using your **Secret Key** in the Authorization header. This is the definitive way to confirm the payment status.
        4.  If verified successfully:
            *   Update your database: Mark the order as "paid."
            *   Trigger fulfillment: Start your dropshipping order process with your supplier.
            *   Send order confirmation email to the customer.
        5.  If verification fails or status is not "successful": Log the event, potentially update order status to "failed."
    *   Always respond to Flutterwave's webhook request with a `200 OK` status quickly, even if your internal processing takes longer (do that asynchronously).

### c. Security
*   **Never expose your Flutterwave Secret Key on the client-side.** All API calls requiring the secret key must be made from your server.
*   Validate all data received from the client before processing payments.
*   Protect your webhook endpoint (e.g., using the secret hash verification).

## 4. Overall Payment Workflow Summary

1.  **User:** Clicks "Pay with Flutterwave" on your website.
2.  **Client (React App):** (Ideally) Requests a unique `tx_ref` from your server.
3.  **Server:** Generates `tx_ref`, stores pending order, returns `tx_ref` to client.
4.  **Client (React App):** Calls `FlutterwaveCheckout()` with `public_key`, `tx_ref`, amount, customer details, etc.
5.  **User:** Completes payment on Flutterwave's secure modal/page.
6.  **Flutterwave:** Redirects user to your `redirect_url` (client-side).
7.  **Client (React App):** Shows a "payment processing" or "order pending confirmation" message.
8.  **Flutterwave:** Sends a webhook notification to your server's webhook endpoint.
9.  **Server:**
    *   Verifies the webhook's authenticity (e.g., using secret hash).
    *   Calls Flutterwave's API (using **Secret Key**) to verify the transaction status using the `tx_ref` from the webhook.
    *   If payment is confirmed: Updates order status in database, triggers dropshipping fulfillment, sends confirmation email.
    *   Responds `200 OK` to Flutterwave's webhook.

This conceptual guide should provide a solid foundation for planning your Flutterwave integration. Remember that the server-side component is critical for a secure and functional dropshipping payment system.
