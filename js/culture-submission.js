document.addEventListener('DOMContentLoaded', () => {
    const cultureSubmissionForm = document.getElementById('cultureSubmissionForm');
    const sharedStoriesContainer = document.getElementById('shared-stories-container');
    const localStorageKey = 'findMeSharedCultureStories';

    // Function to render stories from localStorage
    function renderSharedStories() {
        const stories = JSON.parse(localStorage.getItem(localStorageKey)) || [];

        if (!sharedStoriesContainer) {
            console.error('Error: shared-stories-container not found.');
            return;
        }

        sharedStoriesContainer.innerHTML = ''; // Clear existing stories

        if (stories.length === 0) {
            sharedStoriesContainer.innerHTML = '<p>No stories shared yet. Use the form above to share yours!</p>';
            return;
        }

        stories.forEach((story, index) => {
            const storyElement = document.createElement('div');
            storyElement.className = 'shared-story-item'; // For styling
            storyElement.style.border = '1px solid #eee';
            storyElement.style.padding = '15px';
            storyElement.style.marginBottom = '15px';
            storyElement.style.borderRadius = '5px';

            let htmlContent = `
                <h4>${escapeHTML(story.title)}</h4>
                <p><strong>Origin:</strong> ${escapeHTML(story.origin)}</p>
                <p>${escapeHTML(story.description).replace(/\n/g, '<br>')}</p>
            `;

            if (story.imageDataUrl) {
                htmlContent += `<img src="${story.imageDataUrl}" alt="${escapeHTML(story.title)}" style="max-width: 100%; height: auto; border-radius: 4px; margin-top: 10px;">`;
            }

            // Add a delete button
            htmlContent += `<button class="delete-story-button" data-index="${index}" style="margin-top: 10px; background-color: #dc3545; color: white; border: none; padding: 5px 10px; border-radius: 3px; cursor: pointer;">Delete</button>`;

            storyElement.innerHTML = htmlContent;
            sharedStoriesContainer.appendChild(storyElement);
        });

        // Add event listeners to new delete buttons
        addDeleteButtonListeners();
    }

    function addDeleteButtonListeners() {
        const deleteButtons = document.querySelectorAll('.delete-story-button');
        deleteButtons.forEach(button => {
            button.addEventListener('click', function() {
                const storyIndex = parseInt(this.dataset.index, 10);
                deleteStory(storyIndex);
            });
        });
    }

    function deleteStory(index) {
        let stories = JSON.parse(localStorage.getItem(localStorageKey)) || [];
        if (index >= 0 && index < stories.length) {
            stories.splice(index, 1); // Remove the story at the given index
            localStorage.setItem(localStorageKey, JSON.stringify(stories));
            renderSharedStories(); // Re-render the stories
        }
    }

    // Helper to escape HTML to prevent XSS
    function escapeHTML(str) {
        if (typeof str !== 'string') return '';
        return str.replace(/[&<>"']/g, function (match) {
            return {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#39;'
            }[match];
        });
    }

    if (cultureSubmissionForm) {
        cultureSubmissionForm.addEventListener('submit', function(event) {
            event.preventDefault();

            const title = document.getElementById('cultureTitle').value;
            const description = document.getElementById('cultureDescription').value;
            const origin = document.getElementById('cultureOrigin').value;
            const imageFile = document.getElementById('cultureImage').files[0];

            const reader = new FileReader();

            reader.onloadend = function() {
                // This will be called once the file is read
                const imageDataUrl = reader.result; // Contains Base64 data URL or null if no file

                const newStory = {
                    title: title,
                    description: description,
                    origin: origin,
                    imageDataUrl: imageDataUrl // This can be null if no image was selected
                };

                let stories = JSON.parse(localStorage.getItem(localStorageKey)) || [];
                stories.push(newStory);
                localStorage.setItem(localStorageKey, JSON.stringify(stories));

                renderSharedStories(); // Re-render stories including the new one
                cultureSubmissionForm.reset(); // Clear the form
            }

            if (imageFile) {
                reader.readAsDataURL(imageFile); // Read the image file
            } else {
                reader.onloadend(); // Call onloadend directly if no file, so imageDataUrl is null
            }
        });
    } else {
        console.warn("Element with ID 'cultureSubmissionForm' not found.");
    }

    // Initial render of stories when the page loads
    renderSharedStories();
});
