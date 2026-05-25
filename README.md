# AI Marketer Agent (AI Nexus Platform)

The AI Marketer Agent, evolving into the **AI Nexus Platform**, is an AI-powered ecosystem designed to help companies and developers optimize their digital presence. From affiliate marketing and ad campaign optimization to automated software engineering and system analysis, AI Nexus leverages state-of-the-art LLMs and automation tools to drive performance.

## Project Vision: TAM, SAM, SOM

### TAM (Total Addressable Market) - ~$100B+
The global market for AI in marketing, advertising, and software development automation. As businesses transition to AI-first strategies, the total potential for integrated optimization and automation tools spans across all digital-native enterprises.

### SAM (Serviceable Addressable Market) - ~$10B
Small and Medium-sized Businesses (SMBs), digital marketing agencies, and independent software developers. These entities require high-performance AI tools but often lack the resources to build custom internal solutions.

### SOM (Serviceable Obtainable Market) - ~$500M
Independent affiliate marketers, niche e-commerce brands, and agile dev teams looking for an all-in-one platform that combines data-driven marketing insights (Google Ads, Facebook FAN) with AI-assisted development (automated code generation, debugging, and system analysis).

---

## Tech Stack & Tools

*   **Backend:** Python (Flask [async])
*   **Frontend:** React, Vite, Tailwind CSS (PWA enabled)
*   **AI Models:** Google Gemini 1.5 Flash (Multimodal: Text + Vision)
*   **Integrations & Automation:**
    *   **Gumloop:** For complex AI workflow orchestration.
    *   **n8n:** For workflow automation and webhook-driven triggers.
    *   **Lamatic.ai:** For managed AI flow execution.
    *   **Marketing APIs:** Facebook Business SDK (Audience Network), Google Ads API, Mailchimp Marketing API.
*   **Analysis Tools:** BeautifulSoup4 (Web Scraping), httpx (Async HTTP), Pillow (Image processing).

---

## Current Project Status

### Phase 1: Core Data & Dashboards (Completed)
*   **CSV Data Upload:** Process affiliate and ad campaign performance data via CSV.
*   **Basic Dashboards:** Summary statistics (EPC, CTR, CPC, CPA) and top-performer tracking for affiliates and ads.

### Phase 2: AI Services & Automation (Active)
*   **AI Services Dashboard:**
    *   **Software Engineer:** Automated generation of Websites, Games, Apps, and Backend services.
    *   **Debugger:** Expert-level code analysis and bug fixing.
    *   **Marketer:** AI-generated social media posts and ad copy optimization.
    *   **System Analyzer:** Async website crawling for broken links and performance bottlenecks.
*   **Business Chimp:** Integration with Mailchimp for automated campaign analysis and "Business Chimp" persona-driven content generation.
*   **Cloud Optimization:** AI-driven cost and performance recommendations for AWS, GCP, and SaaS providers.
*   **Automation Hub:** Integration with Gumloop, n8n, and Lamatic.ai for running complex automation flows.

### Phase 3: PWA & Multimodal Interaction (Completed)
*   **Installable Web App:** Full PWA support with manifest and service worker caching for offline access.
*   **Multimodal Gemini Proxy:** Backend proxy for Gemini 1.5 Flash allowing users to submit text and images for AI analysis.

---

## Setup and Running

1.  **Clone the repository.**
2.  **Install dependencies:**
    ```bash
    pip install -r requirements.txt
    npm install
    ```
3.  **Run the application:**
    *   **Backend:** `python run.py` (Starts Flask on port 5000)
    *   **Frontend:** `npm start` (Starts Vite on port 3000)
    The application will be accessible at `http://localhost:3000`.

## Deployment

This project is configured for **Google Cloud Run** using **Cloud Build**.

```bash
gcloud builds submit --config cloudbuild.yaml
```

This automates the multi-stage Docker build, compiling the React frontend and serving it via the Flask backend in a single container.

---

## CSV File Formats

Refer to the original documentation for `Affiliate Performance` and `Ad Campaign Performance` CSV structures. Ensure headers match exactly for successful processing.
