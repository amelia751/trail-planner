'use client';

import { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import type { GPSPosition, TrailWaypoint } from '@/lib/types';

interface MapViewProps {
  route: Array<{ lat: number; lon: number }>;
  currentPosition?: GPSPosition;
  waypoints?: TrailWaypoint[];
  className?: string;
}

export function MapView({ route, currentPosition, waypoints = [], className }: MapViewProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const currentMarker = useRef<maplibregl.Marker | null>(null);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: 'https://demotiles.maplibre.org/style.json', // Free demo tiles
      center: [route[0].lon, route[0].lat],
      zoom: 13,
    });

    map.current.addControl(new maplibregl.NavigationControl(), 'top-right');

    // Wait for map to load
    map.current.on('load', () => {
      if (!map.current) return;

      // Add route line
      map.current.addSource('route', {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: route.map(p => [p.lon, p.lat]),
          },
        },
      });

      map.current.addLayer({
        id: 'route',
        type: 'line',
        source: 'route',
        layout: {
          'line-join': 'round',
          'line-cap': 'round',
        },
        paint: {
          'line-color': '#2d9d9b', // true-turquoise
          'line-width': 4,
        },
      });

      // Add waypoint markers
      waypoints.forEach((wp) => {
        if (!map.current) return;
        
        const el = document.createElement('div');
        el.className = 'waypoint-marker';
        el.style.backgroundColor = '#fabf89'; // apricot
        el.style.width = '12px';
        el.style.height = '12px';
        el.style.borderRadius = '50%';
        el.style.border = '2px solid #b96540'; // terra-cotta
        el.style.cursor = 'pointer';
        el.title = wp.name;

        new maplibregl.Marker({ element: el })
          .setLngLat([wp.lon, wp.lat])
          .setPopup(
            new maplibregl.Popup({ offset: 15 })
              .setHTML(`<strong>${wp.name}</strong><br/><small>${wp.description}</small>`)
          )
          .addTo(map.current);
      });

      // Fit map to route bounds
      const bounds = new maplibregl.LngLatBounds();
      route.forEach(p => bounds.extend([p.lon, p.lat]));
      map.current.fitBounds(bounds, { padding: 50 });
    });

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, [route, waypoints]);

  // Update current position marker
  useEffect(() => {
    if (!map.current || !currentPosition) return;

    if (currentMarker.current) {
      currentMarker.current.setLngLat([currentPosition.lon, currentPosition.lat]);
    } else {
      // Create prominent pulsing marker for current position
      const el = document.createElement('div');
      el.style.width = '40px';
      el.style.height = '40px';
      el.style.position = 'relative';
      el.style.display = 'flex';
      el.style.alignItems = 'center';
      el.style.justifyContent = 'center';
      
      // Outer pulsing ring
      const outerRing = document.createElement('div');
      outerRing.style.position = 'absolute';
      outerRing.style.width = '40px';
      outerRing.style.height = '40px';
      outerRing.style.borderRadius = '50%';
      outerRing.style.backgroundColor = 'rgba(45, 157, 155, 0.3)';
      outerRing.style.animation = 'pulse-ring 2s infinite';
      el.appendChild(outerRing);
      
      // Inner dot
      const innerDot = document.createElement('div');
      innerDot.style.position = 'relative';
      innerDot.style.width = '16px';
      innerDot.style.height = '16px';
      innerDot.style.backgroundColor = '#2d9d9b';
      innerDot.style.border = '3px solid white';
      innerDot.style.borderRadius = '50%';
      innerDot.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.3)';
      innerDot.style.zIndex = '1000';
      el.appendChild(innerDot);

      currentMarker.current = new maplibregl.Marker({ 
        element: el,
        anchor: 'center'
      })
        .setLngLat([currentPosition.lon, currentPosition.lat])
        .addTo(map.current);
    }

    // Pan map to follow current position
    map.current.panTo([currentPosition.lon, currentPosition.lat], {
      duration: 1000,
    });
  }, [currentPosition]);

  return (
    <>
      <style jsx global>{`
        @keyframes pulse-ring {
          0% {
            transform: scale(0.5);
            opacity: 1;
          }
          50% {
            transform: scale(1.2);
            opacity: 0.5;
          }
          100% {
            transform: scale(1.5);
            opacity: 0;
          }
        }
        
        .maplibregl-marker {
          z-index: 1000 !important;
        }
      `}</style>
      <div ref={mapContainer} className={className} />
    </>
  );
}

