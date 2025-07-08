document.addEventListener('DOMContentLoaded', () => {
    const videoElement = document.getElementById('cameraFeedCulture');
    const capturedImageElement = document.getElementById('capturedImageCulture');
    const startCameraButton = document.getElementById('startCameraCulture');
    const captureButton = document.getElementById('captureImageCulture');
    const retakeButton = document.getElementById('retakeImageCulture');
    const cameraContainer = document.getElementById('cameraContainerCulture');

    let stream = null;

    async function startCamera() {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            try {
                stream = await navigator.mediaDevices.getUserMedia({ video: true });
                videoElement.srcObject = stream;
                videoElement.style.display = 'block';
                capturedImageElement.style.display = 'none';
                if (cameraContainer) cameraContainer.style.display = 'block';
                if (startCameraButton) startCameraButton.style.display = 'none';
                if (captureButton) captureButton.style.display = 'inline-block';
                if (retakeButton) retakeButton.style.display = 'none';
                console.log("Culture page camera started");
            } catch (error) {
                console.error("Error accessing camera on culture page: ", error);
                alert("Could not access the camera. Please ensure permission is granted and try again.");
                if (cameraContainer && startCameraButton) {
                    cameraContainer.style.display = 'block'; // Or hide, depending on desired UX on error
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
            if (captureButton) captureButton.style.display = 'none';
            if (retakeButton) retakeButton.style.display = 'inline-block';
            stopCameraStream();
            console.log("Culture moment image captured");
        }
    }

    function retakeImage() {
        capturedImageElement.style.display = 'none';
        capturedImageElement.src = '#';
        if (captureButton) captureButton.style.display = 'inline-block';
        if (retakeButton) retakeButton.style.display = 'none';
        startCamera();
    }

    function stopCameraStream() {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            stream = null;
            console.log("Culture page camera stream stopped");
        }
    }

    if (startCameraButton) {
        startCameraButton.addEventListener('click', startCamera);
    }
    if (captureButton) {
        captureButton.addEventListener('click', captureImage);
    }
    if (retakeButton) {
        retakeButton.addEventListener('click', retakeImage);
    }
});
