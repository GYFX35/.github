from fastapi import FastAPI, File, UploadFile, HTTPException
from typing import Dict, Any
import uuid
import io
from PIL import Image

# Import logic
from .document_processor import process_document_image #, extract_face_from_image_data # Not used directly by main yet
from .liveness_checker import perform_mock_liveness_check
from .face_matcher import perform_mock_face_match

app = FastAPI(title="Citizen Assurance IDV Prototype", version="0.1.0-alpha")

# In-memory storage for session data (for prototype purposes)
# In a real app, use a database (e.g., Redis, PostgreSQL)
sessions: Dict[str, Dict[str, Any]] = {}

@app.post("/verify/document", tags=["Verification"])
async def verify_document_endpoint(file: UploadFile = File(...)):
    """
    Endpoint to upload an ID document image for verification.
    Simulates document processing, OCR, mock authenticity checks, and face extraction.
    """
    session_id = str(uuid.uuid4())
    sessions[session_id] = {"status": "pending_document_processing"}

    try:
        image_bytes = await file.read()

        # Simulate image processing using Pillow to ensure it's a valid image
        try:
            img = Image.open(io.BytesIO(image_bytes))
            img.verify() # Verify image integrity
            # Re-open after verify
            img = Image.open(io.BytesIO(image_bytes))
            img_format = img.format
            sessions[session_id]["doc_image_format"] = img_format
        except Exception as e:
            sessions[session_id]["status"] = "error_invalid_image"
            sessions[session_id]["error_detail"] = f"Invalid image file: {str(e)}"
            raise HTTPException(status_code=400, detail=f"Invalid image file: {str(e)}")

        # --- Call Document Processing Logic ---
        # This will be a mix of actual operations (basic OCR, basic face detection)
        # and mocked operations (authenticity checks)
        processing_results = await process_document_image(image_bytes)

        sessions[session_id]["document_processing_results"] = processing_results
        sessions[session_id]["status"] = "document_processed" # Next step would be liveness

        # For now, extract face data and store it (conceptually)
        # In a real app, this might be stored more securely or passed differently
        if processing_results.get("face_image_bytes"):
            sessions[session_id]["doc_face_image_bytes"] = processing_results["face_image_bytes"]
            # To prevent sending large byte strings in every status update, remove from main results
        # But ensure it's still available in the main session object if needed by other processes
        if "face_image_bytes" in processing_results and processing_results["face_image_bytes"] is None:
             del processing_results["face_image_bytes"] # remove if it's None after processing
        elif "face_image_bytes" in processing_results and processing_results["face_image_bytes"] is not None:
            # Keep it in session, but don't return it in *this* response directly if large
            pass # It's already in sessions[session_id]["doc_face_image_bytes"]

        # Make a copy of processing_results for the response, excluding the raw face bytes
        response_processing_results = processing_results.copy()
        if "face_image_bytes" in response_processing_results:
            del response_processing_results["face_image_bytes"]


        return {
            "session_id": session_id,
            "status": sessions[session_id]["status"], # Use current session status
            "message": "Document processed. Next step: liveness check.",
            "document_analysis": response_processing_results
        }

    except Exception as e:
        sessions[session_id]["status"] = "error_processing_document"
        sessions[session_id]["error_detail"] = str(e)
        # Log the full error server-side for debugging
        print(f"Error processing document for session {session_id}: {e}")
        raise HTTPException(status_code=500, detail=f"Error processing document: {str(e)}")


@app.get("/verify/status/{session_id}", tags=["Verification"])
async def get_verification_status(session_id: str):
    """
    Get the current status and results of a verification session.
    """
    session_data = sessions.get(session_id)
    if not session_data:
        raise HTTPException(status_code=404, detail="Session not found")

    # Avoid sending raw image bytes in status if they exist
    # Frontend would need a separate endpoint or way to display images if needed
    display_data = session_data.copy()
    if "doc_face_image_bytes" in display_data:
        display_data["doc_face_present"] = True
        # Do not delete from display_data if you want to confirm its presence,
        # but ensure it's not the actual bytes if it's too large for a status summary.
        # For this prototype, knowing it's present is enough for the status.
        display_data["doc_face_image_bytes_size"] = len(session_data["doc_face_image_bytes"]) if session_data.get("doc_face_image_bytes") else 0
        del display_data["doc_face_image_bytes"]

    if "live_face_image_bytes" in display_data: # For future liveness step
        display_data["live_face_present"] = True
        display_data["live_face_image_bytes_size"] = len(session_data["live_face_image_bytes"]) if session_data.get("live_face_image_bytes") else 0
        del display_data["live_face_image_bytes"]

    return {"session_id": session_id, "data": display_data}


@app.post("/verify/liveness", tags=["Verification"])
async def verify_liveness_endpoint(session_id: str, liveness_input: Dict[str, Any] = {}):
    """
    Endpoint to submit (mocked) liveness check data.
    This will trigger mocked liveness check and then mocked face matching.
    `liveness_input` is a placeholder for any data a real liveness check might send.
    Example: `{"simulated_liveness_type": "active_blink"}`
    """
    session_data = sessions.get(session_id)
    if not session_data:
        raise HTTPException(status_code=404, detail="Session not found")

    if session_data.get("status") != "document_processed":
        raise HTTPException(status_code=400, detail=f"Liveness check cannot be performed at this stage. Current status: {session_data.get('status')}")

    session_data["status"] = "pending_liveness_check"

    try:
        liveness_passed, liveness_message, mock_live_face_bytes = await perform_mock_liveness_check(session_id, liveness_submission=liveness_input)
        session_data["liveness_check_results"] = {"passed": liveness_passed, "message": liveness_message}

        if liveness_passed and mock_live_face_bytes:
            session_data["live_face_image_bytes"] = mock_live_face_bytes
            session_data["status"] = "liveness_check_passed"

            # --- Perform Face Matching ---
            doc_face_bytes = session_data.get("doc_face_image_bytes")
            if not doc_face_bytes:
                session_data["status"] = "error_missing_doc_face_for_matching"
                session_data["final_verification_status"] = "Not Verified (Internal Error)"
                raise HTTPException(status_code=500, detail="Document face image not found in session for matching.")

            face_match_results = await perform_mock_face_match(session_id, doc_face_bytes, mock_live_face_bytes)
            session_data["face_match_results"] = face_match_results

            # --- Final Mocked Decision Logic ---
            # This is a very simplified decision tree
            doc_auth_ok = session_data.get("document_processing_results", {}).get("mock_security_feature_ok", False)
            # Add other checks from document_processing_results if needed, e.g., OCR quality

            if doc_auth_ok and liveness_passed and face_match_results.get("match_status"):
                session_data["final_verification_status"] = "Verified"
                session_data["status"] = "verification_complete_verified"
            else:
                session_data["final_verification_status"] = "Not Verified"
                session_data["status"] = "verification_complete_not_verified"
                # You could add more granular error states here
                if not doc_auth_ok:
                     session_data["rejection_reason"] = "Document authenticity check failed."
                elif not liveness_passed:
                     session_data["rejection_reason"] = "Liveness check failed."
                elif not face_match_results.get("match_status"):
                     session_data["rejection_reason"] = "Face match failed."

        else: # Liveness failed
            session_data["status"] = "liveness_check_failed"
            session_data["final_verification_status"] = "Not Verified (Liveness Failed)"
            session_data["rejection_reason"] = liveness_message


        return {
            "session_id": session_id,
            "liveness_check_passed": liveness_passed,
            "liveness_message": liveness_message,
            "face_match_results": session_data.get("face_match_results", None),
            "overall_status": session_data.get("status"),
            "final_verification_status": session_data.get("final_verification_status")
        }

    except Exception as e:
        session_data["status"] = "error_processing_liveness"
        session_data["error_detail"] = str(e)
        print(f"Error processing liveness for session {session_id}: {e}")
        raise HTTPException(status_code=500, detail=f"Error processing liveness: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    # This will likely fail if pip/uvicorn is not installed correctly
    # For local dev: uvicorn main:app --reload --app-dir citizen_assurance_idv --port 8008
    print("Attempting to run FastAPI app with Uvicorn on port 8008.")
    print("If Uvicorn or other dependencies are not installed due to earlier pip issues, this will fail.")
    print("To run manually if dependencies are somehow available: uvicorn citizen_assurance_idv.main:app --reload --port 8008")

    # We expect this to fail if the environment is not set up.
    # If it does, the user will need to help fix the environment.
    try:
        # Note: Changed to "citizen_assurance_idv.main:app" to be runnable from repo root
        uvicorn.run("citizen_assurance_idv.main:app", host="0.0.0.0", port=8008, reload=True, app_dir="/workspace")
    except ImportError as e:
        print(f"Failed to import uvicorn or other dependencies: {e}")
        print("Please ensure FastAPI, Uvicorn, and other dependencies from requirements.txt are installed in your Python environment.")
        print("You might need to run: pip install -r citizen_assurance_idv/requirements.txt")
    except Exception as e:
        print(f"An error occurred trying to run Uvicorn: {e}")
