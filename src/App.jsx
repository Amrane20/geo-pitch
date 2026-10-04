import React, { useState, useRef, useEffect } from 'react';
import Map, { Marker, Source, Layer } from 'react-map-gl/maplibre';
import html2canvas from 'html2canvas'; 
import 'maplibre-gl/dist/maplibre-gl.css';
import './App.css'; 
import { DESTINATIONS } from './data/destinations';

// MULTIPLAYER IMPORTS
import { ref, set, get, onValue, update, query, orderByChild, endAt } from "firebase/database";
import { db } from './firebase'; 

const GAME_MODES = {
  short: { id: 'short', matches: 5, budget: 10000 },
  standard: { id: 'standard', matches: 7, budget: 15000 },
  endless: { id: 'endless', matches: Infinity, budget: 25000 }
};

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
      // FIX 1: Swapped 23.5MB jsdelivr link for a lightweight (~1MB), highly-reliable mapping CDN
      data: 'https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_50m_admin_0_countries.geojson'
    },
    'countries-labels': {
      type: 'geojson',
      // FIX 2: Bypassing jsDelivr's production block by using the direct raw GitHub URL
      data: 'https://raw.githubusercontent.com/gavinr/world-countries-centroids/master/dist/countries.geojson'
    },
    'major-cities': {
      type: 'geojson',
      // FIX 3: Reliable production CDN for populated places (~1.5MB instead of a blocked master branch)
      data: 'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_10m_populated_places_simple.geojson'
    }
  },
  layers: [
    { id: 'background', type: 'background', paint: { 'background-color': '#03050c' } },
    { id: 'satellite', type: 'raster', source: 'satellite-tiles', minzoom: 0, maxzoom: 18, paint: { 'raster-brightness-min': 0.15, 'raster-brightness-max': 0.95, 'raster-saturation': 0.1 } },
    { id: 'admin-boundaries', type: 'line', source: 'countries-boundaries', paint: { 'line-color': '#ffffff', 'line-width': 1.2, 'line-opacity': 0.55 } },
    {
      id: 'admin-labels',
      type: 'symbol',
      source: 'countries-labels',
      layout: {
        'text-field': ['case', ['has', 'ISO'], ['get', 'ISO'], ['upcase', ['slice', ['get', 'COUNTRY'], 0, 2]]],
        // FIX 4: Removed 'Arial Unicode MS Bold'. This ensures MapLibre requests exactly 
        // what the demotiles server has, preventing the 404 crash that hides all text.
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
        // FIX 4 (Continued): Applied the same font fix here.
        'text-font': ['Open Sans Bold'],
        'text-size': [
          'interpolate', ['linear'], ['zoom'],
          4, 10,
          9, 13,
          16, 18
        ],
        'text-anchor': 'center'
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

// --- AUDIO ---
const playFlightSound = () => { try { const ctx = new (window.AudioContext || window.webkitAudioContext)(); const now = ctx.currentTime; const osc = ctx.createOscillator(); const filter = ctx.createBiquadFilter(); const gain = ctx.createGain(); osc.type = 'sawtooth'; osc.frequency.setValueAtTime(150, now); osc.frequency.exponentialRampToValueAtTime(1200, now + 1.2); filter.type = 'lowpass'; filter.frequency.setValueAtTime(400, now); filter.frequency.exponentialRampToValueAtTime(2500, now + 1.2); gain.gain.setValueAtTime(0.05, now); gain.gain.linearRampToValueAtTime(0.1, now + 0.6); gain.gain.linearRampToValueAtTime(0.001, now + 1.2); osc.connect(filter); filter.connect(gain); gain.connect(ctx.destination); osc.start(now); osc.stop(now + 1.2); } catch(e) {} };
const playSuccessSound = () => { try { const ctx = new (window.AudioContext || window.webkitAudioContext)(); const now = ctx.currentTime; [659.25, 830.61, 987.77, 1318.51, 1661.22].forEach((freq, index) => { const osc = ctx.createOscillator(); const gain = ctx.createGain(); osc.type = 'sine'; osc.frequency.setValueAtTime(freq, now + index * 0.06); gain.gain.setValueAtTime(0.1, now + index * 0.06); gain.gain.exponentialRampToValueAtTime(0.0001, now + index * 0.06 + 0.4); osc.connect(gain); gain.connect(ctx.destination); osc.start(now + index * 0.06); osc.stop(now + index * 0.06 + 0.4); }); } catch(e) {} };
const playErrorSound = () => { try { const ctx = new (window.AudioContext || window.webkitAudioContext)(); const now = ctx.currentTime; const osc = ctx.createOscillator(); const gain = ctx.createGain(); osc.type = 'square'; osc.frequency.setValueAtTime(110, now); osc.frequency.setValueAtTime(80, now + 0.1); gain.gain.setValueAtTime(0.1, now); gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25); osc.connect(gain); gain.connect(ctx.destination); osc.start(now); osc.stop(now + 0.25); } catch(e) {} };


// ==========================================
// SEPARATED COMPONENT: Quit Confirmation Modal
// ==========================================
const QuitConfirmModal = ({ lang, onConfirm, onCancel }) => {
  return (
    <div className="ad-modal-overlay" style={{ direction: lang === 'ar' ? 'rtl' : 'ltr' }}>
      <div className="glass-panel ad-modal" style={{ padding: '30px 25px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        
        {/* Soft Glowing Warning Icon - Properly Centered */}
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
          
          {/* Changed 'Delete' to 'Quit' */}
          <button className="btn-danger" style={{ flex: 1, margin: 0 }} onClick={onConfirm}>
            {lang === 'en' ? 'Quit' : 'خروج'}
          </button>
        </div>
      </div>
    </div>
  );
};


// ==========================================
// MAIN APP COMPONENT
// ==========================================
export default function App() {
  const [gameState, setGameState] = useState('start');
  const [startMenu, setStartMenu] = useState('main'); 
  const [lang, setLang] = useState('en');
  const [playerName, setPlayerName] = useState('');
  const [isNameInvalid, setIsNameInvalid] = useState(false);

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
  const [animationProgress, setAnimationProgress] = useState(0);
  const [isSharing, setIsSharing] = useState(false);
  const shareCardRef = useRef(null);

  // --- MULTIPLAYER & MONETIZATION STATES ---
  const [roomCode, setRoomCode] = useState('');
  const [joinCodeInput, setJoinCodeInput] = useState('');
  const [livePlayers, setLivePlayers] = useState({});
  const [playerId] = useState(`player_${Math.floor(Math.random() * 100000)}`);
  const [isHost, setIsHost] = useState(false);
  const [timeLeft, setTimeLeft] = useState(120);
  const [expiresAt, setExpiresAt] = useState(null);
  
  const [showAdModal, setShowAdModal] = useState(false);
  const [showQuitModal, setShowQuitModal] = useState(false);

  // Helper for Input Name
  const handleNameChange = (e) => {
    const value = e.target.value;
    const regex = /^[a-zA-Z0-9\u0600-\u06FF\s]*$/;
    if (regex.test(value)) {
      setPlayerName(value);
      setIsNameInvalid(false);
    } else {
      setIsNameInvalid(true);
      setTimeout(() => setIsNameInvalid(false), 400);
    }
  };

  // --- SILENT FIREBASE JANITOR ---
  const cleanExpiredRooms = async () => {
    try {
      const now = Date.now();
      const oldRoomsQuery = query(ref(db, 'rooms'), orderByChild('expiresAt'), endAt(now));
      const snapshot = await get(oldRoomsQuery);
      
      if (snapshot.exists()) {
        const updates = {};
        snapshot.forEach((child) => {
          updates[child.key] = null;
        });
        await update(ref(db, 'rooms'), updates);
        console.log(`🧹 Janitor: Cleaned up ${Object.keys(updates).length} expired rooms.`);
      }
    } catch (error) {
      console.error("Cleanup failed, but game continues:", error);
    }
  };

  const handleMenuClick = (menuTarget) => {
    if (!playerName.trim()) {
      setIsNameInvalid(true);
      setTimeout(() => setIsNameInvalid(false), 400);
      return alert(lang === 'en' ? "Please enter your name first" : "الرجاء إدخال اسمك أولاً");
    }
    if (menuTarget === 'multi') {
      cleanExpiredRooms();
    }
    setStartMenu(menuTarget);
  };

  // --- MONETIZATION: Check 3-Match Daily Limit ---
  const checkDailyLimit = () => {
    const today = new Date().toISOString().split('T')[0];
    const plays = parseInt(localStorage.getItem(`livePlays_${today}`) || '0');
    if (plays >= 3) {
      setShowAdModal(true);
      return false;
    }
    return true;
  };

  const incrementDailyPlays = () => {
    const today = new Date().toISOString().split('T')[0];
    const plays = parseInt(localStorage.getItem(`livePlays_${today}`) || '0');
    localStorage.setItem(`livePlays_${today}`, plays + 1);
  };

  const watchAdMock = () => {
    alert(lang === 'en' ? "Watching a 15-second Ad... 📺" : "مشاهدة إعلان لمدة 15 ثانية... 📺");
    setTimeout(() => {
      alert(lang === 'en' ? "Ad complete! You have unlocked 1 more Live Match." : "اكتمل الإعلان! لقد قمت بفتح مباراة مباشرة إضافية.");
      const today = new Date().toISOString().split('T')[0];
      const plays = parseInt(localStorage.getItem(`livePlays_${today}`) || '0');
      localStorage.setItem(`livePlays_${today}`, Math.max(0, plays - 1)); 
      setShowAdModal(false);
    }, 2000);
  };

  // --- MULTIPLAYER CORE FUNCTIONS ---
  const createLiveRoom = async () => {
    if (!checkDailyLimit()) return;

    const shuffled = [...DESTINATIONS].sort(() => 0.5 - Math.random());
    const matchIndices = shuffled.slice(0, 5).map(dest => DESTINATIONS.indexOf(dest));

    const code = Math.random().toString(36).substring(2, 6).toUpperCase();
    const roomRef = ref(db, `rooms/${code}`);
    
    const expiry = Date.now() + 120000;
    await set(roomRef, {
      status: 'waiting',
      expiresAt: expiry,
      locations: matchIndices,
      players: { [playerId]: { name: playerName, score: 10000, finished: false } }
    });

    setRoomCode(code);
    setIsHost(true);
    setExpiresAt(expiry);
    setGameState('lobby');
    listenToRoom(code);
  };

  const joinLiveRoom = async () => {
    if (!joinCodeInput.trim()) return;
    if (!checkDailyLimit()) return;

    const code = joinCodeInput.toUpperCase();
    const roomRef = ref(db, `rooms/${code}`);
    const snapshot = await get(roomRef);

    if (snapshot.exists()) {
      const data = snapshot.val();
      if (data.status !== 'waiting') return alert(lang === 'en' ? "Match already started!" : "المباراة بدأت بالفعل!");
      if (Object.keys(data.players || {}).length >= 4) return alert(lang === 'en' ? "Room is full! (Max 4)" : "الغرفة ممتلئة! (الحد الأقصى 4)");

      await update(ref(db, `rooms/${code}/players`), {
        [playerId]: { name: playerName, score: 10000, finished: false }
      });

      setRoomCode(code);
      setIsHost(false);
      setExpiresAt(data.expiresAt);
      setGameState('lobby');
      listenToRoom(code);
    } else {
      alert(lang === 'en' ? "Room not found or expired." : "الغرفة غير موجودة أو انتهت صلاحيتها.");
    }
  };

  const listenToRoom = (code) => {
    const roomRef = ref(db, `rooms/${code}`);
    onValue(roomRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) return; 

      setLivePlayers(data.players || {});
      
      setGameState((prev) => {
        if (data.status === 'playing' && prev === 'lobby') {
          const dests = data.locations.map(idx => DESTINATIONS[idx]);
          setSessionData(dests);
          setBudget(10000); 
          setGameMode(GAME_MODES.short);
          setCurrentIndex(0);
          setMatchHistory([]);
          setTotalBonuses(0);
          setTotalExpenses(0);
          incrementDailyPlays(); 
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
        if (remaining <= 0) {
          setTimeLeft(0);
          clearInterval(interval);
        } else {
          setTimeLeft(remaining);
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [gameState, expiresAt]);


  // --- SOLO CORE FUNCTIONS ---
  const startGame = (modeKey) => {
    const selectedMode = GAME_MODES[modeKey];
    setGameMode(selectedMode);
    
    const shuffled = [...DESTINATIONS].sort(() => 0.5 - Math.random());
    const matchCount = selectedMode.matches === Infinity ? shuffled.length : selectedMode.matches;
    
    setSessionData(shuffled.slice(0, matchCount));
    setBudget(selectedMode.budget);
    setMatchHistory([]);
    setTotalBonuses(0);
    setTotalExpenses(0);
    setCurrentIndex(0);
    setGameState('playing');
  };

  const currentDestination = sessionData[currentIndex];

  const handleMapClick = (e) => {
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

    const stepAnimation = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / 1000, 1);
      setAnimationProgress(Math.floor(progress * fullArcCoords.length));

      if (progress < 1) {
        requestAnimationFrame(stepAnimation);
      } else {
        const actualDist = calculateDistance(guessCoords.lat, guessCoords.lng, currentDestination.latitude, currentDestination.longitude);
        setDistanceError(actualDist);
        let cost = actualDist;
        
        const allowedRadius = currentDestination.type === 'city' ? 80 : 7;
        let scoreEmoji = "🟥";
        
        if (actualDist <= allowedRadius) {
          cost = -500; 
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
          if (roomCode) {
            update(ref(db, `rooms/${roomCode}/players/${playerId}`), { score: Math.max(0, newBudget) });
          }
          return newBudget;
        });
        
        setGameState('locked');
      }
    };
    requestAnimationFrame(stepAnimation);
  };

  const handleNextDestination = () => {
    if (budget <= 0 || currentIndex + 1 >= sessionData.length) {
      if (roomCode) {
        update(ref(db, `rooms/${roomCode}/players/${playerId}`), { finished: true });
      }
      setGameState('gameover');
    } else {
      setCurrentIndex(curr => curr + 1);
      setGuessCoords(null);
      setDistanceError(null);
      setMoneyCost(null);
      setGameState('playing');
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
      const canvas = await html2canvas(shareCardRef.current, { backgroundColor: '#03050c', scale: 2, useCORS: true });
      canvas.toBlob(async (blob) => {
        if (!blob) return setIsSharing(false);
        const file = new File([blob], `GeoPitch-Result-${playerName}.png`, { type: 'image/png' });

        if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: 'My GeoPitch Season',
            text: lang === 'en' ? 'Think you know football geography? Prove it: geopitch.gg' : 'هل أنت خبير في جغرافيا كرة القدم؟ أثبت ذلك: geopitch.gg',
            files: [file],
          });
        } else {
          const link = document.createElement('a');
          link.download = `GeoPitch-Result-${playerName}.png`;
          link.href = URL.createObjectURL(blob);
          link.click();
          alert(lang === 'en' ? "Image downloaded! Share it with your friends." : "تم تحميل الصورة! شاركها مع أصدقائك.");
        }
        setIsSharing(false);
      }, 'image/png');
    } catch (error) {
      console.error("Error generating image:", error);
      setIsSharing(false);
    }
  };

  const resetToHome = () => {
    setGameState('start');
    setStartMenu('main');
    setRoomCode('');
  };

  // --- Handlers for Custom Quit Modal ---
  const confirmQuit = () => {
    if (roomCode) {
      update(ref(db, `rooms/${roomCode}/players/${playerId}`), { finished: true });
      setRoomCode('');
      setGameState('start');
      setStartMenu('main'); 
    } else {
      setGameState('start');
      setStartMenu('solo'); 
    }
    setShowQuitModal(false);
  };

  const paddedHistory = [...matchHistory];
  if (gameMode && gameMode.matches !== Infinity) {
    while (paddedHistory.length < gameMode.matches) {
      paddedHistory.push("🟥");
    }
  }

  const flightPathData = guessCoords ? { type: 'Feature', geometry: { type: 'LineString', coordinates: generateFullArc(guessCoords.lng, guessCoords.lat, currentDestination?.longitude || 0, currentDestination?.latitude || 0).slice(0, Math.max(2, animationProgress)) } } : null;

  return (
    <div className="game-container shiny-globe-wrapper">
      
      {/* MONETIZATION AD MODAL OVERLAY */}
      {showAdModal && (
        <div className="ad-modal-overlay" style={{ direction: lang === 'ar' ? 'rtl' : 'ltr' }}>
          <div className="glass-panel ad-modal">
            <h2 style={{ color: 'white', marginTop: 0 }}>🛑 {lang === 'en' ? 'Daily Limit Reached' : 'تم بلوغ الحد اليومي'}</h2>
            <p style={{ color: '#cbd5e1', fontSize: '14px', marginBottom: '25px' }}>
              {lang === 'en' 
                ? 'You have played your 3 free live matches for today. Servers cost money, but you can keep playing for free!' 
                : 'لقد لعبت 3 مباريات مجانية اليوم. الخوادم تكلف مالاً، لكن يمكنك الاستمرار في اللعب مجاناً!'}
            </p>
            <button className="btn-ad" onClick={watchAdMock}>
              📺 {lang === 'en' ? 'Watch Ad (15s) to Play 1 More' : 'شاهد إعلان (15ث) للعب مباراة إضافية'}
            </button>
            <button 
              className="btn-secondary" 
              style={{ marginTop: '15px' }} 
              onClick={() => {
                setShowAdModal(false);
                setGameState('start');
                setStartMenu('solo');
              }}
            >
              {lang === 'en' ? 'Back to Solo Mode' : 'العودة إلى وضع اللاعب الفردي'}
            </button>
          </div>
        </div>
      )}

      {/* IMPLEMENTED SEPARATED QUIT CONFIRMATION MODAL */}
      {showQuitModal && (
        <QuitConfirmModal 
          lang={lang} 
          onConfirm={confirmQuit} 
          onCancel={() => setShowQuitModal(false)} 
        />
      )}

      {/* START SCREEN */}
      {gameState === 'start' && (
        <div className="start-screen" style={{ overflowY: 'auto' }}>
          <div style={{ position: 'absolute', top: 20, right: 20, display: 'flex', gap: '10px', zIndex: 20 }}>
            <button className="lang-toggle-btn" style={{ background: lang === 'en' ? '#00ffcc' : 'rgba(255,255,255,0.1)', color: lang === 'en' ? 'black' : 'white' }} onClick={() => setLang('en')}>EN</button>
            <button className="lang-toggle-btn" style={{ background: lang === 'ar' ? '#00ffcc' : 'rgba(255,255,255,0.1)', color: lang === 'ar' ? 'black' : 'white' }} onClick={() => setLang('ar')}>عربي</button>
          </div>
          
          <div className="glass-panel start-modal" style={{ width: '450px', margin: '40px 0', direction: lang === 'ar' ? 'rtl' : 'ltr' }}>
            <h1 className="neon-text" style={{ fontSize: '46px', letterSpacing: '-1px', marginBottom: '5px', textAlign: 'center' }}>GeoPitch</h1>
            <p style={{ color: '#94a3b8', marginBottom: '15px', fontSize: '15px', textAlign: 'center' }}>
              {lang === 'en' ? 'The Ultimate Football Geography Challenge.' : 'التحدي الجغرافي الأكبر لكرة القدم.'}
            </p>
            
            {/* 🆕 NEW FAKE MONEY DISCLAIMER BADGE */}
            <div className="fun-disclaimer">
              {lang === 'en' ? '💸 Virtual budget, 100% real fun!' : '💸 ميزانية افتراضية، متعة حقيقية 100%!'}
            </div>
            
            <input 
              type="text" 
              className="start-input" 
              placeholder={lang === 'en' ? "Your Username" : "اسم المستخدم"} 
              value={playerName} 
              onChange={handleNameChange}
              style={{ borderColor: isNameInvalid ? '#ef4444' : '', transition: 'border-color 0.2s ease-in-out', marginBottom: '25px' }}
            />

            {/* Main Menu Choices */}
            {startMenu === 'main' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', width: '100%' }}>
                <button className="btn-primary" style={{ padding: '16px', fontSize: '18px' }} onClick={() => handleMenuClick('solo')}>
                  👤 {lang === 'en' ? 'PLAY SOLO' : 'لعب فردي'}
                </button>
                <button className="btn-primary" style={{ background: 'linear-gradient(90deg, #f59e0b, #d97706)', padding: '16px', fontSize: '18px' }} onClick={() => handleMenuClick('multi')}>
                  🌍 {lang === 'en' ? 'PLAY WITH FRIENDS' : 'العب مع الأصدقاء'}
                </button>
              </div>
            )}

            {/* Solo Menu */}
            {startMenu === 'solo' && (
              <div className="modes-container">
                <div style={{ textAlign: 'center', marginBottom: '10px' }}>
                  <h3 style={{ color: '#cbd5e1', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', margin: '0' }}>
                    {lang === 'en' ? 'Solo Career' : 'مسيرة فردية'}
                  </h3>
                </div>
                <button className="mode-card" onClick={() => startGame('short')}>
                  <span className="mode-icon">⚡</span>
                  <div className="mode-text">
                    <h4>{lang === 'en' ? '5 Matches • $10k' : <><bdi>5</bdi> مباريات • <bdi>$10k</bdi></>}</h4>
                    <p>{lang === 'en' ? 'A quick, high-stakes session. One bad guess could end it all.' : 'تحدي سريع ومثير. خطأ واحد قد ينهي كل شيء.'}</p>
                  </div>
                </button>
                <button className="mode-card" onClick={() => startGame('standard')}>
                  <span className="mode-icon">🌍</span>
                  <div className="mode-text">
                    <h4>{lang === 'en' ? '7 Matches • $15k' : <><bdi>7</bdi> مباريات • <bdi>$15k</bdi></>}</h4>
                    <p>{lang === 'en' ? 'The standard tour. Balance your budget and scout carefully.' : 'الجولة القياسية. وازن ميزانيتك وابحث بحذر.'}</p>
                  </div>
                </button>
                <button className="mode-card" onClick={() => startGame('endless')}>
                  <span className="mode-icon">♾️</span>
                  <div className="mode-text">
                    <h4>{lang === 'en' ? 'Endless Survival • $25k' : <>بقاء لا نهائي • <bdi>$25k</bdi></>}</h4>
                    <p>{lang === 'en' ? 'No safety net. Play until you go bankrupt. Build your legacy.' : 'لا توجد شبكة أمان. العب حتى تفلس. اصنع أسطورتك.'}</p>
                  </div>
                </button>
                <button className="btn-secondary" onClick={() => setStartMenu('main')} style={{ marginTop: '10px' }}>
                  {lang === 'en' ? 'Back' : 'رجوع'}
                </button>
              </div>
            )}

            {/* Multiplayer Menu */}
            {startMenu === 'multi' && (
              <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div style={{ textAlign: 'center', marginBottom: '5px' }}>
                  <h3 style={{ color: '#00ffcc', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', margin: '0' }}>
                    {lang === 'en' ? 'Live Multiplayer (Max 4)' : 'لعب جماعي مباشر (الحد الأقصى 4)'}
                  </h3>
                </div>
                
                <button className="mode-card" onClick={createLiveRoom} style={{ background: 'rgba(0, 255, 204, 0.05)', borderColor: 'rgba(0, 255, 204, 0.2)' }}>
                  <span className="mode-icon">🏟️</span>
                  <div className="mode-text">
                    <h4 style={{ color: '#00ffcc' }}>{lang === 'en' ? 'Create Live Room' : 'إنشاء غرفة مباشرة'}</h4>
                    <p>{lang === 'en' ? '2-min countdown. Invite up to 3 friends.' : 'عد تنازلي دقيقتين. ادع حتى 3 أصدقاء.'}</p>
                  </div>
                </button>
                
                <div style={{ display: 'flex', gap: '10px', marginTop: '5px', direction: lang === 'ar' ? 'rtl' : 'ltr' }}>
                  <input 
                    type="text" 
                    placeholder={lang === 'en' ? "ENTER CODE" : "أدخل الرمز"} 
                    value={joinCodeInput} 
                    onChange={(e) => setJoinCodeInput(e.target.value)}
                    style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.2)', background: 'rgba(0,0,0,0.5)', color: 'white', textAlign: 'center', fontWeight: 'bold', textTransform: 'uppercase', outline: 'none' }}
                  />
                  <button className="btn-primary" style={{ padding: '10px 20px', borderRadius: '8px' }} onClick={joinLiveRoom}>
                    {lang === 'en' ? 'JOIN' : 'انضمام'}
                  </button>
                </div>
                
                <button className="btn-secondary" onClick={() => setStartMenu('main')} style={{ marginTop: '10px' }}>
                  {lang === 'en' ? 'Back' : 'رجوع'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MULTIPLAYER LOBBY SCREEN */}
      {gameState === 'lobby' && (
        <div className="lobby-screen" style={{ direction: lang === 'ar' ? 'rtl' : 'ltr' }}>
          <h2 style={{ margin: 0, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '2px' }}>
            {lang === 'en' ? 'Live Match Lobby' : 'غرفة المباراة المباشرة'}
          </h2>
          <div className="room-code-box">{roomCode}</div>
          <div className="timer-text" style={{ color: timeLeft <= 10 ? '#ef4444' : '#00ffcc' }}>
            ⏳ {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
          </div>
          
          <div className="player-list">
            {Object.values(livePlayers).map((p, i) => (
              <div className="player-row" key={i}>
                <span style={{ fontWeight: 'bold' }}>{p.name}</span>
                <span>✅ {lang === 'en' ? 'Ready' : 'جاهز'}</span>
              </div>
            ))}
          </div>

          <div style={{ marginTop: '20px', textAlign: 'center' }}>
            {isHost ? (
              <button className="btn-primary" onClick={startLiveMatch} style={{ width: '300px' }}>
                {lang === 'en' ? 'START MATCH NOW' : 'ابدأ المباراة الآن'}
              </button>
            ) : (
              <p style={{ color: '#cbd5e1', fontStyle: 'italic' }}>
                {lang === 'en' ? 'Waiting for host to start...' : 'في انتظار المضيف لبدء المباراة...'}
              </p>
            )}
            <br />
            <button className="btn-secondary" style={{ marginTop: '15px', width: '300px' }} onClick={resetToHome}>
              {lang === 'en' ? 'LEAVE ROOM' : 'مغادرة الغرفة'}
            </button>
          </div>
        </div>
      )}

      {/* ACTIVE GAME MAP & HUD */}
      {['playing', 'animating', 'locked'].includes(gameState) && (
        <>
          <div className="hud-container" style={{ direction: lang === 'ar' ? 'rtl' : 'ltr' }}>
            <div className="glass-panel hud-box">
              <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '2px' }}>{playerName}'s Budget</div>
              <h2 style={{ color: budget > 0 ? '#00ffcc' : '#ef4444', margin: 0, fontSize: '24px' }}>${budget.toLocaleString()}</h2>
            </div>
            
            <div style={{ display: 'flex', gap: '10px' }}>
              <div className="glass-panel hud-box" style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{ color: '#fff', fontWeight: 'bold', fontSize: '15px' }}>
                  {lang === 'en' ? `Match ${currentIndex + 1}` : `المباراة ${currentIndex + 1}`}
                  {gameMode.matches !== Infinity && ` / ${gameMode.matches}`}
                </span>
              </div>
              
              <button 
                className="glass-panel hud-box" 
                onClick={() => setShowQuitModal(true)}
                style={{ 
                  background: 'rgba(239, 68, 68, 0.15)', 
                  border: '1px solid rgba(239, 68, 68, 0.3)', 
                  color: '#fca5a5', 
                  cursor: 'pointer', 
                  display: 'flex', 
                  alignItems: 'center', 
                  transition: 'all 0.2s' 
                }}
              >
                <span style={{ fontWeight: 'bold', fontSize: '14px' }}>{lang === 'en' ? 'QUIT' : 'خروج'}</span>
              </button>
            </div>
          </div>
          
          {currentDestination && (
            <div className="glass-panel clue-container" style={{ direction: lang === 'ar' ? 'rtl' : 'ltr' }}>
              <p className="clue-text">"{currentDestination.clue[lang]}"</p>
            </div>
          )}
          
          <Map 
            initialViewState={{ longitude: 0, latitude: 20, zoom: 1.5 }} 
            style={{ width: '100vw', height: '100vh' }} 
            mapStyle={mapStyle} 
            onClick={handleMapClick} 
            interactiveLayerIds={['satellite']} 
            maxZoom={16}
            attributionControl={false} 
          >
            {guessCoords && <Marker longitude={guessCoords.lng} latitude={guessCoords.lat} anchor="bottom"><div style={{ fontSize: '30px', opacity: gameState === 'locked' ? 0.5 : 1, filter: 'drop-shadow(0 0 10px #00ffcc)' }}>🔵</div></Marker>}
            {gameState === 'locked' && currentDestination && <Marker longitude={currentDestination.longitude} latitude={currentDestination.latitude} anchor="bottom"><div style={{ fontSize: '35px', filter: 'drop-shadow(0 0 15px #ef4444)' }}>🔴</div></Marker>}
            {(gameState === 'animating' || gameState === 'locked') && flightPathData && <Source id="flight-path-source" type="geojson" data={flightPathData}><Layer {...flightPathStyle} /></Source>}
          </Map>
          
          <div className="bottom-container">
            {guessCoords && gameState === 'playing' && <button className="btn-primary" onClick={handleLockIn}>{lang === 'en' ? 'CONFIRM TRAVEL' : 'تأكيد السفر'}</button>}
            {gameState === 'locked' && distanceError !== null && (
              <div className="glass-panel results-modal" style={{ direction: lang === 'ar' ? 'rtl' : 'ltr' }}>
                <div className="results-header">
                  <span style={{ fontSize: '18px', color: 'white' }}>📏 <b>{distanceError.toLocaleString()} {lang === 'en' ? 'km away' : 'كم بعيد'}</b></span>
                  <span style={{ fontSize: '18px', color: moneyCost < 0 ? '#00ffcc' : '#ef4444', fontWeight: 'bold' }}>{moneyCost < 0 ? (lang === 'en' ? '🎯 + $500 BULLSEYE!' : '🎯 + $500 هدف دقيق!') : (lang === 'en' ? `- $${moneyCost.toLocaleString()} Flight` : `- $${moneyCost.toLocaleString()} رحلة`)}</span>
                </div>
                <h3 className="neon-text" style={{ fontSize: '22px', marginBottom: '20px' }}>{currentDestination.answer[lang]}</h3>
                <button className="btn-secondary" onClick={handleNextDestination}>{currentIndex + 1 >= gameMode.matches || budget <= 0 || currentIndex + 1 >= sessionData.length ? (lang === 'en' ? 'VIEW MATCH RESULTS' : 'عرض نتائج المباراة') : (lang === 'en' ? 'NEXT FIXTURE ➔' : '➔ المباراة القادمة')}</button>
              </div>
            )}
          </div>
        </>
      )}

      {/* GAME OVER SCREEN (SOLO OR MULTIPLAYER) */}
      {gameState === 'gameover' && (
        <div className="game-over-screen" style={{ direction: lang === 'ar' ? 'rtl' : 'ltr' }}>
          
          {roomCode ? (
            /* --- MULTIPLAYER PODIUM --- */
            <div className="glass-panel podium-container">
              <h2 style={{ color: 'white', marginBottom: '25px', fontSize: '28px' }}>
                🏆 {lang === 'en' ? 'Final Standings' : 'الترتيب النهائي'}
              </h2>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '30px' }}>
                {Object.entries(livePlayers)
                  .sort((a, b) => b[1].score - a[1].score)
                  .map(([id, player], index) => (
                    <div key={id} className={`podium-row place-${index + 1}`}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <span className="rank">#{index + 1}</span>
                        <span className="name">{player.name} {id === playerId ? (lang === 'en' ? '(You)' : '(أنت)') : ''}</span>
                      </div>
                      <div className="score" style={{ color: player.score <= 0 ? '#ef4444' : 'inherit' }}>
                        ${Math.max(0, player.score).toLocaleString()} {player.finished ? '' : '⏳'}
                      </div>
                    </div>
                ))}
              </div>
              
              <button className="btn-secondary" onClick={resetToHome}>
                {lang === 'en' ? 'RETURN TO MAIN MENU' : 'العودة للقائمة الرئيسية'}
              </button>
            </div>

          ) : (
            /* --- SOLO SHARE CARD --- */
            <>
              <div ref={shareCardRef} className="share-card-container">
                <div className="share-card-left">
                  <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginBottom: '15px', alignItems: 'center' }}>
                    <span className="badge-glass">🗓️ <bdi>{getFormattedDate()}</bdi></span>
                    <span className="streak-text-only">🔥 {lang === 'en' ? '1 Day Streak' : 'يوم واحد'}</span>
                  </div>

                  <h3 style={{ margin: '0 0 10px 0', fontWeight: 400, color: '#e2e8f0', fontSize: '15px' }}>
                    {lang === 'en' ? 'Final Balance' : 'الرصيد النهائي'}
                  </h3>
                  
                  <div className="hero-circle">
                    <h2 style={{ fontSize: '38px', margin: 0, color: '#00ffcc', textShadow: '0 0 15px rgba(0,255,204,0.4)' }}>
                      <bdi>${Math.max(0, budget).toLocaleString()}</bdi>
                    </h2>
                  </div>

                  <h2 style={{ margin: '10px 0 5px 0', fontSize: '22px', color: budget > 0 ? '#00ffcc' : '#ef4444' }}>
                    {budget > 0 ? (lang === 'en' ? 'Season Survived!' : 'موسم ناجح!') : (lang === 'en' ? 'Bankrupt!' : 'إفلاس!')}
                  </h2>
                  
                  <p style={{ margin: 0, fontSize: '13px', color: '#cbd5e1', lineHeight: '1.5' }}>
                    {lang === 'en' 
                      ? <><bdi>{playerName}</bdi>, what a journey across the globe.</> 
                      : <><bdi>{playerName}</bdi>، يا لها من رحلة عبر العالم.</>}
                  </p>
                </div>

                <div className="share-card-right">
                  <h3 style={{ margin: '0 0 15px 0', color: 'white', fontSize: '16px', textAlign: 'center' }}>
                    {lang === 'en' ? 'Season Summary' : 'ملخص الموسم'}
                  </h3>
                  
                  <div className="ledger-item starting-budget">
                    <span>🏦 {lang === 'en' ? 'Starting Budget' : 'الميزانية الأولية'}</span>
                    <strong><bdi>${gameMode.budget.toLocaleString()}</bdi></strong>
                  </div>
                  <div className="ledger-item bonuses">
                    <span>🎯 {lang === 'en' ? 'Bullseye Bonuses' : 'مكافآت الهدف الدقيق'}</span>
                    <strong><bdi>+ ${totalBonuses.toLocaleString()}</bdi></strong>
                  </div>
                  <div className="ledger-item expenses">
                    <span>✈️ {lang === 'en' ? 'Travel Expenses' : 'مصاريف السفر'}</span>
                    <strong><bdi>- ${totalExpenses.toLocaleString()}</bdi></strong>
                  </div>
                  
                  <div className="emoji-display-box" style={{ flexWrap: 'wrap', display: 'flex', justifyContent: 'center', gap: '4px' }}>
                    {paddedHistory.map((emoji, i) => <span key={i}>{emoji}</span>)}
                  </div>

                  <div className="watermark">🌍 Play at <strong>geopitch.gg</strong></div>
                </div>
              </div>

              <div className="action-buttons-wrapper">
                <button className="btn-secondary" style={{ flex: 1 }} onClick={resetToHome}>{lang === 'en' ? 'MAIN MENU' : 'القائمة الرئيسية'}</button>
                <button className="btn-primary" style={{ flex: 2, display: 'flex', gap: '8px', justifyContent: 'center' }} onClick={shareAsImage} disabled={isSharing}>
                  {isSharing ? '...' : (lang === 'en' ? 'SHARE YOUR SCORE' : 'شارك نتيجتك')}
                </button>
              </div>
            </>
          )}

        </div>
      )}
    </div>
  );
}