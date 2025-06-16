import { useState } from 'react';
import './App.css';

function App() {
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState([]);

  const handleInputChange = (event) => {
    setInputValue(event.target.value);
  };

  const handleSubmit = () => {
    const trimmedInput = inputValue.trim();
    if (trimmedInput !== '') {
      const newMessages = [...messages, { sender: 'user', text: trimmedInput }];
      setInputValue('');

      // Command identification
      const lowerCaseInput = trimmedInput.toLowerCase();
      if (lowerCaseInput.includes('show dataset types') || lowerCaseInput.includes('list dataset types')) {
        const assistantResponse = {
          sender: 'assistant',
          text: 'Available dataset types are: CSV, JSON, Text, Image.',
        };
        setMessages([...newMessages, assistantResponse]);
      } else {
        // In a real app, you would also send the message to the AI assistant here
        // For now, just update with user message if no command is matched
        setMessages(newMessages);
      }
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <img src="Octocat.png" className="App-logo" alt="logo" />
        <p>
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
        </p>
      </header>
      <div className="chat-container">
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
            placeholder="Type your command..."
          />
          <button onClick={handleSubmit}>Send</button>
        </div>
      </div>
    </div>
  );
}

export default App;
