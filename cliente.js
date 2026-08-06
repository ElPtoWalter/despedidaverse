(() => {
  'use strict';

  const config = window.DV_CONFIG || {};
  const form = document.querySelector('#status-form');
  const message = document.querySelector('#status-message');
  const panel = document.querySelector('#project-status');
  const bridgeFrame = document.querySelector('#status-bridge-frame');

  let requestTimer = null;
  let activeRequestToken = '';
  let requestInProgress = false;

  function text(selector, value) {
    const element = document.querySelector(selector);
    if (element) element.textContent = value || '—';
  }

  function escapeValue(value) {
    return String(value || '').replace(/[<>&"']/g, '');
  }

  function setMessage(value, state = '') {
    message.textContent = value;
    message.dataset.state = state;
  }

  function setLoading(loading) {
    requestInProgress = loading;
    const button = form.querySelector('button[type="submit"]');
    const inputs = form.querySelectorAll('input');

    button.disabled = loading;
    button.textContent = loading ? 'Consultando…' : 'Consultar estado';
    inputs.forEach(input => {
      input.readOnly = loading;
    });
  }

  function renderTimeline(current) {
    const stages = [
      'Solicitud recibida',
      'Propuesta preparada',
      'Reserva confirmada',
      'Material recibido',
      'Diseño y desarrollo',
      'Vista previa',
      'Proyecto publicado'
    ];

    const normalizedCurrent = String(current || '').trim().toLowerCase();
    let index = stages.findIndex(
      stage => stage.toLowerCase() === normalizedCurrent
    );

    if (index < 0) index = 0;

    const timeline = document.querySelector('#project-timeline');
    timeline.innerHTML = stages.map((stage, stageIndex) => {
      const cssClass =
        stageIndex < index ? 'done' :
        stageIndex === index ? 'active' :
        '';

      const label =
        stageIndex < index ? 'Completado' :
        stageIndex === index ? 'Estado actual' :
        'Pendiente';

      return `
        <div class="timeline-step ${cssClass}">
          <i></i>
          <div>
            <strong>${stage}</strong>
            <span>${label}</span>
          </div>
        </div>
      `;
    }).join('');
  }

  function clearRequest() {
    clearTimeout(requestTimer);
    requestTimer = null;
    setLoading(false);
  }

  function renderPayload(payload) {
    clearRequest();

    if (!payload || !payload.ok) {
      setMessage(
        payload?.message ||
          'No se ha encontrado un proyecto con esos datos.',
        'error'
      );
      panel.classList.remove('visible');
      return;
    }

    const project = payload.project || {};

    text('#project-id', project.id);
    text('#project-name', project.name || 'Proyecto DespedidaVerse');
    text('#project-badge', project.status);
    text('#project-package', project.package);
    text('#project-date', project.eventDate);
    text('#project-payment', project.paymentStatus);
    text('#project-materials', project.materialsStatus);
    text('#project-updated', project.lastUpdate);
    text('#project-next', project.nextStep);

    renderTimeline(project.stage || project.status);

    const previewLink = document.querySelector('#preview-link');
    previewLink.hidden = !project.previewUrl;
    if (project.previewUrl) previewLink.href = project.previewUrl;

    const paymentLink = document.querySelector('#payment-link');
    paymentLink.hidden = !project.paymentUrl;
    if (project.paymentUrl) paymentLink.href = project.paymentUrl;

    const onboardingLink = document.querySelector('#onboarding-link');
    onboardingLink.href =
      `https://despedidaverse.com/onboarding` +
      `?id=${encodeURIComponent(project.id || '')}` +
      `&code=${encodeURIComponent(project.accessCode || '')}`;

    setMessage('Estado actualizado correctamente.', 'success');
    panel.classList.add('visible');
  }

  function validBridgeMessage(event) {
    if (!bridgeFrame || event.source !== bridgeFrame.contentWindow) {
      return false;
    }

    const data = event.data;
    return Boolean(
      data &&
      data.type === 'despedidaverse:status' &&
      data.requestToken &&
      data.requestToken === activeRequestToken
    );
  }

  window.addEventListener('message', event => {
    if (!validBridgeMessage(event)) return;
    renderPayload(event.data.payload);
  });

  function requestProjectStatus(id, code) {
    if (!config.appsScriptUrl) {
      setMessage(
        'Falta conectar Google Apps Script en config.js.',
        'error'
      );
      return;
    }

    activeRequestToken =
      `${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;

    const params = new URLSearchParams({
      action: 'status_bridge',
      id,
      code,
      requestToken: activeRequestToken,
      parentOrigin: location.origin,
      _: String(Date.now())
    });

    setLoading(true);
    setMessage('Consultando el estado del proyecto…', 'loading');
    panel.classList.remove('visible');

    bridgeFrame.src =
      `${config.appsScriptUrl}?${params.toString()}`;

    requestTimer = setTimeout(() => {
      clearRequest();
      setMessage(
        'La consulta ha tardado demasiado. Recarga la página y vuelve a intentarlo.',
        'error'
      );
    }, 15000);
  }

  form.addEventListener('submit', event => {
    event.preventDefault();
    if (requestInProgress) return;

    const id = document.querySelector('#status-id').value
      .trim()
      .toUpperCase();

    const code = document.querySelector('#status-code').value
      .trim()
      .toUpperCase();

    if (!id || !code) {
      setMessage(
        'Introduce el identificador y el código de acceso.',
        'error'
      );
      return;
    }

    requestProjectStatus(id, code);
  });

  const params = new URLSearchParams(location.search);

  if (params.get('id')) {
    document.querySelector('#status-id').value =
      escapeValue(params.get('id')).toUpperCase();
  }

  if (params.get('code')) {
    document.querySelector('#status-code').value =
      escapeValue(params.get('code')).toUpperCase();
  }

  if (params.get('id') && params.get('code')) {
    form.requestSubmit();
  }
})();
