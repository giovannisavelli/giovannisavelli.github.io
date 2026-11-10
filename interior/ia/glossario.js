// Glossario IA: animazione che spiega API e MCP un passo alla volta.
// Un messaggio viaggia lungo una linea curva fra i riquadri (posizione presa con getPointAtLength);
// i riquadri si accendono quando lavorano e restano segnati quando hanno finito.
(() => {
  const figura = document.getElementById('glo-anim');
  if (!figura) return;
  const NS = 'http://www.w3.org/2000/svg';
  /* «riduci movimento» del telefono OPPURE «Meno movimento» della Lettura facilitata (attributo su <html>), letto ogni volta */
  const ridotto = ((mq, h) => () => mq.matches || h.hasAttribute('data-lt-fermo'))(matchMedia('(prefers-reduced-motion: reduce)'), document.documentElement);
  const tela = figura.querySelector('.glo-tela');
  const svg = figura.querySelector('svg');
  const passoTesto = figura.querySelector('.glo-passo');
  const fraseTesto = figura.querySelector('.glo-frase');
  const btnPlay = figura.querySelector('[data-glo="play"]');
  const btnIndietro = figura.querySelector('[data-glo="indietro"]');
  const btnAvanti = figura.querySelector('[data-glo="avanti"]');
  const btnDaCapo = figura.querySelector('[data-glo="dacapo"]');
  const btnScene = [...figura.querySelectorAll('[data-scena]')];

  function el(tag, attrs, padre) {
    const e = document.createElementNS(NS, tag);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    if (padre) padre.appendChild(e);
    return e;
  }
  function scritta(padre, x, y, testo, classe) {
    const t = el('text', { x, y, class: classe, 'text-anchor': 'middle' }, padre);
    t.textContent = testo;
    return t;
  }
  // Punto di aggancio sul bordo di un riquadro, spostato di «off» lungo il bordo.
  function aggancio(b, lato, off = 0) {
    if (lato === 'r') return [b.x + b.w, b.y + b.h / 2 + off];
    if (lato === 'l') return [b.x, b.y + b.h / 2 + off];
    if (lato === 't') return [b.x + b.w / 2 + off, b.y];
    return [b.x + b.w / 2 + off, b.y + b.h];
  }
  // Curva da A a B, piegata di «piega» pixel sul lato sinistro del verso di marcia.
  function curva(A, B, piega) {
    const dx = B[0] - A[0], dy = B[1] - A[1], L = Math.hypot(dx, dy) || 1;
    const nx = -dy / L * piega, ny = dx / L * piega;
    const c1 = [A[0] + dx / 3 + nx, A[1] + dy / 3 + ny];
    const c2 = [A[0] + 2 * dx / 3 + nx, A[1] + 2 * dy / 3 + ny];
    return `M${A} C${c1} ${c2} ${B}`;
  }
  const larghezza = testo => testo.length * 7.6 + 24;

  function riquadro(padre, b, titolo, sotto) {
    const g = el('g', { class: 'glo-n' }, padre);
    el('rect', { x: b.x, y: b.y, width: b.w, height: b.h, rx: 14, class: 'glo-n-box' }, g);
    scritta(g, b.x + b.w / 2, b.y + b.h / 2 - (sotto ? 3 : -7), titolo, 'glo-n-tit');
    if (sotto) scritta(g, b.x + b.w / 2, b.y + b.h / 2 + 21, sotto, 'glo-n-sub');
    return g;
  }
  function collegamento(d, etichetta) {
    el('path', { d, class: 'glo-p' }, svg);
    const luce = el('path', { d, class: 'glo-p-luce' }, svg);
    const L = luce.getTotalLength();
    luce.style.strokeDasharray = L;
    const c = { luce, L, et: null };
    if (etichetta) {
      const m = luce.getPointAtLength(L / 2), w = larghezza(etichetta);
      c.et = el('g', { class: 'glo-et', transform: `translate(${m.x},${m.y})` }, svg);
      el('rect', { x: -w / 2, y: -14, width: w, height: 28, rx: 14 }, c.et);
      scritta(c.et, 0, 5, etichetta, '');
    }
    return c;
  }
  function spegni(c) { c.luce.style.strokeDashoffset = c.L; c.et?.classList.remove('vis'); }
  function accendi(c) { c.luce.style.strokeDashoffset = 0; c.et?.classList.add('vis'); }
  function stato(nodo, s) { nodo.classList.remove('attivo', 'fatto'); if (s) nodo.classList.add(s); }

  const attendi = (ms, annullato) => new Promise(fine => {
    const t0 = performance.now();
    (function giro(t) { if (annullato() || t - t0 >= ms) return fine(); requestAnimationFrame(giro); })(t0);
  });
  // Il messaggio viaggia lungo la linea e la accende dietro di sé.
  function viaggio(c, testo, ms, annullato) {
    return new Promise(fine => {
      const g = el('g', { class: 'glo-viaggio' }, svg);
      el('circle', { r: 13, class: 'glo-v-alone' }, g);
      el('circle', { r: 6, class: 'glo-v-punto' }, g);
      const w = larghezza(testo);
      el('rect', { x: -w / 2, y: -46, width: w, height: 28, rx: 14, class: 'glo-v-pill' }, g);
      scritta(g, 0, -27, testo, 'glo-v-txt');
      const t0 = performance.now();
      (function giro(t) {
        if (annullato()) { g.remove(); return fine(); }
        const k = Math.min(1, (t - t0) / ms);
        const e = k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
        const p = c.luce.getPointAtLength(e * c.L);
        g.setAttribute('transform', `translate(${p.x},${p.y})`);
        c.luce.style.strokeDashoffset = c.L * (1 - e);
        if (k < 1) requestAnimationFrame(giro);
        else { g.remove(); fine(); }
      })(t0);
    });
  }

  const SCENE = {
    api: {
      intro: 'Due programmi che si parlano: il bot dei reel e Gemini. Premi ▶ per cominciare.',
      costruisci(tel) {
        const B = tel
          ? { W: 360, H: 680, tu: { x: 70, y: 14, w: 220, h: 78 }, bot: { x: 70, y: 226, w: 220, h: 78 }, gem: { x: 10, y: 438, w: 160, h: 78 }, drive: { x: 190, y: 438, w: 160, h: 78 }, ia: { x: 70, y: 588, w: 220, h: 78 } }
          : { W: 960, H: 372, tu: { x: 20, y: 82, w: 200, h: 96 }, bot: { x: 380, y: 82, w: 200, h: 96 }, gem: { x: 740, y: 82, w: 200, h: 96 }, drive: { x: 380, y: 262, w: 200, h: 96 }, ia: { x: 740, y: 262, w: 200, h: 96 } };
        svg.setAttribute('viewBox', `0 0 ${B.W} ${B.H}`);
        const r = { n: {} };
        r.n.tu = riquadro(svg, B.tu, 'Tu', 'su Telegram');
        r.n.bot = riquadro(svg, B.bot, 'Il bot', 'un piccolo programma');
        r.n.gem = riquadro(svg, B.gem, 'Gemini', 'sa guardare i video');
        r.n.drive = riquadro(svg, B.drive, 'Drive', 'il cervello centrale');
        r.n.ia = riquadro(svg, B.ia, 'Gli assistenti', 'Claude e ChatGPT Codex');
        const s = tel ? { x: B.gem.x + B.gem.w / 2 - 34, y: B.gem.y - 17, w: 68, h: 34 } : { x: B.gem.x - 34, y: B.gem.y + B.gem.h / 2 - 17, w: 68, h: 34 };
        if (tel) {
          r.p1 = collegamento(curva(aggancio(B.tu, 'b', 30), aggancio(B.bot, 't', 30), -55), 'il link del reel');
          r.p2 = collegamento(curva(aggancio(B.bot, 'b', -60), [s.x + s.w / 2 + 14, s.y], -20), '');
          r.p3 = collegamento(curva([s.x + s.w / 2 - 14, s.y], aggancio(B.bot, 'b', -90), -20), '');
          r.p4 = collegamento(curva(aggancio(B.bot, 't', -30), aggancio(B.tu, 'b', -30), -55), 'la risposta');
          r.p5 = collegamento(curva(aggancio(B.bot, 'b', 70), aggancio(B.drive, 't'), 0), 'il riassunto');
          r.p6 = collegamento(curva(aggancio(B.drive, 'b'), aggancio(B.ia, 't', 60), 0), 'lo leggono');
        } else {
          r.p1 = collegamento(curva(aggancio(B.tu, 'r', -14), aggancio(B.bot, 'l', -14), -46), 'il link del reel');
          r.p2 = collegamento(curva(aggancio(B.bot, 'r', -14), [s.x, s.y + s.h / 2 - 8], -46), 'la richiesta');
          r.p3 = collegamento(curva([s.x, s.y + s.h / 2 + 8], aggancio(B.bot, 'r', 14), -46), 'la risposta');
          r.p4 = collegamento(curva(aggancio(B.bot, 'l', 14), aggancio(B.tu, 'r', 14), -46), 'la risposta');
          r.p5 = collegamento(curva(aggancio(B.bot, 'b'), aggancio(B.drive, 't'), 0), 'il riassunto');
          r.p6 = collegamento(curva(aggancio(B.drive, 'r'), aggancio(B.ia, 'l'), 0), 'lo leggono');
        }
        r.sp = el('g', { class: 'glo-sp' }, svg);
        el('rect', { x: s.x, y: s.y, width: s.w, height: s.h, rx: 9 }, r.sp);
        scritta(r.sp, s.x + s.w / 2, s.y + s.h / 2 + 5.5, 'API', '');
        return r;
      },
      azzera(r) { Object.values(r.n).forEach(n => stato(n, '')); [r.p1, r.p2, r.p3, r.p4, r.p5, r.p6].forEach(spegni); r.sp.classList.remove('acceso', 'lampeggia'); },
      passi: [
        { testo: 'Mandi al bot, su Telegram, il link di un reel.',
          fine(r) { stato(r.n.tu, 'fatto'); accendi(r.p1); stato(r.n.bot, 'attivo'); },
          async anima(r, a) { stato(r.n.tu, 'attivo'); await viaggio(r.p1, 'il link del reel', 1500, a); } },
        { testo: 'Il bot è un piccolo programma: non sa guardare i video. Allora va allo sportello di Gemini. Questo sportello è l’API.',
          fine(r) { r.sp.classList.remove('lampeggia'); r.sp.classList.add('acceso'); },
          async anima(r, a) { r.sp.classList.add('lampeggia'); await attendi(1500, a); } },
        { testo: 'Allo sportello il bot consegna il video, con una richiesta già scritta e sempre uguale: «Guarda questo video e riassumilo».',
          fine(r) { stato(r.n.bot, 'fatto'); accendi(r.p2); stato(r.n.gem, 'attivo'); },
          async anima(r, a) { await viaggio(r.p2, 'la richiesta', 1300, a); } },
        { testo: 'Gemini guarda il video e lascia la risposta allo sportello.',
          fine(r) { stato(r.n.gem, 'fatto'); accendi(r.p3); stato(r.n.bot, 'attivo'); },
          async anima(r, a) { await attendi(1100, a); await viaggio(r.p3, 'la risposta', 1300, a); } },
        { testo: 'Il bot ti manda la risposta su Telegram.',
          fine(r) { accendi(r.p4); stato(r.n.tu, 'fatto'); },
          async anima(r, a) { await viaggio(r.p4, 'la risposta', 1500, a); } },
        { testo: 'Poi salva il riassunto su Drive, nel cervello centrale: la cartella con le cose che gli assistenti devono ricordare. Qui non serve uno sportello: è un normale file.',
          fine(r) { stato(r.n.bot, 'fatto'); accendi(r.p5); stato(r.n.drive, 'fatto'); },
          async anima(r, a) { stato(r.n.drive, 'attivo'); await viaggio(r.p5, 'il riassunto', 1400, a); } },
        { testo: 'Claude e ChatGPT Codex sanno che lì ci sono le novità. Quando chiedo di uno strumento visto in un reel, leggono quel file.',
          fine(r) { accendi(r.p6); stato(r.n.ia, 'fatto'); },
          async anima(r, a) { stato(r.n.ia, 'attivo'); await viaggio(r.p6, 'lo leggono', 1300, a); } },
        { testo: 'Nessuno ha aperto Gemini. I passaggi li ha scritti una volta per tutte chi ha fatto il bot, e ora si ripetono da soli a ogni reel.',
          fine() {}, async anima(r, a) { await attendi(200, a); } }
      ]
    },

    mcp: {
      intro: 'Un assistente che usa un programma: Claude e Cinema 4D. Premi ▶ per cominciare.',
      costruisci(tel) {
        const B = tel
          ? { W: 360, H: 740, tu: { x: 70, y: 14, w: 220, h: 74 }, cl: { x: 70, y: 196, w: 220, h: 78 }, pan: { x: 20, y: 344, w: 320, h: 214 }, c4: { x: 70, y: 594, w: 220, h: 140 } }
          : { W: 960, H: 420, tu: { x: 10, y: 160, w: 160, h: 96 }, cl: { x: 300, y: 160, w: 170, h: 96 }, pan: { x: 560, y: 30, w: 180, h: 360 }, c4: { x: 790, y: 105, w: 160, h: 210 } };
        svg.setAttribute('viewBox', `0 0 ${B.W} ${B.H}`);
        const r = { n: {}, pulsanti: [] };
        r.n.tu = riquadro(svg, B.tu, 'Tu', 'scrivi in chat');
        r.n.cl = riquadro(svg, B.cl, 'Claude', 'l’assistente');

        // Il pannello MCP: i pulsanti che Cinema 4D mette a disposizione dell'assistente.
        const p = B.pan;
        r.pan = el('g', { class: 'glo-pan' }, svg);
        el('rect', { x: p.x, y: p.y, width: p.w, height: p.h, rx: 14, class: 'glo-pan-box' }, r.pan);
        scritta(r.pan, p.x + p.w / 2, p.y + 30, 'Pannello MCP', 'glo-n-tit glo-pan-tit');
        scritta(r.pan, p.x + p.w / 2, p.y + 52, 'i pulsanti di Cinema 4D', 'glo-n-sub');
        ['Crea oggetto', 'Crea luce', 'Sposta', 'Cambia colore', 'Fai il render'].forEach((nome, i) => {
          const q = tel
            ? { x: p.x + 14 + (i % 2) * 151, y: p.y + 64 + Math.floor(i / 2) * 50, w: 141, h: 40 }
            : { x: p.x + 14, y: p.y + 74 + i * 56, w: p.w - 28, h: 44 };
          const g = el('g', { class: 'glo-btn' }, r.pan);
          el('rect', { x: q.x, y: q.y, width: q.w, height: q.h, rx: 10 }, g);
          scritta(g, q.x + q.w / 2, q.y + q.h / 2 + 5, nome, '');
          r.pulsanti.push(g);
        });

        // Cinema 4D con una piccola scena: un divano e la luce che comparirà.
        const c = B.c4;
        r.n.c4 = el('g', { class: 'glo-n' }, svg);
        el('rect', { x: c.x, y: c.y, width: c.w, height: c.h, rx: 14, class: 'glo-n-box' }, r.n.c4);
        scritta(r.n.c4, c.x + c.w / 2, c.y + 32, 'Cinema 4D', 'glo-n-tit');
        const pav = c.y + c.h - 30;
        el('line', { x1: c.x + 16, y1: pav, x2: c.x + c.w - 16, y2: pav, class: 'glo-pav' }, r.n.c4);
        // Divano visto di fronte: schienale, seduta e due braccioli.
        const dx = c.x + c.w - 104;
        el('rect', { x: dx + 8, y: pav - 46, width: 72, height: 28, rx: 6, class: 'glo-divano' }, r.n.c4);
        el('rect', { x: dx + 6, y: pav - 22, width: 76, height: 18, rx: 4, class: 'glo-divano' }, r.n.c4);
        el('rect', { x: dx - 4, y: pav - 34, width: 14, height: 34, rx: 5, class: 'glo-divano' }, r.n.c4);
        el('rect', { x: dx + 78, y: pav - 34, width: 14, height: 34, rx: 5, class: 'glo-divano' }, r.n.c4);
        r.luce = el('g', { class: 'glo-luce' }, r.n.c4);
        const ly = tel ? pav - 50 : pav - 70;
        el('circle', { cx: c.x + 40, cy: ly, r: tel ? 28 : 34, class: 'glo-luce-alone' }, r.luce);
        el('circle', { cx: c.x + 40, cy: ly, r: 9, class: 'glo-luce-punto' }, r.luce);

        if (tel) {
          r.m1 = collegamento(curva(aggancio(B.tu, 'b', 30), aggancio(B.cl, 't', 30), -55), 'la richiesta');
          r.m4 = collegamento(curva(aggancio(B.cl, 't', -30), aggancio(B.tu, 'b', -30), -55), 'la risposta');
          r.m2 = collegamento(curva(aggancio(B.cl, 'b'), aggancio(p, 't'), 0), 'sceglie');
          r.m3 = collegamento(curva(aggancio(p, 'b'), aggancio(c, 't'), 0), '');
        } else {
          r.m1 = collegamento(curva(aggancio(B.tu, 'r', -14), aggancio(B.cl, 'l', -14), -46), 'la richiesta');
          r.m4 = collegamento(curva(aggancio(B.cl, 'l', 14), aggancio(B.tu, 'r', 14), -46), 'la risposta');
          r.m2 = collegamento(curva(aggancio(B.cl, 'r'), aggancio(p, 'l'), 0), 'sceglie');
          r.m3 = collegamento(curva(aggancio(p, 'r'), aggancio(c, 'l'), 0), '');
        }
        return r;
      },
      azzera(r) {
        Object.values(r.n).forEach(n => stato(n, ''));
        [r.m1, r.m2, r.m3, r.m4].forEach(spegni);
        r.pan.classList.remove('mostra');
        r.pulsanti.forEach(b => b.classList.remove('scelto', 'tocca'));
        r.luce.classList.remove('accesa');
      },
      passi: [
        { testo: 'Scrivi a Claude, in chat: «Metti una luce calda a sinistra del divano».',
          fine(r) { stato(r.n.tu, 'fatto'); accendi(r.m1); stato(r.n.cl, 'attivo'); },
          async anima(r, a) { stato(r.n.tu, 'attivo'); await viaggio(r.m1, 'la richiesta', 1500, a); } },
        { testo: 'Da solo, Claude non può usare i programmi del tuo computer. Ma Cinema 4D gli ha dato un pannello di pulsanti, ognuno con il suo nome. Questo pannello è l’MCP.',
          fine(r) { r.pan.classList.add('mostra'); r.pulsanti.forEach(b => b.classList.remove('tocca')); },
          async anima(r, a) {
            r.pan.classList.add('mostra');
            await attendi(500, a);
            for (const b of r.pulsanti) { b.classList.add('tocca'); await attendi(260, a); b.classList.remove('tocca'); }
          } },
        { testo: 'Claude legge i nomi e sceglie i pulsanti che servono: Crea luce, Sposta, Cambia colore.',
          fine(r) { accendi(r.m2); [1, 2, 3].forEach(i => r.pulsanti[i].classList.add('scelto')); },
          async anima(r, a) {
            await viaggio(r.m2, 'sceglie', 1000, a);
            for (const i of [1, 2, 3]) { r.pulsanti[i].classList.add('scelto'); await attendi(550, a); }
          } },
        { testo: 'Cinema 4D esegue i comandi: a sinistra del divano compare una luce calda.',
          fine(r) { accendi(r.m3); stato(r.n.c4, 'fatto'); r.luce.classList.add('accesa'); },
          async anima(r, a) {
            stato(r.n.c4, 'attivo');
            await viaggio(r.m3, 'i comandi', 900, a);
            r.luce.classList.add('accesa');
            await attendi(1000, a);
          } },
        { testo: 'Claude ti risponde: «Fatto, ho messo la luce». Tu non hai aperto Cinema 4D.',
          fine(r) { stato(r.n.cl, 'fatto'); accendi(r.m4); stato(r.n.tu, 'fatto'); },
          async anima(r, a) { await viaggio(r.m4, 'Fatto!', 1500, a); } },
        { testo: 'Nessuno aveva scritto questi passaggi prima. È stato Claude a scegliere i pulsanti, in base a quello che hai chiesto.',
          fine() {}, async anima(r, a) { await attendi(200, a); } }
      ]
    }
  };

  let nomeScena = 'api', scena = SCENE.api, rif = null, layout = '';
  let indice = -1, inGioco = false, turno = 0;

  function costruisci() {
    svg.replaceChildren();
    rif = scena.costruisci(layout === 'tel');
  }
  function aggiornaComandi() {
    btnPlay.textContent = inGioco ? '❚❚ Pausa' : (indice >= scena.passi.length - 1 ? '▶ Rivedi' : '▶ Play');
    btnPlay.setAttribute('aria-label', inGioco ? 'Metti in pausa' : 'Avvia l’animazione');
    btnIndietro.disabled = indice <= 0;
    btnAvanti.disabled = indice >= scena.passi.length - 1;
  }
  async function vai(i, anima = true) {
    const mio = ++turno;
    const annullato = () => mio !== turno;
    indice = i;
    scena.azzera(rif);
    for (let k = 0; k < i; k++) scena.passi[k].fine(rif);
    const passo = scena.passi[i];
    passoTesto.textContent = i < 0 ? '' : `${i + 1} / ${scena.passi.length}`;
    fraseTesto.textContent = i < 0 ? scena.intro : passo.testo;
    aggiornaComandi();
    if (i < 0) return;
    if (anima && !ridotto()) await passo.anima(rif, annullato);
    if (annullato()) return;
    passo.fine(rif);
    if (!inGioco) return;
    if (i >= scena.passi.length - 1) { inGioco = false; aggiornaComandi(); return; }
    await attendi(Math.min(10000, 2200 + passo.testo.length * 55), annullato);
    if (!annullato() && inGioco) vai(i + 1);
  }

  btnPlay.addEventListener('click', () => {
    if (inGioco) { inGioco = false; aggiornaComandi(); return; }
    inGioco = true;
    if (indice < 0 || indice >= scena.passi.length - 1) vai(0);
    else vai(indice + 1);
  });
  btnAvanti.addEventListener('click', () => { inGioco = false; vai(Math.min(indice + 1, scena.passi.length - 1)); });
  btnIndietro.addEventListener('click', () => { inGioco = false; vai(Math.max(indice - 1, 0)); });
  btnDaCapo.addEventListener('click', () => { inGioco = false; vai(-1); });
  btnScene.forEach(b => b.addEventListener('click', () => {
    if (b.dataset.scena === nomeScena) return;
    nomeScena = b.dataset.scena;
    scena = SCENE[nomeScena];
    btnScene.forEach(x => x.setAttribute('aria-pressed', String(x === b)));
    inGioco = false;
    turno++;
    if (layout) { costruisci(); vai(-1); }
  }));

  // Si disegna quando la scheda diventa visibile, e si ridisegna se cambia la larghezza (computer o telefono).
  new ResizeObserver(() => {
    const w = tela.clientWidth;
    if (!w) return;
    const nuovo = w < 600 ? 'tel' : 'desk';
    if (nuovo === layout) return;
    const primaVolta = !layout;
    layout = nuovo;
    costruisci();
    vai(primaVolta ? -1 : indice, false);
  }).observe(tela);
})();
