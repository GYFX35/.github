// src/components/Forums.jsx
import React from 'react';
import AdSlot from './AdSlot';
import AffiliateLinkSection from './AffiliateLinkSection';

function Forums() {
  const pageStyle = {
    padding: 'var(--spacing-md)',
  };

  const contentWrapperStyle = {
    // For potential main content and sidebar layout
    // display: 'flex',
    // gap: 'var(--spacing-lg)'
  };

  const mainContentStyle = {
    flex: '3', // Example if using flex for sidebar
  };

  const sidebarStyle = {
    flex: '1', // Example if using flex for sidebar
    // marginLeft: 'var(--spacing-lg)' // if not using gap
  };

  // Simplified layout for now, AdSlot and AffiliateLinkSection will stack
  // The AdSlot's float:right was removed, direct styling on AdSlot will handle its placement
  // The clear:both div is also removed for now.

  return (
    <div style={pageStyle}>
      <div style={contentWrapperStyle}>
        <div style={mainContentStyle}>
          <h1>Forums</h1>
          <p>This is the discussion forums page. Browse topics, join conversations, and share your insights with the community.</p>
          <p style={{fontStyle: 'italic', color: 'var(--secondary-text-color)', marginTop: 'var(--spacing-xl)'}}>
            (Note: Sharing functionality for individual forum posts will be added when posts are implemented.
            Each post would have its own share button.)
          </p>
        </div>
        <div style={sidebarStyle}>
          {/* AdSlot's own style prop will be used for its internal theming & specific placement */}
          <AdSlot
            width="300px"
            height="250px"
            adType="sidebar_forum"
            style={{ margin: '0 auto var(--spacing-lg) auto' }} // Center if in its own column or use specific margins
          />
          {/* AffiliateLinkSection's internal styling will be themed later */}
          <AffiliateLinkSection title="Relevant Tools & Services" />
        </div>
      </div>
    </div>
  );
}
export default Forums;
