import React, { useState } from 'react';
import './TopicInput.css';

function TopicInput({ onSubmitTopic }) {
  const [topic, setTopic] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!topic.trim()) {
      alert('Please enter a topic.');
      return;
    }
    onSubmitTopic(topic);
    setTopic(''); // Clear input after submission
  };

  return (
    <div className="topic-input-container">
      <h2>Enter Video Topic</h2>
      <form onSubmit={handleSubmit} className="topic-input-form">
        <input
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="E.g., 'The History of the Internet'"
          className="topic-input-field"
        />
        <button type="submit" className="topic-submit-button">
          Generate Content
        </button>
      </form>
    </div>
  );
}

export default TopicInput;
