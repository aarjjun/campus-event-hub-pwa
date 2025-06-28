
const CACHE_NAME = 'campusboard-v1.0.0';
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('Service Worker: Installation complete');
        return self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log('Service Worker: Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker: Activation complete');
        return self.clients.claim();
      })
  );
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        return response || fetch(event.request).then((fetchResponse) => {
          // Clone the response before caching
          const responseClone = fetchResponse.clone();
          
          // Cache successful responses
          if (fetchResponse.status === 200) {
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseClone);
              });
          }
          
          return fetchResponse;
        });
      })
      .catch(() => {
        // Return offline fallback if available
        if (event.request.destination === 'document') {
          return caches.match('/');
        }
      })
  );
});

// Background sync for updating events
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-events') {
    console.log('Service Worker: Background sync triggered');
    event.waitUntil(syncEvents());
  }
});

async function syncEvents() {
  try {
    const response = await fetch('/events.json');
    const events = await response.json();
    
    // Store in cache
    const cache = await caches.open(CACHE_NAME);
    await cache.put('/events.json', new Response(JSON.stringify(events)));
    
    // Notify all clients about the update
    const clients = await self.clients.matchAll();
    clients.forEach(client => {
      client.postMessage({ type: 'EVENTS_UPDATED', events });
    });
    
    console.log('Service Worker: Events synced successfully');
  } catch (error) {
    console.error('Service Worker: Failed to sync events:', error);
  }
}
