Company name: CODTECH IT SOLUTIONS 
Name: Dakoju Meghana
Intern ID: CTIS8959
Domain: Full stack web development
Duration: 4 weeks
Mentor: Neels Santhosh Kumar
# JJK — Live Intelligence Dashboard
### CodTech Internship | Full Stack | Task 1 — API Integration

---
## 🌐 Overview
**JJK** is a responsive, full-stack web application that fetches and displays live data from two public APIs:
| Feature | API Used |
|---|---|
| ⛅ **Weather** (current + 5-day forecast) | [OpenWeatherMap](https://openweathermap.org/api) |
| 📡 **News Feed** (by category & search) | [NewsData.io](https://newsdata.io) |
---
## 📁 Project Structure
```
JJK/
├── backend/
│   ├── server.js          ← Express API proxy server
│   ├── package.json
│   └── .env.example       ← Copy this → .env and add your keys
└── frontend/
    ├── index.html         ← Single-page responsive UI
    ├── style.css          ← Full custom styling (dark theme)
    └── script.js          ← JS: API calls, canvas animation, interactions
```

---
## 🔑 Getting API Keys (Free)
### 1. OpenWeatherMap (Weather)
1. Sign up at → https://openweathermap.org/api
2. Go to **API Keys** tab in your account
3. Copy your key
### 2. NewsData.io (News)
1. Sign up at → https://newsdata.io
2. Go to **Dashboard** → copy your API key
## ⚙️ Setup & Run
### Step 1 — Install dependencies
```bash
cd backend
npm install
```
### Step 2 — Configure environment
```bash
# Copy the example env file
cp .env.example .env
# Edit .env and fill in your API keys:
WEATHER_API_KEY=your_openweathermap_key_here
NEWS_API_KEY=your_newsdata_key_here
PORT=5000
```
### Step 3 — Start the server
```bash
# Production
npm start
# Development (auto-reload)
npm run dev
```
### Step 4 — Open the app
```
http://localhost:5000
```
## 🎨 Features
- **Weather Tab**
  - Search any city worldwide
  - Current conditions: temp, humidity, wind, pressure, visibility
  - 5-day daily forecast strip
  - Weather icons from OpenWeatherMap
- **News Tab**
  - Category filter pills: Technology, Science, Business, Sports, Entertainment, Health, World
  - Keyword search within category
  - Responsive card grid with images, source, date
  - Click any card to open full article
- **UI / UX**
  - Dark anime-inspired aesthetic (JJK theme)
  - Animated particle canvas background
  - Live clock in header
  - Fully responsive (mobile ↔ desktop)
  - Smooth tab transitions
## 🛠 Tech Stack
| Layer | Technology |
|---|---|
| Frontend | HTML5, CSS3, Vanilla JS |
| Backend | Node.js, Express |
| HTTP Client (backend) | Axios |
| CORS | cors middleware |
| Environment | dotenv |
## 📦 API Endpoints (Backend)
| Method | Route | Description |
|---|---|---|
| GET | `/api/weather?city=` | Current weather for a city |
| GET | `/api/forecast?city=` | 5-day forecast for a city |
| GET | `/api/news?category=&query=` | Latest news articles |
| GET | `/health` | Server health check |
---
## 📝 Notes
- The Express backend acts as a **secure API proxy** — API keys never reach the client
- `.env` is listed in `.gitignore`; never commit your keys
- Free tier limits: OpenWeatherMap (1,000 calls/day), NewsData.io (200 calls/day)---
*CodTech Full Stack Internship — Task 1 Deliverable*


<img width="1920" height="1080" alt="Screenshot (665)" src="https://github.com/user-attachments/assets/3e22dfe7-98f0-4535-a086-476c000b1a33" />




















