/* Service worker: shell cache + network-first per le pagine (aggiornamenti immediati) */
const CACHE = 'pft-shell-v3';
const ASSETS = ['./', './index.html', './manifest.json', './icon.png', './icon-192.png', './icon-maskable.png'];

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
      .then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

/* quali richieste meritan la cache shell: solo gli asset noti, senza query */
function isShellAsset(url) {
  if (url.search) return false; // es. il self-check ?nc= di checkUpdate: mai cachare (crescita illimitata)
  const p = url.pathname.replace(/.*\/breaking-fat\//, '/');
  return ASSETS.some((a) => {
    const ap = new URL(a, self.registration.scope).pathname;
    return p === ap || p === '/' || p === '';
  });
}

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  if (req.mode === 'navigate') {
    /* rete prima: l'app serve sempre l'ultima versione; cache solo offline */
    e.respondWith(
      fetch(req)
        .then((r) => {
          if (r && r.ok) {
            const cp = r.clone();
            return caches.open(CACHE).then((c) => c.put(req, cp)).then(() => r);
          }
          return r;
        })
        .catch(() => caches.match(req).then((m) => m || caches.match('./index.html')))
    );
  } else {
    /* stale-while-revalidate per gli asset shell */
    e.respondWith(
      caches.match(req).then((m) => {
        const net = fetch(req).then((r) => {
          if (r && r.status === 200 && r.type === 'basic' && isShellAsset(new URL(req.url))) {
            caches.open(CACHE).then((c) => c.put(req, r.clone()));
          }
          return r;
        }).catch(() => m || Response.error());
        return m || net;
      })
    );
  }
});
