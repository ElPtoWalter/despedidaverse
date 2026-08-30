(() => {
  'use strict';

  const config = window.DV_CONFIG || {};
  const params = new URLSearchParams(location.search);

  const id = String(params.get('id') || sessionStorage.getItem('dvProjectId') || '')
    .trim()
    .toUpperCase();

  const code = String(params.get('code') || sessionStorage.getItem('dvProjectCode') || '')
    .trim()
    .toUpperCase();

  const loading = document.querySelector('#management-loading');
  const directLink = document.querySelector('#management-direct-link');

  if (params.has('code')) history.replaceState(null, '', location.pathname);

  function showError(message) {
    if (!loading) return;

    loading.innerHTML =
      `<strong>No se puede abrir el portal.</strong>` +
      `<span>${message}</span>`;

    if (directLink) directLink.hidden = true;
  }

  if (!config.appsScriptUrl) {
    showError('Falta conectar Google Apps Script en config.js.');
    return;
  }

  if (!id || !code) {
    showError('Faltan el identificador o el código de acceso.');
    return;
  }

  if (!/^DV-\d{4}-\d{4,}$/.test(id)) {
    showError('El identificador no tiene un formato válido.');
    return;
  }

  const query = new URLSearchParams({
    action: 'portal',
    id,
    code,
    _: String(Date.now())
  });

  const portalUrl = `${config.appsScriptUrl}?${query.toString()}`;

  sessionStorage.setItem('dvProjectId', id);
  sessionStorage.setItem('dvProjectCode', code);

  if (directLink) {
    directLink.href = portalUrl;
    directLink.hidden = false;
  }

  if (loading) {
    loading.innerHTML =
      '<strong>Abriendo la gestión privada…</strong>' +
      '<span>Serás redirigido al portal seguro del proyecto.</span>';
  }

  // Apps Script se abre como documento principal. Así google.script.run,
  // formularios y cargas de archivos funcionan en su contexto nativo.
  window.setTimeout(() => {
    location.replace(portalUrl);
  }, 350);
})();
