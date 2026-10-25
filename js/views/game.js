// js/views/game.js

// 1. GEOGRAFINIAI DUOMENYS
// "matchKey" turi tiksliai atitikti raktus tavo logos.json faile.
const CLUBS_GEO_DATA = [
  { matchKey: 'Kauno Žalgiris', name: 'Kauno Žalgiris', country: 'Lietuva', lat: 54.9, lng: 23.9 },
  { matchKey: 'FC Barcelona', name: 'FC Barcelona', country: 'Ispanija', lat: 41.4, lng: 2.2 },
  { matchKey: 'Real Madrid', name: 'Real Madrid', country: 'Ispanija', lat: 40.4, lng: -3.7 },
  { matchKey: 'Olympiacos', name: 'Olympiacos', country: 'Graikija', lat: 37.9, lng: 23.7 },
  { matchKey: 'Fenerbahçe', name: 'Fenerbahçe', country: 'Turkija', lat: 41.0, lng: 29.0 },
  { matchKey: 'Olimpia Milano', name: 'Olimpia Milano', country: 'Italija', lat: 45.5, lng: 9.2 },
  { matchKey: 'Bayern München', name: 'Bayern München', country: 'Vokietija', lat: 48.1, lng: 11.6 },
  { matchKey: 'Paris Basketball', name: 'Paris Basketball', country: 'Prancūzija', lat: 48.9, lng: 2.3 },
  // Gali drąsiai pridėti daugiau klubų iš savo logos.json
];

let currentClub = null;
let score = 0;
let timeLeft = 60;
let timerInterval = null;
let map = null;
let gameActive = false;
let globalLogosData = null;

export async function renderGame(container) {
  // 2. Įkeliame Leaflet CSS ir JS
  if (!document.getElementById('leaflet-css')) {
    const link = document.createElement('link');
    link.id = 'leaflet-css';
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(link);
  }
  if (typeof L === 'undefined') {
    await new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  // 3. Užkrauname logos.json
  // DĖMESIO: Kelias turi būti toks, kad pasiektų šakninį logos.json.
  // Jei game.js yra js/views/ aplanke, reikia eiti dviem lygiais aukštyn.
  try {
    if (!globalLogosData) {
      const response = await fetch('../../logos.json'); 
      if (response.ok) {
        globalLogosData = await response.json();
      } else {
        console.error("Nepavyko rasti logos.json");
        globalLogosData = {};
      }
    }
  } catch (error) {
    console.error("Klaida kraunant logos.json:", error);
    globalLogosData = {};
  }

  // 4. Sukuriame žaidimo HTML
  container.innerHTML = `
    <div id="map-game-container" style="display: flex; flex-direction: column; gap: 1rem;">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <h2>Žaidimas: Klubų geografija</h2>
        <div style="font-weight: bold; font-size: 1.2rem;">
          Laikas: <span id="game-timer" style="color: var(--accent, #f59e0b);">60</span>s | 
          Taškai: <span id="game-score" style="color: var(--accent, #f59e0b);">0</span>
        </div>
      </div>
      <div id="game-map" style="height: 500px; border-radius: 12px; z-index: 1;"></div>
      <div id="game-target" style="text-align: center; padding: 1rem; background: var(--surface, #1e293b); border-radius: 12px; display: flex; flex-direction: column; align-items: center; justify-content: center;">
        <p style="margin-bottom: 0.5rem; color: #94a3b8;">Surask šalį, kurioje įsikūręs šis klubas:</p>
        <div id="current-club-logo" style="height: 100px; display: flex; align-items: center; justify-content: center; margin-bottom: 0.5rem;">
          <span style="font-size: 3rem;">❓</span>
        </div>
        <div id="current-club-name" style="font-size: 1.5rem; font-weight: bold;">Pasiruošk...</div>
      </div>
      <button id="game-start-btn" class="btn-primary" style="padding: 1rem; font-size: 1.2rem; cursor: pointer; background: #3b82f6; color: white; border: none; border-radius: 8px;">Pradėti žaidimą</button>
      <div id="game-result" style="text-align: center; font-size: 1.2rem; margin-top: 1rem; min-height: 24px;"></div>
    </div>
  `;

  const startBtn = document.getElementById('game-start-btn');
  const resultDiv = document.getElementById('game-result');
  const timerSpan = document.getElementById('game-timer');
  const scoreSpan = document.getElementById('game-score');
  const logoDiv = document.getElementById('current-club-logo');
  const nameDiv = document.getElementById('current-club-name');

  // 5. Inicializuojame žemėlapį
  if (map) map.remove();
  map = L.map('game-map', { zoomControl: false }).setView([48.0, 10.0], 4);
  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '© OpenStreetMap, © CARTO'
  }).addTo(map);

  const countryMarkers = {};
  CLUBS_GEO_DATA.forEach(club => {
    if (!countryMarkers[club.country]) {
      const marker = L.circleMarker([club.lat, club.lng], {
        radius: 25,
        fillColor: '#3b82f6',
        color: '#1d4ed8',
        weight: 3,
        opacity: 0.8,
        fillOpacity: 0.4
      }).addTo(map);
      
      marker.on('click', () => {
        if (!gameActive || !currentClub) return;
        
        if (currentClub.country === club.country) {
          score += 10;
          scoreSpan.textContent = score;
          resultDiv.innerHTML = `<span style="color: #22c55e;">✅ Teisingai! +10 tšk.</span>`;
          setTimeout(nextClub, 500);
        } else {
          resultDiv.innerHTML = `<span style="color: #ef4444;">❌ Neteisingai. Tai ${club.country}.</span>`;
          setTimeout(nextClub, 1000);
        }
      });
      
      countryMarkers[club.country] = marker;
    }
  });

  // 6. Logotipo gavimo funkcija (pritaikyta tavo logos.json struktūrai)
  function getLogoUrl(clubName) {
    if (globalLogosData && globalLogosData[clubName]) {
      return globalLogosData[clubName];
    }
    return null;
  }

  function nextClub() {
    if (!gameActive) return;
    
    const randomIndex = Math.floor(Math.random() * CLUBS_GEO_DATA.length);
    currentClub = CLUBS_GEO_DATA[randomIndex];
    nameDiv.textContent = currentClub.name;
    
    const logoUrl = getLogoUrl(currentClub.matchKey);
    if (logoUrl) {
      logoDiv.innerHTML = `<img src="${logoUrl}" alt="${currentClub.name}" style="max-height: 100px; max-width: 150px; object-fit: contain;">`;
    } else {
      logoDiv.innerHTML = `<span style="font-size: 2rem; color: #64748b;">[Nėra logo]</span>`;
    }
  }

  function startGame() {
    score = 0;
    timeLeft = 60;
    gameActive = true;
    scoreSpan.textContent = score;
    timerSpan.textContent = timeLeft;
    resultDiv.innerHTML = '';
    startBtn.disabled = true;
    startBtn.style.opacity = '0.5';
    startBtn.textContent = 'Žaidimas vyksta...';
    
    nextClub();

    if (timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(() => {
      timeLeft--;
      timerSpan.textContent = timeLeft;
      if (timeLeft <= 0) {
        endGame();
      }
    }, 1000);
  }

  function endGame() {
    gameActive = false;
    clearInterval(timerInterval);
    currentClub = null;
    logoDiv.innerHTML = `<span style="font-size: 3rem;">🏁</span>`;
    nameDiv.textContent = 'Žaidimas baigtas!';
    startBtn.disabled = false;
    startBtn.style.opacity = '1';
    startBtn.textContent = 'Žaisti dar kartą';
    resultDiv.innerHTML = `<strong>Galutinis rezultatas: ${score} tšk.</strong>`;
  }

  startBtn.addEventListener('click', startGame);

  return () => {
    if (timerInterval) clearInterval(timerInterval);
    if (map) {
      map.remove();
      map = null;
    }
  };
}
