// src/components/CameraCapture.jsx
import React, { useState, useRef, useCallback, useEffect } from 'react';

function CameraCapture() {
  const [stream, setStream] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [permissionStatus, setPermissionStatus] = useState('idle'); // 'idle', 'pending', 'granted', 'denied'
  const [error, setError] = useState(null);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const startCamera = useCallback(async () => {
    setError(null);
    setPermissionStatus('pending');
    if (stream) { // If stream already exists, stop it first
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setCapturedImage(null); // Clear previous capture

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setError('Camera API not supported by this browser.');
      setPermissionStatus('denied'); // Or a new status like 'notsupported'
      return;
    }

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' } // Default to front camera
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setPermissionStatus('granted');
    } catch (err) {
      console.error("Error accessing camera:", err);
      setError(`Error accessing camera: ${err.name} - ${err.message}`);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setPermissionStatus('denied');
      } else {
        setPermissionStatus('idle'); // Or some other error state
      }
    }
  }, [stream]); // Added stream to dependency array

  const capturePhoto = useCallback(() => {
    setError(null);
    if (!videoRef.current || !canvasRef.current || !stream) {
      setError('Camera stream not available or component not ready.');
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;

    // Set canvas dimensions to match video stream
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const context = canvas.getContext('2d');
    if (!context) {
        setError('Could not get canvas context.');
        return;
    }
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    try {
      const imageDataUrl = canvas.toDataURL('image/jpeg', 0.9); // Use JPEG with quality 0.9
      setCapturedImage(imageDataUrl);
      // Optionally stop the camera after capture
      // stopCamera(); // User might want to retake immediately
    } catch (e) {
      console.error("Error converting canvas to data URL:", e);
      setError("Failed to capture image. " + e.message);
    }

  }, [videoRef, canvasRef, stream]); // Added stream to dependency array

  const stopCamera = useCallback(() => {
    setError(null);
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    setStream(null);
    // Keep permissionStatus as 'granted' if it was, so user doesn't have to re-request
    // setPermissionStatus('idle'); // Or set based on whether they can restart
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    console.log('Camera stopped.');
  }, [stream]);

  const resetCapture = () => {
    setCapturedImage(null);
    setError(null);
    // If camera was stopped after capture, and permission is still granted, restart it.
    // This depends on desired UX. For now, user has to click "Start Camera" again if stopped.
    if (!stream && permissionStatus === 'granted') {
        // startCamera(); // Or prompt user to start again
    }
  };

  // Effect to stop camera when component unmounts
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);


  return (
    <div className="camera-capture">
      <h2>Photo Capture</h2>

      {permissionStatus === 'idle' && !stream && !capturedImage && (
        <p>Click "Start Camera" to begin.</p>
      )}
      {permissionStatus === 'pending' && <p>Requesting camera permission...</p>}
      {permissionStatus === 'denied' && (
        <p style={{ color: 'red' }}>
          Camera permission denied. Please enable it in your browser settings and refresh.
        </p>
      )}
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}

      {!capturedImage && (
        <>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            style={{ width: '100%', maxWidth: '640px', border: '1px solid black', backgroundColor: '#333', display: stream ? 'block' : 'none' }}
          />
          {!stream && permissionStatus !== 'denied' && permissionStatus !== 'pending' && (
            <button onClick={startCamera}>
              Start Camera
            </button>
          )}
          {stream && (
            <div style={{ marginTop: '10px' }}>
              <button onClick={capturePhoto} disabled={!stream}>Capture Photo</button>
              <button onClick={stopCamera} style={{ marginLeft: '10px' }} disabled={!stream}>Stop Camera</button>
            </div>
          )}
        </>
      )}

      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {capturedImage && (
        <div className="captured-preview" style={{ marginTop: '20px' }}>
          <h3>Captured Photo:</h3>
          <img src={capturedImage} alt="Captured" style={{ maxWidth: '100%', maxHeight: '480px', border: '1px solid black' }} />
          <div style={{ marginTop: '10px' }}>
            <button onClick={resetCapture} style={{ marginRight: '10px' }}>Retake Photo</button>
            {/* <button>Use Photo</button>  // Placeholder for further action */}
          </div>
        </div>
      )}
    </div>
  );
}

export default CameraCapture;
