/*
 * TechBox service worker.
 *
 * Strategy: cache ONLY long-lived static assets (fonts, images, CSS, the app
 * shell icons). We deliberately NEVER cache navigations / HTML documents, so
 * the app always fetches fresh pages from the network. This avoids the classic
 * "my site won't update / shows stale content" flicker-and-jump bug while still
 * giving offline support for assets that already carry immutable cache headers
 * from the Next.js server.
 */
const CACHE_NAME = "techbox-static-v4";
const STATIC_ASSETS = [
  "/manifest.json",
  "/logo.png",
  "/favicon.ico",
  "/placeholder-blur.svg",
  "/register-sw.js",
];

const IS_LOCAL_DEV = ["localhost", "127.0.0.1", "::1"].includes(self.location.hostname);

self.addEventListener("install", (event) => {
  if (IS_LOCAL_DEV) {
    event.waitUntil(self.skipWaiting());
    return;
  }
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(STATIC_ASSETS))
      .catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  if (IS_LOCAL_DEV) {
    event.waitUntil(
      caches
        .keys()
        .then((cacheNames) => Promise.all(cacheNames.map((name) => caches.delete(name))))
        .then(() => self.registration.unregister())
        .then(() => self.clients.matchAll({ type: "window", includeUncontrolled: true }))
        .then((clients) => clients.forEach((client) => client.navigate(client.url)))
    );
    return;
  }

  // Remove any previous cache versions.
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) =>
        Promise.all(cacheNames.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n)))
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Only handle same-origin GET requests.
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // NEVER cache navigations (HTML documents) - always go to the network so
  // pages are never served stale.
  if (request.mode === "navigate") return;

  // Cache-first for static assets (fonts/images/css/icons). The server already
  // sends immutable, far-future cache headers, so this is just an offline aid.
  if (/\.(?:woff2?|ttf|otf|eot|css|png|jpe?g|webp|svg|ico|gif|mp4|webm|json)$/.test(url.pathname)) {
    event.respondWith(
      caches.open(CACHE_NAME).then(async (cache) => {
        const cached = await cache.match(request);
        if (cached) return cached;
        try {
          const response = await fetch(request);
          if (response && response.status === 200 && response.type === "basic") {
            cache.put(request, response.clone());
          }
          return response;
        } catch (e) {
          return cached || Response.error();
        }
      })
    );
  }
});
