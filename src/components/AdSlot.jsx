// src/components/AdSlot.jsx
import React, { useEffect, useRef } from 'react'; // Assuming the more advanced version from MONETIZATION.MD

function AdSlot({ adClient, adSlot, width = '300px', height = '250px', adType = 'general', style }) {
  const adContainerRef = useRef(null);

  // useEffect for ad script injection (conceptual, from previous documentation)
  useEffect(() => {
    if (adClient && adSlot && adContainerRef.current && adContainerRef.current.children.length === 0) {
      const script = document.createElement('script');
      script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adClient}`;
      script.async = true;
      script.crossOrigin = "anonymous";

      const ins = document.createElement('ins');
      ins.className = "adsbygoogle";
      ins.style.display = "inline-block";
      ins.style.width = width;
      ins.style.height = height;
      ins.setAttribute('data-ad-client', adClient);
      ins.setAttribute('data-ad-slot', adSlot);

      adContainerRef.current.appendChild(script);
      adContainerRef.current.appendChild(ins);

      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (e) {
        console.error("Error pushing to adsbygoogle:", e);
      }
    }
  }, [adClient, adSlot, width, height]);

  const placeholderStyle = {
    width: width,
    height: height,
    backgroundColor: 'var(--light-background-color)',
    border: 'var(--border-width) dashed var(--border-color)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    padding: 'var(--spacing-sm)',
    textAlign: 'center',
    fontSize: 'var(--font-size-sm)',
    color: 'var(--secondary-text-color)',
    margin: 'var(--spacing-md) auto', // Default margin
    boxSizing: 'border-box',
    ...style, // Allow overriding or adding styles
  };

  if (adClient && adSlot) {
    return <div ref={adContainerRef} style={{ width, height, margin: 'var(--spacing-md) auto', ...style }} data-ad-type={adType}></div>;
  }

  return (
    <div style={placeholderStyle} data-ad-type={adType}>
      <p><strong>Ad Slot</strong> ({adType})</p>
      <p>({width} x {height})</p>
      <p>Configure `adClient` and `adSlot` props to display live ad.</p>
    </div>
  );
}

export default AdSlot;
