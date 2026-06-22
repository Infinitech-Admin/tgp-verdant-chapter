// Minimal service worker — just enough for PWA installability + basic offline fallback.
// No hardcoded precache list, so it never breaks when the build output changes.

const CACHE_NAME = "tgp-verdant-cache-v1";

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      // Clean up old caches from previous versions
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key)),
      );
      await self.clients.claim();
    })(),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Only handle GET requests, same-origin, navigation/page requests
  if (request.method !== "GET") return;

  event.respondWith(
    (async () => {
      try {
        const networkResponse = await fetch(request);

        // Cache successful same-origin responses for basic offline support
        if (
          networkResponse &&
          networkResponse.status === 200 &&
          new URL(request.url).origin === self.location.origin
        ) {
          const cache = await caches.open(CACHE_NAME);
          cache.put(request, networkResponse.clone());
        }

        return networkResponse;
      } catch (err) {
        // Network failed — try cache as fallback
        const cached = await caches.match(request);
        if (cached) return cached;
        throw err;
      }
    })(),
  );
});
