import json

class GovernmentServiceAgent:
    def __init__(self, knowledge_base_path="knowledge_base.json"):
        self.knowledge_base = self._load_knowledge_base(knowledge_base_path)

    def _load_knowledge_base(self, filepath):
        """Loads the knowledge base from a JSON file."""
        try:
            with open(filepath, 'r') as f:
                return json.load(f)
        except FileNotFoundError:
            print(f"Error: Knowledge base file not found at {filepath}")
            return {"services": []}
        except json.JSONDecodeError:
            print(f"Error: Could not decode JSON from {filepath}")
            return {"services": []}

    def get_answer(self, user_question):
        """
        Finds an answer to the user's question based on keyword matching.
        """
        user_question_lower = user_question.lower()
        best_match_answer = "I'm sorry, I don't have information about that topic right now. Please try asking in a different way or contact the service directly."
        highest_keyword_match_count = 0

        if not self.knowledge_base or not self.knowledge_base.get("services"):
            return "My knowledge base seems to be empty or improperly configured."

        for service in self.knowledge_base["services"]:
            if "faqs" not in service:
                continue
            for faq in service["faqs"]:
                current_match_count = 0
                if "keywords" not in faq or "answer" not in faq:
                    continue
                for keyword in faq["keywords"]:
                    if keyword.lower() in user_question_lower:
                        current_match_count += 1

                # Simple heuristic: prioritize matches with more keywords
                if current_match_count > highest_keyword_match_count:
                    highest_keyword_match_count = current_match_count
                    best_match_answer = faq["answer"]
                # If it's a direct question match (less likely but possible)
                elif faq.get("question", "").lower() in user_question_lower and current_match_count >= highest_keyword_match_count : # prioritize direct question match if keyword count is same
                    highest_keyword_match_count = current_match_count #
                    best_match_answer = faq["answer"]


        # A very basic check for general info if no FAQ matches well
        if highest_keyword_match_count == 0:
            if "website" in user_question_lower:
                 for service in self.knowledge_base["services"]: # Assuming one service for now
                    if service.get("general_info") and service["general_info"].get("website"):
                        return f"You can find more information on their website: {service['general_info']['website']}"
            if "phone" in user_question_lower or "contact" in user_question_lower:
                for service in self.knowledge_base["services"]: # Assuming one service for now
                    if service.get("general_info") and service["general_info"].get("contact_phone"):
                        return f"Their contact phone number is: {service['general_info']['contact_phone']}"


        return best_match_answer

if __name__ == '__main__':
    agent = GovernmentServiceAgent()
    print("Government Service AI Agent initialized.")
    print("Ask me questions about Local Library Services. Type 'quit' or 'exit' to end.")

    while True:
        user_input = input("You: ")
        if user_input.lower() in ['quit', 'exit']:
            print("Agent: Goodbye!")
            break

        if not user_input.strip(): # Handle empty input
            print("Agent: Please ask a question.")
            continue

        answer = agent.get_answer(user_input)
        print(f"Agent: {answer}")
