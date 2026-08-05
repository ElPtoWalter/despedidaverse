(() => {
  const config = window.DV_CONFIG || {};
  const form = document.querySelector('#status-form');
  const message = document.querySelector('#status-message');
  const panel = document.querySelector('#project-status');
  let activeScript = null;
  let timeout = null;

  function text(id, value) { const el = document.querySelector(id); if (el) el.textContent = value || '—'; }
  function escapeValue(value) { return String(value || '').replace(/[<>&\"']/g, ''); }
  function renderTimeline(current) {
    const stages = ['Solicitud recibida','Propuesta preparada','Reserva confirmada','Material recibido','Diseño y desarrollo','Vista previa','Proyecto publicado'];
    const index = Math.max(0, stages.findIndex(s => s.toLowerCase() === String(current || '').toLowerCase()));
    document.querySelector('#project-timeline').innerHTML = stages.map((stage, i) => `<div class="timeline-step ${i < index ? 'done' : i === index ? 'active' : ''}"><i></i><div><strong>${stage}</strong><span>${i < index ? 'Completado' : i === index ? 'Estado actual' : 'Pendiente'}</span></div></div>`).join('');
  }
  window.dvStatusCallback = payload => {
    clearTimeout(timeout);
    activeScript?.remove();
    if (!payload || !payload.ok) {
      message.textContent = payload?.message || 'No se ha encontrado un proyecto con esos datos.';
      panel.classList.remove('visible');
      return;
    }
    const p = payload.project || {};
    text('#project-id', p.id);
    text('#project-name', p.name || 'Proyecto DespedidaVerse');
    text('#project-badge', p.status);
    text('#project-package', p.package);
    text('#project-date', p.eventDate);
    text('#project-payment', p.paymentStatus);
    text('#project-materials', p.materialsStatus);
    text('#project-updated', p.lastUpdate);
    text('#project-next', p.nextStep);
    renderTimeline(p.stage || p.status);
    const preview = document.querySelector('#preview-link');
    preview.hidden = !p.previewUrl; if (p.previewUrl) preview.href = p.previewUrl;
    const pay = document.querySelector('#payment-link');
    pay.hidden = !p.paymentUrl; if (p.paymentUrl) pay.href = p.paymentUrl;
    document.querySelector('#onboarding-link').href = `/onboarding?id=${encodeURIComponent(p.id || '')}&code=${encodeURIComponent(p.accessCode || '')}`;
    message.textContent = 'Estado actualizado.';
    panel.classList.add('visible');
  };
  form.addEventListener('submit', event => {
    event.preventDefault();
    if (!config.appsScriptUrl) { message.textContent = 'El área de cliente está preparada, pero falta conectar Google Apps Script en config.js.'; return; }
    const id = document.querySelector('#status-id').value.trim();
    const code = document.querySelector('#status-code').value.trim();
    message.textContent = 'Consultando…'; panel.classList.remove('visible');
    activeScript?.remove();
    activeScript = document.createElement('script');
    const sep = config.appsScriptUrl.includes('?') ? '&' : '?';
    activeScript.src = `${config.appsScriptUrl}${sep}action=status&id=${encodeURIComponent(id)}&code=${encodeURIComponent(code)}&callback=dvStatusCallback&_=${Date.now()}`;
    activeScript.onerror = () => { message.textContent = 'No ha sido posible conectar con el sistema.'; };
    document.body.append(activeScript);
    timeout = setTimeout(() => { activeScript?.remove(); message.textContent = 'La consulta ha tardado demasiado. Revisa la conexión.'; }, 12000);
  });
  const params = new URLSearchParams(location.search);
  if (params.get('id')) document.querySelector('#status-id').value = escapeValue(params.get('id'));
  if (params.get('code')) document.querySelector('#status-code').value = escapeValue(params.get('code'));
  if (params.get('id') && params.get('code')) form.requestSubmit();
})();
