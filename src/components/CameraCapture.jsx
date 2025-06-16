// src/components/CameraCapture.jsx
import React, { useState, useRef, useCallback, useEffect } from 'react';

function CameraCapture() {
  const [captureMode, setCaptureMode] = useState('photo');
  const [stream, setStream] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [videoBlobUrl, setVideoBlobUrl] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState('idle');
  const [error, setError] = useState(null);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);

  const stopCurrentStream = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      console.log('Stream tracks stopped.');
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop(); // Stop recording if active
      console.log('MediaRecorder stopped due to stream stop.');
    }
    setStream(null);
    setCapturedImage(null);
    if (videoBlobUrl) { // Clean up previous video blob URL
      URL.revokeObjectURL(videoBlobUrl);
    }
    setVideoBlobUrl(null);
    setIsRecording(false);
    recordedChunksRef.current = [];
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, [stream, videoBlobUrl]); // Added videoBlobUrl

  const handleModeChange = useCallback((newMode) => {
    if (newMode === captureMode) return;
    stopCurrentStream();
    setCaptureMode(newMode);
    setPermissionStatus('idle');
    setError(null);
  }, [captureMode, stopCurrentStream]);

  const startCamera = useCallback(async () => {
    setError(null);
    setPermissionStatus('pending');
    if (stream) { stopCurrentStream(); } // Ensure stream is stopped before starting new one

    console.log(`Attempting to start camera in ${captureMode} mode.`);
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setError('Camera API not supported by this browser.');
      setPermissionStatus('denied'); return;
    }
    let constraints;
    if (captureMode === 'video') {
      constraints = { video: { facingMode: 'user' }, audio: true };
      console.log('Requesting video and audio permissions.');
    } else {
      constraints = { video: { facingMode: 'user' }, audio: false };
      console.log('Requesting video (only) permission.');
    }
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play().catch(playError => console.warn("Video play() promise rejected:", playError));
      }
      setPermissionStatus('granted');
      console.log(`Camera started successfully in ${captureMode} mode.`);
      if (captureMode === 'video') {
        const audioTracks = mediaStream.getAudioTracks();
        if (audioTracks.length > 0) console.log('Audio track acquired:', audioTracks[0].label);
        else console.warn('Audio track requested, but not acquired.');
      }
    } catch (err) {
      console.error("Error accessing media devices:", err);
      setError(`Error accessing media: ${err.name} - ${err.message}`);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') setPermissionStatus('denied');
      else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') { setError('No camera/microphone found.'); setPermissionStatus('denied'); }
      else setPermissionStatus('idle');
    }
  }, [captureMode, stopCurrentStream, stream]); // Re-added stream to deps of startCamera as it's checked

  const capturePhoto = useCallback(() => {
    setError(null);
    if (!videoRef.current || !canvasRef.current || !stream) { setError('Camera stream not available.'); return; }
    const video = videoRef.current; const canvas = canvasRef.current;
    canvas.width = video.videoWidth; canvas.height = video.videoHeight;
    const context = canvas.getContext('2d');
    if (!context) { setError('Could not get canvas context.'); return; }
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    try { const imageDataUrl = canvas.toDataURL('image/jpeg', 0.9); setCapturedImage(imageDataUrl); }
    catch (e) { console.error("Error converting canvas to data URL:", e); setError("Failed to capture image. " + e.message); }
  }, [videoRef, canvasRef, stream]);

  const stopCamera = useCallback(() => { // User action to stop previewing, not necessarily stop recording
    console.log('User clicked Stop Camera Preview button.');
    stopCurrentStream();
  }, [stopCurrentStream]);

  const startRecording = useCallback(() => {
    if (!stream || captureMode !== 'video' ) { // Removed MIME type check for now, will be handled by MediaRecorder itself
      setError('Stream not available or not in video mode.');
      console.error('Pre-requisites for recording not met. Stream:', stream, 'Mode:', captureMode);
      return;
    }
    if (videoBlobUrl) {
        URL.revokeObjectURL(videoBlobUrl);
        setVideoBlobUrl(null);
    }
    recordedChunksRef.current = [];

    try {
      const options = { mimeType: 'video/webm; codecs=vp9,opus' };
      if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        console.warn(`${options.mimeType} not supported, trying vp8,opus`);
        options.mimeType = 'video/webm; codecs=vp8,opus';
        if (!MediaRecorder.isTypeSupported(options.mimeType)) {
          console.warn(`${options.mimeType} not supported, trying default webm`);
          options.mimeType = 'video/webm';
           if (!MediaRecorder.isTypeSupported(options.mimeType)) {
             console.warn(`${options.mimeType} not supported, trying default mp4`);
             options.mimeType = 'video/mp4';
             if (!MediaRecorder.isTypeSupported(options.mimeType)) {
                console.error("No suitable video MIME type supported for MediaRecorder.");
                setError("No suitable video format supported for recording.");
                return;
             }
           }
        }
      }
      console.log("Using MIME type for recording:", options.mimeType);

      mediaRecorderRef.current = new MediaRecorder(stream, options);

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        console.log('Recording stopped. Chunks size:', recordedChunksRef.current.length);
        if (recordedChunksRef.current.length === 0) {
            console.warn("No data chunks recorded.");
            setIsRecording(false);
            return;
        }
        const blob = new Blob(recordedChunksRef.current, { type: options.mimeType });
        const newVideoBlobUrl = URL.createObjectURL(blob);
        setVideoBlobUrl(newVideoBlobUrl);
        console.log('Video available at:', newVideoBlobUrl);
        // setIsRecording(false); // Already set in stopRecording or if stream stops
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setCapturedImage(null);
      setError(null);
      console.log('Recording started.');
    } catch (e) {
      console.error("Error starting MediaRecorder:", e);
      setError("Failed to start video recording. " + e.message);
      setIsRecording(false);
    }
  }, [stream, captureMode, videoBlobUrl]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      // onstop handler will set isRecording to false and create blob.
    }
    setIsRecording(false); // Ensure UI updates immediately
    console.log('Stop recording requested.');
  }, []);


  const resetCapture = () => {
    setCapturedImage(null);
    if (videoBlobUrl) {
      URL.revokeObjectURL(videoBlobUrl);
    }
    setVideoBlobUrl(null);
    recordedChunksRef.current = [];
    setIsRecording(false);
    setError(null);
  };

  useEffect(() => {
    return () => {
      console.log('CameraCapture unmounting, ensuring stream is stopped.');
      stopCurrentStream();
    };
  }, [stopCurrentStream]);

  return (
    <div className="camera-capture">
      <h2>{captureMode === 'photo' ? 'Photo Capture' : 'Video Recording'}</h2>
      <div className="mode-selector" style={{ marginBottom: '20px' }}>
        <button onClick={() => handleModeChange('photo')} disabled={captureMode === 'photo' || permissionStatus === 'pending' || stream !== null || isRecording} style={{ marginRight: '10px', padding: '8px 12px', cursor: 'pointer' }}>Photo Mode</button>
        <button onClick={() => handleModeChange('video')} disabled={captureMode === 'video' || permissionStatus === 'pending' || stream !== null || isRecording} style={{ padding: '8px 12px', cursor: 'pointer' }}>Video Mode</button>
      </div>
      {permissionStatus === 'idle' && !stream && !capturedImage && !videoBlobUrl && (<p>Select mode then click "Start Camera" to begin.</p>)}
      {permissionStatus === 'pending' && <p>Requesting camera/microphone permission...</p>}
      {permissionStatus === 'denied' && (<p style={{ color: 'red' }}>Camera/microphone permission denied. Please enable it in your browser settings and refresh.</p>)}
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}

      {/* Video preview area for live stream or recorded video */}
      <video
        ref={videoRef}
        autoPlay={!videoBlobUrl} // Autoplay only if it's live stream
        playsInline
        muted={!videoBlobUrl} // Mute only if it's live stream, allow sound for recorded video
        controls={!!videoBlobUrl} // Show controls only for recorded video
        src={videoBlobUrl || undefined} // Set src only for recorded video playback
        style={{
          width: '100%',
          maxWidth: '640px',
          border: '1px solid black',
          backgroundColor: '#333',
          display: stream || videoBlobUrl ? 'block' : 'none' // Show if live stream OR if video recorded
        }}
      />

      {permissionStatus === 'granted' && (
        <div style={{ marginTop: '10px' }}>
          {!stream && !videoBlobUrl && !capturedImage && (<button onClick={startCamera} disabled={isRecording}>Start Camera</button>)}

          {stream && captureMode === 'photo' && !isRecording && (
            <>
              <button onClick={capturePhoto}>Capture Photo</button>
              {!capturedImage && <button onClick={stopCamera} style={{ marginLeft: '10px' }}>Stop Camera</button>}
            </>
          )}
          {capturedImage && captureMode === 'photo' && (
            <div className="captured-preview" style={{ marginTop: '20px' }}>
              <h3>Captured Photo:</h3>
              <img src={capturedImage} alt="Captured" style={{ maxWidth: '100%', maxHeight: '480px', border: '1px solid black' }} />
              <div style={{ marginTop: '10px' }}>
                <button onClick={resetCapture} style={{ marginRight: '10px' }}>Retake Photo</button>
                <button onClick={stopCamera} style={{ marginLeft: '10px' }}>Done / Stop Camera</button>
              </div>
            </div>
          )}

          {stream && captureMode === 'video' && !videoBlobUrl && (
            <>
              {!isRecording ? (
                <button onClick={startRecording}>Start Recording</button>
              ) : (
                <button onClick={stopRecording} style={{backgroundColor: 'red', color: 'white'}}>Stop Recording</button>
              )}
              <button onClick={stopCamera} style={{ marginLeft: '10px' }} disabled={isRecording}>Stop Camera Preview</button>
            </>
          )}
          {videoBlobUrl && captureMode === 'video' && (
             <div className="captured-preview" style={{ marginTop: '20px' }}>
              <h3>Recorded Video:</h3>
              {/* Video element for playback is now the main videoRef if src is set */}
              <div style={{ marginTop: '10px' }}>
                <button onClick={resetCapture} style={{ marginRight: '10px' }}>Record New Video</button>
                {/* <button onClick={stopCamera} style={{ marginLeft: '10px' }}>Done / Stop Camera</button> */}
              </div>
            </div>
          )}
        </div>
      )}
      {captureMode === 'photo' && <canvas ref={canvasRef} style={{ display: 'none' }} />}
    </div>
  );
}

export default CameraCapture;
