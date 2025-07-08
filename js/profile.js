document.addEventListener('DOMContentLoaded', () => {
    const profileForm = document.getElementById('profileForm');
    const profileSaveStatus = document.getElementById('profileSaveStatus');
    const localStorageKey = 'findMeUserProfile';

    // Display elements
    const displayProfilePic = document.getElementById('displayProfilePic');
    const displayDName = document.getElementById('displayDName');
    const displayBio = document.getElementById('displayBio');
    const displayInterests = document.getElementById('displayInterests');
    const displayLocation = document.getElementById('displayLocation');
    const displayWebsite = document.getElementById('displayWebsite');
    const displayWebsiteLink = document.getElementById('displayWebsiteLink');


    // Form input elements
    const displayNameInput = document.getElementById('displayName');
    const userBioInput = document.getElementById('userBio');
    const userInterestsInput = document.getElementById('userInterests');
    const userLocationInput = document.getElementById('userLocation');
    const userWebsiteInput = document.getElementById('userWebsite');
    const profilePictureFileInput = document.getElementById('profilePictureFile');

    function loadProfile() {
        const profileDataString = localStorage.getItem(localStorageKey);
        if (profileDataString) {
            const profileData = JSON.parse(profileDataString);

            // Populate display area
            if (profileData.displayName) displayDName.textContent = profileData.displayName;
            if (profileData.userBio) displayBio.textContent = profileData.userBio;
            if (profileData.userInterests) displayInterests.textContent = profileData.userInterests;
            if (profileData.userLocation) displayLocation.textContent = profileData.userLocation;
            if (profileData.userWebsite) {
                displayWebsite.textContent = profileData.userWebsite;
                displayWebsiteLink.href = profileData.userWebsite;
            } else {
                displayWebsite.textContent = 'Not set';
                displayWebsiteLink.removeAttribute('href');
            }
            if (profileData.profilePictureDataUrl) {
                displayProfilePic.src = profileData.profilePictureDataUrl;
            } else {
                displayProfilePic.src = 'images/icons/icon-192x192.png'; // Default
            }


            // Populate form fields
            if (displayNameInput && profileData.displayName) displayNameInput.value = profileData.displayName;
            if (userBioInput && profileData.userBio) userBioInput.value = profileData.userBio;
            if (userInterestsInput && profileData.userInterests) userInterestsInput.value = profileData.userInterests;
            if (userLocationInput && profileData.userLocation) userLocationInput.value = profileData.userLocation;
            if (userWebsiteInput && profileData.userWebsite) userWebsiteInput.value = profileData.userWebsite;
            // Note: File input cannot be programmatically repopulated for security reasons.
            // User will have to re-select if they want to change/keep an image not shown in preview.
        } else {
            // Set defaults for display area if no profile data
            displayDName.textContent = 'Not set';
            displayBio.textContent = 'Not set';
            displayInterests.textContent = 'Not set';
            displayLocation.textContent = 'Not set';
            displayWebsite.textContent = 'Not set';
            displayWebsiteLink.removeAttribute('href');
            displayProfilePic.src = 'images/icons/icon-192x192.png'; // Default
        }
    }

    if (profileForm) {
        profileForm.addEventListener('submit', function(event) {
            event.preventDefault();

            const displayName = displayNameInput.value;
            const userBio = userBioInput.value;
            const userInterests = userInterestsInput.value;
            const userLocation = userLocationInput.value;
            const userWebsite = userWebsiteInput.value;
            const profilePictureFile = profilePictureFileInput.files[0];

            const reader = new FileReader();

            reader.onloadend = function() {
                const profilePictureDataUrl = reader.result; // Contains Base64 data URL or null

                // If no new file is selected, try to keep the existing one from localStorage
                let finalImageDataUrl = profilePictureDataUrl;
                if (!profilePictureFile) { // No new file chosen
                    const existingProfile = JSON.parse(localStorage.getItem(localStorageKey));
                    if (existingProfile && existingProfile.profilePictureDataUrl) {
                        finalImageDataUrl = existingProfile.profilePictureDataUrl;
                    }
                }

                const profileData = {
                    displayName: displayName,
                    userBio: userBio,
                    userInterests: userInterests,
                    userLocation: userLocation,
                    userWebsite: userWebsite,
                    profilePictureDataUrl: finalImageDataUrl
                };

                localStorage.setItem(localStorageKey, JSON.stringify(profileData));

                if (profileSaveStatus) {
                    profileSaveStatus.textContent = 'Profile saved successfully!';
                    profileSaveStatus.style.color = 'green';
                    setTimeout(() => { profileSaveStatus.textContent = ''; }, 3000);
                }

                loadProfile(); // Refresh display and form values
            }

            if (profilePictureFile) {
                reader.readAsDataURL(profilePictureFile);
            } else {
                // If no file is selected, we still need to trigger onloadend to save other data
                // and potentially preserve the old image.
                reader.onloadend();
            }
        });
    } else {
        console.warn("Element with ID 'profileForm' not found.");
    }

    // Initial load of profile data
    loadProfile();
});
