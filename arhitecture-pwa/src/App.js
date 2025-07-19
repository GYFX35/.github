import React from 'react';
import './App.css';

function App() {
  const share = () => {
    if (navigator.share) {
      navigator.share({
        title: 'My ARchitecture Creation',
        text: 'Check out my awesome creation in ARchitecture!',
        url: window.location.href,
      })
        .then(() => console.log('Successful share'))
        .catch((error) => console.log('Error sharing', error));
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>ARchitecture PWA</h1>
        <button onClick={share}>Share My Creation</button>
      </header>
    </div>
  );
}

export default App;
