// src/pages/MagazineHome.jsx
import React from 'react';
import { Helmet } from 'react-helmet-async'; // Import Helmet

function MagazineHome() {
  return (
    <div>
      <Helmet>
        <title>Magazine Home - Customer Magazine App</title>
        <meta name="description" content="Welcome to our customer magazine! Browse our collection of articles." />
      </Helmet>
      <h1>Customer Magazine Home</h1>
      <p>Welcome to our customer magazine!</p>
    </div>
  );
}
export default MagazineHome;
