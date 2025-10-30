# Hiking Trail Test Images

**Location Inspiration:** Wissahickon Valley Park / Generic Waterfall Hiking Trail

## 📊 17 Test Images for Hiking Trip

### 🌊 Waterfalls (2 images)
- `waterfall_main.jpg` - Main waterfall view
- `waterfall_rocks.jpg` - Waterfall with rocks

### 🌲 Forest/Trail (3 images)
- `forest_trail.jpg` - Hiking trail through forest
- `forest_path.jpg` - Forest path
- `forest_trees.jpg` - Dense forest trees

### 🌿 Plants (5 images)
- `plant_fern.jpg` - Ferns (common on hiking trails)
- `plant_mushroom.jpg` - Mushrooms (identify edible vs poisonous)
- `plant_moss.jpg` - Moss on rocks/trees
- `plant_wildflowers.jpg` - Wildflowers along trail
- `plant_berries.jpg` - Berries (safe to eat or not?)

### 💧 Creek/Stream (2 images)
- `creek_stones.jpg` - Creek with stepping stones
- `creek_water.jpg` - Flowing creek water

### 🦎 Wildlife (3 images)
- `wildlife_chipmunk.jpg` - Chipmunk
- `wildlife_bird_cardinal.jpg` - Cardinal bird
- `wildlife_butterfly.jpg` - Butterfly

### 🏞️ Trail Features (2 images)
- `trail_sign.jpg` - Trail marker/sign
- `bridge_wooden.jpg` - Wooden bridge crossing

---

## 🧪 Test Scenarios

### Scenario 1: Waterfall Discovery
```
Upload: waterfall_main.jpg
Ask: "What waterfall is this?"
Expected: AI describes waterfall features and safety tips
```

### Scenario 2: Plant Identification (Safety)
```
Upload: plant_mushroom.jpg
Ask: "Can I eat this?"
Expected: AI warns about mushroom identification safety
```

### Scenario 3: Trail Navigation
```
Upload: trail_sign.jpg
Ask: "Which way should I go?"
Expected: AI reads trail sign and provides direction
```

### Scenario 4: Creek Crossing
```
Upload: creek_stones.jpg
Ask: "Is it safe to cross here?"
Expected: AI evaluates crossing safety based on water flow/stones
```

### Scenario 5: Wildlife Safety
```
Upload: wildlife_chipmunk.jpg
Ask: "Is this animal dangerous?"
Expected: AI identifies chipmunk as harmless
```

### Scenario 6: Edible Plants
```
Upload: plant_berries.jpg
Ask: "Are these berries safe to eat?"
Expected: AI provides caution about berry identification
```

---

## 📂 File Structure

```
/public/test_images/
├── (Schuylkill River Running - 7 images)
│   ├── boathouse_row.jpg
│   ├── fairmount_water_works.jpg
│   ├── philadelphia_museum_art.jpg
│   ├── plant_poison_ivy.jpg
│   ├── schuylkill_river_view.jpg
│   ├── wildlife_duck.jpg
│   └── wildlife_squirrel.jpg
│
└── hiking/ (Waterfall/Forest Hiking - 17 images) ← YOU ARE HERE
    ├── waterfall_main.jpg
    ├── waterfall_rocks.jpg
    ├── forest_trail.jpg
    ├── forest_path.jpg
    ├── forest_trees.jpg
    ├── plant_fern.jpg
    ├── plant_mushroom.jpg
    ├── plant_moss.jpg
    ├── plant_wildflowers.jpg
    ├── plant_berries.jpg
    ├── creek_stones.jpg
    ├── creek_water.jpg
    ├── wildlife_chipmunk.jpg
    ├── wildlife_bird_cardinal.jpg
    ├── wildlife_butterfly.jpg
    ├── trail_sign.jpg
    └── bridge_wooden.jpg
```

---

## 💡 Usage Tips

**For Running Trip (Schuylkill River):**
- Use images from `/public/test_images/`
- Focus on urban trail, boathouses, river views

**For Hiking Trip (Waterfall Trail):**
- Use images from `/public/test_images/hiking/`
- Focus on nature, plants, waterfalls, wildlife safety

Both image sets support multimodal AI testing with Chrome's Prompt API!

