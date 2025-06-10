// src/components/CameraCapture.jsx
import React, { useState, useRef, useCallback } from 'react';

function CameraCapture() {
  const [stream, setStream] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [error, setError] = useState('');
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const styles = {
    container: {
      margin: 'var(--spacing-lg) auto',
      padding: 'var(--spacing-lg)',
      border: 'var(--border-width) solid var(--border-color)',
      borderRadius: 'var(--border-radius-lg)',
      maxWidth: '500px',
      textAlign: 'center',
      backgroundColor: 'var(--background-color)',
    },
    video: {
      width: '100%',
      maxHeight: '300px',
      backgroundColor: '#000', // Keep black bg for video contrast
      borderRadius: 'var(--border-radius)',
      marginBottom: 'var(--spacing-md)',
      border: 'var(--border-width) solid var(--border-color)',
    },
    canvas: {
      display: 'none',
    },
    img: {
      maxWidth: '100%',
      maxHeight: '300px',
      borderRadius: 'var(--border-radius)',
      border: 'var(--border-width) solid var(--border-color)',
      marginTop: 'var(--spacing-md)',
    },
    button: { // Base button style, specific colors below
      border: 'none',
      padding: 'var(--spacing-sm) var(--spacing-md)',
      borderRadius: 'var(--border-radius)',
      cursor: 'pointer',
      margin: 'var(--spacing-xs)',
      fontSize: 'var(--font-size-base)',
      fontWeight: 'var(--font-weight-normal)',
      transition: 'background-color 0.15s ease-in-out, opacity 0.15s ease-in-out',
    },
    error: {
      color: 'var(--danger-color)',
      marginTop: 'var(--spacing-md)',
      fontSize: 'var(--font-size-sm)',
    }
  };

  const primaryButtonStyle = { ...styles.button, backgroundColor: 'var(--primary-color)', color: 'white' };
  const secondaryButtonStyle = { ...styles.button, backgroundColor: 'var(--secondary-text-color)', color: 'white' };
  const successButtonStyle = { ...styles.button, backgroundColor: 'var(--success-color)', color: 'white' };

  const openCamera = async () => {
    setError('');
    setCapturedImage(null);
    if (stream) { // If stream exists, stop it before opening a new one
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' }, // Prefer front camera
        audio: false
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
        setError("Camera not found. Please ensure a camera is connected and enabled.");
      } else if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        setError("Permission to access camera was denied. Please enable it in your browser settings.");
      } else {
        setError(`Error accessing camera: ${err.message}`);
      }
    }
  };

  const captureImage = useCallback(() => {
    if (videoRef.current && canvasRef.current && stream) {
      setError('');
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
      const dataUrl = canvas.toDataURL('image/png');
      setCapturedImage(dataUrl);

      // Stop the stream after capturing
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  }, [stream]);

  const handleUploadPlaceholder = () => {
    if (capturedImage) {
      alert("Placeholder: Uploading captured image... (Data URL length: " + capturedImage.length + ")");
      // In a real app, you would convert dataUrl to a Blob and upload via FormData
      // For example:
      // const blob = await (await fetch(capturedImage)).blob();
      // const formData = new FormData();
      // formData.append('profileImage', blob, 'capture.png');
      // fetch('/api/upload-image', { method: 'POST', body: formData })
      //   .then(response => response.json())
      //   .then(data => console.log('Upload successful:', data))
      //   .catch(error => console.error('Upload error:', error));
    } else {
      alert("No image captured to upload.");
    }
  };

  const closeCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setCapturedImage(null);
    setError('');
  };

  return (
    <div style={styles.container}>
      <h4 style={{marginBottom: 'var(--spacing-md)'}}>Camera Access</h4>
      {!stream && !capturedImage && (
        <button style={primaryButtonStyle} onClick={openCamera}>Open Camera</button>
      )}

      {stream && (
        <div>
          <video ref={videoRef} autoPlay playsInline style={styles.video}></video>
          <button style={primaryButtonStyle} onClick={captureImage}>Capture Image</button>
          <button style={secondaryButtonStyle} onClick={closeCamera}>Close Camera</button>
        </div>
      )}

      <canvas ref={canvasRef} style={styles.canvas}></canvas>

      {capturedImage && (
        <div>
          <h5 style={{marginTop: 'var(--spacing-lg)', marginBottom: 'var(--spacing-xs)'}}>Captured Image Preview:</h5>
          <img src={capturedImage} alt="Captured" style={styles.img} />
          <div>
            <button style={successButtonStyle} onClick={handleUploadPlaceholder}>Upload Image (Placeholder)</button>
            <button style={secondaryButtonStyle} onClick={() => { setCapturedImage(null); setError(''); }}>Clear Capture</button>
            <button style={primaryButtonStyle} onClick={openCamera}>Retake</button>
          </div>
        </div>
      )}
      {error && <p style={styles.error}>{error}</p>}
    </div>
  );
}

export default CameraCapture;
