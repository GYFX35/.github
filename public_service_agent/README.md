# Government Public Services AI Agent (Prototype)

This project is a prototype for an AI agent designed to assist citizens by providing information about government public services. Currently, it focuses on answering frequently asked questions related to "Local Library Services" as an example.

## Features

*   **Information Provision:** Answers user questions based on a predefined knowledge base.
*   **Keyword-Based NLU:** Uses simple keyword matching to understand user queries.
*   **Command-Line Interface:** Allows users to interact with the agent via text input in a terminal.
*   **JSON Knowledge Base:** Stores service information and FAQs in an easily editable JSON file (`knowledge_base.json`).

## Project Structure

Within the `public_service_agent` directory:
```
.
├── agent.py               # Main Python script for the AI agent logic and CLI.
├── knowledge_base.json    # JSON file containing the data for services and FAQs.
└── README.md              # This documentation file.
```

## Setup and Running

1.  **Prerequisites:**
    *   Python 3.x

2.  **No external libraries are required for this basic version.**

3.  **Running the Agent:**
    Open your terminal or command prompt, navigate to the `public_service_agent` project directory, and run:
    ```bash
    python agent.py
    ```
    The agent will greet you, and you can start asking questions related to the configured services (currently, Example Local Library Services). Type `quit` or `exit` to end the session.

    **Important:** The `agent.py` script expects `knowledge_base.json` to be in the same directory.

## Knowledge Base (`knowledge_base.json`)

The `knowledge_base.json` file stores all the information the agent uses. It has the following structure:

```json
{
  "services": [
    {
      "name": "Name of the Service (e.g., Local Library Services)",
      "faqs": [
        {
          "question": "A common question about the service.",
          "answer": "The answer to that question.",
          "keywords": ["relevant", "keywords", "for", "matching", "this", "faq"]
        }
        // ... more FAQs for this service
      ],
      "general_info": {
        "website": "URL of the service's official website (optional)",
        "contact_phone": "Contact phone number for the service (optional)"
        // ... other general details
      }
    }
    // ... more services can be added here
  ]
}
```

### Adding New Information

1.  **Adding a new FAQ to an existing service:**
    *   Open `public_service_agent/knowledge_base.json`.
    *   Locate the service under the `services` array.
    *   Add a new JSON object to its `faqs` array with `question`, `answer`, and an array of `keywords`.
    *   Ensure your keywords are relevant and cover different ways a user might ask the question.

2.  **Adding a new Service:**
    *   Open `public_service_agent/knowledge_base.json`.
    *   Add a new JSON object to the main `services` array. This object should follow the structure shown above, including a `name`, an array for `faqs`, and a `general_info` object.
    *   Populate the `faqs` for the new service.

## Current Limitations

*   **Simple NLU:** Relies on basic keyword matching. It may not understand complex queries or nuanced language.
*   **Static Knowledge Base:** Information is hardcoded in the JSON file. It's not dynamically updated.
*   **Single Turn Conversation:** The agent does not remember previous parts of the conversation.
*   **CLI Only:** No graphical user interface or web deployment in this version.
*   **Limited Scope:** Currently only knowledgeable about "Example Local Library Services."
*   **File Paths:** The agent currently assumes `knowledge_base.json` is in its immediate directory.

## Potential Future Improvements (Conceptual)

*   **Advanced NLU:** Integrate more sophisticated NLU libraries (e.g., spaCy, NLTK, or cloud-based AI services) for better intent recognition and entity extraction.
*   **Web Interface:** Develop a web application (e.g., using Flask/FastAPI for the backend and HTML/CSS/JS for the frontend) to make the agent accessible via a browser.
*   **Database Integration:** Store the knowledge base in a database for better management, scalability, and easier updates by non-technical users.
*   **Contextual Conversations:** Implement dialogue management to handle multi-turn conversations.
*   **Integration with APIs:** Connect to external APIs to fetch real-time information (e.g., live public transport updates).
*   **Admin Interface:** A UI for administrators to easily update the knowledge base.
*   **Configurable Paths:** Make the path to the knowledge base configurable.

This prototype serves as a foundational step. Further development can build upon this to create a more robust and user-friendly public service assistant.
```
