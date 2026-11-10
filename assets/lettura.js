/* =====================================================================
   Lettura · PROVA (non pubblicata). Versione 2 del 10/11/2026, dopo la revisione dei 7 «pesci rossi».
   Va nel <head>, SENZA defer: legge subito le scelte salvate e le mette su <html>, così la pagina
   si apre già come la vuole chi legge (niente «salto» all'apertura).
   Le scelte restano solo in questo browser (localStorage, chiave «aant-lettura», con v: 1).
   I caratteri Atkinson e Lexend arrivano da Google Fonts SOLO quando qualcuno li sceglie
   (nel progetto: file dentro il sito, da decidere).
   ===================================================================== */
(function () {
  const CHIAVE = 'aant-lettura';
  const VERSIONE = 1;
  const AMMESSI = { spazio: ['1', '2'], grandezza: ['1', '2', '3'], carattere: ['verdana', 'atkinson', 'lexend'], maiuscole: ['no'], fermo: ['si', 'no'] };
  const MINIMI = { 1: 18, 2: 20, 3: 23 };
  const FONT = {
    atkinson: 'https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible+Next:wght@400;600;700&display=swap',
    lexend: 'https://fonts.googleapis.com/css2?family=Lexend:wght@400;600;700&display=swap',
  };
  const html = document.documentElement;
  const sistemaFermo = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let salvabile = true;

  // legge e CONTROLLA le scelte: un valore sconosciuto (vecchio, rovinato) si ignora
  function leggi() {
    let s = {};
    try { s = JSON.parse(localStorage.getItem(CHIAVE)) || {}; } catch (e) { salvabile = false; }
    const pulito = {};
    Object.keys(AMMESSI).forEach(k => { if (AMMESSI[k].includes(s[k])) pulito[k] = s[k]; });
    return pulito;
  }
  function salva(s) {
    try { localStorage.setItem(CHIAVE, JSON.stringify({ v: VERSIONE, ...s })); salvabile = true; } catch (e) { salvabile = false; }
  }
  let stato = leggi();
  // «meno movimento» parte acceso se il telefono o il computer lo chiedono già, finché uno non lo spegne
  const fermoAttivo = () => stato.fermo ? stato.fermo === 'si' : sistemaFermo;

  function caricaFont(nome) {
    if (!FONT[nome] || document.querySelector(`link[data-lt-font="${nome}"]`)) return;
    const l = document.createElement('link');
    l.rel = 'stylesheet'; l.href = FONT[nome]; l.dataset.ltFont = nome;
    document.head.appendChild(l);
  }

  // grandezza: segna i testi da leggere più piccoli del minimo, misurati SENZA la Lettura
  const TESTI = 'p, li, dd, dt, td, th, blockquote, figcaption, summary, label, small';
  const ESCLUSI = '[aria-hidden="true"], .accesso, .lt-pannello, .flap, .grande-firma, .marchio';
  function segnaPiccoli() {
    if (!document.body) return;
    document.querySelectorAll('[data-lt-piccolo]').forEach(el => el.removeAttribute('data-lt-piccolo'));
    if (!stato.grandezza) return;
    const min = MINIMI[stato.grandezza];
    html.removeAttribute('data-lt-grandezza');
    const da = [...document.querySelectorAll(TESTI)].filter(el => !el.closest(ESCLUSI) && parseFloat(getComputedStyle(el).fontSize) < min);
    html.setAttribute('data-lt-grandezza', stato.grandezza);
    da.forEach(el => el.setAttribute('data-lt-piccolo', ''));
  }

  function applica() {
    ['spazio', 'grandezza', 'carattere', 'maiuscole'].forEach(k => { if (stato[k]) html.setAttribute('data-lt-' + k, stato[k]); else html.removeAttribute('data-lt-' + k); });
    if (fermoAttivo()) html.setAttribute('data-lt-fermo', 'si'); else html.removeAttribute('data-lt-fermo');
    const attiva = ['spazio', 'grandezza', 'carattere', 'maiuscole'].some(k => stato[k]) || (stato.fermo === 'si' && !sistemaFermo);
    if (attiva) html.setAttribute('data-lt-attiva', ''); else html.removeAttribute('data-lt-attiva');
    caricaFont(stato.carattere);
    segnaPiccoli();
    // per gli effetti in JavaScript (tabellone, plastico, scene): nel progetto lo legge Studio.fermo()
    window.LetturaFermo = fermoAttivo;
  }
  applica();

  // Verdana non c'è su Android: si confronta la larghezza di una parola con quella del carattere di riserva
  function haVerdana() {
    const c = document.createElement('canvas').getContext('2d');
    const prova = f => { c.font = `20px ${f}`; return c.measureText('mmmmmlliiWWW').width; };
    return prova('Verdana, monospace') !== prova('monospace');
  }

  function costruisci() {
    const menu = document.querySelector('.top .menu');
    if (!menu || document.querySelector('.lt-bottone')) return;
    const bottone = document.createElement('button');
    bottone.type = 'button'; bottone.className = 'lt-bottone';
    bottone.title = 'Lettura facilitata: spazi, grandezza e carattere del testo';
    bottone.setAttribute('aria-haspopup', 'dialog'); bottone.setAttribute('aria-expanded', 'false');
    bottone.setAttribute('aria-label', 'Lettura facilitata: scegli spazi, grandezza e carattere del testo');
    bottone.innerHTML = '<b aria-hidden="true">Aa</b><span class="lt-parola">Lettura facilitata</span><span class="lt-pallino" aria-hidden="true"></span>';
    menu.prepend(bottone);

    const caratteri = [['', 'Del sito'], ...(haVerdana() ? [['verdana', 'Verdana']] : []), ['atkinson', 'Atkinson'], ['lexend', 'Lexend']];
    const radio = (nome, voci) => voci.map(([v, t]) => `<label class="lt-scelta"><input type="radio" name="lt-${nome}" value="${v}"><span>${t}</span></label>`).join('');
    const p = document.createElement('div');
    p.className = 'lt-pannello'; p.hidden = true;
    p.setAttribute('role', 'dialog'); p.setAttribute('aria-label', 'Lettura facilitata');
    p.innerHTML = `
      <div class="lt-testa"><strong>Lettura facilitata</strong>
        <div class="lt-testa-azioni"><button type="button" class="lt-ripristina">Togli tutte le scelte</button><button type="button" class="lt-chiudi" aria-label="Chiudi">×</button></div></div>
      <p class="lt-avviso" aria-live="polite"></p>
      <p class="lt-esempio">Così leggerai gli appunti: prova le scelte qui sotto e guarda come cambia questa frase.</p>
      <fieldset class="lt-gruppo"><legend>Spazio<small>Più distanza fra le lettere, le parole e le righe.</small></legend>
        <div class="lt-scelte">${radio('spazio', [['', 'Normale'], ['1', 'Ampio'], ['2', 'Molto ampio']])}</div></fieldset>
      <fieldset class="lt-gruppo"><legend>Grandezza del testo</legend>
        <div class="lt-scelte">${radio('grandezza', [['', '<span class="lt-a" style="font-size:14px">A</span>'], ['1', '<span class="lt-a" style="font-size:17px">A</span>'], ['2', '<span class="lt-a" style="font-size:20px">A</span>'], ['3', '<span class="lt-a" style="font-size:24px">A</span>']])}</div></fieldset>
      <details class="lt-altro"><summary>Altre scelte</summary>
        <fieldset class="lt-gruppo"><legend>Carattere<small>Non esiste un carattere giusto per tutti: provali e tieni quello che leggi meglio.</small></legend>
          <div class="lt-scelte">${radio('carattere', caratteri)}</div></fieldset>
        <label class="lt-interruttore"><span>Niente scritte tutte maiuscole<small>Le piccole scritte come «SECONDA LEZIONE» diventano normali, e il corsivo diventa dritto.</small></span><input type="checkbox" name="lt-maiuscole"></label>
        <label class="lt-interruttore"><span>Meno movimento<small>Ferma le animazioni e l'effetto grana sullo sfondo.</small></span><input type="checkbox" name="lt-fermo"></label>
      </details>
      <p class="lt-nota">Le scelte valgono in tutto il sito, solo su questo dispositivo. Disegni e animazioni restano come sono.</p>`;
    document.body.appendChild(p);
    const avviso = p.querySelector('.lt-avviso');
    const ripristina = p.querySelector('.lt-ripristina');

    const aggiornaPannello = () => {
      ['spazio', 'grandezza', 'carattere'].forEach(k => p.querySelectorAll(`input[name="lt-${k}"]`).forEach(i => { i.checked = i.value === (stato[k] || ''); }));
      p.querySelector('input[name="lt-maiuscole"]').checked = stato.maiuscole === 'no';
      p.querySelector('input[name="lt-fermo"]').checked = fermoAttivo();
      ripristina.disabled = !Object.keys(stato).length;
      if (!salvabile) avviso.textContent = 'Questo browser non salva le scelte: valgono solo per la pagina aperta.';
    };
    p.addEventListener('change', e => {
      const k = e.target.name.replace('lt-', '');
      if (['spazio', 'grandezza', 'carattere'].includes(k)) { if (e.target.value) stato[k] = e.target.value; else delete stato[k]; }
      if (k === 'maiuscole') { if (e.target.checked) stato.maiuscole = 'no'; else delete stato.maiuscole; }
      if (k === 'fermo') stato.fermo = e.target.checked ? 'si' : 'no';
      salva(stato); applica(); avviso.textContent = ''; aggiornaPannello();
    });
    ripristina.addEventListener('click', () => {
      stato = {}; salva(stato); applica(); aggiornaPannello();
      avviso.textContent = 'Fatto: è tutto come prima.';
    });
    const apri = si => {
      p.hidden = !si; bottone.setAttribute('aria-expanded', String(si));
      if (si) { aggiornaPannello(); p.querySelector('.lt-chiudi').focus(); } else bottone.focus();
    };
    bottone.addEventListener('click', () => apri(p.hidden));
    p.querySelector('.lt-chiudi').addEventListener('click', () => apri(false));
    document.addEventListener('keydown', e => {
      if (p.hidden) return;
      if (e.key === 'Escape') apri(false);
      if (e.key === 'Tab') {               // il cursore della tastiera resta dentro il pannello
        const f = [...p.querySelectorAll('button, input, summary')].filter(x => !x.disabled && x.offsetParent !== null);
        if (!f.length) return;
        if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
        else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
      }
    });
    // un'altra scheda del sito ha cambiato le scelte: si allinea anche questa
    addEventListener('storage', e => { if (e.key === CHIAVE) { stato = leggi(); applica(); aggiornaPannello(); } });
  }

  // la testata la scrive studio.js (prima che la pagina sia pronta): si costruisce il pannello quando c'è
  const avvia = () => { costruisci(); segnaPiccoli(); };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', avvia); else avvia();
  addEventListener('load', () => { costruisci(); segnaPiccoli(); });   // pagine dove studio.js arriva in fondo
  let attesa; addEventListener('resize', () => { clearTimeout(attesa); attesa = setTimeout(segnaPiccoli, 200); });
})();
