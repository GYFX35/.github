// src/components/AIChatbot.jsx
import React, { useState, useRef, useEffect } from 'react';
import './AIChatbot.css';

function AIChatbot({ isVisible, onClose, messages, isLoading, onSendMessage }) { // messages & isLoading now from props
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleLocalSendMessage = (e) => {
    e.preventDefault();
    if (inputValue.trim() === '') return;

    if (onSendMessage) {
      onSendMessage(inputValue.trim()); // Pass only the text, App.jsx handles sender & type
    }
    setInputValue('');
  };

  // Initial greeting logic is now handled by App.jsx when toggling visibility
  // and chatMessages state is empty.

  if (!isVisible) {
    return null;
  }

  return (
    <div className="chatbot-widget">
      <div className="chatbot-header">
        <h3>AI Assistant</h3>
        <button onClick={onClose} className="chatbot-close-btn">&times;</button>
      </div>
      <div className="chatbot-messages">
        {messages.map((msg, index) => ( // Use messages prop
          <div key={index} className={`message ${msg.sender}`}>
            <p>{msg.text}</p>
          </div>
        ))}
        {isLoading && ( // Use isLoading prop
          <div className="message bot">
            <p><i>Typing...</i></p>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleLocalSendMessage} className="chatbot-input-form">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Ask something..."
          disabled={isLoading} // Use isLoading prop
        />
        <button type="submit" disabled={isLoading}>Send</button>
      </form>
    </div>
  );
}

export default AIChatbot;
