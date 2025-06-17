import { useState } from 'react';
import './App.css';
import EducationalChatbot from './EducationalChatbot'; // Import EducationalChatbot

function App() {
  // State for AI Model Assistant
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState([]);
  const [generatedCode, setGeneratedCode] = useState('');
  const [codeLanguage, setCodeLanguage] = useState('python'); // Default to python
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);
  const [copyButtonText, setCopyButtonText] = useState('Copy Code');

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
        // Clear generated code when a normal message is sent
        setGeneratedCode('');
        setCodeLanguage('python');
      }
    }
  };

  const handleGenerateCode = async () => {
    const description = inputValue.trim();
    if (description === '') {
      setMessages(prevMessages => [...prevMessages, { sender: 'assistant', text: 'Please enter a description for code generation.' }]);
      return;
    }

    setIsGeneratingCode(true);
    setGeneratedCode('');
    setCopyButtonText('Copy Code'); // Reset copy button text

    // Add user's request to chat messages for context, if desired
    // setMessages(prevMessages => [...prevMessages, { sender: 'user', text: `Generate code for: ${description}` }]);

    try {
      const response = await fetch('http://localhost:8000/api/generate_code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ description: description }), // language will default on backend
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: response.statusText }));
        setGeneratedCode(`// Error generating code: ${errorData.detail || response.statusText}`);
        setCodeLanguage('text'); // Or 'plaintext'
      } else {
        const data = await response.json();
        setGeneratedCode(data.generated_code);
        setCodeLanguage(data.language);
      }
    } catch (error) {
      setGeneratedCode(`// Network error or backend unreachable: ${error.message}`);
      setCodeLanguage('text');
    } finally {
      setIsGeneratingCode(false);
    }
  };

  const handleCopyCode = () => {
    if (generatedCode) {
      navigator.clipboard.writeText(generatedCode).then(() => {
        setCopyButtonText('Copied!');
        setTimeout(() => setCopyButtonText('Copy Code'), 2000);
      }).catch(err => {
        console.error('Failed to copy code: ', err);
        setCopyButtonText('Failed to copy');
        setTimeout(() => setCopyButtonText('Copy Code'), 2000);
      });
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
              placeholder="Type description for code or a command..."
            />
            <button onClick={handleSubmit}>Send Command</button>
            <button onClick={handleGenerateCode} disabled={isGeneratingCode} className="generate-code-button">
              {isGeneratingCode ? 'Generating...' : 'Generate Code'}
            </button>
          </div>

          {isGeneratingCode && <p className="loading-message">Generating code, please wait...</p>}

          {generatedCode && (
            <div className="code-display-area">
              <h4>Generated Code:</h4>
              <pre>
                <code className={`language-${codeLanguage}`}>
                  {generatedCode}
                </code>
              </pre>
              <button onClick={handleCopyCode} className="copy-code-button">
                {copyButtonText}
              </button>
            </div>
          )}
        </div>
      )}

      {activeFeature === 'eduChatbot' && (
        <EducationalChatbot />
      )}
    </div>
  );
}

export default App;
