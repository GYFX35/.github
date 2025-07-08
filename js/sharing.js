document.addEventListener('DOMContentLoaded', () => {
    const shareButtons = document.querySelectorAll('.share-button');

    // Prioritized list of social media for fallback
    const socialFallbacks = {
        facebook: {
            url: 'https://www.facebook.com/sharer/sharer.php?u={url}&quote={text}',
            name: 'Facebook'
        },
        linkedin: {
            url: 'https://www.linkedin.com/shareArticle?mini=true&url={url}&title={title}&summary={text}',
            name: 'LinkedIn'
        },
        whatsapp: {
            url: 'https://api.whatsapp.com/send?text={title}%20{url}%20{text}',
            name: 'WhatsApp'
        }
        // TikTok, Instagram, YouTube, WeChat are harder to do with simple URL shares
        // and often require app-specific integrations or are mobile-only.
    };

    function createFallbackLinks(shareData, parentElement) {
        // Clear previous fallbacks if any
        const existingFallbackContainer = parentElement.querySelector('.fallback-sharing-links');
        if (existingFallbackContainer) {
            existingFallbackContainer.remove();
        }

        const fallbackContainer = document.createElement('div');
        fallbackContainer.className = 'fallback-sharing-links';
        fallbackContainer.style.marginTop = '10px';

        for (const platform in socialFallbacks) {
            const details = socialFallbacks[platform];
            let shareUrl = details.url
                .replace('{url}', encodeURIComponent(shareData.url || window.location.href))
                .replace('{title}', encodeURIComponent(shareData.title || document.title))
                .replace('{text}', encodeURIComponent(shareData.text || ''));

            const link = document.createElement('a');
            link.href = shareUrl;
            link.textContent = `Share on ${details.name}`;
            link.target = '_blank'; // Open in new tab
            link.rel = 'noopener noreferrer';
            link.style.display = 'block';
            link.style.marginBottom = '5px';
            fallbackContainer.appendChild(link);
        }

        // Copy Link button
        const copyButton = document.createElement('button');
        copyButton.textContent = 'Copy Link';
        copyButton.className = 'copy-link-button';
        copyButton.addEventListener('click', async () => {
            try {
                await navigator.clipboard.writeText(shareData.url || window.location.href);
                copyButton.textContent = 'Copied!';
                setTimeout(() => { copyButton.textContent = 'Copy Link'; }, 2000);
            } catch (err) {
                console.error('Failed to copy: ', err);
                alert('Failed to copy link.');
            }
        });
        fallbackContainer.appendChild(copyButton);
        parentElement.appendChild(fallbackContainer);
    }


    shareButtons.forEach(button => {
        button.addEventListener('click', async (event) => {
            const container = event.target.closest('[data-share-title]'); // Assumes shareable item has a container with data attributes
            if (!container) {
                console.error('Share button clicked, but no parent container with share data found.');
                return;
            }

            const shareTitle = container.dataset.shareTitle || document.title;
            const shareText = container.dataset.shareText || 'Check this out!';
            // Use current page URL as canonical URL for sharing. More specific URLs could be set as data-share-url if needed.
            const shareUrl = container.dataset.shareUrl || window.location.href;


            const shareData = {
                title: shareTitle,
                text: shareText,
                url: shareUrl,
            };

            if (navigator.share) {
                try {
                    await navigator.share(shareData);
                    console.log('Content shared successfully via Web Share API');
                } catch (err) {
                    console.error('Error using Web Share API:', err);
                    // If Web Share API fails (e.g., user cancels, or other error), show fallbacks
                    createFallbackLinks(shareData, button.parentElement);
                }
            } else {
                console.log('Web Share API not supported, showing fallback links.');
                createFallbackLinks(shareData, button.parentElement);
            }
        });
    });
});
