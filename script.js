/* ═══════════════════════════════════════════════════════════
   JJK — Frontend Script
   Handles: Nav, Weather, News, Canvas particles, Clock
═══════════════════════════════════════════════════════════ */

const API_BASE = "https://jjk-1.onrender.com/";
 // Relative — served by Express; change to http://localhost:5000 for separate dev

/* ═══════════════════════════════════════════════════════════
   1. LIVE CLOCK
═══════════════════════════════════════════════════════════ */
function updateClock() {
  const el = document.getElementById("clock");
  if (!el) return;
  el.textContent = new Date().toLocaleTimeString("en-US", { hour12: false });
}
updateClock();
setInterval(updateClock, 1000);

/* ═══════════════════════════════════════════════════════════
   2. PARTICLE CANVAS (cursed energy background)
═══════════════════════════════════════════════════════════ */
(function initCanvas() {
  const canvas = document.getElementById("bg-canvas");
  const ctx    = canvas.getContext("2d");
  let W, H, particles = [];

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener("resize", () => { resize(); spawnParticles(); });

  function rand(a, b) { return a + Math.random() * (b - a); }

  function Particle() {
    this.reset = function () {
      this.x  = rand(0, W);
      this.y  = rand(0, H);
      this.r  = rand(0.4, 1.8);
      this.vx = rand(-0.25, 0.25);
      this.vy = rand(-0.5, -0.1);
      this.life = 1;
      this.decay = rand(0.002, 0.006);
      // Gold or warm amber for light theme
      const t  = Math.random();
      this.hue = t > 0.5 ? `rgba(184,146,42,` : `rgba(155,74,42,`;
    };
    this.reset();
    this.y = rand(0, H); // scatter initially
  }

  function spawnParticles() {
    const count = Math.floor(W * H / 6000);
    particles = Array.from({ length: count }, () => new Particle());
  }
  spawnParticles();

  function draw() {
    ctx.clearRect(0, 0, W, H);
    for (const p of particles) {
      p.x += p.vx;
      p.y += p.vy;
      p.life -= p.decay;
      if (p.life <= 0 || p.y < -10) p.reset();

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `${p.hue}${p.life.toFixed(2)})`;
      ctx.fill();
    }
    requestAnimationFrame(draw);
  }
  draw();
})();

/* ═══════════════════════════════════════════════════════════
   3. NAVIGATION TABS
═══════════════════════════════════════════════════════════ */
let activeTab = "weather";

document.querySelectorAll(".nav-tab").forEach(btn => {
  btn.addEventListener("click", () => {
    const tab = btn.dataset.tab;
    if (tab === activeTab) return;
    activeTab = tab;

    document.querySelectorAll(".nav-tab").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    document.querySelectorAll(".section").forEach(s => s.classList.remove("active"));
    document.getElementById(`section-${tab}`).classList.add("active");

    // Lazy-load news on first visit
    if (tab === "news" && !newsLoaded) fetchNews();
  });
});

/* ═══════════════════════════════════════════════════════════
   4. WEATHER
═══════════════════════════════════════════════════════════ */
let weatherLoaded = false;

async function fetchWeather(city = "Hyderabad") {
  const container = document.getElementById("weather-content");
  container.innerHTML = loadingHTML("FETCHING WEATHER…");

  try {
    const [weatherRes, forecastRes] = await Promise.all([
      fetch(`${API_BASE}/api/weather?city=${encodeURIComponent(city)}`),
      fetch(`${API_BASE}/api/forecast?city=${encodeURIComponent(city)}`),
    ]);

    if (!weatherRes.ok) {
      const err = await weatherRes.json();
      throw new Error(err.error || "Failed to load weather");
    }

    const weather  = await weatherRes.json();
    const forecast = forecastRes.ok ? await forecastRes.json() : null;

    container.innerHTML = buildWeatherHTML(weather, forecast);
    weatherLoaded = true;
  } catch (err) {
    container.innerHTML = errorHTML(err.message);
  }
}

function buildWeatherHTML(w, f) {
  const iconUrl = `https://openweathermap.org/img/wn/${w.icon}@2x.png`;
  const days    = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

  const forecastCards = (f && f.forecast) ? f.forecast.map(d => {
    const dt  = new Date(d.date);
    const day = days[dt.getUTCDay()];
    return `
      <div class="forecast-card">
        <div class="forecast-day">${day}</div>
        <img class="forecast-icon" src="https://openweathermap.org/img/wn/${d.icon}.png" alt="${d.description}" />
        <div class="forecast-temps">
          <span class="forecast-high">${d.temp_max}°</span>
          <span class="forecast-low">${d.temp_min}°</span>
        </div>
        <div class="forecast-desc">${d.description}</div>
      </div>`;
  }).join("") : "";

  return `
    <div class="weather-hero">
      <!-- Main card -->
      <div class="weather-card">
        <div class="weather-main">
          <img class="weather-icon-img" src="${iconUrl}" alt="${w.description}" />
          <div>
            <div class="weather-temp">${w.temperature}<span class="weather-unit">°C</span></div>
            <div class="weather-city">${w.city}, ${w.country}</div>
            <div class="weather-desc">${w.description}</div>
          </div>
        </div>
      </div>

      <!-- Stats card -->
      <div class="weather-card">
        <div class="weather-stats">
          <div class="stat-item">
            <div class="stat-label">Feels Like</div>
            <div class="stat-value">${w.feels_like}°C</div>
          </div>
          <div class="stat-item">
            <div class="stat-label">Humidity</div>
            <div class="stat-value">${w.humidity}%</div>
          </div>
          <div class="stat-item">
            <div class="stat-label">Wind Speed</div>
            <div class="stat-value">${w.wind_speed} <span class="stat-sub">m/s</span></div>
          </div>
          <div class="stat-item">
            <div class="stat-label">Pressure</div>
            <div class="stat-value">${w.pressure} <span class="stat-sub">hPa</span></div>
          </div>
          <div class="stat-item">
            <div class="stat-label">Visibility</div>
            <div class="stat-value">${w.visibility} <span class="stat-sub">km</span></div>
          </div>
          <div class="stat-item">
            <div class="stat-label">Sunrise / Sunset</div>
            <div class="stat-value" style="font-size:0.95rem">${w.sunrise}</div>
            <div class="stat-sub">${w.sunset}</div>
          </div>
        </div>
      </div>
    </div>

    ${forecastCards ? `
    <div class="section-title" style="margin-top:1.5rem">5-DAY FORECAST</div>
    <div class="forecast-strip gap-section">${forecastCards}</div>
    ` : ""}
  `;
}

// Search binding
document.getElementById("weather-search-btn").addEventListener("click", () => {
  const city = document.getElementById("city-input").value.trim();
  if (city) fetchWeather(city);
});

document.getElementById("city-input").addEventListener("keydown", e => {
  if (e.key === "Enter") {
    const city = e.target.value.trim();
    if (city) fetchWeather(city);
  }
});

// Auto-load weather on start
fetchWeather("Hyderabad");

/* ═══════════════════════════════════════════════════════════
   5. NEWS
═══════════════════════════════════════════════════════════ */
let newsLoaded    = false;
let activeCategory = "technology";

async function fetchNews(category = activeCategory, query = "") {
  const container = document.getElementById("news-content");
  container.innerHTML = loadingHTML("LOADING NEWS FEED…");

  try {
    let url = `${API_BASE}/api/news?category=${encodeURIComponent(category)}`;
    if (query) url += `&query=${encodeURIComponent(query)}`;

    const res = await fetch(url);
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Failed to load news");
    }

    const data = await res.json();
    if (!data.articles || data.articles.length === 0) {
      container.innerHTML = errorHTML("No articles found for this query.", "info");
      return;
    }

    container.innerHTML = buildNewsHTML(data.articles);
    newsLoaded = true;
  } catch (err) {
    container.innerHTML = errorHTML(err.message);
  }
}

function buildNewsHTML(articles) {
  const cards = articles.map(a => {
    const imgEl = a.image
      ? `<img class="news-card-img" src="${escHtml(a.image)}" alt="" loading="lazy" onerror="this.parentElement.innerHTML=placeholderImg()" />`
      : `<div class="news-card-img-placeholder">${newsSVGIcon()}</div>`;

    const dateStr = a.publishedAt
      ? new Date(a.publishedAt).toLocaleDateString("en-US", { month:"short", day:"numeric", year:"numeric" })
      : "";

    return `
      <a class="news-card" href="${escHtml(a.url)}" target="_blank" rel="noopener noreferrer">
        ${imgEl}
        <div class="news-card-body">
          <div class="news-meta">
            <span class="news-source">${escHtml(a.source)}</span>
            <span class="news-category-tag">${escHtml(a.category)}</span>
          </div>
          <div class="news-title">${escHtml(a.title)}</div>
          <div class="news-desc">${escHtml(a.description)}</div>
          ${dateStr ? `<div class="news-date">${dateStr}</div>` : ""}
        </div>
      </a>`;
  }).join("");

  return `<div class="news-grid">${cards}</div>`;
}

// Category pills
document.querySelectorAll(".pill").forEach(pill => {
  pill.addEventListener("click", () => {
    document.querySelectorAll(".pill").forEach(p => p.classList.remove("active"));
    pill.classList.add("active");
    activeCategory = pill.dataset.category;
    document.getElementById("news-query-input").value = "";
    fetchNews(activeCategory);
  });
});

// News search
document.getElementById("news-search-btn").addEventListener("click", () => {
  const q = document.getElementById("news-query-input").value.trim();
  fetchNews(activeCategory, q);
});

document.getElementById("news-query-input").addEventListener("keydown", e => {
  if (e.key === "Enter") {
    const q = e.target.value.trim();
    fetchNews(activeCategory, q);
  }
});

/* ═══════════════════════════════════════════════════════════
   6. UTILITIES
═══════════════════════════════════════════════════════════ */
function loadingHTML(msg = "LOADING…") {
  return `
    <div class="loading-overlay">
      <div class="cursed-spinner"></div>
      <div class="loading-text">${msg}</div>
    </div>`;
}

function errorHTML(msg, type = "error") {
  const icon = type === "info" ? "ℹ️" : "⚠️";
  return `<div class="error-box">${icon} ${escHtml(msg)}</div>`;
}

function escHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g,"&amp;")
    .replace(/</g,"&lt;")
    .replace(/>/g,"&gt;")
    .replace(/"/g,"&quot;");
}

function newsSVGIcon() {
  return `<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#4a6278" stroke-width="1.5">
    <path d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10l6 6v8a2 2 0 01-2 2z"/>
    <path d="M17 20v-8H7v8M7 4v4h8"/>
  </svg>`;
}

// Called inline for broken images — must be global
window.placeholderImg = function() {
  return `<div class="news-card-img-placeholder">${newsSVGIcon()}</div>`;
};
