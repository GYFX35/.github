import { useState, useEffect, useCallback } from 'react';

// Make googletag available globally
// In a real app, you might prefer to manage this more explicitly
// or ensure it's loaded before your app/component mounts.
declare global {
  interface Window {
    googletag: any; // Consider more specific types if available or define them
  }
}

const AD_UNIT_PATH = '/21775744923/rewarded_ad_demo'; // Google's Test Ad Unit

interface RewardedAdState {
  isAdLoading: boolean;
  isAdReady: boolean;
  rewardGranted: boolean;
  adClosed: boolean;
  error: string | null;
}

interface RewardedAdControls {
  showAd: () => void;
  resetAdState: () => void; // To allow re-triggering or cleanup
}

const useRewardedVideoAd = (): RewardedAdState & RewardedAdControls => {
  const [rewardedSlot, setRewardedSlot] = useState<any>(null); // googletag.Slot
  const [isAdLoading, setIsAdLoading] = useState<boolean>(false);
  const [isAdReady, setIsAdReady] = useState<boolean>(false);
  const [rewardGranted, setRewardGranted] = useState<boolean>(false);
  const [adClosed, setAdClosed] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const resetAdState = useCallback(() => {
    setIsAdLoading(false);
    setIsAdReady(false);
    setRewardGranted(false);
    setAdClosed(false);
    setError(null);
    // We might need to destroy the old slot and redefine,
    // or check if the same slot can be reused.
    // For now, this just resets component state.
    // A full reset might involve calling googletag.destroySlots([rewardedSlot])
    // and then re-running the define logic if the slot is not reusable.
    // GPT documentation suggests rewarded ads are single-use per definition.
    // So, a more robust reset would involve cleaning up and re-defining.
    if (rewardedSlot) {
      window.googletag.cmd.push(() => {
        window.googletag.destroySlots([rewardedSlot]);
      });
      setRewardedSlot(null);
    }
  }, [rewardedSlot]);

  // Define and load the ad
  useEffect(() => {
    // If slot already exists or is loading, don't redefine.
    // This effect should run once to define the slot, or after a reset.
    if (rewardedSlot || isAdLoading || isAdReady) {
      return;
    }

    if (!window.googletag || !window.googletag.cmd) {
      setError("Googletag not initialized");
      return;
    }

    setIsAdLoading(true);

    window.googletag.cmd.push(() => {
      console.log('Defining rewarded ad slot:', AD_UNIT_PATH);
      const slot = window.googletag.defineOutOfPageSlot(
        AD_UNIT_PATH,
        window.googletag.enums.OutOfPageFormat.REWARDED
      );

      if (slot) {
        slot.addService(window.googletag.pubads());
        setRewardedSlot(slot);
        console.log('Rewarded ad slot defined:', slot);

        // It's important to call enableServices after defining slots.
        // However, if called multiple times, it might cause issues or be ignored.
        // This should ideally be managed globally or once per page load.
        // For this hook, we assume it might be called as needed if slots are defined.
        window.googletag.enableServices();

        // According to Google's sample, makeRequest() is what actually loads the ad.
        // This is different from display ads where display() also requests.
        // We can call makeRequest() here to pre-load.
        // Or, call it when `showAd` is invoked. For preloading:
        // slot.makeRequest();
        // For now, let's not preload automatically, let showAd handle it if not ready.

      } else {
        console.error('Failed to define rewarded ad slot. Check ad unit path and page setup (e.g., viewport meta tag).');
        setError('Failed to define rewarded ad slot. The page might not support rewarded ads (e.g., not mobile-optimized or zoom not neutral), or ad unit path is incorrect.');
        setIsAdLoading(false);
      }
    });
  }, [rewardedSlot, isAdLoading, isAdReady]); // Re-run if slot is reset

  // Event listeners
  useEffect(() => {
    if (!window.googletag || !window.googletag.cmd) return;

    const handleRewardedSlotReady = (event: any) => { // googletag.events.RewardedSlotReadyEvent
      if (event.slot === rewardedSlot) {
        console.log('Rewarded ad ready to be displayed.');
        setIsAdReady(true);
        setIsAdLoading(false);
        setError(null);
      }
    };

    const handleRewardedSlotClosed = (event: any) => { // googletag.events.RewardedSlotClosedEvent
      if (event.slot === rewardedSlot) {
        console.log('Rewarded ad slot closed.');
        setAdClosed(true);
        setIsAdReady(false); // Ad is no longer ready after closing
        // Consider calling resetAdState() here or let the component decide
        // For now, we allow manual reset for potential re-show (though GPT might need new slot)
      }
    };

    const handleRewardedSlotGranted = (event: any) => { // googletag.events.RewardedSlotGrantedEvent
      if (event.slot === rewardedSlot) {
        const reward = event.payload;
        console.log('Reward granted!', reward);
        setRewardGranted(true);
        setError(null);
      }
    };

    const handleSlotRenderEnded = (event: any) => { // googletag.events.SlotRenderEndedEvent
      if (event.slot === rewardedSlot) {
        if (event.isEmpty) {
          console.warn('Rewarded ad slot render ended, but was empty (no ad filled).');
          setError('No ad available for the rewarded slot.');
          setIsAdLoading(false);
          setIsAdReady(false);
        } else {
          console.log('Rewarded ad slot render ended (ad displayed).');
          // Ad is displayed, but not necessarily "ready" for another show.
          // isAdReady should be controlled by RewardedSlotReadyEvent.
        }
      }
    };

    // Listener for when an ad fails to load
    const handleSlotResponseReceived = (event: any) => { // googletag.events.SlotResponseReceived
        // This event is for GPT, not specific to rewarded ads but useful for debugging
    };

    const handleImpressionViewable = (event: any) => { // googletag.events.ImpressionViewableEvent
        if (event.slot === rewardedSlot) {
            console.log('Rewarded ad impression viewable.');
        }
    };


    window.googletag.cmd.push(() => {
      const pubads = window.googletag.pubads();
      pubads.addEventListener('rewardedSlotReady', handleRewardedSlotReady);
      pubads.addEventListener('rewardedSlotClosed', handleRewardedSlotClosed);
      pubads.addEventListener('rewardedSlotGranted', handleRewardedSlotGranted);
      pubads.addEventListener('slotRenderEnded', handleSlotRenderEnded); // Useful for empty fill
      pubads.addEventListener('impressionViewable', handleImpressionViewable);
      // pubads.addEventListener('slotResponseReceived', handleSlotResponseReceived); // For more detailed GPT debugging
    });

    return () => {
      window.googletag.cmd.push(() => {
        const pubads = window.googletag.pubads();
        pubads.removeEventListener('rewardedSlotReady', handleRewardedSlotReady);
        pubads.removeEventListener('rewardedSlotClosed', handleRewardedSlotClosed);
        pubads.removeEventListener('rewardedSlotGranted', handleRewardedSlotGranted);
        pubads.removeEventListener('slotRenderEnded', handleSlotRenderEnded);
        pubads.removeEventListener('impressionViewable', handleImpressionViewable);
        // pubads.removeEventListener('slotResponseReceived', handleSlotResponseReceived);
      });
    };
  }, [rewardedSlot]);

  const showAd = useCallback(() => {
    if (isAdReady && rewardedSlot) {
      console.log('Showing rewarded ad.');
      // The official sample uses rewardedSlot.makeRequest() to show the ad.
      // This implies the ad content is fetched and then displayed.
      // If makeRequest was already called to preload, this might not be needed,
      // or it might be the trigger to actually display the preloaded ad.
      // Let's assume makeRequest() is the correct way to display it if ready.
      rewardedSlot.makeRequest();
      // After calling makeRequest, we might want to set isAdReady to false
      // as the ad is now being shown or has been shown.
      // The RewardedSlotClosedEvent will handle further state changes.
      setIsAdReady(false); // Ad is being consumed
      setIsAdLoading(true); // Technically, waiting for it to show and close
    } else if (!rewardedSlot && !isAdLoading) {
        setError("Ad slot not defined yet. Retrying definition.");
        // Attempt to re-initialize if slot is missing (e.g., after a reset or initial failure)
        // This will trigger the useEffect for defining the slot.
        // setRewardedSlot(null); // Ensure the effect re-runs
        // This automatic re-init might be too aggressive. Better to ensure it's defined first.
        // For now, log error. Component using hook should ensure it can be called.
        console.error("showAd called but slot not ready or not defined.");
    } else {
      console.warn('showAd called, but ad is not ready or already processing.');
      if (!isAdLoading && !isAdReady && rewardedSlot) {
        // If slot exists but not ready and not loading, try to make request.
        console.log('Attempting to make request for not-yet-ready ad.');
        rewardedSlot.makeRequest();
        setIsAdLoading(true);
      }
    }
  }, [isAdReady, rewardedSlot, isAdLoading]);

  // Auto-load the ad once the slot is defined by the first useEffect
  useEffect(() => {
    if (rewardedSlot && !isAdReady && !isAdLoading && !error) {
      console.log('useRewardedVideoAd: Slot defined, automatically calling makeRequest to load ad data.');
      rewardedSlot.makeRequest();
      setIsAdLoading(true);
    }
  }, [rewardedSlot, isAdReady, isAdLoading, error]);


  return { isAdLoading, isAdReady, rewardGranted, adClosed, error, showAd, resetAdState };
};

export default useRewardedVideoAd;
