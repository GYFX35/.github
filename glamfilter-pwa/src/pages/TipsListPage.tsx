import React, { useState, useEffect } from 'react';
import useRewardedVideoAd from '../useRewardedVideoAd'; // Adjust path as needed
// import { Link } from 'react-router-dom'; // For navigation to detail page
// import TipSummaryCard from '../components/TipSummaryCard'; // Create later
// import tipsData from '../data/tips.json'; // Create later

const TipsListPage: React.FC = () => {
  // const tips = tipsData; // Load data later
  const {
    isAdLoading,
    isAdReady,
    rewardGranted,
    adClosed,
    error,
    showAd,
    resetAdState
  } = useRewardedVideoAd();

  const [premiumTipUnlocked, setPremiumTipUnlocked] = useState(false);
  const [adErrorMessage, setAdErrorMessage] = useState<string | null>(null);

  const handleShowAd = () => {
    if (isAdReady) {
      setAdErrorMessage(null); // Clear previous errors
      showAd();
    } else if (isAdLoading) {
      setAdErrorMessage("Ad is still loading, please wait...");
    }
     else {
      // This case might happen if the ad slot failed to define or load initially.
      // The hook's `error` state should capture this.
      // We can also try to re-initialize/load the ad here if appropriate.
      // For now, rely on the hook's error state.
      // Or, if the ad was closed and needs reset:
      if (adClosed && !rewardGranted) { // Or just adClosed
         console.log("Ad was closed, attempting to reset and show again.");
         resetAdState(); // This will trigger the hook to redefine and load the ad
         // Potentially call showAd() in an effect after reset makes it ready, or user clicks again
         setAdErrorMessage("Ad reset. Please click again to show.");
      } else if (error) {
         setAdErrorMessage(`Ad not ready. Error: ${error}. Please try again later or refresh.`);
      } else {
         setAdErrorMessage("Ad not ready. Please wait or try again.");
         // Potentially trigger a load if the hook supports it explicitly
         // or rely on the auto-load feature of the hook after a reset.
         // If the slot failed to define, resetAdState might be needed.
         resetAdState(); // Try to reset if in an unknown not-ready state
      }
    }
  };

  useEffect(() => {
    if (rewardGranted) {
      setPremiumTipUnlocked(true);
      // Optionally, reset ad state here if the ad slot is single-use and you want to allow watching another ad later
      // resetAdState(); // This would allow showing another ad for another reward
    }
  }, [rewardGranted]);

  useEffect(() => {
    if (error) {
      setAdErrorMessage(`Ad Error: ${error}`);
    }
  }, [error]);

  // Effect to reset ad state if component unmounts, to clean up listeners etc.
  // Or if ad is closed and not rewarded, to allow trying again.
  useEffect(() => {
    return () => {
      // Clean up the ad slot and listeners when the component unmounts
      // This is important if the user navigates away while an ad is loaded/showing
      // The hook itself should handle listener cleanup, but slot destruction might be here.
      // resetAdState(); // This might be too aggressive if called on every unmount.
      // The hook's internal cleanup should suffice for listeners.
    };
  }, []);

  useEffect(() => {
    if (adClosed && !rewardGranted) {
      // If ad was closed without reward, allow user to try again by resetting
      // resetAdState(); // This makes it ready for another attempt on next button click
      // For now, let's make the user re-click the button which will trigger reset if needed.
      setAdErrorMessage("Ad closed without reward. Click again to try.");
    }
  }, [adClosed, rewardGranted, resetAdState]);


  return (
    <div className="tips-list-page">
      <h2>Makeup Tips & Tutorials</h2>

      <div style={{ margin: '20px 0', padding: '10px', border: '1px solid #eee', background: '#f9f9f9' }}>
        <h3>Unlock a Premium Tip!</h3>
        <p>Watch a short video ad to unlock an exclusive makeup tip.</p>
        <button
          onClick={handleShowAd}
          disabled={isAdLoading || (isAdReady && isAdLoading)} // Disable if loading, or if ready but then immediately trying to show (which sets loading)
          style={{padding: '10px 15px', fontSize: '16px', cursor: (isAdLoading) ? 'not-allowed' : 'pointer'}}
        >
          {isAdLoading ? 'Loading Ad...' : (isAdReady ? 'Show Ad to Unlock Tip' : 'Load Ad to Unlock Tip')}
        </button>
        {adErrorMessage && <p style={{ color: 'red', marginTop: '10px' }}>{adErrorMessage}</p>}
        {!isAdLoading && !isAdReady && adClosed && !rewardGranted && <p style={{color: 'orange', marginTop: '5px'}}>Ad was closed. Click again to retry.</p>}
        {rewardGranted && <p style={{ color: 'green', marginTop: '10px' }}>Reward granted! Premium tip unlocked.</p>}
      </div>

      {premiumTipUnlocked && (
        <div className="tip-summary-placeholder" style={{border: '1px solid #4CAF50', background: '#e8f5e9', padding: '10px', marginBottom: '10px', marginTop: '20px'}}>
          <h3>✨ Premium Unlocked Tip: The Secret to Perfect Winged Eyeliner ✨</h3>
          <p>To achieve the perfect winged eyeliner, start by drawing a thin line from the outer corner of your eye, angling upwards towards the end of your eyebrow. Then, draw another line from the peak of that wing back towards your lash line, creating a triangle. Fill in the triangle and then continue the line smoothly across your upper lash line. Use a Q-tip with makeup remover to sharpen any edges. Practice makes perfect!</p>
        </div>
      )}

      <div className="tips-grid" style={{ marginTop: '20px' }}>
        {/* Placeholder items - map over actual data later */}
        <div className="tip-summary-placeholder" style={{border: '1px solid #ccc', padding: '10px', marginBottom: '10px'}}>
          {/* <Link to="/tips/tip-1-slug"> */}
            <h3>Tip 1 Title Placeholder</h3>
            <p>Short summary of tip 1...</p>
          {/* </Link> */}
        </div>
        <div className="tip-summary-placeholder" style={{border: '1px solid #ccc', padding: '10px', marginBottom: '10px'}}>
          {/* <Link to="/tips/tip-2-slug"> */}
            <h3>Tip 2 Title Placeholder</h3>
            <p>Short summary of tip 2...</p>
          {/* </Link> */}
        </div>
      </div>
    </div>
  );
};

export default TipsListPage;
