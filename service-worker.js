const CACHE_NAME = "mediruta-v2";
const ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  const wantsHTML =
    req.mode === "navigate" ||
    (req.method === "GET" && req.headers.get("accept") && req.headers.get("accept").includes("text/html"));

  if (wantsHTML) {
    // Network-first: siempre intenta traer la versión más reciente del sitio.
    // Si no hay internet, cae de vuelta a la última copia guardada.
    event.respondWith(
      fetch(req)
        .then((res) => {
          const resClone = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, resClone));
          return res;
        })
        .catch(() => caches.match(req).then((cached) => cached || caches.match("./index.html")))
    );
    return;
  }

  // Cache-first para archivos estáticos (íconos, manifest): más rápido y no cambian seguido.
  event.respondWith(
    caches.match(req).then((cached) => cached || fetch(req))
  );
}); 
