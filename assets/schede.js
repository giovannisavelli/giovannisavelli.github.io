/* =====================================================================
   Schede dei corsi: un solo programma per tutto il sito.

   Come si scrive una pagina con le schede:
     <nav class="schede" role="tablist" aria-label="Sezioni del corso">
       <button class="scheda" type="button" role="tab" data-scheda="lezioni">Lezioni</button>
       ...
     </nav>
     <section class="pannello" role="tabpanel" data-scheda="lezioni" data-alias="vecchio-nome altro">
       ...
     </section>

   Che cosa fa:
   - ogni scheda ha il suo indirizzo (#lezioni, #calendario...): il tasto Indietro funziona;
   - data-alias: vecchi indirizzi che aprono la stessa scheda (#vibe-coding → Esperimenti);
   - un indirizzo che punta a qualcosa DENTRO una scheda (#lezione-3) apre quella scheda,
     apre i <details> che lo contengono e ci porta lì, sotto le barre in alto;
   - frecce, Home e Fine spostano la scheda da tastiera;
   - la barra prende la classe «attaccata» quando resta in alto: lo stile la rende piena;
   - a ogni cambio manda l'evento «scheda» (event.detail.scheda) a chi deve fare qualcosa
     (fermare un video, ridisegnare un percorso...).
   - Schede.risolvi(funzione): una pagina può insegnare indirizzi speciali. La funzione riceve
     il nome (senza #) e restituisce { scheda, poi } oppure niente.

   Va caricato nel <head> senza defer, così le pagine possono usare Schede subito.
   ===================================================================== */
(function () {
  const risolutori = [];
  let barra, bottoni = [], pannelli = new Map(), iniziale = '';
  const fermo = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

  // quanto spazio occupano in alto la testata e (se resta attaccata) la barra delle schede
  function sopra() {
    const testata = document.getElementById('top');
    const pos = testata ? getComputedStyle(testata).position : '';
    let h = pos === 'fixed' || pos === 'sticky' ? testata.getBoundingClientRect().height : 0;
    if (barra && getComputedStyle(barra).position === 'sticky') h += barra.getBoundingClientRect().height;
    return h;
  }
  function scorriA(el, margine = 12) {
    requestAnimationFrame(() => {
      const y = el.getBoundingClientRect().top + scrollY - sopra() - margine;
      scrollTo({ top: Math.max(0, y), behavior: fermo() ? 'auto' : 'smooth' });
    });
  }

  function mostra(nome) {
    if (!pannelli.has(nome)) return;
    const prima = bottoni.find(b => b.getAttribute('aria-selected') === 'true')?.dataset.scheda;
    bottoni.forEach(b => {
      const si = b.dataset.scheda === nome;
      b.setAttribute('aria-selected', String(si));
      b.tabIndex = si ? 0 : -1;
    });
    pannelli.forEach((p, n) => { p.hidden = n !== nome; });
    // le scorciatoie fisse del telefono indicano la scheda aperta
    document.querySelectorAll('[data-vai-scheda]').forEach(a => {
      if (a.dataset.vaiScheda === nome) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
    });
    if (prima !== nome) document.dispatchEvent(new CustomEvent('scheda', { detail: { scheda: nome, prima } }));
  }

  // da un nome (quello dopo #) alla scheda da aprire e a cosa fare dopo
  function risolvi(nome) {
    if (!nome) return null;
    for (const f of risolutori) { const r = f(nome); if (r) return r; }
    if (pannelli.has(nome)) return { scheda: nome, cima: true };
    for (const [n, p] of pannelli) {
      if ((p.dataset.alias || '').split(/\s+/).includes(nome)) {
        const dentro = document.getElementById(nome);
        return { scheda: n, elemento: dentro && p.contains(dentro) ? dentro : null, cima: !dentro };
      }
    }
    const el = document.getElementById(nome);
    const p = el && el.closest('[role="tabpanel"][data-scheda]');
    if (p && pannelli.get(p.dataset.scheda) === p) return { scheda: p.dataset.scheda, elemento: el };
    return null;
  }

  function apri(nome, scorri) {
    const r = risolvi(nome);
    if (!r) return false;
    mostra(r.scheda);
    if (r.elemento) {
      // apre i <details> che lo contengono (e lui stesso, se è un <details>)
      for (let d = r.elemento; d; d = d.parentElement) if (d.tagName === 'DETAILS') d.open = true;
      if (scorri) scorriA(r.elemento);
    } else if (scorri) scorriA(pannelli.get(r.scheda), 0);   // la barra si attacca e la scheda parte subito sotto
    if (r.poi) r.poi();
    return true;
  }

  function daIndirizzo(scorri) {
    const nome = decodeURIComponent(location.hash.slice(1));
    if (!apri(nome, scorri)) mostra(iniziale);
  }

  function vai(nome) {
    if (location.hash !== '#' + nome) history.pushState(null, '', '#' + nome);
    apri(nome, true);
  }

  function avvia() {
    barra = document.querySelector('.schede[role="tablist"]');
    if (!barra) return;
    bottoni = [...barra.querySelectorAll('[role="tab"][data-scheda]')];
    document.querySelectorAll('[role="tabpanel"][data-scheda]').forEach(p => pannelli.set(p.dataset.scheda, p));
    bottoni.forEach(b => { if (pannelli.has(b.dataset.scheda)) b.setAttribute('aria-controls', pannelli.get(b.dataset.scheda).id || ''); });
    iniziale = barra.dataset.iniziale || bottoni[0]?.dataset.scheda;

    barra.addEventListener('click', e => {
      const b = e.target.closest('[role="tab"][data-scheda]');
      if (b) vai(b.dataset.scheda);
    });
    barra.addEventListener('keydown', e => {
      const i = bottoni.indexOf(document.activeElement);
      if (i < 0) return;
      const n = { ArrowRight: (i + 1) % bottoni.length, ArrowLeft: (i - 1 + bottoni.length) % bottoni.length, Home: 0, End: bottoni.length - 1 }[e.key];
      if (n === undefined) return;
      e.preventDefault();
      bottoni[n].focus({ preventScroll: true });
      vai(bottoni[n].dataset.scheda);
    });
    // i link interni (#calendario, #lezione-3...) aprono la scheda giusta invece di saltare a vuoto
    document.addEventListener('click', e => {
      if (e.defaultPrevented || e.button !== 0 || e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return;
      const a = e.target.closest('a[href^="#"]');
      if (!a || a.target === '_blank') return;
      const nome = decodeURIComponent(a.getAttribute('href').slice(1));
      if (!risolvi(nome)) return;
      e.preventDefault();
      vai(nome);
    });
    addEventListener('popstate', () => daIndirizzo(true));
    addEventListener('hashchange', () => daIndirizzo(true));

    // la barra sa quando è attaccata in alto
    const attacca = () => {
      const s = getComputedStyle(barra), r = barra.getBoundingClientRect();
      barra.classList.toggle('attaccata', s.position === 'sticky' && scrollY > 0 && r.bottom > 0 && Math.abs(r.top - parseFloat(s.top)) <= 1);
    };
    addEventListener('scroll', attacca, { passive: true });
    addEventListener('resize', attacca, { passive: true });
    attacca();

    daIndirizzo(false);
    // con un indirizzo (#lezione-3) si arriva lì quando la pagina è finita di caricare
    if (location.hash) {
      if (document.readyState === 'complete') daIndirizzo(true);
      else addEventListener('load', () => daIndirizzo(true), { once: true });
    }
  }

  window.Schede = {
    risolvi: f => { risolutori.push(f); },
    apri: nome => vai(nome),
    aperta: () => bottoni.find(b => b.getAttribute('aria-selected') === 'true')?.dataset.scheda,
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', avvia, { once: true });
  else avvia();
})();
