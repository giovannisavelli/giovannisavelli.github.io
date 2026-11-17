/* Chi sono
   1. Il tabellone dell'apertura gira fra i mestieri (Effetti.tabellone, come le date della home).
   2. La galleria: ogni riquadro con data-galleria apre a schermo intero tutte le immagini di quel gruppo.
      I dati delle gallerie sono nel <script id="cs-gallerie"> della pagina (generato da genera.py). */
(function () {
  /* ---------- 1. Tabellone ---------- */
  const el = document.getElementById('cs-flap');
  if (el && window.Effetti) {
    const MESTIERI = ['FOTOGRAFO', 'POST PRODUCER', 'MODELLATORE 3D', 'OPERATORE FUI', 'DOCENTE'];
    const lung = Math.max(...MESTIERI.map(m => m.length));
    const pari = m => m.padEnd(lung, ' ');
    const t = Effetti.tabellone(el, pari(MESTIERI[0]), { caratteri: 'ABCDEFGHILMNOPRSTUVZ3', giri: 5, durata: 70, sfasa: 45 });
    let i = 0, timer = 0;
    const giro = () => { if (window.Studio && Studio.fermo) return; i = (i + 1) % MESTIERI.length; t.vai(pari(MESTIERI[i])); };
    new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) { if (!timer) timer = setInterval(giro, 2600); }
      else { clearInterval(timer); timer = 0; }
    })).observe(el);
  }

  /* ---------- 2. Galleria ---------- */
  const dati = document.getElementById('cs-gallerie');
  if (!dati) return;
  const G = JSON.parse(dati.textContent);
  const TITOLI = { ritratti: 'Ritratti', mercedes: 'Mercedes Rent', canali: 'Canali', sneaker: 'Sneaker Care', activia: 'Activia',
    food: 'Food', clay: 'Carbon Workspace: gli oggetti', render: 'Carbon Workspace: la scena', eidolon: 'Eidolon Noeima', makkelijk: 'Makkelijk', thermomix: 'Thermomix, copertina «Especial Verano»' };
  const frecce = (d) => `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${d}"/></svg>`;

  const v = document.createElement('dialog');
  v.className = 'cs-visore';
  v.setAttribute('aria-label', 'Galleria');
  v.innerHTML = `
    <div class="cs-visore-alto"><p><span class="cs-visore-titolo"></span><span class="cs-visore-conta"></span></p>
      <button type="button" class="chiudi" aria-label="Chiudi">${frecce('M6 6l12 12M18 6L6 18')}</button></div>
    <div class="cs-visore-scena">
      <button type="button" class="prec" aria-label="Immagine precedente">${frecce('M15 6l-6 6 6 6')}</button>
      <img alt="">
      <button type="button" class="succ" aria-label="Immagine successiva">${frecce('M9 6l6 6-6 6')}</button>
    </div>
    <p class="cs-visore-dida" aria-live="polite"></p>`;
  document.body.appendChild(v);
  const img = v.querySelector('img'), titolo = v.querySelector('.cs-visore-titolo'), conta = v.querySelector('.cs-visore-conta'), dida = v.querySelector('.cs-visore-dida');
  let lista = [], pos = 0, nome = '', origine = null;

  function mostra(n) {
    pos = (n + lista.length) % lista.length;
    const [src, w, h, testo] = lista[pos];
    img.classList.add('carica');
    const nuova = new Image();
    nuova.onload = () => { img.src = src; img.width = w; img.height = h; img.alt = testo || TITOLI[nome]; img.classList.remove('carica'); };
    nuova.src = src;
    conta.textContent = `${pos + 1} / ${lista.length}`;
    dida.textContent = testo;
    // prepara la successiva
    if (lista.length > 1) new Image().src = lista[(pos + 1) % lista.length][0];
    v.querySelectorAll('.prec, .succ').forEach(b => { b.hidden = lista.length < 2; });
  }
  function apri(chiave, da, bottone) {
    lista = G[chiave] || []; nome = chiave; origine = bottone;
    if (!lista.length) return;
    titolo.textContent = TITOLI[chiave] || '';
    v.showModal(); document.body.classList.add('cs-visore-aperto');
    mostra(da || 0);
  }
  v.addEventListener('close', () => { document.body.classList.remove('cs-visore-aperto'); if (origine) origine.focus(); });
  v.querySelector('.chiudi').addEventListener('click', () => v.close());
  v.querySelector('.prec').addEventListener('click', () => mostra(pos - 1));
  v.querySelector('.succ').addEventListener('click', () => mostra(pos + 1));
  v.addEventListener('click', e => { if (e.target === v || e.target.classList.contains('cs-visore-scena')) v.close(); });
  v.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft') { e.preventDefault(); mostra(pos - 1); }
    if (e.key === 'ArrowRight') { e.preventDefault(); mostra(pos + 1); }
  });
  // col dito: di lato cambia immagine, in giù chiude
  let x0 = 0, y0 = 0;
  v.addEventListener('touchstart', e => { x0 = e.touches[0].clientX; y0 = e.touches[0].clientY; }, { passive: true });
  v.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - x0, dy = e.changedTouches[0].clientY - y0;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) mostra(pos + (dx < 0 ? 1 : -1));
    else if (dy > 90 && Math.abs(dy) > Math.abs(dx)) v.close();
  });

  document.addEventListener('click', e => {
    const b = e.target.closest('[data-galleria]');
    if (b) apri(b.dataset.galleria, +b.dataset.da || 0, b);
  });
})();
