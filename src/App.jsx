import './App.css';
import TopicInput from './components/TopicInput';
import React, { useState } from 'react';
import { generateScript } from './services/aiService'; // Import the service
import ScriptDisplay from './components/ScriptDisplay'; // Import the ScriptDisplay component

function App() {
  const [topic, setTopic] = useState('');
  const [scriptContent, setScriptContent] = useState(''); // This will now hold HTML from Quill
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleScriptEditorChange = (content, delta, source, editor) => {
    // content is the new HTML content of the editor
    // We can add debouncing here later if performance becomes an issue
    setScriptContent(content);
  };

  const handleTopicSubmit = async (submittedTopic) => {
    setTopic(submittedTopic);
    setScriptContent(''); // Clear previous script
    setError(null); // Clear previous errors
    setIsLoading(true);

    try {
      const script = await generateScript(submittedTopic);
      setScriptContent(script);
    } catch (err) {
      setError(err.message || 'Failed to generate script.');
      setScriptContent(''); // Ensure no stale script is shown
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="App">
      <div className="container">
        <h1>AI Video Content Generator</h1>
        <TopicInput onSubmitTopic={handleTopicSubmit} />

        {isLoading && <p className="loading-message">Generating script, please wait...</p>}

        {error && <p className="error-message">Error: {error}</p>}

        {topic && !isLoading && !error && (
          <div className="submitted-topic-display">
            <p>Chosen topic: <strong>{topic}</strong></p>
          </div>
        )}

        {/* This is where ScriptDisplay will go. For now, displaying raw script: */}
        {scriptContent && !isLoading && !error && (
           <ScriptDisplay scriptContent={scriptContent} onScriptChange={handleScriptEditorChange} />
        )}
      </div>
    </div>
  );
}

export default App;
