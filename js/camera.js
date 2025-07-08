document.addEventListener('DOMContentLoaded', () => {
    // Common camera elements - adjust selectors if they become more specific per page
    const videoElement = document.getElementById('cameraFeed');
    const capturedImageElement = document.getElementById('capturedImage');
    const startCameraButton = document.getElementById('startCamera');
    const captureButton = document.getElementById('captureImage');
    const retakeButton = document.getElementById('retakeImage');
    const cameraContainer = document.getElementById('cameraContainer'); // Used to hide/show camera UI

    let stream = null;

    async function startCamera() {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            try {
                stream = await navigator.mediaDevices.getUserMedia({ video: true });
                videoElement.srcObject = stream;
                videoElement.style.display = 'block';
                capturedImageElement.style.display = 'none';
                if(cameraContainer) cameraContainer.style.display = 'block'; // Show camera UI
                if(startCameraButton) startCameraButton.style.display = 'none'; // Hide start button
                if(captureButton) captureButton.style.display = 'inline-block';
                if(retakeButton) retakeButton.style.display = 'none';
                console.log("Camera started");
            } catch (error) {
                console.error("Error accessing camera: ", error);
                alert("Could not access the camera. Please ensure permission is granted and try again.");
                if(cameraContainer && startCameraButton) { // If error, ensure start button is visible if container exists
                    cameraContainer.style.display = 'block';
                    startCameraButton.style.display = 'inline-block';
                }
            }
        } else {
            alert('getUserMedia is not supported by this browser.');
        }
    }

    function captureImage() {
        if (stream) {
            const canvas = document.createElement('canvas');
            canvas.width = videoElement.videoWidth;
            canvas.height = videoElement.videoHeight;
            const context = canvas.getContext('2d');
            context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

            capturedImageElement.src = canvas.toDataURL('image/png');
            capturedImageElement.style.display = 'block';
            videoElement.style.display = 'none';
            if(captureButton) captureButton.style.display = 'none';
            if(retakeButton) retakeButton.style.display = 'inline-block';
            stopCameraStream(); // Stop stream after capture
            console.log("Image captured");
        }
    }

    function retakeImage() {
        capturedImageElement.style.display = 'none';
        capturedImageElement.src = '#'; // Clear previous image
        if(captureButton) captureButton.style.display = 'inline-block';
        if(retakeButton) retakeButton.style.display = 'none';
        startCamera(); // Restart camera
    }

    function stopCameraStream() {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            stream = null;
            console.log("Camera stream stopped");
        }
    }

    // Event listeners for buttons that might exist on the page
    if (startCameraButton) {
        startCameraButton.addEventListener('click', startCamera);
    }
    if (captureButton) {
        captureButton.addEventListener('click', captureImage);
    }
    if (retakeButton) {
        retakeButton.addEventListener('click', retakeImage);
    }

    // Fallback: If only a general camera trigger exists (e.g. a single button to start and show UI)
    // This is useful if the camera UI is initially hidden.
    const generalCameraTrigger = document.querySelector('.enable-camera-access');
    if (generalCameraTrigger && cameraContainer && !startCameraButton) {
        generalCameraTrigger.addEventListener('click', () => {
            cameraContainer.style.display = 'block'; // Show the camera section
            startCamera(); // Then start the camera
        });
    }
});
