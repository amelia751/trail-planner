# Trail 🏃‍♀️🥾 - Chrome AI Offline Trip Planner

> Built for **Google Chrome Built-in AI Challenge 2025**

**Live Demo:** https://www.trailplanner101.com

Trail is a Progressive Web App that leverages Chrome's Built-in AI (Gemini Nano) to provide an **intelligent, offline-capable trip planning and navigation assistant**. Pre-plan your outdoor adventures with AI while online, then navigate and get real-time assistance completely offline.

![Trail Preview](https://img.shields.io/badge/Chrome%20AI-Enabled-brightgreen) ![PWA](https://img.shields.io/badge/PWA-Installable-blue) ![Status](https://img.shields.io/badge/Status-Live-success)

---

## 🎯 The Problem

**Google Maps doesn't work offline** for real-time navigation assistance. Hikers, runners, and outdoor enthusiasts need:
- GPS navigation without internet
- AI assistance for plant/wildlife identification
- First aid tips and emergency guidance
- Route information and landmarks

**Trail solves this** by pre-generating comprehensive trip data while online, then providing a fully-functional AI assistant that works **100% offline** using Chrome's Built-in AI.

---

## ✨ Key Features

### 🤖 Hybrid AI Architecture
- **Online Planning:** Gemini Developer API generates comprehensive knowledge bases
- **Offline Navigation:** Chrome Built-in AI (Gemini Nano) provides real-time assistance
- **Multimodal:** Image, text, and GPS-aware interactions

### 🗺️ Smart Route Generation
- **Google Maps Routes API:** Accurate GPS paths with elevation data
- **Google Places API:** Real landmarks and points of interest
- **Realistic GPS Simulation:** Dynamic tracking with drift, speed, and accuracy variations

### 💬 Intelligent Assistant
- Context-aware chat with current GPS position
- Plant and wildlife identification (image upload or drag-and-drop)
- First aid tips and emergency contacts
- Navigation guidance and landmark information
- **Works 100% offline** with Chrome AI

### 📱 Offline-First PWA
- Service Worker caching (cache-first strategy)
- IndexedDB storage with Dexie.js
- Installable on desktop and mobile
- Offline map visualization with MapLibre GL JS

### 🎨 Beautiful UI
- Responsive design (mobile & desktop)
- Tab-based mobile interface (GPS + Agent)
- Scrollable chat with markdown support
- Lottie animations for loading states
- Custom trail icon

---

## 🛠️ Tech Stack

### Frontend
- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + Shadcn UI
- **Database:** Dexie.js (IndexedDB wrapper)
- **Maps:** MapLibre GL JS
- **Animations:** Lottie-react
- **Markdown:** react-markdown + remark-gfm

### Backend (Serverless)
- **Platform:** Vercel
- **APIs:** Next.js API Routes
- **AI:** Gemini Developer API (gemini-2.0-flash)
- **Maps:** Google Maps Platform (Routes, Places, Geocoding APIs)

### Chrome Built-in AI APIs Used
- ✅ **Prompt API** - Main chat interface with multimodal support
- ✅ **Summarizer API** - Knowledge base generation (planned)
- ✅ **Session Pooling** - Efficient AI session management

### External APIs
- **Gemini Developer API** - Server-side knowledge base generation
- **Google Maps Routes API** - Accurate GPS route data
- **Google Maps Places API** - Landmarks and POI discovery
- **Google Maps Geocoding API** - Address to coordinates conversion

---

## 🚀 Getting Started

### Prerequisites

1. **Chrome Dev/Canary** with Built-in AI enabled
   - Download: https://www.google.com/chrome/dev/
   - Enable flags (see `/install` page)

2. **API Keys:**
   - Google Cloud Service Account (for Gemini API)
   - Gemini API Key
   - Google Maps API Key

### Installation

```bash
# Clone the repository
git clone https://github.com/amelia751/trail.git
cd trail

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your API keys

# Run development server
npm run dev

# Open http://localhost:3000
```

### Environment Variables

Create `.env.local` with:

```env
# Google Cloud Service Account (for Gemini API)
GOOGLE_PROJECT_ID=your-project-id
GOOGLE_CLIENT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# Gemini API Key
GEMINI_API_KEY=your_gemini_api_key

# Google Maps API Key (enable: Routes, Places, Geocoding APIs)
GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

---

## 📖 How to Use

### 1. **Plan a Trip (Online)**
   - Go to `/trips` → "Plan New Trip"
   - Enter start/end points (or use Quick Fill: Running 🏃 / Hiking 🥾)
   - AI generates:
     - GPS route with elevation (Google Maps)
     - Landmarks and POIs (Google Places)
     - Knowledge base: first aid, plants, wildlife, navigation tips (Gemini)

### 2. **Navigate Offline**
   - Open your trip → GPS simulator plays your route
   - Live map shows current position and landmarks
   - Chat with AI assistant using Chrome Built-in AI
   - Upload images for plant/wildlife identification
   - All works **completely offline**!

### 3. **Install as PWA**
   - Click "Install" in browser
   - Use as standalone app
   - Works offline with Service Worker

---

## 🧪 Testing

### Quick Test (5 minutes)

1. Visit https://www.trailplanner101.com
2. Check Chrome AI status on landing page
3. Create trip with Quick Fill: **🏃 Running** (Schuylkill River)
4. Wait ~30s for generation
5. Start trip → Play GPS simulator
6. Chat with AI: "What plants might I see?"
7. Go offline (DevTools → Network → Offline)
8. Reload page → Everything still works!

### Test Images

Use images from `/public/test_images/`:
- **Running:** 7 images (Schuylkill River landmarks)
- **Hiking:** 17 images (Wissahickon Valley waterfalls, plants, wildlife)

---

## 📁 Project Structure

```
trail/
├── app/                          # Next.js app router
│   ├── page.tsx                 # Landing page with AI check
│   ├── install/                 # Chrome AI setup guide
│   ├── trips/                   # Trip list page
│   ├── trip/
│   │   ├── new/                # Trip creation form
│   │   └── [id]/               # Trip session (GPS + Chat)
│   └── api/                     # Backend API routes
│       ├── generate-knowledge/  # Hybrid trip data generation
│       └── chat/                # Gemini chat endpoint
├── lib/
│   ├── ai.ts                    # Chrome AI (Prompt API, Session Pool)
│   ├── gemini.ts                # Gemini Developer API
│   ├── google-maps.ts           # Google Maps API integration
│   ├── db.ts                    # Dexie (IndexedDB)
│   ├── types.ts                 # TypeScript interfaces
│   └── mock-trail-data.ts       # Realistic GPS simulation
├── components/
│   ├── GPSSimulator.tsx         # GPS playback UI
│   ├── MapView.tsx              # MapLibre map component
│   └── ui/                      # Shadcn UI components
├── public/
│   ├── sw.js                    # Service Worker (PWA)
│   ├── manifest.json            # PWA manifest
│   ├── animation/               # Lottie animations
│   └── test_images/             # Test images (running, hiking)
└── .env.local                   # API keys (gitignored)
```

---

## 🏆 Chrome Built-in AI Challenge Submission

### Challenge Categories

✅ **Natural Trip Assistant** (Prompt API)
- Conversational AI for outdoor guidance
- GPS-aware responses
- Multimodal plant/wildlife identification

✅ **Offline Knowledge & Guidance** (Summarizer API - planned)
- Pre-generated knowledge bases
- Fully functional offline assistant
- IndexedDB + Service Worker storage

### Innovation Highlights

1. **Hybrid AI Architecture:** Combines server-side Gemini (rich generation) with client-side Chrome AI (offline inference)
2. **Real GPS Integration:** Google Maps Routes API + Places API for accurate data
3. **Progressive Web App:** Full offline capability with Service Worker
4. **Multimodal UX:** Text, image, GPS-aware interactions
5. **Session Pooling:** Efficient Chrome AI session management

---

## 📊 Performance

- **Trip Generation:** ~20-30s (Google Maps + Gemini)
- **Offline Chat Response:** ~1-3s (Chrome AI)
- **GPS Points per Route:** 27-800 (configurable)
- **Landmarks per Route:** ~10 (context-dependent)
- **PWA Install Size:** ~500KB (excluding cached maps)

---

## 🐛 Known Limitations

- **Chrome AI Required:** Only works in Chrome Dev/Canary with flags enabled
- **Trip Generation Needs Internet:** Initial setup requires online connection
- **Map Tiles:** Currently using online tiles (offline PMTiles planned)
- **GPS Simulation:** Mock data for testing (real GPS integration possible)

---

## 🛣️ Roadmap

- [ ] Real GPS API integration (Geolocation API)
- [ ] Offline map tiles (PMTiles)
- [ ] Voice input/output (Speech API)
- [ ] Writer API for trip summaries
- [ ] Translator API for multi-language support
- [ ] Off-route detection and rerouting
- [ ] Share trips with others
- [ ] Export GPX files

---

## 📄 License

MIT License - feel free to use for your own projects!

---

## 🙏 Acknowledgments

- **Google Chrome Team** - Built-in AI APIs
- **Google Cloud** - Gemini Developer API
- **Vercel** - Hosting and deployment
- **MapLibre** - Open-source mapping
- **Shadcn UI** - Beautiful components

---

## 🔗 Links

- **Live Demo:** https://www.trailplanner101.com
- **GitHub:** https://github.com/amelia751/trail
- **Architecture:** [ARCHITECTURE.md](./ARCHITECTURE.md)
- **Chrome AI Setup:** https://www.trailplanner101.com/install

---

**Built with ❤️ for the Google Chrome Built-in AI Challenge 2025**

*Happy trails! 🏃‍♀️🥾🗺️*
