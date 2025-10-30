// PWA utilities for service worker registration and installation

export function registerServiceWorker() {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('✅ Service Worker registered:', registration.scope);

          // Check for updates periodically
          setInterval(() => {
            registration.update();
          }, 60000); // Check every minute
        })
        .catch((error) => {
          console.error('❌ Service Worker registration failed:', error);
        });
    });
  }
}

export function unregisterServiceWorker() {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    navigator.serviceWorker.ready.then((registration) => {
      registration.unregister();
    });
  }
}

// Check if app is running as PWA
export function isPWA(): boolean {
  if (typeof window === 'undefined') return false;
  
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    // @ts-ignore
    window.navigator.standalone === true
  );
}

// Check if app is installable
export function canInstallPWA(): boolean {
  if (typeof window === 'undefined') return false;
  return 'BeforeInstallPromptEvent' in window;
}

// Show install prompt
let deferredPrompt: any = null;

export function setupInstallPrompt() {
  if (typeof window === 'undefined') return;

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    console.log('✅ PWA install prompt ready');
  });

  window.addEventListener('appinstalled', () => {
    console.log('✅ PWA installed successfully');
    deferredPrompt = null;
  });
}

export async function showInstallPrompt(): Promise<boolean> {
  if (!deferredPrompt) {
    console.warn('⚠️ Install prompt not available');
    return false;
  }

  deferredPrompt.prompt();
  const { outcome } = await deferredPrompt.userChoice;
  
  console.log(`User ${outcome === 'accepted' ? 'accepted' : 'dismissed'} install prompt`);
  
  deferredPrompt = null;
  return outcome === 'accepted';
}

// Check if online/offline
export function isOnline(): boolean {
  if (typeof window === 'undefined') return true;
  return navigator.onLine;
}

export function setupOnlineListener(callback: (online: boolean) => void) {
  if (typeof window === 'undefined') return;

  window.addEventListener('online', () => callback(true));
  window.addEventListener('offline', () => callback(false));
}

