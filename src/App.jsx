import { useState } from 'react';
import './App.css';
import EducationalChatbot from './EducationalChatbot'; // Import EducationalChatbot

function App() {
  // State for AI Model Assistant
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState([]);

  // State for active feature
  const [activeFeature, setActiveFeature] = useState('modelAssistant'); // 'modelAssistant' or 'eduChatbot'

  const handleInputChange = (event) => {
    setInputValue(event.target.value);
  };

  const handleSubmit = () => {
    const trimmedInput = inputValue.trim();
    if (trimmedInput !== '') {
      const newMessages = [...messages, { sender: 'user', text: trimmedInput }];
      setInputValue('');

      const lowerCaseInput = trimmedInput.toLowerCase();
      if (lowerCaseInput.includes('show dataset types') || lowerCaseInput.includes('list dataset types')) {
        const assistantResponse = {
          sender: 'assistant',
          text: 'Available dataset types are: CSV, JSON, Text, Image.',
        };
        setMessages([...newMessages, assistantResponse]);
      } else {
        // Simulate a generic response for the model assistant for now
        setMessages([...newMessages, { sender: 'assistant', text: `Model assistant processing: ${trimmedInput}` }]);
      }
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <img src="Octocat.png" className="App-logo" alt="logo" />
        {/* Basic Navigation */}
        <div className="app-navigation">
          <button
            onClick={() => setActiveFeature('modelAssistant')}
            className={activeFeature === 'modelAssistant' ? 'active' : ''}
          >
            AI Model Assistant
          </button>
          <button
            onClick={() => setActiveFeature('eduChatbot')}
            className={activeFeature === 'eduChatbot' ? 'active' : ''}
          >
            Educational Chatbot
          </button>
        </div>
        {/* <p>
          GitHub Codespaces <span className="heart">♥️</span> React
        </p>
        <p className="small">
          Edit <code>src/App.jsx</code> and save to reload.
        </p>
        <p>
          <a
            className="App-link"
            href="https://reactjs.org"
            target="_blank"
            rel="noopener noreferrer"
          >
            Learn React
          </a>
        </p> */}
      </header>

      {activeFeature === 'modelAssistant' && (
        <div className="chat-container">
          <h3>AI Model Assistant</h3>
          <div className="message-display-area">
            {messages.map((message, index) => (
              <div key={index} className={`message ${message.sender}`}>
                {message.text}
              </div>
            ))}
          </div>
          <div className="input-area">
            <input
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
              placeholder="Type your command for the Model Assistant..."
            />
            <button onClick={handleSubmit}>Send</button>
          </div>
        </div>
      )}

      {activeFeature === 'eduChatbot' && (
        <EducationalChatbot />
      )}
    </div>
  );
}

export default App;
