# AI Nexus Platform

This repository contains the AI Nexus platform, split into a frontend React application and a backend Flask API.

## Repository Structure

- `frontend/`: React + Vite application. Deployed to GitHub Pages.
- `backend/`: Flask API for AI services and data processing.
- `ai-nexus-platform/`: Astro project for static legal pages.
- Other directories (`ARArchitectureGame`, `Blockchain`, etc.) are part of the broader AI Nexus ecosystem.

## Frontend (GitHub Pages)

The frontend is a modern React application powered by Vite. It provides the user interface for all AI Nexus services.

### Deployment

The frontend is automatically built and deployed to GitHub Pages via GitHub Actions whenever changes are pushed to the `main` branch.

**View the live site:** [https://GYFX35.github.io/](https://GYFX35.github.io/) (Note: Ensure GitHub Pages is configured to use the `gh-pages` branch or the deployment artifact from Actions).

### Local Development

1.  Navigate to the `frontend` directory:
    ```bash
    cd frontend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Start the development server:
    ```bash
    npm start
    ```
    The app will be available at `http://localhost:3000`.

## Backend (Flask API)

The backend provides AI-powered services, including script generation using Google Gemini and integration with marketing APIs (Facebook, Google Ads, Mailchimp).

### Local Development & Setup

1.  Navigate to the `backend` directory:
    ```bash
    cd backend
    ```
2.  Create and activate a virtual environment:
    ```bash
    python -m venv venv
    source venv/bin/activate  # On Windows: venv\Scripts\activate
    ```
3.  Install dependencies:
    ```bash
    pip install -r requirements.txt
    ```
4.  Run the application:
    ```bash
    python run.py
    ```
    The API will be accessible at `http://127.0.0.1:5000/`.

### Configuration (Facebook & Google Ads)

To use the full features of the Ads Optimization dashboard, you'll need to configure your own API credentials.

**Setting up Facebook Audience Network Integration:**
1.  Create a Facebook Developer App at [https://developers.facebook.com/apps/](https://developers.facebook.com/apps/).
2.  Configure the OAuth Redirect URI to `http://localhost:5000/fb_oauth_callback`.
3.  Update the placeholders in `backend/app/__init__.py` with your `FACEBOOK_APP_ID` and `FACEBOOK_APP_SECRET`.

**Setting up Google Ads Integration:**
1.  Create a Google Cloud Project and enable the Google Ads API.
2.  Configure OAuth 2.0 Credentials (Web application) in the Google Cloud Console.
3.  Add `http://localhost:5000/google_ads_oauth_callback` as an Authorized redirect URI.
4.  Obtain a Developer Token from your Google Ads Manager Account.
5.  Update the placeholders in `backend/app/__init__.py` with your credentials.

## Features

- **AI Video Content Generator:** Generate educational video scripts from topics or images.
- **Ads Optimization:** Integrate with Facebook Audience Network and Google Ads for performance tracking.
- **Business Chimp:** AI-powered marketing copy generation for Mailchimp campaigns.
- **Cloud Optimization:** AI-driven insights for managing multi-cloud resource utilization.

## PWA Support

The main frontend is a Progressive Web App (PWA). It can be installed on compatible devices and provides offline support for core assets via service workers.
