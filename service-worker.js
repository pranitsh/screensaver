const CACHE_NAME = 'v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/styles.css',
    '/script.js',
    "icons/icons8-clock-16.png",
    "icons/icons8-clock-32.png",
    "icons/icons8-clock-96.png",
    "icons/icons8-clock-120.png",
    "icons/icons8-clock-72.png",
    "icons/icons8-clock-144.png",
    "icons/icons8-clock-192.png",
    "icons/icons8-clock-512.png",
    "icons/icons8-clock-57.png",
    "icons/icons8-clock-60.png",
    "icons/icons8-clock-72.png",
    "icons/icons8-clock-76.png",
    "icons/icons8-clock-114.png",
    "icons/icons8-clock-120.png",
    "icons/icons8-clock-144.png",
    "icons/icons8-clock-152.png",
    "icons/icons8-clock-180.png",
    "icons/icons8-clock-50.svg",
    "icons/icons8-clock-70.png",
    "icons/icons8-clock-144.png",
    "icons/icons8-clock-150.png",
    "icons/icons8-clock-310.png",
];

// Install a service worker
self.addEventListener('install', event => {
  // Perform install steps
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Cache and return requests
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return response
        if (response) {
          return response;
        }
        return fetch(event.request);
      }
    )
  );
});

// Update a service worker
self.addEventListener('activate', event => {
  const cacheWhitelist = ['v1'];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
