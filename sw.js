/* Service worker: shell cache + network-first per le pagine (aggiornamenti immediati) */
const CACHE = 'pft-shell-v2';
const ASSETS = ['./', './index.html', './manifest.json', './icon.png', './icon-192.png', './icon-maskable.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  if (req.mode === 'navigate') {
    /* rete prima: l'app serve sempre l'ultima versione; cache solo offline */
    e.respondWith(
      fetch(req)
        .then((r) => { const cp = r.clone(); caches.open(CACHE).then((c) => c.put(req, cp)); return r; })
        .catch(() => caches.match(req).then((m) => m || caches.match('./index.html')))
    );
  } else {
    /* stale-while-revalidate per gli asset */
    e.respondWith(
      caches.match(req).then((m) => {
        const net = fetch(req).then((r) => {
          if (r && r.status === 200 && r.type === 'basic') caches.open(CACHE).then((c) => c.put(req, r.clone()));
          return r;
        }).catch(() => m);
        return m || net;
      })
    );
  }
});
