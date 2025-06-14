import './App.css';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import MagazineHome from './pages/MagazineHome';
import MagazineArticle from './pages/MagazineArticle';
// Keep the original Octocat image import if you want to use it
// import octocatLogo from '/Octocat.png'; // Or from 'public/Octocat.png' - path might need adjustment

function App() {
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
