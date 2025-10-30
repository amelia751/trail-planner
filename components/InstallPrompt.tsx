'use client';

import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Download, X } from 'lucide-react';
import { showInstallPrompt, isPWA } from '@/lib/pwa';

export function InstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstallable, setIsInstallable] = useState(false);

  useEffect(() => {
    // Don't show if already installed as PWA
    if (isPWA()) {
      return;
    }

    // Check if dismissed before
    const dismissed = localStorage.getItem('pwa-install-dismissed');
    if (dismissed) {
      return;
    }

    // Listen for beforeinstallprompt
    const handler = () => {
      setIsInstallable(true);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstall = async () => {
    const accepted = await showInstallPrompt();
    if (accepted) {
      setShowPrompt(false);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-install-dismissed', 'true');
  };

  if (!showPrompt || !isInstallable) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50 animate-in slide-in-from-bottom-4">
      <Card className="border-2 border-true-turquoise shadow-lg">
        <CardContent className="pt-4">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 bg-true-turquoise/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <Download className="w-6 h-6 text-true-turquoise" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-offblack mb-1">Install Trail</h3>
              <p className="text-sm text-telly-blue mb-3">
                Install Trail for offline access and a native app experience
              </p>
              <div className="flex gap-2">
                <Button onClick={handleInstall} size="sm" className="flex-1">
                  Install
                </Button>
                <Button onClick={handleDismiss} size="sm" variant="outline">
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

