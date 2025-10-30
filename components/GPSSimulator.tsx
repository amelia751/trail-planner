'use client';

import { useEffect, useState } from 'react';
import { Button } from './ui/button';
import { Play, Pause, RotateCcw, MapPin } from 'lucide-react';
import type { GPSPosition, TrailWaypoint } from '@/lib/types';
import { formatElevation, calculateDistance } from '@/lib/utils';

interface GPSSimulatorProps {
  trailPath: GPSPosition[];
  waypoints?: TrailWaypoint[];
  onPositionUpdate: (position: GPSPosition) => void;
  className?: string;
}

export function GPSSimulator({ trailPath, waypoints = [], onPositionUpdate, className }: GPSSimulatorProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [nearbyWaypoint, setNearbyWaypoint] = useState<TrailWaypoint | null>(null);

  const currentPosition = trailPath[currentIndex];

  // Check for nearby waypoints
  useEffect(() => {
    if (currentPosition && waypoints.length > 0) {
      // Find waypoint within 50m
      const nearby = waypoints.find(wp => {
        const distance = calculateDistance(
          currentPosition.lat,
          currentPosition.lon,
          wp.lat,
          wp.lon
        );
        return distance < 0.05; // 50m in km
      });
      setNearbyWaypoint(nearby || null);
    }
  }, [currentIndex, waypoints]);

  // Notify parent of position changes
  useEffect(() => {
    if (currentPosition) {
      onPositionUpdate(currentPosition);
    }
  }, [currentIndex]);

  // Handle GPS simulation playback
  useEffect(() => {
    if (!isPlaying || currentIndex >= trailPath.length - 1) {
      return;
    }

    const interval = setInterval(() => {
      setCurrentIndex(prev => {
        const next = prev + 1;
        if (next >= trailPath.length) {
          setIsPlaying(false);
          return prev;
        }
        return next;
      });
    }, 1000); // Fixed 1s interval

    return () => clearInterval(interval);
  }, [isPlaying, currentIndex, trailPath.length]);

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentIndex(0);
  };

  const progress = (currentIndex / (trailPath.length - 1)) * 100;

  return (
    <div className={className}>
      <div className="space-y-3">
        {/* Nearby Waypoint Alert */}
        {nearbyWaypoint && (
          <div className="bg-true-turquoise/10 border border-true-turquoise rounded-lg p-3">
            <div className="flex items-start gap-2">
              <MapPin className="w-5 h-5 text-true-turquoise flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-peacock">{nearbyWaypoint.name}</p>
                <p className="text-sm text-telly-blue">{nearbyWaypoint.description}</p>
              </div>
            </div>
          </div>
        )}

        {/* GPS Tracker */}
        <div className="bg-paper-white-alt rounded-lg p-4 space-y-3 border border-ecru">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-peacock" />
              <span className="font-bold text-offblack">GPS Tracker</span>
            </div>
            <div className="text-xs text-telly-blue font-mono">
              {currentIndex + 1} / {trailPath.length}
            </div>
          </div>

          {/* Current Position Info */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-muted-foreground text-xs">Latitude</span>
              <p className="font-mono text-peacock font-medium">{currentPosition?.lat.toFixed(6)}</p>
            </div>
            <div>
              <span className="text-muted-foreground text-xs">Longitude</span>
              <p className="font-mono text-peacock font-medium">{currentPosition?.lon.toFixed(6)}</p>
            </div>
            <div>
              <span className="text-muted-foreground text-xs">Elevation</span>
              <p className="font-mono text-peacock font-medium">
                {currentPosition?.altitude ? formatElevation(currentPosition.altitude) : 'N/A'}
              </p>
            </div>
            <div>
              <span className="text-muted-foreground text-xs">Speed</span>
              <p className="font-mono text-peacock font-medium">
                {currentPosition?.speed?.toFixed(1) || '0.0'} m/s
              </p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-ecru rounded-full h-2">
            <div
              className="bg-true-turquoise h-2 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setIsPlaying(!isPlaying)}
              disabled={currentIndex >= trailPath.length - 1}
              size="sm"
              variant="default"
              className="flex-1"
            >
              {isPlaying ? (
                <>
                  <Pause className="w-4 h-4 mr-2" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  {currentIndex >= trailPath.length - 1 ? 'Finished' : 'Play'}
                </>
              )}
            </Button>
            <Button onClick={handleReset} size="sm" variant="outline">
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

