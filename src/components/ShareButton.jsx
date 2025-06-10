import React, { useState } from 'react';

/**
 * A button component to share content using the Web Share API
 * with a fallback to copying the URL to the clipboard.
 *
 * Props:
 *  - title (string): The title of the content to be shared.
 *  - text (string): The descriptive text to be shared.
 *  - url (string): The URL to be shared. Defaults to current window URL if not provided.
 *  - buttonText (string, optional): Text for the button. Defaults to "Share".
 *  - buttonStyle (object, optional): Custom styles for the button.
 */
function ShareButton({ title, text, url, buttonText = "Share", buttonStyle }) {
  const [feedbackMessage, setFeedbackMessage] = useState('');

  const shareData = {
    title: title || document.title,
    text: text || '',
    url: url || window.location.href,
  };

  const defaultButtonStyle = {
    backgroundColor: '#17a2b8', // Info color
    color: 'white',
    border: 'none',
    padding: '8px 12px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    margin: '5px',
    ...buttonStyle,
  };

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
      <button style={defaultButtonStyle} onClick={handleShare}>
        {buttonText}
      </button>
      {feedbackMessage && <span style={{ marginLeft: '10px', fontSize: '0.9em', color: '#555' }}>{feedbackMessage}</span>}
    </>
  );
}

export default ShareButton;
