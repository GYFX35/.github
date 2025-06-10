// src/components/ShareButton.jsx
import React, { useState } from 'react';

function ShareButton({ title, text, url, buttonText = "Share", buttonStyle }) {
  const [feedbackMessage, setFeedbackMessage] = useState('');

  const shareData = {
    title: title || document.title,
    text: text || '',
    url: url || window.location.href,
  };

  const defaultButtonStyle = {
    backgroundColor: 'var(--info-color)', // Using info color from theme
    color: 'white',
    border: 'var(--border-width) solid transparent', // Consistent with .btn
    padding: 'var(--spacing-xs) var(--spacing-sm)', // Adjusted padding
    borderRadius: 'var(--border-radius)',
    cursor: 'pointer',
    fontSize: 'var(--font-size-sm)', // Smaller font for share button
    margin: 'var(--spacing-xs)',
    fontWeight: 'var(--font-weight-normal)',
    transition: 'background-color 0.15s ease-in-out, opacity 0.15s ease-in-out',
    ...buttonStyle,
  };

  // Hover style for default button
  const hoverStyle = { backgroundColor: '#117a8b' }; // Darker info

  const handleShare = async () => {
    setFeedbackMessage(''); // Clear previous message

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        console.log('Content shared successfully');
        // Feedback message for successful Web Share is usually handled by the OS UI
      } catch (error) {
        console.error('Error using Web Share API:', error);
        // Don't show error to user unless it's critical, as they might have just cancelled.
        // If error is AbortError, user cancelled the share dialog.
        if (error.name !== 'AbortError') {
          setFeedbackMessage('Could not share. Try copying the link.');
        }
      }
    } else {
      // Fallback: Copy to clipboard
      try {
        await navigator.clipboard.writeText(shareData.url);
        setFeedbackMessage('Link copied to clipboard!');
      } catch (error) {
        console.error('Error copying to clipboard:', error);
        setFeedbackMessage('Could not copy link. Please copy it manually.');
      }
      // Clear message after a few seconds
      setTimeout(() => setFeedbackMessage(''), 3000);
    }
  };

  return (
    <>
      <button
        style={defaultButtonStyle}
        onClick={handleShare}
        onMouseEnter={e => e.currentTarget.style.backgroundColor = hoverStyle.backgroundColor}
        onMouseLeave={e => e.currentTarget.style.backgroundColor = 'var(--info-color)'}
      >
        {buttonText}
      </button>
      {feedbackMessage &&
        <span style={{ marginLeft: 'var(--spacing-sm)', fontSize: 'var(--font-size-sm)', color: 'var(--secondary-text-color)' }}>
          {feedbackMessage}
        </span>
      }
    </>
  );
}

export default ShareButton;
