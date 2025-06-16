// src/App.jsx
import React, { useState, useEffect } from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import MagazineHome from './pages/MagazineHome';
import MagazineArticle from './pages/MagazineArticle';
import CapturePage from './pages/CapturePage';
import SponsorshipPage from './pages/SponsorshipPage'; // Import SponsorshipPage
import AIChatbot from './components/AIChatbot'; // Import the chatbot
import './components/AIChatbot.css'; // Import its CSS

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

  const [isChatbotVisible, setIsChatbotVisible] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [isChatbotLoading, setIsChatbotLoading] = useState(false);


  const siteUrl = 'https://your-pwa-domain.com'; // Placeholder - user must update

  const webSiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "url": siteUrl,
    "name": "Customer Magazine App", // Matches default title
  };

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      console.log("'beforeinstallprompt' event was fired.");
    };
    window.addEventListener('beforeinstallprompt', handler);

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

  const toggleChatbot = () => {
    setIsChatbotVisible(prev => !prev);
    // If opening chatbot and it has no messages, add initial greeting from App context
    if (!isChatbotVisible && chatMessages.length === 0) {
        setChatMessages([{ sender: 'bot', text: 'Hello! How can I assist you from the App?' }]);
    }
  };

  const handleSendMessageToBot = async (userMessage, type = 'user_query', articleDetails = null) => {
    setChatMessages(prev => [...prev, { sender: 'user', text: userMessage }]);
    setIsChatbotLoading(true);

    setTimeout(() => {
      let botResponseText = "I'm sorry, I didn't quite understand that. Could you rephrase?";
      if (type === 'summarize_article' && articleDetails) {
        botResponseText = `Okay, I will summarize the article titled: "${articleDetails.title}". Here is a mock summary: This article discusses many interesting points about ${articleDetails.slug} and concludes that further research is needed. (This is a mocked summary).`;
      } else if (userMessage.toLowerCase().includes('hello') || userMessage.toLowerCase().includes('hi')) {
        botResponseText = 'Hello there! How can I assist you today?';
      } else if (userMessage.toLowerCase().includes('magazine')) {
        botResponseText = 'You can find our latest articles on the Magazine Home page. Would you like a specific topic?';
      } else if (userMessage.toLowerCase().includes('help')) {
        botResponseText = 'I can help you find articles, summarize them (from an article page), or answer general questions. What do you need?';
      }

      setChatMessages(prev => [...prev, { sender: 'bot', text: botResponseText }]);
      setIsChatbotLoading(false);
    }, 1500);
  };

  return (
    <Router>
      <Helmet>
        <title>Customer Magazine App</title>
        <meta name="description" content="Welcome to the Customer Magazine App. Explore our articles and features." />
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
              <li><Link to="/capture">Capture</Link></li>
              <li><Link to="/sponsorship">Sponsor Us</Link></li> {/* Add Link */}
            </ul>
          </nav>
          {deferredPrompt && (
            <button onClick={handleInstallClick} style={{ marginLeft: '20px', padding: '10px' }}>
              Install App
            </button>
          )}
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
          <Route
            path="/magazine/article/:slug"
            element={
              <MagazineArticle
                openChatbot={() => setIsChatbotVisible(true)}
                sendMessageToBot={handleSendMessageToBot}
              />
            }
          />
          <Route path="/capture" element={<CapturePage />} />
          <Route path="/sponsorship" element={<SponsorshipPage />} /> {/* Add Route */}
          <Route path="/" element={
            <>
              <Helmet>
                <title>Home - Customer Magazine App</title>
                <meta name="description" content="Homepage of the Customer Magazine. Your source for interesting content." />
              </Helmet>
              <div>
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
      </div> {/* End of className="App" div */}

      {/* Chatbot Toggle Button */}
      {!isChatbotVisible && (
        <button
          onClick={toggleChatbot}
          style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            padding: '10px 20px',
            borderRadius: '30px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
            cursor: 'pointer',
            zIndex: 999 // Below chatbot widget but above other content
          }}
        >
          Chat
        </button>
      )}

      {/* AIChatbot Component */}
      <AIChatbot
        isVisible={isChatbotVisible}
        onClose={toggleChatbot} // Use toggleChatbot to close
        messages={chatMessages} // Pass App's chatMessages state
        isLoading={isChatbotLoading} // Pass App's isChatbotLoading state
        onSendMessage={handleSendMessageToBot}
      />
    </Router>
  );
}

export default App;
