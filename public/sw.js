const CACHE_NAME = 'tally-pwa-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/Logo-square.png',
  '/Logo-big-name.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return response
        if (response) {
          return response;
        }
        return fetch(event.request).catch(() => {
          // Fallback if offline
        });
      })
  );
});
