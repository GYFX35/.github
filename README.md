# AI Marketer Agent

This project is an AI-powered agent designed to help companies optimize their affiliate marketing and advertising campaigns for improved visibility and performance.

## Features (Planned)

*   **Affiliate Marketing Optimization:**
    *   Identifying top-performing affiliates.
    *   Suggesting new affiliate partners based on criteria.
    *   Tracking conversion rates per affiliate.
    *   Optimizing commission structures.
*   **Ads Optimization:**
    *   A/B testing ad creatives.
    *   Keyword analysis and suggestion for PPC campaigns.
    *   Bid management for ad platforms.
    *   Audience segmentation and targeting recommendations.

## Tech Stack

*   Backend: Python (Flask)
*   Frontend: HTML5, CSS (basic styling)

## Current Features

### Phase 1: Core Data Aggregation & Basic Reporting
*   **CSV Data Upload:**
    *   Upload affiliate performance data via CSV.
    *   Upload ad campaign performance data via CSV.
*   **Basic Dashboards:**
    *   View summary statistics for uploaded affiliate data (total clicks, conversions, commission, EPC).
    *   View top-performing affiliates.
    *   View all uploaded affiliate data in a table.
    *   View summary statistics for uploaded ad campaign data (total impressions, clicks, cost, conversions, CTR, CPC, CPA).
    *   View top-performing ad campaigns.
    *   View all uploaded ad campaign data in a table.

### PWA Phase 1: Basic Installability & Offline Static Assets
*   **Installable:** The application can be installed on compatible devices (desktops and mobiles).
*   **Offline Access:** Core application pages and static assets are cached, allowing for basic offline browsing. An offline fallback page is provided if a non-cached page is accessed while offline.
*   **Web App Manifest:** Includes `manifest.json` for PWA metadata.
*   **Service Worker:** Uses `sw.js` for caching and offline capabilities.

### Facebook Audience Network (FAN) Integration - Phase 1
*   **OAuth 2.0 Connection:** Users can connect their Facebook account to authorize the application to access FAN data.
*   **Mock Data Display:** The Ads Optimization dashboard can display a list of (mock) FAN ad placements and their (mock) performance data (revenue, impressions, eCPM, fill rate) after connecting.
*   **Secure Token Handling:** Access tokens are stored in the user's session (note: for production, more robust database storage is recommended).
*   **Note:** This phase uses MOCK data for display. Actual API calls to fetch live FAN data will be implemented in a subsequent phase.

### Google Ads API Integration - Phase 1
*   **OAuth 2.0 Connection:** Users can connect their Google account to authorize the application to access Google Ads data.
*   **Accessible Customer Listing:** After connecting, the Ads Optimization dashboard can display a list of Google Ads customer accounts (Customer ID, Descriptive Name, Manager Status, Test Account Status) accessible to the authenticated user.
*   **Secure Token Handling:** Refresh tokens are stored in the user's session (note: for production, more robust database storage is recommended). Access tokens are managed by the client library using the refresh token.

## Setup and Running

1.  **Clone the repository (if applicable).**
2.  **Create and activate a virtual environment (recommended):**
    ```bash
    python -m venv venv
    source venv/bin/activate  # On Windows: venv\Scripts\activate
    ```
3.  **Install dependencies:**
    ```bash
    pip install -r requirements.txt
    ```
4.  **Run the application:**
    ```bash
    python run.py
    ```
    The application will be accessible at `http://127.0.0.1:5000/`.

**Setting up Facebook Audience Network Integration:**
1.  **Create a Facebook Developer App:**
    *   Go to [https://developers.facebook.com/apps/](https://developers.facebook.com/apps/).
    *   Create a new app or use an existing one.
    *   Add the "Audience Network" product to your app.
2.  **Configure OAuth Redirect URI:**
    *   In your Facebook App settings, under "Facebook Login" -> "Settings" (or similar section for OAuth client settings), add a "Valid OAuth Redirect URI".
    *   For local development, this should be `http://localhost:5000/fb_oauth_callback` (matching `FACEBOOK_REDIRECT_URI` in the app's config).
3.  **Set Environment Variables/Configuration:**
    *   The application expects `FACEBOOK_APP_ID`, `FACEBOOK_APP_SECRET`, and `FACEBOOK_REDIRECT_URI` to be configured.
    *   Currently, these are placeholders in `app/__init__.py`. For local development, you can replace these placeholders directly.
    *   **IMPORTANT FOR PRODUCTION:** Use environment variables or a secure configuration management system for these credentials. Do not commit actual secrets to your repository.
    *   Example for placeholders in `app/__init__.py`:
        ```python
        app.config.from_mapping(
            # ... other configs ...
            FACEBOOK_APP_ID='YOUR_ACTUAL_FACEBOOK_APP_ID',
            FACEBOOK_APP_SECRET='YOUR_ACTUAL_FACEBOOK_APP_SECRET',
            FACEBOOK_REDIRECT_URI='http://localhost:5000/fb_oauth_callback', # Or your deployed URI
        )
        ```
4.  **Required Scopes:** The application requests `read_audience_network_insights` and `ads_read` scopes. Ensure your app has appropriate permissions if more are needed later.

**Setting up Google Ads Integration:**
1.  **Create a Google Cloud Project:**
    *   Go to the [Google Cloud Console](https://console.cloud.google.com/).
    *   Create a new project or select an existing one.
2.  **Enable Google Ads API:**
    *   In your GCP project, navigate to "APIs & Services" -> "Library".
    *   Search for "Google Ads API" and enable it.
3.  **Configure OAuth Consent Screen:**
    *   Navigate to "APIs & Services" -> "OAuth consent screen".
    *   Configure it as required (User Type, App name, support email, authorized domains).
4.  **Create OAuth 2.0 Credentials:**
    *   Navigate to "APIs & Services" -> "Credentials".
    *   Click "Create Credentials" -> "OAuth client ID".
    *   Select "Web application" as the application type.
    *   Add an "Authorized redirect URI": For local development, use `http://localhost:5000/google_ads_oauth_callback` (matching `GOOGLE_ADS_REDIRECT_URI` in the app's config).
    *   Note the generated Client ID and Client Secret.
5.  **Obtain a Developer Token:**
    *   Apply for a developer token for the Google Ads API through the Google Ads UI (typically from an MCC/manager account). This token needs at least Basic Access, or Standard Access for production use.
6.  **Set Environment Variables/Configuration:**
    *   The application expects `GOOGLE_ADS_CLIENT_ID`, `GOOGLE_ADS_CLIENT_SECRET`, `GOOGLE_ADS_DEVELOPER_TOKEN`, and `GOOGLE_ADS_REDIRECT_URI` to be configured.
    *   These are currently placeholders in `app/__init__.py`. Replace them with your actual credentials for local development.
    *   **IMPORTANT FOR PRODUCTION:** Use environment variables or a secure configuration system.
    *   Example in `app/__init__.py`:
        ```python
        app.config.from_mapping(
            # ... other configs ...
            GOOGLE_ADS_CLIENT_ID='YOUR_ACTUAL_GOOGLE_CLIENT_ID',
            GOOGLE_ADS_CLIENT_SECRET='YOUR_ACTUAL_GOOGLE_CLIENT_SECRET',
            GOOGLE_ADS_DEVELOPER_TOKEN='YOUR_ACTUAL_DEVELOPER_TOKEN',
            GOOGLE_ADS_REDIRECT_URI='http://localhost:5000/google_ads_oauth_callback',
        )
        ```
7.  **Login Customer ID (Optional but Recommended):**
    *   If you are accessing accounts through a Manager Account (MCC), you might need to set `GOOGLE_ADS_LOGIN_CUSTOMER_ID` in the config to your MCC ID (without hyphens). The `google-ads` library uses this for some calls if provided. The current implementation lists all accessible accounts without necessarily needing this globally set first, but it's good practice for focused operations.

**Note on PWA Testing:**
*   For PWA features (like installation and service worker caching) to work correctly, it's often best to serve the application over HTTPS, even in development if possible (e.g., using a self-signed certificate or a tool like `mkcert`). However, `http://localhost` is typically treated as a secure context by browsers for PWA development.
*   Use browser developer tools (Application tab -> Manifest, Service Workers, Cache Storage) to inspect PWA components.
*   Lighthouse audits can help identify PWA compliance issues.

## CSV File Formats

For the CSV upload functionality, please ensure your files adhere to the following formats. The first row must be a header row with the exact column names as specified.

### Affiliate Performance CSV Format

*   **Required Columns:**
    *   `report_date`: Date of the report (YYYY-MM-DD).
    *   `affiliate_name`: Name of the affiliate (Text).
*   **Optional Columns:**
    *   `impressions`: Number of impressions (Integer).
    *   `clicks`: Number of clicks (Integer).
    *   `conversions`: Number of conversions (Integer).
    *   `commission_amount`: Total commission amount (Float, e.g., 123.45).

**Example `affiliate_data.csv`:**
```csv
report_date,affiliate_name,impressions,clicks,conversions,commission_amount
2023-10-01,Affiliate A,1000,100,10,50.00
2023-10-01,Affiliate B,2000,150,12,65.50
2023-10-02,Affiliate A,,,5,25.00
```

### Ad Campaign Performance CSV Format

*   **Required Columns:**
    *   `report_date`: Date of the report (YYYY-MM-DD).
    *   `campaign_name`: Name of the ad campaign (Text).
*   **Optional Columns:**
    *   `platform`: Advertising platform, e.g., "Google Ads", "Facebook Ads" (Text).
    *   `impressions`: Number of impressions (Integer).
    *   `clicks`: Number of clicks (Integer).
    *   `cost`: Total cost of the campaign for that period (Float, e.g., 200.75).
    *   `conversions`: Number of conversions (Integer).

**Example `ad_campaign_data.csv`:**
```csv
report_date,campaign_name,platform,impressions,clicks,cost,conversions
2023-10-01,Fall Sale Campaign,Google Ads,10000,500,250.00,50
2023-10-01,Brand Awareness Q4,Facebook Ads,50000,1000,300.50,10
2023-10-02,Fall Sale Campaign,Google Ads,12000,600,280.00,65
```
