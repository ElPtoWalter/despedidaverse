const CACHE = 'despedidaverse-v23-maximum-art-direction';
const ASSETS = [
  '/', '/index.html', '/styles.css', '/script.js', '/config.js', '/offline.html',
  '/assets/logo-final.webp', '/assets/favicon.png', '/assets/app-icon-192.png', '/assets/app-icon-512.png',
  '/assets/antonverse-dashboard.webp', '/assets/antonverse-camiseta-qr.webp', '/assets/antonverse-grupo-real.webp'
];
self.addEventListener('install', event => { self.skipWaiting(); event.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS))); });
self.addEventListener('activate', event => { event.waitUntil(Promise.all([caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))), self.clients.claim()])); });
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  const privatePath = /^\/(cliente|gestion|onboarding|gracias)(?:\.html)?(?:\/|$)/.test(url.pathname);
  if (privatePath) { event.respondWith(fetch(event.request, {cache:'no-store'})); return; }
  event.respondWith(fetch(event.request, {redirect:'follow'}).then(response => {
    if (response && response.ok && response.type !== 'opaqueredirect') caches.open(CACHE).then(c => c.put(event.request,response.clone()));
    return response;
  }).catch(async () => (await caches.match(event.request)) || (await caches.match('/offline.html'))));
});
