import io
from PIL import Image, ImageFilter
import pytesseract
import face_recognition # Uses dlib for face detection
import numpy as np
import cv2 # OpenCV for image manipulations if needed

async def process_document_image(image_bytes: bytes) -> dict:
    """
    Processes an uploaded document image:
    - Performs basic OCR.
    - Mocks document authenticity checks.
    - Attempts to detect and extract a face.
    Returns a dictionary with processing results.
    """
    results = {
        "ocr_text": None,
        "expected_fields_present": {},
        "mock_security_feature_ok": False,
        "face_detected": False,
        "face_image_bytes": None, # Will store bytes of the cropped face
        "errors": []
    }

    try:
        # Load image with Pillow
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB") # Convert to RGB for consistency

        # --- 1. OCR Attempt ---
        try:
            # Pre-processing for OCR can be added here (e.g., grayscale, thresholding)
            # For simplicity, using image as is first.
            # TODO: Consider adding OpenCV pre-processing if OCR is poor.
            # Example: Convert to grayscale for Tesseract
            # gray_image = image.convert('L')
            # ocr_text = pytesseract.image_to_string(gray_image)

            ocr_text = pytesseract.image_to_string(image)
            results["ocr_text"] = ocr_text.strip()

            # Basic check for expected fields (example for a fictional ID)
            # This is highly dependent on the document layout and OCR quality
            if ocr_text:
                text_lower = ocr_text.lower()
                results["expected_fields_present"]["name_like"] = "name" in text_lower or "surname" in text_lower
                results["expected_fields_present"]["dob_like"] = "birth" in text_lower or "dob" in text_lower
                results["expected_fields_present"]["id_number_like"] = "id number" in text_lower or "identity no" in text_lower
                results["expected_fields_present"]["doc_header_like"] = "national id" in text_lower or "identity card" in text_lower
        except pytesseract.TesseractError as e:
            results["errors"].append(f"Tesseract OCR Error: {str(e)}")
        except Exception as e:
            results["errors"].append(f"OCR Processing Error: {str(e)}")

        # --- 2. Mock Document Authenticity Check ---
        # This is extremely simplified. Real checks are very complex.
        # Example: Check if a certain number of expected fields were found by OCR
        num_expected_fields_found = sum(1 for found in results["expected_fields_present"].values() if found)
        if num_expected_fields_found >= 2: # Arbitrary threshold for mock
            results["mock_security_feature_ok"] = True
        else:
            results["mock_security_feature_ok"] = False
            results["errors"].append("Mock authenticity check failed (too few OCR fields found).")

        # Placeholder for a more "advanced" mock check (e.g., a specific pattern)
        # For instance, one could try to find a specific color patch or a simple geometric shape
        # using OpenCV, but that's too involved for this initial prototype step.

        # --- 3. Face Detection and Extraction ---
        try:
            # Convert PIL Image to numpy array for face_recognition/OpenCV
            image_np = np.array(image) # image is already RGB from .convert("RGB")

            # Find all face locations in the image
            # model="hog" is faster but less accurate than "cnn" (cnn needs dlib compiled with CUDA for speed)
            face_locations = face_recognition.face_locations(image_np, model="hog")

            if face_locations:
                results["face_detected"] = True
                # Assuming the first face found is the primary one on the ID
                top, right, bottom, left = face_locations[0]

                # Crop the face from the original PIL image (or numpy array)
                # Ensure coordinates are within image bounds
                pil_image_width, pil_image_height = image.size
                left = max(0, left)
                top = max(0, top)
                right = min(pil_image_width, right)
                bottom = min(pil_image_height, bottom)

                if right > left and bottom > top:
                    face_image_pil = image.crop((left, top, right, bottom))

                    # Convert cropped face to bytes to send back/store
                    with io.BytesIO() as face_bytes_io:
                        face_image_pil.save(face_bytes_io, format="PNG") # Save as PNG (or JPEG)
                        results["face_image_bytes"] = face_bytes_io.getvalue()
                else:
                    results["errors"].append("Face coordinates were invalid after boundary check.")
                    results["face_detected"] = False

            else:
                results["face_detected"] = False
                results["errors"].append("No face detected on the document.")

        except Exception as e:
            results["errors"].append(f"Face Detection/Extraction Error: {str(e)}")
            results["face_detected"] = False # Ensure it's false on error

    except Exception as e:
        results["errors"].append(f"Overall Image Processing Error: {str(e)}")

    return results


async def extract_face_from_image_data(image_bytes: bytes):
    """
    Helper function to extract a face from generic image bytes.
    Could be used for liveness selfie processing in the future.
    For now, similar to document face extraction.
    """
    # This is largely a duplicate of the face extraction part from process_document_image
    # In a real app, this would be refactored.
    try:
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        image_np = np.array(image)
        face_locations = face_recognition.face_locations(image_np, model="hog")

        if face_locations:
            top, right, bottom, left = face_locations[0]

            pil_image_width, pil_image_height = image.size
            left = max(0, left)
            top = max(0, top)
            right = min(pil_image_width, right)
            bottom = min(pil_image_height, bottom)

            if right > left and bottom > top:
                face_image_pil = image.crop((left, top, right, bottom))
                with io.BytesIO() as face_bytes_io:
                    face_image_pil.save(face_bytes_io, format="PNG")
                    return face_bytes_io.getvalue(), None # face_bytes, error
            else:
                return None, "Invalid face coordinates after boundary check."
        else:
            return None, "No face detected."
    except Exception as e:
        return None, f"Error extracting face: {str(e)}"
```
