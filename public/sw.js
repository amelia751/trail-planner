// Service Worker for Trail PWA
// Enables offline functionality by caching assets

const CACHE_NAME = 'trail-v1';
const RUNTIME_CACHE = 'trail-runtime-v1';

// Assets to cache on install
const PRECACHE_ASSETS = [
  '/',
  '/install',
  '/trips',
  '/manifest.json',
];

// Install event - precache core assets
self.addEventListener('install', (event) => {
  console.log('✅ Service Worker: Installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('📦 Service Worker: Caching core assets');
      return cache.addAll(PRECACHE_ASSETS);
    }).then(() => {
      console.log('✅ Service Worker: Installation complete');
      return self.skipWaiting(); // Activate immediately
    })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('✅ Service Worker: Activating...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE) {
            console.log('🗑️  Service Worker: Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('✅ Service Worker: Activation complete');
      return self.clients.claim(); // Take control immediately
    })
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip Chrome extension requests
  if (url.protocol === 'chrome-extension:') {
    return;
  }

  // Skip API calls (they need to be online)
  if (url.pathname.startsWith('/api/')) {
    return;
  }

  // Network-first strategy for HTML (always get fresh content when online)
  if (request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Clone and cache the response
          const responseClone = response.clone();
          caches.open(RUNTIME_CACHE).then((cache) => {
            cache.put(request, responseClone);
          });
          return response;
        })
        .catch(() => {
          // If network fails, try cache
          return caches.match(request).then((cached) => {
            return cached || caches.match('/');
          });
        })
    );
    return;
  }

  // Cache-first strategy for static assets (CSS, JS, images, fonts)
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) {
        console.log('📦 Serving from cache:', url.pathname);
        return cached;
      }

      // Not in cache, fetch from network
      return fetch(request).then((response) => {
        // Don't cache if not a success response
        if (!response || response.status !== 200 || response.type === 'error') {
          return response;
        }

        // Clone and cache for future
        const responseClone = response.clone();
        caches.open(RUNTIME_CACHE).then((cache) => {
          cache.put(request, responseClone);
        });

        return response;
      });
    })
  );
});

// Listen for messages from the client
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

console.log('🛰️  Trail Service Worker loaded');

