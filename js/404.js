/* The error page keeps language preference without loading the motion engine. */
(() => {
  'use strict';
  let language = 'pt';
  try { if (localStorage.getItem('portfolio-lang') === 'en') language = 'en'; } catch { /* Optional preference. */ }
  const button = document.getElementById('langToggle');
  const apply = () => {
    document.documentElement.lang = language === 'pt' ? 'pt-BR' : 'en';
    document.querySelectorAll('[data-pt][data-en]').forEach(element => { element.textContent = element.dataset[language]; });
    document.querySelectorAll('[data-meta-pt][data-meta-en]').forEach(element => { element.content = element.getAttribute(`data-meta-${language}`); });
    document.querySelectorAll('[data-aria-pt][data-aria-en]').forEach(element => { element.setAttribute('aria-label', element.getAttribute(`data-aria-${language}`)); });
    document.title = document.querySelector('title').getAttribute(`data-title-${language}`);
    button.textContent = language === 'pt' ? 'EN' : 'PT';
    button.setAttribute('aria-label', language === 'pt' ? 'Mudar idioma para inglês' : 'Switch language to Portuguese');
  };
  button.addEventListener('click', () => {
    language = language === 'pt' ? 'en' : 'pt';
    apply();
    try { localStorage.setItem('portfolio-lang', language); } catch { /* Still usable without storage. */ }
  });
  document.documentElement.classList.add('js');
  apply();
})();
