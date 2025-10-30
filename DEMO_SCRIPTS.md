# Trail Demo Scripts

Copy and paste these queries to demonstrate Trail's capabilities during your demo.

## 🗺️ Location & Navigation Queries

```
Where am I right now?
```

```
How far until the next waypoint?
```

```
What landmarks should I look for ahead?
```

```
Am I still on the right path?
```

```
What's the elevation at my current position?
```

## 🏥 First Aid & Safety Queries

```
I just fell and hurt my ankle. What should I do?
```

```
I think I'm getting dehydrated. What are the symptoms and what should I do?
```

```
I have a blister forming on my heel. How should I treat it?
```

```
What should I do if I see a snake on the trail?
```

```
My friend got a deep cut. What's the immediate first aid?
```

## 🌿 Plant Identification Queries

> **Note:** For these queries, upload a plant image first by clicking the image button, then send the query.

```
What plant is this? Is it safe to touch?
```

```
Is this plant edible or poisonous?
```

```
Can you identify this plant and tell me if it's native to this area?
```

```
I think this might be poison ivy - can you confirm?
```

## 🦌 Wildlife Questions

```
What wildlife might I encounter on this trail?
```

```
I just saw a large bird by the river. Can you help identify it?
```

```
What should I do if I encounter a deer on the trail?
```

```
Are there any dangerous animals I should watch out for?
```

## 🧭 Trail Information

```
How long is this trail and what's the difficulty level?
```

```
Where are the nearest water sources or rest stops?
```

```
What's the weather typically like on this trail this time of year?
```

```
Are there any challenging sections I should prepare for?
```

## 📸 Multimodal Queries (with images)

### For Plant ID
1. Click image upload button
2. Select a plant photo (download samples from URLs below)
3. Ask: `What plant is this? Is it poisonous?`

### For Injury Assessment
1. Upload photo of simulated injury
2. Ask: `I got this injury on the trail. What should I do?`

### For Landmark Recognition
1. Upload trail landmark photo
2. Ask: `Where is this location? Am I close to it?`

## 🔗 Sample Images for Testing

Download these for multimodal demos:

**Poison Ivy (to test plant ID):**
- Search: "poison ivy leaves" on Unsplash/Pexels
- Example: https://unsplash.com/s/photos/poison-ivy

**Wild Edible Plants:**
- Search: "dandelion plant" or "wild garlic"
- Example: https://unsplash.com/s/photos/dandelion-plant

**Trail Landmarks:**
- Search: "fairmount water works philadelphia"
- Search: "schuylkill river trail"

**First Aid Scenarios:**
- Search: "sprained ankle" or "hiking blister"
- Example: https://unsplash.com/s/photos/ankle-injury

## 🎯 Full Demo Flow Example

1. **Start GPS simulator** → Click Play
2. **Ask location:** "Where am I right now?"
3. **Check knowledge:** "What should I know about first aid on this trail?"
4. **Upload plant image:** Use poison ivy photo
5. **Ask about plant:** "Is this plant dangerous?"
6. **Simulate injury:** "I twisted my ankle, what should I do?"
7. **Check progress:** "How much farther to the end?"
8. **Wildlife question:** "What animals might I see here?"

## 💡 Tips for Best Demo

- **Start GPS simulator first** - sets context for location-based answers
- **Upload images** to showcase multimodal Chrome AI capabilities
- **Mix text and image queries** to show versatility
- **Emphasize offline functionality** - no network calls for Chrome AI responses
- **Show fallback** - disable Chrome AI flags to show Gemini API fallback

## 🚀 Advanced Scenarios

```
I'm running low on water and need to find the nearest exit. What are my options?
```

```
The trail seems to fork ahead. Which direction should I take to stay on the main path?
```

```
I found something that looks like a mushroom. Can you identify it? Is it edible?
```

```
There's a group of geese blocking the path. What should I do?
```

```
My friend is feeling dizzy and nauseous. Could this be heat exhaustion?
```

## 📊 Highlighting Key Features

When demoing, emphasize these points:

1. **Hybrid AI Strategy:**
   - Chrome AI (local) for fast, private responses
   - Gemini API (cloud) as fallback when offline AI unavailable
   
2. **Multimodal Support:**
   - Text + Image understanding
   - GPS context awareness
   - Real-time position tracking

3. **Privacy:**
   - All Chrome AI processing happens on-device
   - GPS and photos never leave device (unless using cloud fallback)
   
4. **Offline Knowledge Base:**
   - Generated once online via Gemini
   - Cached locally for entire trip
   - Covers first aid, plants, wildlife, navigation

5. **Real-time Context:**
   - GPS position included in every query
   - Distance calculations
   - Location-aware responses

