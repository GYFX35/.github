// src/pages/MagazineHome.jsx
import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom'; // Import Link
import mockArticles from '../data/mockArticles'; // Import mock articles
import SponsorDisplay from '../components/SponsorDisplay'; // Import SponsorDisplay

function MagazineHome() {
  const placeholderAffiliateLink = "https://placeholder-affiliate-link.com/homepage-deal";
  const placeholderProductName = "Amazing Product X";

  return (
    <div style={{ padding: '20px' }}>
      <Helmet>
        <title>Magazine Home - Customer Magazine App</title>
        <meta name="description" content="Welcome to our customer magazine! Browse our collection of articles and recommended products." />
      </Helmet>
      <h1>Customer Magazine Home</h1>
      <p>Welcome to our customer magazine! Explore our latest articles and insights.</p>

      {/* Placeholder Affiliate Section (keeping it as it was) */}
      <div style={{ marginTop: '30px', padding: '20px', border: '1px solid #eee', borderRadius: '5px', backgroundColor: '#f9f9f9' }}>
        <h2>Our Recommendations</h2>
        <p>
          We recommend checking out <strong>{placeholderProductName}</strong>!
          It's a fantastic tool that can help you achieve great results.
        </p>
        <p>
          <a
            href={placeholderAffiliateLink}
            target="_blank"
            rel="noopener noreferrer sponsored"
            style={{ fontWeight: 'bold', color: '#007bff' }}
          >
            Learn more about {placeholderProductName} here!
          </a>
        </p>
        <p style={{ fontSize: '0.8em', color: '#777' }}>
          (As an affiliate, we may earn from qualifying purchases.)
        </p>
      </div>

      {/* Articles List Section */}
      <div style={{ marginTop: '40px' }}>
        <h2>Latest Articles</h2>
        {mockArticles && mockArticles.length > 0 ? (
          <ul style={{ listStyle: 'none', paddingLeft: '0' }}>
            {mockArticles.map(article => (
              <li key={article.id} style={{ marginBottom: '20px', paddingBottom: '10px', borderBottom: '1px dotted #ccc' }}>
                <Link to={`/magazine/article/${article.slug}`} style={{ textDecoration: 'none', color: '#333' }}>
                  <h3 style={{ marginBottom: '5px', color: '#0056b3' }}>
                    {article.title}
                    {article.isGuestPost && <span style={{ fontSize: '0.8em', color: '#555', marginLeft: '10px' }}>[Guest Post by {article.authorName}]</span>}
                  </h3>
                </Link>
                <p style={{ fontSize: '0.9em', color: '#666', margin: '0 0 5px 0' }}>
                  Published on: {new Date(article.publishDate).toLocaleDateString()}
                  {!article.isGuestPost && ` by ${article.authorName}`}
                </p>
                <p style={{ fontSize: '0.95em', margin: '0' }}>{article.excerpt}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p>No articles available at the moment. Please check back soon!</p>
        )}
      </div>

      {/* Add SponsorDisplay section */}
      <SponsorDisplay />

    </div>
  );
}

export default MagazineHome;
