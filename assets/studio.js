/* =====================================================================
   Proposta Claude v3 "Studio 3D": funzioni comuni di hub e corsi.
   Script classico (niente moduli): così la proposta si apre anche con un doppio clic.
   ===================================================================== */
(function () {
  const leggi = k => { try { return localStorage.getItem(k); } catch (e) { return null; } };
  const salva = (k, v) => { try { localStorage.setItem(k, v); } catch (e) {} };
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  /* «riduci movimento» del telefono OPPURE «Meno movimento» della Lettura facilitata (attributo su <html>), letto ogni volta */
  const fermoOra = ((mq, h) => () => mq.matches || h.hasAttribute('data-lt-fermo'))(matchMedia('(prefers-reduced-motion: reduce)'), document.documentElement);
  const fermo = fermoOra();
  const mouse = matchMedia('(pointer: fine)').matches;
  window.Studio = { leggi, salva, esc, mouse };
  Object.defineProperty(window.Studio, 'fermo', { get: fermoOra, enumerable: true });   // vero/falso, sempre aggiornato

  /* ---------- Testata e piede: scritti una volta qui, uguali in tutte le pagine ----------
   * Nella pagina basta:
   *   <header class="top" id="top" data-testata>  (dentro, i link propri della pagina: <a href="#programma">Programma</a>)
   *   <footer class="wrap piede-sito" data-firma="Photoshop" data-nota="Photoshop · Interior Design"></footer>
   * Sulla home: data-testata="casa" (niente «Tutti i corsi») e data-firma senza data-nota. */
  const radice = (document.currentScript && document.currentScript.src || '').replace(/assets\/studio\.js.*$/, '') || '/';
  const FRECCIA = '<svg class="icona" viewBox="0 0 24 24" aria-hidden="true"><path d="M19 12H5M11 6l-6 6 6 6"/></svg>';
  const ANNO = '2026/27';
  const top0 = document.querySelector('header[data-testata]');
  if (top0) {
    const casa = top0.dataset.testata === 'casa';
    const propri = [...top0.querySelectorAll('a')].map(a => { a.classList.add('solo-desk'); return a.outerHTML; }).join('');
    top0.innerHTML = `<div class="wrap">
      <a class="marchio" href="${radice}"><i>GS</i><span>Giovanni Savelli<small>Corsi AANT ${ANNO}</small></span></a>
      <nav class="menu" aria-label="Menu">${propri}${casa ? '' : `<a class="bordo" href="${radice}">${FRECCIA}<span class="solo-desk">Tutti i corsi</span><span class="solo-tel">Corsi</span></a>`}</nav>
    </div>`;
  }
  const piede0 = document.querySelector('footer[data-firma]');
  if (piede0) {
    const nota = piede0.dataset.nota;
    piede0.innerHTML = `<div class="grande-firma" aria-hidden="true">${esc(piede0.dataset.firma)}</div>
      <div class="piede">${nota
        ? `<a href="${radice}">${FRECCIA}Tutti i miei corsi</a><span>${esc(nota)} · Giovanni Savelli · ${ANNO}</span>`
        : `<span>Giovanni Savelli, Accademia delle Arti e Nuove Tecnologie</span><span>Anno accademico ${ANNO}</span>`}</div>`;
  }

  /* ---------- Testata che diventa vetro scorrendo ---------- */
  const testata = document.getElementById('top');
  if (testata) {
    const aggiorna = () => testata.classList.toggle('solida', scrollY > 40);
    addEventListener('scroll', aggiorna, { passive: true }); aggiorna();
  }

  /* ---------- Comparsa delle sezioni ---------- */
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('dentro'); io.unobserve(e.target); }
  }), { threshold: .12 });
  Studio.svela = radice => (radice || document).querySelectorAll('[data-svela]:not(.dentro)').forEach(el => io.observe(el));
  Studio.svela();

  /* ---------- Alone che segue il cursore ---------- */
  const alone = document.getElementById('alone');
  if (alone && mouse && !fermo) {
    let ax = innerWidth / 2, ay = innerHeight / 2, tx = ax, ty = ay, raf = 0;
    const segui = () => {
      ax += (tx - ax) * .12; ay += (ty - ay) * .12;
      alone.style.transform = `translate(${ax}px, ${ay}px)`;
      raf = Math.abs(tx - ax) + Math.abs(ty - ay) > .5 ? requestAnimationFrame(segui) : 0;
    };
    addEventListener('pointermove', e => { tx = e.clientX; ty = e.clientY; alone.style.opacity = 1; if (!raf) raf = requestAnimationFrame(segui); }, { passive: true });
  }

  /* ---------- Firma del piede: le lettere si ispessiscono vicino al mouse ---------- */
  document.querySelectorAll('.grande-firma').forEach(el => window.Effetti && Effetti.prossimita(el));
})();
