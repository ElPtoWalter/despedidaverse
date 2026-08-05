(() => {
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const previewMode = new URLSearchParams(location.search).get('preview') === '1';
  let config;
  let state;
  let storageKey;
  let galleryVisible = 6;
  let challengeFilter = 'Todos';

  const NAV = {
    home: { label: 'Inicio', icon: '⌂' },
    play: { label: 'Jugar', icon: '◎' },
    memories: { label: 'Recuerdos', icon: '□' },
    final: { label: 'Final', icon: '✦' }
  };

  function parseHex(hex) {
    const clean = String(hex || '').replace('#', '');
    if (!/^[0-9a-f]{6}$/i.test(clean)) return '220,100,255';
    return `${parseInt(clean.slice(0,2),16)},${parseInt(clean.slice(2,4),16)},${parseInt(clean.slice(4,6),16)}`;
  }

  function normalize(text) {
    return String(text || '')
      .normalize('NFD').replace(/\p{Diacritic}/gu, '')
      .toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
  }

  function safe(value, fallback = '') { return value ?? fallback; }

  function showToast(message) {
    const toast = $('#toast');
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(showToast.timer);
    showToast.timer = setTimeout(() => toast.classList.remove('show'), 2200);
  }

  function save() {
    if (!previewMode) localStorage.setItem(storageKey, JSON.stringify(state));
  }

  function downloadJSON(data, filename) {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    setTimeout(() => URL.revokeObjectURL(link.href), 1000);
  }

  async function loadConfig() {
    if (previewMode) {
      const preview = sessionStorage.getItem('dv-template-preview');
      if (preview) return JSON.parse(preview);
    }
    const response = await fetch('event.config.json', { cache: 'no-store' });
    if (!response.ok) throw new Error('No se pudo cargar event.config.json');
    return response.json();
  }

  function validateConfig(cfg) {
    const errors = [];
    if (!cfg?.meta?.id) errors.push('meta.id');
    if (!cfg?.brand?.name) errors.push('brand.name');
    if (!cfg?.event?.adminCode) errors.push('event.adminCode');
    if (!cfg?.event?.openAt || !cfg?.event?.closeAt) errors.push('event.openAt / event.closeAt');
    if (errors.length) throw new Error(`Configuración incompleta: ${errors.join(', ')}`);
  }

  function applyTheme() {
    const root = document.documentElement;
    const accent = safe(config.brand.accent, '#dc64ff');
    const accent2 = safe(config.brand.accent2, '#58dcff');
    root.style.setProperty('--accent', accent);
    root.style.setProperty('--accent-rgb', parseHex(accent));
    root.style.setProperty('--accent2', accent2);
    root.style.setProperty('--accent2-rgb', parseHex(accent2));
    root.style.setProperty('--bg', safe(config.brand.background, '#0b0b10'));
    root.style.setProperty('--surface', safe(config.brand.surface, '#121218'));
    document.title = config.brand.name;
  }

  function moduleAvailable(name) {
    const enabled = config.modules?.[name] !== false;
    if (!enabled) return false;
    if (name === 'challenges') return (config.challenges || []).length > 0;
    if (name === 'names') return (config.secretNames || []).length > 0;
    if (name === 'gallery') return (config.gallery || []).length > 0;
    if (name === 'radio') return (config.radio || []).length > 0;
    if (name === 'links') return (config.links || []).length > 0;
    if (name === 'final') return Boolean(config.final);
    return true;
  }

  function availableViews() {
    return [
      'home',
      ...(moduleAvailable('challenges') || moduleAvailable('names') ? ['play'] : []),
      ...(moduleAvailable('gallery') || moduleAvailable('radio') || moduleAvailable('links') ? ['memories'] : []),
      ...(moduleAvailable('final') ? ['final'] : [])
    ];
  }

  function initialState() {
    return {
      version: 2,
      tokens: Number(config.event.initialTokens || 0),
      bought: [],
      found: [],
      revealed: [],
      currentTrack: null,
      admin: false,
      forcedFinal: false,
      forcedClosed: false,
      updatedAt: new Date().toISOString()
    };
  }

  function hydrateState() {
    storageKey = `dv-template-v2-${config.meta.id}`;
    const stored = previewMode ? null : localStorage.getItem(storageKey);
    state = Object.assign(initialState(), stored ? JSON.parse(stored) : {});
    state.bought = Array.isArray(state.bought) ? state.bought : [];
    state.found = Array.isArray(state.found) ? state.found : [];
    state.revealed = Array.isArray(state.revealed) ? state.revealed : [];
  }

  function setGateBackdrop() {
    const image = config.brand.cover || '';
    $('#gate-backdrop').style.backgroundImage = image ? `url("${image}")` : '';
  }

  function countdownMarkup(diff) {
    const units = [
      ['Días', Math.max(0, Math.floor(diff / 86400000))],
      ['Horas', Math.max(0, Math.floor(diff / 3600000) % 24)],
      ['Min', Math.max(0, Math.floor(diff / 60000) % 60)],
      ['Seg', Math.max(0, Math.floor(diff / 1000) % 60)]
    ];
    return units.map(([label, value]) => `<span><strong>${String(value).padStart(2,'0')}</strong><small>${label}</small></span>`).join('');
  }

  function showGate(mode) {
    $('#boot').hidden = true;
    $('#app').hidden = true;
    $('#gate').hidden = false;
    setGateBackdrop();
    $('#gate-eyebrow').textContent = config.brand.eyebrow || 'EVENTO PRIVADO';
    $('#gate-name').textContent = config.brand.name;
    if (mode === 'closed') {
      $('#gate-message').textContent = config.event.closedMessage || 'La experiencia ha finalizado.';
      $('#countdown').innerHTML = '<span><strong>FIN</strong><small>Archivo cerrado</small></span>';
      return;
    }
    $('#gate-message').textContent = config.event.lockedMessage || 'La experiencia todavía está bloqueada.';
    const openAt = new Date(config.event.openAt);
    const tick = () => {
      const diff = openAt - new Date();
      if (diff <= 0) return location.reload();
      $('#countdown').innerHTML = countdownMarkup(diff);
    };
    tick();
    setInterval(tick, 1000);
  }

  function gate() {
    if (previewMode) return openApp();
    const now = new Date();
    const openAt = new Date(config.event.openAt);
    const closeAt = new Date(config.event.closeAt);
    if (state.forcedClosed || now > closeAt) return showGate('closed');
    if (now < openAt && !state.admin) return showGate('locked');
    openApp();
  }

  function renderNavigation() {
    const views = availableViews();
    const markup = views.map(view => `<button class="nav-button ${view === 'home' ? 'active' : ''}" type="button" data-nav="${view}"><i>${NAV[view].icon}</i><span>${NAV[view].label}</span></button>`).join('');
    $('#desktop-nav').innerHTML = markup;
    $('#mobile-nav').innerHTML = markup;
    $$('[data-nav]').forEach(button => button.addEventListener('click', () => switchView(button.dataset.nav)));
  }

  function switchView(view) {
    $$('.view').forEach(section => section.classList.toggle('active', section.dataset.view === view));
    $$('[data-nav]').forEach(button => button.classList.toggle('active', button.dataset.nav === view));
    $('#more-menu').hidden = true;
    $('#more-button').setAttribute('aria-expanded', 'false');
    window.scrollTo({ top: 0, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    $('#main-content').focus({ preventScroll: true });
  }

  function buildSubnav(containerId, items, initial) {
    const container = $(containerId);
    container.innerHTML = items.map(item => `<button class="${item.id === initial ? 'active' : ''}" type="button" role="tab" aria-selected="${item.id === initial}" data-subnav="${item.id}">${item.label}</button>`).join('');
    container.hidden = items.length < 2;
    $$('[data-subnav]', container).forEach(button => button.addEventListener('click', () => {
      $$('[data-subnav]', container).forEach(item => { item.classList.toggle('active', item === button); item.setAttribute('aria-selected', String(item === button)); });
      const parent = container.parentElement;
      $$('.subview', parent).forEach(section => section.classList.toggle('active', section.dataset.subview === button.dataset.subnav));
    }));
  }

  function renderBase() {
    const initials = config.brand.name.split(/\s+/).map(word => word[0]).join('').slice(0,2).toUpperCase();
    $('#event-mark').textContent = initials || 'DV';
    $('#event-eyebrow').textContent = config.brand.eyebrow || 'EVENTO PRIVADO';
    $('#event-name').textContent = config.brand.name;
    $('#hero-title').textContent = config.brand.tagline || `La experiencia de ${config.event.protagonist || 'vuestro grupo'}`;
    $('#hero-copy').textContent = config.brand.intro || config.event.intro || '';
    $('#home-hero').style.backgroundImage = config.brand.cover ? `url("${config.brand.cover}")` : '';
    $('#event-status').textContent = previewMode ? 'VISTA PREVIA' : 'EVENTO ACTIVO';
    $('#token-pill').hidden = !moduleAvailable('challenges');
    renderNavigation();

    const playItems = [
      ...(moduleAvailable('challenges') ? [{ id: 'challenges', label: 'Retos' }] : []),
      ...(moduleAvailable('names') ? [{ id: 'names', label: 'Nombres en clave' }] : [])
    ];
    if (playItems.length) buildSubnav('#play-tabs', playItems, playItems[0].id);

    const memoryItems = [
      ...(moduleAvailable('gallery') ? [{ id: 'gallery', label: 'Galería' }] : []),
      ...(moduleAvailable('radio') ? [{ id: 'radio', label: 'Radio' }] : []),
      ...(moduleAvailable('links') ? [{ id: 'links', label: 'Enlaces' }] : [])
    ];
    if (memoryItems.length) buildSubnav('#memory-tabs', memoryItems, memoryItems[0].id);
  }

  function renderSummary() {
    const namesTotal = (config.secretNames || []).length;
    const challengesTotal = (config.challenges || []).length;
    const namesPercent = namesTotal ? state.found.length / namesTotal * 100 : 100;
    const challengePercent = challengesTotal ? state.bought.length / challengesTotal * 100 : 100;
    $('#tokens').textContent = state.tokens;
    $('#summary-tokens').textContent = state.tokens;
    $('#summary-names').textContent = `${state.found.length} / ${namesTotal}`;
    $('#summary-challenges').textContent = `${state.bought.length} / ${challengesTotal}`;
    $('#names-progress').style.width = `${namesPercent}%`;
    $('#challenges-progress').style.width = `${challengePercent}%`;
    $$('.summary article')[0].hidden = !moduleAvailable('names');
    $$('.summary article')[1].hidden = !moduleAvailable('challenges');
    $$('.summary article')[2].hidden = !moduleAvailable('challenges');
  }

  function getNextAction() {
    if (moduleAvailable('names') && state.found.length < config.secretNames.length) {
      return { title: 'Descubre una clave', copy: `Quedan ${config.secretNames.length - state.found.length} nombres secretos.`, view: 'play', subview: 'names' };
    }
    if (moduleAvailable('challenges') && state.bought.length < config.challenges.length) {
      return { title: 'Elige el siguiente reto', copy: 'La tienda todavía tiene misiones disponibles.', view: 'play', subview: 'challenges' };
    }
    if (moduleAvailable('gallery') && state.revealed.length < config.gallery.length) {
      return { title: 'Abre los recuerdos', copy: 'Todavía quedan archivos sin revelar.', view: 'memories', subview: 'gallery' };
    }
    if (moduleAvailable('final')) return { title: finalUnlocked() ? 'Abre el desenlace' : 'Revisa el progreso final', copy: finalUnlocked() ? 'La prueba final ya está desbloqueada.' : 'Aún falta completar la condición.', view: 'final' };
    return { title: 'Explora la experiencia', copy: 'Todo está preparado para el grupo.', view: availableViews()[1] || 'home' };
  }

  function openSubview(view, subview) {
    switchView(view);
    if (!subview) return;
    const viewRoot = $(`[data-view="${view}"]`);
    const button = $(`[data-subnav="${subview}"]`, viewRoot);
    button?.click();
  }

  function renderNextAction() {
    const next = getNextAction();
    $('#next-title').textContent = next.title;
    $('#next-copy').textContent = next.copy;
    $('#next-button').onclick = () => openSubview(next.view, next.subview);
    $('#continue-button').onclick = () => openSubview(next.view, next.subview);
  }

  function linkMarkup(link) {
    const hostname = (() => { try { return new URL(link.url).hostname.replace(/^www\./,''); } catch { return 'Enlace externo'; } })();
    return `<a class="link-card" href="${link.url}" target="_blank" rel="noopener noreferrer"><span class="link-icon">${link.icon || '↗'}</span><span><strong>${link.label}</strong><small>${link.description || hostname}</small></span></a>`;
  }

  function renderLinks() {
    const links = config.links || [];
    $('#links-grid').innerHTML = links.map(linkMarkup).join('');
    const featured = links.filter(link => link.featured).slice(0,3);
    $('#featured-links-section').hidden = featured.length === 0;
    $('#featured-links').innerHTML = featured.map(linkMarkup).join('');
  }

  function renderChallengeFilters() {
    const levels = ['Todos', ...new Set((config.challenges || []).map(item => item.level || 'Reto'))];
    $('#challenge-filters').innerHTML = levels.map(level => `<button class="${level === challengeFilter ? 'active' : ''}" type="button" data-filter="${level}">${level}</button>`).join('');
    $$('[data-filter]').forEach(button => button.addEventListener('click', () => { challengeFilter = button.dataset.filter; renderChallenges(); }));
  }

  function renderChallenges() {
    if (!moduleAvailable('challenges')) return;
    renderChallengeFilters();
    const filtered = challengeFilter === 'Todos' ? config.challenges : config.challenges.filter(item => (item.level || 'Reto') === challengeFilter);
    $('#challenge-count').textContent = `${filtered.length} ${filtered.length === 1 ? 'reto' : 'retos'}`;
    $('#challenge-list').innerHTML = filtered.map(challenge => {
      const bought = state.bought.includes(challenge.id);
      return `<article class="challenge-card"><div class="challenge-meta"><span class="challenge-level">${challenge.level || 'Reto'}</span><span class="challenge-cost">${Number(challenge.cost || 0)} tokens</span></div><h2>${challenge.title}</h2><p>${challenge.description || ''}</p><footer><span>${challenge.note || 'Validación del comité'}</span><button type="button" data-buy="${challenge.id}" ${bought ? 'disabled' : ''}>${bought ? 'Comprado ✓' : 'Comprar'}</button></footer></article>`;
    }).join('') || '<p class="empty-state">No hay retos en este filtro.</p>';
    $$('[data-buy]').forEach(button => button.addEventListener('click', () => buyChallenge(button.dataset.buy)));
  }

  function buyChallenge(id) {
    const challenge = config.challenges.find(item => item.id === id);
    if (!challenge || state.bought.includes(id)) return;
    const cost = Number(challenge.cost || 0);
    if (state.tokens < cost) return showToast('No hay tokens suficientes');
    state.tokens -= cost;
    state.bought.push(id);
    save();
    renderAll();
    showToast('Reto comprado');
  }

  function secretDisplay(item) { return typeof item === 'string' ? item : item.label || item.answers?.[0] || 'Secreto'; }
  function secretAnswers(item) { return typeof item === 'string' ? [item] : item.answers || [item.label]; }
  function secretId(item, index) { return typeof item === 'string' ? normalize(item) : item.id || `secret-${index}`; }

  function renderNames() {
    if (!moduleAvailable('names')) return;
    const total = config.secretNames.length;
    const foundItems = config.secretNames.map((item,index) => ({ item, index, id: secretId(item,index) })).filter(entry => state.found.includes(entry.id));
    const percent = total ? Math.round(foundItems.length / total * 100) : 100;
    $('#discovered-count').textContent = `${foundItems.length} de ${total}`;
    $('#discovered-percent').textContent = `${percent}%`;
    $('#discovered-bar').style.width = `${percent}%`;
    $('#discovered-list').innerHTML = foundItems.length ? foundItems.map(entry => `<span>${secretDisplay(entry.item)}</span>`).join('') : '<p class="empty-state">Todavía no se ha descubierto ninguno.</p>';
  }

  function submitSecret(value) {
    const normalized = normalize(value);
    let matched = null;
    config.secretNames.forEach((item,index) => {
      if (secretAnswers(item).some(answer => normalize(answer) === normalized)) matched = { item, id: secretId(item,index) };
    });
    const feedback = $('#secret-feedback');
    feedback.className = 'feedback';
    if (!matched) {
      feedback.textContent = 'No coincide con ninguna clave.';
      feedback.classList.add('error');
      return;
    }
    if (state.found.includes(matched.id)) {
      feedback.textContent = 'Esa clave ya estaba descubierta.';
      return;
    }
    state.found.push(matched.id);
    feedback.textContent = `Descubierto: ${secretDisplay(matched.item)}`;
    feedback.classList.add('success');
    save();
    renderAll();
    if (finalUnlocked()) revealFinal(true);
  }

  function renderGallery() {
    if (!moduleAvailable('gallery')) return;
    const items = config.gallery.slice(0, galleryVisible);
    $('#gallery-grid').innerHTML = items.map((item,index) => {
      const id = item.id || `gallery-${index}`;
      const revealed = !item.locked || state.revealed.includes(id);
      return `<button class="gallery-item ${revealed ? 'revealed' : ''}" type="button" data-gallery-index="${index}"><img loading="lazy" src="${item.src}" alt="${revealed ? item.title || 'Recuerdo' : 'Contenido oculto'}"><span class="reveal-label">${revealed ? 'Abrir' : 'Revelar'}</span><div><strong>${revealed ? item.title || 'Recuerdo' : 'Archivo oculto'}</strong><small>${revealed ? item.caption || '' : 'Pulsa para descubrirlo'}</small></div></button>`;
    }).join('');
    $('#gallery-more').hidden = galleryVisible >= config.gallery.length;
    $$('[data-gallery-index]').forEach(button => button.addEventListener('click', () => openGallery(Number(button.dataset.galleryIndex))));
  }

  function openGallery(index) {
    const item = config.gallery[index];
    const id = item.id || `gallery-${index}`;
    if (item.locked && !state.revealed.includes(id)) {
      state.revealed.push(id);
      save();
      renderGallery();
      showToast('Archivo revelado');
      return;
    }
    const dialog = $('#lightbox');
    $('img', dialog).src = item.src;
    $('img', dialog).alt = item.title || 'Recuerdo';
    $('h2', dialog).textContent = item.title || 'Recuerdo';
    $('p', dialog).textContent = item.caption || '';
    dialog.showModal();
  }

  function renderRadio() {
    if (!moduleAvailable('radio')) return;
    $('#radio-list').innerHTML = config.radio.map((track,index) => `<button class="track-button ${state.currentTrack === index ? 'active' : ''}" type="button" data-track="${index}"><span>♪</span><span><strong>${track.title}</strong><small>${track.artist || config.brand.name}</small></span><span>${track.label || 'Reproducir'}</span></button>`).join('');
    $$('[data-track]').forEach(button => button.addEventListener('click', () => playTrack(Number(button.dataset.track))));
    if (state.currentTrack !== null && config.radio[state.currentTrack]) updateTrackInfo(config.radio[state.currentTrack]);
  }

  function updateTrackInfo(track) {
    $('#track-title').textContent = track.title;
    $('#track-artist').textContent = track.artist || config.brand.name;
  }

  function playTrack(index) {
    const track = config.radio[index];
    if (!track) return;
    state.currentTrack = index;
    save();
    const audio = $('#audio');
    audio.src = track.src;
    audio.play().catch(() => showToast('Pulsa reproducir en el reproductor'));
    updateTrackInfo(track);
    renderRadio();
  }

  function finalUnlocked() {
    if (!moduleAvailable('final')) return false;
    if (state.forcedFinal) return true;
    const unlock = config.final.unlock || { type: config.final.unlockRule || 'manual' };
    const allNames = !moduleAvailable('names') || state.found.length >= config.secretNames.length;
    const allChallenges = !moduleAvailable('challenges') || state.bought.length >= config.challenges.length;
    switch (unlock.type) {
      case 'always': return true;
      case 'allNames': return allNames;
      case 'namesCount': return state.found.length >= Number(unlock.count || 1);
      case 'allChallenges': return allChallenges;
      case 'challengesCount': return state.bought.length >= Number(unlock.count || 1);
      case 'either': return allNames || allChallenges;
      case 'all': return allNames && allChallenges;
      default: return false;
    }
  }

  function renderFinal() {
    if (!moduleAvailable('final')) return;
    const unlocked = finalUnlocked();
    const card = $('#final-card');
    card.classList.toggle('unlocked', unlocked);
    card.classList.toggle('locked', !unlocked);
    $('#final-lock').textContent = unlocked ? '✦' : '⌁';
    $('#final-kicker').textContent = unlocked ? 'DESBLOQUEADO' : 'BLOQUEADO';
    $('#final-title').textContent = unlocked ? config.final.title : config.final.lockedTitle || 'Todavía no';
    $('#final-description').textContent = unlocked ? config.final.description : config.final.lockedDescription || 'Completa la misión para desbloquear el contenido final.';
    $('#final-image').hidden = !unlocked || !config.final.image;
    if (unlocked && config.final.image) $('#final-image').src = config.final.image;
    card.onclick = unlocked ? () => revealFinal(false) : null;
  }

  function revealFinal(automatic) {
    if (!finalUnlocked()) return;
    const dialog = $('#final-dialog');
    $('img', dialog).src = config.final.image || '';
    $('img', dialog).hidden = !config.final.image;
    $('h2', dialog).textContent = config.final.title;
    $('p:last-child', dialog).textContent = config.final.description || '';
    if (!dialog.open) dialog.showModal();
    if (automatic) showToast('Final desbloqueado');
  }

  function renderAdminStats() {
    $('#admin-tokens').textContent = state.tokens;
    $('#admin-names').textContent = `${state.found.length}/${(config.secretNames || []).length}`;
    $('#admin-challenges').textContent = `${state.bought.length}/${(config.challenges || []).length}`;
  }

  function renderAll() {
    renderSummary();
    renderNextAction();
    renderLinks();
    renderChallenges();
    renderNames();
    renderGallery();
    renderRadio();
    renderFinal();
    renderAdminStats();
  }

  function openCommittee() {
    if (!state.admin) {
      const code = prompt('Código del comité');
      if (code !== config.event.adminCode) return showToast('Código incorrecto');
      state.admin = true;
      save();
    }
    renderAdminStats();
    $('#committee-dialog').showModal();
  }

  function openApp() {
    $('#boot').hidden = true;
    $('#gate').hidden = true;
    $('#app').hidden = false;
    renderBase();
    renderAll();
  }

  function bindEvents() {
    $('#gate-admin-toggle').addEventListener('click', () => { $('#gate-admin').hidden = !$('#gate-admin').hidden; });
    $('#gate-admin').addEventListener('submit', event => {
      event.preventDefault();
      if ($('#gate-code').value !== config.event.adminCode) return showToast('Código incorrecto');
      state.admin = true; state.forcedClosed = false; save(); openApp();
    });
    $('#home-logo').addEventListener('click', () => switchView('home'));
    $('#token-pill').addEventListener('click', () => openSubview('play','challenges'));
    $('#more-button').addEventListener('click', event => {
      const menu = $('#more-menu');
      menu.hidden = !menu.hidden;
      event.currentTarget.setAttribute('aria-expanded', String(!menu.hidden));
    });
    document.addEventListener('click', event => {
      if (!event.target.closest('#more-menu') && !event.target.closest('#more-button')) { $('#more-menu').hidden = true; $('#more-button').setAttribute('aria-expanded','false'); }
    });
    $('#committee-button').addEventListener('click', openCommittee);
    $('#export-button').addEventListener('click', () => downloadJSON({ eventId: config.meta.id, exportedAt: new Date().toISOString(), state }, `${config.meta.id}-progreso.json`));
    $('#reset-button').addEventListener('click', () => { if (confirm('¿Reiniciar el progreso guardado en este dispositivo?')) { localStorage.removeItem(storageKey); location.reload(); } });
    $('#secret-form').addEventListener('submit', event => { event.preventDefault(); submitSecret($('#secret-input').value); $('#secret-input').value = ''; });
    $('#gallery-more').addEventListener('click', () => { galleryVisible += 6; renderGallery(); });
    $('#apply-token-adjust').addEventListener('click', () => { state.tokens = Math.max(0, state.tokens + Number($('#token-adjust').value || 0)); save(); renderAll(); showToast('Tokens actualizados'); });
    $$('[data-admin]').forEach(button => button.addEventListener('click', () => {
      const action = button.dataset.admin;
      if (action === 'unlock-final') state.forcedFinal = true;
      if (action === 'lock-final') state.forcedFinal = false;
      if (action === 'close-event') state.forcedClosed = true;
      if (action === 'reopen-event') state.forcedClosed = false;
      save(); renderAll(); showToast('Acción aplicada');
    }));
    $('#import-progress').addEventListener('change', async event => {
      const file = event.target.files?.[0];
      if (!file) return;
      try {
        const imported = JSON.parse(await file.text());
        const next = imported.state || imported;
        state = Object.assign(initialState(), next);
        save(); renderAll(); showToast('Progreso importado');
      } catch { showToast('El archivo no es válido'); }
      event.target.value = '';
    });
    $$('dialog .dialog-close').forEach(button => button.addEventListener('click', () => button.closest('dialog').close()));
    $$('dialog').forEach(dialog => dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); }));
  }

  async function init() {
    try {
      config = await loadConfig();
      validateConfig(config);
      applyTheme();
      hydrateState();
      bindEvents();
      gate();
    } catch (error) {
      $('#boot').innerHTML = `<div style="max-width:620px;padding:30px;text-align:center"><h1 style="font-size:2rem">No se pudo abrir la plantilla</h1><p style="color:#aaa">${error.message}</p><p style="color:#777;font-size:.8rem">Comprueba event.config.json y publica la carpeta mediante un servidor.</p></div>`;
      console.error(error);
    }
  }

  init();
})();