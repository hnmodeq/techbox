const CACHE_NAME = 'techbox-v3';
const urlsToCache = ['/', '/manifest.json', '/logo.png'];
const IS_LOCAL_DEV = ['localhost', '127.0.0.1', '::1'].includes(self.location.hostname);

self.addEventListener('install', (event) => {
  if (IS_LOCAL_DEV) {
    event.waitUntil(self.skipWaiting());
    return;
  }

  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  if (IS_LOCAL_DEV) {
    event.waitUntil(
      caches
        .keys()
        .then((cacheNames) => Promise.all(cacheNames.map((name) => caches.delete(name))))
        .then(() => self.registration.unregister())
        .then(() => self.clients.matchAll({ type: 'window', includeUncontrolled: true }))
        .then((clients) => clients.forEach((client) => client.navigate(client.url)))
    );
    return;
  }

  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) =>
        Promise.all(
          cacheNames
            .filter((name) => name !== CACHE_NAME)
            .map((name) => caches.delete(name))
        )
      )
      .then(() => self.clients.claim())
  );
});

function shouldSkipCache(request) {
  const url = new URL(request.url);

  return (
    request.method !== 'GET' ||
    url.origin !== self.location.origin ||
    url.pathname.startsWith('/_next/') ||
    url.pathname.startsWith('/api/') ||
    url.pathname === '/sw.js' ||
    url.pathname === '/register-sw.js' ||
    request.headers.get('accept')?.includes('text/event-stream')
  );
}

self.addEventListener('fetch', (event) => {
  if (IS_LOCAL_DEV) return;

  const { request } = event;
  if (shouldSkipCache(request)) return;

  // Navigation requests should prefer fresh HTML and only fall back to cache
  // when offline. This avoids serving stale pages after deployments.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          return response;
        })
        .catch(() => caches.match(request).then((cached) => cached || caches.match('/')))
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((response) => {
        if (!response || response.status !== 200 || response.type !== 'basic') return response;
        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(request, responseToCache));
        return response;
      });
    })
  );
});
