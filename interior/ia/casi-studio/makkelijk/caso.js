// Clic su una foto: si apre ingrandita, con la pagina dietro sfocata e ferma.
// Foto prima o dopo: frecce ← → della tastiera, pulsanti, oppure il dito a destra o a sinistra.
// Per chiudere: la ×, Esc, un clic fuori dalla foto, oppure il dito in su o in giù.
(function () {
  const zoom = document.getElementById('zoom');
  if (!zoom || !zoom.showModal) return;
  const img = zoom.querySelector('img');
  const conta = zoom.querySelector('.zoom-conta');
  const foto = [...document.querySelectorAll('figure img, .sf-corpo > img')];
  const piano = !matchMedia('(prefers-reduced-motion: reduce)').matches;
  let qui = 0, scrollPrima = 0;

  function mostra(i, verso) {
    qui = (i + foto.length) % foto.length;
    img.src = foto[qui].currentSrc || foto[qui].src;
    img.alt = foto[qui].alt;
    if (conta) conta.textContent = `${qui + 1} / ${foto.length}`;
    if (verso && piano) img.animate([{ transform: `translateX(${verso * 28}%)`, opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 260, easing: 'cubic-bezier(.2,.8,.2,1)' });
  }
  function passa(verso) {
    // la foto attuale scivola via dalla parte opposta, poi entra la nuova
    if (!piano) { mostra(qui + verso); return; }
    const via = img.animate([{ transform: getComputedStyle(img).transform === 'none' ? 'none' : getComputedStyle(img).transform, opacity: 1 }, { transform: `translateX(${-verso * 28}%)`, opacity: 0 }], { duration: 160, easing: 'ease-in' });
    via.onfinish = () => { img.style.transform = ''; mostra(qui + verso, verso); };
  }
  // la pagina dietro resta ferma: niente scorrimento mentre guardi una foto
  function blocca() { scrollPrima = scrollY; document.body.classList.add('zoom-aperto'); document.body.style.top = `-${scrollPrima}px`; }
  function sblocca() { document.body.classList.remove('zoom-aperto'); document.body.style.top = ''; scrollTo({ top: scrollPrima, behavior: 'instant' }); }
  function apri(i) { mostra(i); blocca(); zoom.showModal(); if (piano) zoom.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 180 }); }
  function chiudi(versoY) {
    if (!zoom.open) return;
    if (!piano) { zoom.close(); return; }
    const fine = img.animate([{ transform: img.style.transform || 'none', opacity: 1 }, { transform: `translateY(${(versoY || 0) * 40}%) scale(.92)`, opacity: 0 }], { duration: 200, easing: 'ease-in' });
    fine.onfinish = () => { img.style.transform = ''; zoom.close(); };
  }
  zoom.addEventListener('close', sblocca);

  foto.forEach((f, i) => f.addEventListener('click', () => apri(i)));
  zoom.querySelector('.zoom-prima').addEventListener('click', e => { e.stopPropagation(); passa(-1); });
  zoom.querySelector('.zoom-dopo').addEventListener('click', e => { e.stopPropagation(); passa(1); });
  zoom.querySelector('.zoom-chiudi').addEventListener('click', e => { e.stopPropagation(); chiudi(0); });
  zoom.addEventListener('click', e => { if (e.target === zoom || e.target.classList.contains('zoom-palco')) chiudi(0); });
  zoom.addEventListener('cancel', e => { e.preventDefault(); chiudi(0); });
  document.addEventListener('keydown', e => {
    if (!zoom.open) return;
    if (e.key === 'ArrowLeft') { e.preventDefault(); passa(-1); }
    if (e.key === 'ArrowRight') { e.preventDefault(); passa(1); }
  });

  // il dito trascina la foto: di lato cambia foto, in su o in giù la chiude
  let t = null;
  zoom.addEventListener('touchstart', e => { if (e.touches.length === 1) t = { x: e.touches[0].clientX, y: e.touches[0].clientY, asse: null }; }, { passive: true });
  zoom.addEventListener('touchmove', e => {
    if (!t) return;
    const dx = e.touches[0].clientX - t.x, dy = e.touches[0].clientY - t.y;
    if (!t.asse && Math.hypot(dx, dy) > 8) t.asse = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y';
    if (t.asse === 'x') img.style.transform = `translateX(${dx}px)`;
    if (t.asse === 'y') { img.style.transform = `translateY(${dy}px) scale(${1 - Math.min(.12, Math.abs(dy) / 1500)})`; img.style.opacity = String(1 - Math.min(.6, Math.abs(dy) / 500)); }
    t.dx = dx; t.dy = dy;
  }, { passive: true });
  zoom.addEventListener('touchend', () => {
    if (!t) return;
    const { asse, dx = 0, dy = 0 } = t; t = null; img.style.opacity = '';
    if (asse === 'x' && Math.abs(dx) > 60) { passa(dx < 0 ? 1 : -1); return; }
    if (asse === 'y' && Math.abs(dy) > 90) { chiudi(dy > 0 ? 1 : -1); return; }
    if (piano && img.style.transform) img.animate([{ transform: img.style.transform }, { transform: 'none' }], { duration: 180, easing: 'ease-out' });
    img.style.transform = '';
  });
})();

// Indice dei capitoli: un pulsante per capitolo, acceso su quello che stai leggendo.
(function () {
  const indice = document.getElementById('indice');
  const apri = document.getElementById('indice-apri');
  const capitoli = [...document.querySelectorAll('.capitolo[id]')];
  if (!indice || !capitoli.length) return;
  const link = capitoli.map(c => {
    const a = document.createElement('a');
    a.href = '#' + c.id;
    a.innerHTML = `${c.querySelector('.etichetta b').textContent}<span>${c.querySelector('.etichetta span').textContent}</span>`;
    a.addEventListener('click', () => chiudi());
    indice.appendChild(a);
    return a;
  });
  function chiudi() { indice.classList.remove('aperto'); apri.setAttribute('aria-expanded', 'false'); apri.textContent = 'Capitoli'; }
  apri.addEventListener('click', () => {
    const ora = !indice.classList.contains('aperto');
    indice.classList.toggle('aperto', ora);
    apri.setAttribute('aria-expanded', String(ora));
    apri.textContent = ora ? 'Chiudi' : 'Capitoli';
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') chiudi(); });
  // il capitolo «corrente» è l'ultimo il cui inizio ha superato un terzo dello schermo
  function aggiorna() {
    const soglia = innerHeight / 3;
    let qui = 0;
    capitoli.forEach((c, i) => { if (c.getBoundingClientRect().top <= soglia) qui = i; });
    link.forEach((a, i) => a.setAttribute('aria-current', String(i === qui)));
  }
  addEventListener('scroll', aggiorna, { passive: true }); addEventListener('resize', aggiorna); aggiorna();
})();
