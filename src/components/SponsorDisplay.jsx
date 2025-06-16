// src/components/SponsorDisplay.jsx
import React from 'react';
import { mockCurrentSponsors } from '../data/mockCurrentSponsors';
import './SponsorDisplay.css'; // We'll create this CSS file

function SponsorDisplay({ title = "Our Valued Sponsors" }) {
  if (!mockCurrentSponsors || mockCurrentSponsors.length === 0) {
    return null; // Don't render anything if no sponsors
  }

  return (
    <div className="sponsor-display-section">
      <h2>{title}</h2>
      <div className="sponsors-grid">
        {mockCurrentSponsors.map(sponsor => (
          <div key={sponsor.id} className="sponsor-item">
            <a href={sponsor.websiteUrl} target="_blank" rel="noopener noreferrer nofollow">
              <img src={sponsor.logoUrl} alt={`${sponsor.name} Logo`} className="sponsor-logo" />
              <p className="sponsor-name">{sponsor.name}</p>
            </a>
            {/* Optional: Display tier if needed */}
            {/* <p className="sponsor-tier">{sponsor.tier}</p> */}
          </div>
        ))}
      </div>
    </div>
  );
}

export default SponsorDisplay;
