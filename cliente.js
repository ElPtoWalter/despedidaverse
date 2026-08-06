(() => {
  'use strict';

  const form = document.querySelector('#status-form');
  const message = document.querySelector('#status-message');

  function setMessage(value, state = '') {
    if (!message) return;
    message.textContent = value;
    message.dataset.state = state;
  }

  function clean(value) {
    return String(value || '')
      .trim()
      .replace(/[<>&"'`]/g, '');
  }

  function openProjectPortal(id, code) {
    const url = new URL('/gestion', location.origin);
    url.searchParams.set('id', id);
    url.searchParams.set('code', code);
    url.searchParams.set('_', String(Date.now()));

    sessionStorage.setItem('dvProjectId', id);
    sessionStorage.setItem('dvProjectCode', code);

    setMessage('Acceso correcto. Abriendo la gestión privada…', 'success');

    window.setTimeout(() => {
      location.assign(url.toString());
    }, 250);
  }

  form?.addEventListener('submit', event => {
    event.preventDefault();

    const id = clean(document.querySelector('#status-id')?.value)
      .toUpperCase();

    const code = clean(document.querySelector('#status-code')?.value)
      .toUpperCase();

    if (!id || !code) {
      setMessage(
        'Introduce el identificador y el código de acceso.',
        'error'
      );
      return;
    }

    if (!/^DV-\d{4}-\d{4,}$/.test(id)) {
      setMessage(
        'El identificador debe tener un formato como DV-2026-0005.',
        'error'
      );
      return;
    }

    openProjectPortal(id, code);
  });

  const params = new URLSearchParams(location.search);
  const storedId = sessionStorage.getItem('dvProjectId') || '';
  const storedCode = sessionStorage.getItem('dvProjectCode') || '';

  const initialId = clean(params.get('id') || storedId).toUpperCase();
  const initialCode = clean(params.get('code') || storedCode).toUpperCase();

  if (initialId) {
    document.querySelector('#status-id').value = initialId;
  }

  if (initialCode) {
    document.querySelector('#status-code').value = initialCode;
  }

  if (params.get('autostart') === '1' && initialId && initialCode) {
    form.requestSubmit();
  }
})();
