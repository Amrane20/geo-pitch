// import React, { useState, useRef, useEffect } from 'react';
// import Map, { Marker, Source, Layer } from 'react-map-gl/maplibre';
// import * as maplibregl from 'maplibre-gl';
// import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';
// import html2canvas from 'html2canvas'; 
// import 'maplibre-gl/dist/maplibre-gl.css';
// import './App.css'; 

// import premierLogo from './assets/premier-league-logo.png';
// import laligaLogo from './assets/LaLiga-Logo.png';
// import serieaLogo from './assets/Italian-Serie-A-Logo.png';
// import franceLogo from './assets/Ligue-1-Logo.png';
// import germanLogo from './assets/Bundesliga-Logo.png';

// // LEAGUE DATA IMPORTS
// import { DESTINATIONS as ALL_DESTS } from './data/destinations';
// import { DESTINATIONS as PL_DESTS } from './data/Prmier_League';
// import { DESTINATIONS as LALIGA_DESTS } from './data/La_Liga';
// import { DESTINATIONS as FR_DESTS } from './data/FR_League';
// import { DESTINATIONS as DU_DESTS } from './data/Du_League';
// import { DESTINATIONS as SA_DESTS } from './data/Serie_A'; 

// // MULTIPLAYER IMPORTS
// import { ref, set, get, onValue, update, query, orderByChild, endAt } from "firebase/database";
// import { db } from './firebase'; 

// if (maplibregl.setWorkerUrl) {
//   maplibregl.setWorkerUrl(workerUrl);
// }

// // Dynamic Game Modes based on League (Global vs Regional)
// const getGameModes = (league) => {
//   const isGlobal = league === 'all';
//   return {
//     short: { id: 'short', matches: 5, budget: isGlobal ? 10000 : 3000 },
//     standard: { id: 'standard', matches: 7, budget: isGlobal ? 15000 : 5000 },
//     endless: { id: 'endless', matches: Infinity, budget: isGlobal ? 25000 : 8000 }
//   };
// };

// const LEAGUES_DATA = {
//   all: ALL_DESTS,
//   premier: PL_DESTS,
//   laliga: LALIGA_DESTS,
//   seriea: SA_DESTS,
//   france: FR_DESTS,
//   german: DU_DESTS
// };

// // Specific Camera Viewports for each map
// const LEAGUE_VIEWPORTS = {
//   all: { center: [0, 20], zoom: 1.5 },
//   premier: { center: [-2.5, 53.0], zoom: 5.5 },  // Centered on UK
//   laliga: { center: [-4.0, 40.0], zoom: 5.2 },   // Centered on Spain
//   seriea: { center: [12.5, 41.9], zoom: 5.2 },   // Centered on Italy
//   france: { center: [2.2, 46.2], zoom: 5.2 },    // Centered on France
//   german: { center: [10.4, 51.1], zoom: 5.3 }    // Centered on Germany
// };

// const LEAGUE_OPTIONS = [
//   { id: 'all', titleEn: 'Global', titleAr: 'عالمي', logoUrl: '🌍', isEmoji: true },
//   { id: 'premier', titleEn: 'Premier League', titleAr: 'الدوري الإنجليزي', logoUrl: premierLogo },
//   { id: 'laliga', titleEn: 'La Liga', titleAr: 'الدوري الإسباني', logoUrl: laligaLogo },
//   { id: 'seriea', titleEn: 'Serie A', titleAr: 'الدوري الإيطالي', logoUrl: serieaLogo },
//   { id: 'france', titleEn: 'Ligue 1', titleAr: 'الدوري الفرنسي', logoUrl: franceLogo },
//   { id: 'german', titleEn: 'Bundesliga', titleAr: 'الدوري الألماني', logoUrl: germanLogo }
// ];

// const mapStyle = {
//   version: 8,
//   projection: { type: 'globe' },
//   glyphs: "https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf",
//   sources: {
//     'satellite-tiles': {
//       type: 'raster',
//       tiles: ['https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'],
//       tileSize: 256,
//       maxzoom: 19 // Changed to allow deep zoom fetching
//     },
//     'countries-boundaries': {
//       type: 'geojson',
//       data: 'https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_50m_admin_0_countries.geojson',
//       tolerance: 1.5 
//     },
//     'countries-labels': {
//       type: 'geojson',
//       data: 'https://raw.githubusercontent.com/gavinr/world-countries-centroids/master/dist/countries.geojson'
//     },
//     'major-cities': {
//       type: 'geojson',
//       data: 'https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_10m_populated_places_simple.geojson',
//       tolerance: 2 
//     }
//   },
//   layers: [
//     { id: 'background', type: 'background', paint: { 'background-color': '#03050c' } },
//     // Maxzoom 22 prevents the satellite from disappearing when zooming in closely
//     { id: 'satellite', type: 'raster', source: 'satellite-tiles', minzoom: 0, maxzoom: 22, paint: { 'raster-brightness-min': 0.15, 'raster-brightness-max': 0.95, 'raster-saturation': 0.1 } },
//     { id: 'admin-boundaries', type: 'line', source: 'countries-boundaries', paint: { 'line-color': '#ffffff', 'line-width': 1.2, 'line-opacity': 0.55 } },
//     {
//       id: 'admin-labels',
//       type: 'symbol',
//       source: 'countries-labels',
//       layout: {
//         'text-field': ['case', ['has', 'ISO'], ['get', 'ISO'], ['upcase', ['slice', ['get', 'COUNTRY'], 0, 2]]],
//         'text-font': ['Open Sans Bold'],
//         'text-size': 14,
//         'text-anchor': 'center'
//       },
//       paint: { 'text-color': '#ffffff', 'text-halo-color': 'rgba(0, 0, 0, 0.85)', 'text-halo-width': 1.5 }
//     },
//     {
//       id: 'city-labels',
//       type: 'symbol',
//       source: 'major-cities',
//       minzoom: 5, 
//       layout: {
//         'text-field': ['get', 'name'],
//         'text-font': ['Open Sans Bold'],
//         'text-size': [
//           'interpolate', ['linear'], ['zoom'],
//           5, 10,
//           9, 12,
//           16, 16
//         ],
//         'text-anchor': 'center',
//         'text-padding': 1 
//       },
//       paint: {
//         'text-color': '#cbd5e1', 
//         'text-halo-color': 'rgba(0, 0, 0, 0.9)',
//         'text-halo-width': 1.5
//       }
//     }
//   ]
// };

// const flightPathStyle = { id: 'flight-path-layer', type: 'line', paint: { 'line-color': '#00ffcc', 'line-width': 3, 'line-dasharray': [2, 2] } };

// const playFlightSound = () => { try { const ctx = new (window.AudioContext || window.webkitAudioContext)(); const now = ctx.currentTime; const osc = ctx.createOscillator(); const filter = ctx.createBiquadFilter(); const gain = ctx.createGain(); osc.type = 'sawtooth'; osc.frequency.setValueAtTime(150, now); osc.frequency.exponentialRampToValueAtTime(1200, now + 1.2); filter.type = 'lowpass'; filter.frequency.setValueAtTime(400, now); filter.frequency.exponentialRampToValueAtTime(2500, now + 1.2); gain.gain.setValueAtTime(0.05, now); gain.gain.linearRampToValueAtTime(0.1, now + 0.6); gain.gain.linearRampToValueAtTime(0.001, now + 1.2); osc.connect(filter); filter.connect(gain); gain.connect(ctx.destination); osc.start(now); osc.stop(now + 1.2); } catch(e) {} };
// const playSuccessSound = () => { try { const ctx = new (window.AudioContext || window.webkitAudioContext)(); const now = ctx.currentTime; [659.25, 830.61, 987.77, 1318.51, 1661.22].forEach((freq, index) => { const osc = ctx.createOscillator(); const gain = ctx.createGain(); osc.type = 'sine'; osc.frequency.setValueAtTime(freq, now + index * 0.06); gain.gain.setValueAtTime(0.1, now + index * 0.06); gain.gain.exponentialRampToValueAtTime(0.0001, now + index * 0.06 + 0.4); osc.connect(gain); gain.connect(ctx.destination); osc.start(now + index * 0.06); osc.stop(now + index * 0.06 + 0.4); }); } catch(e) {} };
// const playErrorSound = () => { try { const ctx = new (window.AudioContext || window.webkitAudioContext)(); const now = ctx.currentTime; const osc = ctx.createOscillator(); const gain = ctx.createGain(); osc.type = 'square'; osc.frequency.setValueAtTime(110, now); osc.frequency.setValueAtTime(80, now + 0.1); gain.gain.setValueAtTime(0.1, now); gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25); osc.connect(gain); gain.connect(ctx.destination); osc.start(now); osc.stop(now + 0.25); } catch(e) {} };

// const QuitConfirmModal = ({ lang, onConfirm, onCancel }) => {
//   return (
//     <div className="ad-modal-overlay" style={{ direction: lang === 'ar' ? 'rtl' : 'ltr' }}>
//       <div className="glass-panel ad-modal" style={{ padding: '30px 25px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
//         <div className="warning-icon-wrapper">
//           <span style={{ fontSize: '32px', display: 'block', lineHeight: 1 }}>⚠️</span>
//         </div>
//         <h2 style={{ color: 'white', margin: '0 0 10px 0', fontSize: '24px' }}>
//           {lang === 'en' ? 'Quit Game?' : 'الخروج من اللعبة؟'}
//         </h2>
//         <p style={{ color: '#cbd5e1', fontSize: '14px', margin: '0 0 25px 0', textAlign: 'center', lineHeight: '1.5' }}>
//           {lang === 'en' 
//             ? 'Are you sure you want to quit the current game? Your progress will be lost.' 
//             : 'هل أنت متأكد أنك تريد إنهاء اللعبة الحالية؟ سيتم فقدان تقدمك.'}
//         </p>
//         <div style={{ display: 'flex', gap: '15px', width: '100%' }}>
//           <button className="btn-secondary" style={{ flex: 1, margin: 0 }} onClick={onCancel}>
//             {lang === 'en' ? 'Cancel' : 'إلغاء'}
//           </button>
//           <button className="btn-danger" style={{ flex: 1, margin: 0 }} onClick={onConfirm}>
//             {lang === 'en' ? 'Quit' : 'خروج'}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default function App() {
//   const [gameState, setGameState] = useState('start');
//   const [startMenu, setStartMenu] = useState('main'); 

//   const [lang, setLang] = useState('en');
//   const [playerName, setPlayerName] = useState('');
//   const [isNameInvalid, setIsNameInvalid] = useState(false);
  
//   const requirePlayerName = () => {
//     if (!playerName.trim()) {
//       setIsNameInvalid(true);
//       setTimeout(() => setIsNameInvalid(false), 400);
//       alert(lang === 'en' ? "Please enter your name first" : "الرجاء إدخال اسمك أولاً");
//       return false;
//     }
//     return true;
//   };
  
//   const [selectedLeague, setSelectedLeague] = useState('all');

//   const [gameMode, setGameMode] = useState(null);
//   const [sessionData, setSessionData] = useState([]);
//   const [currentIndex, setCurrentIndex] = useState(0);
//   const [budget, setBudget] = useState(0);
  
//   const [matchHistory, setMatchHistory] = useState([]); 
//   const [totalBonuses, setTotalBonuses] = useState(0);
//   const [totalExpenses, setTotalExpenses] = useState(0);
  
//   const [guessCoords, setGuessCoords] = useState(null);
//   const [distanceError, setDistanceError] = useState(null);
//   const [moneyCost, setMoneyCost] = useState(null);

//   const [skipsRemaining, setSkipsRemaining] = useState(3);
//   const [totalSkipCost, setTotalSkipCost] = useState(0);

//   const [animationProgress, setAnimationProgress] = useState(0);
//   const [isSharing, setIsSharing] = useState(false);
  
//   const shareCardRef = useRef(null);
//   const mapRef = useRef(null);
  
//   const leagueSliderRef = useRef(null);

//   const scrollLeagues = (direction) => {
//     if (leagueSliderRef.current) {
//       const scrollAmount = 130; 
//       const isRTL = lang === 'ar'; 
//       let moveBy = direction === 'left' ? -scrollAmount : scrollAmount;
//       if (isRTL) moveBy = -moveBy; 
//       leagueSliderRef.current.scrollBy({ left: moveBy, behavior: 'smooth' });
//     }
//   };

//   const [roomCode, setRoomCode] = useState('');
//   const [joinCodeInput, setJoinCodeInput] = useState('');
//   const [livePlayers, setLivePlayers] = useState({});
//   const [playerId] = useState(`player_${Math.floor(Math.random() * 100000)}`);
//   const [isHost, setIsHost] = useState(false);
//   const [timeLeft, setTimeLeft] = useState(120);
//   const [expiresAt, setExpiresAt] = useState(null);
  
//   const [showQuitModal, setShowQuitModal] = useState(false);
//   const [isClueExpanded, setIsClueExpanded] = useState(true);

//   const isMapVisible = ['playing', 'animating', 'locked'].includes(gameState);

//   // Dynamic variable derivations for UI rendering
//   const activeModes = getGameModes(selectedLeague);
//   const dynamicSkipCost = selectedLeague === 'all' ? 1000 : 300;
//   const formatB = (val) => val >= 1000 ? `${val / 1000}k` : val;

//   // Automatically centers map correctly on start
//   useEffect(() => {
//     if (gameState === 'playing' && currentIndex === 0 && mapRef.current) {
//       const viewport = LEAGUE_VIEWPORTS[selectedLeague] || LEAGUE_VIEWPORTS['all'];
//       mapRef.current.jumpTo({ center: viewport.center, zoom: viewport.zoom, pitch: 0, bearing: 0 });
//     }
//   }, [gameState, currentIndex, selectedLeague]);

//   const handleNameChange = (e) => {
//     const value = e.target.value;
//     const regex = /^[a-zA-Z0-9\u0600-\u06FF\s]*$/;
//     if (regex.test(value)) {
//       setPlayerName(value); setIsNameInvalid(false);
//     } else {
//       setIsNameInvalid(true); setTimeout(() => setIsNameInvalid(false), 400);
//     }
//   };

//   const cleanExpiredRooms = async () => {
//     try {
//       const now = Date.now();
//       const oldRoomsQuery = query(ref(db, 'rooms'), orderByChild('expiresAt'), endAt(now));
//       const snapshot = await get(oldRoomsQuery);
//       if (snapshot.exists()) {
//         const updates = {};
//         snapshot.forEach((child) => { updates[child.key] = null; });
//         await update(ref(db, 'rooms'), updates);
//       }
//     } catch (error) {}
//   };

//   const handleMenuClick = (menuTarget) => {
//     if (!requirePlayerName()) return;
//     if (menuTarget === 'multi') cleanExpiredRooms();
//     setStartMenu(menuTarget);
//   };

//   const createLiveRoom = async () => {
//     if (!requirePlayerName()) return; 
    
//     const currentLeagueData = LEAGUES_DATA[selectedLeague];
//     const shuffled = [...currentLeagueData].sort(() => 0.5 - Math.random());
//     const matchIndices = shuffled.slice(0, 5).map(dest => currentLeagueData.indexOf(dest));

//     const code = Math.random().toString(36).substring(2, 6).toUpperCase();
//     const expiry = Date.now() + 120000;
    
//     const initialBudget = getGameModes(selectedLeague).short.budget;
    
//     await set(ref(db, `rooms/${code}`), {
//       status: 'waiting', 
//       expiresAt: expiry, 
//       league: selectedLeague, 
//       locations: matchIndices,
//       players: { [playerId]: { name: playerName, score: initialBudget, finished: false } }
//     });

//     setRoomCode(code); setIsHost(true); setExpiresAt(expiry);
//     setGameState('lobby'); listenToRoom(code);
//   };

//   const joinLiveRoom = async () => {
//     if (!requirePlayerName()) return;
//     if (!joinCodeInput.trim()) return;
    
//     const code = joinCodeInput.toUpperCase();
//     const snapshot = await get(ref(db, `rooms/${code}`));

//     if (snapshot.exists()) {
//       const data = snapshot.val();
//       if (data.status !== 'waiting') return alert(lang === 'en' ? "Match already started!" : "المباراة بدأت بالفعل!");
//       if (Object.keys(data.players || {}).length >= 4) return alert(lang === 'en' ? "Room is full! (Max 4)" : "الغرفة ممتلئة! (الحد الأقصى 4)");

//       const roomModes = getGameModes(data.league || 'all');
//       const initialBudget = roomModes.short.budget;

//       await update(ref(db, `rooms/${code}/players`), { [playerId]: { name: playerName, score: initialBudget, finished: false } });
//       setRoomCode(code); setIsHost(false); setExpiresAt(data.expiresAt);
//       setGameState('lobby'); listenToRoom(code);
//     } else {
//       alert(lang === 'en' ? "Room not found or expired." : "الغرفة غير موجودة أو انتهت صلاحيتها.");
//     }
//   };

//   const listenToRoom = (code) => {
//     onValue(ref(db, `rooms/${code}`), (snapshot) => {
//       const data = snapshot.val();
//       if (!data) return; 
//       setLivePlayers(data.players || {});
//       setGameState((prev) => {
//         if (data.status === 'playing' && prev === 'lobby') {
//           const roomLeagueData = LEAGUES_DATA[data.league || 'all'];
//           const dests = data.locations.map(idx => roomLeagueData[idx]);
          
//           setSelectedLeague(data.league || 'all');
//           const roomModes = getGameModes(data.league || 'all');

//           setSessionData(dests); 
//           setBudget(roomModes.short.budget); 
//           setGameMode(roomModes.short);
//           setCurrentIndex(0); setMatchHistory([]); setTotalBonuses(0); setTotalExpenses(0);
//           setGuessCoords(null); setDistanceError(null); setMoneyCost(null);
//           setSkipsRemaining(3); setTotalSkipCost(0);
//           return 'playing';
//         }
//         return prev;
//       });
//     });
//   };

//   const startLiveMatch = async () => {
//     if (Object.keys(livePlayers).length < 2) return alert(lang === 'en' ? "Waiting for friends..." : "في انتظار الأصدقاء...");
//     await update(ref(db, `rooms/${roomCode}`), { status: 'playing' });
//   };

//   useEffect(() => {
//     let interval;
//     if (gameState === 'lobby' && expiresAt) {
//       interval = setInterval(() => {
//         const remaining = Math.floor((expiresAt - Date.now()) / 1000);
//         if (remaining <= 0) { setTimeLeft(0); clearInterval(interval); } 
//         else { setTimeLeft(remaining); }
//       }, 1000);
//     }
//     return () => clearInterval(interval);
//   }, [gameState, expiresAt]);

//   const startGame = (modeKey) => {
//     if (!requirePlayerName()) return;
//     setIsClueExpanded(true);
    
//     const currentModes = getGameModes(selectedLeague);
//     const selectedMode = currentModes[modeKey];
//     setGameMode(selectedMode);
    
//     const currentLeagueData = LEAGUES_DATA[selectedLeague];
//     const shuffled = [...currentLeagueData].sort(() => 0.5 - Math.random());
    
//     const matchCount = selectedMode.matches === Infinity 
//       ? shuffled.length 
//       : Math.min(selectedMode.matches, shuffled.length);
    
//     setSessionData(shuffled.slice(0, matchCount));
//     setBudget(selectedMode.budget);
//     setMatchHistory([]);
//     setTotalBonuses(0);
//     setTotalExpenses(0);
//     setCurrentIndex(0);
//     setGuessCoords(null);
//     setDistanceError(null);
//     setMoneyCost(null);
//     setSkipsRemaining(3);
//     setTotalSkipCost(0);
//     setGameState('playing');
//   };

//   const currentDestination = sessionData[currentIndex];

//   const handleMapClick = (e) => {
//     // Crucial: Only let them place pins while in the exact 'playing' state.
//     if (gameState !== 'playing') return; 
//     setGuessCoords({ lat: e.lngLat.lat, lng: e.lngLat.lng });
//   };

//   const calculateDistance = (lat1, lon1, lat2, lon2) => {
//     const R = 6371; 
//     const dLat = (lat2 - lat1) * Math.PI / 180;
//     const dLon = (lon2 - lon1) * Math.PI / 180;
//     const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon/2) * Math.sin(dLon/2);
//     return Math.round(R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))));
//   };

//   const generateFullArc = (startLng, startLat, endLng, endLat) => {
//     const totalDist = calculateDistance(startLat, startLng, endLat, endLng);
//     const maxArcHeight = Math.min(15, totalDist / 400);
//     const coords = [];
//     for (let i = 0; i <= 50; i++) {
//       const t = i / 50;
//       const arcHeight = Math.sin(t * Math.PI) * maxArcHeight;
//       coords.push([startLng + (endLng - startLng) * t, Math.max(-85, Math.min(85, startLat + (endLat - startLat) * t + arcHeight))]);
//     }
//     return coords;
//   };

//   const handleLockIn = () => {
//     if (!guessCoords) return;
//     setGameState('animating');
//     setAnimationProgress(0);
//     playFlightSound();

//     const fullArcCoords = generateFullArc(guessCoords.lng, guessCoords.lat, currentDestination.longitude, currentDestination.latitude);
//     let startTime = null;
    
//     // Decouple the timing for cinematic effect
//     const lineDuration = 1200; // Line draws lightning fast (1.2 seconds)
//     const cameraDuration = 2500; // Camera takes a smooth 2.5 seconds
//     const cameraDelay = 300; // Let the line get a 300ms head start so the user sees it leave the pin!
//     const totalAnimationTime = cameraDuration + cameraDelay;

//     // Give the line a head start, then fly the camera
//     setTimeout(() => {
//       if (mapRef.current) {
//         mapRef.current.flyTo({
//           center: [currentDestination.longitude, currentDestination.latitude],
//           zoom: 5,         
//           pitch: 45,       
//           duration: cameraDuration,  
//           essential: true
//         });
//       }
//     }, cameraDelay);

//     const stepAnimation = (timestamp) => {
//       if (!startTime) startTime = timestamp;
//       const elapsed = timestamp - startTime;

//       // Update line progress based on its own faster duration
//       const lineProgress = Math.min(elapsed / lineDuration, 1);
//       setAnimationProgress(Math.floor(lineProgress * fullArcCoords.length));

//       // Keep the loop running until the CAMERA is fully finished landing
//       if (elapsed < totalAnimationTime) {
//         requestAnimationFrame(stepAnimation);
//       } else {
//         // Everything landed! Calculate the score
//         const actualDist = calculateDistance(guessCoords.lat, guessCoords.lng, currentDestination.latitude, currentDestination.longitude);
//         setDistanceError(actualDist);
        
//         const isGlobal = selectedLeague === 'all';
//         const penaltyMultiplier = isGlobal ? 1 : 10; 
        
//         let cost = actualDist * penaltyMultiplier;
        
//         const allowedRadius = currentDestination.type === 'city' ? 80 : 7;
//         let scoreEmoji = "🟥";
        
//         if (actualDist <= allowedRadius) {
//           cost = -500; // Bonus
//           scoreEmoji = "🟩";
//           setTotalBonuses(prev => prev + 500); 
//           setTimeout(playSuccessSound, 200);
//         } else {
//           setTotalExpenses(prev => prev + cost); 
//           setTimeout(playErrorSound, 200);
//         }
        
//         setMatchHistory(prev => [...prev, scoreEmoji]);
//         setMoneyCost(cost);
        
//         setBudget(prev => {
//           const newBudget = prev - cost;
//           if (roomCode) { update(ref(db, `rooms/${roomCode}/players/${playerId}`), { score: Math.max(0, newBudget) }); }
//           return newBudget;
//         });
        
//         setGameState('locked');
//       }
//     };
    
//     requestAnimationFrame(stepAnimation);
//   };

//   const handleNextDestination = () => {
//     if (budget <= 0 || currentIndex + 1 >= sessionData.length) {
//       if (roomCode) { update(ref(db, `rooms/${roomCode}/players/${playerId}`), { finished: true }); }
//       setGameState('gameover');
//     } else {
//       setCurrentIndex(curr => curr + 1);
//       setGuessCoords(null);
//       setDistanceError(null);
//       setMoneyCost(null);
//       setIsClueExpanded(true); 
//       setGameState('playing');

//       if (mapRef.current) {
//         const viewport = LEAGUE_VIEWPORTS[selectedLeague] || LEAGUE_VIEWPORTS['all'];
//         mapRef.current.flyTo({ center: viewport.center, zoom: viewport.zoom, pitch: 0, bearing: 0, duration: 1500, essential: true });
//       }
//     }
//   };

//   const handleSkip = () => {
//     if (skipsRemaining <= 0 || budget <= dynamicSkipCost) return;

//     setSkipsRemaining(prev => prev - 1);
//     setTotalSkipCost(prev => prev + dynamicSkipCost);
//     setMatchHistory(prev => [...prev, "⏭️"]);

//     setBudget(prev => {
//       const newBudget = prev - dynamicSkipCost;
//       if (roomCode) { update(ref(db, `rooms/${roomCode}/players/${playerId}`), { score: Math.max(0, newBudget) }); }
//       return newBudget;
//     });

//     if (currentIndex + 1 >= sessionData.length) {
//       if (roomCode) { update(ref(db, `rooms/${roomCode}/players/${playerId}`), { finished: true }); }
//       setGameState('gameover');
//     } else {
//       setCurrentIndex(curr => curr + 1);
//       setGuessCoords(null);
//       setDistanceError(null);
//       setMoneyCost(null);
//       setIsClueExpanded(true); 

//       if (mapRef.current) {
//         const viewport = LEAGUE_VIEWPORTS[selectedLeague] || LEAGUE_VIEWPORTS['all'];
//         mapRef.current.flyTo({ center: viewport.center, zoom: viewport.zoom, pitch: 0, bearing: 0, duration: 1500, essential: true });
//       }
//     }
//   };

//   const getFormattedDate = () => {
//     const date = new Date();
//     const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
//     const month = months[date.getMonth()];
//     const day = date.getDate();
//     const year = date.getFullYear();
//     let suffix = "TH";
//     if (day % 10 === 1 && day !== 11) suffix = "ST";
//     else if (day % 10 === 2 && day !== 12) suffix = "ND";
//     else if (day % 10 === 3 && day !== 13) suffix = "RD";
//     return `${month} ${day}${suffix}, ${year}`;
//   };

//   const shareAsImage = async () => {
//     if (!shareCardRef.current) return;
//     setIsSharing(true);
//     try {
//       const canvas = await html2canvas(shareCardRef.current, { backgroundColor: '#03050c', scale: window.devicePixelRatio || 2, useCORS: true });
//       canvas.toBlob(async (blob) => {
//         if (!blob) return setIsSharing(false);
//         const file = new File([blob], `GeoPitch-Score.png`, { type: 'image/png' });

//         if (navigator.share) {
//           try { await navigator.share({ files: [file] }); setIsSharing(false); return; } 
//           catch (err) { if (err.name === 'AbortError') return setIsSharing(false); }
//         }

//         const link = document.createElement('a');
//         link.download = `GeoPitch-Score-${playerName}.png`;
//         link.href = URL.createObjectURL(blob);
//         document.body.appendChild(link); link.click(); document.body.removeChild(link);
//         setTimeout(() => URL.revokeObjectURL(link.href), 100);
        
//         alert(lang === 'en' ? "Image saved to your device! Share it with your friends." : "تم حفظ الصورة في جهازك! شاركها مع أصدقائك.");
//         setIsSharing(false);
//       }, 'image/png');
//     } catch (error) { setIsSharing(false); }
//   };

//   const resetToHome = () => { setGameState('start'); setStartMenu('main'); setRoomCode(''); };

//   const confirmQuit = () => {
//     if (roomCode) {
//       update(ref(db, `rooms/${roomCode}/players/${playerId}`), { finished: true });
//       setRoomCode(''); setGameState('start'); setStartMenu('main'); 
//     } else {
//       setGameState('start'); setStartMenu('solo'); 
//     }
//     setShowQuitModal(false);
//   };

//   const handleCashOut = () => { setGameState('gameover'); };

//   const paddedHistory = [...matchHistory];
//   if (gameMode && gameMode.matches !== Infinity) {
//     while (paddedHistory.length < gameMode.matches) { paddedHistory.push("🟥"); }
//   }

//   const flightPathData = guessCoords ? { type: 'Feature', geometry: { type: 'LineString', coordinates: generateFullArc(guessCoords.lng, guessCoords.lat, currentDestination?.longitude || 0, currentDestination?.latitude || 0).slice(0, Math.max(2, animationProgress)) } } : null;

//   return (
//     <div className={`game-container shiny-globe-wrapper ${lang === 'ar' ? 'lang-ar' : ''}`}>

//       {showQuitModal && <QuitConfirmModal lang={lang} onConfirm={confirmQuit} onCancel={() => setShowQuitModal(false)} />}

//       <div 
//         style={{
//           position: 'absolute', inset: 0, zIndex: 1,
//           opacity: isMapVisible ? 1 : 0, 
//           // Allows interactions (scrolling, zooming, panning) when the map is visible
//           pointerEvents: isMapVisible ? 'auto' : 'none',
//           transition: 'opacity 0.6s ease-in-out'
//         }}
//       >
//         <Map 
//           ref={mapRef} 
//           mapLib={maplibregl}
//           initialViewState={{ longitude: 0, latitude: 20, zoom: 1.5 }} 
//           style={{ width: '100%', height: '100%' }} 
//           mapStyle={mapStyle} 
//           onClick={handleMapClick} 
//           // Increased from 16 to 19 so players can zoom all the way down to the streets!
//           maxZoom={19} 
//           attributionControl={false}
//           reuseMaps={true} 
//         >
//           {guessCoords && <Marker longitude={guessCoords.lng} latitude={guessCoords.lat} anchor="bottom"><div style={{ fontSize: '30px', opacity: gameState === 'locked' ? 0.5 : 1, filter: 'drop-shadow(0 0 10px #00ffcc)' }}>🔵</div></Marker>}
//           {gameState === 'locked' && currentDestination && <Marker longitude={currentDestination.longitude} latitude={currentDestination.latitude} anchor="bottom"><div style={{ fontSize: '35px', filter: 'drop-shadow(0 0 15px #ef4444)' }}>🔴</div></Marker>}
//           {(gameState === 'animating' || gameState === 'locked') && flightPathData && <Source id="flight-path-source" type="geojson" data={flightPathData}><Layer {...flightPathStyle} /></Source>}
//         </Map>
//       </div>

//       <div style={{ position: 'absolute', inset: 0, zIndex: 10, pointerEvents: 'none', display: 'flex', flexDirection: 'column' }}>

//         {gameState === 'start' && (
//           <div className="start-screen" style={{ overflowY: 'auto', pointerEvents: 'auto', position: 'relative', width: '100%', height: '100%' }}>
//             <div style={{ position: 'absolute', top: 20, right: 20, display: 'flex', gap: '10px', zIndex: 20 }}>
//               <button className="lang-toggle-btn" style={{ background: lang === 'en' ? '#00ffcc' : 'rgba(255,255,255,0.1)', color: lang === 'en' ? 'black' : 'white' }} onClick={() => setLang('en')}>EN</button>
//               <button className="lang-toggle-btn" style={{ background: lang === 'ar' ? '#00ffcc' : 'rgba(255,255,255,0.1)', color: lang === 'ar' ? 'black' : 'white' }} onClick={() => setLang('ar')}>عربي</button>
//             </div>
            
//             <div className="glass-panel start-modal" style={{ margin: 'auto', marginTop: '10vh', direction: lang === 'ar' ? 'rtl' : 'ltr' }}>
//               <h1 className="neon-text" style={{ fontSize: '46px', letterSpacing: '-1px', marginBottom: '5px', textAlign: 'center' }}>GeoPitch</h1>
//               <p style={{ color: '#94a3b8', marginBottom: '15px', fontSize: '15px', textAlign: 'center' }}>{lang === 'en' ? 'The Ultimate Football Geography Challenge.' : 'التحدي الجغرافي الأكبر لكرة القدم.'}</p>
              
//               <div className="fun-disclaimer">{lang === 'en' ? '💸 Virtual budget, 100% real fun!' : '💸 ميزانية افتراضية، متعة حقيقية 100%!'}</div>
              
//               <input 
//                 type="text" className="start-input" 
//                 placeholder={lang === 'en' ? "Your Username" : "اسم المستخدم"} 
//                 value={playerName} onChange={handleNameChange}
//                 style={{ borderColor: isNameInvalid ? '#ef4444' : '', transition: 'border-color 0.2s ease-in-out', marginBottom: '15px' }}
//               />

//               {startMenu === 'main' && (
//                 <>
//                   <div className="league-slider-wrapper">
                    
//                     <button className="scroll-arrow left hide-on-mobile" onClick={() => scrollLeagues('left')}>
//                       <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
//                         <polyline points="15 18 9 12 15 6"></polyline>
//                       </svg>
//                     </button>

//                     <div className="league-selector-container" ref={leagueSliderRef} style={{ padding: '15px 35px', gap: '15px' }}>
//                       {LEAGUE_OPTIONS.map(league => (
//                         <div 
//                           key={league.id}
//                           className={`league-card ${selectedLeague === league.id ? 'selected' : ''}`}
//                           onClick={() => setSelectedLeague(league.id)}
//                           style={{ height: '100px', padding: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
//                         >
//                           {league.isEmoji ? (
//                             <div style={{ fontSize: '50px', lineHeight: 1, opacity: selectedLeague === league.id ? 1 : 0.4, transform: selectedLeague === league.id ? 'scale(1.15)' : 'scale(1)', transition: 'all 0.3s ease' }}>
//                               {league.logoUrl}
//                             </div>
//                           ) : (
//                             <img 
//                               src={league.logoUrl} 
//                               alt={league.titleEn} 
//                               style={{ width: '100%', height: '100%', objectFit: 'contain', margin: 0, backgroundColor: '#f8fafc', padding: '8px', borderRadius: '10px', opacity: selectedLeague === league.id ? 1 : 0.4, transform: selectedLeague === league.id ? 'scale(1.15)' : 'scale(1)', transition: 'all 0.3s ease' }} 
//                             />
//                           )}
//                         </div>
//                       ))}
//                     </div>

//                     <button className="scroll-arrow right hide-on-mobile" onClick={() => scrollLeagues('right')}>
//                       <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
//                         <polyline points="9 18 15 12 9 6"></polyline>
//                       </svg>
//                     </button>
//                   </div>

//                   <div className="glass-divider"></div>

//                   <div className="mode-toggle-wrapper">
//                     <button className="btn-toggle solo" onClick={() => handleMenuClick('solo')}>
//                       <span className="emoji">👤</span> 
//                       {lang === 'en' ? 'Solo' : 'فردي'}
//                     </button>
                    
//                     <button className="btn-toggle multi" onClick={() => handleMenuClick('multi')}>
//                       <span className="emoji">👥</span> 
//                       {lang === 'en' ? 'Friends' : 'أصدقاء'}
//                     </button>
//                   </div>
//                 </>
//               )}

//               {startMenu === 'solo' && (
//                 <div className="modes-container">
//                   <div style={{ textAlign: 'center', marginBottom: '10px' }}><h3 style={{ color: '#cbd5e1', fontSize: '12px', textTransform: 'uppercase', margin: '0' }}>{lang === 'en' ? 'Solo Career' : 'مسيرة فردية'}</h3></div>
//                   <button className="mode-card" onClick={() => startGame('short')}><span className="mode-icon">⚡</span><div className="mode-text"><h4>{lang === 'en' ? `5 Matches • $${formatB(activeModes.short.budget)}` : <><bdi>5</bdi> مباريات • <bdi>${formatB(activeModes.short.budget)}</bdi></>}</h4><p>{lang === 'en' ? 'A quick, high-stakes session. One bad guess could end it all.' : 'تحدي سريع ومثير. خطأ واحد قد ينهي كل شيء.'}</p></div></button>
//                   <button className="mode-card" onClick={() => startGame('standard')}><span className="mode-icon">🌍</span><div className="mode-text"><h4>{lang === 'en' ? `7 Matches • $${formatB(activeModes.standard.budget)}` : <><bdi>7</bdi> مباريات • <bdi>${formatB(activeModes.standard.budget)}</bdi></>}</h4><p>{lang === 'en' ? 'The standard tour. Balance your budget and scout carefully.' : 'الجولة القياسية. وازن ميزانيتك وابحث بحذر.'}</p></div></button>
//                   <button className="mode-card" onClick={() => startGame('endless')}><span className="mode-icon">♾️</span><div className="mode-text"><h4>{lang === 'en' ? `Endless Survival • $${formatB(activeModes.endless.budget)}` : <>بقاء لا نهائي • <bdi>${formatB(activeModes.endless.budget)}</bdi></>}</h4><p>{lang === 'en' ? 'No safety net. Play until you go bankrupt. Build your legacy.' : 'لا توجد شبكة أمان. العب حتى تفلس. اصنع أسطورتك.'}</p></div></button>
                  
//                   <button className="btn-secondary" onClick={() => setStartMenu('main')} style={{ marginTop: '10px' }}>{lang === 'en' ? 'Back' : 'رجوع'}</button>
//                 </div>
//               )}

//               {startMenu === 'multi' && (
//                 <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '15px' }}>
//                   <div style={{ textAlign: 'center', marginBottom: '5px' }}><h3 style={{ color: '#00ffcc', fontSize: '12px', textTransform: 'uppercase', margin: '0' }}>{lang === 'en' ? 'Live Multiplayer (Max 4)' : 'لعب جماعي مباشر'}</h3></div>
//                   <button className="mode-card" onClick={createLiveRoom} style={{ background: 'rgba(0, 255, 204, 0.05)', borderColor: 'rgba(0, 255, 204, 0.2)' }}><span className="mode-icon">🏟️</span><div className="mode-text"><h4 style={{ color: '#00ffcc' }}>{lang === 'en' ? 'Create Live Room' : 'إنشاء غرفة مباشرة'}</h4><p>{lang === 'en' ? '2-min countdown. Invite up to 3 friends.' : 'عد تنازلي دقيقتين. ادع حتى 3 أصدقاء.'}</p></div></button>
//                   <div style={{ display: 'flex', gap: '10px', marginTop: '5px', direction: lang === 'ar' ? 'rtl' : 'ltr' }}>
//                     <input type="text" placeholder={lang === 'en' ? "ENTER CODE" : "أدخل الرمز"} value={joinCodeInput} onChange={(e) => setJoinCodeInput(e.target.value)} style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.2)', background: 'rgba(0,0,0,0.5)', color: 'white', textAlign: 'center', fontWeight: 'bold', textTransform: 'uppercase', outline: 'none' }}/>
//                     <button className="btn-primary" style={{ padding: '10px 20px', borderRadius: '8px' }} onClick={joinLiveRoom}>{lang === 'en' ? 'JOIN' : 'انضمام'}</button>
//                   </div>
                  
//                   <button className="btn-secondary" onClick={() => setStartMenu('main')} style={{ marginTop: '10px' }}>{lang === 'en' ? 'Back' : 'رجوع'}</button>
//                 </div>
//               )}
//             </div>
//           </div>
//         )}

//         {gameState === 'lobby' && (
//           <div className="lobby-screen" style={{ pointerEvents: 'auto', direction: lang === 'ar' ? 'rtl' : 'ltr', width: '100%', height: '100%' }}>
//             <h2 style={{ margin: 0, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '2px' }}>{lang === 'en' ? 'Live Match Lobby' : 'غرفة المباراة المباشرة'}</h2>
//             <div className="room-code-box">{roomCode}</div>
//             <div className="timer-text" style={{ color: timeLeft <= 10 ? '#ef4444' : '#00ffcc' }}>⏳ {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</div>
//             <div className="player-list">
//               {Object.values(livePlayers).map((p, i) => (<div className="player-row" key={i}><span style={{ fontWeight: 'bold' }}>{p.name}</span><span>✅ {lang === 'en' ? 'Ready' : 'جاهز'}</span></div>))}
//             </div>
//             <div style={{ marginTop: '20px', textAlign: 'center' }}>
//               {isHost ? (<button className="btn-primary" onClick={startLiveMatch} style={{ width: '300px' }}>{lang === 'en' ? 'START MATCH NOW' : 'ابدأ المباراة الآن'}</button>) : (<p style={{ color: '#cbd5e1', fontStyle: 'italic' }}>{lang === 'en' ? 'Waiting for host to start...' : 'في انتظار المضيف لبدء المباراة...'}</p>)}
//               <br /><button className="btn-secondary" style={{ marginTop: '15px', width: '300px' }} onClick={resetToHome}>{lang === 'en' ? 'LEAVE ROOM' : 'مغادرة الغرفة'}</button>
//             </div>
//           </div>
//         )}

//         {isMapVisible && (
//           <div style={{ pointerEvents: 'none', position: 'absolute', inset: 0 }}>
//             <div className="geosports-dashboard" style={{ pointerEvents: 'auto', direction: lang === 'ar' ? 'rtl' : 'ltr' }}>
//               <div className="dash-top-bar">
//                 <span className="dash-brand">GeoPitch</span>
//                 <div className="dash-budget-inline">
//                   <span className="dash-label-inline">{lang === 'en' ? 'BUDGET:' : 'الميزانية:'}</span>
//                   <span className="dash-value-inline" style={{ color: budget > 0 ? '#00ffcc' : '#ef4444' }}>${budget.toLocaleString()}</span>
//                 </div>
//                 {gameMode.id === 'endless' && matchHistory.length > 0 ? (
//                   <button className="dash-cashout" onClick={handleCashOut}>{lang === 'en' ? '💰 CASH OUT' : '💰 إنهاء'}</button>
//                 ) : (
//                   <button className="dash-quit" onClick={() => setShowQuitModal(true)}>{lang === 'en' ? 'QUIT' : 'خروج'}</button>
//                 )}
//               </div>
              
//               {currentDestination && (
//                 <div className="dash-clue-wrapper">
//                   <div className="dash-clue-header" onClick={() => setIsClueExpanded(!isClueExpanded)}>
//                     <span>{lang === 'en' ? 'Clue' : 'دليل'} {currentIndex + 1}{gameMode.matches !== Infinity ? ` / ${gameMode.matches}` : ''}</span>
//                     <span className={`dropdown-icon ${isClueExpanded ? 'open' : ''}`}>▼</span>
//                   </div>
//                   {isClueExpanded && (<div className="dash-clue-content fade-in"><p className="dash-clue-text">"{currentDestination.clue[lang]}"</p></div>)}
//                 </div>
//               )}
//             </div>
            
//             {/* The bottom container itself doesn't catch mouse events anymore, only its children do */}
//             <div className="bottom-container" style={{ pointerEvents: 'none' }}>
              
//               {gameState === 'playing' && (
//                 <div style={{ display: 'flex', gap: '15px', width: '100%', justifyContent: 'center', pointerEvents: 'auto' }}>
//                   <button 
//                     className="btn-skip" 
//                     onClick={handleSkip}
//                     disabled={skipsRemaining <= 0 || budget <= dynamicSkipCost}
//                     style={{ 
//                       flex: guessCoords ? 1 : '0 1 100%', 
//                       width: guessCoords ? 'auto' : '100%',
//                       display: 'flex',
//                       alignItems: 'center',
//                       justifyContent: 'center',
//                       gap: '8px'
//                     }}
//                   >
//                     <span style={{ fontWeight: 'bold' }}>
//                       {lang === 'en' ? 'SKIP' : 'تخطي'}
//                     </span>
//                     <span style={{ fontSize: '13px', background: 'rgba(255,255,255,0.1)', padding: '2px 8px', borderRadius: '12px', opacity: 0.9 }}>
//                       {skipsRemaining}/3
//                     </span>
//                     <span style={{ fontSize: '12px', opacity: 0.6 }}>
//                       (-${dynamicSkipCost >= 1000 ? dynamicSkipCost/1000 + 'k' : dynamicSkipCost})
//                     </span>
//                   </button>
                  
//                   {guessCoords && (
//                     <button className="btn-primary" style={{ flex: 2 }} onClick={handleLockIn}>
//                       {lang === 'en' ? 'CONFIRM' : 'تأكيد'}
//                     </button>
//                   )}
//                 </div>
//               )}

//               {gameState === 'locked' && distanceError !== null && (
//                 <div className="glass-panel results-modal" style={{ direction: lang === 'ar' ? 'rtl' : 'ltr', pointerEvents: 'auto' }}>
                  
//                   <div className="results-header" style={{ flexDirection: 'column', gap: '8px' }}>
//                     <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
//                       <span style={{ fontSize: '18px', color: 'white' }}>
//                         📏 <b>{distanceError.toLocaleString()} {lang === 'en' ? 'km away' : 'كم بعيد'}</b>
//                       </span>
//                       <span style={{ fontSize: '18px', color: moneyCost < 0 ? '#00ffcc' : '#ef4444', fontWeight: 'bold' }}>
//                         {moneyCost < 0 
//                           ? (lang === 'en' ? '🎯 + $500 BULLSEYE!' : '🎯 + $500 هدف دقيق!') 
//                           : (lang === 'en' ? `- $${moneyCost.toLocaleString()} Flight` : `- $${moneyCost.toLocaleString()} رحلة`)}
//                       </span>
//                     </div>
//                   </div>

//                   <h3 className="neon-text" style={{ fontSize: '22px', marginBottom: '20px' }}>{currentDestination.answer[lang]}</h3>
                  
//                   <button className="btn-secondary" onClick={handleNextDestination}>
//                     {currentIndex + 1 >= gameMode.matches || budget <= 0 || currentIndex + 1 >= sessionData.length 
//                       ? (lang === 'en' ? 'VIEW MATCH RESULTS' : 'عرض نتائج المباراة') 
//                       : (lang === 'en' ? 'NEXT FIXTURE ➔' : '➔ المباراة القادمة')}
//                   </button>
//                 </div>
//               )}
//             </div>
//           </div>
//         )}

//         {gameState === 'gameover' && (
//           <div className="game-over-screen" style={{ pointerEvents: 'auto', direction: lang === 'ar' ? 'rtl' : 'ltr', width: '100%', height: '100%' }}>
//             {roomCode ? (
//               <div className="glass-panel podium-container">
//                 <h2 style={{ color: 'white', marginBottom: '25px', fontSize: '28px' }}>🏆 {lang === 'en' ? 'Final Standings' : 'الترتيب النهائي'}</h2>
//                 <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '30px' }}>
//                   {Object.entries(livePlayers).sort((a, b) => b[1].score - a[1].score).map(([id, player], index) => (
//                       <div key={id} className={`podium-row place-${index + 1}`}>
//                         <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}><span className="rank">#{index + 1}</span><span className="name">{player.name} {id === playerId ? (lang === 'en' ? '(You)' : '(أنت)') : ''}</span></div>
//                         <div className="score" style={{ color: player.score <= 0 ? '#ef4444' : 'inherit' }}>${Math.max(0, player.score).toLocaleString()} {player.finished ? '' : '⏳'}</div>
//                       </div>
//                   ))}
//                 </div>
//                 <button className="btn-secondary" onClick={resetToHome}>{lang === 'en' ? 'RETURN TO MAIN MENU' : 'العودة للقائمة الرئيسية'}</button>
//               </div>
//             ) : (
//               <>
//                 <div ref={shareCardRef} className="share-card-container">
//                   <div className="share-card-left">
//                     <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginBottom: '15px', alignItems: 'center' }}>
//                       <span className="badge-glass">🗓️ <bdi>{getFormattedDate()}</bdi></span>
//                       <span className="streak-text-only hide-on-mobile">🔥 {lang === 'en' ? '1 Day Streak' : 'يوم واحد'}</span>
//                       <span className="hide-on-desktop" style={{ color: budget > 0 ? '#00ffcc' : '#ef4444', fontWeight: 'bold', fontSize: '15px', letterSpacing: '1px' }}>💰 <bdi>${Math.max(0, budget).toLocaleString()}</bdi></span>
//                     </div>
//                     <h3 className="hide-on-mobile" style={{ margin: '0 0 10px 0', fontWeight: 400, color: '#e2e8f0', fontSize: '15px' }}>{lang === 'en' ? 'Final Balance' : 'الرصيد النهائي'}</h3>
//                     <div className="hero-circle hide-on-mobile"><h2 style={{ fontSize: '38px', margin: 0, color: '#00ffcc', textShadow: '0 0 15px rgba(0,255,204,0.4)' }}><bdi>${Math.max(0, budget).toLocaleString()}</bdi></h2></div>
//                     <h2 style={{ margin: '10px 0 5px 0', fontSize: '22px', color: budget > 0 ? '#00ffcc' : '#ef4444' }}>{budget > 0 ? (lang === 'en' ? 'Season Survived!' : 'موسم ناجح!') : (lang === 'en' ? 'Bankrupt!' : 'إفلاس!')}</h2>
//                     <p style={{ margin: 0, fontSize: '13px', color: '#cbd5e1', lineHeight: '1.5' }}>{lang === 'en' ? <><bdi>{playerName}</bdi>, what a journey across the globe.</> : <><bdi>{playerName}</bdi>، يا لها من رحلة عبر العالم.</>}</p>
//                   </div>

//                   <div className="share-card-right">
//                     <h3 style={{ margin: '0 0 15px 0', color: 'white', fontSize: '16px', textAlign: 'center' }}>{lang === 'en' ? 'Season Summary' : 'ملخص الموسم'}</h3>
//                     <div className="ledger-item starting-budget"><span>🏦 {lang === 'en' ? 'Starting Budget' : 'الميزانية الأولية'}</span><strong><bdi>${gameMode.budget.toLocaleString()}</bdi></strong></div>
//                     <div className="ledger-item bonuses"><span>🎯 {lang === 'en' ? 'Bullseye Bonuses' : 'مكافآت الهدف الدقيق'}</span><strong><bdi>+ ${totalBonuses.toLocaleString()}</bdi></strong></div>
//                     <div className="ledger-item expenses"><span>✈️ {lang === 'en' ? 'Travel Expenses' : 'مصاريف السفر'}</span><strong><bdi>- ${totalExpenses.toLocaleString()}</bdi></strong></div>

//                     {totalSkipCost > 0 && (
//                       <div className="ledger-item expenses" style={{ background: 'rgba(245, 158, 11, 0.08)', borderLeft: '3px solid #f59e0b', color: '#fcd34d' }}>
//                         <span>⏭️ {lang === 'en' ? 'Skips Cost' : 'تكلفة التخطي'}</span>
//                         <strong><bdi>- ${totalSkipCost.toLocaleString()}</bdi></strong>
//                       </div>
//                     )}

//                     <div className="emoji-display-box" style={{ flexWrap: 'wrap', display: 'flex', justifyContent: 'center', gap: '4px' }}>{paddedHistory.map((emoji, i) => <span key={i}>{emoji}</span>)}</div>
//                     <div className="watermark">🌍 Play at <strong>geopitch.gg</strong></div>
//                   </div>
//                 </div>

//                 <div className="action-buttons-wrapper">
//                   <button className="btn-secondary" style={{ flex: 1 }} onClick={resetToHome}>{lang === 'en' ? 'MAIN MENU' : 'القائمة الرئيسية'}</button>
//                   <button className="btn-primary" style={{ flex: 2, display: 'flex', gap: '8px', justifyContent: 'center' }} onClick={shareAsImage} disabled={isSharing}>{isSharing ? '...' : (lang === 'en' ? 'SHARE YOUR SCORE' : 'شارك نتيجتك')}</button>
//                 </div>
//               </>
//             )}
//           </div>
//         )}

//       </div>
//     </div>
//   );
// }


import React, { useState, useRef, useEffect } from 'react';
import Map, { Marker, Source, Layer } from 'react-map-gl/maplibre';
import * as maplibregl from 'maplibre-gl';
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';
import html2canvas from 'html2canvas'; 
import 'maplibre-gl/dist/maplibre-gl.css';
import './App.css'; 

import premierLogo from './assets/premier-league-logo.png';
import laligaLogo from './assets/LaLiga-Logo.png';
import serieaLogo from './assets/Italian-Serie-A-Logo.png';
import franceLogo from './assets/Ligue-1-Logo.png';
import germanLogo from './assets/Bundesliga-Logo.png';

// LEAGUE DATA IMPORTS
import { DESTINATIONS as ALL_DESTS } from './data/destinations';
import { DESTINATIONS as PL_DESTS } from './data/Prmier_League';
import { DESTINATIONS as LALIGA_DESTS } from './data/La_Liga';
import { DESTINATIONS as FR_DESTS } from './data/FR_League';
import { DESTINATIONS as DU_DESTS } from './data/Du_League';
import { DESTINATIONS as SA_DESTS } from './data/Serie_A'; 

// MULTIPLAYER IMPORTS
import { ref, set, get, onValue, update, query, orderByChild, endAt } from "firebase/database";
import { db } from './firebase'; 

if (maplibregl.setWorkerUrl) {
  maplibregl.setWorkerUrl(workerUrl);
}

// Dynamic Game Modes based on League (Global vs Regional)
const getGameModes = (league) => {
  const isGlobal = league === 'all';
  return {
    short: { id: 'short', matches: 5, budget: isGlobal ? 10000 : 3000 },
    standard: { id: 'standard', matches: 7, budget: isGlobal ? 15000 : 5000 },
    endless: { id: 'endless', matches: Infinity, budget: isGlobal ? 25000 : 8000 }
  };
};

const LEAGUES_DATA = {
  all: ALL_DESTS,
  premier: PL_DESTS,
  laliga: LALIGA_DESTS,
  seriea: SA_DESTS,
  france: FR_DESTS,
  german: DU_DESTS
};

// Specific Camera Viewports for each map
const LEAGUE_VIEWPORTS = {
  all: { center: [0, 20], zoom: 1.5 },
  premier: { center: [-2.5, 53.0], zoom: 5.5 },  // Centered on UK
  laliga: { center: [-4.0, 40.0], zoom: 5.2 },   // Centered on Spain
  seriea: { center: [12.5, 41.9], zoom: 5.2 },   // Centered on Italy
  france: { center: [2.2, 46.2], zoom: 5.2 },    // Centered on France
  german: { center: [10.4, 51.1], zoom: 5.3 }    // Centered on Germany
};

const LEAGUE_OPTIONS = [
  { id: 'all', titleEn: 'Global', titleAr: 'عالمي', logoUrl: '🌍', isEmoji: true },
  { id: 'premier', titleEn: 'Premier League', titleAr: 'الدوري الإنجليزي', logoUrl: premierLogo },
  { id: 'laliga', titleEn: 'La Liga', titleAr: 'الدوري الإسباني', logoUrl: laligaLogo },
  { id: 'seriea', titleEn: 'Serie A', titleAr: 'الدوري الإيطالي', logoUrl: serieaLogo },
  { id: 'france', titleEn: 'Ligue 1', titleAr: 'الدوري الفرنسي', logoUrl: franceLogo },
  { id: 'german', titleEn: 'Bundesliga', titleAr: 'الدوري الألماني', logoUrl: germanLogo }
];

const mapStyle = {
  version: 8,
  projection: { type: 'globe' },
  glyphs: "https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf",
  sources: {
    'satellite-tiles': {
      type: 'raster',
      tiles: ['https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'],
      tileSize: 256,
      maxzoom: 16 
    },
    'countries-boundaries': {
      type: 'geojson',
      data: 'https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_50m_admin_0_countries.geojson',
      tolerance: 1.5 
    },
    'countries-labels': {
      type: 'geojson',
      data: 'https://raw.githubusercontent.com/gavinr/world-countries-centroids/master/dist/countries.geojson'
    },
    'major-cities': {
      type: 'geojson',
      data: 'https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_10m_populated_places_simple.geojson',
      tolerance: 2 
    }
  },
  layers: [
    { id: 'background', type: 'background', paint: { 'background-color': '#03050c' } },
    { id: 'satellite', type: 'raster', source: 'satellite-tiles', minzoom: 0, maxzoom: 22, paint: { 'raster-brightness-min': 0.15, 'raster-brightness-max': 0.95, 'raster-saturation': 0.1 } },
    { id: 'admin-boundaries', type: 'line', source: 'countries-boundaries', paint: { 'line-color': '#ffffff', 'line-width': 1.2, 'line-opacity': 0.55 } },
    {
      id: 'admin-labels',
      type: 'symbol',
      source: 'countries-labels',
      layout: {
        'text-field': ['case', ['has', 'ISO'], ['get', 'ISO'], ['upcase', ['slice', ['get', 'COUNTRY'], 0, 2]]],
        'text-font': ['Open Sans Bold'],
        'text-size': 14,
        'text-anchor': 'center'
      },
      paint: { 'text-color': '#ffffff', 'text-halo-color': 'rgba(0, 0, 0, 0.85)', 'text-halo-width': 1.5 }
    },
    {
      id: 'city-labels',
      type: 'symbol',
      source: 'major-cities',
      minzoom: 5, 
      layout: {
        'text-field': ['get', 'name'],
        'text-font': ['Open Sans Bold'],
        'text-size': [
          'interpolate', ['linear'], ['zoom'],
          5, 10,
          9, 12,
          16, 16
        ],
        'text-anchor': 'center',
        'text-padding': 1 
      },
      paint: {
        'text-color': '#cbd5e1', 
        'text-halo-color': 'rgba(0, 0, 0, 0.9)',
        'text-halo-width': 1.5
      }
    }
  ]
};

const flightPathStyle = { id: 'flight-path-layer', type: 'line', paint: { 'line-color': '#00ffcc', 'line-width': 3, 'line-dasharray': [2, 2] } };

const playFlightSound = () => { try { const ctx = new (window.AudioContext || window.webkitAudioContext)(); const now = ctx.currentTime; const osc = ctx.createOscillator(); const filter = ctx.createBiquadFilter(); const gain = ctx.createGain(); osc.type = 'sawtooth'; osc.frequency.setValueAtTime(150, now); osc.frequency.exponentialRampToValueAtTime(1200, now + 1.2); filter.type = 'lowpass'; filter.frequency.setValueAtTime(400, now); filter.frequency.exponentialRampToValueAtTime(2500, now + 1.2); gain.gain.setValueAtTime(0.05, now); gain.gain.linearRampToValueAtTime(0.1, now + 0.6); gain.gain.linearRampToValueAtTime(0.001, now + 1.2); osc.connect(filter); filter.connect(gain); gain.connect(ctx.destination); osc.start(now); osc.stop(now + 1.2); } catch(e) {} };
const playSuccessSound = () => { try { const ctx = new (window.AudioContext || window.webkitAudioContext)(); const now = ctx.currentTime; [659.25, 830.61, 987.77, 1318.51, 1661.22].forEach((freq, index) => { const osc = ctx.createOscillator(); const gain = ctx.createGain(); osc.type = 'sine'; osc.frequency.setValueAtTime(freq, now + index * 0.06); gain.gain.setValueAtTime(0.1, now + index * 0.06); gain.gain.exponentialRampToValueAtTime(0.0001, now + index * 0.06 + 0.4); osc.connect(gain); gain.connect(ctx.destination); osc.start(now + index * 0.06); osc.stop(now + index * 0.06 + 0.4); }); } catch(e) {} };
const playErrorSound = () => { try { const ctx = new (window.AudioContext || window.webkitAudioContext)(); const now = ctx.currentTime; const osc = ctx.createOscillator(); const gain = ctx.createGain(); osc.type = 'square'; osc.frequency.setValueAtTime(110, now); osc.frequency.setValueAtTime(80, now + 0.1); gain.gain.setValueAtTime(0.1, now); gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25); osc.connect(gain); gain.connect(ctx.destination); osc.start(now); osc.stop(now + 0.25); } catch(e) {} };

const QuitConfirmModal = ({ lang, onConfirm, onCancel }) => {
  return (
    <div className="ad-modal-overlay" style={{ direction: lang === 'ar' ? 'rtl' : 'ltr' }}>
      <div className="glass-panel ad-modal" style={{ padding: '30px 25px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div className="warning-icon-wrapper">
          <span style={{ fontSize: '32px', display: 'block', lineHeight: 1 }}>⚠️</span>
        </div>
        <h2 style={{ color: 'white', margin: '0 0 10px 0', fontSize: '24px' }}>
          {lang === 'en' ? 'Quit Game?' : 'الخروج من اللعبة؟'}
        </h2>
        <p style={{ color: '#cbd5e1', fontSize: '14px', margin: '0 0 25px 0', textAlign: 'center', lineHeight: '1.5' }}>
          {lang === 'en' 
            ? 'Are you sure you want to quit the current game? Your progress will be lost.' 
            : 'هل أنت متأكد أنك تريد إنهاء اللعبة الحالية؟ سيتم فقدان تقدمك.'}
        </p>
        <div style={{ display: 'flex', gap: '15px', width: '100%' }}>
          <button className="btn-secondary" style={{ flex: 1, margin: 0 }} onClick={onCancel}>
            {lang === 'en' ? 'Cancel' : 'إلغاء'}
          </button>
          <button className="btn-danger" style={{ flex: 1, margin: 0 }} onClick={onConfirm}>
            {lang === 'en' ? 'Quit' : 'خروج'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const [gameState, setGameState] = useState('start');
  const [startMenu, setStartMenu] = useState('main'); 

  const [lang, setLang] = useState('en');
  const [playerName, setPlayerName] = useState('');
  const [isNameInvalid, setIsNameInvalid] = useState(false);
  
  const requirePlayerName = () => {
    if (!playerName.trim()) {
      setIsNameInvalid(true);
      setTimeout(() => setIsNameInvalid(false), 400);
      alert(lang === 'en' ? "Please enter your name first" : "الرجاء إدخال اسمك أولاً");
      return false;
    }
    return true;
  };
  
  const [selectedLeague, setSelectedLeague] = useState('all');

  const [gameMode, setGameMode] = useState(null);
  const [sessionData, setSessionData] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [budget, setBudget] = useState(0);
  
  const [matchHistory, setMatchHistory] = useState([]); 
  const [totalBonuses, setTotalBonuses] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);
  
  const [guessCoords, setGuessCoords] = useState(null);
  const [distanceError, setDistanceError] = useState(null);
  const [moneyCost, setMoneyCost] = useState(null);

  const [skipsRemaining, setSkipsRemaining] = useState(3);
  const [totalSkipCost, setTotalSkipCost] = useState(0);

  const [animationProgress, setAnimationProgress] = useState(0);
  const [isSharing, setIsSharing] = useState(false);
  
  const shareCardRef = useRef(null);
  const mapRef = useRef(null);
  
  const leagueSliderRef = useRef(null);

  const scrollLeagues = (direction) => {
    if (leagueSliderRef.current) {
      const scrollAmount = 130; 
      const isRTL = lang === 'ar'; 
      let moveBy = direction === 'left' ? -scrollAmount : scrollAmount;
      if (isRTL) moveBy = -moveBy; 
      leagueSliderRef.current.scrollBy({ left: moveBy, behavior: 'smooth' });
    }
  };

  const [roomCode, setRoomCode] = useState('');
  const [joinCodeInput, setJoinCodeInput] = useState('');
  const [livePlayers, setLivePlayers] = useState({});
  const [playerId] = useState(`player_${Math.floor(Math.random() * 100000)}`);
  const [isHost, setIsHost] = useState(false);
  const [timeLeft, setTimeLeft] = useState(120);
  const [expiresAt, setExpiresAt] = useState(null);
  
  const [showQuitModal, setShowQuitModal] = useState(false);
  const [isClueExpanded, setIsClueExpanded] = useState(true);

  const isMapVisible = ['playing', 'animating', 'locked'].includes(gameState);

  // Dynamic variable derivations for UI rendering
  const activeModes = getGameModes(selectedLeague);
  const dynamicSkipCost = selectedLeague === 'all' ? 1000 : 300;
  const formatB = (val) => val >= 1000 ? `${val / 1000}k` : val;

  // Automatically centers map correctly on start
  useEffect(() => {
    if (gameState === 'playing' && currentIndex === 0 && mapRef.current) {
      const viewport = LEAGUE_VIEWPORTS[selectedLeague] || LEAGUE_VIEWPORTS['all'];
      mapRef.current.jumpTo({ center: viewport.center, zoom: viewport.zoom, pitch: 0, bearing: 0 });
    }
  }, [gameState, currentIndex, selectedLeague]);

  const handleNameChange = (e) => {
    const value = e.target.value;
    const regex = /^[a-zA-Z0-9\u0600-\u06FF\s]*$/;
    if (regex.test(value)) {
      setPlayerName(value); setIsNameInvalid(false);
    } else {
      setIsNameInvalid(true); setTimeout(() => setIsNameInvalid(false), 400);
    }
  };

  const cleanExpiredRooms = async () => {
    try {
      const now = Date.now();
      const oldRoomsQuery = query(ref(db, 'rooms'), orderByChild('expiresAt'), endAt(now));
      const snapshot = await get(oldRoomsQuery);
      if (snapshot.exists()) {
        const updates = {};
        snapshot.forEach((child) => { updates[child.key] = null; });
        await update(ref(db, 'rooms'), updates);
      }
    } catch (error) {}
  };

  const handleMenuClick = (menuTarget) => {
    if (!requirePlayerName()) return;
    if (menuTarget === 'multi') cleanExpiredRooms();
    setStartMenu(menuTarget);
  };

  const createLiveRoom = async () => {
    if (!requirePlayerName()) return; 
    
    const currentLeagueData = LEAGUES_DATA[selectedLeague];
    const shuffled = [...currentLeagueData].sort(() => 0.5 - Math.random());
    const matchIndices = shuffled.slice(0, 5).map(dest => currentLeagueData.indexOf(dest));

    const code = Math.random().toString(36).substring(2, 6).toUpperCase();
    const expiry = Date.now() + 120000;
    
    const initialBudget = getGameModes(selectedLeague).short.budget;
    
    await set(ref(db, `rooms/${code}`), {
      status: 'waiting', 
      expiresAt: expiry, 
      league: selectedLeague, 
      locations: matchIndices,
      players: { [playerId]: { name: playerName, score: initialBudget, finished: false } }
    });

    setRoomCode(code); setIsHost(true); setExpiresAt(expiry);
    setGameState('lobby'); listenToRoom(code);
  };

  const joinLiveRoom = async () => {
    if (!requirePlayerName()) return;
    if (!joinCodeInput.trim()) return;
    
    const code = joinCodeInput.toUpperCase();
    const snapshot = await get(ref(db, `rooms/${code}`));

    if (snapshot.exists()) {
      const data = snapshot.val();
      if (data.status !== 'waiting') return alert(lang === 'en' ? "Match already started!" : "المباراة بدأت بالفعل!");
      if (Object.keys(data.players || {}).length >= 4) return alert(lang === 'en' ? "Room is full! (Max 4)" : "الغرفة ممتلئة! (الحد الأقصى 4)");

      const roomModes = getGameModes(data.league || 'all');
      const initialBudget = roomModes.short.budget;

      await update(ref(db, `rooms/${code}/players`), { [playerId]: { name: playerName, score: initialBudget, finished: false } });
      setRoomCode(code); setIsHost(false); setExpiresAt(data.expiresAt);
      setGameState('lobby'); listenToRoom(code);
    } else {
      alert(lang === 'en' ? "Room not found or expired." : "الغرفة غير موجودة أو انتهت صلاحيتها.");
    }
  };

  const listenToRoom = (code) => {
    onValue(ref(db, `rooms/${code}`), (snapshot) => {
      const data = snapshot.val();
      if (!data) return; 
      setLivePlayers(data.players || {});
      setGameState((prev) => {
        if (data.status === 'playing' && prev === 'lobby') {
          const roomLeagueData = LEAGUES_DATA[data.league || 'all'];
          const dests = data.locations.map(idx => roomLeagueData[idx]);
          
          setSelectedLeague(data.league || 'all');
          const roomModes = getGameModes(data.league || 'all');

          setSessionData(dests); 
          setBudget(roomModes.short.budget); 
          setGameMode(roomModes.short);
          setCurrentIndex(0); setMatchHistory([]); setTotalBonuses(0); setTotalExpenses(0);
          setGuessCoords(null); setDistanceError(null); setMoneyCost(null);
          setSkipsRemaining(3); setTotalSkipCost(0);
          return 'playing';
        }
        return prev;
      });
    });
  };

  const startLiveMatch = async () => {
    if (Object.keys(livePlayers).length < 2) return alert(lang === 'en' ? "Waiting for friends..." : "في انتظار الأصدقاء...");
    await update(ref(db, `rooms/${roomCode}`), { status: 'playing' });
  };

  useEffect(() => {
    let interval;
    if (gameState === 'lobby' && expiresAt) {
      interval = setInterval(() => {
        const remaining = Math.floor((expiresAt - Date.now()) / 1000);
        if (remaining <= 0) { setTimeLeft(0); clearInterval(interval); } 
        else { setTimeLeft(remaining); }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [gameState, expiresAt]);

  const startGame = (modeKey) => {
    if (!requirePlayerName()) return;
    setIsClueExpanded(true);
    
    const currentModes = getGameModes(selectedLeague);
    const selectedMode = currentModes[modeKey];
    setGameMode(selectedMode);
    
    const currentLeagueData = LEAGUES_DATA[selectedLeague];
    const shuffled = [...currentLeagueData].sort(() => 0.5 - Math.random());
    
    const matchCount = selectedMode.matches === Infinity 
      ? shuffled.length 
      : Math.min(selectedMode.matches, shuffled.length);
    
    setSessionData(shuffled.slice(0, matchCount));
    setBudget(selectedMode.budget);
    setMatchHistory([]);
    setTotalBonuses(0);
    setTotalExpenses(0);
    setCurrentIndex(0);
    setGuessCoords(null);
    setDistanceError(null);
    setMoneyCost(null);
    setSkipsRemaining(3);
    setTotalSkipCost(0);
    setGameState('playing');
  };

  const currentDestination = sessionData[currentIndex];

  const handleMapClick = (e) => {
    // Crucial: Only let them place pins while in the exact 'playing' state.
    if (gameState !== 'playing') return; 
    setGuessCoords({ lat: e.lngLat.lat, lng: e.lngLat.lng });
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; 
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon/2) * Math.sin(dLon/2);
    return Math.round(R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))));
  };

  const generateFullArc = (startLng, startLat, endLng, endLat) => {
    const totalDist = calculateDistance(startLat, startLng, endLat, endLng);
    const maxArcHeight = Math.min(15, totalDist / 400);
    const coords = [];
    for (let i = 0; i <= 50; i++) {
      const t = i / 50;
      const arcHeight = Math.sin(t * Math.PI) * maxArcHeight;
      coords.push([startLng + (endLng - startLng) * t, Math.max(-85, Math.min(85, startLat + (endLat - startLat) * t + arcHeight))]);
    }
    return coords;
  };

  const handleLockIn = () => {
    if (!guessCoords) return;
    setGameState('animating');
    setAnimationProgress(0);
    playFlightSound();

    const fullArcCoords = generateFullArc(guessCoords.lng, guessCoords.lat, currentDestination.longitude, currentDestination.latitude);
    let startTime = null;
    
    // Decouple the timing for cinematic effect
    const lineDuration = 1200; // Line draws lightning fast (1.2 seconds)
    const cameraDuration = 2500; // Camera takes a smooth 2.5 seconds
    const cameraDelay = 300; // Let the line get a 300ms head start so the user sees it leave the pin!
    const totalAnimationTime = cameraDuration + cameraDelay;

    // Give the line a head start, then fly the camera
    setTimeout(() => {
      if (mapRef.current) {
        mapRef.current.flyTo({
          center: [currentDestination.longitude, currentDestination.latitude],
          zoom: 5,         
          pitch: 45,       
          duration: cameraDuration,  
          essential: true
        });
      }
    }, cameraDelay);

    const stepAnimation = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;

      // Update line progress based on its own faster duration
      const lineProgress = Math.min(elapsed / lineDuration, 1);
      setAnimationProgress(Math.floor(lineProgress * fullArcCoords.length));

      // Keep the loop running until the CAMERA is fully finished landing
      if (elapsed < totalAnimationTime) {
        requestAnimationFrame(stepAnimation);
      } else {
        // Everything landed! Calculate the score
        const actualDist = calculateDistance(guessCoords.lat, guessCoords.lng, currentDestination.latitude, currentDestination.longitude);
        setDistanceError(actualDist);
        
        const isGlobal = selectedLeague === 'all';
        const penaltyMultiplier = isGlobal ? 1 : 10; 
        
        let cost = actualDist * penaltyMultiplier;
        
        const allowedRadius = currentDestination.type === 'city' ? 80 : 7;
        let scoreEmoji = "🟥";
        
        if (actualDist <= allowedRadius) {
          cost = -500; // Bonus
          scoreEmoji = "🟩";
          setTotalBonuses(prev => prev + 500); 
          setTimeout(playSuccessSound, 200);
        } else {
          setTotalExpenses(prev => prev + cost); 
          setTimeout(playErrorSound, 200);
        }
        
        setMatchHistory(prev => [...prev, scoreEmoji]);
        setMoneyCost(cost);
        
        setBudget(prev => {
          const newBudget = prev - cost;
          if (roomCode) { update(ref(db, `rooms/${roomCode}/players/${playerId}`), { score: Math.max(0, newBudget) }); }
          return newBudget;
        });
        
        setGameState('locked');
      }
    };
    
    requestAnimationFrame(stepAnimation);
  };

  const handleNextDestination = () => {
    if (budget <= 0 || currentIndex + 1 >= sessionData.length) {
      if (roomCode) { update(ref(db, `rooms/${roomCode}/players/${playerId}`), { finished: true }); }
      setGameState('gameover');
    } else {
      setCurrentIndex(curr => curr + 1);
      setGuessCoords(null);
      setDistanceError(null);
      setMoneyCost(null);
      setIsClueExpanded(true); 
      setGameState('playing');

      if (mapRef.current) {
        const viewport = LEAGUE_VIEWPORTS[selectedLeague] || LEAGUE_VIEWPORTS['all'];
        mapRef.current.flyTo({ center: viewport.center, zoom: viewport.zoom, pitch: 0, bearing: 0, duration: 1500, essential: true });
      }
    }
  };

  const handleSkip = () => {
    if (skipsRemaining <= 0 || budget <= dynamicSkipCost) return;

    setSkipsRemaining(prev => prev - 1);
    setTotalSkipCost(prev => prev + dynamicSkipCost);
    setMatchHistory(prev => [...prev, "⏭️"]);

    setBudget(prev => {
      const newBudget = prev - dynamicSkipCost;
      if (roomCode) { update(ref(db, `rooms/${roomCode}/players/${playerId}`), { score: Math.max(0, newBudget) }); }
      return newBudget;
    });

    if (currentIndex + 1 >= sessionData.length) {
      if (roomCode) { update(ref(db, `rooms/${roomCode}/players/${playerId}`), { finished: true }); }
      setGameState('gameover');
    } else {
      setCurrentIndex(curr => curr + 1);
      setGuessCoords(null);
      setDistanceError(null);
      setMoneyCost(null);
      setIsClueExpanded(true); 

      if (mapRef.current) {
        const viewport = LEAGUE_VIEWPORTS[selectedLeague] || LEAGUE_VIEWPORTS['all'];
        mapRef.current.flyTo({ center: viewport.center, zoom: viewport.zoom, pitch: 0, bearing: 0, duration: 1500, essential: true });
      }
    }
  };

  const getFormattedDate = () => {
    const date = new Date();
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const month = months[date.getMonth()];
    const day = date.getDate();
    const year = date.getFullYear();
    let suffix = "TH";
    if (day % 10 === 1 && day !== 11) suffix = "ST";
    else if (day % 10 === 2 && day !== 12) suffix = "ND";
    else if (day % 10 === 3 && day !== 13) suffix = "RD";
    return `${month} ${day}${suffix}, ${year}`;
  };

  const shareAsImage = async () => {
    if (!shareCardRef.current) return;
    setIsSharing(true);
    try {
      const canvas = await html2canvas(shareCardRef.current, { backgroundColor: '#03050c', scale: window.devicePixelRatio || 2, useCORS: true });
      canvas.toBlob(async (blob) => {
        if (!blob) return setIsSharing(false);
        const file = new File([blob], `GeoPitch-Score.png`, { type: 'image/png' });

        if (navigator.share) {
          try { await navigator.share({ files: [file] }); setIsSharing(false); return; } 
          catch (err) { if (err.name === 'AbortError') return setIsSharing(false); }
        }

        const link = document.createElement('a');
        link.download = `GeoPitch-Score-${playerName}.png`;
        link.href = URL.createObjectURL(blob);
        document.body.appendChild(link); link.click(); document.body.removeChild(link);
        setTimeout(() => URL.revokeObjectURL(link.href), 100);
        
        alert(lang === 'en' ? "Image saved to your device! Share it with your friends." : "تم حفظ الصورة في جهازك! شاركها مع أصدقائك.");
        setIsSharing(false);
      }, 'image/png');
    } catch (error) { setIsSharing(false); }
  };

  const resetToHome = () => { setGameState('start'); setStartMenu('main'); setRoomCode(''); };

  const confirmQuit = () => {
    if (roomCode) {
      update(ref(db, `rooms/${roomCode}/players/${playerId}`), { finished: true });
      setRoomCode(''); setGameState('start'); setStartMenu('main'); 
    } else {
      setGameState('start'); setStartMenu('solo'); 
    }
    setShowQuitModal(false);
  };

  const handleCashOut = () => { setGameState('gameover'); };

  const paddedHistory = [...matchHistory];
  if (gameMode && gameMode.matches !== Infinity) {
    while (paddedHistory.length < gameMode.matches) { paddedHistory.push("🟥"); }
  }

  const flightPathData = guessCoords ? { type: 'Feature', geometry: { type: 'LineString', coordinates: generateFullArc(guessCoords.lng, guessCoords.lat, currentDestination?.longitude || 0, currentDestination?.latitude || 0).slice(0, Math.max(2, animationProgress)) } } : null;

  return (
    <div className={`game-container shiny-globe-wrapper ${lang === 'ar' ? 'lang-ar' : ''}`}>

      {showQuitModal && <QuitConfirmModal lang={lang} onConfirm={confirmQuit} onCancel={() => setShowQuitModal(false)} />}

      <div 
        style={{
          position: 'absolute', inset: 0, zIndex: 1,
          opacity: isMapVisible ? 1 : 0, 
          pointerEvents: isMapVisible ? 'auto' : 'none',
          transition: 'opacity 0.6s ease-in-out'
        }}
      >
        <Map 
          ref={mapRef} 
          mapLib={maplibregl}
          initialViewState={{ longitude: 0, latitude: 20, zoom: 1.5 }} 
          style={{ width: '100%', height: '100%' }} 
          mapStyle={mapStyle} 
          onClick={handleMapClick} 
          // 👇 THE FIX: Dynamic Max Zoom. 
          // If the answer is revealed (locked), they can only zoom to 13.5 (city level).
          // Otherwise, during normal play, they can zoom to 16.
          maxZoom={gameState === 'locked' ? 13.5 : 16} 
          attributionControl={false}
          reuseMaps={true} 
        >
          {guessCoords && <Marker longitude={guessCoords.lng} latitude={guessCoords.lat} anchor="bottom"><div style={{ fontSize: '30px', opacity: gameState === 'locked' ? 0.5 : 1, filter: 'drop-shadow(0 0 10px #00ffcc)' }}>🔵</div></Marker>}
          {gameState === 'locked' && currentDestination && <Marker longitude={currentDestination.longitude} latitude={currentDestination.latitude} anchor="bottom"><div style={{ fontSize: '35px', filter: 'drop-shadow(0 0 15px #ef4444)' }}>🔴</div></Marker>}
          {(gameState === 'animating' || gameState === 'locked') && flightPathData && <Source id="flight-path-source" type="geojson" data={flightPathData}><Layer {...flightPathStyle} /></Source>}
        </Map>
      </div>

      <div style={{ position: 'absolute', inset: 0, zIndex: 10, pointerEvents: 'none', display: 'flex', flexDirection: 'column' }}>

        {gameState === 'start' && (
          <div className="start-screen" style={{ overflowY: 'auto', pointerEvents: 'auto', position: 'relative', width: '100%', height: '100%' }}>
            <div style={{ position: 'absolute', top: 20, right: 20, display: 'flex', gap: '10px', zIndex: 20 }}>
              <button className="lang-toggle-btn" style={{ background: lang === 'en' ? '#00ffcc' : 'rgba(255,255,255,0.1)', color: lang === 'en' ? 'black' : 'white' }} onClick={() => setLang('en')}>EN</button>
              <button className="lang-toggle-btn" style={{ background: lang === 'ar' ? '#00ffcc' : 'rgba(255,255,255,0.1)', color: lang === 'ar' ? 'black' : 'white' }} onClick={() => setLang('ar')}>عربي</button>
            </div>
            
            <div className="glass-panel start-modal" style={{ margin: 'auto', marginTop: '10vh', direction: lang === 'ar' ? 'rtl' : 'ltr' }}>
              <h1 className="neon-text" style={{ fontSize: '46px', letterSpacing: '-1px', marginBottom: '5px', textAlign: 'center' }}>GeoPitch</h1>
              <p style={{ color: '#94a3b8', marginBottom: '15px', fontSize: '15px', textAlign: 'center' }}>{lang === 'en' ? 'The Ultimate Football Geography Challenge.' : 'التحدي الجغرافي الأكبر لكرة القدم.'}</p>
              
              <div className="fun-disclaimer">{lang === 'en' ? '💸 Virtual budget, 100% real fun!' : '💸 ميزانية افتراضية، متعة حقيقية 100%!'}</div>
              
              <input 
                type="text" className="start-input" 
                placeholder={lang === 'en' ? "Your Username" : "اسم المستخدم"} 
                value={playerName} onChange={handleNameChange}
                style={{ borderColor: isNameInvalid ? '#ef4444' : '', transition: 'border-color 0.2s ease-in-out', marginBottom: '15px' }}
              />

              {startMenu === 'main' && (
                <>
                  <div className="league-slider-wrapper">
                    
                    <button className="scroll-arrow left hide-on-mobile" onClick={() => scrollLeagues('left')}>
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="15 18 9 12 15 6"></polyline>
                      </svg>
                    </button>

                    <div className="league-selector-container" ref={leagueSliderRef} style={{ padding: '15px 35px', gap: '15px' }}>
                      {LEAGUE_OPTIONS.map(league => (
                        <div 
                          key={league.id}
                          className={`league-card ${selectedLeague === league.id ? 'selected' : ''}`}
                          onClick={() => setSelectedLeague(league.id)}
                          style={{ height: '100px', padding: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                          {league.isEmoji ? (
                            <div style={{ fontSize: '50px', lineHeight: 1, opacity: selectedLeague === league.id ? 1 : 0.4, transform: selectedLeague === league.id ? 'scale(1.15)' : 'scale(1)', transition: 'all 0.3s ease' }}>
                              {league.logoUrl}
                            </div>
                          ) : (
                            <img 
                              src={league.logoUrl} 
                              alt={league.titleEn} 
                              style={{ width: '100%', height: '100%', objectFit: 'contain', margin: 0, backgroundColor: '#f8fafc', padding: '8px', borderRadius: '10px', opacity: selectedLeague === league.id ? 1 : 0.4, transform: selectedLeague === league.id ? 'scale(1.15)' : 'scale(1)', transition: 'all 0.3s ease' }} 
                            />
                          )}
                        </div>
                      ))}
                    </div>

                    <button className="scroll-arrow right hide-on-mobile" onClick={() => scrollLeagues('right')}>
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="9 18 15 12 9 6"></polyline>
                      </svg>
                    </button>
                  </div>

                  <div className="glass-divider"></div>

                  <div className="mode-toggle-wrapper">
                    <button className="btn-toggle solo" onClick={() => handleMenuClick('solo')}>
                      <span className="emoji">👤</span> 
                      {lang === 'en' ? 'Solo' : 'فردي'}
                    </button>
                    
                    <button className="btn-toggle multi" onClick={() => handleMenuClick('multi')}>
                      <span className="emoji">👥</span> 
                      {lang === 'en' ? 'Friends' : 'أصدقاء'}
                    </button>
                  </div>
                </>
              )}

              {startMenu === 'solo' && (
                <div className="modes-container">
                  <div style={{ textAlign: 'center', marginBottom: '10px' }}><h3 style={{ color: '#cbd5e1', fontSize: '12px', textTransform: 'uppercase', margin: '0' }}>{lang === 'en' ? 'Solo Career' : 'مسيرة فردية'}</h3></div>
                  <button className="mode-card" onClick={() => startGame('short')}><span className="mode-icon">⚡</span><div className="mode-text"><h4>{lang === 'en' ? `5 Matches • $${formatB(activeModes.short.budget)}` : <><bdi>5</bdi> مباريات • <bdi>${formatB(activeModes.short.budget)}</bdi></>}</h4><p>{lang === 'en' ? 'A quick, high-stakes session. One bad guess could end it all.' : 'تحدي سريع ومثير. خطأ واحد قد ينهي كل شيء.'}</p></div></button>
                  <button className="mode-card" onClick={() => startGame('standard')}><span className="mode-icon">🌍</span><div className="mode-text"><h4>{lang === 'en' ? `7 Matches • $${formatB(activeModes.standard.budget)}` : <><bdi>7</bdi> مباريات • <bdi>${formatB(activeModes.standard.budget)}</bdi></>}</h4><p>{lang === 'en' ? 'The standard tour. Balance your budget and scout carefully.' : 'الجولة القياسية. وازن ميزانيتك وابحث بحذر.'}</p></div></button>
                  <button className="mode-card" onClick={() => startGame('endless')}><span className="mode-icon">♾️</span><div className="mode-text"><h4>{lang === 'en' ? `Endless Survival • $${formatB(activeModes.endless.budget)}` : <>بقاء لا نهائي • <bdi>${formatB(activeModes.endless.budget)}</bdi></>}</h4><p>{lang === 'en' ? 'No safety net. Play until you go bankrupt. Build your legacy.' : 'لا توجد شبكة أمان. العب حتى تفلس. اصنع أسطورتك.'}</p></div></button>
                  
                  <button className="btn-secondary" onClick={() => setStartMenu('main')} style={{ marginTop: '10px' }}>{lang === 'en' ? 'Back' : 'رجوع'}</button>
                </div>
              )}

              {startMenu === 'multi' && (
                <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  <div style={{ textAlign: 'center', marginBottom: '5px' }}><h3 style={{ color: '#00ffcc', fontSize: '12px', textTransform: 'uppercase', margin: '0' }}>{lang === 'en' ? 'Live Multiplayer (Max 4)' : 'لعب جماعي مباشر'}</h3></div>
                  <button className="mode-card" onClick={createLiveRoom} style={{ background: 'rgba(0, 255, 204, 0.05)', borderColor: 'rgba(0, 255, 204, 0.2)' }}><span className="mode-icon">🏟️</span><div className="mode-text"><h4 style={{ color: '#00ffcc' }}>{lang === 'en' ? 'Create Live Room' : 'إنشاء غرفة مباشرة'}</h4><p>{lang === 'en' ? '2-min countdown. Invite up to 3 friends.' : 'عد تنازلي دقيقتين. ادع حتى 3 أصدقاء.'}</p></div></button>
                  <div style={{ display: 'flex', gap: '10px', marginTop: '5px', direction: lang === 'ar' ? 'rtl' : 'ltr' }}>
                    <input type="text" placeholder={lang === 'en' ? "ENTER CODE" : "أدخل الرمز"} value={joinCodeInput} onChange={(e) => setJoinCodeInput(e.target.value)} style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.2)', background: 'rgba(0,0,0,0.5)', color: 'white', textAlign: 'center', fontWeight: 'bold', textTransform: 'uppercase', outline: 'none' }}/>
                    <button className="btn-primary" style={{ padding: '10px 20px', borderRadius: '8px' }} onClick={joinLiveRoom}>{lang === 'en' ? 'JOIN' : 'انضمام'}</button>
                  </div>
                  
                  <button className="btn-secondary" onClick={() => setStartMenu('main')} style={{ marginTop: '10px' }}>{lang === 'en' ? 'Back' : 'رجوع'}</button>
                </div>
              )}
            </div>
          </div>
        )}

        {gameState === 'lobby' && (
          <div className="lobby-screen" style={{ pointerEvents: 'auto', direction: lang === 'ar' ? 'rtl' : 'ltr', width: '100%', height: '100%' }}>
            <h2 style={{ margin: 0, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '2px' }}>{lang === 'en' ? 'Live Match Lobby' : 'غرفة المباراة المباشرة'}</h2>
            <div className="room-code-box">{roomCode}</div>
            <div className="timer-text" style={{ color: timeLeft <= 10 ? '#ef4444' : '#00ffcc' }}>⏳ {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</div>
            <div className="player-list">
              {Object.values(livePlayers).map((p, i) => (<div className="player-row" key={i}><span style={{ fontWeight: 'bold' }}>{p.name}</span><span>✅ {lang === 'en' ? 'Ready' : 'جاهز'}</span></div>))}
            </div>
            <div style={{ marginTop: '20px', textAlign: 'center' }}>
              {isHost ? (<button className="btn-primary" onClick={startLiveMatch} style={{ width: '300px' }}>{lang === 'en' ? 'START MATCH NOW' : 'ابدأ المباراة الآن'}</button>) : (<p style={{ color: '#cbd5e1', fontStyle: 'italic' }}>{lang === 'en' ? 'Waiting for host to start...' : 'في انتظار المضيف لبدء المباراة...'}</p>)}
              <br /><button className="btn-secondary" style={{ marginTop: '15px', width: '300px' }} onClick={resetToHome}>{lang === 'en' ? 'LEAVE ROOM' : 'مغادرة الغرفة'}</button>
            </div>
          </div>
        )}

        {isMapVisible && (
          <div style={{ pointerEvents: 'none', position: 'absolute', inset: 0 }}>
            <div className="geosports-dashboard" style={{ pointerEvents: 'auto', direction: lang === 'ar' ? 'rtl' : 'ltr' }}>
              <div className="dash-top-bar">
                <span className="dash-brand">GeoPitch</span>
                <div className="dash-budget-inline">
                  <span className="dash-label-inline">{lang === 'en' ? 'BUDGET:' : 'الميزانية:'}</span>
                  <span className="dash-value-inline" style={{ color: budget > 0 ? '#00ffcc' : '#ef4444' }}>${budget.toLocaleString()}</span>
                </div>
                {gameMode.id === 'endless' && matchHistory.length > 0 ? (
                  <button className="dash-cashout" onClick={handleCashOut}>{lang === 'en' ? '💰 CASH OUT' : '💰 إنهاء'}</button>
                ) : (
                  <button className="dash-quit" onClick={() => setShowQuitModal(true)}>{lang === 'en' ? 'QUIT' : 'خروج'}</button>
                )}
              </div>
              
              {currentDestination && (
                <div className="dash-clue-wrapper">
                  <div className="dash-clue-header" onClick={() => setIsClueExpanded(!isClueExpanded)}>
                    <span>{lang === 'en' ? 'Clue' : 'دليل'} {currentIndex + 1}{gameMode.matches !== Infinity ? ` / ${gameMode.matches}` : ''}</span>
                    <span className={`dropdown-icon ${isClueExpanded ? 'open' : ''}`}>▼</span>
                  </div>
                  {isClueExpanded && (<div className="dash-clue-content fade-in"><p className="dash-clue-text">"{currentDestination.clue[lang]}"</p></div>)}
                </div>
              )}
            </div>
            
            <div className="bottom-container" style={{ pointerEvents: 'none' }}>
              
              {gameState === 'playing' && (
                <div style={{ display: 'flex', gap: '15px', width: '100%', justifyContent: 'center', pointerEvents: 'auto' }}>
                  <button 
                    className="btn-skip" 
                    onClick={handleSkip}
                    disabled={skipsRemaining <= 0 || budget <= dynamicSkipCost}
                    style={{ 
                      flex: guessCoords ? 1 : '0 1 100%', 
                      width: guessCoords ? 'auto' : '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px'
                    }}
                  >
                    <span style={{ fontWeight: 'bold' }}>
                      {lang === 'en' ? 'SKIP' : 'تخطي'}
                    </span>
                    <span style={{ fontSize: '13px', background: 'rgba(255,255,255,0.1)', padding: '2px 8px', borderRadius: '12px', opacity: 0.9 }}>
                      {skipsRemaining}/3
                    </span>
                    <span style={{ fontSize: '12px', opacity: 0.6 }}>
                      (-${dynamicSkipCost >= 1000 ? dynamicSkipCost/1000 + 'k' : dynamicSkipCost})
                    </span>
                  </button>
                  
                  {guessCoords && (
                    <button className="btn-primary" style={{ flex: 2 }} onClick={handleLockIn}>
                      {lang === 'en' ? 'CONFIRM' : 'تأكيد'}
                    </button>
                  )}
                </div>
              )}

              {gameState === 'locked' && distanceError !== null && (
                <div className="glass-panel results-modal" style={{ direction: lang === 'ar' ? 'rtl' : 'ltr', pointerEvents: 'auto' }}>
                  
                  <div className="results-header" style={{ flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                      <span style={{ fontSize: '18px', color: 'white' }}>
                        📏 <b>{distanceError.toLocaleString()} {lang === 'en' ? 'km away' : 'كم بعيد'}</b>
                      </span>
                      <span style={{ fontSize: '18px', color: moneyCost < 0 ? '#00ffcc' : '#ef4444', fontWeight: 'bold' }}>
                        {moneyCost < 0 
                          ? (lang === 'en' ? '🎯 + $500 BULLSEYE!' : '🎯 + $500 هدف دقيق!') 
                          : (lang === 'en' ? `- $${moneyCost.toLocaleString()} Flight` : `- $${moneyCost.toLocaleString()} رحلة`)}
                      </span>
                    </div>
                  </div>

                  <h3 className="neon-text" style={{ fontSize: '22px', marginBottom: '20px' }}>{currentDestination.answer[lang]}</h3>
                  
                  <button className="btn-secondary" onClick={handleNextDestination}>
                    {currentIndex + 1 >= gameMode.matches || budget <= 0 || currentIndex + 1 >= sessionData.length 
                      ? (lang === 'en' ? 'VIEW MATCH RESULTS' : 'عرض نتائج المباراة') 
                      : (lang === 'en' ? 'NEXT FIXTURE ➔' : '➔ المباراة القادمة')}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {gameState === 'gameover' && (
          <div className="game-over-screen" style={{ pointerEvents: 'auto', direction: lang === 'ar' ? 'rtl' : 'ltr', width: '100%', height: '100%' }}>
            {roomCode ? (
              <div className="glass-panel podium-container">
                <h2 style={{ color: 'white', marginBottom: '25px', fontSize: '28px' }}>🏆 {lang === 'en' ? 'Final Standings' : 'الترتيب النهائي'}</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '30px' }}>
                  {Object.entries(livePlayers).sort((a, b) => b[1].score - a[1].score).map(([id, player], index) => (
                      <div key={id} className={`podium-row place-${index + 1}`}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}><span className="rank">#{index + 1}</span><span className="name">{player.name} {id === playerId ? (lang === 'en' ? '(You)' : '(أنت)') : ''}</span></div>
                        <div className="score" style={{ color: player.score <= 0 ? '#ef4444' : 'inherit' }}>${Math.max(0, player.score).toLocaleString()} {player.finished ? '' : '⏳'}</div>
                      </div>
                  ))}
                </div>
                <button className="btn-secondary" onClick={resetToHome}>{lang === 'en' ? 'RETURN TO MAIN MENU' : 'العودة للقائمة الرئيسية'}</button>
              </div>
            ) : (
              <>
                <div ref={shareCardRef} className="share-card-container">
                  <div className="share-card-left">
                    <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginBottom: '15px', alignItems: 'center' }}>
                      <span className="badge-glass">🗓️ <bdi>{getFormattedDate()}</bdi></span>
                      <span className="streak-text-only hide-on-mobile">🔥 {lang === 'en' ? '1 Day Streak' : 'يوم واحد'}</span>
                      <span className="hide-on-desktop" style={{ color: budget > 0 ? '#00ffcc' : '#ef4444', fontWeight: 'bold', fontSize: '15px', letterSpacing: '1px' }}>💰 <bdi>${Math.max(0, budget).toLocaleString()}</bdi></span>
                    </div>
                    <h3 className="hide-on-mobile" style={{ margin: '0 0 10px 0', fontWeight: 400, color: '#e2e8f0', fontSize: '15px' }}>{lang === 'en' ? 'Final Balance' : 'الرصيد النهائي'}</h3>
                    <div className="hero-circle hide-on-mobile"><h2 style={{ fontSize: '38px', margin: 0, color: '#00ffcc', textShadow: '0 0 15px rgba(0,255,204,0.4)' }}><bdi>${Math.max(0, budget).toLocaleString()}</bdi></h2></div>
                    <h2 style={{ margin: '10px 0 5px 0', fontSize: '22px', color: budget > 0 ? '#00ffcc' : '#ef4444' }}>{budget > 0 ? (lang === 'en' ? 'Season Survived!' : 'موسم ناجح!') : (lang === 'en' ? 'Bankrupt!' : 'إفلاس!')}</h2>
                    <p style={{ margin: 0, fontSize: '13px', color: '#cbd5e1', lineHeight: '1.5' }}>{lang === 'en' ? <><bdi>{playerName}</bdi>, what a journey across the globe.</> : <><bdi>{playerName}</bdi>، يا لها من رحلة عبر العالم.</>}</p>
                  </div>

                  <div className="share-card-right">
                    <h3 style={{ margin: '0 0 15px 0', color: 'white', fontSize: '16px', textAlign: 'center' }}>{lang === 'en' ? 'Season Summary' : 'ملخص الموسم'}</h3>
                    <div className="ledger-item starting-budget"><span>🏦 {lang === 'en' ? 'Starting Budget' : 'الميزانية الأولية'}</span><strong><bdi>${gameMode.budget.toLocaleString()}</bdi></strong></div>
                    <div className="ledger-item bonuses"><span>🎯 {lang === 'en' ? 'Bullseye Bonuses' : 'مكافآت الهدف الدقيق'}</span><strong><bdi>+ ${totalBonuses.toLocaleString()}</bdi></strong></div>
                    <div className="ledger-item expenses"><span>✈️ {lang === 'en' ? 'Travel Expenses' : 'مصاريف السفر'}</span><strong><bdi>- ${totalExpenses.toLocaleString()}</bdi></strong></div>

                    {totalSkipCost > 0 && (
                      <div className="ledger-item expenses" style={{ background: 'rgba(245, 158, 11, 0.08)', borderLeft: '3px solid #f59e0b', color: '#fcd34d' }}>
                        <span>⏭️ {lang === 'en' ? 'Skips Cost' : 'تكلفة التخطي'}</span>
                        <strong><bdi>- ${totalSkipCost.toLocaleString()}</bdi></strong>
                      </div>
                    )}

                    <div className="emoji-display-box" style={{ flexWrap: 'wrap', display: 'flex', justifyContent: 'center', gap: '4px' }}>{paddedHistory.map((emoji, i) => <span key={i}>{emoji}</span>)}</div>
                    <div className="watermark">🌍 Play at <strong>geopitch.gg</strong></div>
                  </div>
                </div>

                <div className="action-buttons-wrapper">
                  <button className="btn-secondary" style={{ flex: 1 }} onClick={resetToHome}>{lang === 'en' ? 'MAIN MENU' : 'القائمة الرئيسية'}</button>
                  <button className="btn-primary" style={{ flex: 2, display: 'flex', gap: '8px', justifyContent: 'center' }} onClick={shareAsImage} disabled={isSharing}>{isSharing ? '...' : (lang === 'en' ? 'SHARE YOUR SCORE' : 'شارك نتيجتك')}</button>
                </div>
              </>
            )}
          </div>
        )}

      </div>
    </div>
  );
}