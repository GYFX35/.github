import './App.css';
import { Routes, Route, Link } from 'react-router-dom'; // Added Link
import HomePage from './HomePage';
import DevelopersPage from './DevelopersPage';
import PlayersPage from './PlayersPage';
import ResearchersPage from './ResearchersPage';

function App() {
  return (
    <div className="App">
      <nav>
        <ul>
          <li><Link to="/">Home</Link></li>
          <li><Link to="/developers">Developers</Link></li>
          <li><Link to="/players">Players</Link></li>
          <li><Link to="/researchers">Researchers</Link></li>
        </ul>
      </nav>
      <hr /> {/* Optional: a visual separator */}
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/developers" element={<DevelopersPage />} />
        <Route path="/players" element={<PlayersPage />} />
        <Route path="/researchers" element={<ResearchersPage />} />
      </Routes>
    </div>
  );
}

export default App;
