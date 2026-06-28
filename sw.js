const CACHE_NAME = "waajib-abu-salamah-v11";
const BASE_PATH = new URL(self.registration.scope).pathname;
const SHELL = [
  BASE_PATH,
  `${BASE_PATH}leaderboard.html`,
  `${BASE_PATH}scoring.html`,
  `${BASE_PATH}manifest.webmanifest`,
  `${BASE_PATH}icons/icon.svg`
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  if (!event.request.url.startsWith("http")) return;
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const copy = response.clone();
        caches.open(CACHE_NAME)
          .then((cache) => cache.put(event.request, copy))
          .catch(() => {});
        return response;
      })
      .catch(() => caches.match(event.request).then((cached) => cached || caches.match(BASE_PATH)))
  );
});
