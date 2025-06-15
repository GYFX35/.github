// src/pages/CapturePage.jsx
import React from 'react';
import { Helmet } from 'react-helmet-async';
import CameraCapture from '../components/CameraCapture'; // Adjust path if components dir is different

function CapturePage() {
  return (
    <div>
      <Helmet>
        <title>Capture Photo - Customer Magazine App</title> {/* Changed from Photo/Video to just Photo as per current CameraCapture component */}
        <meta name="description" content="Use your camera to capture photos directly within the app." /> {/* Changed from Photo/Video to just Photo */}
      </Helmet>
      <h1>Camera Capture</h1>
      <CameraCapture />
    </div>
  );
}

export default CapturePage;
