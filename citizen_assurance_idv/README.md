# Citizen Assurance - Digital Identity Verification (IDV) Prototype

**Version: 0.1.0-alpha (Conceptual Prototype)**

## ⚠️ Important Disclaimer ⚠️

This project is a **highly conceptual and simplified prototype** created for illustrative and educational purposes to explore the *idea* of a Digital Identity Verification (IDV) system.

**It is NOT:**
*   A secure system.
*   Production-ready.
*   Compliant with any identity verification standards (e.g., NIST IAL, eIDAS).
*   A reliable method for actual identity verification.
*   An ethical or privacy-preserving solution without significant further work.

Many core components (liveness detection, document authenticity, face matching) are **heavily mocked or simulated**. Real-world IDV systems are extremely complex and require deep expertise in security, computer vision, AI ethics, and legal/regulatory compliance.

**DO NOT USE THIS PROTOTYPE FOR ANY REAL-WORLD IDENTITY VERIFICATION OR SENSITIVE DATA PROCESSING.**

## 1. Project Overview

This prototype explores the basic workflow of a digital identity verification process. It simulates:
*   Uploading an ID document image.
*   Performing basic Optical Character Recognition (OCR) on the document.
*   Mocked checks for document authenticity.
*   Extracting a face from the document image.
*   A mocked liveness check to ensure the user is present.
*   A mocked face comparison between the document face and a (simulated) live selfie.

The backend is built using FastAPI (Python).

## 2. Features (and Mocked Components)

*   **Document Upload Endpoint:** Accepts an image file.
*   **Basic OCR:** Attempts to extract text from the document image using `pytesseract`. (Highly dependent on image quality and Tesseract's capabilities).
*   **Mocked Document Authenticity Check:** Simulates checking if the document is genuine based on simple heuristics (e.g., presence of expected text fields).
*   **Face Detection from Document:** Attempts to find and extract a face from the uploaded ID image using the `face_recognition` library.
*   **Mocked Liveness Check:** Simulates a liveness detection process. The actual check is random or returns a predefined value.
*   **Mocked Face Matching:** Simulates the comparison of the face from the ID document with a (mocked) live selfie. The match decision is random or predefined.
*   **Session Management:** Basic in-memory session tracking for the verification steps.

## 3. Project Structure

```
citizen_assurance_idv/
├── main.py                 # FastAPI application, API endpoints, orchestration.
├── document_processor.py   # Logic for OCR, mock authenticity, document face extraction.
├── liveness_checker.py     # Mocked liveness check logic.
├── face_matcher.py         # Mocked face matching logic.
├── requirements.txt        # Python dependencies.
└── README.md               # This documentation file.
└── test_images/            # (User must create and add sample_id.png here)
```

## 4. Setup and Running (Aspirational)

**Current Status:** As of the last update, running this application is **blocked by unresolved Python environment issues** in the development sandbox, specifically preventing the installation of `pip` dependencies. The instructions below are how one *would* run it if the environment were functional.

**4.1. Prerequisites:**
*   Python 3.8+
*   **Tesseract OCR Engine:** This must be installed on your system.
    *   On Debian/Ubuntu: `sudo apt-get update && sudo apt-get install -y tesseract-ocr`
    *   On macOS (using Homebrew): `brew install tesseract`
    *   For other systems, refer to Tesseract documentation.
*   A sample ID image named `sample_id.png` (or similar, adjust code if name differs) placed in a `citizen_assurance_idv/test_images/` directory (you'll need to create this directory and add an image). **Use a fictional or sample ID image only.**

**4.2. Install Python Dependencies:**
Navigate to the repository root directory in your terminal.
```bash
# It's highly recommended to use a virtual environment
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate

pip install -r citizen_assurance_idv/requirements.txt
```
*(This step was failing in the development sandbox at the time of writing.)*

**4.3. Running the FastAPI Application:**
From the repository root directory:
```bash
uvicorn citizen_assurance_idv.main:app --host 0.0.0.0 --port 8008 --reload
```
*(This command would fail if `uvicorn` and other dependencies are not installed.)*

If running successfully, the API documentation will be available at `http://localhost:8008/docs`.

## 5. API Endpoints

*   `POST /verify/document`
    *   **Request:** `multipart/form-data` with an image file (`file`).
    *   **Response:** JSON with `session_id`, initial processing status, and basic document analysis (OCR text, mock authenticity results).
*   `POST /verify/liveness`
    *   **Request:** JSON body (optional, for mock control e.g. `{"simulated_liveness_type": "active_blink"}`). Query parameter `session_id` is required.
    *   **Response:** JSON with liveness status, mock face match results, and final verification status.
*   `GET /verify/status/{session_id}`
    *   **Request:** Path parameter `session_id`.
    *   **Response:** JSON with the current state and results of the verification session.

## 6. Key Limitations & Disclaimers (Reiteration)

*   **Conceptual Prototype:** This is not a functional, secure, or reliable IDV system.
*   **Heavily Mocked:** Core verification steps (authenticity, liveness, face match) are simulated.
*   **Untested Runtime:** Due to sandbox environment issues, the application could not be fully run and tested during development. Dependencies may not install, and runtime errors are likely until the environment is fixed.
*   **OCR Limitations:** `pytesseract`'s accuracy on complex ID documents without extensive image pre-processing will be low.
*   **No Real Security Measures:** No data encryption (beyond HTTPS if Uvicorn is configured with it), no robust input validation beyond FastAPI's basics, no protection against spoofing, etc.
*   **Basic Error Handling:** Error handling is rudimentary.
*   **In-Memory Sessions:** Session data is lost when the application restarts.

## 7. Security, Privacy, and Ethical Considerations

Developing a real IDV system requires extreme attention to:
*   **Data Security:** Protecting sensitive PII at rest and in transit.
*   **Privacy:** Adherence to data protection regulations (GDPR, CCPA, etc.), data minimization, user consent, clear policies.
*   **Ethical AI:** Ensuring fairness, mitigating bias in AI models (especially face recognition), providing transparency, and offering recourse for users.
*   **Robustness:** Against various attack vectors (e.g., presentation attacks, deepfakes).

This prototype does not address these critical areas sufficiently for any practical application.
```
