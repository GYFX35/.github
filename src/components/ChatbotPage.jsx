// src/components/ChatbotPage.jsx
import React from 'react';
import ChatbotUI from './ChatbotUI';

function ChatbotPage() {
  const pageStyle = {
    padding: 'var(--spacing-md)', // Use theme variable for padding
    height: 'calc(100vh - 60px - (2 * var(--spacing-md)))', // Adjust 60px based on Nav height
    display: 'flex',
    flexDirection: 'column',
  };

  const headingStyle = {
    marginBottom: 'var(--spacing-md)',
    textAlign: 'center', // Center the heading
  };

  return (
    <div style={pageStyle}>
      <h1 style={headingStyle}>Chat with our AI Assistant</h1>
      <ChatbotUI />
    </div>
  );
}

export default ChatbotPage;
