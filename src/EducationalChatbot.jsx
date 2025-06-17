import React, { useState } from 'react';

// Basic styling will be in App.css for now or a dedicated file later
// For example, .educational-chatbot-container, .messages-area, .input-area-edu etc.

function EducationalChatbot() {
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState([
    { sender: 'assistant', text: 'Hello! I am the Educational Chatbot. Ask me anything!' }
  ]);

  const handleInputChange = (event) => {
    setInputValue(event.target.value);
  };

  const handleSendMessage = () => {
    const trimmedInput = inputValue.trim();
    if (trimmedInput === '') return;

    const newMessages = [...messages, { sender: 'user', text: trimmedInput }];
    const userMessage = { sender: 'user', text: trimmedInput };
    const updatedMessagesWithUser = [...messages, userMessage];
    setMessages(updatedMessagesWithUser);
    setInputValue('');

    // Add a "Thinking..." message
    const thinkingMessage = { sender: 'assistant', text: 'Thinking...' };
    setMessages(prevMessages => [...prevMessages, thinkingMessage]);

    const callBackend = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/gemini_chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ query: trimmedInput }),
        });

        // Remove "Thinking..." message
        setMessages(prevMessages => prevMessages.filter(msg => msg.text !== 'Thinking...'));

        if (!response.ok) {
          let errorText = `Error: ${response.status} ${response.statusText}`;
          try {
            const errorData = await response.json();
            errorText = errorData.detail || errorText;
          } catch (e) {
            // Ignore if error response is not JSON
          }
          setMessages(prevMessages => [...prevMessages, { sender: 'assistant', text: errorText }]);
          return;
        }

        const data = await response.json();
        setMessages(prevMessages => [...prevMessages, { sender: 'assistant', text: data.answer }]);

      } catch (error) {
        // Remove "Thinking..." message
        setMessages(prevMessages => prevMessages.filter(msg => msg.text !== 'Thinking...'));
        setMessages(prevMessages => [...prevMessages, { sender: 'assistant', text: 'Error: Could not reach the assistant. Is the backend running?' }]);
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
    <div className="educational-chatbot-container">
      <h2>Educational Chatbot</h2>
      <div className="messages-area messages-area-edu">
        {messages.map((message, index) => (
          <div key={index} className={`message ${message.sender}`}>
            <p>{message.text}</p>
          </div>
        ))}
      </div>
      <div className="input-area input-area-edu">
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          placeholder="Ask a question..."
        />
        <button onClick={handleSendMessage}>Send</button>
      </div>
    </div>
  );
}

export default EducationalChatbot;
