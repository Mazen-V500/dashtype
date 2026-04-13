const CACHE_VERSION = "dash-type-v0.8.000";
const CORE_ASSETS = [
  "./",
  "./index.html",
  "./style.css",
  "./word-bank.js",
  "./single/index.html",
  "./triple/index.html",
  "./sequential/index.html",
  "./paragraph/index.html",
  "./history/index.html",
  "./leaderboard/index.html",
  "./guide/index.html",
  "./profile/index.html",
  "./friends/index.html",
  "./admin/index.html",
  "./scripts/firebase-save.js",
  "./scripts/g1.js",
  "./scripts/g2.js",
  "./scripts/g3.js",
  "./scripts/g4.js",
  "./scripts/app-state.js",
  "./scripts/route-context.js",
  "./scripts/ui-utils.js",
  "./scripts/role-utils.js",
  "./scripts/keyboard-visual.js",
  "./scripts/route-redirect.js",
  "./scripts/pwa-register.js",
  "./manifest.webmanifest",
  "./robots.txt",
  "./sitemap.xml",
  "./photo/icons/guide.svg",
  "./photo/favicon-64.png",
  "./photo/favicon-32.png",
  "./photo/favicon-16.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => cache.addAll(CORE_ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.map((key) => {
      if (key !== CACHE_VERSION) {
        return caches.delete(key);
      }
      return Promise.resolve();
    }))).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") {
    return;
  }

  const accept = event.request.headers.get("accept") || "";
  const isHtmlRequest = event.request.mode === "navigate" || accept.includes("text/html");

  if (isHtmlRequest) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response && response.status === 200) {
            const clone = response.clone();
            event.waitUntil(caches.open(CACHE_VERSION).then((cache) => cache.put(event.request, clone)));
          }
          return response;
        })
        .catch(() => caches.match(event.request).then((cached) => cached || caches.match("./index.html")))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) {
        event.waitUntil(
          fetch(event.request)
            .then((response) => {
              if (response && response.status === 200) {
                return caches.open(CACHE_VERSION).then((cache) => cache.put(event.request, response.clone()));
              }
              return Promise.resolve();
            })
            .catch(() => Promise.resolve())
        );
        return cached;
      }

      return fetch(event.request)
        .then((response) => {
          if (response && response.status === 200) {
            const clone = response.clone();
            event.waitUntil(caches.open(CACHE_VERSION).then((cache) => cache.put(event.request, clone)));
          }
          return response;
        })
        .catch(() => new Response("", { status: 504, statusText: "Offline" }));
    })
  );
});

self.addEventListener("sync", (event) => {
  if (event.tag !== "dashType-sync-rounds") {
    return;
  }

  event.waitUntil(
    self.clients.matchAll({ includeUncontrolled: true, type: "window" }).then((clients) => {
      clients.forEach((client) => {
        client.postMessage({ type: "retry-round-saves" });
      });
    })
  );
});
