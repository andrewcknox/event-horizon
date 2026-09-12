// Retired 2026-09-10. The app no longer registers a service worker: its cached
// shell let the installed window boot with the server down and then overwrite
// real data with defaults. Any browser that still holds the old worker updates
// to this one, which clears the cache and unregisters itself. See index.html.
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.map((key) => caches.delete(key))))
      .then(() => self.registration.unregister())
      .then(() => self.clients.matchAll({ type: "window" }))
      .then((clients) => clients.forEach((client) => client.navigate(client.url)))
      .catch(() => undefined)
  );
});
