// Mock trail data for Schuylkill River Trail in Philadelphia
// Simulates a hiking/running trail with waypoints

import type { Trail, TrailWaypoint, GPSPosition } from './types';

export const SCHUYLKILL_RIVER_TRAIL: Trail = {
  id: 'schuylkill-river-trail',
  name: 'Schuylkill River Trail',
  description: 'A scenic long-distance trail along the Schuylkill River in Philadelphia, from Lloyd Hall to Manayunk and back.',
  difficulty: 'moderate',
  distance: 17.2,
  elevationGain: 85,
  coordinates: [
    // Lloyd Hall area
    { lat: 39.9526, lon: -75.1652 }, // Start: Lloyd Hall
    { lat: 39.9535, lon: -75.1665 },
    { lat: 39.9545, lon: -75.1680 },
    { lat: 39.9555, lon: -75.1690 },
    
    // Boathouse Row
    { lat: 39.9565, lon: -75.1700 },
    { lat: 39.9575, lon: -75.1710 },
    { lat: 39.9580, lon: -75.1720 }, // Fairmount Water Works
    
    // Past Museum of Art
    { lat: 39.9590, lon: -75.1735 },
    { lat: 39.9600, lon: -75.1745 },
    { lat: 39.9610, lon: -75.1755 },
    { lat: 39.9620, lon: -75.1765 },
    
    // Towards East Falls
    { lat: 39.9630, lon: -75.1775 },
    { lat: 39.9640, lon: -75.1785 },
    { lat: 39.9650, lon: -75.1800 }, // East Falls Bridge
    { lat: 39.9660, lon: -75.1810 },
    
    // Falls Bridge area
    { lat: 39.9670, lon: -75.1820 },
    { lat: 39.9680, lon: -75.1828 },
    { lat: 39.9690, lon: -75.1835 },
    { lat: 39.9700, lon: -75.1842 },
    
    // Approaching Manayunk
    { lat: 39.9710, lon: -75.1850 },
    { lat: 39.9720, lon: -75.1858 }, // Manayunk Towpath
    { lat: 39.9730, lon: -75.1868 },
    { lat: 39.9740, lon: -75.1880 },
    { lat: 39.9750, lon: -75.1900 }, // Manayunk Main Street
    
    // Return journey (same path back)
    { lat: 39.9740, lon: -75.1880 },
    { lat: 39.9730, lon: -75.1868 },
    { lat: 39.9720, lon: -75.1858 },
    { lat: 39.9710, lon: -75.1850 },
    { lat: 39.9700, lon: -75.1842 },
    { lat: 39.9690, lon: -75.1835 },
    { lat: 39.9680, lon: -75.1828 },
    { lat: 39.9670, lon: -75.1820 },
    { lat: 39.9660, lon: -75.1810 },
    { lat: 39.9650, lon: -75.1800 },
    { lat: 39.9640, lon: -75.1785 },
    { lat: 39.9630, lon: -75.1775 },
    { lat: 39.9620, lon: -75.1765 },
    { lat: 39.9610, lon: -75.1755 },
    { lat: 39.9600, lon: -75.1745 },
    { lat: 39.9590, lon: -75.1735 },
    { lat: 39.9580, lon: -75.1720 },
    { lat: 39.9575, lon: -75.1710 },
    { lat: 39.9565, lon: -75.1700 },
    { lat: 39.9555, lon: -75.1690 },
    { lat: 39.9545, lon: -75.1680 },
    { lat: 39.9535, lon: -75.1665 },
    { lat: 39.9526, lon: -75.1652 }, // Back to Lloyd Hall
  ],
  waypoints: [
    {
      id: 'start',
      name: 'Lloyd Hall Start',
      description: 'Starting point at Lloyd Hall, historic boat house along the river',
      lat: 39.9526,
      lon: -75.1652,
      altitude: 10,
      type: 'start',
      order: 0,
    },
    {
      id: 'wp1',
      name: 'Fairmount Water Works',
      description: 'Historic waterworks and scenic overlook',
      lat: 39.9580,
      lon: -75.1720,
      altitude: 15,
      type: 'poi',
      order: 1,
    },
    {
      id: 'wp2',
      name: 'East Falls Bridge',
      description: 'Bridge crossing with great river views',
      lat: 39.9650,
      lon: -75.1800,
      altitude: 20,
      type: 'checkpoint',
      order: 2,
    },
    {
      id: 'wp3',
      name: 'Manayunk Towpath',
      description: 'Historic canal towpath section',
      lat: 39.9720,
      lon: -75.1850,
      altitude: 25,
      type: 'poi',
      order: 3,
    },
    {
      id: 'end',
      name: 'Manayunk Main Street',
      description: 'Trail end point near Manayunk shops and restaurants',
      lat: 39.9750,
      lon: -75.1900,
      altitude: 30,
      type: 'end',
      order: 4,
    },
  ],
};

// Generate realistic GPS positions with natural variations
export function generateRealisticGPSPath(
  routeCoordinates: Array<{ lat: number; lon: number }>,
  pointsCount: number = 800
): GPSPosition[] {
  const positions: GPSPosition[] = [];
  const segments = routeCoordinates.length - 1;
  const pointsPerSegment = Math.floor(pointsCount / segments);
  
  // Add some realism: GPS drift, speed variations, etc.
  let currentSpeed = 2.5; // m/s
  let currentAltitude = 10; // meters
  let prevLat = routeCoordinates[0].lat;
  let prevLon = routeCoordinates[0].lon;
  
  for (let i = 0; i < segments; i++) {
    const start = routeCoordinates[i];
    const end = routeCoordinates[i + 1];
    
    for (let j = 0; j < pointsPerSegment; j++) {
      const t = j / pointsPerSegment;
      
      // Base interpolation (follows the route)
      const baseLat = start.lat + (end.lat - start.lat) * t;
      const baseLon = start.lon + (end.lon - start.lon) * t;
      
      // Add small GPS drift perpendicular to route direction (realistic signal noise)
      // This keeps drift small and prevents going backwards
      const gpsNoise = 0.000015; // ~1.5 meters (smaller drift)
      const perpDrift = (Math.random() - 0.5) * gpsNoise;
      
      // Calculate perpendicular direction to route
      const dx = end.lon - start.lon;
      const dy = end.lat - start.lat;
      const length = Math.sqrt(dx * dx + dy * dy);
      
      let lat, lon;
      if (length > 0) {
        // Apply drift perpendicular to route direction
        const perpX = -dy / length;
        const perpY = dx / length;
        lat = baseLat + perpY * perpDrift;
        lon = baseLon + perpX * perpDrift;
      } else {
        lat = baseLat;
        lon = baseLon;
      }
      
      // Ensure we're always moving forward (not backwards)
      // Small smoothing to prevent sudden jumps
      if (positions.length > 0) {
        const distFromPrev = Math.sqrt(
          Math.pow(lat - prevLat, 2) + Math.pow(lon - prevLon, 2)
        );
        // If drift is too large, dampen it
        if (distFromPrev > 0.0002) { // ~20 meters
          const dampFactor = 0.0002 / distFromPrev;
          lat = prevLat + (lat - prevLat) * dampFactor;
          lon = prevLon + (lon - prevLon) * dampFactor;
        }
      }
      
      // Update previous position
      prevLat = lat;
      prevLon = lon;
      
      // Realistic elevation changes (smooth hills)
      const elevationVariation = Math.sin((i + t) * Math.PI * 0.5) * 15;
      currentAltitude += (Math.random() - 0.5) * 0.3; // Gradual change (smaller)
      const altitude = 10 + elevationVariation + currentAltitude;
      
      // Realistic speed variations (people don't run at constant speed)
      currentSpeed += (Math.random() - 0.5) * 0.2; // Smaller variation
      currentSpeed = Math.max(1.8, Math.min(4.2, currentSpeed)); // Clamp between 1.8-4.2 m/s
      
      // GPS accuracy varies (better in open areas, worse near buildings/trees)
      const accuracy = 3 + Math.random() * 5; // 3-8 meters
      
      // Calculate heading based on direction of travel
      const heading = positions.length > 0
        ? Math.atan2(lon - positions[positions.length - 1].lon, lat - positions[positions.length - 1].lat) * (180 / Math.PI)
        : 0;
      
      positions.push({
        lat,
        lon,
        altitude: Math.max(0, altitude), // Don't go below sea level
        speed: currentSpeed,
        heading,
        accuracy,
        timestamp: Date.now() + positions.length * 1000,
      });
    }
  }
  
  return positions;
}

// Generate interpolated GPS positions along the trail (legacy function)
export function generateTrailPath(trail: Trail, pointsCount: number = 800): GPSPosition[] {
  return generateRealisticGPSPath(trail.coordinates, pointsCount);
}

// Note: Knowledge base is generated dynamically by Gemini API based on trip purpose
// No hardcoded data - everything is real and contextual to the specific trip

