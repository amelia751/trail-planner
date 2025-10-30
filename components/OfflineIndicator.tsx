'use client';

import { useState, useEffect } from 'react';
import { WifiOff, Wifi } from 'lucide-react';
import { isOnline, setupOnlineListener } from '@/lib/pwa';

export function OfflineIndicator() {
  const [online, setOnline] = useState(true);
  const [showTransition, setShowTransition] = useState(false);

  useEffect(() => {
    // Set initial state
    setOnline(isOnline());

    // Listen for online/offline changes
    setupOnlineListener((status) => {
      setOnline(status);
      setShowTransition(true);
      
      // Hide transition message after 3 seconds
      setTimeout(() => {
        setShowTransition(false);
      }, 3000);
    });
  }, []);

  if (online && !showTransition) {
    return null;
  }

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-top-4">
      <div
        className={`px-4 py-2 rounded-full shadow-lg flex items-center gap-2 ${
          online
            ? 'bg-true-turquoise text-white'
            : 'bg-terra-cotta text-white'
        }`}
      >
        {online ? (
          <>
            <Wifi className="w-4 h-4" />
            <span className="text-sm font-medium">Back Online</span>
          </>
        ) : (
          <>
            <WifiOff className="w-4 h-4" />
            <span className="text-sm font-medium">Offline Mode</span>
          </>
        )}
      </div>
    </div>
  );
}

