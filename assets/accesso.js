/* Password di cortesia dei corsi. Non è una protezione vera: il sito è pubblico. */
(function () {
  const CORSI = {
    photoshop:    { nome: 'Photoshop', sotto: 'Interior Design', colore: '#38bdf8',
                    impronta: 'fa45a391cf472b1bfc0c8acf23f6652445621a03f6ca7b6b970791d60abc11d7', s: '3f0c14270e2406153e122e' },
    ia:           { nome: 'Intelligenza Artificiale', sotto: 'Interior e Product Design', colore: '#77e7b7',
                    impronta: 'bf0c7a2bf147d4f4065173806734b0eb201f3462b84e6d29dab6f50f5b423ac1', s: '3f100a201522091e39133811' },
    rendering:    { nome: 'Rendering 3D', sotto: 'Cinema 4D e Corona', colore: '#9d7bff',
                    impronta: '05119de43df417a4f2d580dee4430109794b2b43cc199902df81049262f4919b', s: '27101a200e220315340f3804' },
    modellazione: { nome: 'Modellazione 3D', sotto: 'Product Design', colore: '#fb923c',
                    impronta: 'fd7bbcab293170806c5570a6ba70562b9e9550291513a0df5f5f80058f9fee8f', s: '3a1018210e2209182519390c' }
  };

  const script = document.currentScript;
  const idCorso = script && script.dataset.corso;
  const corso = CORSI[idCorso];
  const radice = document.documentElement;
  const chiaveDi = id => 'aant-accesso-' + id;

  function leggi(memoria, chiave) { try { return memoria.getItem(chiave); } catch (e) { return null; } }
  function aperto(id) {
    const k = chiaveDi(id), giusta = CORSI[id].impronta;
    return leggi(localStorage, k) === giusta || leggi(sessionStorage, k) === giusta;
  }

  // Toglie la schermata della password, se c'è.
  function apriPagina() {
    const pagina = document.querySelector('.accesso');
    if (!pagina && !radice.classList.contains('accesso-chiuso')) return;
    radice.classList.remove('accesso-chiuso');
    if (pagina) pagina.remove();
    // Le scene 3D e le schede ricalcolano le misure ora che la pagina è visibile.
    window.dispatchEvent(new Event('resize'));
  }

  /* ---------- Pannello ---------- */
  const IMPRONTA_P = '3bd2dc1b24c3e150adc5817dead87a6a46a698aaf40f25da0fe6a67f06045155';
  const premuti = new Set();
  let chiaveP = null;
  async function hash(t) {
    const h = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(t));
    return Array.from(new Uint8Array(h), b => b.toString(16).padStart(2, '0')).join('');
  }
  addEventListener('keydown', async e => {
    premuti.add(e.code);
    if (premuti.size !== 3) { chiaveP = null; return; }
    const t = [...premuti].sort().join('|');
    chiaveP = (await hash(t)) === IMPRONTA_P ? t : null;
  }, true);
  addEventListener('keyup', e => { premuti.delete(e.code); chiaveP = null; }, true);
  addEventListener('blur', () => { premuti.clear(); chiaveP = null; });
  addEventListener('pointerdown', function (e) {
    if (!chiaveP) return;
    e.preventDefault(); e.stopPropagation();
    const k = chiaveP;
    premuti.clear(); chiaveP = null;
    pannelloDocente(k);
  }, true);

  // Link docente della frase a gruppi: mai nel codice del sito, solo nel browser di chi l'ha incollato.
  const FRASE_K = 'aant-frase-docente';
  const FRASE_RE = /^https:\/\/aant-frase-a-gruppi\.aant-la-prossima-parola\.workers\.dev\/teacher\?key=[\w%-]{24,}$/;
  function frase() { try { const v = localStorage.getItem(FRASE_K); return v && FRASE_RE.test(v) ? v : ''; } catch (e) { return ''; } }
  function dimenticaFrase() { try { localStorage.removeItem(FRASE_K); } catch (e) {} }

  // Statistiche (Umami): «umami.disabled» nel browser = questo dispositivo non viene contato.
  function escluso() { try { return !!localStorage.getItem('umami.disabled'); } catch (e) { return false; } }
  function cambiaConteggio() {
    try { if (escluso()) localStorage.removeItem('umami.disabled'); else localStorage.setItem('umami.disabled', '1'); } catch (e) {}
    return escluso();
  }
  if (location.hash === '#non-contarmi') {
    const ora = cambiaConteggio();
    history.replaceState(null, '', location.pathname + location.search);
    setTimeout(() => alert(ora ? 'Fatto: le visite da questo dispositivo non vengono più contate.' : 'Fatto: le visite da questo dispositivo vengono di nuovo contate.'), 300);
  }

  function svela(hex, k) {
    let out = '';
    for (let i = 0; i < hex.length; i += 2) out += String.fromCharCode(parseInt(hex.substr(i, 2), 16) ^ k.charCodeAt((i / 2) % k.length));
    return out;
  }

  function pannelloDocente(k) {
    if (document.querySelector('.docente')) return;
    if (!document.getElementById('docente-stile')) {
      const s = document.createElement('style');
      s.id = 'docente-stile';
      // nomi con il prefisso dc- e regole esplicite: così lo stile della pagina (home, plastico) non lo cambia
      s.textContent = `
        .docente { position: fixed; inset: 0; z-index: 2147483600; display: grid; place-items: center; padding: 20px;
          background: rgba(5,6,8,.78); backdrop-filter: blur(6px); color: #edf1ed; font-family: Geist, 'Segoe UI', Arial, sans-serif; text-align: left; }
        .docente, .docente * { box-sizing: border-box; }
        .docente .dc-box { position: relative; width: min(480px, 100%); max-height: calc(100vh - 40px); overflow: auto; padding: 26px 24px 22px;
          border: 1px solid rgba(220,230,224,.22); border-radius: 18px; background: #0c0e10; box-shadow: 0 30px 80px rgba(0,0,0,.55); }
        .docente .dc-etichetta { display: block; position: static; opacity: 1; transform: none; margin: 0; color: #9fb0a7;
          font: 600 10px/1.4 'Geist Mono', ui-monospace, monospace; letter-spacing: .1em; text-transform: uppercase; }
        .docente .dc-titolo { display: block; margin: 6px 0 16px; padding: 0; color: #edf1ed; font: 650 24px/1.2 Geist, 'Segoe UI', Arial, sans-serif; letter-spacing: -.01em; }
        .docente .dc-lista { list-style: none; margin: 0 0 18px; padding: 0; display: grid; gap: 8px; }
        .docente .dc-lista li { display: grid; grid-template-columns: 1fr auto; gap: 2px 12px; align-items: center; margin: 0; padding: 10px 12px;
          border: 1px solid rgba(220,230,224,.12); border-left: 3px solid var(--c); border-radius: 10px; }
        .docente .dc-nome { font-size: 14px; color: #d5ded8; }
        .docente .dc-pw { grid-column: 1; justify-self: start; display: inline-flex; align-items: baseline; gap: 10px; min-height: 0; margin: 0; padding: 2px 0;
          border: 0; border-radius: 0; background: none; color: var(--c); font: 600 17px 'Geist Mono', ui-monospace, monospace; letter-spacing: .04em;
          cursor: pointer; overflow-wrap: anywhere; text-align: left; }
        .docente .dc-pw small { color: #9fb0a7; font: 500 11px Geist, Arial, sans-serif; letter-spacing: 0; }
        .docente .dc-pw:focus-visible { outline: 2px solid var(--c); outline-offset: 3px; }
        .docente .dc-stato { grid-row: 1 / 3; grid-column: 2; font-size: 12px; color: #9fb0a7; text-align: right; }
        .docente .dc-stato.si { color: #77e7b7; }
        .docente .dc-azioni { display: grid; gap: 8px; position: static; opacity: 1; transform: none; filter: none; }
        .docente .dc-azioni button { width: 100%; min-height: 46px; margin: 0; padding: 0 16px; border: 1px solid rgba(220,230,224,.28); border-radius: 999px;
          background: transparent; color: #edf1ed; font: 600 15px Geist, Arial, sans-serif; cursor: pointer; transform: none; }
        .docente .dc-azioni button.dc-primo { background: #edf1ed; color: #0b1210; border-color: transparent; }
        .docente .dc-azioni button:hover { border-color: #edf1ed; }
        .docente .dc-sotto { margin: 4px 0 12px; font-size: 18px; }
        .docente .dc-frase { margin: 0 0 18px; }
        .docente .dc-link { display: block; box-sizing: border-box; width: 100%; min-height: 44px; margin: 0 0 8px; padding: 0 14px; border: 1px solid rgba(220,230,224,.28);
          border-radius: 12px; background: rgba(255,255,255,.04); color: #edf1ed; font: 400 13px Geist, Arial, sans-serif; }
        .docente .dc-link:focus-visible { outline: 2px solid #77e7b7; outline-offset: 2px; }
        .docente .dc-errore { margin-top: 8px; color: #ff9b8a; }
        .docente .dc-nota { margin: 14px 0 0; font-size: 12.5px; line-height: 1.5; color: #9fb0a7; }
      `;
      document.head.appendChild(s);
    }
    const p = document.createElement('div');
    p.className = 'docente';
    p.setAttribute('role', 'dialog');
    p.setAttribute('aria-label', 'Pannello del docente');
    const ids = Object.keys(CORSI);
    const parole = ids.map(id => svela(CORSI[id].s, k));
    const nascosta = '••••••••••';
    function disegna() {
      p.innerHTML = `
        <div class="dc-box">
          <span class="dc-etichetta">Solo per il docente</span>
          <strong class="dc-titolo">Password dei corsi</strong>
          <ul class="dc-lista">${ids.map((id, i) => {
            const c = CORSI[id], si = aperto(id);
            return `<li style="--c:${c.colore}"><span class="dc-nome">${c.nome}</span>
              <button type="button" class="dc-pw" data-i="${i}" aria-pressed="false" aria-label="Mostra la password di ${c.nome}">${nascosta}<small>clic per vedere</small></button>
              <span class="dc-stato${si ? ' si' : ''}">${si ? 'aperto qui' : 'chiuso qui'}</span></li>`;
          }).join('')}</ul>
          <strong class="dc-titolo dc-sotto">Frase a gruppi</strong>
          ${frase() ? `<div class="dc-azioni dc-frase">
            <button type="button" class="dc-primo" data-fai="frase">Apri la frase a gruppi · docente ↗</button>
            <button type="button" data-fai="dimentica">Dimentica il link su questo dispositivo</button>
          </div>` : `<div class="dc-frase">
            <input type="url" class="dc-link" placeholder="Incolla qui il link docente" aria-label="Link docente della frase a gruppi" autocomplete="off" spellcheck="false">
            <div class="dc-azioni"><button type="button" data-fai="salva">Ricorda il link su questo dispositivo</button></div>
            <p class="dc-nota dc-errore" hidden>Non è il link docente della frase a gruppi.</p>
          </div>`}
          <div class="dc-azioni">
            <button type="button" class="dc-primo" data-fai="apri">Apri tutti i corsi su questo dispositivo</button>
            <button type="button" data-fai="chiudi">Richiudi tutti i corsi su questo dispositivo</button>
            <button type="button" data-fai="conta">${escluso() ? 'Statistiche: questo dispositivo NON è contato · ricontalo' : 'Statistiche: questo dispositivo è contato · escludilo'}</button>
            <button type="button" data-fai="esci">Chiudi il pannello</button>
          </div>
          <p class="dc-nota">Sul PC dell'aula, prima di andare via, usa «Richiudi»: altrimenti gli studenti trovano tutti i corsi aperti. «Richiudi» dimentica anche il link della frase a gruppi.</p>
        </div>`;
    }
    disegna();
    p.addEventListener('click', function (e) {
      const pw = e.target.closest('.dc-pw');
      if (pw) {
        const vista = pw.getAttribute('aria-pressed') === 'true';
        pw.setAttribute('aria-pressed', String(!vista));
        pw.innerHTML = vista ? `${nascosta}<small>clic per vedere</small>` : `${parole[pw.dataset.i]}<small>clic per nascondere</small>`;
        return;
      }
      const fai = e.target.closest('button') && e.target.closest('button').dataset.fai;
      if (e.target === p || fai === 'esci') return chiudiPannello();
      if (fai === 'apri') {
        Object.keys(CORSI).forEach(id => { try { localStorage.setItem(chiaveDi(id), CORSI[id].impronta); } catch (err) {} });
        chiudiPannello();
        apriPagina();
      }
      if (fai === 'conta') { cambiaConteggio(); disegna(); return; }
      if (fai === 'frase') { window.open(frase(), '_blank', 'noopener'); return chiudiPannello(); }
      if (fai === 'dimentica') { dimenticaFrase(); disegna(); return; }
      if (fai === 'salva') {
        const v = (p.querySelector('.dc-link').value || '').trim();
        if (!FRASE_RE.test(v)) { p.querySelector('.dc-errore').hidden = false; return; }
        try { localStorage.setItem(FRASE_K, v); } catch (err) {}
        disegna();
        return;
      }
      if (fai === 'chiudi') {
        dimenticaFrase();
        Object.keys(CORSI).forEach(id => {
          try { localStorage.removeItem(chiaveDi(id)); } catch (err) {}
          try { sessionStorage.removeItem(chiaveDi(id)); } catch (err) {}
        });
        // Se sei dentro un corso, la pagina si richiude subito.
        if (corso) location.reload(); else disegna();
      }
    });
    function tasto(e) { if (e.key === 'Escape') chiudiPannello(); }
    function chiudiPannello() { p.remove(); removeEventListener('keydown', tasto); }
    addEventListener('keydown', tasto);
    document.body.appendChild(p);
  }

  /* ---------- Schermata della password del corso ---------- */
  if (!corso || aperto(idCorso)) return;
  const chiave = chiaveDi(idCorso);

  radice.classList.add('accesso-chiuso');
  const stile = document.createElement('style');
  stile.textContent = `
    html.accesso-chiuso body { overflow: hidden !important; }
    html.accesso-chiuso body > *:not(.accesso):not(.docente) { visibility: hidden !important; }
    .accesso { position: fixed; inset: 0; z-index: 2147483000; display: grid; place-items: center; padding: 20px;
      background: radial-gradient(ellipse at 50% 30%, color-mix(in srgb, ${corso.colore} 14%, #0a0b0d) 0%, #0a0b0d 62%);
      color: #edf1ed; font-family: Geist, 'Segoe UI', Arial, sans-serif; }
    .accesso form { width: min(420px, 100%); padding: 30px 28px 26px; border: 1px solid color-mix(in srgb, ${corso.colore} 40%, transparent);
      border-radius: 18px; background: rgba(12,14,16,.92); box-shadow: 0 30px 80px rgba(0,0,0,.45); }
    .accesso .marchio { display: inline-grid; place-items: center; width: 40px; height: 40px; border: 1px solid ${corso.colore};
      color: ${corso.colore}; font: 700 13px/1 'Geist Mono', ui-monospace, monospace; letter-spacing: .04em; }
    .accesso .etichetta { margin: 22px 0 6px; color: ${corso.colore}; font: 600 10px/1.4 'Geist Mono', ui-monospace, monospace; letter-spacing: .1em; text-transform: uppercase; }
    .accesso h1 { margin: 0; font-size: 28px !important; line-height: 1.15 !important; letter-spacing: -.02em !important; font-weight: 650; overflow-wrap: anywhere; max-width: 100%; }
    .accesso form, .accesso form * { box-sizing: border-box; }
    .accesso p, .accesso label, .accesso .etichetta { overflow-wrap: anywhere; }
    .accesso p { margin: 10px 0 20px; color: #b8c4bd; font-size: 15px; line-height: 1.5; }
    .accesso label.campo { display: block; margin-bottom: 7px; font-size: 13px; color: #d5ded8; }
    .accesso input[type=password], .accesso input[type=text] { width: 100%; box-sizing: border-box; min-height: 50px; padding: 0 14px;
      border: 1px solid rgba(220,230,224,.28); border-radius: 12px; background: #0d1012; color: #fff; font: 500 17px Geist, Arial, sans-serif; }
    .accesso input:focus { outline: 2px solid ${corso.colore}; outline-offset: 1px; border-color: transparent; }
    .accesso .ricordami { display: flex; align-items: center; gap: 10px; margin: 14px 0 18px; font-size: 14px; color: #d5ded8; cursor: pointer; }
    .accesso .ricordami input { width: 20px; height: 20px; accent-color: ${corso.colore}; }
    .accesso button { width: 100%; min-height: 50px; border: 0; border-radius: 999px; background: ${corso.colore}; color: #0b1210;
      font: 700 15px Geist, Arial, sans-serif; cursor: pointer; }
    .accesso .errore { min-height: 20px; margin: 10px 0 0; color: #ff9b9b; font-size: 14px; }
    .accesso .tutti { display: inline-block; margin-top: 16px; color: #b8c4bd; font-size: 13px; }
    .accesso .tutti:hover { color: ${corso.colore}; }
  `;
  document.head.appendChild(stile);

  async function impronta(testo) {
    const dati = new TextEncoder().encode(testo.trim().toLowerCase());
    const hash = await crypto.subtle.digest('SHA-256', dati);
    return Array.from(new Uint8Array(hash), b => b.toString(16).padStart(2, '0')).join('');
  }

  function mostra() {
    const pagina = document.createElement('div');
    pagina.className = 'accesso';
    pagina.innerHTML = `
      <form novalidate>
        <span class="marchio" aria-hidden="true">GS</span>
        <div class="etichetta">${corso.sotto}</div>
        <h1>${corso.nome}</h1>
        <p>Inserisci la password del corso. Te la dà il docente a lezione.</p>
        <label class="campo" for="accesso-password">Password del corso</label>
        <input id="accesso-password" type="password" autocomplete="current-password" autocapitalize="off" autocorrect="off" spellcheck="false" required>
        <label class="ricordami"><input type="checkbox" checked> Ricordami su questo dispositivo</label>
        <button type="submit">Entra</button>
        <div class="errore" role="alert" aria-live="assertive"></div>
        <a class="tutti" href="${new URL('../', script.src).href}">← Tutti i corsi</a>
      </form>`;
    document.body.appendChild(pagina);
    const campo = pagina.querySelector('#accesso-password');
    const ricorda = pagina.querySelector('.ricordami input');
    const errore = pagina.querySelector('.errore');
    campo.focus();
    pagina.querySelector('form').addEventListener('submit', async function (evento) {
      evento.preventDefault();
      if ((await impronta(campo.value)) !== corso.impronta) {
        errore.textContent = 'Password non corretta. Riprova.';
        campo.select();
        return;
      }
      try { (ricorda.checked ? localStorage : sessionStorage).setItem(chiave, corso.impronta); } catch (e) { /* senza memoria si entra lo stesso, per questa volta */ }
      apriPagina();
    });
  }

  if (document.body) mostra();
  else document.addEventListener('DOMContentLoaded', mostra, { once: true });
})();
