import React, { useRef, useState, useCallback, useEffect } from 'react';
import './CameraCapture.css';

function CameraCapture({ onCapture, onClear }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isActive, setIsActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [error, setError] = useState(null);

  const [stream, setStream] = useState(null);

  const startCamera = async () => {
    setError(null);
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      setStream(s);
      setIsActive(true);
    } catch (err) {
      console.error("Error accessing camera:", err);
      setError("Could not access camera. Please ensure you have given permission.");
    }
  };

  useEffect(() => {
    if (isActive && stream && videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [isActive, stream]);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsActive(false);
  }, [stream]);

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      const imageData = canvas.toDataURL('image/jpeg');
      setCapturedImage(imageData);
      onCapture(imageData);
      stopCamera();
    }
  };

  const clearPhoto = () => {
    setCapturedImage(null);
    onClear();
    startCamera();
  };

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  return (
    <div className="camera-capture-container">
      <h3>Add Visual Context (Optional)</h3>

      {error && <p className="error-message">{error}</p>}

      {!isActive && !capturedImage && (
        <button onClick={startCamera} className="camera-button start-button">
          Open Camera
        </button>
      )}

      <div style={{ display: isActive ? 'block' : 'none' }} className="camera-preview">
        <video ref={videoRef} autoPlay playsInline muted className="video-feed" style={{ border: '5px solid red' }} />
        <div className="camera-controls">
          <button onClick={capturePhoto} className="camera-button capture-button">
            Capture Photo
          </button>
          <button onClick={stopCamera} className="camera-button stop-button">
            Cancel
          </button>
        </div>
      </div>

      {capturedImage && (
        <div className="captured-preview">
          <img src={capturedImage} alt="Captured context" className="captured-image" />
          <button onClick={clearPhoto} className="camera-button clear-button">
            Retake Photo
          </button>
        </div>
      )}

      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );
}

export default CameraCapture;
