## Agent Instructions for AI Nexus Platform (formerly AI Marketer)

Welcome, Jules! This file provides guidance for working on the AI Nexus Platform.

### Project Overview
The AI Nexus Platform is an integrated AI-powered ecosystem for digital marketing optimization, automated software engineering, and business automation. It combines a Flask backend with a React frontend (PWA).

### Development Guidelines
1.  **Architecture:**
    *   **Monorepo Structure:** Backend resides in `app/`, Frontend source in `src/`.
    *   **Flask (Backend):** Uses the application factory pattern (`app/__init__.py`). Routes are in `app/routes.py` using Blueprints (`main_bp`). Business logic and AI service integrations are in `app/services.py`.
    *   **React (Frontend):** Vite-based project. Built artifacts are served by Flask from the `dist/` directory (mapped to `/` in production).
2.  **AI & Automation Tools:**
    *   **Gemini AI:** Primary LLM for code generation, marketing copy, and multimodal (text+image) analysis.
    *   **Automation SDKs:** Uses `gumloop` SDK, `httpx` for n8n/Lamatic REST calls.
    *   **Marketing APIs:** Facebook Business SDK, Google Ads API, Mailchimp API.
3.  **PWA & Static Assets:**
    *   The project is a Progressive Web App. Vite handles PWA generation.
    *   Ensure any new core routes or assets are considered for the PWA caching strategy in `vite.config.js`.
4.  **Testing & Verification:**
    *   Always verify frontend changes using Playwright if possible.
    *   Backend logic in `app/services.py` should be tested for various API response scenarios (including mocks).

### Current Status & Roadmap
*   **Completed:** Core CSV data processing, PWA setup, Gemini proxy, Business Chimp (Mailchimp), Cloud Optimization mock services.
*   **Active:** Expanding AI Services (Software Engineer, Debugger, System Analyzer), refining automation hub (Gumloop, n8n, Lamatic).
*   **Next:** Real-time data sync with marketing APIs (moving beyond mocks), advanced multimodal analysis for ad creatives.

### Security Note
*   **API Keys:** All keys (Google, Facebook, Gumloop, etc.) must be handled server-side. Never expose keys in the frontend or commit them to the repository. Use placeholders or environment variables.

### Conflict Resolution
*   If instructions in this file conflict with the root `README.md`, the `README.md` provides the high-level project vision and user-facing status, while this `AGENTS.md` provides implementation-specific guidance for AI agents.
