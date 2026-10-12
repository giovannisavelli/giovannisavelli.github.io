/* =====================================================================
   Proposta Claude v3 "Studio 3D": funzioni comuni di hub e corsi.
   Script classico (niente moduli): così la proposta si apre anche con un doppio clic.
   ===================================================================== */
(function () {
  const leggi = k => { try { return localStorage.getItem(k); } catch (e) { return null; } };
  const salva = (k, v) => { try { localStorage.setItem(k, v); } catch (e) {} };
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const fermo = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const mouse = matchMedia('(pointer: fine)').matches;
  window.Studio = { leggi, salva, esc, fermo, mouse };

  /* ---------- Alta leggibilità (stessa chiave del sito ufficiale) ---------- */
  const btnLeggi = document.getElementById('btn-leggibile');
  function leggibilita(on) {
    document.body.classList.toggle('leggibile', on);
    if (btnLeggi) btnLeggi.setAttribute('aria-pressed', String(on));
    if (on && !document.getElementById('lexend')) {
      document.head.appendChild(Object.assign(document.createElement('link'),
        { id: 'lexend', rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Lexend:wght@400;600&display=swap' }));
    }
  }
  leggibilita(leggi('dyslexia-pref') === 'true');
  if (btnLeggi) btnLeggi.addEventListener('click', () => {
    const on = !document.body.classList.contains('leggibile'); leggibilita(on); salva('dyslexia-pref', String(on));
  });

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
