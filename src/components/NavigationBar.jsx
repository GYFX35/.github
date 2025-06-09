import React from 'react';
import { Link } from 'react-router-dom';

function NavigationBar() {
  return (
    <nav>
      <ul>
        <li><Link to="/">Feed</Link></li>
        <li><Link to="/profile">Profile</Link></li>
        <li><Link to="/forums">Forums</Link></li>
            <li><Link to="/shop">Shop</Link></li> {/* Add Shop link */}
      </ul>
    </nav>
  );
}

export default NavigationBar;
