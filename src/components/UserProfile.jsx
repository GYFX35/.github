// src/components/UserProfile.jsx
import React, { useState } from 'react';
import AffiliateLinkSection from './AffiliateLinkSection';
import CameraCapture from './CameraCapture';

function UserProfile() {
  const [showCameraCapture, setShowCameraCapture] = useState(false);

  const profileCardStyle = {
    border: '1px solid #ddd',
    borderRadius: '8px',
    padding: '20px',
    maxWidth: '600px',
    margin: '20px auto',
    textAlign: 'center',
    boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
  };

  const profileImagePlaceholder = {
    width: '150px',
    height: '150px',
    borderRadius: '50%',
    backgroundColor: '#e0e0e0',
    margin: '0 auto 20px auto',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#777',
    fontSize: '14px',
    fontWeight: 'bold',
  };

  const buttonStyle = {
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    padding: '10px 15px',
    borderRadius: '4px',
    cursor: 'pointer',
    margin: '5px',
    fontSize: '14px',
  };

  const settingsSectionStyle = {
    marginTop: '30px',
    paddingTop: '20px',
    borderTop: '1px solid #eee',
    textAlign: 'left', // Align text to the left for settings
  };

  const settingItemStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 0',
  };

  const mockToggleStyle = { // Simple checkbox as a mock toggle
    width: '20px',
    height: '20px',
    cursor: 'pointer',
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
          style={buttonStyle}
          onClick={() => setShowCameraCapture(true)}
        >
          Update Profile Picture with Camera
        </button>
      ) : (
        <div>
          <p><em>(Ideally, the camera capture UI below would appear in a modal)</em></p>
          <CameraCapture />
          <button
            style={{...buttonStyle, backgroundColor: '#6c757d', marginTop: '10px'}}
            onClick={() => setShowCameraCapture(false)}
          >
            Cancel Update / Close Camera
          </button>
        </div>
      )}

      <div style={settingsSectionStyle}>
        <h3>Notification Settings</h3>
        <p style={{fontSize: '0.9em', color: '#666'}}>
          (These are conceptual placeholders. Actual enabling/disabling requires native app integration and backend logic.)
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

      <hr style={{margin: '30px 0'}} />

      {!showCameraCapture && (
         <AffiliateLinkSection title="User's Recommendations" />
      )}
    </div>
  );
}

export default UserProfile;
