# Trail App - Complete Test Script

## 🎯 Test Scenario: Schuylkill River Running Marathon

**Route:** Lloyd Hall → Manayunk (and back)  
**Distance:** ~17 km round trip  
**Purpose:** Running  
**Landmarks:** Fairmount Water Works, Boathouse Row, Art Museum, Falls Bridge

---

## Phase 1: Trip Creation (ONLINE - Uses Gemini)

### Step 1: Navigate to Landing Page
```
Open: http://localhost:3000
Expected: See landing page with 4-panel manga grid
Verify: Chrome AI status detected
```

### Step 2: Go to Trips Page
```
Click: "Go to Trips" button
Expected: Empty trips page with animation
Verify: "Plan New Trip" button visible
```

### Step 3: Create New Trip
```
Click: "Plan New Trip"
Expected: Redirect to /trip/new
```

### Step 4: Quick Fill Trip Details
```
Click: "Quick Fill" button
Expected form values:
- Name: "Schuylkill River Run"
- Start: "Lloyd Hall, Philadelphia"
- End: "Manayunk Main Street, Philadelphia"
- Purpose: Running
- Difficulty: Moderate
- Round Trip: No
```

### Step 5: Generate Trip with Gemini
```
Click: "Generate Trip"
Expected:
- Progress bar appears (10% → 30% → 70% → 100%)
- Console shows: "🚀 Generating trip data with Gemini..."
- Takes 3-10 seconds
- Shows: "✅ Trip data generated"
- Auto-redirects to /trips
```

**What Gemini Generated (check console):**
- ✅ GPS Path: 20-30 waypoints
- ✅ Landmarks: 5-10 points of interest
- ✅ Distance: ~8-10 km
- ✅ Elevation gain
- ✅ Knowledge Base:
  - First Aid for running
  - Local plants (Schuylkill River region)
  - Wildlife info
  - Navigation tips
  - Emergency contacts (Philadelphia area)

### Step 6: Verify Trip Saved
```
Page: /trips
Expected: See 1 trip card
Verify:
- Trip name: "Schuylkill River Run"
- Route: "Lloyd Hall → Manayunk"
- Tags: Running, Moderate, ~8-10 km
- Buttons: "Start Trip" and "Edit"
```

---

## Phase 2: Trip Session (OFFLINE - Uses Chrome AI)

### Step 7: Start Trip
```
Click: "Start Trip" button
Expected: Redirect to /trip/[id]
Layout:
- Header: Back button, Trip name, stats
- Left: GPS Simulator
- Right: Chat interface
```

### Step 8: Check Welcome Message
```
Expected in chat:
"Welcome to your Running trip from Lloyd Hall to Manayunk! 🎒

I'm your offline trail assistant powered by Chrome AI. I have access to:
- GPS route with XX waypoints
- X landmarks along the trail
- Complete knowledge base for Running

I can help with navigation, identify plants/wildlife, provide first aid tips..."
```

### Step 9: Test GPS Simulator
```
Expected:
- Current position shown
- Lat/Lon coordinates
- Buttons: Play, Pause, Reset, Speed controls
- Position updates every second when playing
```

### Step 10: Test Chrome AI Chat (Navigation)

**Test 1: Basic Navigation**
```
User: "Where am I?"
Expected: Chrome AI uses GPS + landmarks to describe location
Example: "Based on your GPS, you're near Lloyd Hall at the start of your route..."
```

**Test 2: Next Waypoint**
```
User: "What's the next landmark?"
Expected: References the saved landmarks
Example: "The next landmark is Fairmount Water Works, approximately 1 km ahead..."
```

**Test 3: Route Progress**
```
User: "How far have I gone?"
Expected: Uses GPS position to calculate
Example: "You've covered approximately X km of your 8.5 km route..."
```

### Step 11: Test Chrome AI Chat (First Aid)

```
User: "I have a blister on my heel, what should I do?"
Expected: Uses pre-saved first aid knowledge base
Example: "For blister treatment while running:
1. Stop immediately...
2. Clean the area...
3. Apply moleskin padding..."
```

```
User: "I'm feeling dehydrated"
Expected: Running-specific first aid advice
Example: "Dehydration symptoms include...
Immediate steps:
1. Find shade and rest
2. Sip water slowly..."
```

### Step 12: Test Chrome AI Chat (Multimodal - Plant ID)

**Before test:** Download test images (see downloaded_images/ folder)

```
Action:
1. Click image upload button (or drag & drop)
2. Upload: schuylkill_plant_1.jpg (should be an oak leaf or common plant)
3. Type: "What plant is this?"

Expected: Chrome AI analyzes image using multimodal API
Example: "This appears to be an Oak leaf. Oak trees are common along the Schuylkill River Trail..."
```

```
Upload: schuylkill_wildlife_1.jpg (should be a duck or bird)
Type: "Is this dangerous?"

Expected: Uses wildlife knowledge base
Example: "This is a Mallard duck, commonly seen along the Schuylkill River. They are not dangerous..."
```

### Step 13: Test Chrome AI Chat (Landmark Recognition)

```
Upload: boathouse_row.jpg
Type: "Where am I?"

Expected: Recognizes landmark from saved data
Example: "Based on the image, you appear to be near Boathouse Row, a famous Philadelphia landmark..."
```

### Step 14: Test Offline Functionality

```
Action:
1. Open Chrome DevTools
2. Network tab → Set to "Offline"
3. Try sending chat messages

Expected:
- Chat still works! (Chrome AI runs locally)
- GPS simulator still works
- Knowledge base accessible
- NO new API calls to server
```

---

## Phase 3: Edge Cases & Features

### Test 15: Multiple Trips
```
Action:
1. Go back to /trips
2. Create another trip (different route)
3. Verify both trips show in list
```

### Test 16: Delete Trip
```
Action:
1. Click trash icon on a trip
2. Confirm deletion
Expected: Trip removed from list
```

### Test 17: Edit Trip
```
Action:
1. Click "Edit" on existing trip
2. Change some details
3. Regenerate

Expected: Trip updated with new data
```

### Test 18: Drag & Drop Image Upload
```
Action:
1. In chat, drag image file over chat input
2. Drop it
Expected: Image preview appears, ready to send
```

### Test 19: GPS Position in Message
```
Expected: Each user message includes GPS coordinates
Verify: Can see "📍 Lat: XX.XXXX, Lon: XX.XXXX" on user messages
```

---

## 🧪 Quick Copy-Paste Chat Tests

### Navigation Tests
```
Where am I?
What's the next landmark?
How far until the end?
What landmarks are nearby?
Show me the route
```

### First Aid Tests
```
I have a blister, help!
What should I do if I fall and scrape my knee?
Symptoms of dehydration?
I think I twisted my ankle
Emergency contacts?
```

### Plant/Wildlife Tests (with images)
```
What plant is this?
Is this poisonous?
Can I eat this?
What animal is this?
Is this dangerous?
```

### General Questions
```
Tell me about this trail
Weather tips for running?
What should I bring?
Best time to run this trail?
Are there water fountains?
```

---

## ✅ Success Criteria

**Phase 1 (Trip Creation):**
- ✅ Gemini generates route with 20-30 waypoints
- ✅ Gemini generates 5-10 landmarks
- ✅ Knowledge base has all 5 sections
- ✅ Trip saved to IndexedDB
- ✅ Takes < 15 seconds

**Phase 2 (Trip Session):**
- ✅ All data loads from IndexedDB (no API calls)
- ✅ Chrome AI responds to questions
- ✅ GPS simulator works
- ✅ Multimodal image analysis works
- ✅ Chat references knowledge base
- ✅ Works completely offline

**Phase 3 (User Experience):**
- ✅ Can create multiple trips
- ✅ Can delete trips
- ✅ Can edit trips
- ✅ Drag & drop works
- ✅ UI is responsive and smooth

---

## 🐛 Known Issues to Check

1. **Chrome AI not available?**
   - Solution: Go to /install and follow setup

2. **Gemini API fails?**
   - Check: .env.local has GEMINI_API_KEY
   - Check: Console for error details

3. **Images not working?**
   - Ensure Chrome flag enabled: `prompt-api-for-gemini-nano-multimodal-input`

4. **Trip not saving?**
   - Check: IndexedDB in DevTools → Application → Storage

---

## 📊 Performance Benchmarks

**Trip Creation (Online):**
- API call: 3-10 seconds
- Save to IndexedDB: < 100ms

**Trip Session (Offline):**
- Load trip: < 200ms
- Chrome AI response: 1-3 seconds
- GPS update: 60 FPS smooth

---

## 🎬 Video Demo Script

1. **Intro (10s):** Show landing page, explain concept
2. **Create Trip (30s):** Quick fill → Generate → Show progress
3. **View Trips (10s):** Show trip card with details
4. **Start Session (60s):** 
   - Show GPS simulator
   - Ask navigation question
   - Upload plant image
   - Ask first aid question
5. **Offline Demo (20s):** Toggle offline, show it still works
6. **Outro (10s):** Show multiple trips, explain use case

Total: ~2 minutes

