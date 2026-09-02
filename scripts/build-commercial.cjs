'use strict';
const fs = require('node:fs');
const path = require('node:path');
const catalog = require('../catalog.js');
const root = path.resolve(__dirname, '..');
const VERSION = 'v25-mobile-pricing';
const origin = 'https://despedidaverse.com';
const pages = [
  { file: 'index.html', route: '/', source: 'inicio', title: 'DespedidaVerse Studio · Experiencias web para despedidas', description: 'Webs privadas para despedidas desde 79 € por grupo, IVA incluido. Fotos, retos, secretos y QR. Prueba la demo y elige Esencial, Juego o Universo.' },
  { file: 'paquetes.html', route: '/paquetes', source: 'paquetes', title: 'Paquetes y precios · DespedidaVerse', heading: 'Elige vuestra<br><em>forma de vivirlo.</em>', description: 'Compara Esencial 79 €, Juego 129 € y Universo 179 €, IVA incluido por grupo. Consulta el alcance de cada paquete y calcula el reparto por persona.' },
  { file: 'estilos.html', route: '/estilos', source: 'estilos', title: 'Siete estilos para vuestra despedida · DespedidaVerse', heading: 'El mismo grupo.<br><em>Vuestro propio estilo.</em>', description: 'Canalla, Elegante, Videojuego, Mafia, Reality, Festival o Deportivo. Elige la dirección visual de tu experiencia DespedidaVerse.' },
  { file: 'como-funciona.html', route: '/como-funciona', source: 'como-funciona', title: 'Cómo funciona y preguntas frecuentes · DespedidaVerse', heading: 'Del primer mensaje<br><em>al último recuerdo.</em>', description: 'Cómo preparamos vuestra web: solicitud, propuesta, material, revisión y entrega del QR. Plazos, privacidad y preguntas frecuentes.' },
  { file: 'caso-real.html', route: '/caso-real', source: 'caso-real', title: 'Antonverse: una despedida real · DespedidaVerse', heading: 'Antes de ser una idea,<br><em>fue nuestra despedida.</em>', description: 'Conoce Antonverse, el origen real de DespedidaVerse. Fotografías, camiseta con QR y una experiencia privada vivida por un grupo de amigos.' },
  { file: 'presupuesto.html', route: '/presupuesto', source: 'presupuesto', title: 'Pide tu propuesta · DespedidaVerse', heading: 'Vuestra próxima<br><em>gran historia.</em>', description: 'Elige Esencial, Juego o Universo, calcula el coste por persona y cuéntanos vuestra idea. Solicitud sin compromiso ni cobro.' }
];
function escape(value) { return String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]); }
function read(name) { return fs.readFileSync(path.join(root, '_content', name + '.html'), 'utf8'); }
function priceCards() {
  return `<div class="pricing-grid compact-prices">${catalog.plans.map(plan => `<article class="price-card plan-${plan.id}" data-price-card="${plan.id}"><p class="price-label">${plan.name}</p><h3>${plan.tagline}</h3><p class="price"><strong>${catalog.money(plan.amountMinor)}</strong><span>por grupo · IVA incluido</span></p><p class="per-person-line"><b data-per-person="${plan.id}">${catalog.money(catalog.quote(plan.id, 12).perPersonMinor, true)}</b> / persona entre <span data-people-count>12</span></p><p class="plan-description">${plan.description}</p><ul>${plan.features.map(feature => `<li>${feature}</li>`).join('')}</ul><a class="button ${plan.id === 'juego' ? 'button-primary' : 'button-secondary'}" data-plan-link="${plan.id}" href="/presupuesto?paquete=${plan.id}&amp;personas=12#contacto">Elegir ${plan.name} <span aria-hidden="true">→</span></a></article>`).join('')}</div><p class="price-footnote">El precio es del paquete completo, no por persona. Reparto aproximado; los límites de contenido no cambian con el tamaño del grupo. Extras, impresión y servicios externos se acuerdan aparte.</p>`;
}
function peopleControl() { return '<div class="group-price-control"><label class="people-control" for="price-people">¿Entre cuántos lo repartís? <input id="price-people" type="number" min="2" max="300" step="1" inputmode="numeric" value="12" aria-describedby="price-people-error"></label><span id="price-people-error" class="input-error" role="status"></span></div>'; }
function fill(source) {
  const replacements = {
    'pricing-cards': priceCards(), 'people-control': peopleControl(), 'catalog-version': catalog.version,
    'package-options': catalog.plans.map(p => `<option value="${p.name}">${p.name} · ${catalog.money(p.amountMinor)} por grupo</option>`).join(''),
    'package-buttons': catalog.plans.map((p, i) => `<button type="button" data-plan="${p.id}" aria-pressed="${i === 0}" class="${i === 0 ? 'active' : ''}">${p.name}<span>${catalog.money(p.amountMinor)}</span></button>`).join(''),
    'extra-options': catalog.extras.map((extra, i) => `<label><input type="checkbox" data-extra="${escape(extra)}" id="extra-${i}"><span>${escape(extra)}</span></label>`).join(''),
    'contact-form': read('contacto'), 'faq-full': read('faq')
  };
  return source.replace(/\{\{([\w:-]+)\}\}/g, (_, key) => {
    if (key.startsWith('price:')) { const plan = catalog.findPlan(key.slice(6)); if (!plan) throw new Error(key); return catalog.money(plan.amountMinor); }
    if (key.startsWith('per-person:')) { const quote = catalog.quote(key.slice(11), 12); if (!quote) throw new Error(key); return catalog.money(quote.perPersonMinor, true); }
    if (!(key in replacements)) throw new Error('Unknown placeholder ' + key);
    return /\{\{/.test(replacements[key]) ? fill(replacements[key]) : replacements[key];
  });
}
function nav(current) {
  const links = [['/paquetes', 'Paquetes'], ['/estilos', 'Estilos'], ['/como-funciona', 'Cómo funciona'], ['/caso-real', 'Caso real'], ['/cliente', 'Área cliente']];
  return `<a class="skip-link" href="#contenido">Saltar al contenido</a><header class="site-header"><a class="brand" href="/" aria-label="DespedidaVerse, inicio"><img src="assets/logo-final.webp" width="320" height="80" alt="DespedidaVerse Studio"></a><button class="menu-toggle" type="button" aria-label="Abrir menú" aria-expanded="false" aria-controls="main-nav"><span></span><span></span></button><nav id="main-nav" class="main-nav" aria-label="Navegación principal">${links.map(([url, label]) => `<a href="${url}"${url === current ? ' aria-current="page"' : ''}>${label}</a>`).join('')}<a href="/presupuesto" class="nav-cta"${current === '/presupuesto' ? ' aria-current="page"' : ''}>Pedir propuesta</a></nav></header>`;
}
function footer() {
  return `<footer class="site-footer"><div class="shell footer-grid"><div><img src="assets/logo-final.webp" alt="DespedidaVerse Studio" width="320" height="80"><p>Una experiencia privada.<br>La historia de vuestro grupo.</p></div><div><strong>Explorar</strong><a href="/demo/">Probar DemoVerse</a><a href="/paquetes">Paquetes y precios</a><a href="/estilos">Estilos</a><a href="/caso-real">Caso real</a></div><div><strong>Información</strong><a href="/como-funciona">Cómo funciona</a><a href="/cliente">Área de cliente</a><a href="/privacidad">Privacidad</a><a href="/condiciones">Condiciones</a><button type="button" id="install-app" hidden>Instalar web</button></div><div><strong>Hablamos</strong><a href="/presupuesto">Pedir propuesta</a><a href="mailto:fdez.edu00@gmail.com">Correo</a><span>España · Servicio online</span><span>Precios con IVA incluido</span></div></div><div class="shell footer-bottom"><span>© <span id="year">2026</span> DespedidaVerse Studio</span><span>Diseño y desarrollo: Eduardo Fernández</span></div></footer>`;
}
function render(page) {
  let body = fill(read(page.source));
  const dialogs = [];
  if (body.includes('data-lightbox')) dialogs.push('<dialog class="lightbox" id="lightbox"><button class="modal-close" type="button" aria-label="Cerrar imagen">×</button><img alt="Vista ampliada"></dialog>');
  if (body.includes('data-open-video')) dialogs.push('<dialog class="media-modal" id="video-modal"><button class="modal-close" type="button" aria-label="Cerrar vídeo">×</button><video controls playsinline preload="none" poster="assets/social-preview.jpg"><source src="assets/studio-teaser.mp4" type="video/mp4"></video></dialog>');
  if (body.includes('data-open-final-preview')) dialogs.push('<dialog class="media-modal final-preview-modal" id="final-modal"><button class="modal-close" type="button" aria-label="Cerrar ejemplo">×</button><div class="final-reveal-card"><p>PUTADA FINAL DESBLOQUEADA</p><img loading="lazy" src="assets/putada-final-tatuaje.webp" alt="Ejemplo de desenlace de Antonverse"><h3>HACERSE UN TATUAJE</h3><span>Ejemplo de referencia de Antonverse, no una obligación del paquete.</span></div></dialog>');
  const isHome = page.route === '/';
  const structured = isHome ? { '@context': 'https://schema.org', '@type': 'ProfessionalService', name: 'DespedidaVerse Studio', url: origin + '/', description: page.description, email: 'fdez.edu00@gmail.com', areaServed: 'ES', priceRange: '79 €–179 €' } : null;
  return `<!doctype html>\n<!-- Generated by node scripts/build-commercial.cjs. Edit _content/ and catalog.js. -->\n<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><meta name="description" content="${escape(page.description)}"><meta name="robots" content="index,follow,max-image-preview:large"><meta name="theme-color" content="#080b12"><meta name="color-scheme" content="dark"><title>${escape(page.title)}</title><link rel="canonical" href="${origin}${page.route}"><meta property="og:type" content="website"><meta property="og:locale" content="es_ES"><meta property="og:url" content="${origin}${page.route}"><meta property="og:title" content="${escape(page.title)}"><meta property="og:description" content="${escape(page.description)}"><meta property="og:image" content="${origin}/assets/social-preview.jpg"><meta name="twitter:card" content="summary_large_image"><link rel="icon" href="assets/favicon.png" type="image/png"><link rel="manifest" href="manifest.webmanifest"><link rel="stylesheet" href="styles.css?${VERSION}"><link rel="stylesheet" href="pages.css?${VERSION}"><script defer src="config.js?${VERSION}"></script><script defer src="catalog.js?${VERSION}"></script><script defer src="script.js?${VERSION}"></script><script defer src="pricing-ui.js?${VERSION}"></script>${structured ? '<script type="application/ld+json">' + JSON.stringify(structured) + '</script>' : ''}</head>\n<body class="commercial-page ${isHome ? 'site-home' : 'site-detail'} page-${page.source}">${nav(page.route)}<main id="contenido">${isHome ? '' : `<div class="page-intro shell"><a class="breadcrumb" href="/">Inicio</a><h1>${page.heading}</h1><p>${escape(page.description)}</p></div>`}${body}</main>${footer()}<nav class="mobile-actions" aria-label="Accesos rápidos"><a href="/demo/">Probar demo <span aria-hidden="true">↗</span></a><a href="${page.route === '/presupuesto' ? '#contacto' : '/paquetes'}">${page.route === '/presupuesto' ? 'Ir a la solicitud' : 'Ver paquetes'} <span aria-hidden="true">→</span></a></nav>${dialogs.join('')}<div class="toast" id="toast" role="status" aria-live="polite"></div><noscript><p class="noscript">Puedes consultar los precios y el contenido sin JavaScript. Actívalo para probar la demo, cambiar el reparto o enviar la solicitud, o escribe a <a href="mailto:fdez.edu00@gmail.com">fdez.edu00@gmail.com</a>.</p></noscript></body></html>\n`;
}
function compile() {
  return Object.fromEntries(pages.map(page => [page.file, render(page)]));
}
if (require.main === module) {
  for (const [file, contents] of Object.entries(compile())) fs.writeFileSync(path.join(root, file), contents);
  console.log('Built 6 static commercial pages from shared content and prices.');
}
module.exports = { pages, compile, render, VERSION };
