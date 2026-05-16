// ─────────────────────────────────────────────────────────────
//  JJK — Backend API Proxy Server
//  Fetches Weather & News from public APIs and serves frontend
// ─────────────────────────────────────────────────────────────

require("dotenv").config();
const express = require("express");
const axios = require("axios");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 5000;

// ── Middleware ────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// Serve static frontend files
app.use(express.static(path.join(__dirname, "../frontend")));

// ── API Keys ─────────────────────────────────────────────────
const WEATHER_API_KEY = process.env.WEATHER_API_KEY || "";
const NEWS_API_KEY    = process.env.NEWS_API_KEY    || "";

// ─────────────────────────────────────────────────────────────
//  ROUTE: GET /api/weather?city=CityName
//  Proxy to OpenWeatherMap current weather
// ─────────────────────────────────────────────────────────────
app.get("/api/weather", async (req, res) => {
  const city = req.query.city || "Hyderabad";

  if (!WEATHER_API_KEY) {
    return res.status(500).json({ error: "Weather API key not configured. Add WEATHER_API_KEY to .env" });
  }

  try {
    const url = `https://api.openweathermap.org/data/2.5/weather`;
    const response = await axios.get(url, {
      params: {
        q:     city,
        appid: WEATHER_API_KEY,
        units: "metric",
      },
    });

    const d = response.data;
    res.json({
      city:        d.name,
      country:     d.sys.country,
      temperature: Math.round(d.main.temp),
      feels_like:  Math.round(d.main.feels_like),
      humidity:    d.main.humidity,
      pressure:    d.main.pressure,
      wind_speed:  d.wind.speed,
      description: d.weather[0].description,
      icon:        d.weather[0].icon,
      main:        d.weather[0].main,
      visibility:  d.visibility / 1000,           // km
      sunrise:     new Date(d.sys.sunrise * 1000).toLocaleTimeString(),
      sunset:      new Date(d.sys.sunset  * 1000).toLocaleTimeString(),
    });
  } catch (err) {
    const status  = err.response?.status || 500;
    const message = err.response?.data?.message || "Failed to fetch weather data";
    res.status(status).json({ error: message });
  }
});

// ─────────────────────────────────────────────────────────────
//  ROUTE: GET /api/news?query=keyword&category=technology
//  Proxy to NewsData.io latest news
// ─────────────────────────────────────────────────────────────
app.get("/api/news", async (req, res) => {
  const query    = req.query.query    || "";
  const category = req.query.category || "technology";
  const language = req.query.language || "en";

  if (!NEWS_API_KEY) {
    return res.status(500).json({ error: "News API key not configured. Add NEWS_API_KEY to .env" });
  }

  try {
    const url = `https://newsdata.io/api/1/news`;
    const params = {
      apikey:   NEWS_API_KEY,
      language: language,
    };
    if (query)    params.q        = query;
    if (category) params.category = category;

    const response = await axios.get(url, { params });
    const articles = (response.data.results || [])
      .filter(a => a.title && a.link)
      .slice(0, 12)
      .map(a => ({
        title:       a.title,
        description: a.description || "No description available.",
        url:         a.link,
        source:      a.source_id  || "Unknown",
        image:       a.image_url  || null,
        publishedAt: a.pubDate    || null,
        category:    a.category?.[0] || category,
      }));

    res.json({ articles, totalResults: articles.length });
  } catch (err) {
    const status  = err.response?.status || 500;
    const message = err.response?.data?.message || "Failed to fetch news data";
    res.status(status).json({ error: message });
  }
});

// ─────────────────────────────────────────────────────────────
//  ROUTE: GET /api/forecast?city=CityName
//  5-day weather forecast via OpenWeatherMap
// ─────────────────────────────────────────────────────────────
app.get("/api/forecast", async (req, res) => {
  const city = req.query.city || "Hyderabad";

  if (!WEATHER_API_KEY) {
    return res.status(500).json({ error: "Weather API key not configured." });
  }

  try {
    const url = `https://api.openweathermap.org/data/2.5/forecast`;
    const response = await axios.get(url, {
      params: { q: city, appid: WEATHER_API_KEY, units: "metric", cnt: 40 },
    });

    // Pick one entry per day (noon forecast)
    const seen = new Set();
    const daily = response.data.list
      .filter(item => {
        const day = item.dt_txt.split(" ")[0];
        if (!seen.has(day)) { seen.add(day); return true; }
        return false;
      })
      .slice(0, 5)
      .map(item => ({
        date:        item.dt_txt.split(" ")[0],
        temp_max:    Math.round(item.main.temp_max),
        temp_min:    Math.round(item.main.temp_min),
        description: item.weather[0].description,
        icon:        item.weather[0].icon,
      }));

    res.json({ city, forecast: daily });
  } catch (err) {
    const status  = err.response?.status || 500;
    const message = err.response?.data?.message || "Failed to fetch forecast";
    res.status(status).json({ error: message });
  }
});

// ─────────────────────────────────────────────────────────────
//  ROUTE: GET /health
// ─────────────────────────────────────────────────────────────
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    server: "JJK API Server",
    weather_key_set: !!WEATHER_API_KEY,
    news_key_set:    !!NEWS_API_KEY,
    timestamp: new Date().toISOString(),
  });
});

// Catch-all: serve frontend index
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/index.html"));
});

// ── Start Server ──────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n ╔══════════════════════════════════════╗`);
  console.log(` ║   JJK API Server running on :${PORT}   ║`);
  console.log(` ╚══════════════════════════════════════╝\n`);
  console.log(` → Weather key : ${WEATHER_API_KEY ? "✓ Set" : "✗ Missing"}`);
  console.log(` → News key    : ${NEWS_API_KEY    ? "✓ Set" : "✗ Missing"}`);
  console.log(`\n Open http://localhost:${PORT} in your browser\n`);
});
