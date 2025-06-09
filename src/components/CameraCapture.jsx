import React, { useState, useRef, useCallback } from 'react';

function CameraCapture() {
  const [stream, setStream] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [error, setError] = useState('');
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const styles = {
    container: {
      margin: '20px auto',
      padding: '20px',
      border: '1px solid #ccc',
      borderRadius: '8px',
      maxWidth: '500px',
      textAlign: 'center',
    },
    video: {
      width: '100%',
      maxHeight: '300px',
      backgroundColor: '#000',
      borderRadius: '4px',
      marginBottom: '10px',
      border: '1px solid #ddd',
    },
    canvas: {
      display: 'none', // Hidden canvas for processing
    },
    img: {
      maxWidth: '100%',
      maxHeight: '300px',
      borderRadius: '4px',
      border: '1px solid #ddd',
      marginTop: '10px',
    },
    button: {
      backgroundColor: '#007bff',
      color: 'white',
      border: 'none',
      padding: '10px 15px',
      borderRadius: '4px',
      cursor: 'pointer',
      margin: '5px',
      fontSize: '14px',
    },
    error: {
      color: 'red',
      marginTop: '10px',
    }
  };

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
      <h4>Camera Access</h4>
      {!stream && !capturedImage && (
        <button style={styles.button} onClick={openCamera}>Open Camera</button>
      )}

      {stream && (
        <div>
          <video ref={videoRef} autoPlay playsInline style={styles.video}></video>
          <button style={styles.button} onClick={captureImage}>Capture Image</button>
          <button style={{...styles.button, backgroundColor: '#6c757d'}} onClick={closeCamera}>Close Camera</button>
        </div>
      )}

      <canvas ref={canvasRef} style={styles.canvas}></canvas>

      {capturedImage && (
        <div>
          <h4>Captured Image Preview:</h4>
          <img src={capturedImage} alt="Captured" style={styles.img} />
          <div>
            <button style={styles.button} onClick={handleUploadPlaceholder}>Upload Image (Placeholder)</button>
            <button style={{...styles.button, backgroundColor: '#6c757d'}} onClick={() => { setCapturedImage(null); setError(''); }}>Clear Capture</button>
            <button style={{...styles.button, backgroundColor: '#28a745'}} onClick={openCamera}>Retake</button>
          </div>
        </div>
      )}
      {error && <p style={styles.error}>{error}</p>}
    </div>
  );
}

export default CameraCapture;
