// La finestra del cervello centrale: lo schedario a tre cassetti della cartella vera su Google Drive (22/11/2026).
// Si apre toccando il cervello nella scena (ecosistema.js chiama window.apriCervello).
// Nomi dei file veri; i lavori per clienti restano una voce sola, perché la pagina è pubblica.
(function () {
  const CHI = {
    claude: { nome: 'Claude', c: '#e9a27c', frase: 'All’inizio gli si caricano la memoria centrale e il CLAUDE.md del progetto. Alla fine aggiorna il Diario e la memoria.' },
    codex: { nome: 'Codex', c: '#c9d6ff', frase: 'Il suo ingresso è un AGENTS.md che lo manda alla memoria centrale. Da lì legge gli stessi file di Claude.' },
    gemini: { nome: 'Gemini', c: '#a99dff', frase: 'Il bot di Gemini scrive soltanto: i resoconti dei reel e le novità che giudica utili.' },
    io: { nome: 'Io', c: '#77e7b7', frase: 'Io controllo e decido cosa resta. Con /endgame ogni cosa va al suo posto.' }
  };
  // l = legge, s = scrive; «io» decide su tutto. Verificato sui file veri il 22/11/2026.
  const CASSETTI = [
    { nome: 'Vale per tutto', via: 'Il mio Drive / Claude', file: [
      { nm: 'MEMORIA-CENTRALE.md', p: 'Chi sono, come lavoro, i computer, i costi. Si carica a ogni sessione.', l: 'claude codex', s: 'claude codex' },
      { nm: 'DA-FARE.md', p: 'Le cose in sospeso fuori dai progetti. Si carica insieme alla memoria.', l: 'claude codex', s: 'claude codex' },
      { nm: 'NOVITA-DA-PROVARE.md', p: 'Le novità dei reel giudicate utili. Le cerca /radar.', l: 'claude codex', s: 'gemini claude' },
      { nm: 'novita_ai.md', p: 'Tutti i resoconti del bot, anche quelli scartati. Si apre solo per un dettaglio.', l: 'claude codex', s: 'gemini' },
      { nm: 'LEZIONI-FOTO-AI.md', p: 'Le lezioni dei lavori di foto con l’IA. Si legge prima di un lavoro con personaggi.', l: 'claude codex', s: 'claude' },
      { nm: 'COLLEGA-NUOVO-PC.md', p: 'Come si collega un computer nuovo a tutto questo.', l: 'claude codex', s: 'claude' },
      { nm: 'skills', dir: 1, p: '17 abilità condivise, come /endgame e /radar. Codex ne usa tre.', l: 'claude codex', s: 'claude' },
      { nm: 'codex', dir: 1, p: 'Gli originali delle istruzioni di Codex. Su ogni computer se ne copia una versione.', l: '', s: 'claude' },
      { nm: 'strumenti', dir: 1, p: 'I miei programmi: Gemini che guarda i video, Sentinel per le immagini.', l: 'claude', s: 'claude' },
      { nm: 'archivio', dir: 1, p: 'Le novità già provate, con com’è andata.', l: 'claude codex', s: 'claude' }
    ] },
    { nome: 'Vale per un progetto', via: 'Il mio Drive / nome del lavoro', etich: 'Una cartella per lavoro:', cartelle: ['Sito Accademia', 'Eidolon Noeima', 'Deskotop animato', 'Makkelijk', 'Lavori per clienti'], file: [
      { nm: 'CLAUDE.md', p: 'Regole e stato del lavoro. In fondo, il Diario: una voce firmata per sessione. C’è in tutte.', l: 'claude codex', s: 'claude codex' },
      { nm: 'AGENTS.md', p: 'Una riga per Codex: «leggi il CLAUDE.md». Solo dove lavora anche Codex.', l: 'codex', s: 'claude' },
      { nm: 'MEMORIA.md', p: 'Solo in qualche progetto: le ricette che hanno funzionato.', l: 'claude codex', s: 'claude codex' }
    ] },
    { nome: 'Vale per un computer', via: 'fuori da Drive, su ogni computer', etich: 'Due computer:', cartelle: ['PC fisso', 'MacBook'], file: [
      { nm: '.claude/CLAUDE.md', p: 'L’ingresso di Claude: una riga che carica la memoria centrale.', l: 'claude', s: 'claude' },
      { nm: '.claude/…/memory', dir: 1, p: 'Gli appunti tecnici di Claude, una cartella per progetto. Non viaggiano.', l: 'claude', s: 'claude' },
      { nm: '.codex/AGENTS.md', p: 'L’ingresso di Codex, copiato da Drive. Per ora solo sul PC fisso.', l: 'codex', s: 'claude' },
      { nm: '.codex/skills', dir: 1, p: 'Le skill di Codex: le tre comuni rimandano a quelle su Drive.', l: 'codex', s: 'claude' }
    ] }
  ];
  const RICHIESTE = [
    { tu: 'pubblica', quando: 'Dopo aver visto una modifica al sito', da: 'Imparato pubblicando decine di volte, e qualche volta sbagliando.', so: [
      ['Su quale archivio e da quale cartella si pubblica.', 1],
      ['Il clone va fatto fuori da Drive: Drive rovina la cartella di Git.', 1],
      ['Prima confronto con l’online: se Codex o ChatGPT hanno cambiato qualcosa, mi fermo e ti chiedo.', 1],
      ['Quale email anonima usare: l’archivio è pubblico.', 1],
      ['Nessuna chiave o file privato deve finire online.', 1],
      ['Va online esattamente quello che hai visto, niente di più.', 0],
      ['Dopo controllo il sito vero e scrivo una voce nel Diario.', 1]
    ] },
    { tu: 'riprendiamo', quando: 'Sul Mac, dopo una giornata al PC', da: 'Tutto dal Diario e dalla memoria: nessuna chat viene riletta.', so: [
      ['Cosa è stato fatto sul PC, e da chi: Claude o Codex.', 1],
      ['Cosa è già online e cosa è solo su Drive.', 1],
      ['Cosa resta da fare, e cosa aspetta una tua decisione.', 1],
      ['Come firmarmi nel Diario su questo computer.', 0],
      ['Quali programmi qui mancano: alcuni ci sono solo sul PC.', 0],
      ['Dove stanno le cose su questo computer.', 2]
    ] },
    { tu: 'fammi un prompt', quando: 'Per un’immagine da generare', da: 'Dalle prove di Makkelijk ed Eidolon, raccolte in regole.', so: [
      ['Il modello: Nano Banana Pro, non Soul.', 0],
      ['Il 2K costa come l’1K: conviene il 2K.', 0],
      ['Gli accenti vanno scritti giusti: il modello copia lettera per lettera.', 0],
      ['Quali immagini allegare, e in che ordine.', 0],
      ['Le parole da evitare, imparate nei lavori passati.', 0],
      ['Generi tu: io non spendo i tuoi crediti di mia iniziativa.', 0],
      ['Se me lo chiedi, 3 prove alla volta, e ti dico quanto ho speso.', 0]
    ] },
    { tu: 'secondo te va bene?', quando: 'Quando ti chiedo un parere', da: 'Una regola nata da un errore: ti davo ragione troppo spesso.', so: [
      ['Prima verifico chi ha ragione, poi rispondo. Non parto da «hai ragione».', 0],
      ['Sui fatti che vedi sullo schermo, hai ragione tu.', 0],
      ['Su un giudizio motivato tengo il punto, e spiego perché.', 0],
      ['Ti dico quanto sono sicuro, e se non lo so lo ammetto.', 0]
    ] }
  ];
  const NOMI_CAS = ['TUTTO', 'PROGETTO', 'COMPUTER'];
  const parole = t => t.split(/\s+/).filter(Boolean).length;

  const usa = (f, k) => k === 'io' || (f.l + ' ' + f.s).split(' ').includes(k);
  const verbo = (f, k) => {
    if (k === 'io') return 'decido';
    const l = f.l.split(' ').includes(k), s = f.s.split(' ').includes(k);
    return l && s ? 'legge e scrive' : l ? 'legge' : 'scrive';
  };

  const ICO_FILE = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true"><path d="M3.5 1.5h6l3 3v10h-9z"/><path d="M9.5 1.5v3h3"/></svg>';
  const ICO_DIR = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true"><path d="M1.5 3.5h5l1.5 1.5h6.5v8.5h-13z"/></svg>';

  const dlg = document.createElement('dialog');
  dlg.className = 'cv';
  dlg.setAttribute('aria-labelledby', 'cv-t');
  dlg.innerHTML = `<div class="cv-box">
    <button type="button" class="cv-x" aria-label="Chiudi">×</button>
    <header class="cv-head"><h2 id="cv-t">Dentro il cervello<span>.</span></h2>
      <p>Una cartella su Google Drive, quasi tutta di file di testo. Tre cassetti.</p>
      <div class="cv-modi" role="group" aria-label="Vista"><button type="button" data-modo="serve" aria-pressed="true">A cosa serve</button><button type="button" data-modo="fatto" aria-pressed="false">Com’è fatto</button></div></header>
    <div class="cv-main">
      <svg class="cv-svg" viewBox="0 0 420 380" role="group" aria-label="Lo schedario a tre cassetti"></svg>
      <div class="cv-dentro cv-serve" id="cv-serve">
        <b class="cv-domanda">Una richiesta di poche parole. Cosa so già?</b>
        <div class="cv-chip" role="group" aria-label="Richieste">${RICHIESTE.map((q, i) => `<button type="button" data-q="${i}" aria-pressed="false">«${q.tu}»</button>`).join('')}</div>
        <div class="cv-msg"><small id="cv-quando"></small><span id="cv-tu"></span></div>
        <ol class="cv-so" id="cv-so"></ol>
        <p class="cv-conto" id="cv-conto"></p>
      </div>
      <div class="cv-dentro" id="cv-fatto" hidden>
        <div class="cv-tit"><b id="cv-nome"></b><code id="cv-via"></code></div>
        <div class="cv-cart" id="cv-cart"></div>
        <div class="cv-file" id="cv-file"></div>
        <div class="cv-say" aria-live="polite"><span id="cv-say">Tocca un cassetto, poi un file.</span></div>
      </div>
    </div>
    <div class="cv-who" id="cv-who" hidden role="group" aria-label="Chi usa questi file"><span>Chi entra</span>
      ${Object.keys(CHI).map(k => `<button type="button" data-chi="${k}" aria-pressed="false" style="--c:${CHI[k].c}"><i></i>${CHI[k].nome}</button>`).join('')}</div>
    <ol class="cv-giro"><li>Apre la sessione</li><li>Legge i cassetti</li><li>Lavora</li><li>Scrive il Diario</li><li>Decido io cosa resta</li></ol>
  </div>`;
  document.body.appendChild(dlg);
  const $ = s => dlg.querySelector(s);
  const svg = $('.cv-svg');

  // ---------- lo schedario isometrico, disegnato in SVG ----------
  const C = Math.cos(Math.PI / 6), S = Math.sin(Math.PI / 6);
  const O = [205, 92];
  const iso = (x, y, z) => [O[0] + (x - y) * C, O[1] + (x + y) * S - z];
  const pts = a => a.map(p => iso(...p).map(n => n.toFixed(1)).join(',')).join(' ');
  const W = 170, D = 120, H = 210, M = 12, GAP = 14;
  const hD = (H - M * 2 - GAP * 2) / 3; // altezza di un cassetto
  const zDi = i => H - M - (i + 1) * hD - i * GAP; // base del cassetto i (0 = in alto)
  const TIRA = 44; // quanto esce il cassetto aperto
  const aperto = [0, 0, 0]; let scelto = 0, chi = null, fileScelto = null, modo = 'serve', domanda = 0, punta = -1;
  // i margini del disegno si calcolano dai suoi spigoli veri, così niente esce dalla finestra
  (function () {
    const v = [[8, -6, 0], [W + 24, -6, 0], [W + 24, D + 22, 0], [8, D + 22, 0], [0, 0, H], [W, 0, H], [0, D, H], [W, D, H], [M, D + TIRA, 0], [W - M, D + TIRA, H]].map(q => iso(...q));
    const xs = v.map(q => q[0]), ys = v.map(q => q[1]);
    const x0 = Math.min(...xs) - 10, y0 = Math.min(...ys) - 30, x1 = Math.max(...xs) + 10, y1 = Math.max(...ys) + 10;
    svg.setAttribute('viewBox', `${x0.toFixed(0)} ${y0.toFixed(0)} ${(x1 - x0).toFixed(0)} ${(y1 - y0).toFixed(0)}`);
  })();

  function disegna() {
    const f = [];
    f.push(`<polygon class="cv-ombra" points="${pts([[8, -6, 0], [W + 24, -6, 0], [W + 24, D + 22, 0], [8, D + 22, 0]])}"/>`);
    f.push(`<polygon class="cv-lato" points="${pts([[W, 0, 0], [W, D, 0], [W, D, H], [W, 0, H]])}"/>`);
    f.push(`<polygon class="cv-fronte" points="${pts([[0, D, 0], [W, D, 0], [W, D, H], [0, D, H]])}"/>`);
    f.push(`<polygon class="cv-sopra" points="${pts([[0, 0, H], [W, 0, H], [W, D, H], [0, D, H]])}"/>`);
    CASSETTI.forEach((c, i) => { const z = zDi(i); f.push(`<polygon class="cv-vano" points="${pts([[M, D, z], [W - M, D, z], [W - M, D, z + hD], [M, D, z + hD]])}"/>`); });
    // il cassetto più aperto si disegna per ultimo, così sta davanti
    [0, 1, 2].sort((a, b) => aperto[a] - aperto[b]).forEach(i => {
      const t = aperto[i] * TIRA, z = zDi(i), y = D + t, x0 = M, x1 = W - M;
      const serve = modo === 'serve';
      const usato = serve ? RICHIESTE[domanda].so.some(x => x[1] === i) : chi && CASSETTI[i].file.some(fl => usa(fl, chi));
      const col = serve || !chi ? '#77e7b7' : CHI[chi].c;
      f.push(`<g class="cv-cas${!serve && i === scelto ? ' on' : ''}${usato ? ' usato' : ''}${serve && punta === i ? ' punta' : ''}" data-i="${i}" tabindex="0" role="button" aria-label="Apri il cassetto ${CASSETTI[i].nome}" style="--c:${col}">`);
      if (t > .5) {
        f.push(`<polygon class="cv-cas-top" points="${pts([[x0, D - 2, z + hD], [x1, D - 2, z + hD], [x1, y, z + hD], [x0, y, z + hD]])}"/>`);
        for (let k = 0; k < 4; k++) { // fogli che spuntano dal cassetto aperto
          const yy = D + 8 + k * (t - 14) / 4, h = 12 + (k % 2) * 6;
          f.push(`<polygon class="cv-foglio" points="${pts([[x0 + 10, yy, z + hD - 2], [x1 - 10, yy, z + hD - 2], [x1 - 10, yy, z + hD + h], [x0 + 10, yy, z + hD + h]])}"/>`);
        }
        f.push(`<polygon class="cv-cas-lato" points="${pts([[x1, D, z], [x1, y, z], [x1, y, z + hD], [x1, D, z + hD]])}"/>`);
      }
      f.push(`<polygon class="cv-cas-fronte" points="${pts([[x0, y, z], [x1, y, z], [x1, y, z + hD], [x0, y, z + hD]])}"/>`);
      const m1 = iso(W / 2 - 22, y, z + hD * .55), m2 = iso(W / 2 + 22, y, z + hD * .55);
      f.push(`<line class="cv-maniglia" x1="${m1[0]}" y1="${m1[1]}" x2="${m2[0]}" y2="${m2[1]}"/>`);
      const tg = iso(x0 + 8, y, z + hD * .28);
      f.push(`<text class="cv-etich" x="${tg[0] + 4}" y="${tg[1] + 4}" transform="rotate(30 ${tg[0]} ${tg[1]})">${['TUTTO', 'PROGETTO', 'COMPUTER'][i]}</text></g>`);
    });
    svg.innerHTML = f.join('');
  }

  // ---------- il contenuto del cassetto aperto ----------
  function riempi() {
    const c = CASSETTI[scelto];
    $('#cv-nome').textContent = c.nome;
    $('#cv-via').textContent = c.via;
    $('#cv-cart').innerHTML = c.cartelle ? `<span>${c.etich}</span>${c.cartelle.map(n => `<em>${n}</em>`).join('')}` : '';
    $('#cv-file').innerHTML = c.file.map((f, j) => {
      const on = chi && usa(f, chi);
      return `<button type="button" class="cv-fl${on ? ' on' : ''}${chi && !on ? ' spento' : ''}${fileScelto === j ? ' sel' : ''}" data-j="${j}" style="--c:${chi ? CHI[chi].c : '#77e7b7'}">
        ${f.dir ? ICO_DIR : ICO_FILE}<span>${f.nm}</span>${on ? `<small>${verbo(f, chi)}</small>` : ''}</button>`;
    }).join('');
  }
  const dici = t => { $('#cv-say').textContent = t; };

  function chiedi(i) {
    domanda = i; punta = -1;
    const q = RICHIESTE[i];
    dlg.querySelectorAll('[data-q]').forEach(b => b.setAttribute('aria-pressed', String(+b.dataset.q === i)));
    $('#cv-quando').textContent = q.quando;
    $('#cv-tu').textContent = `«${q.tu}»`;
    $('#cv-so').innerHTML = q.so.map(([t, c], k) => `<li data-c="${c}" style="--k:${k}"><span>${t}</span><em>${NOMI_CAS[c]}</em></li>`).join('');
    const n = Math.round(q.so.reduce((a, x) => a + parole(x[0]), 0) / 10) * 10;
    $('#cv-conto').innerHTML = `Senza il cervello dovresti scrivermelo ogni volta: <b>circa ${n} parole</b>. Con il cervello ${['', 'basta una', 'ne bastano due', 'ne bastano tre', 'ne bastano quattro'][parole(q.tu)]}.<small>${q.da}</small>`;
    disegna();
  }
  function vista(m) {
    modo = m;
    dlg.querySelectorAll('[data-modo]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.modo === m)));
    $('#cv-serve').hidden = m !== 'serve';
    $('#cv-fatto').hidden = m !== 'fatto';
    $('#cv-who').hidden = m !== 'fatto';
    if (m === 'serve') { aperto.fill(0); cancelAnimationFrame(anim); chiedi(domanda); }
  }

  const fermo = matchMedia('(prefers-reduced-motion: reduce)');
  let anim = 0;
  function apri(i) {
    scelto = i; fileScelto = null; riempi();
    dici(chi ? CHI[chi].frase : 'Tocca un file per sapere cosa contiene.');
    cancelAnimationFrame(anim);
    if (fermo.matches) { aperto.forEach((_, k) => { aperto[k] = k === i ? 1 : 0; }); return disegna(); }
    const da = aperto.slice(), t0 = performance.now();
    const passo = now => {
      const q = Math.min(1, (now - t0) / 420), e = 1 - Math.pow(1 - q, 3);
      aperto.forEach((_, k) => { aperto[k] = da[k] + ((k === i ? 1 : 0) - da[k]) * e; });
      disegna();
      if (q < 1) anim = requestAnimationFrame(passo);
    };
    anim = requestAnimationFrame(passo);
  }

  svg.addEventListener('click', e => { const g = e.target.closest('[data-i]'); if (!g) return; if (modo === 'serve') vista('fatto'); apri(+g.dataset.i); });
  svg.addEventListener('keydown', e => { const g = e.target.closest('[data-i]'); if (g && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); if (modo === 'serve') vista('fatto'); apri(+g.dataset.i); } });
  const lista = $('#cv-so');
  lista.addEventListener('pointerover', e => { const li = e.target.closest('li'); if (li && +li.dataset.c !== punta) { punta = +li.dataset.c; disegna(); } });
  lista.addEventListener('pointerleave', () => { punta = -1; disegna(); });
  dlg.addEventListener('click', e => {
    const q = e.target.closest('[data-q]');
    if (q) return chiedi(+q.dataset.q);
    const md = e.target.closest('[data-modo]');
    if (md) { vista(md.dataset.modo); if (md.dataset.modo === 'fatto') apri(scelto); return; }
    const fl = e.target.closest('.cv-fl');
    if (fl) { fileScelto = +fl.dataset.j; riempi(); return dici(CASSETTI[scelto].file[fileScelto].p); }
    const b = e.target.closest('[data-chi]');
    if (b) {
      chi = chi === b.dataset.chi ? null : b.dataset.chi;
      dlg.querySelectorAll('[data-chi]').forEach(x => x.setAttribute('aria-pressed', String(x.dataset.chi === chi)));
      fileScelto = null; riempi(); disegna();
      return dici(chi ? CHI[chi].frase : 'Tocca un cassetto, poi un file.');
    }
    if (e.target.closest('.cv-x') || e.target === dlg) dlg.close();
  });

  let prima = null;
  dlg.addEventListener('close', () => { document.documentElement.style.overflow = ''; prima?.focus?.(); });
  window.apriCervello = function () {
    if (dlg.open) return;
    prima = document.activeElement;
    document.documentElement.style.overflow = 'hidden';
    chi = null; fileScelto = null;
    dlg.querySelectorAll('[data-chi]').forEach(x => x.setAttribute('aria-pressed', 'false'));
    aperto.fill(0); scelto = 0; riempi();
    dici('Tocca un cassetto, poi un file.');
    vista('serve'); chiedi(0);
    dlg.showModal();
    dlg.scrollTop = 0;
    $('.cv-x').focus({ preventScroll: true });
  };
})();
