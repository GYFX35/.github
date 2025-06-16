// src/App.jsx
import React, { useState, useEffect } from 'react'; // Ensure useEffect is imported if used for other things
import './App.css';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async'; // Import Helmet
import MagazineHome from './pages/MagazineHome';
import MagazineArticle from './pages/MagazineArticle';
import CapturePage from './pages/CapturePage'; // Import CapturePage

// THIS IS WHERE THE USER NEEDS TO PASTE THEIR VAPID PUBLIC KEY
const VAPID_PUBLIC_KEY = 'YOUR_VAPID_PUBLIC_KEY_GOES_HERE';

// Helper function to convert VAPID public key
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

function App() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [notificationPermission, setNotificationPermission] = useState(Notification.permission);
  const [isSubscribed, setIsSubscribed] = useState(false);

  const siteUrl = 'https://your-pwa-domain.com'; // Placeholder - user must update

  const webSiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "url": siteUrl,
    "name": "Customer Magazine App", // Matches default title
    // Optional: if you have a search URL for your site
    // "potentialAction": {
    //   "@type": "SearchAction",
    //   "target": {
    //     "@type": "EntryPoint",
    //     "urlTemplate": `${siteUrl}/search?q={search_term_string}`
    //   },
    //   "query-input": "required name=search_term_string"
    // }
  };

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      console.log("'beforeinstallprompt' event was fired.");
    };
    window.addEventListener('beforeinstallprompt', handler);

    // Check current subscription status on load
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      navigator.serviceWorker.ready.then(registration => {
        registration.pushManager.getSubscription().then(subscription => {
          if (subscription) {
            setIsSubscribed(true);
            console.log('User IS subscribed on page load.');
          } else {
            setIsSubscribed(false);
            console.log('User IS NOT subscribed on page load.');
          }
        });
      });
    }


    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to the install prompt: ${outcome}`);
    setDeferredPrompt(null);
  };

  const handleEnableNotifications = async () => {
    if (!('Notification' in window) || !('serviceWorker' in navigator) || !('PushManager' in window)) {
      alert('Push Notifications are not supported by this browser.');
      return;
    }

    if (VAPID_PUBLIC_KEY === 'YOUR_VAPID_PUBLIC_KEY_GOES_HERE') {
      alert('Please replace YOUR_VAPID_PUBLIC_KEY in App.jsx with your actual VAPID public key.');
      console.error('VAPID_PUBLIC_KEY is not set. Cannot subscribe to push notifications.');
      return;
    }

    try {
      const permissionResult = await Notification.requestPermission();
      setNotificationPermission(permissionResult);

      if (permissionResult === 'granted') {
        console.log('Notification permission granted.');
        const registration = await navigator.serviceWorker.ready;
        console.log('Service Worker ready.');

        const existingSubscription = await registration.pushManager.getSubscription();
        if (existingSubscription) {
          console.log('User is already subscribed:', existingSubscription);
          setIsSubscribed(true);
          alert('You are already subscribed to notifications.');
        } else {
          console.log('Subscribing to push notifications...');
          const subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
          });
          console.log('User is subscribed:', subscription);
          setIsSubscribed(true);
          alert('Successfully subscribed to notifications!');
          // TODO: Send this subscription object to your application server!
          // Example: fetch('/api/subscribe', { method: 'POST', body: JSON.stringify(subscription), headers: {'Content-Type': 'application/json'} });
        }
      } else {
        console.warn('Notification permission denied.');
        alert('Notification permission was denied. You will not receive updates.');
      }
    } catch (error) {
      console.error('Error during notification setup:', error);
      alert('Failed to set up notifications. See console for details.');
    }
  };

  return (
    <Router>
      <Helmet>
        <title>Customer Magazine App</title> {/* Default/Fallback Title */}
        <meta name="description" content="Welcome to the Customer Magazine App. Explore our articles and features." /> {/* Default/Fallback Description */}
        {/* Add JSON-LD structured data for WebSite */}
        <script type="application/ld+json">
          {JSON.stringify(webSiteSchema)}
        </script>
      </Helmet>
      <div className="App">
        <header className="App-header">
          <img src="Octocat.png" className="App-logo" alt="logo" />
          <p>
            GitHub Codespaces <span className="heart">♥️</span> React
          </p>
          <nav>
            <ul>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/magazine">Customer Magazine</Link></li>
              <li><Link to="/capture">Capture</Link></li> {/* Add Link for CapturePage */}
            </ul>
          </nav>
          {deferredPrompt && (
            <button onClick={handleInstallClick} style={{ marginLeft: '20px', padding: '10px' }}>
              Install App
            </button>
          )}
          {/* Notification Button Logic */}
          {notificationPermission === 'default' && !isSubscribed && (
             <button onClick={handleEnableNotifications} style={{ marginLeft: '20px', padding: '10px' }}>
               Enable Notifications
             </button>
          )}
          {notificationPermission === 'granted' && !isSubscribed && (
             <button onClick={handleEnableNotifications} style={{ marginLeft: '20px', padding: '10px' }}>
               Subscribe to Notifications
             </button>
          )}
           {isSubscribed && (
             <p style={{ fontSize: 'small', marginLeft: '20px', color: 'lightgreen' }}>Notifications Enabled!</p>
          )}
           {notificationPermission === 'denied' && (
             <p style={{ fontSize: 'small', marginLeft: '20px', color: 'orange' }}>Notifications Denied.</p>
          )}

        </header>
        <Routes>
          <Route path="/magazine" element={<MagazineHome />} />
          <Route path="/magazine/article/:slug" element={<MagazineArticle />} />
          <Route path="/capture" element={<CapturePage />} /> {/* Add Route for CapturePage */}
          <Route path="/" element={
            <> {/* Use Fragment to wrap Helmet and content */}
              <Helmet>
                <title>Home - Customer Magazine App</title>
                <meta name="description" content="Homepage of the Customer Magazine. Your source for interesting content." />
              </Helmet>
              <div> {/* Original content for home path */}
                <p className="small">
                  Edit <code>src/App.jsx</code> and save to reload.
                </p>
                <p>
                  <a className="App-link" href="https://reactjs.org" target="_blank" rel="noopener noreferrer">
                    Learn React
                  </a>
                </p>
              </div>
            </>
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
