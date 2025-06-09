import React from 'react';
import AdSlot from './AdSlot'; // Import AdSlot
import AffiliateLinkSection from './AffiliateLinkSection'; // Import AffiliateLinkSection

function Forums() {
  return (
    <div>
      <h1>Forums</h1>
      <p>This is the discussion forums page.</p>
      {/* Add AdSlot placeholder */}
      <AdSlot width="300px" height="250px" adType="sidebar_forum" style={{ float: 'right', marginLeft: '20px' }} />
      {/* Add AffiliateLinkSection placeholder */}
      <AffiliateLinkSection title="Relevant Tools & Services" />
      <div style={{ clear: 'both' }}></div> {/* Clear float for layout */}
    </div>
  );
}

export default Forums;
