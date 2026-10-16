(() => {
  'use strict';

  const root = document.documentElement;
  const languageButton = document.querySelector('[data-language]');
  const languageLabel = document.querySelector('[data-language-label]');
  const menuButton = document.querySelector('[data-menu-toggle]');
  const nav = document.querySelector('[data-nav]');
  const header = document.querySelector('[data-header]');
  const storageKey = 'dvc-language';

  const preferredLanguage = () => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved === 'pt' || saved === 'en') return saved;
    } catch (_) {}
    return navigator.language.toLowerCase().startsWith('pt') ? 'pt' : 'en';
  };

  const setLanguage = (language) => {
    const targetAttribute = language === 'en' ? 'data-en' : 'data-pt';
    document.querySelectorAll('[data-pt][data-en]').forEach((element) => {
      const value = element.getAttribute(targetAttribute);
      if (value != null) element.textContent = value;
    });

    document.querySelectorAll('[data-aria-pt][data-aria-en]').forEach((element) => {
      const value = element.getAttribute(language === 'en' ? 'data-aria-en' : 'data-aria-pt');
      if (value != null) element.setAttribute('aria-label', value);
    });

    root.lang = language === 'en' ? 'en' : 'pt-BR';
    root.dataset.language = language;
    if (languageLabel) languageLabel.textContent = language === 'en' ? 'PT' : 'EN';
    if (languageButton) {
      languageButton.setAttribute('aria-label', language === 'en' ? 'Mudar idioma para português' : 'Mudar idioma para inglês');
    }

    try { localStorage.setItem(storageKey, language); } catch (_) {}
  };

  setLanguage(preferredLanguage());

  languageButton?.addEventListener('click', () => {
    setLanguage(root.dataset.language === 'en' ? 'pt' : 'en');
  });

  const closeMenu = () => {
    if (!menuButton || !nav) return;
    menuButton.setAttribute('aria-expanded', 'false');
    nav.classList.remove('is-open');
    document.body.style.overflow = '';
  };

  menuButton?.addEventListener('click', () => {
    const open = menuButton.getAttribute('aria-expanded') === 'true';
    menuButton.setAttribute('aria-expanded', String(!open));
    nav?.classList.toggle('is-open', !open);
    document.body.style.overflow = open ? '' : 'hidden';
  });

  nav?.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeMenu();
  });

  const updateHeader = () => header?.classList.toggle('is-scrolled', window.scrollY > 24);
  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const revealItems = document.querySelectorAll('.reveal');
  if (reduceMotion || !('IntersectionObserver' in window)) {
    revealItems.forEach((item) => item.classList.add('is-visible'));
  } else {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    revealItems.forEach((item) => observer.observe(item));
  }

  document.querySelectorAll('[data-year]').forEach((node) => {
    node.textContent = String(new Date().getFullYear());
  });
})();
