# Trail App - Proper Architecture

## The Problem
Current implementation generates knowledge base EVERY time you visit `/trail`, which is:
- ❌ Slow (takes 5-10 seconds each time)
- ❌ Wrong timing (should happen during trip creation, not during trip)
- ❌ Requires internet during the trip (defeats the purpose!)

## The Solution

### Phase 1: Trip Creation (ONLINE - uses Gemini)
**Page:** `/builder/new`

User inputs:
- Start point
- End point  
- Purpose (running, hiking, cycling, etc.)
- Difficulty
- Is round trip?

Gemini generates **EVERYTHING** needed for offline use:
1. **GPS Path** - Full route with 100+ waypoints
2. **Landmarks** - All POIs along the route
3. **Knowledge Base:**
   - First aid specific to this activity
   - Local plant identification
   - Wildlife information for this region
   - Navigation tips for this trail
   - Emergency contacts for this location
4. **Safety Info** - Nearby hospitals, police, park rangers
5. **Trail Conditions** - Terrain, elevation, difficulty

All this data is saved to **IndexedDB** (Dexie).

### Phase 2: Trip Session (OFFLINE - uses Chrome AI)
**Page:** `/trip/[id]`

Loads pre-generated data from IndexedDB:
- No Gemini API calls
- No internet required
- Chrome AI uses the knowledge base as context
- GPS simulator uses pre-generated path
- Chat works completely offline

## File Structure

```
app/
├── page.tsx                    ✅ Landing (fixed "Chrome Dev")
├── install/page.tsx            ✅ Chrome AI setup
├── trips/page.tsx              ✅ List all trips
└── trip/
    ├── new/page.tsx           ✅ Create trip (Gemini generation)
    └── [id]/page.tsx          ✅ Trip session (Chrome AI + pre-saved data)

lib/
├── gemini.ts                   ✅ Backend Gemini API
├── ai.ts                       ✅ Chrome AI (Gemini Nano)
├── db.ts                       🔄 Updated schema for Trip
└── types.ts                    🔄 Trip, KnowledgeBase, TripSession

```

## Data Flow

### Creating a Trip
```
User fills form in /trip/new
    ↓
Click "Generate Trip"
    ↓
Gemini API generates comprehensive data
    ↓
Save to IndexedDB
    ↓
Redirect to /trips
```

### During a Trip
```
User clicks trip in /trips
    ↓
Navigate to /trip/[id]
    ↓
Load data from IndexedDB (no API call!)
    ↓
Chrome AI uses knowledge base for chat
    ↓
GPS simulator uses pre-generated path
    ↓
Everything works offline!
```

## Gemini Prompt Enhancement

Current prompt is basic. New prompt will generate:

```typescript
{
  name: "Schuylkill River Run",
  route: {
    gpsPath: [ /* 100+ GPS coordinates */ ],
    landmarks: [
      { name: "Fairmount Water Works", lat, lon, description, type: "poi" },
      { name: "Lloyd Hall", lat, lon, description, type: "start" },
      // ... more landmarks
    ],
    waypoints: [ /* checkpoint locations */ ]
  },
  knowledgeBase: {
    firstAid: "...", // Activity-specific
    plants: "...",    // Region-specific
    wildlife: "...",  // Location-specific
    navigation: "...", // Trail-specific
    emergency: "..."  // Local contacts
  },
  safetyInfo: {
    hospitals: [{ name, address, phone, lat, lon }],
    police: { phone, non-emergency },
    parkRangers: { phone }
  },
  trailInfo: {
    terrain: "paved",
    surface: "asphalt",
    elevation: { gain: 45, loss: 45 },
    difficulty: "easy",
    warnings: []
  }
}
```

## Implementation Plan

1. ✅ Fix "Chrome Canary" → "Chrome Dev" on landing
2. 🔄 Update types and DB schema
3. 🆕 Create `/trips` page (list trips)
4. 🆕 Create `/builder/[id]` page (trip creation with Gemini)
5. 🆕 Create `/trip/[id]` page (trip session with Chrome AI)
6. 🗑️ Remove old `/trail` page
7. 🔄 Enhance Gemini prompts for comprehensive data generation
8. ✅ Test offline functionality

## Benefits

✅ **Faster** - No waiting during trip, generation happens once
✅ **Offline** - Everything pre-loaded, Chrome AI works without internet
✅ **Better Context** - Gemini generates detailed, location-specific knowledge
✅ **Realistic** - Matches actual use case (plan at home, use on trail)

