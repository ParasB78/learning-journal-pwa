const CACHE_NAME = "lj-cache-v1";
const OFFLINE_URL = "/offline";

// Add files you want pre-cached (App Shell)
const APP_SHELL = [
  "/",
  "/journal",
  "/about",
  "/projects",
  "/static/css/style.css",
  "/static/js/script.js",
  "/static/manifest.json",
  "/static/images/icon-192.png",
  "/static/images/icon-512.png",
];

// Install: pre-cache shell
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)),
  );
  self.skipWaiting();
});

// Activate: cleanup old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.map((k) => (k !== CACHE_NAME ? caches.delete(k) : null)),
        ),
      ),
  );
  self.clients.claim();
});

// Fetch: handle requests
self.addEventListener("fetch", (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // 1) Network-first for your API reflections
  if (url.pathname.startsWith("/api/reflections")) {
    event.respondWith(networkFirst(req));
    return;
  }

  // 2) Cache-first for everything else (pages + assets)
  event.respondWith(cacheFirst(req));
});

async function cacheFirst(req) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(req);
  if (cached) return cached;

  try {
    const fresh = await fetch(req);
    cache.put(req, fresh.clone());
    return fresh;
  } catch (e) {
    // optional fallback: if you create an offline page route
    return new Response("Offline and not cached yet.", {
      headers: { "Content-Type": "text/plain" },
    });
  }
}

async function networkFirst(req) {
  const cache = await caches.open(CACHE_NAME);
  try {
    const fresh = await fetch(req);
    cache.put(req, fresh.clone());
    return fresh;
  } catch (e) {
    const cached = await cache.match(req);
    return (
      cached ||
      new Response(JSON.stringify([]), {
        headers: { "Content-Type": "application/json" },
      })
    );
  }
}
