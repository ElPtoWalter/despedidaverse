(() => {
  const header = document.querySelector('.site-header');
  const menuToggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.main-nav');
  const toast = document.getElementById('toast');
  const packageSelect = document.getElementById('package-select');

  const showToast = (message) => {
    toast.textContent = message;
    toast.classList.add('show');
    window.clearTimeout(showToast.timer);
    showToast.timer = window.setTimeout(() => toast.classList.remove('show'), 2600);
  };

  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 30);
  }, { passive: true });

  menuToggle?.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    menuToggle.setAttribute('aria-expanded', String(open));
  });

  nav?.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
    nav.classList.remove('open');
    menuToggle?.setAttribute('aria-expanded', 'false');
  }));

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

  document.querySelectorAll('.plan-button').forEach(button => {
    button.addEventListener('click', () => {
      if (packageSelect) packageSelect.value = button.dataset.package || 'Aún no lo sé';
    });
  });

  const optionInputs = [...document.querySelectorAll('#feature-options input')];
  const estimatePrice = document.getElementById('estimate-price');
  const estimateLevel = document.getElementById('estimate-level');
  const estimateList = document.getElementById('estimate-list');
  const estimateCta = document.getElementById('estimate-cta');

  const updateEstimate = () => {
    const selected = optionInputs.filter(input => input.checked);
    let total = 450 + selected.reduce((sum, input) => sum + Number(input.value), 0);
    const level = total >= 1150 ? 'Proyecto a medida' : total >= 700 ? 'Experiencia interactiva' : 'Paquete esencial';
    estimatePrice.textContent = `${total.toLocaleString('es-ES')} €`;
    estimateLevel.textContent = level;
    estimateList.innerHTML = '<li>Diseño, QR, publicación y soporte básico</li>' + selected.map(input => `<li>${input.dataset.name}</li>`).join('');
  };
  optionInputs.forEach(input => input.addEventListener('change', updateEstimate));
  estimateCta?.addEventListener('click', () => {
    const selected = optionInputs.filter(input => input.checked).map(input => input.dataset.name);
    const message = document.querySelector('[name="message"]');
    if (message && selected.length) message.value = `Nos interesan estas funciones: ${selected.join(', ')}.\n\nNuestra idea: `;
    if (packageSelect) packageSelect.value = Number(estimatePrice.textContent.replace(/\D/g, '')) >= 1150 ? 'A medida' : Number(estimatePrice.textContent.replace(/\D/g, '')) >= 700 ? 'Experiencia' : 'Esencial';
  });

  const videoModal = document.getElementById('video-modal');
  document.querySelector('[data-open-video]')?.addEventListener('click', () => videoModal?.showModal());
  videoModal?.querySelector('.modal-close')?.addEventListener('click', () => {
    videoModal.querySelector('video')?.pause();
    videoModal.close();
  });
  videoModal?.addEventListener('click', event => {
    if (event.target === videoModal) {
      videoModal.querySelector('video')?.pause();
      videoModal.close();
    }
  });

  const lightbox = document.getElementById('lightbox');
  const lightboxImage = lightbox?.querySelector('img');
  document.querySelectorAll('[data-lightbox]').forEach(button => {
    button.addEventListener('click', () => {
      lightboxImage.src = button.dataset.lightbox;
      lightbox?.showModal();
    });
  });
  lightbox?.querySelector('.modal-close')?.addEventListener('click', () => lightbox.close());
  lightbox?.addEventListener('click', event => {
    if (event.target === lightbox) lightbox.close();
  });

  document.getElementById('copy-email')?.addEventListener('click', async () => {
    const email = 'eduardo.efernandez.rodriguez@gmail.com';
    try {
      await navigator.clipboard.writeText(email);
      showToast('Correo copiado');
    } catch {
      showToast(email);
    }
  });

  document.getElementById('contact-form')?.addEventListener('submit', event => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const subject = `Solicitud web para despedida — ${data.get('name')}`;
    const body = [
      `Nombre: ${data.get('name')}`,
      `Correo: ${data.get('email')}`,
      `Fecha aproximada: ${data.get('date') || 'Sin definir'}`,
      `Número de personas: ${data.get('people') || 'Sin definir'}`,
      `Tipo de proyecto: ${data.get('package')}`,
      '',
      'Idea:',
      data.get('message')
    ].join('\n');
    const mailto = `mailto:eduardo.efernandez.rodriguez@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailto;
    showToast('Solicitud preparada en tu correo');
  });

  document.getElementById('year').textContent = new Date().getFullYear();
})();
