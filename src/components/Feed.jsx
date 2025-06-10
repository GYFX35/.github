// src/components/Feed.jsx
import React from 'react';
import AdSlot from './AdSlot';

function Feed() {
  const pageStyle = {
    padding: 'var(--spacing-md)',
    // Example: maxWidth for content area, centered
    // maxWidth: '960px',
    // margin: '0 auto',
  };

  const adSlotWrapperStyle = { // Style for the container of AdSlot
    margin: 'var(--spacing-lg) auto', // Center AdSlot more explicitly if needed
    textAlign: 'center', // Center the AdSlot if it's an inline-block
  };

  return (
    <div style={pageStyle}>
      <h1>Feed</h1>
      <p>This is the main content feed. More content will appear here, such as posts, articles, and updates from the community.</p>
      {/* Add AdSlot placeholder, its internal styling will be themed later */}
      <div style={adSlotWrapperStyle}>
        <AdSlot
          width="728px"
          height="90px"
          adType="leaderboard_bottom_feed"
          // AdSlot's own style prop will be used for its internal theming
        />
      </div>
    </div>
  );
}

export default Feed;
