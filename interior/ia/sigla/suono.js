// Suono della sigla: tutto sintetizzato con Web Audio, nessun file audio né brano copiato.
// Un bordone grave che si apre piano, tamburi lenti, campane metalliche sulle parole della citazione.
// Durante gli spezzoni del trailer la musica si abbassa e si sente l'audio del film.
window.Suono = (() => {
  let ctx = null, master, musica, bordone = [], filtro, battito = 0;
  const ora = () => ctx.currentTime;

  function init() {
    if (ctx) return;
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    master = ctx.createDynamicsCompressor();
    master.threshold.value = -14; master.ratio.value = 3;
    master.connect(ctx.destination);
    musica = ctx.createGain(); musica.gain.value = 0; musica.connect(master);
    // riverbero corto fatto di rumore che si spegne: dà spazio a campane e tamburi
    const len = ctx.sampleRate * 2.6, ir = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let c = 0; c < 2; c++) { const d = ir.getChannelData(c); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3.2); }
    const conv = ctx.createConvolver(); conv.buffer = ir;
    const wet = ctx.createGain(); wet.gain.value = .32; conv.connect(wet); wet.connect(master);
    Suono._eco = conv;
  }
  const eco = () => Suono._eco;

  // il bordone: due note gravi (re e la) leggermente stonate fra loro, dietro un filtro che si apre
  function avviaBordone() {
    filtro = ctx.createBiquadFilter(); filtro.type = 'lowpass'; filtro.frequency.value = 180; filtro.Q.value = 4;
    filtro.connect(musica); filtro.connect(eco());
    [[36.71, -7], [36.71, 6], [55, -4], [73.42, 3]].forEach(([f, det]) => {
      const o = ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.value = f; o.detune.value = det;
      const g = ctx.createGain(); g.gain.value = .16; o.connect(g); g.connect(filtro); o.start(); bordone.push(o);
    });
    filtro.frequency.setTargetAtTime(520, ora(), 14);
  }
  // tamburo: un seno che scende di tono, più un colpo di rumore
  function tamburo(t, forza = 1) {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.frequency.setValueAtTime(120, t); o.frequency.exponentialRampToValueAtTime(42, t + .35);
    g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(.9 * forza, t + .008); g.gain.exponentialRampToValueAtTime(.0001, t + 1.1);
    o.connect(g); g.connect(musica); g.connect(eco()); o.start(t); o.stop(t + 1.2);
    rumore(t, .12, 900, .25 * forza, musica);
  }
  function rumore(t, dur, freq, vol, dove = master) {
    const b = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * dur), ctx.sampleRate), d = b.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    const s = ctx.createBufferSource(); s.buffer = b;
    const f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = freq; f.Q.value = .8;
    const g = ctx.createGain(); g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
    s.connect(f); f.connect(g); g.connect(dove); s.start(t);
  }
  // ritmo lento: due colpi, una pausa (70 battiti al minuto)
  function avviaRitmo() {
    const passo = 60 / 70; let t = ora() + .2, i = 0;
    battito = setInterval(() => {
      while (t < ora() + .6) { if (i % 4 === 0) tamburo(t, 1); else if (i % 4 === 1) tamburo(t, .55); t += passo; i++; }
    }, 150);
  }
  // campana metallica: parziali non armoniche, come una lastra di metallo
  function campanaA(t, f, vol = .12) {
    [1, 2.76, 5.4, 8.93].forEach((k, j) => {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.type = 'sine'; o.frequency.value = f * k;
      g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(vol / (j + 1), t + .005); g.gain.exponentialRampToValueAtTime(.0001, t + 2.4 / (j + 1));
      o.connect(g); g.connect(master); g.connect(eco()); o.start(t); o.stop(t + 2.5);
    });
  }
  const SCALA = [293.66, 349.23, 440, 523.25, 587.33, 698.46];   // re minore, senza melodie conosciute
  let nota = 0;

  return {
    avvia() {
      init(); ctx.resume();
      clearInterval(battito); bordone.forEach(o => { try { o.stop(); } catch (e) {} }); bordone = [];
      musica.gain.cancelScheduledValues(ora()); musica.gain.setValueAtTime(musica.gain.value, ora()); musica.gain.linearRampToValueAtTime(.55, ora() + 4);
      avviaBordone(); nota = 0;
      setTimeout(avviaRitmo, 6000);
    },
    tic(alto = 1) { if (!ctx) return; const t = ora(), o = ctx.createOscillator(), g = ctx.createGain();
      o.type = 'square'; o.frequency.value = 1800 * alto; g.gain.setValueAtTime(.025, t); g.gain.exponentialRampToValueAtTime(.0001, t + .05);
      o.connect(g); g.connect(master); o.start(t); o.stop(t + .06); },
    colpo() { if (!ctx) return; tamburo(ora(), 1.3); rumore(ora(), 1.6, 300, .2); },
    monta() { if (!ctx) return; const t = ora();
      // un soffio che sale mentre la polvere si raccoglie, poi il bordone si apre
      const b = ctx.createBuffer(1, ctx.sampleRate * 3, ctx.sampleRate), d = b.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      const s = ctx.createBufferSource(); s.buffer = b; const f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.Q.value = 2;
      f.frequency.setValueAtTime(200, t); f.frequency.exponentialRampToValueAtTime(3200, t + 2.8);
      const g = ctx.createGain(); g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(.18, t + 2.4); g.gain.exponentialRampToValueAtTime(.0001, t + 3);
      s.connect(f); f.connect(g); g.connect(master); g.connect(eco()); s.start(t);
      filtro && filtro.frequency.setTargetAtTime(900, t + 2.5, 3);
      setTimeout(() => campanaA(ora(), 146.83, .18), 2600); },
    campana() { if (!ctx) return; campanaA(ora(), SCALA[nota++ % SCALA.length], .07); },
    sfalda() { if (!ctx) return; const t = ora();
      for (let i = 0; i < 14; i++) rumore(t + i * .09, .25, 2000 + Math.random() * 5000, .05);
      filtro && filtro.frequency.setTargetAtTime(300, t, 2); campanaA(t + .4, 587.33, .1); campanaA(t + 1.1, 440, .08); },
    // pausa della sigla (barra spaziatrice): ferma il tempo dell'audio, quindi anche ritmo e suoni programmati
    pausa(on) { if (!ctx) return; on ? ctx.suspend() : ctx.resume(); },
    abbassa(si) { if (!ctx) return; musica.gain.setTargetAtTime(si ? .12 : .55, ora(), .4); },
    // le palette dell'anno che girano: tanti piccoli scatti secchi
    anno() { if (!ctx) return; const t = ora();
      for (let i = 0; i < 9; i++) rumore(t + i * .045 + Math.random() * .012, .03, 2400 + Math.random() * 1600, .09); },
    // cyberpsicosi: scariche elettriche e un ronzio che sale, per qualche secondo
    glitch(sec = 4) { if (!ctx) return; const t = ora();
      for (let i = 0; i < sec * 7; i++) rumore(t + Math.random() * sec, .04 + Math.random() * .1, 500 + Math.random() * 5000, .06 + Math.random() * .1);
      const o = ctx.createOscillator(), g = ctx.createGain(); o.type = 'sawtooth';
      o.frequency.setValueAtTime(55, t); o.frequency.exponentialRampToValueAtTime(220, t + sec);
      g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(.07, t + sec * .8); g.gain.exponentialRampToValueAtTime(.0001, t + sec);
      o.connect(g); g.connect(master); o.start(t); o.stop(t + sec + .1); },
    // il Ghost che prende il controllo: un accordo pulito che si apre
    calma() { if (!ctx) return; const t = ora();
      filtro && filtro.frequency.setTargetAtTime(1200, t, 1.5);
      [293.66, 440, 587.33].forEach((f, i) => campanaA(t + i * .35, f, .1)); },
    finale() { if (!ctx) return; const t = ora(); clearInterval(battito);
      tamburo(t, 1.4); campanaA(t, 293.66, .16); campanaA(t + .02, 440, .1);
      musica.gain.setTargetAtTime(0, t + 2, 2.5);
      setTimeout(() => { bordone.forEach(o => { try { o.stop(); } catch (e) {} }); bordone = []; }, 12000); },
  };
})();
