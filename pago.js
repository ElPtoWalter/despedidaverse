(() => {
  'use strict';

  const status = sessionStorage.getItem('dvCheckoutReturn') || 'pending';
  sessionStorage.removeItem('dvCheckoutReturn');
  const title = document.querySelector('#checkout-return-title');
  const copy = document.querySelector('#checkout-return-copy');
  const icon = document.querySelector('#checkout-return-icon');

  const states = {
    success: {
      icon: '✓',
      title: 'Pago recibido; verificación en curso',
      copy: 'Stripe ha completado el proceso de cobro. El servidor está conciliando el importe con vuestra propuesta antes de habilitar el siguiente paso.'
    },
    cancel: {
      icon: '←',
      title: 'El pago no se ha completado',
      copy: 'No se ha iniciado ninguna producción desde esta pantalla. Puedes volver al área de cliente y retomar el pago cuando lo necesites.'
    },
    pending: {
      icon: '⌁',
      title: 'Estamos verificando el pago',
      copy: 'La confirmación definitiva llega por el canal seguro del servidor y aparecerá en el área de cliente.'
    }
  };
  const state = states[status] || states.pending;
  if (icon) icon.textContent = state.icon;
  if (title) title.textContent = state.title;
  if (copy) copy.textContent = state.copy;
})();
