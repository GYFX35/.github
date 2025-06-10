// src/components/UserProfile.jsx
import React, { useState } from 'react';
import AffiliateLinkSection from './AffiliateLinkSection';
import CameraCapture from './CameraCapture';

function UserProfile() {
  const [showCameraCapture, setShowCameraCapture] = useState(false);

  const profileCardStyle = {
    border: 'var(--border-width) solid var(--border-color)',
    borderRadius: 'var(--border-radius-lg)',
    padding: 'var(--spacing-lg)',
    maxWidth: '600px',
    margin: 'var(--spacing-lg) auto',
    textAlign: 'center',
    backgroundColor: 'var(--background-color)', // Ensure card bg
    boxShadow: '0 0.125rem 0.25rem rgba(0, 0, 0, 0.075)' // Standard shadow
  };

  const profileImagePlaceholder = {
    width: '150px',
    height: '150px',
    borderRadius: '50%',
    backgroundColor: 'var(--light-background-color)',
    margin: '0 auto var(--spacing-lg) auto',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--secondary-text-color)',
    fontSize: 'var(--font-size-sm)',
    fontWeight: 'var(--font-weight-bold)',
    border: 'var(--border-width) dashed var(--border-color)'
  };

  const baseButtonStyle = { // Base for buttons in this component
    border: 'none',
    padding: 'var(--spacing-sm) var(--spacing-md)',
    borderRadius: 'var(--border-radius)',
    cursor: 'pointer',
    margin: 'var(--spacing-xs)',
    fontSize: 'var(--font-size-base)',
    fontWeight: 'var(--font-weight-normal)',
    textAlign: 'center',
    transition: 'background-color 0.15s ease-in-out, border-color 0.15s ease-in-out',
  };

  const primaryButtonStyle = {
    ...baseButtonStyle,
    backgroundColor: 'var(--primary-color)',
    color: 'white',
  };

  const secondaryButtonStyle = {
    ...baseButtonStyle,
    backgroundColor: 'var(--secondary-color)',
    color: 'white',
  };

  const settingsSectionStyle = {
    marginTop: 'var(--spacing-lg)',
    paddingTop: 'var(--spacing-lg)',
    borderTop: 'var(--border-width) solid var(--border-color)',
    textAlign: 'left',
  };

  const settingItemStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 'var(--spacing-sm) 0',
  };

  const mockToggleStyle = {
    width: '20px',
    height: '20px',
    cursor: 'pointer',
    accentColor: 'var(--primary-color)' // Theme the checkbox color
  };

  return (
    <div style={profileCardStyle}>
      <div style={profileImagePlaceholder}>
        <span>Profile Picture</span>
      </div>
      <h1>User Profile</h1>
      <p>This is the user profile page.</p>

      {!showCameraCapture ? (
        <button
          style={primaryButtonStyle}
          onClick={() => setShowCameraCapture(true)}
        >
          Update Profile Picture
        </button>
      ) : (
        <div>
          <p style={{fontSize: 'var(--font-size-sm)', color: 'var(--secondary-text-color)'}}>
            <em>(Ideally, the camera capture UI below would appear in a modal)</em>
          </p>
          <CameraCapture /> {/* CameraCapture will be themed in a later step */}
          <button
            style={{...secondaryButtonStyle, marginTop: 'var(--spacing-md)'}}
            onClick={() => setShowCameraCapture(false)}
          >
            Cancel / Close Camera
          </button>
        </div>
      )}

      <div style={settingsSectionStyle}>
        <h3>Notification Settings</h3>
        <p style={{fontSize: 'var(--font-size-sm)', color: 'var(--secondary-text-color)'}}>
          (These are conceptual placeholders.)
        </p>
        <div style={settingItemStyle}>
          <label htmlFor="postNotifications">Enable Notifications for New Posts</label>
          <input type="checkbox" id="postNotifications" style={mockToggleStyle} onClick={(e) => e.preventDefault()} />
        </div>
        <div style={settingItemStyle}>
          <label htmlFor="announcementNotifications">Enable Notifications for Announcements</label>
          <input type="checkbox" id="announcementNotifications" style={mockToggleStyle} onClick={(e) => e.preventDefault()} />
        </div>
      </div>

      {!showCameraCapture && (
        <div style={{marginTop: 'var(--spacing-lg)', paddingTop: 'var(--spacing-lg)', borderTop: 'var(--border-width) solid var(--border-color)'}}>
          <AffiliateLinkSection title="User's Recommendations" />
        </div>
      )}
    </div>
  );
}

export default UserProfile;
