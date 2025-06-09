import React from 'react';
import AdSlot from './AdSlot'; // Import AdSlot

function Feed() {
  return (
    <div>
      <h1>Feed</h1>
      <p>This is the main content feed.</p>
      {/* Add AdSlot placeholder */}
      <AdSlot width="728px" height="90px" adType="leaderboard_bottom_feed" style={{ margin: '20px auto' }} />
    </div>
  );
}

export default Feed;
