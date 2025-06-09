import React from 'react';

/**
 * Placeholder component for an advertisement slot.
 * Props:
 *  - width (string, optional): Width of the ad slot (e.g., "300px").
 *  - height (string, optional): Height of the ad slot (e.g., "250px").
 *  - adType (string, optional): Type of ad (e.g., "banner", "sidebar_square").
 *  - style (object, optional): Custom styles to apply.
 */
function AdSlot({ width = '300px', height = '250px', adType = 'general', style }) {
  const adSlotStyle = {
    width: width,
    height: height,
    backgroundColor: '#f0f0f0',
    border: '2px dashed #ccc',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    padding: '10px',
    textAlign: 'center',
    fontSize: '14px',
    color: '#555',
    margin: '10px auto', // Default margin
    ...style, // Allow overriding or adding styles
  };

  return (
    <div style={adSlotStyle} data-ad-type={adType}>
      <p><strong>Ad Slot</strong></p>
      <p>({width} x {height})</p>
      <p>Type: {adType}</p>
    </div>
  );
}

export default AdSlot;
