import { useState, useEffect, useCallback } from 'react';

// Make googletag available globally
declare global {
  interface Window {
    googletag: any;
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
  resetAdState: () => void;
}

const useRewardedVideoAd = (): RewardedAdState & RewardedAdControls => {
  const [rewardedSlot, setRewardedSlot] = useState<any>(null);
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
    if (rewardedSlot) {
      window.googletag.cmd.push(() => {
        window.googletag.destroySlots([rewardedSlot]);
      });
      setRewardedSlot(null);
    }
  }, [rewardedSlot]);

  useEffect(() => {
    if (rewardedSlot || isAdLoading || isAdReady) {
      return;
    }

    if (!window.googletag || !window.googletag.cmd) {
      setError("Googletag not initialized");
      return;
    }

    setIsAdLoading(true);
    setError(null);

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
        window.googletag.enableServices();
      } else {
        console.error('Failed to define rewarded ad slot. Check ad unit path and page setup.');
        setError('Failed to define rewarded ad slot. The page might not support rewarded ads or ad unit path is incorrect.');
        setIsAdLoading(false);
      }
    });
  }, [rewardedSlot, isAdLoading, isAdReady]);

  useEffect(() => {
    if (!window.googletag || !window.googletag.cmd || !rewardedSlot) return;

    const handleRewardedSlotReady = (event: any) => {
      if (event.slot === rewardedSlot) {
        console.log('Rewarded ad ready to be displayed.');
        setIsAdReady(true);
        setIsAdLoading(false);
        setError(null);
      }
    };

    const handleRewardedSlotClosed = (event: any) => {
      if (event.slot === rewardedSlot) {
        console.log('Rewarded ad slot closed.');
        setAdClosed(true);
        setIsAdReady(false);
      }
    };

    const handleRewardedSlotGranted = (event: any) => {
      if (event.slot === rewardedSlot) {
        const reward = event.payload;
        console.log('Reward granted!', reward);
        setRewardGranted(true);
        setError(null);
      }
    };

    const handleSlotRenderEnded = (event: any) => {
      if (event.slot === rewardedSlot) {
        if (event.isEmpty) {
          console.warn('Rewarded ad slot render ended, but was empty (no ad filled).');
          setError('No ad available for the rewarded slot.');
          setIsAdLoading(false);
          setIsAdReady(false);
        } else {
          console.log('Rewarded ad slot render ended (ad displayed).');
        }
      }
    };

    const handleImpressionViewable = (event: any) => {
        if (event.slot === rewardedSlot) {
            console.log('Rewarded ad impression viewable.');
        }
    };

    window.googletag.cmd.push(() => {
      const pubads = window.googletag.pubads();
      pubads.addEventListener('rewardedSlotReady', handleRewardedSlotReady);
      pubads.addEventListener('rewardedSlotClosed', handleRewardedSlotClosed);
      pubads.addEventListener('rewardedSlotGranted', handleRewardedSlotGranted);
      pubads.addEventListener('slotRenderEnded', handleSlotRenderEnded);
      pubads.addEventListener('impressionViewable', handleImpressionViewable);
    });

    return () => {
      if (window.googletag && window.googletag.cmd && rewardedSlot) { // Ensure rewardedSlot exists for cleanup
        window.googletag.cmd.push(() => {
          const pubads = window.googletag.pubads();
          pubads.removeEventListener('rewardedSlotReady', handleRewardedSlotReady);
          pubads.removeEventListener('rewardedSlotClosed', handleRewardedSlotClosed);
          pubads.removeEventListener('rewardedSlotGranted', handleRewardedSlotGranted);
          pubads.removeEventListener('slotRenderEnded', handleSlotRenderEnded);
          pubads.removeEventListener('impressionViewable', handleImpressionViewable);
        });
      }
    };
  }, [rewardedSlot]); // Added rewardedSlot to dependency array for cleanup safety

  const showAd = useCallback(() => {
    if (isAdReady && rewardedSlot) {
      console.log('Showing rewarded ad.');
      rewardedSlot.makeRequest();
      setIsAdReady(false);
      setIsAdLoading(true);
    } else if (!rewardedSlot && !isAdLoading) {
        setError("Ad slot not defined yet. Please try resetting.");
        console.error("showAd called but slot not ready or not defined.");
    } else {
      console.warn('showAd called, but ad is not ready or already processing.');
      if (!isAdLoading && !isAdReady && rewardedSlot) {
        console.log('Attempting to make request for not-yet-ready ad.');
        rewardedSlot.makeRequest();
        setIsAdLoading(true);
      }
    }
  }, [isAdReady, rewardedSlot, isAdLoading]);

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
