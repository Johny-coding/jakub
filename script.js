(() => {
  const body = document.body;
  const heroImage = document.querySelector('.hero__background img');
  const mobileToggle = document.querySelector('.menu-button');
  const mobileMenu = document.querySelector('.mobile-menu');
  const revealItems = document.querySelectorAll('[data-reveal]');
  const sections = document.querySelectorAll('main > section');
  const panelSections = document.querySelectorAll('main > section[data-panel]');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let ticking = false;

  const closeMenu = () => {
    if (!mobileToggle || !mobileMenu) return;
    mobileToggle.setAttribute('aria-expanded', 'false');
    mobileToggle.classList.remove('is-open');
    mobileMenu.classList.remove('is-open');
    mobileMenu.setAttribute('aria-hidden', 'true');
    body.classList.remove('menu-open');
  };

  if (mobileToggle && mobileMenu) {
    mobileToggle.addEventListener('click', () => {
      const isOpen = mobileToggle.getAttribute('aria-expanded') === 'true';
      mobileToggle.setAttribute('aria-expanded', String(!isOpen));
      mobileToggle.classList.toggle('is-open', !isOpen);
      mobileMenu.classList.toggle('is-open', !isOpen);
      mobileMenu.setAttribute('aria-hidden', String(isOpen));
      body.classList.toggle('menu-open', !isOpen);
    });
    mobileMenu.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));
  }

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeMenu();
  });

  revealItems.forEach((item) => {
    if (item.dataset.delay) item.style.setProperty('--delay', `${item.dataset.delay}ms`);
  });

  if (!reducedMotion && 'IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries, currentObserver) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        currentObserver.unobserve(entry.target);
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -32px' });
    revealItems.forEach((item) => revealObserver.observe(item));

    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('section--active');
          if (entry.target.hasAttribute('data-panel')) entry.target.classList.add('panel-visible');
        }
      });
    }, { threshold: 0.18, rootMargin: '0px 0px -10% 0px' });
    sections.forEach((section) => sectionObserver.observe(section));
  } else {
    revealItems.forEach((item) => item.classList.add('is-visible'));
    sections.forEach((section) => {
      section.classList.add('section--active');
      if (section.hasAttribute('data-panel')) section.classList.add('panel-visible');
    });
  }

  // Safety net for browsers or embedded previews where an observer can be delayed.
  window.setTimeout(() => {
    revealItems.forEach((item) => item.classList.add('is-visible'));
    sections.forEach((section) => {
      section.classList.add('section--active');
      if (section.hasAttribute('data-panel')) section.classList.add('panel-visible');
    });
  }, 1400);

  const setViewportUnit = () => {
    document.documentElement.style.setProperty('--viewport-height', `${window.innerHeight}px`);
  };
  setViewportUnit();
  window.addEventListener('resize', setViewportUnit, { passive: true });

  const updateScrollState = () => {
    if (heroImage && !reducedMotion) {
      const offset = Math.min(window.scrollY * 0.045, 26);
      heroImage.style.transform = `translate3d(0, ${offset}px, 0) scale(1.04)`;
    }

    if (!reducedMotion) {
      const viewport = window.innerHeight || document.documentElement.clientHeight;
      panelSections.forEach((panel) => {
        const rect = panel.getBoundingClientRect();
        const travel = viewport - rect.top;
        const distance = viewport + rect.height;
        const progress = Math.min(1, Math.max(0, travel / distance));
        const panelX = -130 + progress * 390;
        panel.style.setProperty('--panel-progress', progress.toFixed(3));
        panel.style.setProperty('--panel-x', `${panelX.toFixed(2)}%`);
      });
    }
    ticking = false;
  };

  const requestScrollUpdate = () => {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(updateScrollState);
  };

  updateScrollState();
  window.addEventListener('scroll', requestScrollUpdate, { passive: true });
  window.addEventListener('resize', requestScrollUpdate, { passive: true });

  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (event) => {
      const selector = link.getAttribute('href');
      if (!selector || selector === '#') return;
      const target = document.querySelector(selector);
      if (!target) return;
      event.preventDefault();
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const top = target.getBoundingClientRect().top + window.scrollY - 12;
      window.scrollTo({ top, behavior: reduced ? 'auto' : 'smooth' });
      if (window.history && window.history.replaceState) window.history.replaceState(null, '', selector);
    });
  });
})();
