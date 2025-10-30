# Trail - Quick Setup Guide

## ⚡ Quick Start (5 minutes)

### 1. Get Your Gemini API Key

You need a Gemini API key for the backend knowledge base generation:

1. Go to https://aistudio.google.com/app/apikey
2. Click "Create API Key"
3. Copy the key

### 2. Add API Key to Environment

Open `.env.local` and replace the placeholder:

```env
GEMINI_API_KEY=your_actual_api_key_here
```

Paste your real API key (starts with `AIza...`).

### 3. Start the Development Server

```bash
npm run dev
```

Server will start at http://localhost:3000

### 4. Install Chrome AI

1. Open http://localhost:3000
2. If you see "Chrome AI not detected", click "Install Chrome AI"
3. Follow the step-by-step guide at http://localhost:3000/install
4. This takes about 10-15 minutes (includes ~1.7GB model download)

### 5. Start Your Trail Session

1. Once Chrome AI is detected, click "Start Trail Session"
2. You'll be at http://localhost:3000/trail
3. Click Play on the GPS simulator
4. Start chatting with your AI trail companion!

## 🎯 Testing the App

### Quick Test Flow:

1. **Start GPS**: Click Play button on GPS Simulator
2. **Ask location**: Type "Where am I right now?"
3. **Test first aid**: Type "I twisted my ankle, what should I do?"
4. **Upload image**: Click image button, select a plant photo
5. **Identify plant**: Type "What plant is this?"

### Use Demo Scripts

Copy queries from `DEMO_SCRIPTS.md` for comprehensive testing.

## 🔧 What Each File Does

- **`.env.local`**: Your API keys (gitignored, never commit!)
- **`lib/gemini.ts`**: Backend Gemini API integration
- **`lib/ai.ts`**: Chrome AI (Gemini Nano) client-side
- **`app/trail/page.tsx`**: Main trail session interface
- **`components/GPSSimulator.tsx`**: Simulates GPS tracking

## 💡 Key Points

1. **Gemini API Key is REQUIRED** - The app won't work without it
   - Used ONLY for generating knowledge base when you start a trip
   - NOT used during the trip (Chrome AI handles that offline)

2. **Chrome AI is OPTIONAL but RECOMMENDED**
   - With Chrome AI: Fast, private, offline
   - Without Chrome AI: Falls back to Gemini API (requires internet)

3. **Two-Stage Architecture**:
   - **Stage 1 (Online)**: Gemini API generates knowledge base
   - **Stage 2 (Offline)**: Chrome AI answers all your questions

## 🚨 Troubleshooting

### "GEMINI_API_KEY not found"
- You forgot to add your API key to `.env.local`
- Make sure the file is named exactly `.env.local` (not `.env` or `.env.example`)

### "Failed to generate knowledge base"
- Check your Gemini API key is valid
- Make sure you have internet connection (needed once at start)
- Check console for detailed error message

### Chrome AI not working
- Visit http://localhost:3000/install
- Follow ALL steps carefully
- Most common issue: forgetting to restart Chrome after enabling flags

### GPS Simulator stuck
- Click the Reset button (↻)
- Refresh the page

## 📚 Next Steps

1. **Read `DEMO_SCRIPTS.md`** for test scenarios
2. **Read `README.md`** for full documentation
3. **Prepare demo video** showing key features
4. **Gather feedback** and iterate

## 🎥 Recording Your Demo

Tips for a great demo video:

1. **Show landing page** - explain the concept
2. **Show install process** - demonstrate Chrome AI setup
3. **Start trail session** - show knowledge base generation
4. **Test queries** - use scripts from DEMO_SCRIPTS.md
5. **Upload images** - showcase multimodal capabilities
6. **Emphasize offline** - show it works without network (after initial setup)

Keep it under 3 minutes! Focus on:
- Hybrid AI strategy
- Offline capability
- Multimodal support (text + image + GPS)
- Privacy benefits

Good luck with your hackathon submission! 🚀

