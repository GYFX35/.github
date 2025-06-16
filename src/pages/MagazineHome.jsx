// src/pages/MagazineHome.jsx
import React from 'react';
import { Helmet } from 'react-helmet-async';

function MagazineHome() {
  const placeholderAffiliateLink = "https://placeholder-affiliate-link.com/homepage-deal";
  const placeholderProductName = "Amazing Product X";

  return (
    <div>
      <Helmet>
        <title>Magazine Home - Customer Magazine App</title>
        <meta name="description" content="Welcome to our customer magazine! Browse our collection of articles and recommended products." />
        {/* Update meta description slightly */}
      </Helmet>
      <h1>Customer Magazine Home</h1>
      <p>Welcome to our customer magazine! Explore our latest articles and insights.</p>

      {/* Placeholder Affiliate Section */}
      <div style={{ marginTop: '30px', padding: '20px', border: '1px solid #eee', borderRadius: '5px' }}>
        <h2>Our Recommendations</h2>
        <p>
          We recommend checking out <strong>{placeholderProductName}</strong>!
          It's a fantastic tool that can help you achieve great results.
        </p>
        <p>
          <a
            href={placeholderAffiliateLink}
            target="_blank" // Open in new tab, common for affiliate links
            rel="noopener noreferrer sponsored" // Good practice for affiliate/sponsored links
            style={{ fontWeight: 'bold', color: '#007bff' }}
          >
            Learn more about {placeholderProductName} here!
          </a>
        </p>
        <p style={{ fontSize: '0.8em', color: '#777' }}>
          (As an affiliate, we may earn from qualifying purchases.)
        </p>
      </div>

      {/* You could add more content or article listings below */}
    </div>
  );
}

export default MagazineHome;
