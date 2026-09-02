'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { execFileSync } = require('node:child_process');
const catalog = require('../catalog.js');
const { compile, pages, VERSION } = require('../scripts/build-commercial.cjs');
const root = path.resolve(__dirname, '..');
const compiled = compile();
const read = name => fs.readFileSync(path.join(root, name), 'utf8');
const ids = html => [...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
function localFile(url) {
  const pathname = decodeURIComponent(url.pathname);
  if (pathname === '/') return 'index.html';
  const relative = pathname.slice(1);
  if (fs.existsSync(path.join(root, relative)) && fs.statSync(path.join(root, relative)).isFile()) return relative;
  if (pathname.endsWith('/') && fs.existsSync(path.join(root, relative, 'index.html'))) return relative + 'index.html';
  if (fs.existsSync(path.join(root, relative + '.html'))) return relative + '.html';
  return null;
}
test('one immutable catalogue supplies the three available VAT-inclusive prices', () => {
  assert.deepEqual(catalog.plans.map(p => [p.id, p.amountMinor]), [['esencial', 7900], ['juego', 12900], ['universo', 17900]]);
  assert.equal(catalog.vatIncluded, true);
  assert.equal(catalog.currency, 'EUR');
  assert(Object.isFrozen(catalog));
  assert(catalog.plans.every(Object.isFrozen));
  assert.equal(catalog.findPlan('live'), null);
  assert.equal(catalog.findPlan('universo_total'), null);
});
test('12-person examples match the agreed prices', () => {
  assert.deepEqual(catalog.plans.map(p => catalog.money(catalog.quote(p.id, 12).perPersonMinor, true)), ['6,58 €', '10,75 €', '14,92 €']);
});
test('group size only changes the share, never the total or the product scope', () => {
  for (const count of [2, 5, 10, 12, 15, 30, 100, 300]) for (const plan of catalog.plans) {
    const quote = catalog.quote(plan.id, count);
    assert.equal(quote.totalMinor, plan.amountMinor);
    assert.equal(quote.plan.identities, plan.identities);
    assert(Math.abs(quote.perPersonMinor * count - quote.totalMinor) <= count / 2);
  }
});
test('invalid counts and unknown products cannot produce a quote', () => {
  for (const invalid of ['', ' ', null, undefined, NaN, -1, 0, 1, 301, 3.4, 'twelve', true, {}, []]) assert.equal(catalog.quote('juego', invalid), null, String(invalid));
  assert.equal(catalog.quote('LIVE', 12), null);
});
test('checked-in output matches the deterministic static build', () => {
  for (const [file, html] of Object.entries(compiled)) assert.equal(read(file), html, file + ' needs rebuilding');
});
test('home is seven short sections, with details moved to dedicated pages', () => {
  const html = compiled['index.html'];
  assert.equal((html.match(/<section\b/g) || []).length, 7);
  assert.equal((html.match(/<details\b/g) || []).length, 4);
  assert(!html.includes('id="lead-form"'));
  assert(!html.includes('id="demo-console"'));
  assert(!html.includes('id="style-preview"'));
  const words = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, '').replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length;
  assert(words < 1500, String(words));
});
test('all pages have a unique title, canonical URL, one h1 and unique IDs', () => {
  const titles = new Set();
  for (const page of pages) {
    const html = compiled[page.file];
    assert.equal((html.match(/<h1\b/g) || []).length, 1, page.file);
    assert.equal(new Set(ids(html)).size, ids(html).length, page.file + ' duplicate ID');
    assert(html.includes(`href="https://despedidaverse.com${page.route}"`));
    const title = html.match(/<title>([^<]+)<\/title>/)[1];
    assert(!titles.has(title)); titles.add(title);
    assert(!/\{\{[\w:-]+\}\}/.test(html));
    assert(html.includes('aria-controls="main-nav"'));
    assert(html.includes('class="skip-link"'));
    assert(html.includes('rel="canonical"'));
  }
});
test('generated HTML is balanced and has no unclosed structural tags', () => {
  const voids = new Set('area base br col embed hr img input link meta param source track wbr'.split(' '));
  for (const [file, html] of Object.entries(compiled)) {
    const stack = [];
    for (const match of html.matchAll(/<(\/?)([a-z][\w-]*)\b[^>]*>/gi)) {
      const [, closing, tag] = match;
      if (voids.has(tag)) continue;
      if (closing) assert.equal(stack.pop(), tag, file + ' at ' + match.index);
      else stack.push(tag);
    }
    assert.deepEqual(stack, [], file);
  }
});
test('all public local links, fragments and media assets resolve', () => {
  for (const page of pages) {
    const html = compiled[page.file];
    for (const match of html.matchAll(/\b(?:href|src)="([^"]+)"/g)) {
      const raw = match[1].replace(/&amp;/g, '&');
      if (/^(mailto:|tel:|data:)/.test(raw)) continue;
      const url = new URL(raw, 'https://despedidaverse.com' + page.route);
      if (url.origin !== 'https://despedidaverse.com') continue;
      const target = localFile(url);
      assert(target, page.file + ' unresolved ' + raw);
      if (url.hash && target.endsWith('.html')) assert(ids(compiled[target] || read(target)).includes(decodeURIComponent(url.hash.slice(1))), page.file + ' missing fragment ' + raw);
    }
  }
});
test('three package cards, calculator and comparison use the same amounts', () => {
  for (const page of ['index.html', 'paquetes.html', 'presupuesto.html']) {
    const html = compiled[page];
    for (const plan of catalog.plans) assert(html.includes(catalog.money(plan.amountMinor)), page + ' ' + plan.name);
    assert(!/(149|299|599)\s*€/.test(html));
    assert(!/data-(?:plan|package)="[Ll][Ii][Vv][Ee]"/.test(html));
  }
  assert(compiled['paquetes.html'].includes('No se vende todavía.'));
});
test('contact transport, consent and CRM field names survive the move', () => {
  const html = compiled['presupuesto.html'];
  for (const name of ['action', 'source', 'siteVersion', 'catalogVersion', 'privacyVersion', 'website', 'name', 'email', 'phone', 'date', 'event', 'people', 'package', 'style', 'budget', 'message', 'privacyAccepted', 'estimate']) assert(html.includes(`name="${name}"`), name);
  assert(html.includes('id="dv-submit-frame"'));
  assert(html.includes('target="dv-submit-frame"'));
  assert(html.includes('name="privacyAccepted" value="yes" required'));
  assert(html.includes('type="email"'));
  assert(html.includes('script.google.com/macros/s/'));
  assert(html.includes('Sin cobro al enviar la solicitud'));
});
test('the demo and its assets no longer redirect to the home page', () => {
  const redirects = read('_redirects');
  assert.match(redirects, /^\/demo \/demo\/ 301$/m);
  assert(!/^\/demo\/\*/m.test(redirects));
  assert(read('demo/index.html').includes('href="/presupuesto"'));
  assert(read('demo/index.html').includes('app.js'));
});
test('new routes are in the sitemap while private routes stay uncached', () => {
  for (const page of pages) assert(read('sitemap.xml').includes('https://despedidaverse.com' + page.route));
  const sw = read('sw.js');
  assert(sw.includes(VERSION));
  assert(sw.includes('url.origin !== self.location.origin'));
  assert(sw.includes('cliente|gestion|onboarding|gracias|pago|piloto'));
  assert(sw.includes("cache:'no-store'"));
  assert(!read('sitemap.xml').includes('/cliente'));
});
test('all shipped scripts have valid syntax', () => {
  for (const script of ['catalog.js', 'pricing-ui.js', 'script.js', 'config.js', 'sw.js', 'demo/app.js']) execFileSync(process.execPath, ['--check', path.join(root, script)]);
});

// Small explicit DOM mocks: these tests never open a browser or make a request.
class Element {
  constructor(value = '', dataset = {}) { this.value = value; this.dataset = dataset; this.textContent = ''; this.events = {}; this.attrs = {}; this.selectedIndex = 0; const classes = new Set(); this.classList = { add: k => classes.add(k), remove: k => classes.delete(k), contains: k => classes.has(k), toggle: (k, force) => { const active = force === undefined ? !classes.has(k) : force; active ? classes.add(k) : classes.delete(k); return active; } }; }
  addEventListener(type, listener) { this.events[type] = listener; }
  setAttribute(name, value) { this.attrs[name] = value; }
  getAttribute(name) { return this.attrs[name] || null; }
  dispatch(type) { this.events[type]?.({ currentTarget: this, target: this, preventDefault() {} }); }
  focus() { this.focused = true; }
  scrollIntoView() { this.scrolled = true; }
  contains() { return false; }
}
function harness(search = '', pathname = '/presupuesto', hash = '') {
  const elements = Object.fromEntries(['price-people', 'calc-people', 'lead-package', 'lead-people', 'lead-estimate', 'lead-style', 'calc-range', 'calc-level', 'calc-per-person', 'calc-count', 'calc-scope', 'calc-people-error', 'price-people-error', 'use-estimate', 'contacto', 'form-status', 'year', 'toast'].map(id => ['#' + id, new Element()]));
  elements['#price-people'].value = 12; elements['#calc-people'].value = 12;
  const buttons = catalog.plans.map(p => new Element('', { plan: p.id }));
  const links = catalog.plans.map(p => new Element('', { planLink: p.id }));
  const shares = catalog.plans.map(p => new Element('', { perPerson: p.id }));
  const extras = [];
  const collections = { '[data-plan]': buttons, '[data-plan-link]': links, '[data-per-person]': shares, '[data-people-count]': [new Element()], '.calc-extras input:checked': extras };
  const events = {};
  const location = { search, pathname, hash, protocol: 'https:', replace(url) { this.replaced = url; } };
  const document = { body: new Element(), querySelector: selector => elements[selector] || null, querySelectorAll: selector => collections[selector] || [], addEventListener: (type, fn) => events['document:' + type] = fn };
  const context = { window: { DV_CATALOG: catalog, DV_CONFIG: {} }, document, location, navigator: {}, URLSearchParams, URL, Intl, console, setTimeout: () => 0, clearTimeout() {}, matchMedia: () => ({ matches: true }), addEventListener: (type, fn) => (events[type] ||= []).push(fn) };
  vm.runInNewContext(read('pricing-ui.js'), context);
  return { elements, buttons, links, shares, extras, location, context, events, collections };
}
test('plan and group selection arrive at the form with the correct price reference', () => {
  const h = harness('?paquete=juego&personas=12&estilo=mafia');
  assert.equal(h.elements['#lead-package'].value, 'Juego');
  assert.equal(h.elements['#lead-style'].value, 'Mafia');
  assert.equal(h.elements['#calc-range'].textContent, '129 €');
  assert.equal(h.elements['#calc-per-person'].textContent, '10,75 €');
  assert(h.elements['#lead-estimate'].value.includes('129 € por grupo'));
  h.elements['#calc-people'].value = '10'; h.elements['#calc-people'].dispatch('input');
  assert.equal(h.elements['#calc-per-person'].textContent, '12,90 €');
  assert.equal(h.elements['#lead-people'].value, 10);
  h.buttons[2].dispatch('click');
  assert.equal(h.elements['#lead-package'].value, 'Universo');
  assert.equal(h.elements['#calc-range'].textContent, '179 €');
  assert(h.links[2].href.includes('paquete=universo&personas=10'));
});
test('invalid people counts show an error without corrupting the package price', () => {
  const h = harness('?paquete=juego');
  h.elements['#calc-people'].value = '0'; h.elements['#calc-people'].dispatch('input');
  assert.equal(h.elements['#calc-range'].textContent, '129 €');
  assert.equal(h.elements['#calc-per-person'].textContent, '—');
  assert.equal(h.elements['#calc-people'].attrs['aria-invalid'], 'true');
  assert(h.elements['#calc-people-error'].textContent.includes('2 y 300'));
  h.elements['#use-estimate'].dispatch('click'); assert(h.elements['#calc-people'].focused);
});
test('query parameters are allowlisted, with no unpublished product or arbitrary style', () => {
  const h = harness('?paquete=LIVE&personas=-1&estilo=%3Cscript%3E');
  assert.equal(h.elements['#calc-range'].textContent, '79 €');
  assert.equal(h.elements['#lead-package'].value, '');
  assert.equal(h.elements['#lead-style'].value, '');
  assert.equal(h.elements['#lead-estimate'].value, '');
});
test('extras remain unpriced requests and do not silently inflate the base', () => {
  const h = harness('?paquete=universo');
  h.extras.push(new Element('', { extra: catalog.extras[0] }));
  h.elements['#use-estimate'].dispatch('click');
  assert.equal(h.elements['#calc-range'].textContent, '179 €');
  assert(h.elements['#lead-estimate'].value.includes('extras pendientes de presupuesto: Vídeo promocional'));
  assert(h.elements['#contacto'].scrolled);
});
test('legacy shared anchors reach the moved content, while existing home anchors remain', () => {
  const targets = { '#calculadora': '/presupuesto#calculadora', '#estilos': '/estilos', '#caso': '/caso-real', '#formatos': '/paquetes#formatos' };
  for (const [hash, target] of Object.entries(targets)) assert.equal(harness('', '/', hash).location.replaced, target);
  assert.equal(harness('', '/', '#precios').location.replaced, undefined);
});
test('shared script initializes on pages without the former inline demo/calculator', () => {
  const h = harness();
  vm.runInNewContext(read('script.js'), h.context);
  assert.equal(h.elements['#year'].textContent, new Date().getFullYear());
  assert(!read('script.js').includes('setTimeout(() => event.currentTarget.reset()'));
});
test('mobile menu opens, closes with Escape and restores focus', () => {
  const h = harness();
  const toggle = new Element(); const nav = new Element();
  h.elements['.site-header'] = new Element();
  h.elements['.menu-toggle'] = toggle;
  h.elements['#main-nav'] = nav;
  vm.runInNewContext(read('script.js'), h.context);
  assert(h.context.document.body.classList.contains('nav-ready'));
  toggle.dispatch('click');
  assert(nav.classList.contains('open'));
  assert.equal(toggle.attrs['aria-expanded'], 'true');
  for (const listener of h.events.keydown) listener({ key: 'Escape' });
  assert(!nav.classList.contains('open'));
  assert.equal(toggle.attrs['aria-expanded'], 'false');
  assert(toggle.focused);
});
test('all seven style controls update their preview and the proposal link', () => {
  const h = harness();
  const buttons = catalog.styles.map(style => new Element('', { style: style.toLowerCase() }));
  h.collections['[data-style]'] = buttons;
  for (const id of ['style-preview', 'style-kicker', 'style-title', 'style-copy', 'style-label', 'style-request-link']) h.elements['#' + id] = new Element();
  vm.runInNewContext(read('script.js'), h.context);
  for (const button of buttons) {
    button.dispatch('click');
    assert(h.elements['#style-preview'].className.includes('theme-' + button.dataset.style));
    assert.equal(button.attrs['aria-pressed'], 'true');
    assert(h.elements['#style-request-link'].href.includes('estilo=' + button.dataset.style));
    assert(h.elements['#style-title'].textContent.length > 0);
  }
});
