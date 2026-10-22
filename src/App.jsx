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

// ----------------------------------------------------
// TRANSLATION DICTIONARY
// ----------------------------------------------------
const translations = {
  en: {
    subtitle: "The Ultimate Football Geography Challenge.",
    funDisclaimer: "💸 Virtual budget, 100% real fun!",
    usernamePlaceholder: "Your Username",
    usernameAlert: "Please enter your name first",
    solo: "Solo",
    friends: "Friends",
    soloCareer: "Solo Career",
    matches: "Matches",
    shortDesc: "A quick, high-stakes session. One bad guess could end it all.",
    standardDesc: "The standard tour. Balance your budget and scout carefully.",
    endless: "Endless Survival",
    endlessDesc: "No safety net. Play until you go bankrupt. Build your legacy.",
    back: "Back",
    liveMulti: "Live Multiplayer (Max 4)",
    createRoom: "Create Live Room",
    createRoomDesc: "2-min countdown. Invite up to 3 friends.",
    enterCode: "ENTER CODE",
    join: "JOIN",
    roomFull: "Room is full! (Max 4)",
    matchStarted: "Match already started!",
    roomNotFound: "Room not found or expired.",
    waitFriends: "Waiting for friends...",
    liveLobby: "Live Match Lobby",
    ready: "Ready",
    startMatchNow: "START MATCH NOW",
    waitingHost: "Waiting for host to start...",
    leaveRoom: "LEAVE ROOM",
    budget: "BUDGET:",
    cashOut: "💰 CASH OUT",
    quit: "QUIT",
    clue: "Clue",
    skip: "SKIP",
    confirm: "CONFIRM",
    kmAway: "km away",
    bullseye: "🎯 + $500 BULLSEYE!",
    flight: "Flight",
    viewResults: "VIEW MATCH RESULTS",
    nextFixture: "NEXT FIXTURE ➔",
    finalStandings: "Final Standings",
    you: "(You)",
    returnMain: "RETURN TO MAIN MENU",
    mainMenu: "MAIN MENU",
    dayStreak: "1 Day Streak",
    finalBalance: "Final Balance",
    seasonSurvived: "Season Survived!",
    bankrupt: "Bankrupt!",
    journey: "what a journey across the globe.",
    seasonSummary: "Season Summary",
    startingBudget: "Starting Budget",
    bullseyeBonuses: "Bullseye Bonuses",
    travelExpenses: "Travel Expenses",
    skipsCost: "Skips Cost",
    shareScore: "SHARE YOUR SCORE",
    imageSaved: "Image saved! Share it with your friends.",
    quitGameQ: "Quit Game?",
    quitWarning: "Are you sure you want to quit the current game? Your progress will be lost.",
    cancel: "Cancel"
  },
  ar: {
    subtitle: "التحدي الجغرافي الأكبر لكرة القدم.",
    funDisclaimer: "💸 ميزانية افتراضية، متعة حقيقية 100%!",
    usernamePlaceholder: "اسم المستخدم",
    usernameAlert: "الرجاء إدخال اسمك أولاً",
    solo: "فردي",
    friends: "أصدقاء",
    soloCareer: "مسيرة فردية",
    matches: "مباريات",
    shortDesc: "تحدي سريع ومثير. خطأ واحد قد ينهي كل شيء.",
    standardDesc: "الجولة القياسية. وازن ميزانيتك وابحث بحذر.",
    endless: "بقاء لا نهائي",
    endlessDesc: "لا توجد شبكة أمان. العب حتى تفلس. اصنع أسطورتك.",
    back: "رجوع",
    liveMulti: "لعب جماعي مباشر",
    createRoom: "إنشاء غرفة مباشرة",
    createRoomDesc: "عد تنازلي دقيقتين. ادع حتى 3 أصدقاء.",
    enterCode: "أدخل الرمز",
    join: "انضمام",
    roomFull: "الغرفة ممتلئة! (الحد الأقصى 4)",
    matchStarted: "المباراة بدأت بالفعل!",
    roomNotFound: "الغرفة غير موجودة أو انتهت صلاحيتها.",
    waitFriends: "في انتظار الأصدقاء...",
    liveLobby: "غرفة المباراة المباشرة",
    ready: "جاهز",
    startMatchNow: "ابدأ المباراة الآن",
    waitingHost: "في انتظار المضيف لبدء المباراة...",
    leaveRoom: "مغادرة الغرفة",
    budget: "الميزانية:",
    cashOut: "💰 إنهاء",
    quit: "خروج",
    clue: "دليل",
    skip: "تخطي",
    confirm: "تأكيد",
    kmAway: "كم بعيد",
    bullseye: "🎯 + $500 هدف دقيق!",
    flight: "رحلة",
    viewResults: "عرض نتائج المباراة",
    nextFixture: "➔ المباراة القادمة",
    finalStandings: "الترتيب النهائي",
    you: "(أنت)",
    returnMain: "العودة للقائمة الرئيسية",
    mainMenu: "القائمة الرئيسية",
    dayStreak: "يوم واحد",
    finalBalance: "الرصيد النهائي",
    seasonSurvived: "موسم ناجح!",
    bankrupt: "إفلاس!",
    journey: "يا لها من رحلة عبر العالم.",
    seasonSummary: "ملخص الموسم",
    startingBudget: "الميزانية الأولية",
    bullseyeBonuses: "مكافآت الهدف الدقيق",
    travelExpenses: "مصاريف السفر",
    skipsCost: "تكلفة التخطي",
    shareScore: "شارك نتيجتك",
    imageSaved: "تم حفظ الصورة في جهازك! شاركها.",
    quitGameQ: "الخروج من اللعبة؟",
    quitWarning: "هل أنت متأكد أنك تريد إنهاء اللعبة الحالية؟ سيتم فقدان تقدمك.",
    cancel: "إلغاء"
  },
  es: {
    subtitle: "El Reto Geográfico Definitivo de Fútbol.",
    funDisclaimer: "💸 ¡Presupuesto virtual, diversión 100% real!",
    usernamePlaceholder: "Tu Usuario",
    usernameAlert: "Por favor, introduce tu nombre primero",
    solo: "Solo",
    friends: "Amigos",
    soloCareer: "Carrera en Solitario",
    matches: "Partidos",
    shortDesc: "Una sesión rápida de alto riesgo. Un error podría acabar con todo.",
    standardDesc: "La gira estándar. Equilibra tu presupuesto y explora con cuidado.",
    endless: "Supervivencia",
    endlessDesc: "Sin red de seguridad. Juega hasta quebrar. Construye tu legado.",
    back: "Atrás",
    liveMulti: "Multijugador en Vivo",
    createRoom: "Crear Sala en Vivo",
    createRoomDesc: "Cuenta regresiva de 2 min. Invita hasta 3 amigos.",
    enterCode: "CÓDIGO",
    join: "UNIRSE",
    roomFull: "¡La sala está llena! (Máx 4)",
    matchStarted: "¡El partido ya comenzó!",
    roomNotFound: "Sala no encontrada o caducada.",
    waitFriends: "Esperando amigos...",
    liveLobby: "Sala de Partido en Vivo",
    ready: "Listo",
    startMatchNow: "INICIAR PARTIDO AHORA",
    waitingHost: "Esperando al anfitrión...",
    leaveRoom: "ABANDONAR SALA",
    budget: "PRESUPUESTO:",
    cashOut: "💰 RETIRARSE",
    quit: "SALIR",
    clue: "Pista",
    skip: "SALTAR",
    confirm: "CONFIRMAR",
    kmAway: "km de distancia",
    bullseye: "🎯 ¡+ $500 EN EL BLANCO!",
    flight: "Vuelo",
    viewResults: "VER RESULTADOS",
    nextFixture: "PRÓXIMO PARTIDO ➔",
    finalStandings: "Clasificación Final",
    you: "(Tú)",
    returnMain: "VOLVER AL MENÚ",
    mainMenu: "MENÚ PRINCIPAL",
    dayStreak: "Racha de 1 Día",
    finalBalance: "Saldo Final",
    seasonSurvived: "¡Temporada Sobrevivida!",
    bankrupt: "¡Bancarrota!",
    journey: "qué viaje por el mundo.",
    seasonSummary: "Resumen de la Temporada",
    startingBudget: "Presupuesto Inicial",
    bullseyeBonuses: "Bonos por Acertar",
    travelExpenses: "Gastos de Viaje",
    skipsCost: "Costo de Saltos",
    shareScore: "COMPARTIR PUNTUACIÓN",
    imageSaved: "¡Imagen guardada! Compártela con tus amigos.",
    quitGameQ: "¿Salir del Juego?",
    quitWarning: "¿Seguro que deseas salir? Perderás tu progreso.",
    cancel: "Cancelar"
  },
  fr: {
    subtitle: "L'Ultime Défi Géographique de Football.",
    funDisclaimer: "💸 Budget virtuel, 100% de vrai plaisir !",
    usernamePlaceholder: "Ton Pseudo",
    usernameAlert: "Veuillez d'abord entrer votre nom",
    solo: "Solo",
    friends: "Amis",
    soloCareer: "Carrière Solo",
    matches: "Matchs",
    shortDesc: "Une session rapide à enjeux. Une erreur peut tout ruiner.",
    standardDesc: "La tournée standard. Équilibrez votre budget avec soin.",
    endless: "Survie Sans Fin",
    endlessDesc: "Pas de filet de sécurité. Jouez jusqu'à la faillite.",
    back: "Retour",
    liveMulti: "Multijugador en Direct",
    createRoom: "Créer un Salon",
    createRoomDesc: "Compte à rebours de 2 min. Invitez jusqu'à 3 amis.",
    enterCode: "CODE",
    join: "REJOINDRE",
    roomFull: "Le salon est plein ! (Max 4)",
    matchStarted: "Le match a déjà commencé !",
    roomNotFound: "Salon introuvable ou expiré.",
    waitFriends: "En attente d'amis...",
    liveLobby: "Salon du Match",
    ready: "Prêt",
    startMatchNow: "COMMENCER LE MATCH",
    waitingHost: "En attente de l'hôte...",
    leaveRoom: "QUITTER LE SALON",
    budget: "BUDGET :",
    cashOut: "💰 ENCAISSER",
    quit: "QUITTER",
    clue: "Indice",
    skip: "PASSER",
    confirm: "CONFIRMER",
    kmAway: "km de distance",
    bullseye: "🎯 + 500 $ DANS LE MILLE !",
    flight: "Vol",
    viewResults: "VOIR LES RÉSULTATS",
    nextFixture: "PROCHAIN MATCH ➔",
    finalStandings: "Classement Final",
    you: "(Toi)",
    returnMain: "RETOURNER AU MENU",
    mainMenu: "MENU PRINCIPAL",
    dayStreak: "Série de 1 Jour",
    finalBalance: "Solde Final",
    seasonSurvived: "Saison Survécu !",
    bankrupt: "En Faillite !",
    journey: "quel voyage à travers le monde.",
    seasonSummary: "Résumé de la Saison",
    startingBudget: "Budget de Départ",
    bullseyeBonuses: "Bonus dans le Mille",
    travelExpenses: "Frais de Voyage",
    skipsCost: "Coût des Sauts",
    shareScore: "PARTAGER LE SCORE",
    imageSaved: "Image enregistrée ! Partagez-la avec vos amis.",
    quitGameQ: "Quitter le Jeu ?",
    quitWarning: "Êtes-vous sûr de vouloir quitter la partie ? Votre progression sera perdue.",
    cancel: "Annuler"
  },
  de: {
    subtitle: "Die ultimative Fußball-Geographie-Herausforderung.",
    funDisclaimer: "💸 Virtuelles Budget, 100% echter Spaß!",
    usernamePlaceholder: "Dein Benutzername",
    usernameAlert: "Bitte gib zuerst deinen Namen ein",
    solo: "Solo",
    friends: "Freunde",
    soloCareer: "Solo-Karriere",
    matches: "Spiele",
    shortDesc: "Schnell und riskant. Ein Fehler kann alles beenden.",
    standardDesc: "Die Standardtour. Balanciere dein Budget sorgfältig.",
    endless: "Endloses Überleben",
    endlessDesc: "Kein Sicherheitsnetz. Spiele, bis du bankrott gehst.",
    back: "Zurück",
    liveMulti: "Live-Multiplayer",
    createRoom: "Raum erstellen",
    createRoomDesc: "2-Minuten-Countdown. Lade bis zu 3 Freunde ein.",
    enterCode: "CODE",
    join: "BEITRETEN",
    roomFull: "Raum ist voll! (Max 4)",
    matchStarted: "Spiel hat bereits begonnen!",
    roomNotFound: "Raum nicht gefunden oder abgelaufen.",
    waitFriends: "Warte auf Freunde...",
    liveLobby: "Live-Spiel-Lobby",
    ready: "Bereit",
    startMatchNow: "SPIEL JETZT STARTEN",
    waitingHost: "Warte auf den Host...",
    leaveRoom: "RAUM VERLASSEN",
    budget: "BUDGET:",
    cashOut: "💰 AUSZAHLEN",
    quit: "BEENDEN",
    clue: "Hinweis",
    skip: "ÜBERSPRINGEN",
    confirm: "BESTÄTIGEN",
    kmAway: "km entfernt",
    bullseye: "🎯 + 500 $ VOLLTREFFER!",
    flight: "Flug",
    viewResults: "ERGEBNISSE ANSEHEN",
    nextFixture: "NÄCHSTES SPIEL ➔",
    finalStandings: "Endstand",
    you: "(Du)",
    returnMain: "ZURÜCK ZUM HAUPTMENÜ",
    mainMenu: "HAUPTMENÜ",
    dayStreak: "1 Tag Serie",
    finalBalance: "Endguthaben",
    seasonSurvived: "Saison Überlebt!",
    bankrupt: "Bankrott!",
    journey: "was für eine Reise um die Welt.",
    seasonSummary: "Saison-Zusammenfassung",
    startingBudget: "Startbudget",
    bullseyeBonuses: "Volltreffer-Boni",
    travelExpenses: "Reisekosten",
    skipsCost: "Überspringen-Kosten",
    shareScore: "ERGEBNIS TEILEN",
    imageSaved: "Bild gespeichert! Teile es mit deinen Freunden.",
    quitGameQ: "Spiel beenden?",
    quitWarning: "Bist du sicher, dass du das Spiel beenden möchtest? Dein Fortschritt geht verloren.",
    cancel: "Abbrechen"
  }
};

// Language Configurations for the Dropdown (using SVG flags)
const LANGUAGES = [
  { code: 'en', label: 'EN', flag: 'https://flagcdn.com/gb.svg' },
  { code: 'ar', label: 'AR', flag: 'https://flagcdn.com/sa.svg' },
  { code: 'es', label: 'ES', flag: 'https://flagcdn.com/es.svg' },
  { code: 'fr', label: 'FR', flag: 'https://flagcdn.com/fr.svg' },
  { code: 'de', label: 'DE', flag: 'https://flagcdn.com/de.svg' }
];

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
  premier: { center: [-2.5, 53.0], zoom: 5.5 },  
  laliga: { center: [-4.0, 40.0], zoom: 5.2 },   
  seriea: { center: [12.5, 41.9], zoom: 5.2 },   
  france: { center: [2.2, 46.2], zoom: 5.2 },    
  german: { center: [10.4, 51.1], zoom: 5.3 }    
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
      maxzoom: 19 
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

const QuitConfirmModal = ({ t, lang, onConfirm, onCancel }) => {
  return (
    <div className="ad-modal-overlay" style={{ direction: lang === 'ar' ? 'rtl' : 'ltr' }}>
      <div className="glass-panel ad-modal" style={{ padding: '30px 25px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div className="warning-icon-wrapper">
          <span style={{ fontSize: '32px', display: 'block', lineHeight: 1 }}>⚠️</span>
        </div>
        <h2 style={{ color: 'white', margin: '0 0 10px 0', fontSize: '24px' }}>
          {t('quitGameQ')}
        </h2>
        <p style={{ color: '#cbd5e1', fontSize: '14px', margin: '0 0 25px 0', textAlign: 'center', lineHeight: '1.5' }}>
          {t('quitWarning')}
        </p>
        <div style={{ display: 'flex', gap: '15px', width: '100%' }}>
          <button className="btn-secondary" style={{ flex: 1, margin: 0 }} onClick={onCancel}>
            {t('cancel')}
          </button>
          <button className="btn-danger" style={{ flex: 1, margin: 0 }} onClick={onConfirm}>
            {t('quit')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const [gameState, setGameState] = useState('start');
  const [startMenu, setStartMenu] = useState('main'); 

  // Language & Dropdown State
  const [lang, setLang] = useState('en');
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);
  
  const currentLangObj = LANGUAGES.find(l => l.code === lang) || LANGUAGES[0];
  const t = (key) => translations[lang][key] || translations['en'][key] || key;

  const [playerName, setPlayerName] = useState('');
  const [isNameInvalid, setIsNameInvalid] = useState(false);
  
  const requirePlayerName = () => {
    if (!playerName.trim()) {
      setIsNameInvalid(true);
      setTimeout(() => setIsNameInvalid(false), 400);
      alert(t('usernameAlert'));
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

  const activeModes = getGameModes(selectedLeague);
  const dynamicSkipCost = selectedLeague === 'all' ? 1000 : 300;
  const formatB = (val) => val >= 1000 ? `${val / 1000}k` : val;

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
      if (data.status !== 'waiting') return alert(t('matchStarted'));
      if (Object.keys(data.players || {}).length >= 4) return alert(t('roomFull'));

      const roomModes = getGameModes(data.league || 'all');
      const initialBudget = roomModes.short.budget;

      await update(ref(db, `rooms/${code}/players`), { [playerId]: { name: playerName, score: initialBudget, finished: false } });
      setRoomCode(code); setIsHost(false); setExpiresAt(data.expiresAt);
      setGameState('lobby'); listenToRoom(code);
    } else {
      alert(t('roomNotFound'));
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
    if (Object.keys(livePlayers).length < 2) return alert(t('waitFriends'));
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
    
    const lineDuration = 1200; 
    const cameraDuration = 2500; 
    const cameraDelay = 300; 
    const totalAnimationTime = cameraDuration + cameraDelay;

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

      const lineProgress = Math.min(elapsed / lineDuration, 1);
      setAnimationProgress(Math.floor(lineProgress * fullArcCoords.length));

      if (elapsed < totalAnimationTime) {
        requestAnimationFrame(stepAnimation);
      } else {
        const actualDist = calculateDistance(guessCoords.lat, guessCoords.lng, currentDestination.latitude, currentDestination.longitude);
        setDistanceError(actualDist);
        
        const isGlobal = selectedLeague === 'all';
        const penaltyMultiplier = isGlobal ? 1 : 10; 
        
        let cost = actualDist * penaltyMultiplier;
        
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
        
        alert(t('imageSaved'));
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

      {showQuitModal && <QuitConfirmModal t={t} lang={lang} onConfirm={confirmQuit} onCancel={() => setShowQuitModal(false)} />}

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
            
            {/* ROBUST LANGUAGE DROPDOWN */}
            <div style={{ position: 'absolute', top: 20, right: 20, zIndex: 50 }}>
              <button 
                className="lang-toggle-btn"
                style={{ 
                  display: 'flex', alignItems: 'center', gap: '8px', 
                  background: 'rgba(15, 23, 42, 0.75)', border: '1px solid rgba(255,255,255,0.2)', 
                  color: 'white', padding: '8px 12px', backdropFilter: 'blur(10px)', 
                  borderRadius: '8px', cursor: 'pointer'
                }}
                onClick={(e) => { e.stopPropagation(); setIsLangDropdownOpen(prev => !prev); }}
              >
                <img src={currentLangObj.flag} alt={currentLangObj.code} style={{ width: '20px', borderRadius: '2px', pointerEvents: 'none' }} />
                <span style={{ fontWeight: 'bold', pointerEvents: 'none' }}>{currentLangObj.label}</span>
                <span style={{ fontSize: '10px', pointerEvents: 'none' }}>▼</span>
              </button>

              {isLangDropdownOpen && (
                <>
                  {/* Invisible overlay captures clicks outside to close the menu instantly */}
                  <div 
                    style={{ position: 'fixed', inset: 0, zIndex: 40 }} 
                    onClick={() => setIsLangDropdownOpen(false)} 
                  />
                  <div style={{ 
                    position: 'absolute', top: '100%', right: 0, marginTop: '8px', 
                    background: 'rgba(15, 23, 42, 0.95)', border: '1px solid rgba(255,255,255,0.1)', 
                    borderRadius: '8px', overflow: 'hidden', display: 'flex', flexDirection: 'column', 
                    width: '100%', boxShadow: '0 4px 15px rgba(0,0,0,0.5)', zIndex: 50
                  }}>
                    {LANGUAGES.map(l => (
                      <button
                        key={l.code}
                        onClick={() => { setLang(l.code); setIsLangDropdownOpen(false); }}
                        style={{ 
                          display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 12px', 
                          background: lang === l.code ? 'rgba(0, 255, 204, 0.15)' : 'transparent', 
                          border: 'none', color: lang === l.code ? '#00ffcc' : 'white', 
                          cursor: 'pointer', textAlign: 'left', width: '100%', transition: 'background 0.2s'
                        }}
                        onMouseOver={(e) => { if(lang !== l.code) e.currentTarget.style.background = 'rgba(255,255,255,0.1)' }}
                        onMouseOut={(e) => { if(lang !== l.code) e.currentTarget.style.background = 'transparent' }}
                      >
                        <img src={l.flag} alt={l.code} style={{ width: '20px', borderRadius: '2px', pointerEvents: 'none' }} />
                        <span style={{ fontWeight: 'bold', pointerEvents: 'none' }}>{l.label}</span>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
            
            <div className="glass-panel start-modal" style={{ margin: 'auto', marginTop: '10vh', direction: lang === 'ar' ? 'rtl' : 'ltr' }}>
              <h1 className="neon-text" style={{ fontSize: '46px', letterSpacing: '-1px', marginBottom: '5px', textAlign: 'center' }}>GeoPitch</h1>
              <p style={{ color: '#94a3b8', marginBottom: '15px', fontSize: '15px', textAlign: 'center' }}>{t('subtitle')}</p>
              
              <div className="fun-disclaimer">{t('funDisclaimer')}</div>
              
              <input 
                type="text" className="start-input" 
                placeholder={t('usernamePlaceholder')} 
                value={playerName} onChange={handleNameChange}
                style={{ borderColor: isNameInvalid ? '#ef4444' : '', transition: 'border-color 0.2s ease-in-out', marginBottom: '15px' }}
              />

              {startMenu === 'main' && (
                <>
                  <div className="glass-divider" style={{ margin: '0 0 15px 0' }}></div>

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

                  <div className="mode-toggle-wrapper" style={{ display: 'flex', alignItems: 'center' }}>
                    <button className="btn-toggle solo" onClick={() => handleMenuClick('solo')}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transition: 'all 0.3s ease', opacity: 0.9 }}>
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                      </svg>
                      <span>{t('solo')}</span>
                    </button>

                    <div style={{ width: '1px', height: '24px', background: 'rgba(255, 255, 255, 0.15)', margin: '0 2px' }}></div>
                    
                    <button className="btn-toggle multi" onClick={() => handleMenuClick('multi')}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transition: 'all 0.3s ease', opacity: 0.9 }}>
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                        <circle cx="9" cy="7" r="4"></circle>
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                      </svg>
                      <span>{t('friends')}</span>
                    </button>
                  </div>
                </>
              )}

              {startMenu === 'solo' && (
                <div className="modes-container">
                  <div style={{ textAlign: 'center', marginBottom: '10px' }}><h3 style={{ color: '#cbd5e1', fontSize: '12px', textTransform: 'uppercase', margin: '0' }}>{t('soloCareer')}</h3></div>
                  <button className="mode-card" onClick={() => startGame('short')}><span className="mode-icon">⚡</span><div className="mode-text"><h4><bdi>{activeModes.short.matches}</bdi> {t('matches')} • <bdi>${formatB(activeModes.short.budget)}</bdi></h4><p>{t('shortDesc')}</p></div></button>
                  <button className="mode-card" onClick={() => startGame('standard')}><span className="mode-icon">🌍</span><div className="mode-text"><h4><bdi>{activeModes.standard.matches}</bdi> {t('matches')} • <bdi>${formatB(activeModes.standard.budget)}</bdi></h4><p>{t('standardDesc')}</p></div></button>
                  <button className="mode-card" onClick={() => startGame('endless')}><span className="mode-icon">♾️</span><div className="mode-text"><h4>{t('endless')} • <bdi>${formatB(activeModes.endless.budget)}</bdi></h4><p>{t('endlessDesc')}</p></div></button>
                  
                  <button className="btn-secondary" onClick={() => setStartMenu('main')} style={{ marginTop: '10px' }}>{t('back')}</button>
                </div>
              )}

              {startMenu === 'multi' && (
                <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  <div style={{ textAlign: 'center', marginBottom: '5px' }}><h3 style={{ color: '#00ffcc', fontSize: '12px', textTransform: 'uppercase', margin: '0' }}>{t('liveMulti')}</h3></div>
                  <button className="mode-card" onClick={createLiveRoom} style={{ background: 'rgba(0, 255, 204, 0.05)', borderColor: 'rgba(0, 255, 204, 0.2)' }}><span className="mode-icon">🏟️</span><div className="mode-text"><h4 style={{ color: '#00ffcc' }}>{t('createRoom')}</h4><p>{t('createRoomDesc')}</p></div></button>
                  <div style={{ display: 'flex', gap: '10px', marginTop: '5px', direction: lang === 'ar' ? 'rtl' : 'ltr' }}>
                    <input type="text" placeholder={t('enterCode')} value={joinCodeInput} onChange={(e) => setJoinCodeInput(e.target.value)} style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.2)', background: 'rgba(0,0,0,0.5)', color: 'white', textAlign: 'center', fontWeight: 'bold', textTransform: 'uppercase', outline: 'none' }}/>
                    <button className="btn-primary" style={{ padding: '10px 20px', borderRadius: '8px' }} onClick={joinLiveRoom}>{t('join')}</button>
                  </div>
                  
                  <button className="btn-secondary" onClick={() => setStartMenu('main')} style={{ marginTop: '10px' }}>{t('back')}</button>
                </div>
              )}
            </div>
          </div>
        )}

        {gameState === 'lobby' && (
          <div className="lobby-screen" style={{ pointerEvents: 'auto', direction: lang === 'ar' ? 'rtl' : 'ltr', width: '100%', height: '100%' }}>
            <h2 style={{ margin: 0, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '2px' }}>{t('liveLobby')}</h2>
            <div className="room-code-box">{roomCode}</div>
            <div className="timer-text" style={{ color: timeLeft <= 10 ? '#ef4444' : '#00ffcc' }}>⏳ {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</div>
            <div className="player-list">
              {Object.values(livePlayers).map((p, i) => (<div className="player-row" key={i}><span style={{ fontWeight: 'bold' }}>{p.name}</span><span>✅ {t('ready')}</span></div>))}
            </div>
            <div style={{ marginTop: '20px', textAlign: 'center' }}>
              {isHost ? (<button className="btn-primary" onClick={startLiveMatch} style={{ width: '300px' }}>{t('startMatchNow')}</button>) : (<p style={{ color: '#cbd5e1', fontStyle: 'italic' }}>{t('waitingHost')}</p>)}
              <br /><button className="btn-secondary" style={{ marginTop: '15px', width: '300px' }} onClick={resetToHome}>{t('leaveRoom')}</button>
            </div>
          </div>
        )}

        {isMapVisible && (
          <div style={{ pointerEvents: 'none', position: 'absolute', inset: 0 }}>
            <div className="geosports-dashboard" style={{ pointerEvents: 'auto', direction: lang === 'ar' ? 'rtl' : 'ltr' }}>
              <div className="dash-top-bar">
                <span className="dash-brand">GeoPitch</span>
                <div className="dash-budget-inline">
                  <span className="dash-label-inline">{t('budget')}</span>
                  <span className="dash-value-inline" style={{ color: budget > 0 ? '#00ffcc' : '#ef4444' }}>${budget.toLocaleString()}</span>
                </div>
                {gameMode.id === 'endless' && matchHistory.length > 0 ? (
                  <button className="dash-cashout" onClick={handleCashOut}>{t('cashOut')}</button>
                ) : (
                  <button className="dash-quit" onClick={() => setShowQuitModal(true)}>{t('quit')}</button>
                )}
              </div>
              
              {currentDestination && (
                <div className="dash-clue-wrapper">
                  <div className="dash-clue-header" onClick={() => setIsClueExpanded(!isClueExpanded)}>
                    <span>{t('clue')} {currentIndex + 1}{gameMode.matches !== Infinity ? ` / ${gameMode.matches}` : ''}</span>
                    <span className={`dropdown-icon ${isClueExpanded ? 'open' : ''}`}>▼</span>
                  </div>
                  {isClueExpanded && (<div className="dash-clue-content fade-in"><p className="dash-clue-text">"{currentDestination.clue[lang] || currentDestination.clue.en}"</p></div>)}
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
                      {t('skip')}
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
                      {t('confirm')}
                    </button>
                  )}
                </div>
              )}

              {gameState === 'locked' && distanceError !== null && (
                <div className="glass-panel results-modal" style={{ direction: lang === 'ar' ? 'rtl' : 'ltr', pointerEvents: 'auto' }}>
                  
                  <div className="results-header" style={{ flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                      <span style={{ fontSize: '18px', color: 'white' }}>
                        📏 <b>{distanceError.toLocaleString()} {t('kmAway')}</b>
                      </span>
                      <span style={{ fontSize: '18px', color: moneyCost < 0 ? '#00ffcc' : '#ef4444', fontWeight: 'bold' }}>
                        {moneyCost < 0 
                          ? t('bullseye')
                          : `- $${moneyCost.toLocaleString()} ${t('flight')}`}
                      </span>
                    </div>
                  </div>

                  <h3 className="neon-text" style={{ fontSize: '22px', marginBottom: '20px' }}>
                    {currentDestination.answer[lang] || currentDestination.answer.en}
                  </h3>
                  
                  <button className="btn-secondary" onClick={handleNextDestination}>
                    {currentIndex + 1 >= gameMode.matches || budget <= 0 || currentIndex + 1 >= sessionData.length 
                      ? t('viewResults')
                      : t('nextFixture')}
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
                <h2 style={{ color: 'white', marginBottom: '25px', fontSize: '28px' }}>🏆 {t('finalStandings')}</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '30px' }}>
                  {Object.entries(livePlayers).sort((a, b) => b[1].score - a[1].score).map(([id, player], index) => (
                      <div key={id} className={`podium-row place-${index + 1}`}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}><span className="rank">#{index + 1}</span><span className="name">{player.name} {id === playerId ? t('you') : ''}</span></div>
                        <div className="score" style={{ color: player.score <= 0 ? '#ef4444' : 'inherit' }}>${Math.max(0, player.score).toLocaleString()} {player.finished ? '' : '⏳'}</div>
                      </div>
                  ))}
                </div>
                <button className="btn-secondary" onClick={resetToHome}>{t('returnMain')}</button>
              </div>
            ) : (
              <>
                <div ref={shareCardRef} className="share-card-container">
                  <div className="share-card-left">
                    <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginBottom: '15px', alignItems: 'center' }}>
                      <span className="badge-glass">🗓️ <bdi>{getFormattedDate()}</bdi></span>
                      <span className="streak-text-only hide-on-mobile">🔥 {t('dayStreak')}</span>
                      <span className="hide-on-desktop" style={{ color: budget > 0 ? '#00ffcc' : '#ef4444', fontWeight: 'bold', fontSize: '15px', letterSpacing: '1px' }}>💰 <bdi>${Math.max(0, budget).toLocaleString()}</bdi></span>
                    </div>
                    <h3 className="hide-on-mobile" style={{ margin: '0 0 10px 0', fontWeight: 400, color: '#e2e8f0', fontSize: '15px' }}>{t('finalBalance')}</h3>
                    <div className="hero-circle hide-on-mobile"><h2 style={{ fontSize: '38px', margin: 0, color: '#00ffcc', textShadow: '0 0 15px rgba(0,255,204,0.4)' }}><bdi>${Math.max(0, budget).toLocaleString()}</bdi></h2></div>
                    <h2 style={{ margin: '10px 0 5px 0', fontSize: '22px', color: budget > 0 ? '#00ffcc' : '#ef4444' }}>{budget > 0 ? t('seasonSurvived') : t('bankrupt')}</h2>
                    <p style={{ margin: 0, fontSize: '13px', color: '#cbd5e1', lineHeight: '1.5' }}><bdi>{playerName}</bdi>, {t('journey')}</p>
                  </div>

                  <div className="share-card-right">
                    <h3 style={{ margin: '0 0 15px 0', color: 'white', fontSize: '16px', textAlign: 'center' }}>{t('seasonSummary')}</h3>
                    <div className="ledger-item starting-budget"><span>🏦 {t('startingBudget')}</span><strong><bdi>${gameMode.budget.toLocaleString()}</bdi></strong></div>
                    <div className="ledger-item bonuses"><span>🎯 {t('bullseyeBonuses')}</span><strong><bdi>+ ${totalBonuses.toLocaleString()}</bdi></strong></div>
                    <div className="ledger-item expenses"><span>✈️ {t('travelExpenses')}</span><strong><bdi>- ${totalExpenses.toLocaleString()}</bdi></strong></div>

                    {totalSkipCost > 0 && (
                      <div className="ledger-item expenses" style={{ background: 'rgba(245, 158, 11, 0.08)', borderLeft: '3px solid #f59e0b', color: '#fcd34d' }}>
                        <span>⏭️ {t('skipsCost')}</span>
                        <strong><bdi>- ${totalSkipCost.toLocaleString()}</bdi></strong>
                      </div>
                    )}

                    <div className="emoji-display-box" style={{ flexWrap: 'wrap', display: 'flex', justifyContent: 'center', gap: '4px' }}>{paddedHistory.map((emoji, i) => <span key={i}>{emoji}</span>)}</div>
                    <div className="watermark">🌍 Play at <strong>geopitch.gg</strong></div>
                  </div>
                </div>

                <div className="action-buttons-wrapper">
                  <button className="btn-secondary" style={{ flex: 1 }} onClick={resetToHome}>{t('mainMenu')}</button>
                  <button className="btn-primary" style={{ flex: 2, display: 'flex', gap: '8px', justifyContent: 'center' }} onClick={shareAsImage} disabled={isSharing}>{isSharing ? '...' : t('shareScore')}</button>
                </div>
              </>
            )}
          </div>
        )}

      </div>
    </div>
  );
}