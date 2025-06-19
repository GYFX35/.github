import os
from typing import Optional
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from dotenv import load_dotenv
import google.generativeai as genai
from google.generativeai.types import generation_types

# --- Gemini API Configuration ---
# Load environment variables from .env file (especially GEMINI_API_KEY)
load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

# IMPORTANT: A valid GEMINI_API_KEY from a Google Cloud project with the
# Gemini API enabled is required in your .env file for this application to work.
# Example .env file content:
# GEMINI_API_KEY="YOUR_ACTUAL_API_KEY_HERE"

if GEMINI_API_KEY:
    try:
        genai.configure(api_key=GEMINI_API_KEY)
        print("Gemini API key configured successfully.")
    except Exception as e:
        print(f"Error configuring Gemini API key: {e} - This will likely cause issues with API calls.")
else:
    print("WARNING: GEMINI_API_KEY not found in environment. API calls will fail.")
# --- End Gemini API Configuration ---

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
    assistant_response = ""

    try:
        # Initialize the Gemini Model.
        # 'gemini-pro' is a versatile model. You might explore other models like
        # 'gemini-pro-vision' for multimodal tasks or specific code generation models
        # if available and suited to your needs and API access.
        # Ensure the chosen model is enabled for your Google Cloud project.
        model = genai.GenerativeModel('gemini-pro')
        # Consider adding safety_settings if specific configurations are needed
        # safety_settings = [
        #     {"category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_NONE"},
        #     {"category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_NONE"},
        # ]
        # response = model.generate_content(user_query, safety_settings=safety_settings)
        response = model.generate_content(user_query)

        try:
            assistant_response = response.text
        except ValueError: # This can happen if the response is blocked.
            # Check prompt_feedback for block reason
            if response.prompt_feedback and response.prompt_feedback.block_reason:
                assistant_response = f"Response blocked due to: {response.prompt_feedback.block_reason.name}. Please try a different query."
            else:
                # It's also possible that parts are empty due to a block, and .text fails.
                # This case might be hit if .text fails for other reasons or if prompt_feedback is not informative.
                assistant_response = "Response could not be generated. This might be due to safety filters or other reasons."

        if not assistant_response and response.parts: # Fallback if .text was empty but parts exist
             # This attempts to join text from parts, good for multi-part responses.
             # However, if a part is blocked, it might not have a 'text' attribute or be empty.
            try:
                assistant_response = "".join(part.text for part in response.parts)
            except AttributeError: # If a part doesn't have .text (e.g. a function call part)
                 assistant_response = "Received a non-text response part. Please check backend logs."


        # Final check if still no meaningful response and a block reason exists
        if not assistant_response and response.prompt_feedback and response.prompt_feedback.block_reason:
            assistant_response = f"Response blocked due to: {response.prompt_feedback.block_reason.name}. Please try a different query."

        # If, after all checks, the response is empty, provide a generic message.
        if not assistant_response:
            assistant_response = "The AI assistant did not provide a text response. Please try rephrasing your query or check the backend logs."

        return QueryResponse(answer=assistant_response)

    except generation_types.BlockedPromptException as e:
        print(f"Gemini API BlockedPromptException: {e}")
        raise HTTPException(status_code=400, detail=f"Your query was blocked by content filters: {e}")
    except generation_types.StopCandidateException as e: # If generation stops due to safety or other reasons
        print(f"Gemini API StopCandidateException: {e}")
        # The content might be in e.args[0].candidates[0].content.parts[0].text if it's a finish_reason related block
        # For simplicity, return a generic message or parse 'e' if needed
        assistant_response = f"Response generation stopped. This might be due to safety filters or reaching a stop condition. ({e})"
        return QueryResponse(answer=assistant_response) # Return 200 with info, or raise 400
        # raise HTTPException(status_code=400, detail=f"Response generation stopped due to safety or other reasons: {e}")
    except Exception as e:
        print(f"Unexpected error during Gemini API call: {type(e).__name__} - {e}")
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred with the AI assistant: {type(e).__name__}")


@app.post("/api/legal_chat", response_model=QueryResponse)
async def legal_chat_endpoint(request: QueryRequest):
    """
    Receives a user query related to legal topics, provides a general educational response
    using Gemini, and includes a disclaimer.
    """
    if not GEMINI_API_KEY:
        raise HTTPException(status_code=503, detail="GEMINI_API_KEY not configured for the legal chat endpoint.")

    user_query = request.query

    system_prompt_parts = [
        "You are an AI assistant providing general information about legal topics for educational purposes ONLY.",
        "Your information is not legal advice and should not be treated as such.",
        "Acknowledge that laws vary significantly by jurisdiction and that the user should always consult a qualified lawyer in their jurisdiction for specific legal issues or advice.",
        "Given the user's query, provide a general, educational response.",
        "IMPORTANT: Conclude your entire response with the following exact disclaimer, on a new line:",
        "---",
        "Disclaimer: This information is for educational purposes only and is not legal advice. Laws vary by jurisdiction. Always consult a qualified lawyer for advice on specific legal issues."
    ]
    full_prompt_for_gemini = "\n".join(system_prompt_parts) + "\n\nUser Query: " + user_query

    print(f"--- Sending Legal Chat Prompt to Gemini --- \n{full_prompt_for_gemini}\n-------------------------")

    assistant_response_text = ""
    try:
        model = genai.GenerativeModel('gemini-pro')
        response = model.generate_content(full_prompt_for_gemini)

        try:
            assistant_response_text = response.text
        except ValueError: # Blocked prompt
            if response.prompt_feedback and response.prompt_feedback.block_reason:
                assistant_response_text = f"Response blocked due to: {response.prompt_feedback.block_reason.name}. Please try a different query."
            else:
                assistant_response_text = "Response could not be generated due to safety filters or other reasons."

        if not assistant_response_text and response.parts:
            try:
                assistant_response_text = "".join(part.text for part in response.parts)
            except AttributeError:
                 assistant_response_text = "Received a non-text response part (legal chat). Please check backend logs."

        if not assistant_response_text and response.prompt_feedback and response.prompt_feedback.block_reason:
            assistant_response_text = f"Response blocked due to: {response.prompt_feedback.block_reason.name}. Please try a different query."

        if not assistant_response_text:
            assistant_response_text = "The AI assistant did not provide a text response for the legal query. Please try rephrasing or check logs."

        # Ensure the disclaimer is present, even if the main response is short or was partially blocked
        # However, the prompt asks Gemini to include it. If Gemini fails to do so, this is a fallback.
        # For now, we trust Gemini to follow the prompt for the disclaimer.

        return QueryResponse(answer=assistant_response_text)

    except generation_types.BlockedPromptException as e:
        print(f"Gemini API BlockedPromptException (Legal Chat): {e}")
        raise HTTPException(status_code=400, detail=f"Your legal query was blocked by content filters: {e}")
    except generation_types.StopCandidateException as e:
        print(f"Gemini API StopCandidateException (Legal Chat): {e}")
        assistant_response_text = f"Legal information generation stopped. This might be due to safety filters or reaching a stop condition. ({e})"
        # Check if the disclaimer needs to be manually appended if not already included by the partial response
        disclaimer = "\n---\nDisclaimer: This information is for educational purposes only and is not legal advice. Laws vary by jurisdiction. Always consult a qualified lawyer for advice on specific legal issues."
        if disclaimer not in assistant_response_text:
            assistant_response_text += disclaimer
        return QueryResponse(answer=assistant_response_text)
    except Exception as e:
        print(f"Unexpected error during Gemini API call (Legal Chat): {type(e).__name__} - {e}")
        # Append disclaimer to general error messages too, as the context is legal.
        error_message = f"An unexpected error occurred with the legal AI assistant: {type(e).__name__}"
        disclaimer = "\n---\nDisclaimer: This information is for educational purposes only and is not legal advice. Laws vary by jurisdiction. Always consult a qualified lawyer for advice on specific legal issues."
        full_error_response = error_message + disclaimer
        raise HTTPException(status_code=500, detail=full_error_response)


@app.post("/api/generate_code", response_model=CodeGenerationResponse)
async def generate_code_endpoint(request: CodeGenerationRequest):
    """
    Receives a code generation request, simulates a Gemini API call for code generation,
    and returns the generated code.
    """
    if not GEMINI_API_KEY:
        raise HTTPException(status_code=503, detail="GEMINI_API_KEY not configured. Please set it in your .env file.")

    prompt_parts = [
        f"Generate a high-quality code snippet in {request.language} for the following task:",
        f"User's description: "{request.description}"",
    ]
    if request.context:
        prompt_parts.append(f"Additional context: "{request.context}"")

    prompt_parts.extend([
        "
Important considerations for the generated code:",
        "- Ensure the code is correct, efficient, and follows best practices for the language.",
        "- Include clear and concise comments explaining key parts of the code.",
        "- If the request implies creating functions or classes, define them properly.",
        "- If specific libraries are commonly used for this task, please use them.",
        "- Handle potential common errors or edge cases if appropriate for the request.",
        "- The code should be directly usable. Do not include placeholder comments like '# your code here'.",
        "- Output only the raw code block for the requested language, without any introductory or concluding sentences, or markdown code fences like ```python ... ```."
    ])
    final_prompt = "\n".join(prompt_parts)
    print(f"--- Sending Code Generation Prompt to Gemini --- \n{final_prompt}\n-------------------------")

    generated_code_text = ""
    try:
        # Initialize the Gemini Model.
        # 'gemini-pro' is a versatile model. You might explore other models like
        # 'gemini-pro-vision' for multimodal tasks or specific code generation models
        # if available and suited to your needs and API access.
        # Ensure the chosen model is enabled for your Google Cloud project.
        model = genai.GenerativeModel('gemini-pro') # Or a more code-specific model if available
        # Configuration for code generation (more focused on generating code)
        # Example: generation_config = genai.types.GenerationConfig(temperature=0.7)
        # Then pass to model.generate_content(..., generation_config=generation_config)
        # For this implementation, default generation settings are used.
        generation_config = genai.types.GenerationConfig(
            # temperature=0.4, # Lower temperature for more deterministic code
            # top_p=1.0,
            # top_k=32,
            # max_output_tokens=2048, # Adjust as needed
            # stop_sequences=["```"], # May not be needed if prompt asks for raw code
        )
        # response = model.generate_content(final_prompt, generation_config=generation_config)
        response = model.generate_content(final_prompt)


        try:
            generated_code_text = response.text
        except ValueError: # Can occur if the response is blocked
            if response.prompt_feedback and response.prompt_feedback.block_reason:
                generated_code_text = f"// Code generation blocked due to: {response.prompt_feedback.block_reason.name}.\n// Please try a different description or context."
            else:
                generated_code_text = "// Code generation blocked or failed. No specific reason provided."

        if not generated_code_text and response.parts: # Fallback for parts if .text was empty
            try:
                generated_code_text = "".join(part.text for part in response.parts)
            except AttributeError:
                 generated_code_text = "// Received a non-text response part during code generation. Please check backend logs."


        if not generated_code_text and response.prompt_feedback and response.prompt_feedback.block_reason:
            generated_code_text = f"// Code generation blocked due to: {response.prompt_feedback.block_reason.name}.\n// Please try a different description or context."

        if not generated_code_text:
            generated_code_text = f"// The AI assistant did not return any code for {request.language}.\n// Please try rephrasing your request or check the backend logs."

        return CodeGenerationResponse(generated_code=generated_code_text, language=request.language)

    except generation_types.BlockedPromptException as e:
        print(f"Gemini API BlockedPromptException (Code Generation): {e}")
        raise HTTPException(status_code=400, detail=f"Your code generation request was blocked by content filters: {e}")
    except generation_types.StopCandidateException as e:
        print(f"Gemini API StopCandidateException (Code Generation): {e}")
        # If generation stopped, there might still be partial code in response.text or response.parts
        # For now, we'll use what might have been extracted before the exception, or a generic message.
        if not generated_code_text: # If text wasn't extracted before this exception
             generated_code_text = f"// Code generation stopped prematurely. This might be due to safety filters or other limits. ({e})"
        return CodeGenerationResponse(generated_code=generated_code_text, language=request.language)
    except Exception as e:
        print(f"Unexpected error during Gemini API call (Code Generation): {type(e).__name__} - {e}")
        error_detail = f"An unexpected error occurred with the AI code generation: {type(e).__name__}"
        # Return a comment in the code block about the error
        return CodeGenerationResponse(
            generated_code=f"// {error_detail}\n// Please check backend logs.",
            language=request.language # Or a generic 'text' language
        )

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
