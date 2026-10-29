// Argomenti della giornata: si spuntano mentre si fa lezione, come nel vecchio sito. Componente comune ai corsi (stile in agenda.css).
// Le spunte restano nel browser di questo dispositivo, non si vedono sugli altri. La percentuale gira col tabellone a palette
// delle date dell'hub (assets/fx/effetti.js, da caricare prima), così il sito resta uno solo.
//
// Una pagina può descrivere le sue lezioni in window.LEZIONI_CORSO (prima di questo script):
//   { prefisso: 'ps-int-2627', giorno: 1, archivio: [], lezioni: { 1: { titolo, ore, voci: [...] }, ... } }
// - giorno: la lezione del giorno, mostrata in #lezione-del-giorno con le spunte da mettere e togliere;
// - archivio: le lezioni già fatte, mostrate in #archivio-lezioni con tutte le spunte già messe.
// Per passare alla lezione successiva basta cambiare giorno e aggiungere quella fatta ad archivio.
(function () {
  const leggi = k => { try { return localStorage.getItem(k) === '1'; } catch { return false; } };
  const salva = (k, v) => { try { localStorage.setItem(k, v ? '1' : '0'); } catch { /* senza archivio le spunte valgono finché la pagina resta aperta */ } };
  const tre = p => String(p).padStart(3, ' ');
  const due = n => String(n).padStart(2, '0');
  const esc = t => String(t).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const SPUNTA = '<span class="agenda-box" aria-hidden="true"><svg viewBox="0 0 24 24"><path pathLength="1" d="M5 12.5l4.5 4.5L19 7.5"/></svg></span>';

  // una lezione: la sua riga (che porta agli appunti) e sotto il riquadro con gli argomenti
  function riga(n, L, prefisso, { fatta = false, aperta = false } = {}) {
    const voci = L.voci || [];
    const elenco = voci.length
      ? `<ol class="agenda-list">${voci.map((v, i) => `<li><label><input type="checkbox" data-k="${prefisso}-L${n}-${i}"${fatta ? ' checked disabled' : ''}>${SPUNTA}<span class="agenda-num">${due(i + 1)}</span><span class="agenda-text">${esc(v)}</span></label></li>`).join('')}</ol>`
        + (fatta ? '' : '<button class="agenda-reset" type="button">Togli le spunte</button>')
      : '<p class="agenda-vuota">Gli argomenti di questa lezione sono ancora da definire.</p>';
    return `<li class="has-agenda"><a href="#lezione-${n}"><span class="lesson-index-number">${due(n)}</span><strong>${esc(L.titolo)}</strong><small>${esc(L.ore || '')}</small><span class="lesson-index-arrow" aria-hidden="true">→</span></a>
      <details class="agenda${fatta ? ' agenda--fatta' : ''}"${aperta ? ' open' : ''}${voci.length ? '' : ' data-vuota'}>
        <summary><span class="agenda-title">${fatta ? 'Argomenti trattati' : 'Argomenti della giornata'}<small class="agenda-count">0 di ${voci.length} fatti</small></span><span class="agenda-pct"><span class="agenda-cifre" aria-live="polite">0</span><span class="agenda-perc">%</span></span><span class="agenda-bar" aria-hidden="true"><i></i></span></summary>
        ${elenco}
      </details></li>`;
  }

  const C = window.LEZIONI_CORSO;
  if (C) {
    const oggi = document.getElementById('lezione-del-giorno');
    if (oggi && C.lezioni[C.giorno]) oggi.innerHTML = riga(C.giorno, C.lezioni[C.giorno], C.prefisso, { aperta: true });
    const arch = document.getElementById('archivio-lezioni');
    if (arch) {
      arch.innerHTML = (C.archivio || []).filter(n => C.lezioni[n]).map(n => riga(n, C.lezioni[n], C.prefisso, { fatta: true })).join('');
      const vuoto = document.getElementById('archivio-vuoto');
      if (vuoto) vuoto.hidden = (C.archivio || []).length > 0;
    }
  }

  const riquadri = [...document.querySelectorAll('.agenda')];
  riquadri.forEach(box => {
    const voci = [...box.querySelectorAll('input[data-k]')];
    const cifre = box.querySelector('.agenda-cifre');
    const tabellone = window.Effetti ? Effetti.tabellone(cifre, tre(0)) : null;
    let vista = false, ultima = 0;
    const mostra = p => { ultima = p; if (!tabellone) cifre.textContent = p; else if (vista) tabellone.vai(tre(p)); };
    // la percentuale sta nella riga del titolo, visibile anche a riquadro chiuso: le palette girano quando entra nello schermo
    new IntersectionObserver(([e]) => { vista = e.isIntersecting; if (vista) mostra(ultima); }, { threshold: .4 }).observe(box.querySelector('summary'));
    const conta = () => {
      const fatte = voci.filter(v => v.checked).length, tot = voci.length || 1;
      box.querySelector('.agenda-count').textContent = voci.length ? `${fatte} di ${voci.length} fatti` : 'da definire';
      box.style.setProperty('--fatto', `${fatte / tot * 100}%`);
      box.classList.toggle('completa', voci.length > 0 && fatte === voci.length);
      mostra(Math.round(fatte / tot * 100));
    };
    // nelle lezioni archiviate le spunte sono già tutte messe e non si toccano
    if (!box.classList.contains('agenda--fatta')) {
      voci.forEach(v => { v.checked = leggi(v.dataset.k); v.addEventListener('change', () => { salva(v.dataset.k, v.checked); conta(); }); });
      box.querySelector('.agenda-reset')?.addEventListener('click', () => { voci.forEach(v => { v.checked = false; salva(v.dataset.k, false); }); conta(); });
    }
    conta();
  });
  // se nessun riquadro è già aperto, si apre quello della prima lezione non ancora finita
  if (!riquadri.some(b => b.open)) {
    const prossima = riquadri.find(b => !b.classList.contains('completa') && !b.classList.contains('agenda--fatta'));
    if (prossima) prossima.open = true;
  }
})();
