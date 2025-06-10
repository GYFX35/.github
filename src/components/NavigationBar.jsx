// src/components/NavigationBar.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import ShareButton from './ShareButton'; // Import ShareButton

function NavigationBar() {
  const navStyle = {
    display: 'flex',
    justifyContent: 'space-between', // To space out nav links and share button
    alignItems: 'center',
    padding: '10px 20px',
    backgroundColor: '#f8f9fa', // A light background for the nav
    borderBottom: '1px solid #dee2e6'
  };

  const ulStyle = {
    listStyle: 'none',
    padding: 0,
    margin: 0,
    display: 'flex',
    gap: '15px' // Spacing between nav items
  };

  return (
    <nav style={navStyle}>
      <ul style={ulStyle}>
        <li><Link to="/">Feed</Link></li>
        <li><Link to="/profile">Profile</Link></li>
        <li><Link to="/forums">Forums</Link></li>
        <li><Link to="/shop">Shop</Link></li>
      </ul>
      <ShareButton
        title="Check out this Health & Wellbeing Platform!"
        text="Join our community for global health and wellbeing promotion, forums, and more."
        url={window.location.origin} // Shares the base URL of the app
        buttonText="Share App"
        buttonStyle={{backgroundColor: '#28a745', fontSize: '13px', padding: '6px 10px'}}
      />
    </nav>
  );
}

export default NavigationBar;
