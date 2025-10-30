# Trail - Chrome AI Offline Trip Companion

An AI-powered hiking trail companion that works offline using Chrome's Built-in AI (Gemini Nano) with cloud fallback for trip planning.

![Trail App](https://img.shields.io/badge/Chrome%20AI-Built--in%20APIs-blue)
![Next.js](https://img.shields.io/badge/Next.js-16-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)

## 🎯 Hackathon Submission

**Google Chrome Built-in AI Challenge 2025**

Trail demonstrates:
- ✅ **Hybrid AI Strategy**: Chrome AI (local) + Gemini API (cloud)
- ✅ **Multimodal AI**: Text + Image + GPS context
- ✅ **Offline-First**: Knowledge base cached locally
- ✅ **Privacy-Focused**: On-device processing with Chrome AI
- ✅ **Real Chrome AI APIs**: Prompt API with multimodal support

## 🌟 Key Features

### 1. Hybrid AI Architecture
- **Primary**: Chrome Built-in AI (Gemini Nano) for instant, private responses
- **Fallback**: Gemini API for knowledge base generation when online
- **Smart Routing**: Automatically uses best available AI

### 2. Multimodal Capabilities
- 🖼️ **Image Recognition**: Identify plants, assess injuries, recognize landmarks
- 📍 **GPS Context**: Location-aware responses
- 💬 **Natural Chat**: Conversational AI assistant

### 3. Offline Knowledge Base
- 🏥 First aid guides generated for specific trail
- 🌿 Local plant identification (safe/poisonous/medicinal)
- 🦌 Wildlife information and safety tips
- 🧭 Navigation guidance and waypoints
- 📞 Emergency contacts for the region

### 4. GPS Simulation
- Real-time position tracking along trail
- Progress monitoring
- Distance and elevation data
- Variable speed simulation (1x, 2x, 5x)

## 🛠️ Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript
- **Styling**: Tailwind CSS 4
- **AI**: Chrome Built-in AI APIs (Prompt, Summarizer, Writer, etc.)
- **Backend**: Gemini API (Google Generative AI)
- **Storage**: Dexie (IndexedDB)
- **UI Components**: Radix UI

## 📋 Prerequisites

1. **Chrome Dev or Canary** (version 128+)
   - Download: https://www.google.com/chrome/dev/

2. **Chrome AI Flags Enabled** (see `/install` page for full guide)
   - `optimization-guide-on-device-model`: Enabled BypassPerfRequirement
   - `prompt-api-for-gemini-nano-multimodal-input`: Enabled
   - `summarization-api-for-gemini-nano`: Enabled
   - `writer-api`: Enabled
   - `rewriter-api`: Enabled
   - `proofreader-api`: Enabled

3. **Gemini API Key**
   - Get from: https://aistudio.google.com/app/apikey

## 🚀 Getting Started

### 1. Clone and Install

```bash
cd trail
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env.local` and add your Gemini API key:

```bash
cp .env.example .env.local
```

Edit `.env.local`:
```env
GEMINI_API_KEY=your_actual_api_key_here
```

### 3. Run Development Server

```bash
npm run dev
```

Open http://localhost:3000

### 4. Enable Chrome AI

1. Visit http://localhost:3000/install
2. Follow the step-by-step installation guide
3. Enable all required flags
4. Restart Chrome completely
5. Verify installation

### 5. Start Trail Session

1. Visit http://localhost:3000/trail
2. Start GPS simulator
3. Chat with AI assistant
4. Upload images for identification
5. Test demo scenarios from `DEMO_SCRIPTS.md`

## 📖 Demo Guide

See **`DEMO_SCRIPTS.md`** for complete demo flow and test queries.

Quick test:
1. Start GPS simulator (click Play)
2. Ask: "Where am I right now?"
3. Upload a plant image
4. Ask: "What plant is this? Is it safe?"

## 🏗️ Project Structure

```
trail/
├── app/
│   ├── api/
│   │   ├── chat/route.ts           # Gemini chat endpoint
│   │   └── generate-knowledge/     # Knowledge base generation
│   ├── install/page.tsx            # Chrome AI setup guide
│   ├── trail/page.tsx              # Main trail session page
│   ├── page.tsx                    # Landing page
│   ├── layout.tsx                  # Root layout
│   └── globals.css                 # Tailwind styles
├── components/
│   ├── ui/                         # Reusable UI components
│   └── GPSSimulator.tsx            # GPS position simulator
├── lib/
│   ├── ai.ts                       # Chrome AI integration
│   ├── gemini.ts                   # Gemini API (backend)
│   ├── db.ts                       # IndexedDB (Dexie)
│   ├── types.ts                    # TypeScript types
│   ├── utils.ts                    # Utility functions
│   └── mock-trail-data.ts          # Sample trail (Schuylkill River)
├── DEMO_SCRIPTS.md                 # Demo scenarios & test queries
└── README.md                       # This file
```

## 🎨 Chrome AI APIs Used

| API | Purpose | Status |
|-----|---------|--------|
| **Prompt API** | Main chat interface, multimodal queries | ✅ Primary |
| **Summarizer API** | Condense knowledge base sections | ✅ Implemented |
| **Writer API** | Generate trip notes/journals | ✅ Available |
| **Rewriter API** | Improve user notes | ✅ Available |
| **Proofreader API** | Fix grammar in messages | ✅ Available |

## 🔐 Privacy & Security

- **On-Device Processing**: All Chrome AI queries run locally (Gemini Nano)
- **No Tracking**: GPS data and images stay on device during offline use
- **Hybrid Strategy**: Cloud API only for initial knowledge base generation
- **Local Storage**: Trip data stored in IndexedDB (not cloud)

## 🧪 Testing Scenarios

### Basic Chat
- "Where am I?"
- "How far to next waypoint?"

### First Aid
- "I hurt my ankle, what should I do?"
- "Signs of dehydration?"

### Plant ID (with image)
- Upload plant photo → "Is this poisonous?"

### Wildlife
- "What animals might I see here?"

### Navigation
- "What landmarks should I look for?"

## 📦 Dependencies

Key packages:
- `next@16.0.0` - React framework
- `@google/generative-ai@0.24.1` - Gemini API
- `dexie@4.2.1` - IndexedDB wrapper
- `lucide-react@0.548.0` - Icons
- `tailwindcss@4` - Styling

## 🚧 Development Notes

### Chrome AI Session Pooling
The app uses a session pool (2 concurrent sessions) to avoid the ~18s overhead of creating new sessions on every query.

### Hybrid AI Strategy
```
User Query
    ↓
Try Chrome AI (local, fast, private)
    ↓ (if unavailable)
Fallback to Gemini API (cloud)
```

### GPS Simulation
- Uses real trail coordinates (Schuylkill River, Philadelphia)
- Generates 100 interpolated positions
- Simulates walking/running speed (2.5-4 m/s)

## 🐛 Troubleshooting

### "LanguageModel is not defined"
- Chrome AI not enabled. Visit `/install` for setup guide.

### "GEMINI_API_KEY not found"
- Add API key to `.env.local`

### Knowledge base generation fails
- Check Gemini API key is valid
- Ensure network connection for initial setup

### GPS simulator not working
- Refresh page
- Check console for errors

## 🤝 Contributing

This is a hackathon submission. For questions or suggestions:
- Open an issue on GitHub
- Contact: [your contact info]

## 📄 License

MIT License - see LICENSE file for details

## 🙏 Acknowledgments

- Google Chrome Built-in AI Team
- Gemini API team
- Next.js team
- Radix UI team
- Schuylkill River Trail (inspiration)

## 🎥 Demo Video

[Link to demo video - to be added]

---

**Built for Google Chrome Built-in AI Challenge 2025** 🚀

Showcasing the power of on-device AI for privacy-focused, offline-first applications.

