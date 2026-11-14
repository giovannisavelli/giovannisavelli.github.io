/* Password «di cortesia» per le pagine dei corsi.
 *
 * Non è una protezione vera: il sito è pubblico su GitHub Pages e chi sa leggere il codice
 * arriva lo stesso ai contenuti. Serve solo a tenere ogni classe nel suo corso.
 *
 * Si usa così, nel <head> della pagina del corso, prima degli altri script:
 *   <script src="../../assets/accesso.js" data-corso="photoshop"></script>
 * Senza data-corso (per esempio nella home) non chiude niente: attiva solo il pannello del docente.
 *
 * PANNELLO DEL DOCENTE: tieni premuti insieme i tasti Q, W ed E e fai clic in un punto qualsiasi
 * della pagina. Mostra le password e permette di aprire (o richiudere) tutti i corsi su quel dispositivo.
 *
 * PER CAMBIARE UNA PASSWORD servono due righe, «impronta» e «parola»:
 *   python -c "import hashlib,base64; p='nuovapassword'; print(hashlib.sha256(p.encode()).hexdigest()); print(base64.b64encode(p[::-1].encode()).decode())"
 * La prima riga è l'impronta, la seconda la parola (la password al contrario, in base64: così non si
 * legge a colpo d'occhio nel codice). Password sempre minuscola. Chi aveva la vecchia la dovrà reinserire.
 */
(function () {
  const CORSI = {
    photoshop:    { nome: 'Photoshop', sotto: 'Interior Design', colore: '#38bdf8',
                    impronta: 'fa45a391cf472b1bfc0c8acf23f6652445621a03f6ca7b6b970791d60abc11d7', parola: 'ZW5vbGNvcmJtaXQ=' },
    ia:           { nome: 'Intelligenza Artificiale', sotto: 'Interior e Product Design', colore: '#77e7b7',
                    impronta: 'bf0c7a2bf147d4f4065173806734b0eb201f3462b84e6d29dab6f50f5b423ac1', parola: 'dHNvaGdsaWllc3V0' },
    rendering:    { nome: 'Rendering 3D', sotto: 'Cinema 4D e Corona', colore: '#9d7bff',
                    impronta: '05119de43df417a4f2d580dee4430109794b2b43cc199902df81049262f4919b', parola: 'YXNzZWxmaXJlY3Vs' },
    modellazione: { nome: 'Modellazione 3D', sotto: 'Product Design', colore: '#fb923c',
                    impronta: 'fd7bbcab293170806c5570a6ba70562b9e9550291513a0df5f5f80058f9fee8f', parola: 'aXJldGFsaXJkYXVx' }
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

  /* ---------- Pannello del docente: Q + W + E e clic ---------- */
  const premuti = new Set();
  addEventListener('keydown', e => premuti.add(e.code), true);
  addEventListener('keyup', e => premuti.delete(e.code), true);
  addEventListener('blur', () => premuti.clear());
  addEventListener('pointerdown', function (e) {
    if (!(premuti.has('KeyQ') && premuti.has('KeyW') && premuti.has('KeyE'))) return;
    e.preventDefault(); e.stopPropagation();
    premuti.clear();
    pannelloDocente();
  }, true);

  function pannelloDocente() {
    if (document.querySelector('.docente')) return;
    if (!document.getElementById('docente-stile')) {
      const s = document.createElement('style');
      s.id = 'docente-stile';
      s.textContent = `
        .docente { position: fixed; inset: 0; z-index: 2147483600; display: grid; place-items: center; padding: 20px;
          background: rgba(5,6,8,.78); backdrop-filter: blur(6px); color: #edf1ed; font-family: Geist, 'Segoe UI', Arial, sans-serif; }
        .docente, .docente * { box-sizing: border-box; }
        .docente .box { width: min(480px, 100%); padding: 26px 24px 22px; border: 1px solid rgba(220,230,224,.22);
          border-radius: 18px; background: #0c0e10; box-shadow: 0 30px 80px rgba(0,0,0,.55); }
        .docente .etichetta { color: #9fb0a7; font: 600 10px/1.4 'Geist Mono', ui-monospace, monospace; letter-spacing: .1em; text-transform: uppercase; }
        .docente h2 { margin: 6px 0 16px; font-size: 24px; line-height: 1.2; font-weight: 650; letter-spacing: -.01em; }
        .docente ul { list-style: none; margin: 0 0 18px; padding: 0; display: grid; gap: 8px; }
        .docente li { display: grid; grid-template-columns: 1fr auto; gap: 2px 12px; align-items: center; padding: 10px 12px;
          border: 1px solid rgba(220,230,224,.12); border-left: 3px solid var(--c); border-radius: 10px; }
        .docente .nome { font-size: 14px; color: #d5ded8; }
        .docente .pw { grid-column: 1; font: 600 17px 'Geist Mono', ui-monospace, monospace; color: var(--c); user-select: all; overflow-wrap: anywhere; }
        .docente .stato { grid-row: 1 / 3; grid-column: 2; font-size: 12px; color: #9fb0a7; text-align: right; }
        .docente .stato.si { color: #77e7b7; }
        .docente .azioni { display: grid; gap: 8px; }
        .docente button { width: 100%; min-height: 46px; border: 1px solid rgba(220,230,224,.28); border-radius: 999px;
          background: transparent; color: #edf1ed; font: 600 15px Geist, Arial, sans-serif; cursor: pointer; }
        .docente button.primo { background: #edf1ed; color: #0b1210; border-color: transparent; }
        .docente button:hover { border-color: #edf1ed; }
        .docente .nota { margin: 14px 0 0; font-size: 12.5px; line-height: 1.5; color: #9fb0a7; }
      `;
      document.head.appendChild(s);
    }
    const p = document.createElement('div');
    p.className = 'docente';
    p.setAttribute('role', 'dialog');
    p.setAttribute('aria-label', 'Pannello del docente');
    function disegna() {
      p.innerHTML = `
        <div class="box">
          <div class="etichetta">Solo per il docente</div>
          <h2>Password dei corsi</h2>
          <ul>${Object.keys(CORSI).map(id => {
            const c = CORSI[id], si = aperto(id);
            const pw = atob(c.parola).split('').reverse().join('');
            return `<li style="--c:${c.colore}"><span class="nome">${c.nome}</span><span class="pw">${pw}</span>
              <span class="stato${si ? ' si' : ''}">${si ? 'aperto qui' : 'chiuso qui'}</span></li>`;
          }).join('')}</ul>
          <div class="azioni">
            <button class="primo" data-fai="apri">Apri tutti i corsi su questo dispositivo</button>
            <button data-fai="chiudi">Richiudi tutti i corsi su questo dispositivo</button>
            <button data-fai="esci">Chiudi il pannello</button>
          </div>
          <p class="nota">Sul PC dell'aula, prima di andare via, usa «Richiudi»: altrimenti gli studenti trovano tutti i corsi aperti.</p>
        </div>`;
    }
    disegna();
    p.addEventListener('click', function (e) {
      const fai = e.target.closest('button') && e.target.closest('button').dataset.fai;
      if (e.target === p || fai === 'esci') return chiudiPannello();
      if (fai === 'apri') {
        Object.keys(CORSI).forEach(id => { try { localStorage.setItem(chiaveDi(id), CORSI[id].impronta); } catch (err) {} });
        chiudiPannello();
        apriPagina();
      }
      if (fai === 'chiudi') {
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
