import React, { useState, useRef, useEffect } from 'react';

function ChatbotUI() {
  const [messages, setMessages] = useState([
    { sender: 'Bot', text: 'Hello! How can I help you today?' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const styles = {
    chatContainer: {
      maxWidth: '700px',
      margin: 'var(--spacing-lg) auto',
      border: 'var(--border-width) solid var(--border-color)',
      borderRadius: 'var(--border-radius-lg)',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      height: 'calc(100vh - 200px)', // Example height, adjust as needed
      minHeight: '400px',
      backgroundColor: 'var(--background-color)',
      boxShadow: '0 0.125rem 0.25rem rgba(0,0,0,0.075)',
    },
    messageList: {
      flexGrow: 1,
      padding: 'var(--spacing-md)',
      overflowY: 'auto',
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--spacing-sm)',
    },
    message: {
      padding: 'var(--spacing-sm) var(--spacing-md)',
      borderRadius: 'var(--border-radius-lg)',
      maxWidth: '75%',
      wordWrap: 'break-word',
    },
    userMessage: {
      backgroundColor: 'var(--primary-color)',
      color: 'white',
      alignSelf: 'flex-end',
      borderBottomRightRadius: 'var(--border-radius-sm)', // "Tail" effect
    },
    botMessage: {
      backgroundColor: 'var(--light-background-color)',
      color: 'var(--text-color)',
      alignSelf: 'flex-start',
      borderBottomLeftRadius: 'var(--border-radius-sm)', // "Tail" effect
      border: 'var(--border-width) solid var(--border-color)',
    },
    inputArea: {
      display: 'flex',
      padding: 'var(--spacing-md)',
      borderTop: 'var(--border-width) solid var(--border-color)',
      backgroundColor: 'var(--light-background-color)',
    },
    inputField: {
      flexGrow: 1,
      padding: 'var(--spacing-sm) var(--spacing-md)',
      border: 'var(--border-width) solid var(--border-color)',
      borderRadius: 'var(--border-radius)',
      fontSize: 'var(--font-size-base)',
      marginRight: 'var(--spacing-sm)',
    },
    sendButton: {
      padding: 'var(--spacing-sm) var(--spacing-md)',
      fontSize: 'var(--font-size-base)',
      backgroundColor: 'var(--primary-color)',
      color: 'white',
      border: 'none',
      borderRadius: 'var(--border-radius)',
      cursor: 'pointer',
    },
    thinkingText: {
        fontStyle: 'italic',
        color: 'var(--secondary-text-color)',
        padding: 'var(--spacing-sm)',
        textAlign: 'center',
    }
  };

  const handleSendMessage = () => {
    if (inputValue.trim() === '') return;

    const newUserMessage = { sender: 'User', text: inputValue.trim() };
    setMessages(prevMessages => [...prevMessages, newUserMessage]);
    setInputValue('');
    setIsLoading(true);

    // Simulate bot response (replace with actual API call logic)
    setTimeout(() => {
      const botResponse = {
        sender: 'Bot',
        text: `This is a simulated response to: "${newUserMessage.text}". In a real app, this would come from the Gemini API via your backend.`
      };
      setMessages(prevMessages => [...prevMessages, botResponse]);
      setIsLoading(false);
    }, 1500 + Math.random() * 1000); // Simulate network delay
  };

  return (
    <div style={styles.chatContainer}>
      <div style={styles.messageList}>
        {messages.map((msg, index) => (
          <div
            key={index}
            style={{
              ...styles.message,
              ...(msg.sender === 'User' ? styles.userMessage : styles.botMessage)
            }}
          >
            {msg.text}
          </div>
        ))}
        <div ref={messagesEndRef} /> {/* For auto-scrolling */}
      </div>
      {isLoading && <div style={styles.thinkingText}>Bot is thinking...</div>}
      <div style={styles.inputArea}>
        <input
          type="text"
          style={styles.inputField}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleSendMessage()}
          placeholder="Type your message..."
          disabled={isLoading}
        />
        <button
          style={styles.sendButton}
          onClick={handleSendMessage}
          disabled={isLoading}
        >
          Send
        </button>
      </div>
    </div>
  );
}

export default ChatbotUI;
