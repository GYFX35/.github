import React from 'react';
import AffiliateLinkSection from './AffiliateLinkSection'; // Import AffiliateLinkSection

function UserProfile() {
  return (
    <div>
      <h1>User Profile</h1>
      <p>This is the user profile page.</p>
      {/* Add AffiliateLinkSection placeholder */}
      <AffiliateLinkSection title="User's Recommendations" />
    </div>
  );
}

export default UserProfile;
