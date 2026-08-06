(() => {
  'use strict';

  const config = window.DV_CONFIG || {};
  const params = new URLSearchParams(location.search);
  const id = String(params.get('id') || '').trim().toUpperCase();
  const code = String(params.get('code') || '').trim().toUpperCase();

  const frame = document.querySelector('#management-frame');
  const loading = document.querySelector('#management-loading');
  const fallback = document.querySelector('#management-fallback');

  if (!config.appsScriptUrl || !id || !code) {
    loading.textContent =
      'Faltan el identificador o el código de acceso.';
    return;
  }

  const query = new URLSearchParams({
    action: 'portal',
    id,
    code,
    _: String(Date.now())
  });

  const portalUrl = `${config.appsScriptUrl}?${query.toString()}`;

  if (fallback) {
    fallback.href = portalUrl;
  }

  let loaded = false;

  frame.addEventListener('load', () => {
    loaded = true;
    loading.hidden = true;
    frame.hidden = false;
  });

  frame.src = portalUrl;

  window.setTimeout(() => {
    if (loaded) return;

    loading.innerHTML =
      '<strong>El portal está tardando más de lo normal.</strong>' +
      '<span>Puedes abrirlo directamente con el botón inferior.</span>';

    if (fallback) fallback.hidden = false;
  }, 9000);
})();
