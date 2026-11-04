// Clic su una foto: si apre ingrandita, con la pagina dietro sfocata e ferma.
// Si scorrono solo le foto dello stesso capitolo, come un carosello: mentre una esce di lato, entra la vicina.
// Foto prima o dopo: frecce ← → della tastiera, pulsanti, oppure il dito di lato.
// Per chiudere: la ×, Esc, un clic fuori dalla foto, oppure il dito in su o in giù.
(function () {
  const zoom = document.getElementById('zoom');
  if (!zoom || !zoom.showModal) return;
  const palco = zoom.querySelector('.zoom-palco');
  const img = palco.querySelector('img');
  const vicina = img.cloneNode(); vicina.className = 'zoom-vicina'; vicina.alt = ''; palco.appendChild(vicina);
  const conta = zoom.querySelector('.zoom-conta');
  const frecce = [...zoom.querySelectorAll('.zoom-freccia')];
  const tutte = [...document.querySelectorAll('figure img, .sf-corpo > img')];
  const piano = !matchMedia('(prefers-reduced-motion: reduce)').matches;
  let gruppo = [], qui = 0, scrollPrima = 0, inCorsa = false;
  const largo = () => palco.clientWidth || innerWidth;
  const sorgente = f => f.currentSrc || f.src;
  const sposta = (el, x) => { el.style.transform = 'translateX(' + x + 'px)'; };

  function mostra(i) {
    qui = (i + gruppo.length) % gruppo.length;
    img.src = sorgente(gruppo[qui]); img.alt = gruppo[qui].alt;
    img.style.transform = ''; img.style.opacity = '';
    vicina.style.visibility = 'hidden';
    if (conta) conta.textContent = gruppo.length > 1 ? (qui + 1) + ' / ' + gruppo.length : '';
    frecce.forEach(f => { f.hidden = gruppo.length < 2; });
  }
  // la foto vicina aspetta fuori schermo, dalla parte da cui entrerà
  function prepara(verso) {
    vicina.src = sorgente(gruppo[(qui + verso + gruppo.length) % gruppo.length]);
    vicina.style.visibility = 'visible';
    sposta(vicina, verso * largo());
  }
  function passa(verso, da) {
    da = da || 0;
    if (gruppo.length < 2 || inCorsa) return;
    if (!piano) { mostra(qui + verso); return; }
    prepara(verso);
    const W = largo(), durata = 300, curva = 'cubic-bezier(.22,.8,.25,1)';
    inCorsa = true;
    img.animate([{ transform: 'translateX(' + da + 'px)' }, { transform: 'translateX(' + (-verso * W) + 'px)' }], { duration: durata, easing: curva, fill: 'forwards' });
    const entra = vicina.animate([{ transform: 'translateX(' + (verso * W + da) + 'px)' }, { transform: 'translateX(0px)' }], { duration: durata, easing: curva, fill: 'forwards' });
    entra.onfinish = () => {
      mostra(qui + verso);
      img.getAnimations().forEach(a => a.cancel()); vicina.getAnimations().forEach(a => a.cancel());
      inCorsa = false;
    };
  }
  function blocca() { scrollPrima = scrollY; document.body.classList.add('zoom-aperto'); document.body.style.top = (-scrollPrima) + 'px'; }
  function sblocca() { document.body.classList.remove('zoom-aperto'); document.body.style.top = ''; scrollTo({ top: scrollPrima, behavior: 'instant' }); }
  function apri(f) {
    // solo le foto dello stesso capitolo; quelle dentro un riquadro «Approfondisci» girano solo fra loro
    const riquadro = f.closest('.approfondisci'), casa = riquadro || f.closest('.capitolo');
    gruppo = tutte.filter(x => casa && casa.contains(x) && (riquadro || !x.closest('.approfondisci')));
    if (!gruppo.length) gruppo = [f];
    mostra(gruppo.indexOf(f)); blocca(); zoom.showModal();
    if (piano) zoom.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 180 });
  }
  function chiudi(versoY) {
    if (!zoom.open) return;
    if (!piano) { zoom.close(); return; }
    const fine = img.animate([{ transform: img.style.transform || 'none', opacity: getComputedStyle(img).opacity }, { transform: 'translateY(' + ((versoY || 0) * 40) + '%) scale(.92)', opacity: 0 }], { duration: 200, easing: 'ease-in', fill: 'forwards' });
    fine.onfinish = () => { zoom.close(); fine.cancel(); img.style.transform = ''; img.style.opacity = ''; };
  }
  zoom.addEventListener('close', sblocca);

  tutte.forEach(f => f.addEventListener('click', () => apri(f)));
  zoom.querySelector('.zoom-prima').addEventListener('click', e => { e.stopPropagation(); passa(-1); });
  zoom.querySelector('.zoom-dopo').addEventListener('click', e => { e.stopPropagation(); passa(1); });
  zoom.querySelector('.zoom-chiudi').addEventListener('click', e => { e.stopPropagation(); chiudi(0); });
  zoom.addEventListener('click', e => { if (e.target === zoom || e.target === palco) chiudi(0); });
  zoom.addEventListener('cancel', e => { e.preventDefault(); chiudi(0); });
  document.addEventListener('keydown', e => {
    if (!zoom.open) return;
    if (e.key === 'ArrowLeft') { e.preventDefault(); passa(-1); }
    if (e.key === 'ArrowRight') { e.preventDefault(); passa(1); }
  });

  // il dito trascina la foto: di lato la vicina entra insieme a lei, in su o in giù la chiude
  let t = null;
  zoom.addEventListener('touchstart', e => { if (e.touches.length === 1 && !inCorsa) t = { x: e.touches[0].clientX, y: e.touches[0].clientY, asse: null, dx: 0, dy: 0, verso: 0 }; }, { passive: true });
  zoom.addEventListener('touchmove', e => {
    if (!t) return;
    const dx = e.touches[0].clientX - t.x, dy = e.touches[0].clientY - t.y;
    if (!t.asse && Math.hypot(dx, dy) > 8) t.asse = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y';
    if (t.asse === 'x') {
      if (gruppo.length < 2) sposta(img, dx * .25);            // una sola foto: si sposta appena, poi torna
      else {
        const verso = dx < 0 ? 1 : -1;
        if (verso !== t.verso) { prepara(verso); t.verso = verso; }
        sposta(img, dx); sposta(vicina, verso * largo() + dx);
      }
    }
    if (t.asse === 'y') {
      img.style.transform = 'translateY(' + dy + 'px) scale(' + (1 - Math.min(.12, Math.abs(dy) / 1500)) + ')';
      img.style.opacity = String(1 - Math.min(.6, Math.abs(dy) / 500));
    }
    t.dx = dx; t.dy = dy;
  }, { passive: true });
  zoom.addEventListener('touchend', () => {
    if (!t) return;
    const asse = t.asse, dx = t.dx, dy = t.dy, verso = t.verso; t = null;
    if (asse === 'x' && gruppo.length > 1 && Math.abs(dx) > 60) { passa(verso, dx); return; }
    if (asse === 'y' && Math.abs(dy) > 90) { chiudi(dy > 0 ? 1 : -1); return; }
    // non abbastanza: tutto torna al suo posto
    if (piano && img.style.transform) {
      img.animate([{ transform: img.style.transform, opacity: img.style.opacity || 1 }, { transform: 'none', opacity: 1 }], { duration: 200, easing: 'ease-out' });
      if (asse === 'x' && verso) vicina.animate([{ transform: vicina.style.transform, visibility: 'visible' }, { transform: 'translateX(' + (verso * largo()) + 'px)', visibility: 'visible' }], { duration: 200, easing: 'ease-out' });
    }
    img.style.transform = ''; img.style.opacity = ''; vicina.style.visibility = 'hidden';
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
