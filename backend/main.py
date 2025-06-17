import os
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from dotenv import load_dotenv
import google.generativeai as genai

# Load environment variables from .env file
load_dotenv()

# Configure Gemini API
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if GEMINI_API_KEY:
    try:
        genai.configure(api_key=GEMINI_API_KEY)
    except Exception as e:
        print(f"Error configuring genai: {e}")
        # Allow startup even if API key is invalid for now, endpoint will handle missing key
        pass
else:
    print("GEMINI_API_KEY not found in environment variables.")

app = FastAPI()

# --- Pydantic Models ---
class QueryRequest(BaseModel):
    query: str

class QueryResponse(BaseModel):
    answer: str

# --- API Endpoints ---
@app.post("/api/gemini_chat", response_model=QueryResponse)
async def gemini_chat_endpoint(request: QueryRequest):
    """
    Receives a user query, simulates a Gemini API call, and returns a response.
    """
    if not GEMINI_API_KEY:
        # 503 Service Unavailable is more appropriate if the service cannot function without the key
        raise HTTPException(status_code=503, detail="GEMINI_API_KEY not configured. Please set it in your .env file.")

    user_query = request.query

    try:
        # This is where the actual genai.GenerativeModel('gemini-pro').generate_content(user_query) would go.
        # For simulation of different errors:
        if user_query.lower() == "simul_api_error":
            # This could represent an error from Gemini like InvalidArgument, PermissionDenied, etc.
            raise ValueError("Simulated API error from Gemini: Invalid query format.")
        if user_query.lower() == "simul_rate_limit":
            # This simulates a rate limit error from Gemini
            raise genai.types.generation_types.BlockedPromptException("Simulated rate limit exceeded with Gemini.")
        if user_query.lower() == "simul_network_error":
            # In a real scenario, this might be a specific exception from an underlying HTTP client
            raise ConnectionError("Simulated network error trying to reach Gemini services.")
        if user_query.lower() == "simul_unknown_model":
            # Simulating an error if the model name is wrong (though genai might raise a specific error)
            raise NameError("Simulated error: Gemini model 'gemini-ultra-pro-max' not found.")

        # Current simulated response logic for successful cases:
        if user_query.strip().lower() == "hello":
            assistant_response = "Gemini says: Hello there! How can I help you today?"
        else:
            assistant_response = f"Gemini says: You asked '{user_query}'. (This is a simulated response)"

        return QueryResponse(answer=assistant_response)

    except genai.types.generation_types.BlockedPromptException as e:
        # Specific exception for rate limits or blocked prompts if using the actual google-generativeai library
        print(f"Gemini API Blocked Prompt Error: {e}") # Log this
        raise HTTPException(status_code=429, detail=f"Too many requests or prompt blocked by Gemini: {e}")
    except ConnectionError as e:
        # More specific exception for network issues if your client library raises it
        print(f"Network Error contacting Gemini: {e}") # Log this
        raise HTTPException(status_code=504, detail=f"A network error occurred while contacting the AI assistant: {e}")
    except ValueError as e:
        # Example for other API-related errors that might indicate bad input
        print(f"Gemini API ValueError: {e}") # Log this
        raise HTTPException(status_code=400, detail=f"Error processing query by Gemini (e.g., bad input): {e}")
    except NameError as e: # Catching the simulated unknown model
        print(f"Gemini Model NameError: {e}") # Log this
        raise HTTPException(status_code=500, detail=f"Configuration error with the AI assistant model: {e}")
    except Exception as e:
        # Catch-all for other unexpected errors during the Gemini call
        print(f"Unexpected error during Gemini call: {type(e).__name__} - {e}") # Log this with type
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred with the AI assistant: {type(e).__name__}")

# --- How to run ---
# 1. Create a .env file in the 'backend' directory with your GEMINI_API_KEY:
#    GEMINI_API_KEY="YOUR_ACTUAL_GEMINI_API_KEY"
#
# 2. Install dependencies:
#    pip install -r requirements.txt
#
# 3. Run the FastAPI server (from the 'backend' directory):
#    uvicorn main:app --reload --port 8000
#    (or your preferred port)

if __name__ == "__main__":
    # This is for running with `python main.py` for simple testing if needed,
    # but `uvicorn` is preferred for development and production.
    import uvicorn
    print("Starting Uvicorn server. Access at http://localhost:8000/docs")
    uvicorn.run(app, host="0.0.0.0", port=8000)
