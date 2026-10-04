/* Service worker: shell cache + network-first per le pagine (aggiornamenti immediati) */
const CACHE = 'pft-shell-v4';
const ASSETS = ['./', './index.html', './manifest.json', './icon.png', './icon-192.png', './icon-maskable.png'];
/* URL canonici risolti contro lo scope: confronto per href esatto → gli URL con query
   (?nc= del self-check, ?utm_*) non matchano mai e non entrano in cache */
const shellSet = () => new Set(ASSETS.map((a) => new URL(a, self.registration.scope).href));
const navSet = () => new Set(['./', './index.html'].map((a) => new URL(a, self.registration.scope).href));

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE)
      .then((c) => c.addAll(ASSETS))
      .catch((err) => console.warn('SW precache non riuscito', err))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      /* solo le cache di questa app (pft-*): altre app sulla stessa origine non vanno toccate */
      .then((ks) => Promise.all(ks.filter((k) => k.indexOf('pft-') === 0 && k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  if (req.mode === 'navigate') {
    /* rete prima: l'app serve sempre l'ultima versione; cache solo offline.
       In cache solo le navigazioni canoniche senza query. */
    e.respondWith(
      fetch(req)
        .then((r) => {
          const canonical = r && r.ok && !new URL(req.url).search && navSet().has(req.url.split('#')[0]);
          if (canonical) {
            const cp = r.clone();
            return caches.open(CACHE).then((c) => c.put(req, cp)).then(() => r);
          }
          return r;
        })
        .catch(() => caches.match(req).then((m) => m || caches.match('./index.html')))
    );
  } else {
    /* stale-while-revalidate solo per gli asset della shell (href esatto, senza query) */
    e.respondWith(
      caches.match(req).then((m) => {
        const net = fetch(req).then((r) => {
          if (r && r.status === 200 && r.type === 'basic' && shellSet().has(req.url)) {
            caches.open(CACHE).then((c) => c.put(req, r.clone()));
          }
          return r;
        }).catch(() => m || Response.error());
        return m || net;
      })
    );
  }
});
