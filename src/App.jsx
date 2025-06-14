import React, { useState, useEffect } from 'react'; // Add useState, useEffect
import './App.css';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import MagazineHome from './pages/MagazineHome';
import MagazineArticle from './pages/MagazineArticle';
// Keep the original Octocat image import if you want to use it
// import octocatLogo from '/Octocat.png'; // Or from 'public/Octocat.png' - path might need adjustment

function App() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  useEffect(() => {
    const handler = (e) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e);
      // Optionally, update UI to show a button or PWA install promotion
      console.log("'beforeinstallprompt' event was fired.");
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      return;
    }
    // Show the install prompt
    deferredPrompt.prompt();
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to the install prompt: ${outcome}`);
    // We've used the prompt, and can't use it again, discard it
    setDeferredPrompt(null);
  };

  return (
    <Router>
      <div className="App">
        <header className="App-header">
          {/* You can keep or modify the existing header content */}
          <img src="Octocat.png" className="App-logo" alt="logo" />
          <p>
            GitHub Codespaces <span className="heart">♥️</span> React
          </p>

          <nav>
            <ul>
              <li>
                <Link to="/">Home</Link>
              </li>
              <li>
                <Link to="/magazine">Customer Magazine</Link>
              </li>
            </ul>
          </nav>
          {deferredPrompt && (
            <button
              onClick={handleInstallClick}
              style={{ marginLeft: '20px', padding: '10px' }} // Basic styling
            >
              Install App
            </button>
          )}
        </header>

        {/* Define the routes */}
        <Routes>
          <Route path="/magazine" element={<MagazineHome />} />
          <Route path="/magazine/article/:id" element={<MagazineArticle />} />
          {/* You might want a default Home page component for the "/" path */}
          <Route path="/" element={
            <div>
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
            </div>
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
