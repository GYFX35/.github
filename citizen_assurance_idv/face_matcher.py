from typing import Dict, Optional, Tuple
import random

# In a real system, this would involve:
# 1. Loading face images (from document and live selfie).
# 2. Converting faces to numerical embeddings using a deep learning model.
# 3. Calculating the distance (e.g., cosine distance or Euclidean distance) between embeddings.
# 4. Comparing the distance to a threshold to decide if it's a match.
# For this prototype, it's entirely mocked.

async def perform_mock_face_match(
    session_id: str,
    doc_face_image_bytes: Optional[bytes],
    live_face_image_bytes: Optional[bytes]
) -> Dict:
    """
    Performs a MOCKED face match between a face from an ID document
    and a face from a (supposedly) live selfie.

    Args:
        session_id: The ID of the current verification session.
        doc_face_image_bytes: Byte representation of the face extracted from the ID document.
        live_face_image_bytes: Byte representation of the face from the (mocked) liveness check.

    Returns:
        A dictionary containing match status and a mock confidence score.
        e.g., {"match_status": True, "confidence": 0.95, "message": "Faces matched."}
    """
    print(f"[Session: {session_id}] Performing MOCKED face match...")

    results = {
        "match_status": False,
        "confidence": 0.0,
        "message": "Face match not performed or failed."
    }

    if not doc_face_image_bytes:
        results["message"] = "Cannot perform face match: Document face image is missing."
        print(f"[Session: {session_id}] Mocked face match: FAILED (Missing document face).")
        return results

    if not live_face_image_bytes:
        results["message"] = "Cannot perform face match: Live face image is missing (liveness likely failed or no selfie)."
        print(f"[Session: {session_id}] Mocked face match: FAILED (Missing live face).")
        return results

    # Mock logic:
    # For this prototype, we'll just simulate a match with a random confidence.
    # We are not actually comparing the image bytes.
    # A slightly more advanced mock could check if the placeholder bytes are identical,
    # but that's not very meaningful.

    # Simulate some basic "processing"
    doc_face_valid = len(doc_face_image_bytes) > 0
    live_face_valid = len(live_face_image_bytes) > 0

    if doc_face_valid and live_face_valid:
        # 85% chance of a "match" in the mock
        if random.random() > 0.15:
            results["match_status"] = True
            results["confidence"] = round(random.uniform(0.75, 0.99), 2) # Mock confidence
            results["message"] = f"Mocked face match: SUCCESSFUL with confidence {results['confidence']}."
            print(f"[Session: {session_id}] Mocked face match: SUCCESSFUL (Confidence: {results['confidence']}).")
        else:
            results["match_status"] = False
            results["confidence"] = round(random.uniform(0.10, 0.60), 2) # Mock confidence for a non-match
            results["message"] = f"Mocked face match: FAILED with confidence {results['confidence']}."
            print(f"[Session: {session_id}] Mocked face match: FAILED (Confidence: {results['confidence']}).")
    else:
        results["message"] = "Mocked face match: FAILED due to invalid input face data (e.g., empty bytes)."
        print(f"[Session: {session_id}] Mocked face match: FAILED (Invalid input face data).")

    return results

# Example of how it might be called (conceptual)
if __name__ == "__main__":
    # This part is just for illustration
    import asyncio
    async def test_mock_face_match():
        session_id_test = "test-fm-session-456"

        # Simulate having extracted face bytes
        mock_doc_face = b"face_bytes_from_document_abc"
        mock_live_selfie = b"face_bytes_from_live_selfie_xyz"

        match_results = await perform_mock_face_match(session_id_test, mock_doc_face, mock_live_selfie)
        print(f"Test Run 1 Result: {match_results}")

        match_results_no_live = await perform_mock_face_match(session_id_test, mock_doc_face, None)
        print(f"Test Run 2 Result (No Live Face): {match_results_no_live}")

        match_results_no_doc = await perform_mock_face_match(session_id_test, None, mock_live_selfie)
        print(f"Test Run 3 Result (No Doc Face): {match_results_no_doc}")

    asyncio.run(test_mock_face_match())
```
