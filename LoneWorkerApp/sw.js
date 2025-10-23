// A basic service worker to enable PWA installation.
// It doesn't perform any advanced caching, as the app requires a live connection.

const CACHE_NAME = 'lws-cache-v1';
const ASSETS_TO_CACHE = [
  './index.html',
  './manifest.json',
  'https://i.postimg.cc/dVmVg3Pn/favicon-logo-for-LWSApp.png'
];

// Install event: cache core assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: Caching app shell');
        // Note: Adding assets individually is more resilient
        return Promise.all(ASSETS_TO_CACHE.map(asset => {
          return cache.add(asset).catch(err => {
            console.warn(`Failed to cache ${asset}: ${err}`);
          });
        }));
      })
  );
});

// Activate event: clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Clearing old cache');
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Fetch event: serve from cache if possible, otherwise network.
// This is a "network falling back to cache" strategy for core assets.
self.addEventListener('fetch', event => {
    event.respondWith(
        fetch(event.request)
            .catch(() => {
                // If the network fails, try to serve from cache
                return caches.match(event.request)
                    .then(response => {
                        if (response) {
                            return response;
                        }
                    });
            })
    );
});
