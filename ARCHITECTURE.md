# Trail - System Architecture

> Comprehensive architecture documentation for diagram generation

This document details the complete system architecture of Trail, including all components, APIs, data flows, and interactions between client and server.

---

## 🏗️ High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER'S BROWSER                          │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                    TRAIL PWA (Next.js)                    │  │
│  │  ┌─────────────────┐  ┌──────────────┐  ┌─────────────┐  │  │
│  │  │   React Pages   │  │  Chrome AI   │  │  IndexedDB  │  │  │
│  │  │   (UI Layer)    │  │ (Gemini Nano)│  │   (Dexie)   │  │  │
│  │  └─────────────────┘  └──────────────┘  └─────────────┘  │  │
│  │  ┌─────────────────────────────────────────────────────┐  │  │
│  │  │            Service Worker (Offline Cache)           │  │  │
│  │  └─────────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────────┘  │
└──────────────────────┬──────────────────────────────────────────┘
                       │ HTTPS (Online Phase Only)
                       │
┌──────────────────────▼──────────────────────────────────────────┐
│                    VERCEL (Serverless)                          │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │              Next.js API Routes (Backend)                 │  │
│  │  ┌──────────────────┐    ┌──────────────────────────┐    │  │
│  │  │  /api/generate-  │    │     /api/chat            │    │  │
│  │  │   knowledge      │    │  (Gemini multimodal)     │    │  │
│  │  └──────────────────┘    └──────────────────────────┘    │  │
│  └───────────────────────────────────────────────────────────┘  │
└──────────────────────┬──────────────────────────────────────────┘
                       │ API Calls
                       │
┌──────────────────────▼──────────────────────────────────────────┐
│                    EXTERNAL APIs                                │
│  ┌─────────────┐  ┌─────────────────┐  ┌──────────────────┐   │
│  │   Gemini    │  │  Google Maps    │  │  Google Places   │   │
│  │   2.0-Flash │  │   Routes API    │  │      API         │   │
│  └─────────────┘  └─────────────────┘  └──────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📋 System Components

### 1. Client-Side (Browser)

#### 1.1 UI Layer (React Components)

**Pages:**
- `app/page.tsx` - Landing page with Chrome AI capability detection
- `app/install/page.tsx` - Chrome AI setup instructions
- `app/trips/page.tsx` - Trip list with CRUD operations
- `app/trip/new/page.tsx` - Trip creation form
- `app/trip/[id]/page.tsx` - Trip session (GPS + Chat interface)

**Key Components:**
- `GPSSimulator.tsx` - GPS route playback with realistic variations
- `MapView.tsx` - MapLibre GL JS map with route, waypoints, current position
- `ui/*` - Shadcn UI components (Button, Card, Dialog, Tabs, etc.)
- `PWARegister.tsx` - Service Worker registration
- `InstallPrompt.tsx` - PWA installation prompt
- `OfflineIndicator.tsx` - Online/offline status indicator

**Component Data Flow:**
```
User Interaction → React State → IndexedDB (Dexie) → UI Update
                ↓
         Chrome AI (Prompt API)
                ↓
         Render Response
```

#### 1.2 Chrome Built-in AI Layer

**File:** `lib/ai.ts`

**APIs Used:**
1. **Prompt API (ai.languageModel)**
   - Purpose: Conversational AI assistant
   - Features: Text chat, multimodal image support, GPS-aware responses
   - Model: Gemini Nano (on-device)
   
2. **Session Pooling**
   - Purpose: Efficient session management
   - Implementation: Reuses AI sessions to reduce initialization overhead
   - Pool size: Configurable (default: 3 sessions)

**Key Functions:**
```typescript
// Check AI capabilities
checkAICapabilities() → {
  promptAPI: boolean,
  summarizer: boolean,
  writer: boolean
}

// Chat with context
chatWithAI({
  message: string,
  context: string,      // Knowledge base
  image?: string,       // Base64 image (multimodal)
  gps?: GPSPosition     // Current location
}) → Promise<string>

// Session pool management
SessionPool.acquire() → LanguageModel
SessionPool.release(session)
```

**Data Flow:**
```
User Message → Session Pool → Prompt API (Gemini Nano)
     ↓              ↓
Knowledge Base   GPS Data
     ↓              ↓
Context String → AI Response → UI
```

#### 1.3 Storage Layer

**File:** `lib/db.ts` (Dexie.js - IndexedDB wrapper)

**Database Schema:**
```typescript
TrailDB {
  trips: {
    id: string (primary key)
    name: string
    startPoint: string
    endPoint: string
    purpose: string
    difficulty: 'easy' | 'moderate' | 'challenging' | 'expert'
    distance: number
    gpsPath: GPSPosition[] // All route coordinates
    trailData: {
      waypoints: TrailWaypoint[] // Landmarks
      elevationGain: number
      coordinates: {lat, lon}[]
    }
    knowledgeBase: {
      firstAid: string
      plantIdentification: string
      wildlifeInfo: string
      navigationTips: string
      emergencyContacts: string
    }
    status: 'planning' | 'ready' | 'in-progress'
    createdAt: number
    updatedAt: number
  }
  
  sessions: {
    id: string (primary key)
    tripId: string (foreign key)
    startedAt: number
    currentGPS: GPSPosition
  }
  
  messages: {
    id: string (primary key)
    sessionId?: string
    tripId?: string
    role: 'user' | 'assistant'
    content: string
    image?: string
    gps?: GPSPosition
    timestamp: number
  }
}
```

**CRUD Operations:**
```typescript
// Create trip
db.trips.put(trip)

// Read trip
db.trips.get(tripId)

// List all trips
db.trips.toArray()

// Delete trip
db.trips.delete(tripId)

// Query by status
db.trips.where('status').equals('ready').toArray()
```

#### 1.4 PWA Layer

**Service Worker:** `public/sw.js`

**Caching Strategy:**
```javascript
// Cache Version
const CACHE_VERSION = 'v2'

// Precache (Install Phase)
[
  '/',
  '/trips',
  '/trip/new',
  '/install',
  '/globals.css',
  '/animation/*.json',
  '/icon-*.png'
]

// Runtime Caching (Fetch Phase)
Cache-First Strategy:
  1. Check cache → Return if found
  2. Fetch from network → Cache response
  3. Return response

External Resources (Google Maps tiles, fonts):
  - Network-First (with cache fallback)
```

**PWA Manifest:** `public/manifest.json`
```json
{
  "name": "Trail - Chrome AI Offline Trip Planner",
  "short_name": "Trail",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#F1EBE0",
  "theme_color": "#2d9d9b",
  "icons": [
    { "src": "/icon-192.png", "sizes": "192x192" },
    { "src": "/icon-512.png", "sizes": "512x512" }
  ]
}
```

---

### 2. Server-Side (Vercel Serverless)

#### 2.1 API Route: Trip Data Generation

**File:** `app/api/generate-knowledge/route.ts`

**Purpose:** Generate comprehensive trip data using Google Maps + Gemini

**Implementation:** `lib/google-maps.ts` - `generateHybridTripData()`

**Request:**
```typescript
POST /api/generate-knowledge
{
  startPoint: string,    // "Liberty Bell, Philadelphia"
  endPoint: string,      // "Museum of Art, Philadelphia"
  purpose: string,       // "Running" | "Hiking" | etc.
  difficulty: string,    // "easy" | "moderate" | "challenging" | "expert"
  isRoundTrip: boolean
}
```

**Response:**
```typescript
{
  tripData: {
    route: {
      gpsPath: GPSPosition[],        // All coordinates with elevation
      landmarks: TrailWaypoint[],    // POIs along route
      distance: number,               // Total distance in km
      elevationGain: number          // Total elevation gain in m
    },
    knowledgeBase: {
      firstAid: string,              // Markdown formatted
      plantIdentification: string,
      wildlifeInfo: string,
      navigationTips: string,
      emergencyContacts: string
    }
  }
}
```

**Processing Flow:**
```
1. Geocode addresses (Google Geocoding API)
   ↓
2. Get route (Google Routes API)
   - computeRoutes endpoint
   - Returns: polyline, distance, elevation
   ↓
3. Decode polyline → GPS coordinates
   ↓
4. Find landmarks (Google Places API)
   - nearbySearch for each route segment
   - Filter by relevance and distance
   ↓
5. Generate knowledge base (Gemini 2.0-Flash)
   - Prompt with location context
   - Generate 5 categories of information
   ↓
6. Return combined data
```

#### 2.2 API Route: Chat

**File:** `app/api/chat/route.ts`

**Purpose:** Server-side chat endpoint (optional, for image processing)

**Implementation:** `lib/gemini.ts` - `chatWithGemini()`

**Request:**
```typescript
POST /api/chat
{
  message: string,
  image?: string,         // Base64 encoded
  context?: string
}
```

**Response:**
```typescript
{
  response: string
}
```

---

### 3. External APIs

#### 3.1 Google Maps Platform APIs

**Authentication:**
```typescript
// API Key (server-side only)
const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY
```

**APIs Used:**

**A. Routes API (v2)**
- **Endpoint:** `https://routes.googleapis.com/directions/v2:computeRoutes`
- **Purpose:** Calculate route between two points
- **Request:**
  ```json
  {
    "origin": { "address": "Liberty Bell, Philadelphia" },
    "destination": { "address": "Museum of Art, Philadelphia" },
    "travelMode": "WALK",
    "routingPreference": "ROUTING_PREFERENCE_UNSPECIFIED",
    "computeAlternativeRoutes": false,
    "routeModifiers": {
      "avoidTolls": false,
      "avoidHighways": false,
      "avoidFerries": false
    }
  }
  ```
- **Response:**
  ```json
  {
    "routes": [{
      "polyline": { "encodedPolyline": "..." },
      "distanceMeters": 2300,
      "duration": "25m",
      "legs": [{
        "steps": [{
          "navigationInstruction": {...},
          "travelAdvisory": {...}
        }]
      }]
    }]
  }
  ```

**B. Places API (Nearby Search)**
- **Endpoint:** `https://maps.googleapis.com/maps/api/place/nearbysearch/json`
- **Purpose:** Find landmarks near route
- **Request:**
  ```
  ?location=39.9526,-75.1652
  &radius=500
  &type=tourist_attraction|park|museum
  &key=API_KEY
  ```
- **Response:**
  ```json
  {
    "results": [{
      "name": "Liberty Bell",
      "geometry": { "location": { "lat": 39.9496, "lng": -75.1503 } },
      "types": ["tourist_attraction"],
      "vicinity": "526 Market St"
    }]
  }
  ```

**C. Geocoding API**
- **Endpoint:** `https://maps.googleapis.com/maps/api/geocode/json`
- **Purpose:** Convert addresses to coordinates
- **Request:** `?address=Liberty+Bell,Philadelphia&key=API_KEY`
- **Response:**
  ```json
  {
    "results": [{
      "geometry": {
        "location": { "lat": 39.9496, "lng": -75.1503 }
      }
    }]
  }
  ```

#### 3.2 Gemini Developer API

**Authentication:**
```typescript
// Service Account (server-side)
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY)
```

**Model:** `gemini-2.0-flash`

**Purpose:** Generate knowledge base content

**Request:**
```typescript
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })
const result = await model.generateContent(prompt)
```

**Prompt Structure:**
```
Generate comprehensive trip data for: {purpose} from {start} to {end}

Generate detailed knowledge base with:
1. First Aid (common injuries, treatments)
2. Plant Identification (local flora, edible/poisonous)
3. Wildlife Info (animals to watch for, safety)
4. Navigation Tips (terrain, weather, trail markers)
5. Emergency Contacts (local services, coordinates)

Format: JSON with markdown content for each category
```

**Response:**
```json
{
  "firstAid": "## Common Trail Injuries\n\n**Blisters**\n- Cause: Friction...",
  "plantIdentification": "## Local Plants\n\n**Poison Ivy**\n- Identification...",
  "wildlifeInfo": "## Wildlife Safety\n\n**Deer**\n- Common in area...",
  "navigationTips": "## Navigation Guide\n\n**Trail Markers**...",
  "emergencyContacts": "## Emergency Services\n\n**911** - Emergency..."
}
```

---

## 🔄 Complete Data Flows

### Flow 1: Trip Creation (Online Phase)

```
┌─────────────┐
│    USER     │
│  Fills Form │
└──────┬──────┘
       │ startPoint, endPoint, purpose, difficulty
       ▼
┌─────────────────────┐
│  /trip/new (Client) │
│ React Form Page     │
└──────┬──────────────┘
       │ POST /api/generate-knowledge
       ▼
┌──────────────────────────────────┐
│  /api/generate-knowledge (Server)│
│  Next.js API Route               │
└──────┬───────────────────────────┘
       │ calls generateHybridTripData()
       ▼
┌────────────────────────────────────────┐
│  lib/google-maps.ts                    │
│  ┌──────────────────────────────────┐  │
│  │ 1. Geocoding API                 │  │
│  │    "Liberty Bell" → coordinates  │  │
│  └──────────┬───────────────────────┘  │
│             ▼                           │
│  ┌──────────────────────────────────┐  │
│  │ 2. Routes API                    │  │
│  │    Get polyline + elevation      │  │
│  └──────────┬───────────────────────┘  │
│             ▼                           │
│  ┌──────────────────────────────────┐  │
│  │ 3. Decode Polyline               │  │
│  │    → Array of GPS coordinates    │  │
│  └──────────┬───────────────────────┘  │
│             ▼                           │
│  ┌──────────────────────────────────┐  │
│  │ 4. Places API (for each segment) │  │
│  │    Find landmarks near route     │  │
│  └──────────┬───────────────────────┘  │
│             ▼                           │
│  ┌──────────────────────────────────┐  │
│  │ 5. Gemini API                    │  │
│  │    Generate knowledge base       │  │
│  └──────────┬───────────────────────┘  │
└─────────────┼────────────────────────────┘
              │ Return combined data
              ▼
┌─────────────────────────┐
│  /trip/new (Client)     │
│  ┌────────────────────┐ │
│  │ Save to IndexedDB  │ │
│  │ (db.trips.put)     │ │
│  └────────┬───────────┘ │
└───────────┼─────────────┘
            │ Navigate to /trips
            ▼
┌─────────────────┐
│  Trip Saved!    │
│  Ready for      │
│  Offline Use    │
└─────────────────┘
```

### Flow 2: Offline Navigation (Offline Phase)

```
┌──────────────┐
│     USER     │
│ Opens Trip   │
└──────┬───────┘
       │ /trip/[id]
       ▼
┌──────────────────────────┐
│  /trip/[id] (Client)     │
│  ┌─────────────────────┐ │
│  │ Load from IndexedDB │ │
│  │ db.trips.get(id)    │ │
│  └──────┬──────────────┘ │
└─────────┼────────────────┘
          │ Trip data loaded
          ▼
┌─────────────────────────────────────┐
│  Initialize Components              │
│  ┌────────────────┐ ┌─────────────┐│
│  │ GPSSimulator   │ │  MapView    ││
│  │ (plays route)  │ │ (displays)  ││
│  └────────┬───────┘ └──────┬──────┘│
└───────────┼──────────────┬─┼────────┘
            │              │ │
            ▼              ▼ ▼
     ┌──────────────┐  ┌──────────────┐
     │ Current GPS  │  │ Map Updates  │
     │  Position    │  │ with Marker  │
     └──────┬───────┘  └──────────────┘
            │
            ▼
┌────────────────────────┐
│  USER Chats with AI    │
│  "What plants are here?"│
└──────┬─────────────────┘
       │ message + GPS + context
       ▼
┌──────────────────────────────┐
│  lib/ai.ts                   │
│  ┌────────────────────────┐  │
│  │ sessionPool.acquire()  │  │
│  └──────┬─────────────────┘  │
│         ▼                     │
│  ┌────────────────────────┐  │
│  │ Build Context Prompt:  │  │
│  │ - Knowledge Base       │  │
│  │ - Current GPS          │  │
│  │ - User Message         │  │
│  └──────┬─────────────────┘  │
│         ▼                     │
│  ┌────────────────────────┐  │
│  │ Chrome AI Prompt API   │  │
│  │ (Gemini Nano)          │  │
│  │ 🔒 OFFLINE - On Device │  │
│  └──────┬─────────────────┘  │
│         ▼                     │
│  ┌────────────────────────┐  │
│  │ AI Response Generated  │  │
│  └──────┬─────────────────┘  │
│         ▼                     │
│  ┌────────────────────────┐  │
│  │ sessionPool.release()  │  │
│  └──────┬─────────────────┘  │
└─────────┼─────────────────────┘
          │ response text
          ▼
┌──────────────────────┐
│  Display in Chat UI  │
│  (markdown rendered) │
└──────────────────────┘
```

### Flow 3: Image Identification (Offline)

```
┌──────────────┐
│     USER     │
│ Uploads Image│
└──────┬───────┘
       │ drag-and-drop or file input
       ▼
┌───────────────────────┐
│  Convert to Base64    │
│  (FileReader API)     │
└──────┬────────────────┘
       │ base64 string
       ▼
┌─────────────────────────┐
│  chatWithAI()           │
│  {                      │
│    message: "What plant │
│             is this?",  │
│    image: base64,       │
│    context: knowledgeBase,│
│    gps: currentPosition │
│  }                      │
└──────┬──────────────────┘
       │
       ▼
┌────────────────────────────┐
│  Chrome AI Prompt API      │
│  (Multimodal Support)      │
│  ┌──────────────────────┐  │
│  │ session.prompt(      │  │
│  │   prompt,            │  │
│  │   { image: base64 }  │  │
│  │ )                    │  │
│  └──────┬───────────────┘  │
└─────────┼────────────────────┘
          │ 🔒 OFFLINE Analysis
          ▼
┌──────────────────────────┐
│  AI Response:            │
│  "This appears to be     │
│   Eastern Poison Ivy...  │
│   Avoid contact!"        │
└──────┬───────────────────┘
       │
       ▼
┌──────────────────────┐
│  Display with Image  │
│  in Chat             │
└──────────────────────┘
```

---

## 🗄️ Data Models

### GPSPosition
```typescript
interface GPSPosition {
  lat: number;           // Latitude
  lon: number;           // Longitude
  altitude?: number;     // Elevation in meters
  speed?: number;        // Speed in m/s
  heading?: number;      // Direction in degrees (0-360)
  accuracy?: number;     // Accuracy in meters
  timestamp: number;     // Unix timestamp
}
```

### TrailWaypoint (Landmark)
```typescript
interface TrailWaypoint {
  id: string;
  name: string;              // "Liberty Bell"
  description: string;       // "Historic landmark..."
  lat: number;
  lon: number;
  type: 'landmark' | 'rest' | 'water' | 'hazard' | 'viewpoint';
  order: number;             // Sequence along route
  distance?: number;         // Distance from start (km)
}
```

### Trip
```typescript
interface Trip {
  id: string;                           // UUID
  name: string;                         // "Schuylkill River Run"
  startPoint: string;                   // "Lloyd Hall, Philadelphia"
  endPoint: string;                     // "Manayunk, Philadelphia"
  purpose: string;                      // "Running" | "Hiking"
  difficulty: 'easy' | 'moderate' | 'challenging' | 'expert';
  distance: number;                     // Total distance in km
  gpsPath: GPSPosition[];               // All GPS coordinates
  trailData: {
    waypoints: TrailWaypoint[];         // Landmarks
    elevationGain: number;              // Total elevation gain (m)
    coordinates: {lat: number, lon: number}[];
  };
  knowledgeBase: KnowledgeBase;
  status: 'planning' | 'ready' | 'in-progress';
  createdAt: number;
  updatedAt: number;
}
```

### KnowledgeBase
```typescript
interface KnowledgeBase {
  firstAid: string;              // Markdown formatted
  plantIdentification: string;
  wildlifeInfo: string;
  navigationTips: string;
  emergencyContacts: string;
}
```

### ChatMessage
```typescript
interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;                // Text or markdown
  image?: string;                 // Base64 image (if uploaded)
  gps?: GPSPosition;              // GPS at time of message
  timestamp: number;
}
```

---

## 🔐 Security & Privacy

### API Key Management
- ✅ Server-side only (Next.js API routes)
- ✅ Environment variables (.env.local)
- ✅ Never exposed to client
- ✅ Vercel environment variables for production

### Data Privacy
- ✅ All data stored locally (IndexedDB)
- ✅ No user data sent to external servers (except during trip creation)
- ✅ Chrome AI runs on-device (no data leaves browser)
- ✅ PWA works offline (no network requests)

### HTTPS
- ✅ Enforced by Vercel
- ✅ Required for Service Worker
- ✅ Required for Chrome AI APIs

---

## 🚀 Deployment Architecture

```
┌─────────────────────────────────────────────┐
│             GitHub Repository               │
│         github.com/amelia751/trail          │
└──────────────────┬──────────────────────────┘
                   │ git push
                   │
┌──────────────────▼──────────────────────────┐
│          Vercel Auto-Deploy                 │
│  ┌────────────────────────────────────────┐ │
│  │ 1. Detect push to main branch          │ │
│  │ 2. npm install                         │ │
│  │ 3. next build (SSG + API routes)       │ │
│  │ 4. Deploy to Edge Network              │ │
│  └────────────────────────────────────────┘ │
└──────────────────┬──────────────────────────┘
                   │
┌──────────────────▼──────────────────────────┐
│        Vercel Edge Network (CDN)            │
│  ┌────────────────────────────────────────┐ │
│  │ Static Assets (HTML, CSS, JS)          │ │
│  │ - Served from nearest edge location    │ │
│  │ - Cached globally                      │ │
│  └────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────┐ │
│  │ API Routes (Serverless Functions)      │ │
│  │ - /api/generate-knowledge              │ │
│  │ - /api/chat                            │ │
│  │ - Cold start: ~1-2s                    │ │
│  └────────────────────────────────────────┘ │
└─────────────────────────────────────────────┘
```

**Environment Variables (Vercel):**
- `GOOGLE_PROJECT_ID`
- `GOOGLE_CLIENT_EMAIL`
- `GOOGLE_PRIVATE_KEY`
- `GEMINI_API_KEY`
- `GOOGLE_MAPS_API_KEY`

---

## 📊 Performance Characteristics

### Client-Side Performance
- **Initial Load:** ~500ms (with caching)
- **Trip List Load:** ~50ms (IndexedDB query)
- **Chat Response (Chrome AI):** 1-3s
- **GPS Update Rate:** 1 point/second
- **Map Render:** ~200ms (MapLibre)

### Server-Side Performance
- **Trip Generation:** 20-30s
  - Google Maps Routes API: ~2-3s
  - Google Places API: ~5-10s (multiple queries)
  - Gemini Knowledge Base: ~10-15s
- **API Cold Start:** 1-2s (Vercel serverless)
- **API Warm Response:** ~20s (processing time)

### Storage
- **Trip Data Size:** ~100-500KB per trip
  - GPS path: ~50KB (800 points)
  - Knowledge base: ~50KB (5 categories)
  - Landmarks: ~10KB (10 waypoints)
- **IndexedDB Limit:** ~50MB (browser dependent)
- **Service Worker Cache:** ~10MB (precache + runtime)

---

## 🔧 Technology Decisions & Rationale

### Why Hybrid AI (Chrome AI + Gemini API)?
- **Chrome AI (Gemini Nano):** Fast, offline, lightweight inference
- **Gemini API (2.0-Flash):** Rich, detailed knowledge generation
- **Best of both worlds:** Detailed planning online + fast responses offline

### Why Google Maps API + Gemini?
- **Google Maps:** Accurate GPS routes, real landmarks, elevation data
- **Gemini:** Contextual knowledge generation (first aid, plants, wildlife)
- **Hybrid approach:** Real data + AI-generated content

### Why IndexedDB (Dexie)?
- **Large storage:** Handles 100s of trips with GPS data
- **Async API:** Non-blocking UI
- **Query support:** Filter, sort trips
- **Offline-first:** Works without network

### Why Service Worker?
- **Offline support:** Core requirement for PWA
- **Cache control:** Intelligent cache-first strategy
- **Background sync:** Future enhancement possibility

### Why MapLibre GL JS?
- **Open-source:** No license fees
- **Performant:** Hardware-accelerated rendering
- **Offline-ready:** Can use PMTiles (future)

### Why Next.js?
- **App Router:** Modern React patterns
- **API Routes:** Serverless backend
- **SSG:** Fast static page generation
- **Vercel:** Seamless deployment

---

## 🎯 Chrome AI API Integration Details

### Prompt API Usage

**Session Initialization:**
```typescript
const session = await ai.languageModel.create({
  systemPrompt: "You are an outdoor trail assistant...",
  temperature: 0.7,
  topK: 40
});
```

**Context Injection:**
```typescript
const context = `
KNOWLEDGE BASE:
${trip.knowledgeBase.firstAid}
${trip.knowledgeBase.plantIdentification}
${trip.knowledgeBase.wildlifeInfo}
${trip.knowledgeBase.navigationTips}
${trip.knowledgeBase.emergencyContacts}

CURRENT LOCATION:
Latitude: ${gps.lat}, Longitude: ${gps.lon}
Elevation: ${gps.altitude}m
`;

const prompt = `${context}\n\nUSER: ${message}\n\nASSISTANT:`;
const response = await session.prompt(prompt);
```

**Multimodal (Image) Support:**
```typescript
const response = await session.prompt(prompt, {
  image: base64ImageData
});
```

**Session Cleanup:**
```typescript
session.destroy();
// Or return to pool for reuse
```

---

## 🌐 Network Request Flow

### Online Phase (Trip Creation)
```
Browser → Vercel API → Google Maps API → Response
                    ↓
                Gemini API → Response
                    ↓
         Combined Data → Browser
                    ↓
              IndexedDB Storage
```

### Offline Phase (Navigation & Chat)
```
Browser → IndexedDB (Read Trip Data)
       ↓
   Chrome AI (Gemini Nano) → On-Device Inference
       ↓
   Response → UI Update

No network requests! 🔒
```

---

## 🎨 UI/UX Flow

### Desktop Layout
```
┌─────────────────────────────────────────────────────┐
│                    Header (Sticky)                  │
│  [← Back to Trips]  Trip Name  [Distance · Purpose] │
├──────────────┬──────────────────────────────────────┤
│              │                                      │
│  GPS Panel   │          Chat Interface             │
│  (Sidebar)   │                                      │
│  ┌────────┐  │  ┌────────────────────────────────┐ │
│  │Tracker │  │  │  [Assistant]                   │ │
│  │        │  │  │  Welcome message...            │ │
│  │Controls│  │  │                                │ │
│  └────────┘  │  │  [User]                        │ │
│              │  │  What plants might I see?      │ │
│  ┌────────┐  │  │                                │ │
│  │  Map   │  │  │  [Assistant]                   │ │
│  │ (Live) │  │  │  Based on your location...     │ │
│  └────────┘  │  └────────────────────────────────┘ │
│              │  ┌────────────────────────────────┐ │
│              │  │  [📷] [___________] [Send ▶]  │ │
│              │  └────────────────────────────────┘ │
└──────────────┴──────────────────────────────────────┘
```

### Mobile Layout (Tabs)
```
┌─────────────────────────────┐
│         Header              │
│  [← Back] Trip Name         │
├─────────────────────────────┤
│  [GPS] [Agent]  ← Tabs      │
├─────────────────────────────┤
│                             │
│  GPS TAB:                   │
│  ┌───────────────────────┐  │
│  │  GPS Tracker          │  │
│  │  - Current coords     │  │
│  │  - Play controls      │  │
│  └───────────────────────┘  │
│  ┌───────────────────────┐  │
│  │  Map View             │  │
│  │  (Smaller)            │  │
│  └───────────────────────┘  │
│                             │
│  AGENT TAB:                 │
│  ┌───────────────────────┐  │
│  │  Chat Messages        │  │
│  │  (Scrollable)         │  │
│  │                       │  │
│  └───────────────────────┘  │
│  ┌───────────────────────┐  │
│  │  [📷] [Input] [Send]  │  │
│  └───────────────────────┘  │
└─────────────────────────────┘
```

---

## 📈 Scalability Considerations

### Client-Side
- **Trip Limit:** ~50-100 trips (IndexedDB ~50MB)
- **GPS Points:** 800 per trip (configurable)
- **Chrome AI Sessions:** Pool of 3 (configurable)

### Server-Side
- **Serverless Auto-Scaling:** Vercel handles
- **API Rate Limits:**
  - Google Maps: 40,000 requests/month (free tier)
  - Gemini: Usage-based pricing
- **Cold Start:** 1-2s (acceptable for trip generation)

### Future Optimizations
- Compress GPS data (polyline encoding)
- Lazy load knowledge base sections
- PMTiles for offline maps
- WebAssembly for route calculations

---

This architecture document provides a complete technical overview of the Trail application, suitable for diagram generation and technical documentation.

