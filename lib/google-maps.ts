// Google Maps API integration for accurate GPS routes and landmarks
// Combined with Gemini for contextual knowledge base

const GOOGLE_MAPS_API_KEY = (process.env.GOOGLE_MAPS_API_KEY || '').trim();

interface Coordinates {
  latitude: number;
  longitude: number;
}

interface Place {
  name: string;
  lat: number;
  lon: number;
  description: string;
  type: string;
}

/**
 * Decode Google Maps polyline format to GPS coordinates
 * Algorithm: https://developers.google.com/maps/documentation/utilities/polylinealgorithm
 */
function decodePolyline(encoded: string): Array<{ lat: number; lon: number }> {
  const polyline = require('polyline');
  const coords = polyline.decode(encoded);
  return coords.map((coord: [number, number]) => ({
    lat: coord[0],
    lon: coord[1],
  }));
}

/**
 * Get accurate walking route from Google Maps Routes API
 */
export async function getGoogleMapsRoute(params: {
  startPoint: string;
  endPoint: string;
}): Promise<{
  gpsPath: Array<{ lat: number; lon: number; altitude?: number }>;
  distance: number;
  duration: number;
}> {
  const response = await fetch('https://routes.googleapis.com/directions/v2:computeRoutes', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': GOOGLE_MAPS_API_KEY,
      'X-Goog-FieldMask': 'routes.duration,routes.distanceMeters,routes.polyline.encodedPolyline',
    },
    body: JSON.stringify({
      origin: { address: params.startPoint },
      destination: { address: params.endPoint },
      travelMode: 'WALK',
    }),
  });

  if (!response.ok) {
    throw new Error(`Google Maps API error: ${response.status}`);
  }

  const data = await response.json();
  
  if (!data.routes || data.routes.length === 0) {
    throw new Error('No route found');
  }

  const route = data.routes[0];
  const encoded = route.polyline.encodedPolyline;
  
  // Decode polyline to GPS coordinates
  const coords = decodePolyline(encoded);
  
  // Add altitude (estimated, Google Maps doesn't provide this in Routes API)
  const gpsPath = coords.map((coord: any, i: number) => ({
    lat: coord.lat,
    lon: coord.lon,
    altitude: 10 + Math.sin((i / coords.length) * Math.PI) * 20, // Gentle elevation changes
  }));

  return {
    gpsPath,
    distance: route.distanceMeters / 1000, // Convert to km
    duration: parseInt(route.duration.replace('s', '')), // Seconds
  };
}

/**
 * Find landmarks along the route using Google Places API
 */
export async function findLandmarksAlongRoute(params: {
  gpsPath: Array<{ lat: number; lon: number }>;
}): Promise<Place[]> {
  const landmarks: Place[] = [];
  
  // Sample points along the route (start, 25%, 50%, 75%, end)
  const sampleIndices = [
    0,
    Math.floor(params.gpsPath.length * 0.25),
    Math.floor(params.gpsPath.length * 0.50),
    Math.floor(params.gpsPath.length * 0.75),
    params.gpsPath.length - 1,
  ];

  // Search for landmarks near each sample point
  for (const idx of sampleIndices) {
    const point = params.gpsPath[idx];
    
    try {
      const response = await fetch('https://places.googleapis.com/v1/places:searchNearby', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': GOOGLE_MAPS_API_KEY,
          'X-Goog-FieldMask': 'places.displayName,places.location,places.types,places.primaryTypeDisplayName',
        },
        body: JSON.stringify({
          locationRestriction: {
            circle: {
              center: {
                latitude: point.lat,
                longitude: point.lon,
              },
              radius: 300.0, // 300m radius
            },
          },
          maxResultCount: 3,
          includedTypes: ['tourist_attraction', 'park', 'museum', 'historical_landmark'],
        }),
      });

      if (response.ok) {
        const data = await response.json();
        
        if (data.places) {
          for (const place of data.places) {
            // Avoid duplicates
            if (landmarks.find(l => l.name === place.displayName.text)) {
              continue;
            }

            landmarks.push({
              name: place.displayName.text,
              lat: place.location.latitude,
              lon: place.location.longitude,
              description: place.primaryTypeDisplayName?.text || 'Point of interest',
              type: idx === 0 ? 'start' : idx === sampleIndices[sampleIndices.length - 1] ? 'end' : 'poi',
            });
          }
        }
      }
    } catch (error) {
      console.error('Error fetching places:', error);
    }
  }

  return landmarks;
}

/**
 * HYBRID: Combine Google Maps (GPS + landmarks) with Gemini (knowledge base)
 */
export async function generateHybridTripData(params: {
  startPoint: string;
  endPoint: string;
  purpose: string;
  difficulty: string;
  isRoundTrip?: boolean;
}) {
  console.log('🗺️  Fetching route from Google Maps...');
  
  // 1. Get accurate GPS route from Google Maps
  const route = await getGoogleMapsRoute({
    startPoint: params.startPoint,
    endPoint: params.endPoint,
  });

  console.log(`✅ Got ${route.gpsPath.length} GPS points from Google Maps`);

  // If round trip, duplicate and reverse the path
  if (params.isRoundTrip) {
    const returnPath = [...route.gpsPath].reverse();
    route.gpsPath = [...route.gpsPath, ...returnPath];
    route.distance *= 2;
    route.duration *= 2;
  }

  console.log('🏛️  Finding landmarks with Google Places...');
  
  // 2. Find real landmarks along the route
  const landmarks = await findLandmarksAlongRoute({
    gpsPath: route.gpsPath,
  });

  console.log(`✅ Found ${landmarks.length} landmarks`);

  // 3. Use Gemini to generate contextual knowledge base
  console.log('🤖 Generating knowledge base with Gemini...');
  
  const { generateTripData } = await import('./gemini');
  const geminiData = await generateTripData(params);

  console.log('✅ Knowledge base generated');

  // 4. Combine everything
  return {
    route: {
      gpsPath: route.gpsPath,
      landmarks,
      distance: route.distance,
      elevationGain: geminiData.route.elevationGain, // Use Gemini's estimate
    },
    knowledgeBase: geminiData.knowledgeBase, // Use Gemini's contextual info
  };
}

