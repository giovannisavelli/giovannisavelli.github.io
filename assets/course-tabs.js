/* Sezioni dei corsi Product: una sola selezione per URL, scheda e pannello. */
(function () {
  const tablist = document.querySelector('.course-tabs');
  if (!tablist) return;
  const tabs = [...tablist.querySelectorAll('[role="tab"][data-panel]')];
  const panels = new Map(tabs.map(tab => [tab.dataset.panel, document.getElementById(tab.dataset.panel)]));
  const initial = tablist.dataset.initialTab || tabs[0]?.dataset.panel;
  const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

  function scrollToTabs() {
    requestAnimationFrame(() => {
      const header = document.getElementById('top');
      const offset = (header ? header.getBoundingClientRect().height : 0) + 12;
      window.scrollTo({ top: Math.max(0, tablist.getBoundingClientRect().top + scrollY - offset), behavior: reduced() ? 'instant' : 'smooth' });
    });
  }

  function show(id, scroll) {
    if (!panels.has(id)) return;
    tabs.forEach(tab => {
      const selected = tab.dataset.panel === id;
      tab.setAttribute('aria-selected', String(selected));
      tab.tabIndex = selected ? 0 : -1;
      panels.get(tab.dataset.panel).hidden = !selected;
    });
    if (scroll) scrollToTabs();
  }

  function navigate(id) {
    if (!panels.has(id)) return;
    if (location.hash !== '#' + id) history.pushState(null, '', '#' + id);
    show(id, true);
  }

  tabs.forEach(tab => tab.addEventListener('click', () => navigate(tab.dataset.panel)));
  tablist.addEventListener('keydown', event => {
    const index = tabs.indexOf(document.activeElement);
    if (index === -1) return;
    let next;
    if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
    else if (event.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = tabs.length - 1;
    else return;
    event.preventDefault();
    tabs[next].focus({ preventScroll: true });
    navigate(tabs[next].dataset.panel);
  });

  document.addEventListener('click', event => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const link = event.target.closest('a[href^="#"]');
    if (!link || link.target === '_blank') return;
    const id = link.getAttribute('href').slice(1);
    if (!panels.has(id)) return;
    event.preventDefault();
    navigate(id);
  });

  function restore(scroll) {
    const id = location.hash.slice(1);
    show(panels.has(id) ? id : initial, scroll && panels.has(id));
  }
  addEventListener('hashchange', () => restore(true));
  addEventListener('popstate', () => restore(true));
  restore(false);
  if (document.readyState === 'complete') restore(true);
  else addEventListener('load', () => restore(true), { once: true });
})();
