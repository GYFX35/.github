import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import NavigationBar from './components/NavigationBar';
import Feed from './components/Feed';
import UserProfile from './components/UserProfile';
import Forums from './components/Forums';

function App() {
  return (
    <Router>
      <div className="App">
        <NavigationBar />
        <header className="App-header">
          {/* Existing header content can be kept or removed */}
          {/* <img src="Octocat.png" className="App-logo" alt="logo" />
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
          </p> */}
        </header>
        <Routes>
          <Route path="/" element={<Feed />} />
          <Route path="/profile" element={<UserProfile />} />
          <Route path="/forums" element={<Forums />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
