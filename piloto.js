(() => {
  'use strict';

  const config = window.DV_CONFIG || {};
  const form = document.querySelector('#pilot-form');
  const message = document.querySelector('#pilot-message');
  const button = form?.querySelector('button[type="submit"]');
  const token = sessionStorage.getItem('dvPilotToken') || '';

  function setMessage(text, state = '') {
    if (!message) return;
    message.textContent = text;
    message.dataset.state = state;
  }

  function deviceFamily() {
    const ua = navigator.userAgent || '';
    if (/iPad|Tablet/i.test(ua)) return 'tablet';
    if (/iPhone|iPod/i.test(ua)) return 'iphone';
    if (/Android/i.test(ua)) return 'android';
    if (/Windows|Macintosh|Linux/i.test(ua)) return 'desktop';
    return 'other';
  }

  const device = document.querySelector('#pilot-device');
  if (device) device.value = deviceFamily();

  for (const [selector, output] of [
    ['[name="taskComplete"]', '#task-output'],
    ['[name="recommend"]', '#recommend-output']
  ]) {
    const input = document.querySelector(selector);
    const target = document.querySelector(output);
    input?.addEventListener('input', () => { if (target) target.textContent = input.value; });
  }

  const apiUrl = String(config.commerceApiUrl || '').replace(/\/$/, '');
  if (!config.pilotEnabled || !/^https:\/\//.test(apiUrl) || !/^[a-f0-9]{64}$/i.test(token)) {
    if (button) button.disabled = true;
    setMessage('Esta invitación no está activa o ya no es válida. Pide un enlace nuevo a la persona que organiza el piloto.', 'error');
  }

  form?.addEventListener('submit', async event => {
    event.preventDefault();
    if (!form.reportValidity() || button?.disabled) return;
    const data = Object.fromEntries(new FormData(form));
    const payload = {
      token,
      role: data.role,
      device: data.device,
      taskComplete: Number(data.taskComplete),
      setupMinutes: Number(data.setupMinutes),
      clarity: Number(data.clarity),
      visualQuality: Number(data.visualQuality),
      delight: Number(data.delight),
      reliability: Number(data.reliability),
      recommend: Number(data.recommend),
      blocker: String(data.blocker || '').trim(),
      highlight: String(data.highlight || '').trim()
    };
    button.disabled = true;
    form.classList.add('is-sending');
    setMessage('Guardando la evaluación…');
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 12000);
    try {
      const response = await fetch(`${apiUrl}/api/pilot-feedback`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'omit',
        referrerPolicy: 'no-referrer',
        signal: controller.signal
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || result.ok !== true) throw new Error(result.error || 'No se pudo guardar la evaluación.');
      sessionStorage.removeItem('dvPilotToken');
      form.reset();
      form.classList.remove('is-sending');
      form.classList.add('is-success');
      form.querySelectorAll('input,select,textarea').forEach(field => { field.disabled = true; });
      setMessage('Evaluación recibida. Gracias por ayudarnos a decidir con datos reales.', 'success');
      button.textContent = 'Evaluación enviada ✓';
    } catch (error) {
      form.classList.remove('is-sending');
      button.disabled = false;
      setMessage(String(error?.message || 'No se pudo guardar la evaluación. Vuelve a intentarlo.'), 'error');
    } finally {
      window.clearTimeout(timeout);
    }
  });
})();
