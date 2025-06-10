// src/components/NavigationBar.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import ShareButton from './ShareButton';

function NavigationBar() {
  const navStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 'var(--spacing-sm) var(--spacing-md)', // Use theme spacing
    backgroundColor: 'var(--light-background-color)',
    borderBottom: 'var(--border-width) solid var(--border-color)'
  };

  const ulStyle = {
    listStyle: 'none',
    padding: 0,
    margin: 0,
    display: 'flex',
    gap: 'var(--spacing-md)' // Use theme spacing
  };

  const linkStyle = { // Defined for clarity, Link component might not take style directly
    color: 'var(--text-color)', // Standard text color for nav links
    textDecoration: 'none',
    padding: 'var(--spacing-xs) var(--spacing-sm)',
    borderRadius: 'var(--border-radius-sm)',
  };

  // For active link styling, you'd typically use NavLink from react-router-dom
  // and pass an isActive prop to style. For Link, direct styling is less common.
  // We'll rely on global 'a' styles and hover from index.css for now.

  return (
    <nav style={navStyle}>
      <ul style={ulStyle}>
        <li><Link to="/" style={linkStyle}>Feed</Link></li>
        <li><Link to="/profile" style={linkStyle}>Profile</Link></li>
        <li><Link to="/forums" style={linkStyle}>Forums</Link></li>
        <li><Link to="/shop" style={linkStyle}>Shop</Link></li>
            <li><Link to="/chatbot" style={linkStyle}>Chatbot</Link></li> {/* Add Chatbot link */}
      </ul>
      <ShareButton
        title="Check out this Health & Wellbeing Platform!"
        text="Join our community for global health and wellbeing promotion, forums, and more."
        url={window.location.origin}
        buttonText="Share App"
        // Use theme variables for button style, or a global .btn class if ShareButton is adapted
        buttonStyle={{
          backgroundColor: 'var(--success-color)', // Example: use success color
          fontSize: 'var(--font-size-sm)',
          padding: 'var(--spacing-xs) var(--spacing-sm)'
        }}
      />
    </nav>
  );
}

export default NavigationBar;
