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
      <p>Una cartella su Google Drive, quasi tutta di file di testo. Nessuno l’ha progettata: è cresciuta una regola alla volta.</p>
      <div class="cv-modi" role="group" aria-label="Vista"><button type="button" data-modo="storia" aria-pressed="true">Com’è nato</button><button type="button" data-modo="serve" aria-pressed="false">A cosa serve</button><button type="button" data-modo="fatto" aria-pressed="false">Com’è fatto</button></div></header>
    <div class="cv-main">
      <div class="cv-sfera">
        <canvas class="cv-svg" aria-hidden="true"></canvas>
        <div class="cv-gusci" role="group" aria-label="I tre strati del cervello">
          <button type="button" data-i="0"><i></i>Tutto<small>al centro</small></button>
          <button type="button" data-i="1"><i></i>Progetto<small>in mezzo</small></button>
          <button type="button" data-i="2"><i></i>Computer<small>fuori</small></button>
        </div>
      </div>
      <div class="cv-dentro cv-storia" id="cv-storia">
        <div class="cv-term" id="cv-term" aria-live="polite"></div>
        <div class="cv-ctrl">
          <button type="button" data-st="-1" aria-label="Scena precedente">‹</button>
          <button type="button" data-st="auto" class="cv-play" aria-pressed="false">▶ Racconta</button>
          <button type="button" data-st="1" class="cv-avanti">Avanti ›</button>
          <span class="cv-n" id="cv-n"></span>
        </div>
        <p class="cv-nota">Date, frasi con l’ora e regole sono vere. Alcuni dialoghi sono ricostruiti.</p>
      </div>
      <div class="cv-dentro cv-serve" id="cv-serve" hidden>
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
        <div class="cv-say" aria-live="polite"><span id="cv-say">Tocca uno strato della sfera, poi un file.</span></div>
      </div>
    </div>
    <div class="cv-who" id="cv-who" hidden role="group" aria-label="Chi usa questi file"><span>Chi entra</span>
      ${Object.keys(CHI).map(k => `<button type="button" data-chi="${k}" aria-pressed="false" style="--c:${CHI[k].c}"><i></i>${CHI[k].nome}</button>`).join('')}</div>
    <ol class="cv-giro"><li>Apre la sessione</li><li>Legge gli strati</li><li>Lavora</li><li>Scrive il Diario</li><li>Decido io cosa resta</li></ol>
  </div>`;
  document.body.appendChild(dlg);
  const $ = s => dlg.querySelector(s);
  const tela = $('.cv-svg'), ctx = tela.getContext('2d');

  // ---------- la sfera del cervello, aperta: tre gusci uno dentro l'altro ----------
  // al centro «vale per tutto», in mezzo «progetto», fuori «computer»
  const RAGGI = [.34, .64, 1];
  const QUANTI = [650, 1500, 2900];
  const GUSCI = RAGGI.map((rg, g) => {
    const n = QUANTI[g], pt = [];
    for (let k = 0; k < n; k++) { // punti distribuiti in modo uniforme sulla sfera
      const y = 1 - (k + .5) / n * 2, rr = Math.sqrt(1 - y * y), th = k * 2.399963;
      pt.push([Math.cos(th) * rr * rg, y * rg, Math.sin(th) * rr * rg, Math.random()]);
    }
    return pt;
  });
  const aperto = [0, 0, 0]; let scelto = 0, chi = null, fileScelto = null, modo = 'serve', domanda = 0, punta = -1;
  let giro = 0, ultimo = 0, ciclo = 0, battito = 0;
  const fermo = matchMedia('(prefers-reduced-motion: reduce)');

  function colore(i) {
    if (modo === 'storia') { const sc = STORIA[scena]; return ['#77e7b7', sc && sc.nodo === i ? .8 : .12]; }
    const serve = modo === 'serve';
    const usato = serve ? RICHIESTE[domanda].so.some(x => x[1] === i) : chi && CASSETTI[i].file.some(fl => usa(fl, chi));
    const acceso = serve ? (punta === i ? 1 : usato ? .75 : 0) : Math.max(aperto[i], usato ? .6 : 0);
    const c = !serve && chi && usato ? CHI[chi].c : '#77e7b7';
    return [c, acceso];
  }
  function disegna() {
    const w = tela.clientWidth, dpr = Math.min(devicePixelRatio || 1, 2);
    if (!w) return;
    if (tela.width !== Math.round(w * dpr)) { tela.width = Math.round(w * dpr); tela.height = Math.round(w * dpr); }
    const W = tela.width, R = W * .4, cx = W / 2, cy = W / 2;
    ctx.clearRect(0, 0, W, W);
    const cy1 = Math.cos(giro), sy1 = Math.sin(giro), inc = -.38, ci = Math.cos(inc), si = Math.sin(inc);
    const disco = (x, y, rr, a, col) => { ctx.globalAlpha = a; ctx.fillStyle = col; ctx.beginPath(); ctx.arc(x, y, rr, 0, 6.2832); ctx.fill(); };
    // bagliore dietro il nucleo
    const [cc, ac] = colore(0);
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, R * .55);
    grad.addColorStop(0, cc); grad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.globalAlpha = .1 + .18 * ac + .05 * Math.sin(battito); ctx.fillStyle = grad; ctx.fillRect(0, 0, W, W);
    // i gusci dal più esterno al più interno, così il nucleo sta sopra
    for (let g = 2; g >= 0; g--) {
      const [col, acc] = colore(g);
      const base = g === 0 ? '#b9d8cb' : '#8fb3a3';
      for (const [x, y, z, rnd] of GUSCI[g]) {
        const x1 = x * cy1 + z * sy1, z1 = -x * sy1 + z * cy1; // giro intorno all'asse verticale
        const y2 = y * ci - z1 * si, z2 = y * si + z1 * ci;     // un po' inclinata verso chi guarda
        if (g > 0 && x1 > -.02 * RAGGI[g] && z2 > 0 && y2 < .35 * RAGGI[g]) continue; // lo spicchio aperto
        const dist = (z2 / RAGGI[g] + 1) / 2;                   // 0 dietro, 1 davanti
        const a = (.12 + .55 * dist) * (g === 2 ? .7 : 1) * (.45 + .55 * acc) + .04;
        const tw = .6 + .4 * Math.sin(battito * 1.3 + rnd * 20);
        disco(cx + x1 * R, cy - y2 * R, (g === 0 ? 1.5 : 1.15) * dpr * (.7 + .5 * dist), a * tw, acc > .05 ? col : base);
      }
    }
    if (modo === 'storia') disegnaNodi(cx, cy, R, cy1, sy1, ci, si, dpr, disco);
    // il taglio: tre archi che mostrano dove finiscono i gusci
    ctx.globalAlpha = 1;
    for (let g = 1; g < 3; g++) {
      const [col, acc] = colore(g);
      ctx.strokeStyle = acc > .05 ? col : '#4c7464'; ctx.globalAlpha = .35 + .5 * acc; ctx.lineWidth = dpr * (1 + acc);
      ctx.beginPath(); ctx.arc(cx, cy, RAGGI[g] * R, -.2, 1.75); ctx.stroke();
    }
    ctx.globalAlpha = 1;
    dlg.querySelectorAll('.cv-gusci [data-i]').forEach(bt => {
      const i = +bt.dataset.i, [col, acc] = colore(i);
      bt.style.setProperty('--c', col);
      bt.classList.toggle('on', acc > .05);
      bt.setAttribute('aria-pressed', String(modo === 'fatto' && i === scelto));
    });
  }
  function gira(now) {
    if (!dlg.open) { ciclo = 0; return; }
    const dt = Math.min(.05, (now - (ultimo || now)) / 1000); ultimo = now;
    if (!fermo.matches) { giro += dt * .18; battito += dt * 2; }
    if (modo === 'storia') passo(dt);
    disegna();
    ciclo = requestAnimationFrame(gira);
  }
  function anima() { if (!ciclo) { ultimo = 0; ciclo = requestAnimationFrame(gira); } }
  // toccare la sfera: la distanza dal centro dice quale guscio
  tela.addEventListener('click', e => {
    const b = tela.getBoundingClientRect(), d = Math.hypot(e.clientX - b.left - b.width / 2, e.clientY - b.top - b.height / 2) / (b.width * .4);
    if (d > 1.08) return;
    const i = d < .46 ? 0 : d < .8 ? 1 : 2;
    if (modo === 'serve') vista('fatto');
    apri(i);
  });
  tela.addEventListener('pointermove', e => {
    const b = tela.getBoundingClientRect(), d = Math.hypot(e.clientX - b.left - b.width / 2, e.clientY - b.top - b.height / 2) / (b.width * .4);
    tela.style.cursor = d <= 1.08 ? 'pointer' : '';
  });
  // da dove parte lo zoom: il punto dell'ultimo tocco sulla pagina
  let tocco = null;
  addEventListener('pointerdown', e => { if (!dlg.open) tocco = [e.clientX, e.clientY]; }, true);

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
    $('#cv-storia').hidden = m !== 'storia';
    dlg.classList.toggle('in-storia', m === 'storia');
    if (m !== 'storia') auto(false);
    $('#cv-fatto').hidden = m !== 'fatto';
    $('#cv-who').hidden = m !== 'fatto';
    if (m === 'serve') { aperto.fill(0); chiedi(domanda); }
  }

  function apri(i) {
    scelto = i; fileScelto = null; riempi();
    dici(chi ? CHI[chi].frase : 'Tocca un file per sapere cosa contiene.');
    aperto.forEach((_, k) => { aperto[k] = k === i ? 1 : 0; });
  }

  const lista = $('#cv-so');
  lista.addEventListener('pointerover', e => { const li = e.target.closest('li'); if (li && +li.dataset.c !== punta) { punta = +li.dataset.c; disegna(); } });
  lista.addEventListener('pointerleave', () => { punta = -1; disegna(); });
  dlg.addEventListener('click', e => {
    const gs = e.target.closest('.cv-gusci [data-i]');
    if (gs) { if (modo === 'serve') vista('fatto'); return apri(+gs.dataset.i); }
    const q = e.target.closest('[data-q]');
    if (q) return chiedi(+q.dataset.q);
    const st = e.target.closest('[data-st]');
    if (st) { if (st.dataset.st === 'auto') return auto(!inAuto); auto(false); return avanza(+st.dataset.st); }
    const md = e.target.closest('[data-modo]');
    if (md) { vista(md.dataset.modo); if (md.dataset.modo === 'fatto') apri(scelto); return; }
    const fl = e.target.closest('.cv-fl');
    if (fl) { fileScelto = +fl.dataset.j; riempi(); return dici(CASSETTI[scelto].file[fileScelto].p); }
    const b = e.target.closest('[data-chi]');
    if (b) {
      chi = chi === b.dataset.chi ? null : b.dataset.chi;
      dlg.querySelectorAll('[data-chi]').forEach(x => x.setAttribute('aria-pressed', String(x.dataset.chi === chi)));
      fileScelto = null; riempi(); disegna();
      return dici(chi ? CHI[chi].frase : 'Tocca uno strato della sfera, poi un file.');
    }
    if (e.target.closest('.cv-x') || e.target === dlg) dlg.close();
  });

  // ---------- com'è nato: la storia scena per scena (testi in cervello-storia.js) ----------
  const STORIA = window.STORIA_CERVELLO || [];
  const CHI_DICE = { g: ['io', '#77e7b7'], c: ['claude', '#e9a27c'], x: ['codex', '#c9d6ff'], s: ['studentessa', '#f2c46d'] };
  const RADUNO = STORIA.findIndex(sc => sc.raduna);
  // un nodo per ogni scena che ne ha uno, in un punto fisso del suo guscio
  const NODI = [];
  STORIA.forEach((sc, k) => {
    if (sc.nodo === undefined) return;
    const rg = RAGGI[sc.nodo] * (sc.nodo ? .97 : .7), a = k * 2.3 + 1.1, y = Math.sin(k * 1.7) * .6;
    const rr = Math.sqrt(1 - y * y);
    NODI.push({ k, centro: !!sc.centro, p: [Math.cos(a) * rr * rg, y * rg, Math.sin(a) * rr * rg], v: 0, m: 0 });
  });
  let scena = 0, inAuto = false, attesa = 0, coda = [], scrivo = null;
  const term = $('#cv-term');

  function rigaHTML([t, , ora]) {
    if (t === 'n') return '<p class="cv-r cv-rn"><span></span></p>';
    if (t === 'r') return '<p class="cv-r cv-rr"><b>+</b><span></span></p>';
    const [nome, col] = CHI_DICE[t];
    const tag = ora === 'vera' ? '<em>parole vere</em>' : ora ? `<em>${ora} · parole vere</em>` : '';
    return `<p class="cv-r cv-rd" style="--c:${col}"><i>${nome} ›</i><span></span>${tag}</p>`;
  }
  const pieno = r => { r.classList.remove('dopo'); const sp = r.querySelector('span'); sp.textContent = sp.dataset.t; };
  function vai(n) {
    scena = Math.max(0, Math.min(STORIA.length - 1, n));
    term.innerHTML = '';
    for (let k = 0; k <= scena; k++) {
      const sc = STORIA[k], box = document.createElement('section');
      box.className = 'cv-sc' + (k < scena ? ' passata' : '');
      box.innerHTML = (sc.salto ? `<div class="cv-salto">— ${sc.salto} —</div>` : '') +
        `<header><small>${sc.quando}</small><b>${sc.titolo}</b></header>` + sc.righe.map(rigaHTML).join('');
      box.querySelectorAll('.cv-r > span').forEach((sp, j) => { sp.dataset.t = sc.righe[j][1]; if (k < scena) sp.textContent = sc.righe[j][1]; });
      term.appendChild(box);
    }
    coda = [...term.lastElementChild.querySelectorAll('.cv-r')];
    coda.forEach(r => r.classList.add('dopo'));
    scrivo = null; attesa = .35;
    if (fermo.matches) { coda.forEach(pieno); coda = []; }
    $('#cv-n').textContent = `${scena + 1} / ${STORIA.length}`;
    dlg.querySelector('[data-st="-1"]').disabled = scena === 0;
    dlg.querySelector('[data-st="1"]').disabled = scena === STORIA.length - 1;
    requestAnimationFrame(() => { term.scrollTop = term.scrollHeight; });
  }
  function finisci() { // completa subito la scena che si sta scrivendo
    if (scrivo) { scrivo.sp.textContent = scrivo.sp.dataset.t; scrivo = null; }
    coda.forEach(pieno); coda = []; attesa = 1.5;
    term.scrollTop = term.scrollHeight;
  }
  function avanza(d) {
    if (d > 0 && (coda.length || scrivo)) return finisci();
    vai(scena + d);
  }
  function auto(on) {
    inAuto = on; attesa = Math.min(attesa, .6);
    const b = dlg.querySelector('.cv-play');
    b.setAttribute('aria-pressed', String(on)); b.textContent = on ? '❚❚ Pausa' : '▶ Racconta';
  }
  function passo(dt) { // la macchina da scrivere e il racconto automatico
    if (scrivo) {
      scrivo.n += dt * (scrivo.r ? 30 : 44);
      const t = scrivo.sp.dataset.t;
      scrivo.sp.textContent = t.slice(0, Math.floor(scrivo.n));
      if (scrivo.n >= t.length) { scrivo = null; attesa = .5 + t.length / 90; }
      term.scrollTop = term.scrollHeight;
      return;
    }
    if ((attesa -= dt) > 0) return;
    if (coda.length) {
      const r = coda.shift(); r.classList.remove('dopo');
      scrivo = { sp: r.querySelector('span'), n: 0, r: r.classList.contains('cv-rr') };
      return;
    }
    if (inAuto) { if (scena < STORIA.length - 1) vai(scena + 1); else auto(false); }
    attesa = 1.2;
  }
  function disegnaNodi(cx, cy, R, cy1, sy1, ci, si, dpr, disco) {
    const pos = [];
    for (const nd of NODI) {
      nd.v += ((nd.k <= scena ? 1 : 0) - nd.v) * .08;
      const verso = RADUNO >= 0 && scena >= RADUNO && nd.centro ? 1 : 0; // dalla scena del cervello vola verso il centro
      nd.m += (verso - nd.m) * .04;
      if (nd.v < .02) continue;
      const f = 1 - nd.m * .72;
      const [x, y, z] = nd.p.map(c => c * f);
      const x1 = x * cy1 + z * sy1, z1 = -x * sy1 + z * cy1;
      pos.push([cx + x1 * R, cy - (y * ci - z1 * si) * R, nd]);
    }
    // il filo che unisce i nodi nell'ordine in cui sono nati
    ctx.globalAlpha = .3; ctx.strokeStyle = '#77e7b7'; ctx.lineWidth = dpr;
    ctx.beginPath(); pos.forEach(([x, y], j) => j ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.stroke();
    const eco = STORIA[scena].eco;
    for (const [x, y, nd] of pos) {
      const ora = nd.k === scena || nd.k === eco;
      const r = dpr * (ora ? 6.5 + 1.5 * Math.sin(battito * 3) : 3.6);
      const g = ctx.createRadialGradient(x, y, 0, x, y, r * 4);
      g.addColorStop(0, 'rgba(119,231,183,.5)'); g.addColorStop(1, 'rgba(119,231,183,0)');
      ctx.globalAlpha = nd.v; ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r * 4, 0, 6.2832); ctx.fill();
      disco(x, y, r, nd.v, ora ? '#eafff5' : '#77e7b7');
    }
  }
  document.addEventListener('keydown', e => {
    if (!dlg.open || modo !== 'storia') return;
    if (e.key === 'ArrowRight') { e.preventDefault(); auto(false); avanza(1); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); auto(false); avanza(-1); }
  });

  let prima = null;
  dlg.addEventListener('close', () => { document.documentElement.style.overflow = ''; auto(false); window.esciDalCervello?.(); prima?.focus?.(); });
  window.apriCervello = function (da) {
    if (dlg.open) return;
    if (da) tocco = da;
    prima = document.activeElement;
    document.documentElement.style.overflow = 'hidden';
    chi = null; fileScelto = null;
    dlg.querySelectorAll('[data-chi]').forEach(x => x.setAttribute('aria-pressed', 'false'));
    aperto.fill(0); scelto = 0; riempi();
    dici('Tocca uno strato della sfera, poi un file.');
    vista('storia'); vai(0);
    const [ox, oy] = tocco || [innerWidth / 2, innerHeight / 2];
    dlg.style.setProperty('--ox', ox + 'px'); dlg.style.setProperty('--oy', oy + 'px');
    dlg.showModal();
    dlg.scrollTop = 0;
    anima();
    $('.cv-x').focus({ preventScroll: true });
  };
})();
