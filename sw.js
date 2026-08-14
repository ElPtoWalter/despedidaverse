const CACHE = 'despedidaverse-v18-2-safe-recovery';

const ASSETS = [
  '/',
  '/index.html',
  '/styles.css',
  '/script.js',
  '/config.js',
  '/cliente',
  '/cliente.html',
  '/cliente.js',
  '/gestion',
  '/gestion.html',
  '/gestion.js',
  '/onboarding',
  '/onboarding.html',
  '/onboarding.js',
  '/gracias',
  '/gracias.html',
  '/offline.html',
  '/assets/logo-final.webp',
  '/assets/favicon.png',
  '/assets/app-icon-192.png',
  '/assets/app-icon-512.png',
  '/assets/antonverse-dashboard.webp',
  '/assets/antonverse-camiseta-qr.webp',
  '/assets/antonverse-grupo-real.webp'
];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(ASSETS))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    Promise.all([
      caches.keys().then(keys =>
        Promise.all(
          keys
            .filter(key => key !== CACHE)
            .map(key => caches.delete(key))
        )
      ),
      self.clients.claim()
    ])
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request, { redirect: 'follow' })
      .then(response => {
        if (
          response &&
          response.ok &&
          response.type !== 'opaqueredirect'
        ) {
          const copy = response.clone();
          caches.open(CACHE).then(cache => {
            cache.put(event.request, copy);
          });
        }
        return response;
      })
      .catch(async () => {
        return (
          await caches.match(event.request) ||
          await caches.match('/offline.html')
        );
      })
  );
});
