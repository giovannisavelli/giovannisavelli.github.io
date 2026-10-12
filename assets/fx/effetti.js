/* =====================================================================
   Effetti presi da React Bits e portati in JavaScript senza React.
   - Split Flap Text   https://www.reactbits.dev/text-animations/split-flap-text
   - Variable Proximity https://www.reactbits.dev/text-animations/variable-proximity
   - Spotlight Card     https://www.reactbits.dev/components/spotlight-card
   Copyright (c) 2026 David Haz · MIT + Commons Clause
   https://github.com/DavidHDev/react-bits/blob/main/LICENSE.md
   Portati per il sito di G. Savelli. Script classico: va caricato prima di studio.js.
   Lo stile sta in assets/studio.css, sezione "Effetti presi da React Bits".
   ===================================================================== */
(function () {
  const fermo = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const mouse = matchMedia('(pointer: fine)').matches;
  const CIFRE = '0123456789';
  const SEPARATORI = '.:/-';
  const car = c => (c === ' ' ? ' ' : c);

  /* ---------- Split Flap Text ----------
     tabellone(el, testo) disegna le palette; .vai(nuovo) le fa girare fino al nuovo testo.
     Le palette sono aria-hidden: il testo vero resta in uno span nascosto per i lettori di schermo. */
  function tabellone(el, testo, { giri = 6, durata = 85, sfasa = 70, caratteri = CIFRE } = {}) {
    let attuale = String(testo);
    let raf = 0;
    el.classList.add('flap');
    el.style.setProperty('--flap-durata', durata + 'ms');

    const meta = (lato, c) => `<span class="flap__meta flap__meta--${lato}"><span class="flap__car">${car(c)}</span></span>`;
    const anta = (lato, c) => `<span class="flap__anta flap__anta--${lato}"><span class="flap__car">${car(c)}</span></span>`;
    const statica = c => meta('su', c) + meta('giu', c);

    function disegna(t) {
      el.innerHTML = `<span class="vh">${t}</span>` + [...t].map(c => SEPARATORI.includes(c)
        ? `<span class="flap__sep" aria-hidden="true">${c}</span>`
        : `<span class="flap__tile" aria-hidden="true">${statica(c)}</span>`).join('');
    }
    disegna(attuale);

    function vai(nuovo) {
      nuovo = String(nuovo);
      // un giro interrotto a metà: prima rimetti a posto le palette sull'ultimo testo
      if (raf) { cancelAnimationFrame(raf); raf = 0; disegna(attuale); }
      if (fermo || nuovo.length !== attuale.length) { attuale = nuovo; disegna(nuovo); return; }
      const vecchio = attuale;
      attuale = nuovo;
      el.querySelector('.vh').textContent = nuovo;
      const tessere = [...el.children].slice(1);
      // per ogni palette che cambia: qualche carattere a caso, poi quello giusto
      const piani = [...nuovo].map((c, i) => (c === vecchio[i] || SEPARATORI.includes(c)) ? null : {
        tessera: tessere[i], da: vecchio[i], inizio: i * sfasa, passo: -1,
        seq: Array.from({ length: giri }, () => caratteri[Math.floor(Math.random() * caratteri.length)]).concat(c)
      }).filter(Boolean);
      const t0 = performance.now();
      (function ciclo(ora) {
        let ancora = false;
        for (const p of piani) {
          const n = Math.floor((ora - t0 - p.inizio) / durata);
          if (n < 0) { ancora = true; continue; }
          if (n < p.seq.length) {
            ancora = true;
            if (n !== p.passo) {
              const prima = n === 0 ? p.da : p.seq[n - 1], dopo = p.seq[n];
              p.passo = n;
              // sopra compare già il nuovo, sotto resta il vecchio finché l'anta non cade
              p.tessera.innerHTML = meta('su', dopo) + meta('giu', prima) + anta('su', prima) + anta('giu', dopo);
            }
          } else if (p.passo !== Infinity) {
            p.passo = Infinity;
            p.tessera.innerHTML = statica(p.seq[p.seq.length - 1]);
          }
        }
        raf = ancora ? requestAnimationFrame(ciclo) : 0;
      })(t0);
    }
    return { vai };
  }

  /* ---------- Variable Proximity ----------
     Le lettere vicine al mouse diventano più spesse (asse 'wght' del font variabile Geist)
     e si colorano dell'accento. Solo con il mouse e senza "riduci movimento". */
  function prossimita(el, { da = 400, a = 800, raggio = 220 } = {}) {
    if (!mouse || fermo || el.classList.contains('vivo')) return;
    const testo = el.textContent;
    el.classList.add('vivo');
    el.innerHTML = [...testo].map(c => (c === ' ' ? ' ' : `<span>${c}</span>`)).join('');
    const lettere = [...el.querySelectorAll('span')];
    let mx = -1e4, my = -1e4, raf = 0, visibile = false;
    new IntersectionObserver(([e]) => { visibile = e.isIntersecting; }).observe(el);
    function frame() {
      raf = 0;
      for (const l of lettere) {
        const r = l.getBoundingClientRect();
        const d = Math.hypot(mx - (r.left + r.width / 2), my - (r.top + r.height / 2));
        const f = Math.max(0, 1 - d / raggio);
        const k = f * f * (3 - 2 * f);   // attenuazione morbida
        l.style.fontVariationSettings = `'wght' ${Math.round(da + (a - da) * k)}`;
        l.style.color = k > .02 ? `color-mix(in srgb, var(--accent) ${Math.round(k * 70)}%, transparent)` : '';
      }
    }
    addEventListener('pointermove', e => { mx = e.clientX; my = e.clientY; if (visibile && !raf) raf = requestAnimationFrame(frame); }, { passive: true });
    document.documentElement.addEventListener('pointerleave', () => { mx = my = -1e4; if (!raf) raf = requestAnimationFrame(frame); });
  }

  /* ---------- Spotlight Card ----------
     Gli elementi con classe .luce ricevono la posizione del puntatore (--mx, --my);
     la luce e il bordo acceso sono disegnati in CSS. */
  function luce() {
    if (!mouse) return;
    document.addEventListener('pointermove', e => {
      const c = e.target.closest && e.target.closest('.luce');
      if (!c) return;
      const r = c.getBoundingClientRect();
      c.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      c.style.setProperty('--my', (e.clientY - r.top) + 'px');
    }, { passive: true });
  }
  luce();

  window.Effetti = { tabellone, prossimita };
})();
