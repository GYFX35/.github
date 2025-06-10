// src/App.jsx (Conceptual - assuming App.css handles most of .App styling)
import './App.css'; // Ensure this is imported
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import NavigationBar from './components/NavigationBar';
import Feed from './components/Feed';
import UserProfile from './components/UserProfile';
import Forums from './components/Forums';
import ShopPage from './components/ShopPage';

function App() {
  // The className="App" will be styled by App.css, which should complement index.css
  return (
    <Router>
      <div className="App"> {/* This div can have specific styles from App.css */}
        <NavigationBar />
        {/* The header element was largely commented out,
            if it were active, its styles would also be reviewed.
            For now, App.jsx is mainly a router and container.
        */}
        <main style={{ padding: 'var(--spacing-md)' }}> {/* Added main with padding */}
          <Routes>
            <Route path="/" element={<Feed />} />
            <Route path="/profile" element={<UserProfile />} />
            <Route path="/forums" element={<Forums />} />
            <Route path="/shop" element={<ShopPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
