const CACHE = 'despedidaverse-v61-premium-review';
const VERSION = 'v61-premium-review';
const ASSETS = [
  '/', '/index.html', '/paquetes', '/estilos', '/como-funciona', '/caso-real', '/presupuesto', '/offline.html',
  ...['styles.css', 'pages.css', 'script.js', 'preferences.js', 'config.js', 'catalog.js', 'pricing-ui.js', 'premium.css', 'premium.js'].map(path => '/' + path + '?' + VERSION),
  '/assets/fonts/dv-sans-regular.woff2', '/assets/fonts/dv-sans-bold.woff2', '/assets/fonts/dv-editorial.woff2', '/assets/logo-final.webp', '/assets/favicon.png', '/assets/app-icon-192.png', '/assets/app-icon-512.png',
  '/assets/antonverse-dashboard.webp', '/assets/antonverse-camiseta-qr.webp', '/assets/antonverse-grupo-real.webp'
];
self.addEventListener('install', event => { self.skipWaiting(); event.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS))); });
self.addEventListener('activate', event => { event.waitUntil(Promise.all([caches.keys().then(keys => Promise.all(keys.filter(k => k.startsWith('despedidaverse-') && k !== CACHE).map(k => caches.delete(k)))), self.clients.claim()])); });
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;
  const privatePath = /^\/(cliente|gestion|onboarding|gracias|pago|piloto)(?:\.html)?(?:\/|$)/.test(url.pathname);
  if (privatePath) { event.respondWith(fetch(event.request, {cache:'no-store'})); return; }
  event.respondWith(fetch(event.request, {redirect:'follow'}).then(response => {
    if (response && response.ok && response.type !== 'opaqueredirect') caches.open(CACHE).then(c => c.put(event.request,response.clone()));
    return response;
  }).catch(async () => {
    const cached = await caches.match(event.request);
    if (cached) return cached;
    if (event.request.mode === 'navigate') return (await caches.match('/offline.html')) || Response.error();
    return Response.error();
  }));
});
