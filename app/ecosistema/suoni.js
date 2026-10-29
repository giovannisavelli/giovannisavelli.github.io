// Suoni dell'ecosistema: una musichetta allegra e piccoli effetti, tutti sintetizzati qui con Web Audio.
// Nessun file audio e nessun brano copiato: melodia, accordi e timbri (marimba, carillon, basso, legnetti) sono scritti in questo file.
// Il browser lascia partire l'audio solo dopo un tocco o un clic: init() va chiamato da un gesto della persona.

const BPM = 112, BEAT = 60 / BPM, BAR = BEAT * 4, E8 = BEAT / 2;
const mtof = m => 440 * Math.pow(2, (m - 69) / 12);

// ---------- strumenti: ognuno mette una nota nel grafo che riceve ----------
const noiseCache = new WeakMap();
function noise(c) {
  if (!noiseCache.has(c)) {
    const b = c.createBuffer(1, c.sampleRate, c.sampleRate), d = b.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    noiseCache.set(c, b);
  }
  return noiseCache.get(c);
}
const pan = (c, out, p) => { if (!c.createStereoPanner) return out; const n = c.createStereoPanner(); n.pan.value = p; n.connect(out); return n; };
function voice(c, out, t, vel, attack, decay) {
  const g = c.createGain(); g.connect(out);
  g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vel, t + attack);
  g.gain.exponentialRampToValueAtTime(.0005, t + attack + decay);
  return g;
}
function osc(c, type, f, dest, t, end) { const o = c.createOscillator(); o.type = type; o.frequency.setValueAtTime(f, t); o.connect(dest); o.start(t); o.stop(end); return o; }
// marimba / kalimba: la nota e un armonico alto che si spegne subito (il colpo del martelletto)
function mallet(c, out, t, midi, vel = .3, dec = .5) {
  const f = mtof(midi);
  osc(c, 'sine', f, voice(c, out, t, vel, .003, dec), t, t + dec + .05);
  osc(c, 'sine', f * 3.98, voice(c, out, t, vel * .22, .002, dec * .18), t, t + dec * .2 + .05);
  const n = c.createBufferSource(); n.buffer = noise(c);
  const hp = c.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 3500;
  n.connect(hp); hp.connect(voice(c, out, t, vel * .18, .001, .012)); n.start(t, Math.random() * .5, .03);
}
// carillon: suono più lungo e cristallino
function bell(c, out, t, midi, vel = .2, dec = 1.1) {
  const f = mtof(midi);
  osc(c, 'sine', f, voice(c, out, t, vel, .004, dec), t, t + dec + .05);
  osc(c, 'sine', f * 2, voice(c, out, t, vel * .18, .003, dec * .5), t, t + dec * .5 + .05);
  osc(c, 'sine', f * 3, voice(c, out, t, vel * .1, .002, dec * .3), t, t + dec * .3 + .05);
  osc(c, 'sine', f * 5.4, voice(c, out, t, vel * .1, .002, dec * .12), t, t + dec * .12 + .05);
}
function bass(c, out, t, midi, vel = .3) {
  const lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 650; lp.connect(out);
  osc(c, 'triangle', mtof(midi), voice(c, lp, t, vel, .012, .42), t, t + .5);
}
function pad(c, out, t, notes, vel = .03, len = BAR) {
  const lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 1000; lp.connect(out);
  const g = c.createGain(); g.connect(lp);
  g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vel, t + .35);
  g.gain.setValueAtTime(vel, t + len - .3); g.gain.linearRampToValueAtTime(0, t + len + .2);
  for (const m of notes) for (const det of [-5, 5]) { const o = osc(c, 'triangle', mtof(m), g, t, t + len + .25); o.detune.value = det; }
}
function shaker(c, out, t, vel = .04) {
  const s = c.createBufferSource(); s.buffer = noise(c);
  const hp = c.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 6500;
  s.connect(hp); hp.connect(voice(c, out, t, vel, .004, .035)); s.start(t, Math.random() * .5, .06);
}
function wood(c, out, t, vel = .05, f = 950) {
  const o = c.createOscillator(); o.type = 'triangle';
  o.frequency.setValueAtTime(f, t); o.frequency.exponentialRampToValueAtTime(f * .72, t + .04);
  o.connect(voice(c, out, t, vel, .001, .045)); o.start(t); o.stop(t + .08);
}

// ---------- la canzone: 16 battute in fa maggiore, strofa con melodia e ritornello ad arpeggi ----------
const CH = { F: [41, [57, 60, 65]], Dm: [38, [57, 62, 65]], Bb: [46, [58, 62, 65]], C: [48, [55, 60, 64]], Am: [45, [57, 60, 64]], Gm: [43, [55, 58, 62]] };
const PROG = ['F', 'C', 'Bb', 'C', 'F', 'Bb', 'C', 'F', 'Bb', 'F', 'C', 'Dm', 'Bb', 'F', 'Gm', 'C'];
// melodia della strofa: [ottavo d'inizio, nota, durata in ottavi]
const MEL = [
  [[0, 69, 2], [2, 72, 2], [4, 74, 1], [5, 72, 1], [6, 69, 2]],
  [[0, 74, 3], [3, 72, 1], [4, 69, 2], [6, 67, 2]],
  [[0, 65, 2], [2, 67, 2], [4, 69, 2], [6, 70, 1], [7, 72, 1]],
  [[0, 74, 4], [4, 72, 2], [6, 67, 2]],
  [[0, 69, 2], [2, 72, 2], [4, 77, 2], [6, 76, 1], [7, 74, 1]],
  [[0, 74, 3], [3, 72, 1], [4, 70, 2], [6, 69, 2]],
  [[0, 74, 2], [2, 72, 1], [3, 70, 1], [4, 69, 2], [6, 67, 2]],
  [[0, 72, 2], [2, 69, 1], [3, 67, 1], [4, 65, 4]],
];
const ARP = [0, 1, 2, 3, 2, 1, 2, 3];
function scheduleBar(c, G, t0, bar) {
  const i = bar % 16, [root, notes] = CH[PROG[i]], out = G.music, verse = i < 8;
  const at = s => t0 + s * E8 + (s % 2 ? E8 * .08 : 0);      // un filo di swing sugli ottavi in levare
  const L = pan(c, out, -.35), R = pan(c, out, .3), RR = pan(c, out, .45), LL = pan(c, out, -.45);
  pad(c, out, t0, notes, .011);
  bass(c, out, at(0), root, .24); bass(c, out, at(4), root + 7, .18);
  if (i % 4 === 3) bass(c, out, at(6), root + 5, .14);
  for (const s of [1, 3, 5, 7]) shaker(c, RR, at(s), s === 3 || s === 7 ? .05 : .03);
  for (const s of verse ? [2, 6] : [2, 6, 7]) wood(c, LL, at(s), .06, s === 7 ? 1250 : 950);
  if (verse) {
    // carillon in alto e marimba un'ottava sotto: il timbro allegro dei giochi «cozy»
    for (const [s, m, len] of MEL[i]) { bell(c, R, at(s), m + 12, .24, Math.min(.9, len * E8 + .25)); mallet(c, L, at(s), m, .11, .28); }
    for (const s of [2, 6]) notes.forEach((m, k) => mallet(c, L, at(s), m, .1 - k * .015, .22));
  } else {
    const tones = [...notes, notes[0] + 12];
    ARP.forEach((k, s) => mallet(c, s % 2 ? R : L, at(s), tones[k] + 12, s % 2 ? .14 : .19, .26));
    if (i % 2 === 0) bell(c, R, at(0), notes[2] + 24, .1, 1.1);
    if (i % 2 === 1) bell(c, R, at(4), notes[1] + 24, .08, .9);
  }
}

// ---------- effetti ----------
const FX = {
  pop(c, out, t, p = 0) {                      // un piccolo «pop» che sale: un dato parte
    const f = 620 * Math.pow(2, p / 12), o = c.createOscillator(); o.type = 'sine';
    o.frequency.setValueAtTime(f, t); o.frequency.exponentialRampToValueAtTime(f * 1.6, t + .07);
    o.connect(voice(c, out, t, .26, .003, .09)); o.start(t); o.stop(t + .12);
  },
  ding(c, out, t, p = 0) { bell(c, out, t, 79 + p, .16, .7); bell(c, out, t + .09, 86 + p, .14, .9); },   // un dato arriva
  sparkle(c, out, t) {                         // l'idea: la lampadina che si accende
    [72, 76, 79, 84, 88, 91].forEach((m, k) => bell(c, out, t + k * .055, m + 12, .1, .8));
  },
  fanfare(c, out, t) {                         // approvato!
    [72, 76, 79].forEach((m, k) => mallet(c, out, t + k * .09, m + 12, .26, .4));
    [72, 76, 79, 84].forEach(m => bell(c, out, t + .3, m + 12, .1, 1.5));
    bell(c, out, t + .42, 100, .06, 1);
  },
  whoosh(c, out, t, dur = .7) {                // qualcosa vola via
    const s = c.createBufferSource(); s.buffer = noise(c); s.loop = true;
    const bp = c.createBiquadFilter(); bp.type = 'bandpass'; bp.Q.value = 1.4;
    bp.frequency.setValueAtTime(350, t); bp.frequency.exponentialRampToValueAtTime(2600, t + dur * .55); bp.frequency.exponentialRampToValueAtTime(900, t + dur);
    const g = c.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.34, t + dur * .5); g.gain.linearRampToValueAtTime(0, t + dur);
    s.connect(bp); bp.connect(g); g.connect(out); s.start(t); s.stop(t + dur + .05);
  },
  brain(c, out, t) {                           // il cervello centrale riceve e si illumina
    const o = c.createOscillator(); o.type = 'sine';
    o.frequency.setValueAtTime(110, t); o.frequency.exponentialRampToValueAtTime(165, t + .4);
    o.connect(voice(c, out, t, .2, .06, .7)); o.start(t); o.stop(t + .9);
    bell(c, out, t + .12, 81, .1, 1.2); bell(c, out, t + .24, 88, .08, 1.2);
  },
  step(c, out, t) { wood(c, out, t, .07, 520 + Math.random() * 120); },           // un passo
  bloop(c, out, t) {                           // Gemini guarda
    for (const d of [0, .16]) {
      const o = c.createOscillator(); o.type = 'sine';
      o.frequency.setValueAtTime(420, t + d); o.frequency.exponentialRampToValueAtTime(240, t + d + .12);
      o.connect(voice(c, out, t + d, .14, .005, .13)); o.start(t + d); o.stop(t + d + .16);
    }
  },
  tick(c, out, t) { mallet(c, out, t, 96, .05, .08); },                            // una riga nel Diario
  // un «parlottio» di sillabe, come i personaggi dei videogiochi: accompagna il testo che compare
  babble(c, out, t, text = '', base = 470) {
    const n = Math.max(4, Math.min(24, Math.round(text.length / 5)));
    let tt = t;
    for (let k = 0; k < n; k++) {
      const f = base * Math.pow(2, ((Math.random() - .5) * 6 + (k === n - 1 ? -2 : 0)) / 12);
      const g = voice(c, out, tt, .15, .004, .05);
      const bp = c.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = f * 2.4; bp.Q.value = 2.5; bp.connect(g);
      const o1 = c.createOscillator(); o1.type = 'square'; o1.frequency.setValueAtTime(f, tt); o1.frequency.linearRampToValueAtTime(f * .92, tt + .05);
      o1.connect(bp); o1.start(tt); o1.stop(tt + .07);
      const o2 = c.createOscillator(); o2.type = 'triangle'; o2.frequency.setValueAtTime(f, tt); o2.connect(g); o2.start(tt); o2.stop(tt + .07);
      tt += .062 + Math.random() * .025;
    }
  },
};

// ---------- il mixer ----------
function impulse(c, sec) {                       // un riverbero piccolo e morbido, calcolato (nessuna registrazione)
  const len = Math.floor(c.sampleRate * sec), b = c.createBuffer(2, len, c.sampleRate);
  for (let ch = 0; ch < 2; ch++) {
    const d = b.getChannelData(ch); let lp = 0;
    for (let i = 0; i < len; i++) { lp = lp * .6 + (Math.random() * 2 - 1) * .4; d[i] = lp * Math.pow(1 - i / len, 2.6); }
  }
  return b;
}
function graph(c, dest) {
  const master = c.createGain(); master.gain.value = 1;
  const comp = c.createDynamicsCompressor();
  comp.threshold.value = -18; comp.ratio.value = 3; comp.attack.value = .004; comp.release.value = .25;
  master.connect(comp); comp.connect(dest);
  const rev = c.createConvolver(); rev.buffer = impulse(c, 1.6);
  const wet = c.createGain(); wet.gain.value = .13; rev.connect(wet); wet.connect(master);
  const music = c.createGain(); music.gain.value = 1; music.connect(master); music.connect(rev);
  const sfx = c.createGain(); sfx.gain.value = .85; sfx.connect(master); sfx.connect(rev);
  return { master, music, sfx };
}

// ---------- controllo dal resto della pagina ----------
let ctx = null, G = null, enabled = true, nextBar = 0, bar = 0, mode = 'free';
const last = {};
export function init() {
  if (ctx) { if (ctx.state === 'suspended') ctx.resume(); return; }
  const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
  ctx = new AC(); G = graph(ctx, ctx.destination);
  G.master.gain.value = enabled ? 1 : 0;
  setMode(mode);
  nextBar = ctx.currentTime + .15;
  setInterval(() => {
    if (ctx.state !== 'running') return;
    if (nextBar < ctx.currentTime) nextBar = ctx.currentTime + .05;     // dopo una pausa non recupera le battute perse
    while (nextBar < ctx.currentTime + .5) { scheduleBar(ctx, G, nextBar, bar++); nextBar += BAR; }
  }, 60);
}
export function setEnabled(b) { enabled = b; if (ctx) G.master.gain.setTargetAtTime(b ? 1 : 0, ctx.currentTime, .08); }
export function setAwake(v) { if (ctx) (v ? ctx.resume() : ctx.suspend()).catch(() => {}); }
export function setMode(m) { mode = m; if (ctx) G.music.gain.setTargetAtTime(m === 'story' ? .6 : 1, ctx.currentTime, .5); }
// play('ding', 2) suona un effetto; gap = tempo minimo (s) fra due effetti uguali, per non fare chiasso
export function play(name, arg, gap = 0) {
  if (!ctx || !enabled || ctx.state !== 'running') return;
  const now = ctx.currentTime;
  if (gap && last[name] && now - last[name] < gap) return;
  last[name] = now;
  FX[name](ctx, G.sfx, now + .01, arg);
}

// ---------- per controllare i suoni: li disegna in un file WAV senza suonarli ----------
export async function renderWav(kind = 'musica') {
  const sr = 44100, sec = kind === 'musica' ? BAR * 16 + 2 : 14;
  const c = new OfflineAudioContext(2, Math.ceil(sr * sec), sr), g = graph(c, c.destination);
  if (kind === 'musica') for (let b = 0; b < 16; b++) scheduleBar(c, g, .1 + b * BAR, b);
  else {
    const list = [['pop', 0], ['ding', 0], ['sparkle'], ['fanfare'], ['whoosh', .7], ['brain'], ['step'], ['bloop'], ['tick'], ['babble', 'Giovanni ha un’idea. È in pausa sul divano, con la TV accesa.']];
    list.forEach(([n, a], k) => FX[n](c, g.sfx, .2 + k * 1.3, a));
  }
  const buf = await c.startRendering();
  const n = buf.length, data = new DataView(new ArrayBuffer(44 + n * 4));
  const w = (o, s) => [...s].forEach((ch, k) => data.setUint8(o + k, ch.charCodeAt(0)));
  w(0, 'RIFF'); data.setUint32(4, 36 + n * 4, true); w(8, 'WAVEfmt '); data.setUint32(16, 16, true); data.setUint16(20, 1, true);
  data.setUint16(22, 2, true); data.setUint32(24, sr, true); data.setUint32(28, sr * 4, true); data.setUint16(32, 4, true); data.setUint16(34, 16, true);
  w(36, 'data'); data.setUint32(40, n * 4, true);
  const L = buf.getChannelData(0), R = buf.getChannelData(1);
  for (let i = 0; i < n; i++) { data.setInt16(44 + i * 4, Math.max(-1, Math.min(1, L[i])) * 32767, true); data.setInt16(46 + i * 4, Math.max(-1, Math.min(1, R[i])) * 32767, true); }
  return new Blob([data.buffer], { type: 'audio/wav' });
}
