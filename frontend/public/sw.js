const CACHE_NAME = "ai-code-reviewer-v1";
const STATIC_ASSETS = ["/", "/index.html"];

// Install — pre-cache shell
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// Activate — clean old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch — network first, cache fallback (for offline shell)
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // Skip non-GET, non-HTTP(S) schemes (e.g. chrome-extension://), and API requests
  if (
    event.request.method !== "GET" ||
    !url.protocol.startsWith("http") ||
    url.pathname.includes("/ai/")
  ) return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Only cache valid, same-origin or CORS responses
        if (response && response.status === 200 && (response.type === "basic" || response.type === "cors")) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
