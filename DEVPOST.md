# Trail - AI-Powered Offline Trip Planner

**Tagline:** Your offline trail companion powered by Chrome's Built-in AI - plan, navigate, and explore with confidence, even without internet.

A hybrid, multimodal web application that acts as your offline trail companion - plan, navigate, and explore with confidence, even without internet.

---

## What problem is your submission addressing?

Outdoor adventurers face a critical dilemma: they need intelligent assistance most when they have it least. Traditional navigation and AI apps fail in remote areas due to lack of connectivity, yet that's precisely where hikers, runners, and cyclists need help identifying plants, treating injuries, understanding wildlife, and making navigation decisions.

Existing solutions fall short in two ways:

**❌ Cloud-Only AI Apps** (ChatGPT, Google Assistant)
- Require constant internet connectivity
- Useless in remote wilderness areas
- Can't provide context-aware trail assistance offline
- Expensive API costs for continuous queries

**❌ Offline-Only Apps** (AllTrails, Gaia GPS)
- Limited to pre-downloaded static content
- No conversational AI interface
- Can't answer dynamic questions or identify photos
- Lack personalized, trip-specific knowledge

### The Hybrid Solution

Trail solves this by combining **server-side intelligence** for data quality with **client-side AI** for offline capability:

**🌐 Server-Side (Online Planning Phase):**
- **Google Maps Routes API** generates professional-grade GPS paths following actual roads and trails
- **Google Places API** discovers real landmarks and points of interest within 500m of the route
- **Google Gemini API** creates comprehensive, trip-specific knowledge bases (2000-4000 words covering first aid, local flora/fauna, weather, navigation, and safety)
- All data is processed, validated, and stored locally in IndexedDB for offline use

**📱 Client-Side (Offline Execution Phase):**
- **Chrome Built-in AI (Gemini Nano)** provides instant, on-device conversational responses
- **Multimodal capabilities** allow users to upload photos for plant/wildlife identification
- **GPS-aware context** injects current position and nearby landmarks into AI prompts
- **Service Worker + PWA** ensures the entire UI works offline
- **MapLibre GL JS** renders interactive maps without server requests

### Why Hybrid is Superior

This architecture delivers what neither approach can achieve alone:

✅ **Quality + Availability:** Real-world map data (server) + always-on AI assistant (client)  
✅ **Intelligence + Privacy:** Powerful knowledge generation (server) + on-device inference (client)  
✅ **Accuracy + Speed:** Verified landmarks from Google (server) + zero-latency responses (client)  
✅ **Rich Context + No Data Costs:** Comprehensive trip preparation (server) + unlimited offline queries (client)

The result is a **professional outdoor companion** that works anywhere—from city trails with 5G to remote wilderness with zero bars—demonstrating the true potential of hybrid AI architectures.

---

## Inspiration

As an avid hiker and runner, I've experienced the frustration of losing cell service on trails when I need information the most. Traditional navigation apps fail when you're deep in nature, and AI assistants require constant internet connectivity. I wanted to create a solution that combines the power of modern AI with true offline capabilities, ensuring that adventurers always have an intelligent companion by their side, regardless of connectivity.

The Google Chrome Built-in AI Challenge presented the perfect opportunity to explore how on-device AI could transform outdoor recreation. I envisioned a tool that could answer questions about plants, wildlife, first aid, and navigation—all without requiring a single byte of data once you're on the trail.

## What it does

**Trail** is a Progressive Web App (PWA) that leverages Chrome's Built-in AI (Gemini Nano) to provide offline trip planning and real-time navigation assistance. Here's what makes it unique:

### Core Features

**🗺️ Intelligent Trip Planning**
- Users input start/end points, trip purpose (hiking, running, cycling, etc.), and difficulty level
- The app generates detailed routes using **Google Maps Routes API** with accurate GPS coordinates
- **Google Places API** identifies real landmarks and points of interest along the route
- **Google Gemini API** creates a comprehensive knowledge base covering first aid, local flora/fauna, weather tips, and navigation advice

**📍 Real-Time GPS Simulation**
- Simulates GPS tracking with realistic variations (drift, speed changes, elevation)
- Displays position on an interactive map powered by **MapLibre GL JS**
- Automatically alerts users when approaching landmarks or points of interest

**🤖 Offline AI Chat Assistant**
- Uses **Chrome's Built-in Prompt API (Gemini Nano)** for on-device inference
- Supports **multimodal input** (text + images) for plant/wildlife identification
- Contextually aware of your current GPS location and trip details
- Answers questions instantly without requiring internet connectivity

**💾 Complete Offline Functionality**
- Service Worker caches all UI assets for offline access
- IndexedDB stores trip data, GPS routes, landmarks, and AI knowledge bases
- PWA manifest enables "Add to Home Screen" for native app experience
- Offline indicator shows connectivity status

### Example Use Case

Imagine you're hiking the Wissahickon Valley trail. Before you leave (while still online), you create a trip in Trail. The app generates your route, identifies landmarks like Valley Green Inn and Devil's Pool, and builds an AI knowledge base about local wildlife, edible plants, and trail safety.

During your hike, even with no cell service, you can:
- See your position on the map in real-time
- Ask "What's this mushroom?" and attach a photo for AI identification
- Get first aid advice: "How do I treat a bee sting?"
- Learn about your surroundings: "Tell me about the trees in this area"

## How I built it

### Tech Stack

**Frontend Framework**
- **Next.js 15** with React 19 and TypeScript
- **Tailwind CSS** + **Shadcn UI** for modern, accessible components
- **Lottie** animations for enhanced UX

**AI Integration**
- **Chrome Built-in Prompt API** (`window.ai`) for on-device Gemini Nano inference
- **Google Gemini API** (backend) for knowledge base generation
- Custom context injection for GPS-aware and trip-aware responses

**Maps & Location**
- **Google Maps Platform APIs:**
  - Routes API (accurate polyline generation)
  - Places API (POI discovery)
  - Geocoding API (address resolution)
- **MapLibre GL JS** for offline-capable map rendering
- Custom GPS simulation with realistic drift and accuracy modeling

**Data & Storage**
- **Dexie.js** wrapper for IndexedDB (trips, sessions, messages)
- Service Worker (Workbox-inspired) for asset caching
- Web App Manifest for PWA installation

**Deployment**
- **Vercel** for hosting and continuous deployment
- Custom domain: **www.trailplanner101.com**
- Environment-based API key management

### Architecture Highlights

I designed a **hybrid approach** that maximizes both data quality and offline capability:

1. **Online Trip Creation Phase:**
   - Google Maps generates accurate route polylines
   - Places API identifies real landmarks within 500m of route
   - Gemini API creates trip-specific knowledge base (2000-4000 words)
   - All data stored locally in IndexedDB

2. **Offline Trip Execution Phase:**
   - GPS simulator uses stored polyline coordinates
   - MapLibre renders map with cached tiles
   - Chrome Built-in AI uses stored knowledge base as context
   - All AI inference happens on-device via Gemini Nano

3. **Progressive Enhancement:**
   - App checks for `window.ai` availability
   - Falls back gracefully if Chrome AI isn't available
   - Guides users through Chrome Canary setup if needed

### Code Organization

```
trail/
├── app/                    # Next.js app router
│   ├── trips/             # Trip management UI
│   ├── trip/[id]/         # Trip session page
│   └── api/               # Backend API routes
├── components/            # React components
│   ├── GPSSimulator.tsx   # GPS tracking & playback
│   ├── MapView.tsx        # MapLibre integration
│   └── ui/                # Shadcn components
├── lib/
│   ├── ai.ts              # Chrome Built-in AI wrapper
│   ├── google-maps.ts     # Google Maps API integration
│   ├── db.ts              # Dexie IndexedDB schema
│   └── mock-trail-data.ts # GPS simulation logic
└── public/
    ├── sw.js              # Service Worker
    └── manifest.json      # PWA manifest
```

## Challenges I ran into

### 1. **Chrome Built-in AI API Evolution**

The Prompt API was in active development during this hackathon. I had to:
- Track API changes across Chrome Canary releases
- Handle graceful degradation when AI wasn't available
- Implement feature detection (`window.ai?.canCreateTextSession`)
- Work around initial rate limiting and context window constraints

### 2. **Multimodal Image Processing**

Getting image uploads to work with the Prompt API required careful handling:
- Converting File objects to base64 for API compatibility
- Managing MIME type detection and validation
- Optimizing image sizes to fit within context limits
- Ensuring images were properly embedded in the AI context

### 3. **Realistic GPS Simulation**

Creating believable GPS data was harder than expected:
- Initial version had unrealistic "jumps" between points
- Had to model GPS drift perpendicular to route direction
- Added clamping to prevent excessive deviations
- Incorporated dynamic speed, elevation, and accuracy variations
- Ensured simulated path stayed true to the actual route

### 4. **Offline-First Architecture**

Making the entire app work offline required solving multiple puzzles:
- Service Worker scope and caching strategy conflicts
- IndexedDB schema versioning (breaking changes required migration)
- HTML caching invalidation while still providing offline fallback
- Asset precaching vs. runtime caching trade-offs
- Testing offline behavior without breaking hot reload in development

### 5. **Google Maps API Rate Limiting**

The Routes API and Places API have strict rate limits:
- Had to implement strategic caching of generated routes
- Optimized POI queries to minimize API calls
- Added retry logic with exponential backoff
- Balanced data freshness with API quota constraints

### 6. **Vercel Deployment Issues**

Production deployment revealed unexpected challenges:
- Environment variable newline character corruption
- Deployment protection blocking new releases
- Git author identity mismatch preventing auto-deploys
- Custom domain DNS propagation delays
- Had to implement programmatic `.trim()` on API keys to handle whitespace

## Accomplishments that I'm proud of

### 🏆 **True Offline AI Experience**

I successfully created a **fully functional offline AI assistant** that works in the wilderness. This isn't a limited chatbot—it provides contextual, intelligent responses about your specific trip, all running locally on your device via Gemini Nano.

### 🎯 **Hybrid Data Architecture**

I designed an elegant solution that gets the **best of both worlds**:
- **Online:** High-quality real-world data from Google Maps and Places
- **Offline:** Instant AI responses via on-device Gemini Nano
- **Result:** Professional-grade trip planning with zero-latency AI assistance

### 🗺️ **Realistic GPS Simulation**

I built a GPS simulator that doesn't just interpolate points—it models **real-world GPS behavior** including drift, accuracy variations, speed fluctuations, and elevation changes. This makes testing feel like an actual trail experience.

### 💎 **Production-Ready PWA**

Trail isn't just a demo—it's a **fully deployed, installable Progressive Web App**:
- Live at **www.trailplanner101.com**
- Passes PWA audits (installable, offline-capable, mobile-responsive)
- Polished UI with loading states, animations, and error handling
- Comprehensive documentation (README, ARCHITECTURE)

### 🎨 **Intuitive UX Design**

I focused heavily on user experience:
- Quick Fill buttons for instant trip creation
- Two-stage loading animations (Route → Knowledge Base)
- Mobile-responsive tabs (GPS/Agent split view)
- Prominent GPS marker with pulsing animation
- Waypoint proximity alerts
- Markdown-rendered AI responses with syntax highlighting

### 📚 **Rich Knowledge Bases**

The AI-generated knowledge bases aren't generic—they're **trip-specific and comprehensive**:
- First aid tailored to activity type (running vs. hiking)
- Local flora/fauna based on geographic location
- Navigation tips specific to route terrain
- Weather considerations for the region
- 2000-4000 words of curated, contextual information

## What I learned

### **On-Device AI is Transformative**

Working with Chrome's Built-in AI showed me the future of AI applications. Having a capable language model running locally on the device changes what's possible:
- **Privacy:** User data never leaves the device
- **Speed:** Zero network latency for AI responses
- **Reliability:** Works anywhere, anytime
- **Cost:** No per-query API charges

This experience convinced me that on-device AI will be as important as GPU acceleration was for graphics.

### **Progressive Web Apps Are Underrated**

PWAs offer a **compelling middle ground** between web and native apps:
- No app store approval process
- Instant updates without user action
- Cross-platform by default (iOS, Android, Desktop)
- Lower development cost than native apps
- Still get installability and offline capabilities

The Service Worker API is more powerful than I initially thought, especially for offline-first architectures.

### **Context Engineering Matters**

With Gemini Nano's context window, I learned that **quality > quantity**:
- A well-structured 3000-word knowledge base outperforms a 10,000-word dump
- Including GPS coordinates and current position dramatically improves relevance
- Multimodal prompts (text + image) need careful formatting
- System prompts should set clear expectations and constraints

### **Real Data > Mock Data (Usually)**

Initially, I considered using only AI-generated mock data for routes. Switching to **real Google Maps data** made a huge difference:
- Routes follow actual roads and trails
- Landmarks are real places with accurate locations
- GPS coordinates are precise and reliable
- Users trust the app more with recognizable locations

The hybrid approach (real maps + AI knowledge) proved far superior to either alone.

### **Deployment is Part of the Product**

I learned that a great app isn't complete until it's reliably deployed:
- Environment variable management is critical
- DNS propagation can be unpredictable
- Deployment protection is important for teams but can block solo developers
- Custom domains add legitimacy and memorability
- Continuous deployment via GitHub enables rapid iteration

## What's next for Trail

### **Near-Term Enhancements**

**🎤 Voice Interface**
- Hands-free AI queries while hiking (using Web Speech API)
- Audio responses for eyes-free navigation
- Wake word activation: "Hey Trail..."

**📸 Enhanced Image Recognition**
- Offline plant identification using TensorFlow.js models
- Wildlife tracking and species logging
- Photo-based trail condition reporting

**🌍 Real GPS Integration**
- Use device GPS via Geolocation API
- Compare actual vs. expected route
- Off-trail detection and re-routing suggestions

**📊 Activity Tracking**
- Distance, elevation gain, calories burned
- Heart rate integration (Web Bluetooth)
- Trip statistics and personal records

### **Medium-Term Features**

**👥 Community & Social**
- Trip sharing with other Trail users
- User-generated trail reviews and conditions
- Emergency contact location sharing
- Trail discovery feed

**🗺️ Offline Map Downloads**
- Pre-cache map tiles for specific regions
- Vector tile storage in IndexedDB
- Topographic map overlays
- Satellite imagery for remote areas

**🧭 Advanced Navigation**
- Turn-by-turn voice guidance
- Waypoint routing and multi-day trips
- Compass calibration and bearing tracking
- Star navigation for night hiking

**🏔️ Specialized Trip Types**
- Rock climbing route beta and grades
- Backcountry camping site recommendations
- Trail running race course previews
- Cycling elevation profiles and segment challenges

### **Long-Term Vision**

**🤖 Smarter AI Context**
- Real-time learning from user interactions
- Personalized recommendations based on fitness level
- Predictive alerts (weather changes, sunset times)
- Multi-agent AI (navigation agent + nature agent + safety agent)

**🌐 Global Expansion**
- Multi-language support (leveraging Gemini's multilingual capabilities)
- International trail databases (AllTrails, Komoot integration)
- Regional knowledge bases (Andes, Alps, Himalayas, etc.)

**📱 Native App Capabilities**
- iOS/Android native apps with Capacitor or React Native
- Background GPS tracking
- Offline map downloads with higher limits
- Apple Watch / Wear OS complications

**🔬 Research Contributions**
- Publish findings on on-device AI performance in outdoor contexts
- Open-source the GPS simulation engine
- Contribute to Chrome Built-in AI API development
- Create benchmarks for multimodal AI in mobile PWAs

---

## Built With

- **Next.js** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Shadcn UI** - Component library
- **Chrome Built-in AI (Gemini Nano)** - On-device inference
- **Google Gemini API** - Knowledge base generation
- **Google Maps Platform** - Routes, Places, Geocoding APIs
- **MapLibre GL JS** - Map rendering
- **Dexie.js** - IndexedDB wrapper
- **Vercel** - Deployment platform
- **Lottie** - Animations

---

## Try It Out

🌐 **Live Demo:** [www.trailplanner101.com](https://www.trailplanner101.com)

⚠️ **Requirements:**
- Chrome Canary (Dev/Canary) with Prompt API enabled
- Flags: `chrome://flags/#prompt-api-for-gemini-nano` + `chrome://flags/#optimization-guide-on-device-model`

📝 **Quick Start:**
1. Visit the live demo
2. Check Chrome AI status
3. Create a trip with Quick Fill (🏃 Running or 🥾 Hiking)
4. Start the trip and explore GPS simulation
5. Chat with AI: "What plants might I see?" or upload a photo

---

**Built with ❤️ for the Google Chrome Built-in AI Challenge 2025**

