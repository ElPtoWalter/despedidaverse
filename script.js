(() => {
  const CONFIG = window.DV_CONFIG || {};
  const CONTACT_EMAIL = CONFIG.contactEmail || 'fdez.edu00@gmail.com';
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
  const toast = $('#toast');

  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(showToast.timer);
    showToast.timer = setTimeout(() => toast.classList.remove('show'), 2500);
  }

  // Header and menu
  const header = $('.site-header');
  const nav = $('#main-nav');
  const menuToggle = $('.menu-toggle');
  addEventListener('scroll', () => header?.classList.toggle('scrolled', scrollY > 24), { passive: true });
  menuToggle?.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    menuToggle.setAttribute('aria-expanded', String(open));
  });
  $$('#main-nav a').forEach(a => a.addEventListener('click', () => {
    nav.classList.remove('open');
    menuToggle?.setAttribute('aria-expanded', 'false');
  }));

  // Reveal
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    }), { threshold: 0.1 });
    $$('.reveal').forEach(el => observer.observe(el));
  } else {
    $$('.reveal').forEach(el => el.classList.add('visible'));
  }

  // Interactive demo
  const demoState = { tokens: 5, found: new Set(), actions: new Set(), wheelRotation: 0 };
  const secretNames = new Map([
    ['peseta', 'PESETA'],
    ['parlita', 'PARLITA'],
    ['consigliere', 'IL CONSIGLIERE'],
    ['il consigliere', 'IL CONSIGLIERE']
  ]);
  const demoTokens = $('#demo-tokens');
  const demoFound = $('#demo-found');
  const secretList = $('#secret-list');
  const finalButton = $('#open-final');
  const finalProgress = $('#final-progress');
  const finalLock = $('#final-lock');

  function renderDemo() {
    if (demoTokens) demoTokens.textContent = demoState.tokens;
    if (demoFound) demoFound.textContent = demoState.found.size;
    if (secretList) {
      const values = [...demoState.found].slice(0, 3);
      secretList.innerHTML = [0,1,2].map(i => values[i] ? `<span class="found">${values[i]}</span>` : '<span>???</span>').join('');
    }
    const unlocked = demoState.actions.size >= 2;
    if (finalButton) finalButton.disabled = !unlocked;
    if (finalProgress) finalProgress.textContent = unlocked ? 'La prueba final está preparada.' : `Completa ${2 - demoState.actions.size} acción${2-demoState.actions.size === 1 ? '' : 'es'} más para desbloquearla.`;
    if (finalLock) {
      finalLock.classList.toggle('unlocked', unlocked);
      finalLock.innerHTML = unlocked ? '<span>🔓</span><strong>PUTADA FINAL</strong><small>PREPARADA</small>' : '<span>🔒</span><strong>PUTADA FINAL</strong><small>BLOQUEADA</small>';
    }
  }

  $$('[data-demo-tab]').forEach(button => button.addEventListener('click', () => {
    $$('[data-demo-tab]').forEach(b => {
      const active = b === button;
      b.classList.toggle('active', active);
      b.setAttribute('aria-selected', String(active));
    });
    $$('[data-demo-panel]').forEach(panel => panel.classList.toggle('active', panel.dataset.demoPanel === button.dataset.demoTab));
  }));

  const wheelResults = [
    'Conseguir que un desconocido os dedique un brindis.',
    'Bailar 30 segundos sin música.',
    'Pedir una foto como si fuerais famosos.',
    'Improvisar un discurso de boda.',
    'Cantar el estribillo del himno del grupo.',
    'El comité elige un accesorio para la siguiente hora.'
  ];
  $('#spin-wheel')?.addEventListener('click', event => {
    const wheel = $('#demo-wheel');
    const result = $('#wheel-result');
    const button = event.currentTarget;
    button.disabled = true;
    demoState.wheelRotation += 1440 + Math.floor(Math.random() * 720);
    if (wheel) wheel.style.transform = `rotate(${demoState.wheelRotation}deg)`;
    if (result) result.textContent = 'La ruleta está decidiendo…';
    setTimeout(() => {
      const text = wheelResults[Math.floor(Math.random() * wheelResults.length)];
      if (result) result.textContent = text;
      demoState.actions.add('wheel');
      renderDemo();
      button.disabled = false;
    }, matchMedia('(prefers-reduced-motion: reduce)').matches ? 100 : 3100);
  });

  $$('.demo-shop [data-buy-cost]').forEach(button => button.addEventListener('click', () => {
    const cost = Number(button.dataset.buyCost);
    const status = $('#shop-status');
    if (button.dataset.bought === 'true') {
      showToast('Este reto ya está comprado en la demo');
      return;
    }
    if (demoState.tokens < cost) {
      if (status) status.textContent = `No tienes suficientes tokens. Te quedan ${demoState.tokens}.`;
      return;
    }
    demoState.tokens -= cost;
    button.dataset.bought = 'true';
    button.disabled = true;
    button.textContent = 'Comprado ✓';
    if (status) status.textContent = `Reto comprado. Te quedan ${demoState.tokens} tokens.`;
    demoState.actions.add('shop');
    renderDemo();
  }));

  $('#secret-form')?.addEventListener('submit', event => {
    event.preventDefault();
    const input = $('#secret-input');
    const feedback = $('#secret-feedback');
    const normalized = input.value.trim().toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '');
    const found = secretNames.get(normalized);
    if (!found) {
      feedback.textContent = 'No es uno de los nombres de esta demo.';
      feedback.style.color = '#ff9a9a';
      return;
    }
    demoState.found.add(found);
    demoState.actions.add('name');
    feedback.textContent = demoState.found.size === 3 ? 'Todos los nombres de la demo descubiertos.' : `Nombre descubierto: ${found}`;
    feedback.style.color = '';
    input.value = '';
    renderDemo();
  });

  $('#demo-reset')?.addEventListener('click', () => {
    demoState.tokens = 5;
    demoState.found.clear();
    demoState.actions.clear();
    demoState.wheelRotation = 0;
    const wheel = $('#demo-wheel');
    if (wheel) wheel.style.transform = 'rotate(0deg)';
    $$('.demo-shop [data-buy-cost]').forEach(button => {
      button.disabled = false;
      button.dataset.bought = 'false';
      button.textContent = 'Comprar';
    });
    if ($('#shop-status')) $('#shop-status').textContent = 'Tienes 5 tokens disponibles.';
    if ($('#wheel-result')) $('#wheel-result').textContent = 'Pulsa para lanzar una prueba.';
    if ($('#secret-feedback')) $('#secret-feedback').textContent = '';
    renderDemo();
    showToast('Demo reiniciada');
  });

  // Modals
  const finalModal = $('#final-modal');
  const videoModal = $('#video-modal');
  const lightbox = $('#lightbox');
  function openDialog(dialog) {
    if (!dialog) return;
    if (typeof dialog.showModal === 'function') dialog.showModal();
    else dialog.setAttribute('open', '');
  }
  function closeDialog(dialog) {
    if (!dialog) return;
    dialog.querySelector('video')?.pause();
    if (typeof dialog.close === 'function') dialog.close();
    else dialog.removeAttribute('open');
  }
  $('#open-final')?.addEventListener('click', () => openDialog(finalModal));
  $$('[data-open-final-preview]').forEach(b => b.addEventListener('click', () => openDialog(finalModal)));
  $$('[data-open-video]').forEach(b => b.addEventListener('click', () => openDialog(videoModal)));
  $$('.media-modal .modal-close').forEach(b => b.addEventListener('click', () => closeDialog(b.closest('dialog'))));
  $$('.media-modal').forEach(dialog => dialog.addEventListener('click', event => {
    if (event.target === dialog) closeDialog(dialog);
  }));
  $$('[data-lightbox]').forEach(button => button.addEventListener('click', () => {
    const img = $('img', lightbox);
    if (img) img.src = button.dataset.lightbox;
    openDialog(lightbox);
  }));
  $('.lightbox .modal-close')?.addEventListener('click', () => closeDialog(lightbox));
  lightbox?.addEventListener('click', event => { if (event.target === lightbox) closeDialog(lightbox); });
  addEventListener('keydown', event => {
    if (event.key === 'Escape') $$('dialog[open]').forEach(closeDialog);
  });

  // Style selector
  const styleData = {
    canalla: ['EVENTO ACTIVO · NIVEL 01','LA ÚLTIMA NOCHE DE LIBERTAD','Completa las misiones, reúne tokens y desbloquea el desenlace.','ESTILO CANALLA'],
    elegante: ['EDICIÓN PRIVADA · 2026','UNA NOCHE PARA RECORDAR','Un programa exclusivo, diseñado alrededor de vuestra historia.','ESTILO ELEGANTE'],
    videojuego: ['PARTIDA INICIADA · NIVEL 01','MISIÓN: SALVAR AL NOVIO','Suma experiencia, completa logros y derrota al jefe final.','ESTILO VIDEOJUEGO'],
    mafia: ['EXPEDIENTE RESERVADO · FAMILIA','EL ÚLTIMO TRABAJO','Cumple los contratos y demuestra tu lealtad a la familia.','ESTILO MAFIA'],
    reality: ['EMISIÓN EN DIRECTO · GALA 01','LA CASA DE LA DESPEDIDA','Vota, nomina y sobrevive a las decisiones del público.','ESTILO REALITY'],
    festival: ['ACCESO GENERAL · FIN DE SEMANA','THE LAST FREEDOM FEST','Escenarios, horarios, retos y recuerdos en una sola pulsera digital.','ESTILO FESTIVAL']
  };
  const preview = $('#style-preview');
  $$('[data-style]').forEach(button => button.addEventListener('click', () => {
    const key = button.dataset.style;
    $$('[data-style]').forEach(b => b.classList.toggle('active', b === button));
    preview.className = `style-preview theme-${key} reveal visible`;
    const [kicker,title,copy,label] = styleData[key];
    $('#style-kicker').textContent = kicker;
    $('#style-title').textContent = title;
    $('#style-copy').textContent = copy;
    $('#style-label').textContent = label;
  }));

  // Comparison
  $('#toggle-comparison')?.addEventListener('click', event => {
    const comp = $('.comparison');
    const expanded = comp.classList.toggle('expanded');
    event.currentTarget.textContent = expanded ? 'Ocultar filas extra' : 'Ver tabla completa';
  });

  // Calculator
  const calcState = { base: 549, level: 'Esencial' };
  const calcRange = $('#calc-range');
  const calcLevel = $('#calc-level');
  function calculate() {
    let total = calcState.base;
    total += Number($('#calc-people')?.value || 0);
    total += Number($('#calc-urgency')?.value || 0);
    total += Number($('#calc-style')?.value || 0);
    total += Number($('#calc-revisions')?.value || 0);
    $$('.calc-extras input:checked').forEach(input => total += Number(input.value));
    const high = Math.ceil((total + Math.max(100, total * 0.12)) / 10) * 10;
    const low = Math.floor(total / 10) * 10;
    calcRange.textContent = `${low.toLocaleString('es-ES')}–${high.toLocaleString('es-ES')} €`;
    calcLevel.textContent = `Paquete ${calcState.level}`;
    return { low, high };
  }
  $$('#base-package button').forEach(button => button.addEventListener('click', () => {
    $$('#base-package button').forEach(b => b.classList.toggle('active', b === button));
    calcState.base = Number(button.dataset.base);
    calcState.level = button.dataset.level;
    calculate();
  }));
  $$('#calculator select, #calculator input').forEach(input => input.addEventListener('change', calculate));

  $('#use-estimate')?.addEventListener('click', () => {
    const { low, high } = calculate();
    const packageSelect = $('#lead-package');
    if (packageSelect) packageSelect.value = calcState.level;
    const estimate = $('#lead-estimate');
    if (estimate) estimate.value = `${low}–${high} € (${calcState.level})`;
    const extras = $$('.calc-extras input:checked').map(i => i.dataset.extra);
    const message = $('[name="message"]', $('#lead-form'));
    if (message && !message.value.trim()) {
      message.value = `Nos interesa el paquete ${calcState.level}. Extras seleccionados: ${extras.length ? extras.join(', ') : 'ninguno por ahora'}.\n\nNuestra idea: `;
    }
    $('#contacto')?.scrollIntoView({ behavior: 'smooth' });
    showToast('Estimación añadida a la solicitud');
  });

  $$('.package-button').forEach(button => button.addEventListener('click', () => {
    const select = $('#lead-package');
    if (select) select.value = button.dataset.package || 'Aún no lo sé';
  }));

  // Contact tools
  function buildRequest() {
    const form = $('#lead-form');
    const data = new FormData(form);
    return [
      `Nombre: ${data.get('name') || 'Sin indicar'}`,
      `Correo: ${data.get('email') || 'Sin indicar'}`,
      `Teléfono: ${data.get('phone') || 'Sin indicar'}`,
      `Fecha: ${data.get('date') || 'Sin definir'}`,
      `Evento: ${data.get('event') || 'Sin indicar'}`,
      `Participantes: ${data.get('people') || 'Sin definir'}`,
      `Paquete: ${data.get('package') || 'Sin definir'}`,
      `Presupuesto: ${data.get('budget') || 'Sin definir'}`,
      `Estimación web: ${data.get('estimate') || 'No calculada'}`,
      '',
      'Idea:',
      data.get('message') || 'Sin indicar'
    ].join('\n');
  }
  $('#copy-email')?.addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(CONTACT_EMAIL); showToast('Correo copiado'); }
    catch { showToast(CONTACT_EMAIL); }
  });
  $('#copy-request')?.addEventListener('click', async () => {
    const text = buildRequest();
    try { await navigator.clipboard.writeText(text); showToast('Resumen copiado'); }
    catch { showToast('No se pudo copiar automáticamente'); }
  });
  const leadForm = $('#lead-form');
  const submitFrame = $('#dv-submit-frame');
  const BACKEND_URL = String(
    CONFIG.appsScriptUrl || 'https://script.google.com/macros/s/AKfycbxIqb1g2-7QK3lugDkGcfQWU2o3r2c-qSp-om2cdNa_4s6enhqTS457SIuI1xL_kno0HQ/exec'
  ).trim();
  let leadIsSending = false;

  function configureExternalLinks() {
    const emailLink = $('#contact-email-link');
    if (emailLink) {
      emailLink.href = `mailto:${CONTACT_EMAIL}`;
      emailLink.textContent = CONTACT_EMAIL;
    }
    const tallyLink = $('#tally-contact-link');
    if (tallyLink && CONFIG.tallyFormUrl) {
      tallyLink.href = CONFIG.tallyFormUrl;
      tallyLink.hidden = false;
    }
    $$('.payment-button[data-payment]').forEach(button => {
      const url = CONFIG.paymentLinks?.[button.dataset.payment];
      if (url) {
        button.href = url;
        button.target = '_blank';
        button.rel = 'noopener';
        button.hidden = false;
      }
    });
  }

  function setLeadFormState(state, message) {
    if (!leadForm) return;
    const status = $('#form-status');
    const label = $('.submit-label', leadForm);
    const submit = $('.form-submit', leadForm);

    leadForm.classList.toggle('is-sending', state === 'sending');
    leadForm.classList.toggle('is-success', state === 'success');
    leadForm.classList.toggle('is-error', state === 'error');

    if (submit) submit.disabled = state === 'sending' || state === 'success';
    if (status) status.textContent = message || '';

    if (label) {
      label.textContent =
        state === 'sending' ? 'Enviando…' :
        state === 'success' ? 'Solicitud enviada ✓' :
        state === 'error' ? 'Reintentar envío' :
        'Enviar solicitud';
    }
  }

  function formDataToUrlEncoded(formData) {
    const params = new URLSearchParams();
    for (const [key, value] of formData.entries()) {
      params.append(key, typeof value === 'string' ? value : String(value));
    }
    params.set('action', 'lead');
    params.set('source', 'web-comercial');
    params.set('siteVersion', 'v10-routes');
    return params;
  }

  function launchLeadPost(form) {
    if (!submitFrame) {
      throw new Error('No existe el canal de envío');
    }

    const transportForm = document.createElement('form');
    transportForm.method = 'post';
    transportForm.action = BACKEND_URL;
    transportForm.target = 'dv-submit-frame';
    transportForm.acceptCharset = 'UTF-8';
    transportForm.style.display = 'none';

    const payload = new FormData(form);
    payload.set('action', 'lead');
    payload.set('source', 'web-comercial');
    payload.set('siteVersion', 'v10-routes');
    payload.set(
      'submissionNonce',
      `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
    );

    for (const [name, value] of payload.entries()) {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = name;
      input.value = typeof value === 'string' ? value : String(value);
      transportForm.appendChild(input);
    }

    document.body.appendChild(transportForm);

    try {
      HTMLFormElement.prototype.submit.call(transportForm);
    } finally {
      // El formulario ya ha sido entregado al navegador. No intentamos leer
      // la respuesta de Google porque es de otro dominio.
      setTimeout(() => transportForm.remove(), 5000);
    }
  }

  leadForm?.addEventListener('submit', event => {
    event.preventDefault();

    if (leadIsSending) return;

    if (!event.currentTarget.reportValidity()) {
      setLeadFormState('error', 'Revisa los campos obligatorios.');
      return;
    }

    if (!BACKEND_URL || !BACKEND_URL.startsWith('https://script.google.com/')) {
      setLeadFormState('error', 'El sistema de solicitudes no está disponible.');
      showToast('No se pudo conectar con el sistema');
      return;
    }

    leadIsSending = true;
    setLeadFormState('sending', 'Registrando la solicitud directamente…');

    try {
      launchLeadPost(event.currentTarget);

      sessionStorage.setItem('dvLeadSentAt', String(Date.now()));
      setLeadFormState(
        'success',
        'Solicitud enviada correctamente. Recibirás la confirmación por correo.'
      );
      showToast('Solicitud enviada correctamente');

      // No limpiamos los campos hasta haber lanzado el POST.
      setTimeout(() => event.currentTarget.reset(), 150);

      setTimeout(() => {
        location.href = '/gracias?enviada=1';
      }, 1100);
    } catch (error) {
      console.error('No se pudo lanzar el formulario:', error);
      leadIsSending = false;
      setLeadFormState(
        'error',
        'No se pudo iniciar el envío. Recarga la página y vuelve a intentarlo.'
      );
      showToast('No se pudo iniciar el envío.');
    }
  });


  configureExternalLinks();

  // PWA
  let installPrompt = null;
  const installButton = $('#install-app');
  addEventListener('beforeinstallprompt', event => {
    event.preventDefault();
    installPrompt = event;
    installButton.hidden = false;
  });
  installButton?.addEventListener('click', async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    await installPrompt.userChoice;
    installPrompt = null;
    installButton.hidden = true;
  });
  if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
    addEventListener('load', () => navigator.serviceWorker.register('./sw.js').catch(() => {}));
  }

  $('#year').textContent = new Date().getFullYear();
  renderDemo();
  calculate();
})();