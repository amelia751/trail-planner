'use client';

import { useEffect } from 'react';
import { registerServiceWorker, setupInstallPrompt } from '@/lib/pwa';

export function PWARegister() {
  useEffect(() => {
    // Register service worker
    registerServiceWorker();
    
    // Setup install prompt listener
    setupInstallPrompt();

    console.log('🎯 Trail PWA initialized');
  }, []);

  return null;
}

