// Text pages: Spanish first, English with the same toggle the landing uses (and remembers).
// Each page has one block per language (data-lang="es" / "en"); <html data-title-en> holds the English title.
(() => {
  const LANG_KEY = 'mepo-landing-lang';
  const LANG = (() => {
    const q = new URLSearchParams(location.search).get('lang');
    if (q === 'es' || q === 'en') return q;
    try { const saved = localStorage.getItem(LANG_KEY); if (saved === 'es' || saved === 'en') return saved; } catch (e) {}
    return 'es';
  })();
  document.querySelectorAll('[data-lang]').forEach(el => { el.hidden = el.dataset.lang !== LANG; });
  const btn = document.getElementById('lang');
  if (LANG === 'en') {
    document.documentElement.lang = 'en';
    if (document.documentElement.dataset.titleEn) document.title = document.documentElement.dataset.titleEn;
    btn.textContent = 'ES'; btn.setAttribute('aria-label', 'Español');
  }
  btn.addEventListener('click', () => {
    try { localStorage.setItem(LANG_KEY, LANG === 'en' ? 'es' : 'en'); } catch (e) {}
    const u = new URL(location.href); u.searchParams.delete('lang'); location.replace(u.href);
  });
  const logo = document.getElementById('logo');
  if (logo && window.drawPet) drawPet(logo.getContext('2d'), 18, 34, 'happy', 20, { char: null, stage: 0 });
})();
