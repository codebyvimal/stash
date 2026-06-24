self.addEventListener('install', (e) => {
  // Force the new service worker to become active immediately
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  // Clear all existing caches
  e.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => caches.delete(cacheName))
      );
    }).then(() => self.clients.claim())
  );
});

// Do not intercept any fetch requests
self.addEventListener('fetch', (event) => {
  return;
});
