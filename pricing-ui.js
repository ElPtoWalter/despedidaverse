(() => {
  'use strict';
  const catalog = window.DV_CATALOG;
  if (!catalog) return;
  const $ = selector => document.querySelector(selector);
  const $$ = selector => [...document.querySelectorAll(selector)];
  const params = new URLSearchParams(location.search);
  const selected = catalog.findPlan(params.get('paquete'));
  let plan = selected || catalog.plans[0];
  let people = catalog.validPeople(params.get('personas')) || catalog.defaultPeople;
  const countInput = $('#price-people');
  const calcInput = $('#calc-people');
  const leadPackage = $('#lead-package');
  const leadPeople = $('#lead-people');
  const estimateInput = $('#lead-estimate');
  const styleParam = catalog.styles.find(style => style.toLowerCase() === String(params.get('estilo')).toLowerCase());
  if (countInput) countInput.value = people;
  if (calcInput) calcInput.value = people;
  if (selected && leadPackage) leadPackage.value = plan.name;
  if (selected && leadPeople) leadPeople.value = people;
  if (styleParam && $('#lead-style')) $('#lead-style').value = styleParam;

  const scopes = {
    esencial: 'Historia y mensajes, recuerdos privados, QR y cierre personalizado. Sin tokens ni comité.',
    juego: '18 retos, ruleta, tokens, hasta 12 identidades, QR de jugadores, acceso de comité y misión final.',
    universo: '36 retos, hasta 30 identidades, archivo, radio, mapa, progresión, comité y desenlace ampliado.'
  };
  function selectedExtras() { return $$('.calc-extras input:checked').map(input => input.dataset.extra).filter(extra => catalog.extras.includes(extra)); }
  function reference() {
    const parts = [`Paquete ${plan.name}: ${catalog.money(plan.amountMinor)} por grupo, IVA incluido`, `catálogo ${catalog.version}`];
    const quote = catalog.quote(plan.id, people);
    if (quote) parts.push(`reparto orientativo entre ${quote.people}: ${catalog.money(quote.perPersonMinor, true)}/persona`);
    const extras = selectedExtras();
    if (extras.length) parts.push('extras pendientes de presupuesto: ' + extras.join(', '));
    for (const [selector, label] of [['#calc-urgency', 'Plazo'], ['#calc-style', 'Dirección visual'], ['#calc-revisions', 'Revisiones']]) {
      const input = $(selector);
      if (input && input.selectedIndex > 0) parts.push(`${label}: ${input.value}`);
    }
    return parts.join(' · ');
  }
  function updateEstimate() {
    // Do not overwrite historical proposals or treat this browser reference as a charge.
    if (estimateInput) estimateInput.value = leadPackage?.value ? reference() : '';
  }
  function renderPrices() {
    $$('[data-per-person]').forEach(element => {
      const quote = catalog.quote(element.dataset.perPerson, people);
      element.textContent = quote ? catalog.money(quote.perPersonMinor, true) : '—';
    });
    $$('[data-people-count]').forEach(element => element.textContent = people === null ? '—' : people);
    $$('[data-plan-link]').forEach(link => {
      const selectedPlan = catalog.findPlan(link.dataset.planLink);
      if (!selectedPlan) return;
      const query = new URLSearchParams({ paquete: selectedPlan.id });
      if (people !== null) query.set('personas', people);
      link.href = `/presupuesto?${query}#contacto`;
    });
    const quote = catalog.quote(plan.id, people);
    if ($('#calc-range')) $('#calc-range').textContent = catalog.money(plan.amountMinor);
    if ($('#calc-level')) $('#calc-level').textContent = `Paquete ${plan.name}`;
    if ($('#calc-per-person')) $('#calc-per-person').textContent = quote ? catalog.money(quote.perPersonMinor, true) : '—';
    if ($('#calc-count')) $('#calc-count').textContent = people === null ? '—' : people;
    if ($('#calc-scope')) $('#calc-scope').textContent = scopes[plan.id];
    $$('[data-plan]').forEach(button => {
      const active = button.dataset.plan === plan.id;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
    });
    updateEstimate();
  }
  function updateCount(input, errorId) {
    people = catalog.validPeople(input.value);
    input.setAttribute('aria-invalid', String(people === null));
    const error = $(errorId);
    if (error) error.textContent = people === null ? 'Introduce un número entero entre 2 y 300.' : '';
    if (leadPeople && input !== leadPeople && leadPackage?.value) leadPeople.value = people === null ? '' : people;
    renderPrices();
  }
  countInput?.addEventListener('input', () => updateCount(countInput, '#price-people-error'));
  calcInput?.addEventListener('input', () => updateCount(calcInput, '#calc-people-error'));
  leadPeople?.addEventListener('input', () => {
    people = catalog.validPeople(leadPeople.value);
    if (calcInput) { calcInput.value = people === null ? '' : people; calcInput.setAttribute('aria-invalid', String(people === null)); }
    renderPrices();
  });
  $$('[data-plan]').forEach(button => button.addEventListener('click', () => {
    const chosen = catalog.findPlan(button.dataset.plan);
    if (!chosen) return;
    plan = chosen;
    if (leadPackage) leadPackage.value = plan.name;
    if (leadPeople) leadPeople.value = people === null ? '' : people;
    renderPrices();
  }));
  leadPackage?.addEventListener('change', () => {
    const chosen = catalog.findPlan(leadPackage.value);
    if (chosen) plan = chosen;
    if (chosen && leadPeople && !leadPeople.value && people !== null) leadPeople.value = people;
    renderPrices();
  });
  $$('.budget-extras input, .budget-extras select').forEach(input => input.addEventListener('change', updateEstimate));
  $('#use-estimate')?.addEventListener('click', () => {
    if (people === null) { calcInput?.focus(); return; }
    if (leadPackage) leadPackage.value = plan.name;
    if (leadPeople) leadPeople.value = people;
    updateEstimate();
    $('#contacto')?.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    const status = $('#form-status');
    if (status) status.textContent = 'Selección incorporada. Completa tu solicitud; todavía no se ha enviado.';
  });
  // Keep old shared links useful after splitting the previous single-page website.
  const movedSections = { '#calculadora': '/presupuesto#calculadora', '#formatos': '/paquetes#formatos', '#estilos': '/estilos', '#caso': '/caso-real', '#asi-se-vive': '/caso-real#asi-se-vive', '#automatizacion': '/como-funciona' };
  if (location.pathname === '/' || location.pathname === '/index.html') {
    function restoreLink() { const target = movedSections[location.hash]; if (target) location.replace(target); }
    restoreLink();
    addEventListener('hashchange', restoreLink);
  }
  renderPrices();
})();
