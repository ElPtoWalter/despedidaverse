(() => {
  const config = window.DV_CONFIG || {};
  const form = document.querySelector('#onboarding-form');
  const message = document.querySelector('#onboarding-message');
  const label = document.querySelector('.onboarding-submit-label');
  const params = new URLSearchParams(location.search);
  if (params.get('id')) document.querySelector('#onboarding-id').value = params.get('id');
  if (params.get('code')) document.querySelector('#onboarding-code').value = params.get('code');
  form.addEventListener('submit', event => {
    if (!form.reportValidity()) { event.preventDefault(); return; }
    if (!config.appsScriptUrl) {
      event.preventDefault();
      const data = new FormData(form);
      const body = [...data.entries()].map(([k,v]) => `${k}: ${v}`).join('\n');
      location.href = `mailto:${config.contactEmail || 'fdez.edu00@gmail.com'}?subject=${encodeURIComponent('Material DespedidaVerse — ' + data.get('requestId'))}&body=${encodeURIComponent(body)}`;
      message.textContent = 'Se ha preparado el material en tu aplicación de correo.';
      return;
    }
    form.action = config.appsScriptUrl;
    form.classList.add('is-sending');
    label.textContent = 'Enviando…';
    message.textContent = 'Registrando material…';
    setTimeout(() => {
      form.classList.remove('is-sending');
      form.classList.add('is-success');
      label.textContent = 'Material enviado ✓';
      message.textContent = 'Material registrado. Recibirás una confirmación por correo.';
      setTimeout(() => location.href = 'gracias.html?tipo=material', 900);
    }, 1700);
  });
})();
