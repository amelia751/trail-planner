# Test Images for Trail App

## Landmarks (Schuylkill River Trail, Philadelphia)

### Major Landmarks
1. **boathouse_row.jpg** - Famous Philadelphia boathouses along Kelly Drive
2. **fairmount_water_works.jpg** - Historic water pumping station
3. **lloyd_hall.jpg** - Starting point of the trail
4. **philadelphia_museum_art.jpg** - The iconic "Rocky Steps" museum
5. **schuylkill_river_view.jpg** - General river view

### Plants
6. **plant_oak_leaf.jpg** - Common oak tree leaf (safe)
7. **plant_poison_ivy.jpg** - Poison ivy (dangerous, do not touch!)

### Wildlife
8. **wildlife_mallard_duck.jpg** - Common mallard ducks on the river
9. **wildlife_deer.jpg** - White-tailed deer (common in Fairmount Park)
10. **wildlife_squirrel.jpg** - Eastern gray squirrel (very common)

## Usage in Tests

### Landmark Recognition Test
```
1. Upload: boathouse_row.jpg
   Ask: "Where am I?"
   Expected: "You're near Boathouse Row..."

2. Upload: philadelphia_museum_art.jpg
   Ask: "What landmark is this?"
   Expected: "This is the Philadelphia Museum of Art..."
```

### Plant Identification Test
```
1. Upload: plant_oak_leaf.jpg
   Ask: "What plant is this?"
   Expected: "This is an oak leaf..."

2. Upload: plant_poison_ivy.jpg
   Ask: "Is this safe to touch?"
   Expected: "This is poison ivy! Do not touch..."
```

### Wildlife Identification Test
```
1. Upload: wildlife_mallard_duck.jpg
   Ask: "What bird is this?"
   Expected: "This is a Mallard duck..."

2. Upload: wildlife_deer.jpg
   Ask: "Is this dangerous?"
   Expected: "This is a white-tailed deer. Generally not dangerous..."
```

## Test Scenarios

### Scenario 1: Lost on Trail
```
Upload: schuylkill_river_view.jpg
Ask: "Where am I? I think I'm lost"
Expected: AI helps identify location using landscape features
```

### Scenario 2: Emergency Identification
```
Upload: plant_poison_ivy.jpg
Ask: "I touched this plant, what should I do?"
Expected: AI identifies poison ivy and provides first aid
```

### Scenario 3: Progress Check
```
Upload: boathouse_row.jpg
Ask: "How far have I come?"
Expected: AI uses landmark + GPS to calculate progress
```

## Image Sources

All images from Wikimedia Commons (Public Domain / CC licenses):
- https://commons.wikimedia.org/

These are safe to use for testing and demonstration purposes.

