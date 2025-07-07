import React, { useState, useEffect, useRef, useMemo } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ethers, Contract } from 'ethers';
import './index.css'; // Ensure global styles are loaded
import { Pattern, PatternAI, patternsLibrary, premiumAIPatternsLibrary } from './patterns';
import useRewardedVideoAd from './useRewardedVideoAd'; // Import the hook
import { contractAddress as nftRewardContractAddress, contractABI as nftRewardContractABI, SEPOLIA_CHAIN_ID } from './contractInfo';
import { premiumAssetsContractAddress, premiumAssetsContractABI } from './premiumAssetsContractInfo';
import { PlayerArtworkContractAddress, PlayerArtworkContractABI } from './playerArtworkContractInfo'; // New
import { ARArtworkData, PlacedObjectData, captureSceneData, generateAndUploadArtworkMetadata } from './artworkUtil';

interface ARPainterPageProps {}

// Define a structure for what a premium pattern might look like once processed for the UI
interface PremiumPattern extends Pattern {
  isPremium: true;
  assetId: number;
}
const PREDEFINED_PREMIUM_ASSET_IDS = [1, 2, 3];

const ARPainterPage: React.FC<ARPainterPageProps> = () => {
  const [arSupported, setArSupported] = useState(false);
  const [inAR, setInAR] = useState(false);
  const sceneRef = useRef<any>(null);
  const reticleRef = useRef<any>(null);

  const patternAI = useMemo(() => new PatternAI(), []);
  const [suggestedPattern, setSuggestedPattern] = useState<Pattern | null>(null);
  const [selectedPattern, setSelectedPattern] = useState<Pattern>(patternsLibrary[0]);
  const [availablePatterns, setAvailablePatterns] = useState<Pattern[]>(patternsLibrary);

  // Rewarded Ad State
  const {
    isAdLoading: isRewardAdLoading,
    isAdReady: isRewardAdReady,
    rewardGranted,
    adClosed: rewardAdClosed,
    error: rewardAdError,
    showAd: showRewardAd,
    resetAdState: resetRewardAdState
  } = useRewardedVideoAd();
  const [adErrorMessage, setAdErrorMessage] = useState<string | null>(null);
  const [sparkleFlowUnlocked, setSparkleFlowUnlocked] = useState(false);

  // Web3 States
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [userAddress, setUserAddress] = useState<string | null>(null);
  const [nftRewardContract, setNftRewardContract] = useState<Contract | null>(null);
  const [premiumAssetsContract, setPremiumAssetsContract] = useState<Contract | null>(null);
  const [playerArtworkContract, setPlayerArtworkContract] = useState<Contract | null>(null); // New contract
  const [networkCorrect, setNetworkCorrect] = useState<boolean | null>(null);
  const [txMessage, setTxMessage] = useState<string>('');
  const [isMinting, setIsMinting] = useState<boolean>(false); // For reward and player art minting
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Premium Store State
  const [showPremiumStore, setShowPremiumStore] = useState<boolean>(false);
  interface PremiumAssetDisplayInfo {
    id: number; name: string; price: string; priceWei: bigint; description: string;
    maxSupply?: string; currentSupply?: string; owned: boolean;
  }
  const [premiumAssetsForSale, setPremiumAssetsForSale] = useState<PremiumAssetDisplayInfo[]>([]);
  const [storeLoadingError, setStoreLoadingError] = useState<string>('');
  const [ownedPremiumAssetIds, setOwnedPremiumAssetIds] = useState<Record<number, boolean>>({});

  // Game Loop State
  const paintingGoal = 3;
  const [paintedObjectsCount, setPaintedObjectsCount] = useState<number>(0);
  const [objectiveMet, setObjectiveMet] = useState<boolean>(false);

  // AI Tier State
  const [hasPremiumAIAccess, setHasPremiumAIAccess] = useState<boolean>(false);

  // Player Artwork Minting State / Last Minted Info
  interface LastMintedArtworkInfo {
    txHash: string;
    metadataURI: string;
    title: string; // From ARArtworkData
  }
  const [lastMintedArtwork, setLastMintedArtwork] = useState<LastMintedArtworkInfo | null>(null);


  // Define the special reward pattern
  const sparkleFlowPattern: Pattern & { isReward?: boolean } = useMemo(() => ({
    id: "reward-pattern-sparkle-flow",
    name: "Sparkle Flow ✨",
    style: "gradient", // Or any other style you prefer
    color1: "cyan",
    color2: "magenta",
    description: "A shimmering pattern unlocked by watching an ad!",
    isReward: true,
  }), []);

  useEffect(() => {
    if (paintedObjectsCount >= paintingGoal) {
      setObjectiveMet(true);
      setTxMessage(prev => (prev.includes("Objective complete!") ? prev : prev + (prev ? " " : "") + "Objective complete! You can now claim your reward."));
    } else { setObjectiveMet(false); }
  }, [paintedObjectsCount, paintingGoal]);

  useEffect(() => {
    // Update available patterns if sparkleFlowUnlocked changes
    const basePatterns = [...patternsLibrary];
    PREDEFINED_PREMIUM_ASSET_IDS.forEach(id => {
      if (ownedPremiumAssetIds[id]) {
        const premiumPatternInfo = premiumAssetsForSale.find(p => p.id === id) ||
                                 (id === 1 ? { name: "Golden Stripes ✨", color1: "gold", style: "stripes", color2: "darkgoldenrod"} :
                                  id === 2 ? { name: "Rainbow Brush 🌈", color1: "red", style: "gradient", color2: "purple" } :
                                  null);
        if (premiumPatternInfo && !basePatterns.find(p => p.id === `premium-${id}`)) {
          basePatterns.push({
            id: `premium-${id}`, name: premiumPatternInfo.name, style: (premiumPatternInfo as any).style || 'solid',
            description: premiumPatternInfo.description || "A premium asset.", color1: (premiumPatternInfo as any).color1 || 'magenta',
            color2: (premiumPatternInfo as any).color2, isPremium: true,
          } as Pattern);
        }
      }
    });

    if (sparkleFlowUnlocked && !basePatterns.find(p => p.id === sparkleFlowPattern.id)) {
      setAvailablePatterns([sparkleFlowPattern, ...basePatterns]);
    } else if (!sparkleFlowUnlocked && basePatterns.find(p => p.id === sparkleFlowPattern.id)) {
      setAvailablePatterns(basePatterns.filter(p => p.id !== sparkleFlowPattern.id));
    } else if (availablePatterns.length !== basePatterns.length || !basePatterns.every((bp, i) => bp.id === availablePatterns[i]?.id) || (sparkleFlowUnlocked && !availablePatterns.find(p=>p.id === sparkleFlowPattern.id))) {
      // General sync if sparkleFlowUnlocked hasn't changed but basePatterns might have (e.g. owned assets loaded)
       if (sparkleFlowUnlocked) {
        setAvailablePatterns([sparkleFlowPattern, ...basePatterns.filter(p => p.id !== sparkleFlowPattern.id)]);
       } else {
        setAvailablePatterns(basePatterns.filter(p => p.id !== sparkleFlowPattern.id));
       }
    }
  }, [ownedPremiumAssetIds, premiumAssetsForSale, sparkleFlowUnlocked, availablePatterns, sparkleFlowPattern]);


  useEffect(() => {
    setSuggestedPattern(patternAI.suggestPattern(selectedPattern, availablePatterns, hasPremiumAIAccess));
  }, [patternAI, selectedPattern, availablePatterns, hasPremiumAIAccess]);


  const fetchOwnedPremiumAssets = async () => {
    if (!premiumAssetsContract || !userAddress) return;
    setIsProcessing(true); setTxMessage("Checking premium assets...");
    try {
      const newOwnedAssets: Record<number, boolean> = {}; const accounts = Array(PREDEFINED_PREMIUM_ASSET_IDS.length).fill(userAddress); const ids = PREDEFINED_PREMIUM_ASSET_IDS;
      const balances = await premiumAssetsContract.balanceOfBatch(accounts, ids);
      ids.forEach((id, index) => { if (Number(balances[index]) > 0) newOwnedAssets[id] = true; });
      setOwnedPremiumAssetIds(newOwnedAssets); setTxMessage("Premium assets checked.");
    } catch (e) { console.error(e); setTxMessage("Could not check premium assets."); }
    finally { setIsProcessing(false); }
  };

  useEffect(() => { /* ... same ... */
    const updatedPatterns = [...patternsLibrary];
    // This useEffect was for updating availablePatterns based on owned assets.
    // It's now merged with the sparkleFlowUnlocked logic a few effects above.
  }, [ownedPremiumAssetIds, premiumAssetsForSale]);


  const fetchPremiumAssetsForStore = async () => {
    if (!premiumAssetsContract) {
        setStoreLoadingError("Connect wallet to Sepolia to see premium assets.");
        setPremiumAssetsForSale([
            { id: 1, name: "Golden Stripes (Sample)", price: "0.01", priceWei: ethers.parseEther("0.01"), description: "Unlock shimmering golden stripes.", owned: ownedPremiumAssetIds[1] || false },
            { id: 2, name: "Rainbow Brush (Sample)", price: "0.02", priceWei: ethers.parseEther("0.02"), description: "Paint with all colors at once.", owned: ownedPremiumAssetIds[2] || false },
        ]); return;
    }
    setStoreLoadingError(''); setTxMessage('Fetching store assets...'); setIsProcessing(true);
    try {
      const fetchedAssets: PremiumAssetDisplayInfo[] = []; const assetIdsToCheck = PREDEFINED_PREMIUM_ASSET_IDS;
      for (const id of assetIdsToCheck) {
        try {
          const asset = await premiumAssetsContract.assetTypes(id);
          if (asset.exists && asset.isActiveForSale) {
            const balance = userAddress ? await premiumAssetsContract.balanceOf(userAddress, id) : 0n;
            fetchedAssets.push({
              id: Number(asset.id), name: asset.name, price: ethers.formatEther(asset.price), priceWei: asset.price,
              description: `Max: ${asset.maxSupply === 0n ? '∞' : asset.maxSupply.toString()}`,
              maxSupply: asset.maxSupply === 0n ? 'Unlimited' : asset.maxSupply.toString(),
              currentSupply: asset.currentSupply.toString(),
              owned: Number(balance) > 0
            });
          }
        } catch (e) { /* Asset might not exist */ }
      }
      if (fetchedAssets.length > 0) { setPremiumAssetsForSale(fetchedAssets); setTxMessage('Store assets loaded.'); }
      else {
        setStoreLoadingError("No assets on contract. Showing samples.");
        setPremiumAssetsForSale([
            { id: 1, name: "Golden Stripes (Sample)", price: "0.01", priceWei: ethers.parseEther("0.01"), description: "Unlock shimmering golden stripes.", owned: ownedPremiumAssetIds[1] || false },
            { id: 2, name: "Rainbow Brush (Sample)", price: "0.02", priceWei: ethers.parseEther("0.02"), description: "Paint with all colors at once.", owned: ownedPremiumAssetIds[2] || false },
        ]); setTxMessage('');
      }
    } catch (e) {
        console.error("Error fetching store assets:", e); setStoreLoadingError("Error loading assets.");
        setPremiumAssetsForSale([
            { id: 1, name: "Golden Stripes (Sample/Err)", price: "0.01", priceWei: ethers.parseEther("0.01"), description: "Unlock shimmering golden stripes.", owned: ownedPremiumAssetIds[1] || false },
            { id: 2, name: "Rainbow Brush (Sample/Err)", price: "0.02", priceWei: ethers.parseEther("0.02"), description: "Paint with all colors at once.", owned: ownedPremiumAssetIds[2] || false },
        ]); setTxMessage('');
    }
    finally { setIsProcessing(false); }
  };

  useEffect(() => { /* ... same ... */
    if (showPremiumStore && (premiumAssetsContract || !userAddress)) { fetchPremiumAssetsForStore(); }
  }, [showPremiumStore, premiumAssetsContract, userAddress, ownedPremiumAssetIds]);

  useEffect(() => { /* AR Logic - same */
    const sceneEl = sceneRef.current;
    if (sceneEl) {
      const checkARSupport = async () => { if (navigator.xr) { try { const supported = await navigator.xr.isSessionSupported('immersive-ar'); setArSupported(supported); } catch (e) { setArSupported(false); } } else { setArSupported(false); } }; checkARSupport();
      const onEnterAR = () => { setInAR(true); sceneEl.setAttribute('ar-hit-test', 'enabled', true); if(reticleRef.current) reticleRef.current.setAttribute('visible', true); }; const onExitAR = () => { setInAR(false); sceneEl.setAttribute('ar-hit-test', 'enabled', false); if(reticleRef.current) reticleRef.current.setAttribute('visible', false); }; sceneEl.addEventListener('enter-vr', onEnterAR); sceneEl.addEventListener('exit-vr', onExitAR);
      const handleSceneClick = (event: MouseEvent) => { if ((event.target as HTMLElement)?.closest('.ui-container') || (event.target as HTMLElement)?.closest('.blockchain-ui') || (event.target as HTMLElement)?.closest('.premium-store-modal')) { return; } if (!inAR || !reticleRef.current ) return; const reticleIsVisible = reticleRef.current.getAttribute('visible'); if (!reticleIsVisible) { return; } const position = reticleRef.current.getAttribute('position'); let paintMark: any; switch (selectedPattern.style) { case 'stripes': paintMark = document.createElement('a-box'); paintMark.setAttribute('depth', '0.1'); paintMark.setAttribute('height', '0.1'); paintMark.setAttribute('width', '0.1'); break; default: paintMark = document.createElement('a-sphere'); paintMark.setAttribute('radius', '0.05'); break; } paintMark.setAttribute('color', selectedPattern.color1); if (selectedPattern.style === 'stripes' && selectedPattern.color2) { paintMark.setAttribute('material', `color: ${selectedPattern.color1}; wireframe: true; wireframeLinewidth: 3; wireframeColor: ${selectedPattern.color2}`); } paintMark.setAttribute('position', `${position.x} ${position.y} ${position.z}`); sceneEl.appendChild(paintMark); if (!objectiveMet) setPaintedObjectsCount(prevCount => prevCount + 1); }; sceneEl.addEventListener('click', handleSceneClick);
      return () => { sceneEl.removeEventListener('enter-vr', onEnterAR); sceneEl.removeEventListener('exit-vr', onExitAR); sceneEl.removeEventListener('click', handleSceneClick); };
    }
  }, [selectedPattern, patternAI, inAR, objectiveMet]);

  const connectWallet = async () => { /* Wallet Connection - fetch owned assets on connect */
    setTxMessage(''); setIsProcessing(true);
    if (typeof window.ethereum !== 'undefined') {
      try {
        const web3Provider = new ethers.BrowserProvider(window.ethereum);
        await web3Provider.send("eth_requestAccounts", []);
        const web3Signer = await web3Provider.getSigner();
        const address = await web3Signer.getAddress();
        setProvider(web3Provider); setSigner(web3Signer); setUserAddress(address);
        const network = await web3Provider.getNetwork();
        if (Number(network.chainId) === SEPOLIA_CHAIN_ID) {
          setNetworkCorrect(true);
          setNftRewardContract(new ethers.Contract(nftRewardContractAddress, nftRewardContractABI, web3Signer));
          setPremiumAssetsContract(new ethers.Contract(premiumAssetsContractAddress, premiumAssetsContractABI, web3Signer));
          setPlayerArtworkContract(new ethers.Contract(PlayerArtworkContractAddress, PlayerArtworkContractABI, web3Signer)); // Initialize PlayerArtwork contract
          setTxMessage('Wallet connected to Sepolia.');
          setTimeout(() => fetchOwnedPremiumAssets(), 100);
        } else {
            setNetworkCorrect(false); setNftRewardContract(null); setPremiumAssetsContract(null); setPlayerArtworkContract(null);
            setTxMessage(`Please switch to Sepolia. Current: ${network.chainId}`);
        }
        window.ethereum.on('accountsChanged', () => connectWallet()); // Simplified: re-run connect logic
        window.ethereum.on('chainChanged', () => connectWallet()); // Simplified: re-run connect logic
      } catch (e) { console.error(e); setTxMessage("Failed to connect wallet."); }
      finally { setIsProcessing(false); }
    } else { setTxMessage("MetaMask not detected."); setIsProcessing(false); }
  };

  const handleMintReward = async () => { /* ... same ... */
    if (!nftRewardContract || !userAddress || !networkCorrect || !signer) { setTxMessage("Wallet not connected to Sepolia for rewards."); return; }
    setIsMinting(true); setTxMessage("Minting reward NFT...");
    try { const rewardName = "Awesome Painter Award"; const contractWithSigner = nftRewardContract.connect(signer) as Contract; const tx = await contractWithSigner.mintReward(userAddress, rewardName); setTxMessage(`Tx sent: ${tx.hash}. Waiting...`); const receipt = await tx.wait(); setTxMessage(`Reward NFT minted! Tx: ${receipt.hash}`); } catch (e:any) { setTxMessage(`Minting error: ${e?.reason || e?.message || 'Unknown'}`); }
    finally { setIsMinting(false); }
  };

  const handlePurchaseAsset = async (asset: PremiumAssetDisplayInfo) => { /* ... same ... */
    if (!premiumAssetsContract || !userAddress || !networkCorrect || !signer) { setTxMessage("Wallet not connected for purchase."); return; }
    setIsProcessing(true); setTxMessage(`Purchasing ${asset.name}...`);
    try {
      const contractWithSigner = premiumAssetsContract.connect(signer) as Contract;
      const tx = await contractWithSigner.purchase(asset.id, 1, { value: asset.priceWei });
      setTxMessage(`Purchase tx sent: ${tx.hash}. Waiting...`);
      const receipt = await tx.wait();
      setTxMessage(`${asset.name} purchased! Tx: ${receipt.hash}`);
      fetchOwnedPremiumAssets();
      fetchPremiumAssetsForStore();
    } catch (e: any) { setTxMessage(`Purchase error: ${e?.reason || e?.message || 'Unknown'}`); }
    finally { setIsProcessing(false); }
  };

  const handleMintPlayerArtwork = async () => {
    if (!playerArtworkContract || !userAddress || !networkCorrect || !signer || !sceneRef.current) {
      setTxMessage("Cannot mint artwork: Wallet not connected properly or scene not ready.");
      return;
    }
    setIsMinting(true); // Use general isMinting or a new specific one like isMintingPlayerArt
    setTxMessage("Preparing your artwork for minting...");

    try {
      const currentSceneObjects = captureSceneData(sceneRef.current);
      if (currentSceneObjects.length === 0) {
        setTxMessage("There's nothing in your scene to mint!");
        setIsMinting(false);
        return;
      }

      const artworkDetails: ARArtworkData = {
        title: `AR Creation by ${userAddress.substring(0,6)}...`,
        description: "An artwork created using AR Painter PWA.",
        artistAddress: userAddress,
        objects: currentSceneObjects,
        createdAt: new Date().toISOString(),
      };

      // Simulate metadata generation and IPFS upload
      const metadataURI = await generateAndUploadArtworkMetadata(artworkDetails);
      setTxMessage(`Metadata prepared (${metadataURI}). Minting NFT...`);

      const contractWithSigner = playerArtworkContract.connect(signer) as Contract;
      const tx = await contractWithSigner.mintArtwork(metadataURI);

      setTxMessage(`Artwork minting transaction sent! Hash: ${tx.hash}. Waiting...`);
      const receipt = await tx.wait();
      const successMsg = `Artwork NFT minted! Tx: ${receipt.hash}. URI: ${metadataURI}`;
      setTxMessage(successMsg);
      console.log(successMsg, receipt);
      setLastMintedArtwork({
        txHash: receipt.hash as string,
        metadataURI: metadataURI,
        title: artworkDetails.title,
      });
      // Clear scene or reset painted objects count if desired after minting
      // setPaintedObjectsCount(0);
    } catch (error: any) {
      console.error("Error minting player artwork:", error);
      setTxMessage(`Artwork minting error: ${error?.reason || error?.message || 'Unknown error'}`);
    } finally {
      setIsMinting(false);
    }
  };

  const togglePremiumAI = () => { /* ... same ... */
    setHasPremiumAIAccess(!hasPremiumAIAccess);
    setTxMessage( !hasPremiumAIAccess ? "Premium AI Features Activated! ✨ (Mock)" : "Premium AI Features Deactivated.");
    setTimeout(() => { setSuggestedPattern(patternAI.suggestPattern(selectedPattern, availablePatterns, !hasPremiumAIAccess)); },0);
  };

  const handleAcceptSuggestion = () => { if (suggestedPattern) setSelectedPattern(suggestedPattern); setSuggestedPattern(patternAI.suggestPattern(selectedPattern, availablePatterns, hasPremiumAIAccess)); };
  const handleNextSuggestion = () => { setSuggestedPattern(patternAI.suggestPattern(selectedPattern, availablePatterns, hasPremiumAIAccess)); };

  // Rewarded Ad handlers
  useEffect(() => {
    if (rewardGranted) {
      setSparkleFlowUnlocked(true);
      setAdErrorMessage("Sparkle Flow pattern unlocked for this session!");
      // Optionally reset the ad state if you want the user to be able to watch another ad
      // resetRewardAdState();
    }
  }, [rewardGranted, sparkleFlowPattern]);

  useEffect(() => {
    if (rewardAdError) {
      setAdErrorMessage(`Ad Error: ${rewardAdError}`);
    }
  }, [rewardAdError]);

  useEffect(() => {
    if (rewardAdClosed && !rewardGranted) {
      setAdErrorMessage("Ad closed without reward. Click again to retry.");
      // resetRewardAdState(); // Allow trying again immediately
    }
  }, [rewardAdClosed, rewardGranted, resetRewardAdState]);


  const handleShowRewardAd = () => {
    if (sparkleFlowUnlocked) {
      setAdErrorMessage("Sparkle Flow is already unlocked for this session!");
      return;
    }
    if (isRewardAdReady) {
      setAdErrorMessage(null);
      showRewardAd();
    } else if (isRewardAdLoading) {
      setAdErrorMessage("Ad is still loading, please wait...");
    } else {
      if (rewardAdClosed && !rewardGranted) {
        resetRewardAdState();
        setAdErrorMessage("Ad reset. Please click again to show.");
      } else if (rewardAdError) {
        setAdErrorMessage(`Ad not ready. Error: ${rewardAdError}. Try resetting or refresh.`);
        resetRewardAdState(); // Attempt reset on error too
      } else {
        setAdErrorMessage("Ad not ready. Please wait or try again.");
        resetRewardAdState();
      }
    }
  };


  return (
    <div style={{ width: '100%', height: '100vh', position: 'relative', overflow:'hidden' }}>
      <a-scene ref={sceneRef} webxr="optionalFeatures: hit-test,dom-overlay,plane-detection; overlayElement: #ar-ui-overlay;" renderer="colorManagement: true; physicallyCorrectLights: true;" vr-mode-ui={`enabled: ${arSupported}; enterVRButton: #ar-enter-button;`} ar-hit-test="enabled: false;" ar-plane-manager style={{ width: '100%', height: '100%' }} debug={false}>
        <a-camera position="0 1.6 0" look-controls="magicWindowTrackingEnabled: false; touchEnabled: false; mouseEnabled: true"><a-cursor fuse="false" design="ring" visible={!inAR}></a-cursor></a-camera>
        <a-sky color="#ECECEC" visible={!inAR}></a-sky>
        <a-entity ref={reticleRef} id="reticle" geometry="primitive: ring; radiusInner: 0.01; radiusOuter: 0.015" material="color: #FFF; shader: flat; opacity: 0.8;" position="0 0 -0.5" visible="false" ar-hit-test-target />
        <a-light type="ambient" color="#BBB" /><a-light type="directional" color="#FFF" intensity="0.8" position="-0.5 1 1" />
      </a-scene>

      <div id="ar-ui-overlay" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1, visibility: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', pointerEvents: 'none' }}>
        <div style={{display:'flex', justifyContent:'space-between', pointerEvents:'auto'}}>
            <div className="ui-container" style={{ visibility: inAR ? 'visible' : 'hidden', margin: '10px', background: 'rgba(255,255,255,0.9)', padding: '10px', borderRadius: '8px', maxWidth: '300px', maxHeight: 'calc(100vh - 160px)', overflowY: 'auto', boxShadow: '0 2px 10px rgba(0,0,0,0.2)' }}>
                {/* Painting Controls UI */}
                <p style={{fontWeight: 'bold', marginBottom: '8px', fontSize:'1em', borderBottom: '1px solid #eee', paddingBottom:'5px'}}>Painting Controls</p>
                <div style={{padding: '5px', margin: '5px 0 10px 0', background: objectiveMet ? 'lightgreen' : '#f0f0f0', borderRadius: '5px', border: '1px solid #ccc'}}><p style={{fontSize: '0.9em', fontWeight: 'bold', color: objectiveMet? 'green' : '#333'}}>Objective: Paint {paintingGoal} objects</p><p style={{fontSize: '0.85em', color: objectiveMet? 'green' : '#555'}}>Progress: {paintedObjectsCount} / {paintingGoal}</p>{objectiveMet && <p style={{fontSize: '0.85em', color: 'green', fontWeight:'bold'}}>Objective Complete!</p>}</div><hr style={{margin: '8px 0'}}/>
                <div><p style={{fontSize: '0.9em', marginBottom:'2px'}}>Selected: <strong style={{color: selectedPattern.color1}}>{selectedPattern.name} {(selectedPattern as PremiumPattern).isPremium && '✨'}</strong></p><div style={{display: 'flex', alignItems: 'center', margin: '5px 0 10px 0'}}>Preview: <div style={{ width: '24px', height: '24px', backgroundColor: selectedPattern.color1, border: '1px solid #333', marginLeft: '8px', borderRadius: selectedPattern.style === 'stripes' ? '0' : '50%' }}></div>{selectedPattern.color2 && <div style={{ width: '24px', height: '24px', backgroundColor: selectedPattern.color2, border: '1px solid #333', marginLeft: '3px', borderRadius: selectedPattern.style === 'stripes' ? '0' : '50%'}}></div>}</div></div><hr style={{margin: '8px 0'}}/>
                <div style={{margin: '10px 0'}}>
                  <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'5px'}}><p style={{fontSize: '0.9em', margin:0}}>AI Suggestions {hasPremiumAIAccess && <span style={{color:'purple', fontWeight:'bold'}}>(Premium ✨)</span>}</p><button onClick={togglePremiumAI} title="Toggle Premium AI (Mock)" style={{fontSize:'0.7em', padding:'3px 6px', background: hasPremiumAIAccess ? 'purple' : '#6c757d', color:'white', border:'none', borderRadius:'3px', cursor:'pointer'}}>{hasPremiumAIAccess ? 'Std AI' : 'Adv AI'}</button></div>
                  <p style={{fontSize: '0.8em', marginBottom:'2px', fontStyle:'italic'}}>Suggests: <strong style={{color: suggestedPattern?.color1}}>{suggestedPattern?.name || 'None'} {(suggestedPattern as PremiumPattern)?.isPremium && '✨'} {premiumAIPatternsLibrary.find(p => p.id === suggestedPattern?.id) && <span title="AI Exclusive Suggestion">(AI Only)</span>}</strong></p>
                  {suggestedPattern && (<div style={{display: 'flex', alignItems: 'center', margin: '5px 0 10px 0'}}>Preview: <div style={{ width: '20px', height: '20px', backgroundColor: suggestedPattern.color1, border: '1px solid #ccc', marginLeft: '8px', borderRadius: suggestedPattern.style === 'stripes' ? '0' : '50%'}}></div>{suggestedPattern.color2 && <div style={{ width: '20px', height: '20px', backgroundColor: suggestedPattern.color2, border: '1px solid #ccc', marginLeft: '3px', borderRadius: suggestedPattern.style === 'stripes' ? '0' : '50%'}}></div>}</div>)}
                  <button onClick={handleAcceptSuggestion} disabled={!suggestedPattern} style={{fontSize: '0.85em', padding: '6px 12px', marginRight: '8px', cursor:'pointer', borderRadius:'5px'}}>Accept</button><button onClick={handleNextSuggestion} style={{fontSize: '0.85em', padding: '6px 12px', cursor:'pointer', borderRadius:'5px'}}>Next</button>
                </div>
                <hr style={{margin: '8px 0'}}/>
                {/* Rewarded Ad Section */}
                {!sparkleFlowUnlocked && (
                  <div style={{margin: '10px 0', padding: '10px', border: '1px solid #ddd', background: '#f0f0f0', borderRadius: '5px'}}>
                    <p style={{fontSize: '0.9em', fontWeight:'bold', margin: '0 0 5px 0'}}>Get a Free Special Pattern!</p>
                    <button
                      onClick={handleShowRewardAd}
                      disabled={isRewardAdLoading || sparkleFlowUnlocked}
                      style={{fontSize: '0.85em', padding: '8px 12px', cursor: (isRewardAdLoading || sparkleFlowUnlocked) ? 'not-allowed' : 'pointer', borderRadius:'5px', background: sparkleFlowUnlocked ? '#ccc' : (isRewardAdReady ? '#28a745' : '#007bff'), color: 'white', border:'none'}}
                    >
                      {isRewardAdLoading ? 'Loading Ad...' : (sparkleFlowUnlocked ? 'Sparkle Unlocked!' : (isRewardAdReady ? 'Watch Ad for Sparkle Flow ✨' : 'Load Ad for Sparkle Flow ✨'))}
                    </button>
                    {adErrorMessage && <p style={{color: rewardGranted ? 'green': 'red', fontSize: '0.8em', marginTop: '8px', marginBottom: 0}}>{adErrorMessage}</p>}
                  </div>
                )}
                {sparkleFlowUnlocked && (
                   <div style={{margin: '10px 0', padding: '10px', border: '1px solid green', background: 'lightgreen', borderRadius: '5px'}}>
                     <p style={{fontSize: '0.9em', fontWeight:'bold', margin: '0 0 5px 0'}}>✨ Sparkle Flow Pattern Unlocked! ✨</p>
                     <p style={{fontSize: '0.8em', margin:0}}>It's now available in your pattern picker below.</p>
                   </div>
                )}
                <hr style={{margin: '8px 0'}}/>
                <p style={{fontSize: '0.9em', marginBottom: '8px'}}>Choose from your patterns:</p><div className="pattern-picker" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '5px' }}>{availablePatterns.map(p => (<button key={p.id} onClick={() => setSelectedPattern(p)} title={p.name} style={{ padding: '6px', border: selectedPattern.id === p.id ? '3px solid #007bff' : '1px solid #ccc', background: (p as any).isReward ? 'linear-gradient(45deg, cyan, magenta)' : 'rgba(255,255,255,0.8)', cursor: 'pointer', minWidth: '55px', textAlign: 'center', borderRadius:'5px'}}><div style={{display: 'flex', justifyContent:'center', marginBottom:'3px'}}><div style={{width: '18px', height: '18px', backgroundColor: p.color1, marginRight: p.color2 ? '2px' : '0', borderRadius: p.style === 'stripes' ? '0' : '50%', border:'1px solid #eee' }}></div>{p.color2 && <div style={{width: '18px', height: '18px', backgroundColor: p.color2, borderRadius: p.style === 'stripes' ? '0' : '50%', border:'1px solid #eee'}}></div>}</div><span style={{fontSize: '0.7em', display:'block', color: (p as any).isReward ? 'white' : '#333'}}>{p.name.substring(0,10)}{p.name.length > 10 ? '...' : ''} {(p as PremiumPattern).isPremium && '✨'} {(p as any).isReward && '🎁'}</span></button>))}</div>
                <p style={{marginTop: '15px', fontSize: '0.8em', fontStyle:'italic', color: '#555'}}>Click on a detected AR surface to paint.</p>
            </div>
            {inAR && ( /* Show store toggle only in AR */
                <div style={{display: 'flex', flexDirection: 'column'}}>
                    <button onClick={() => setShowPremiumStore(!showPremiumStore)} style={{ margin: '10px', padding: '10px 15px', background: '#ffc107', color:'black', border:'none', borderRadius:'5px', cursor:'pointer', height:'fit-content' }}>
                        {showPremiumStore ? 'Close Store 💎' : 'Premium Store 💎'}
                    </button>
                    {paintedObjectsCount > 0 && userAddress && networkCorrect && ( // Show Mint Artwork button if something is painted and wallet connected
                         <button onClick={handleMintPlayerArtwork} disabled={isMinting || isProcessing} style={{ margin: '0 10px 10px 10px', padding: '10px 15px', background: '#17a2b8', color:'white', border:'none', borderRadius:'5px', cursor:'pointer', height:'fit-content' }}>
                            {isMinting ? 'Minting Artwork...' : 'Mint My Artwork NFT'}
                        </button>
                    )}
                </div>
            )}
        </div>

        {showPremiumStore && inAR && ( /* Premium Store Modal */
          <div className="premium-store-modal" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 'clamp(300px, 80vw, 600px)', maxHeight: '80vh', background: 'rgba(250, 250, 250, 0.98)', color: '#333', padding: '20px', borderRadius: '10px', boxShadow: '0 5px 25px rgba(0,0,0,0.3)', zIndex: 20, pointerEvents: 'auto', overflowY: 'auto' }}>
            <h3 style={{textAlign:'center', marginTop:0, borderBottom:'1px solid #ddd', paddingBottom:'10px'}}>Premium Asset Store 💎</h3>
            {storeLoadingError && <p style={{color: 'red', textAlign:'center'}}>{storeLoadingError}</p>}
            {(isProcessing && !premiumAssetsForSale.length && !storeLoadingError) && <p style={{textAlign:'center'}}>Loading assets...</p>}
            {premiumAssetsForSale.length > 0 ? ( <ul style={{listStyle:'none', padding:0}}>{premiumAssetsForSale.map(asset => (<li key={asset.id} style={{borderBottom: '1px solid #eee', padding:'10px 0', display:'flex', justifyContent:'space-between', alignItems:'center', opacity: asset.owned ? 0.6 : 1}}><div><h4 style={{margin:'0 0 5px 0'}}>{asset.name} {asset.owned && '(Owned ✨)'}</h4><p style={{fontSize:'0.85em', margin:'0 0 5px 0', color:'#555'}}>{asset.description}</p><p style={{fontSize:'0.9em', margin:0, fontWeight:'bold'}}>Price: {asset.price} {SEPOLIA_CHAIN_ID === 11155111 ? "SepoliaETH" : "ETH/MATIC"}</p>{asset.currentSupply && asset.maxSupply && <p style={{fontSize:'0.75em', margin:'3px 0 0 0', color:'#777'}}>Supply: {asset.currentSupply} / {asset.maxSupply}</p>}</div><button onClick={() => handlePurchaseAsset(asset)} disabled={isProcessing || !premiumAssetsContract || !networkCorrect || asset.owned} style={{padding:'8px 15px', fontSize:'0.9em', background: asset.owned ? '#6c757d' : '#007bff', color:'white', border:'none', borderRadius:'5px', cursor: asset.owned ? 'default' : 'pointer', whiteSpace:'nowrap', marginLeft:'10px'}}>{isProcessing && 'Busy...'}{!isProcessing && asset.owned && 'Owned'}{!isProcessing && !asset.owned && 'Purchase'}</button></li>))}</ul>) : !storeLoadingError && !isProcessing ? <p style={{textAlign:'center'}}>No assets available for sale currently.</p> : null}
            <button onClick={() => setShowPremiumStore(false)} style={{display:'block', margin:'20px auto 0 auto', padding:'10px 20px', background:'#6c757d', color:'white', border:'none', borderRadius:'5px', cursor:'pointer'}}>Close Store</button>
          </div>
        )}

        <div className="blockchain-ui" style={{ position: 'absolute', bottom: inAR ? '80px': '20px', left: '50%', transform: 'translateX(-50%)', zIndex: 10, background: 'rgba(20,20,20,0.85)', color: 'white', padding: '12px 18px', borderRadius: '10px', textAlign: 'center', pointerEvents: 'auto', minWidth: '320px', boxShadow: '0 2px 10px rgba(0,0,0,0.3)' }}>
            {!userAddress ? (<button onClick={connectWallet} disabled={isProcessing} style={{padding: '10px 18px', fontSize:'0.95em', cursor:isProcessing?'not-allowed':'pointer', background:isProcessing?'grey':'#007bff', color:'white', border:'none', borderRadius:'5px'}}>{isProcessing? 'Connecting...' : 'Connect Wallet'}</button>) : (<div> <p style={{fontSize: '0.9em', marginBottom: '10px'}}>Connected: {userAddress.substring(0, 6)}...{userAddress.substring(userAddress.length - 4)} <span style={{color: networkCorrect === null ? 'yellow' : networkCorrect ? 'lightgreen' : 'orange', marginLeft:'8px', fontWeight: networkCorrect === false ? 'bold' : 'normal'}}>({networkCorrect === null ? 'Checking Network...' : networkCorrect ? 'Sepolia OK' : 'Wrong Network!'})</span></p><button onClick={handleMintReward} disabled={!objectiveMet || !nftRewardContract || !networkCorrect || isMinting || isProcessing} style={{padding: '10px 18px', fontSize:'0.95em', cursor: (!objectiveMet || !nftRewardContract || !networkCorrect || isMinting || isProcessing) ? 'not-allowed' : 'pointer', background: (!objectiveMet || !nftRewardContract || !networkCorrect || isMinting || isProcessing) ? 'grey' : (objectiveMet ? '#28a745' : 'grey'), color:'white', border:'none', borderRadius:'5px', opacity: !objectiveMet ? 0.6 : 1 }}>{isMinting ? "Minting Reward..." : (objectiveMet ? "Claim Reward NFT!" : "Complete Objective to Claim")}</button></div>)}
            {txMessage && <p style={{fontSize: '0.8em', marginTop: '10px', wordBreak: 'break-word', background: 'rgba(255,255,255,0.1)', padding: '6px 8px', borderRadius: '5px'}}>{txMessage}</p>}

            {/* Display Last Minted Artwork Info */}
            {lastMintedArtwork && (
              <div style={{marginTop: '15px', paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.2)'}}>
                <p style={{fontSize: '0.9em', fontWeight: 'bold', marginBottom: '5px'}}>Last Artwork Minted:</p>
                <p style={{fontSize: '0.8em', margin: '3px 0'}}>Title: {lastMintedArtwork.title}</p>
                <p style={{fontSize: '0.8em', margin: '3px 0', wordBreak: 'break-all'}}>Metadata: <a href={lastMintedArtwork.metadataURI.replace("ipfs://", "https://ipfs.io/ipfs/")} target="_blank" rel="noopener noreferrer" style={{color:'lightblue'}}>{lastMintedArtwork.metadataURI}</a></p>
                <p style={{fontSize: '0.8em', margin: '3px 0'}}>
                  Tx: <a href={`https://sepolia.etherscan.io/tx/${lastMintedArtwork.txHash}`} target="_blank" rel="noopener noreferrer" style={{color:'lightblue'}}>{lastMintedArtwork.txHash.substring(0,10)}...</a>
                </p>
              </div>
            )}
        </div>
      </div>

      {!inAR && arSupported && (<button id="ar-enter-button" className="ar-button">Enter AR</button>)}
      {!inAR && !arSupported && (<div className="ar-button" style={{backgroundColor: '#aaa', cursor:'default'}}>AR Not Supported</div>)}
      {inAR && (<button className="ar-button" style={{bottom: '20px', right: '20px', left:'auto', transform:'none', background:'#dc3545'}} onClick={() => sceneRef.current?.exitVR()}>Exit AR</button>)}
    </div>
  );
};

const App: React.FC = () => { return (<Router><Routes><Route path="/" element={<ARPainterPage />} /></Routes></Router>); };
export default App;
