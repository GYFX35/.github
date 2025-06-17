import os
from typing import Optional
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
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

# Pydantic Models for Code Generation
class CodeGenerationRequest(BaseModel):
    description: str = Field(..., min_length=1, description="Description of the code to be generated.")
    language: str = "python"
    context: Optional[str] = None

class CodeGenerationResponse(BaseModel):
    generated_code: str
    language: str

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


@app.post("/api/generate_code", response_model=CodeGenerationResponse)
async def generate_code_endpoint(request: CodeGenerationRequest):
    """
    Receives a code generation request, simulates a Gemini API call for code generation,
    and returns the generated code.
    """
    if not GEMINI_API_KEY:
        raise HTTPException(status_code=503, detail="GEMINI_API_KEY not configured. Please set it in your .env file.")

    # Construct a placeholder prompt (actual Gemini prompt would be more sophisticated)
    prompt = f"Generate {request.language} code for: {request.description}."
    if request.context:
        prompt += f" Additional context: {request.context}"

    print(f"Simulated code generation prompt: {prompt}") # Log the simulated prompt

    try:
        # Simulate Gemini API call for code generation
        simulated_code = f"# Simulated {request.language} code for: {request.description}\n"

        if "load csv" in request.description.lower() and request.language.lower() == "python":
            simulated_code += "import pandas as pd\n\n"
            simulated_code += "# Load a CSV file\n"
            simulated_code += "try:\n"
            simulated_code += "    df = pd.read_csv('your_file.csv')\n"
            simulated_code += "    print(df.head())\n"
            simulated_code += "except FileNotFoundError:\n"
            simulated_code += "    print(\"Error: 'your_file.csv' not found. Please specify the correct path.\")\n"
            simulated_code += "except Exception as e:\n"
            simulated_code += "    print(f\"An error occurred: {e}\")\n"

        elif "logistic regression" in request.description.lower() and request.language.lower() == "python":
            simulated_code += "from sklearn.linear_model import LogisticRegression\n"
            simulated_code += "from sklearn.model_selection import train_test_split\n"
            simulated_code += "from sklearn.metrics import accuracy_score\n"
            simulated_code += "import numpy as np\n\n"
            simulated_code += "# Sample data (replace with your actual data)\n"
            simulated_code += "X = np.random.rand(100, 5) # 100 samples, 5 features\n"
            simulated_code += "y = np.random.randint(0, 2, 100) # Binary target variable\n\n"
            simulated_code += "# Split data\n"
            simulated_code += "X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)\n\n"
            simulated_code += "# Initialize and train the model\n"
            simulated_code += "model = LogisticRegression()\n"
            simulated_code += "model.fit(X_train, y_train)\n\n"
            simulated_code += "# Make predictions\n"
            simulated_code += "predictions = model.predict(X_test)\n\n"
            simulated_code += "# Evaluate the model\n"
            simulated_code += "accuracy = accuracy_score(y_test, predictions)\n"
            simulated_code += "print(f\"Model Accuracy: {accuracy:.2f}\")\n"

        elif request.language.lower() == "javascript":
            simulated_code += "// This is a simulated JavaScript function\n"
            simulated_code += `function greet(name) {\n`
            simulated_code += `  console.log("Hello, " + name + " from " + "${request.description}");\n`
            simulated_code += `}\n`
            simulated_code += `greet("Developer");\n`

        else:
            simulated_code += f"# Context: {request.context if request.context else 'No additional context provided.'}\n"
            simulated_code += "print('Hello from generated code!')\n"

        return CodeGenerationResponse(generated_code=simulated_code, language=request.language)

    except Exception as e:
        # Catch-all for unexpected errors during the simulated generation
        print(f"Unexpected error during code generation: {type(e).__name__} - {e}") # Log this
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred during code generation: {type(e).__name__}")

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
