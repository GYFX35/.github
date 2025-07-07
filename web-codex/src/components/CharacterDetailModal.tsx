import React, { useState, useEffect } from 'react';
import useRewardedVideoAd from '../useRewardedVideoAd'; // Adjust path if needed
// import { Character } from '../types/character'; // Will create this type later

// interface CharacterDetailModalProps {
//   character: Character | null;
//   onClose: () => void;
// }

const CharacterDetailModal: React.FC<any> = ({ character, onClose }) => { // Using 'any' for now
  const {
    isAdLoading,
    isAdReady,
    rewardGranted,
    adClosed,
    error: adError,
    showAd,
    resetAdState
  } = useRewardedVideoAd();

  const [detailedStatsUnlocked, setDetailedStatsUnlocked] = useState(false);
  const [adStatusMessage, setAdStatusMessage] = useState<string | null>(null);

  // Reset ad state and unlock status when character changes or modal opens/closes
  useEffect(() => {
    setDetailedStatsUnlocked(false); // Lock stats for new character
    resetAdState(); // Reset ad for the new context
    setAdStatusMessage(null);
  }, [character, resetAdState]); // resetAdState is stable, character is key trigger

  useEffect(() => {
    if (rewardGranted) {
      setDetailedStatsUnlocked(true);
      setAdStatusMessage("Detailed stats unlocked for this character!");
      // Ad slot is single use, it's already reset internally by the hook for next showAd
    }
  }, [rewardGranted]);

  useEffect(() => {
    if (adError) {
      setAdStatusMessage(`Ad Error: ${adError}. Try again or refresh.`);
    }
  }, [adError]);

  useEffect(() => {
    // Handle ad closed without reward
    if (adClosed && !rewardGranted) {
      setAdStatusMessage("Ad closed. Watch the full ad to unlock stats.");
      // Ad state is reset by the hook, ready for another attempt if user clicks button again
    }
  }, [adClosed, rewardGranted]);


  const handleShowAd = () => {
    if (detailedStatsUnlocked) {
        setAdStatusMessage("Detailed stats are already unlocked for this character.");
        return;
    }
    if (isAdReady) {
      setAdStatusMessage(null);
      showAd();
    } else if (isAdLoading) {
      setAdStatusMessage("Ad is loading, please wait...");
    } else {
      // Ad not ready, not loading. Could be initial state or error.
      // Hook's auto-load should attempt to load. If there was an error, it's in adError.
      // If adClosed and !rewardGranted, user can try again.
      // resetAdState() is called on modal open/character change.
      // If an error occurred previously, clicking again should retry due to reset.
      setAdStatusMessage(adError ? `Ad Error: ${adError}. Try again.` : "Ad not ready. Click to try loading.");
      // Attempt to ensure ad loads if it's in a state where it can be re-requested by showAd
      // The hook itself tries to load on mount/reset. If that failed, showAd might also fail.
      // A manual resetAdState() here before showAd() could be an option if initial load failed.
      // For now, rely on the resetAdState from modal open/character change.
      // If error, user clicks button again, showAd is called.
      // If still not ready, hook might still be trying or failed.
       if (!isAdLoading) { // Only attempt showAd if not already loading
            showAd(); // This will trigger makeRequest in the hook if slot exists
       }
    }
  };

  const handleModalClose = () => {
    resetAdState(); // Ensure ad is reset when modal is manually closed
    onClose();
  };

  if (!character) {
    return null;
  }

  const mockDetailedStats = {
    strength: character.rank === 'S' ? '90-100' : '60-80',
    agility: character.rank === 'S' ? '95-100' : '70-85',
    intelligence: character.type === 'Mage' ? '85-95' : '50-70',
    mana: character.type === 'Mage' ? '1000-5000' : '100-500',
    specialAbility: `[Revealed] ${character.name}'s Secret Technique: ${character.rank === 'S' ? "World Slash" : "Focused Strike"}`
  };

  return (
    <div className="modal-backdrop" onClick={handleModalClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>{character.name || 'Unnamed Character'}</h2>
        {/* <img src={character.imageUrl} alt={character.name} style={{ maxWidth: '100%', height: 'auto' }} /> */}
        <p><strong>Type:</strong> {character.type || 'N/A'}</p>
        <p><strong>Rank:</strong> {character.rank || 'N/A'}</p>
        <p><strong>Description:</strong> {character.description || 'No description available.'}</p>
        <div>
          <strong>Abilities:</strong>
          {/* Render basic abilities if any */}
          {character.abilities && character.abilities.length > 0 ? (
            <ul>{character.abilities.map((ability: string, index: number) => (<li key={index}>{ability}</li>))}</ul>
          ) : (<p>No basic abilities listed.</p>)}
        </div>
        <hr style={{margin: '15px 0'}} />
        <div>
          <strong>Stats:</strong>
          {detailedStatsUnlocked ? (
            <div style={{padding: '10px', background: '#f0f8ff', border: '1px solid #add8e6', borderRadius: '4px', marginTop: '5px'}}>
              <h4 style={{marginTop: 0}}>Detailed Combat Stats (Unlocked ✨)</h4>
              <pre>{JSON.stringify(mockDetailedStats, null, 2)}</pre>
            </div>
          ) : (
            <div style={{padding: '10px', border: '1px dashed #ccc', borderRadius: '4px', marginTop: '5px', textAlign: 'center'}}>
              <p>More detailed stats available.</p>
              <button
                onClick={handleShowAd}
                disabled={isAdLoading || detailedStatsUnlocked}
                style={{padding: '8px 12px', cursor: (isAdLoading || detailedStatsUnlocked) ? 'not-allowed' : 'pointer'}}
              >
                {isAdLoading ? 'Loading Ad...' : (detailedStatsUnlocked ? 'Stats Unlocked!' : 'Unlock Full Stats (Watch Ad)')}
              </button>
            </div>
          )}
          {adStatusMessage && <p style={{ color: rewardGranted ? 'green' : 'red', marginTop: '10px', textAlign: 'center', fontSize: '0.9em' }}>{adStatusMessage}</p>}
        </div>
        <hr style={{margin: '15px 0'}} />
        <button onClick={handleModalClose} style={{marginTop: '10px'}}>Close</button>
      </div>
    </div>
  );
};

export default CharacterDetailModal;
