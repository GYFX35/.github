import React, { useState } from 'react';

// Styling will be in App.css or a dedicated file.
// Example classes: .legal-chatbot-container, .legal-disclaimer-ui, .messages-area-legal, .input-area-legal

function LegalChatbot() {
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState([
    { sender: 'assistant', text: 'Welcome! Please ask your legal information question below.' }
  ]);

  const staticDisclaimerText = "IMPORTANT: This tool provides general legal information for educational purposes only. It is NOT a substitute for advice from a qualified lawyer. Laws vary by jurisdiction. Always consult a lawyer for specific legal issues.";

  const handleInputChange = (event) => {
    setInputValue(event.target.value);
  };

  const handleSendMessage = () => {
    const trimmedInput = inputValue.trim();
    if (trimmedInput === '') return;

    const userMessage = { sender: 'user', text: trimmedInput };
    // Add user message and placeholder immediately
    setMessages(prevMessages => [
      ...prevMessages,
      userMessage,
      { sender: 'assistant', text: 'Fetching information...' }
    ]);
    setInputValue('');

    const callBackend = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/legal_chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ query: trimmedInput }),
        });

        // Remove "Fetching information..." message
        setMessages(prevMessages => prevMessages.filter(msg =>
          !(msg.sender === 'assistant' && msg.text === 'Fetching information...')
        ));

        if (!response.ok) {
          let errorText = `Error: ${response.status} ${response.statusText}`;
          try {
            const errorData = await response.json();
            errorText = errorData.detail ? `Error: ${errorData.detail}` : errorText;
          } catch (e) {
            // Ignore if error response is not JSON or if .detail is not present
          }
          setMessages(prevMessages => [...prevMessages, { sender: 'assistant', text: errorText }]);
          return;
        }

        const data = await response.json();
        setMessages(prevMessages => [...prevMessages, { sender: 'assistant', text: data.answer }]);

      } catch (error) {
        // Remove "Fetching information..." message
        setMessages(prevMessages => prevMessages.filter(msg =>
          !(msg.sender === 'assistant' && msg.text === 'Fetching information...')
        ));
        setMessages(prevMessages => [...prevMessages, { sender: 'assistant', text: 'Error: Could not reach the AI assistant. Is the backend running?' }]);
      }
    };

    callBackend();
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <div className="legal-chatbot-container">
      <h2>Legal Information & Education Chat</h2>
      <div className="legal-disclaimer-ui">
        <p>{staticDisclaimerText}</p>
      </div>
      <div className="messages-area messages-area-legal">
        {messages.map((message, index) => (
          <div key={index} className={`message ${message.sender}`}>
            {/* Using <p> tags inside .message div for better structure if needed */}
            <p>{message.text}</p>
          </div>
        ))}
      </div>
      <div className="input-area input-area-legal">
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          placeholder="Ask a general legal question..."
        />
        <button onClick={handleSendMessage}>Send</button>
      </div>
    </div>
  );
}

export default LegalChatbot;
