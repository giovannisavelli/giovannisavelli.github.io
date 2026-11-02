/* Password «di cortesia» per le pagine dei corsi.
 *
 * Non è una protezione vera: il sito è pubblico su GitHub Pages e chi sa leggere il codice
 * arriva lo stesso ai contenuti. Serve solo a tenere ogni classe nel suo corso.
 *
 * Si usa così, nel <head> della pagina del corso, prima degli altri script:
 *   <script src="../../assets/accesso.js" data-corso="photoshop"></script>
 *
 * PER CAMBIARE UNA PASSWORD: calcola l'impronta SHA-256 della nuova password (tutta minuscola)
 * e scrivila qui sotto al posto di quella vecchia. Chi aveva la vecchia la dovrà reinserire.
 * Per esempio, in un terminale con Python:
 *   python -c "import hashlib; print(hashlib.sha256(b'nuovapassword').hexdigest())"
 */
(function () {
  const CORSI = {
    photoshop:    { nome: 'Photoshop', sotto: 'Interior Design', colore: '#38bdf8',
                    impronta: '121462083ca42956a2236739016f20ff9f3c60a566ffd2886a3c1f78b384ed4d' }, // aantphotoshop
    ia:           { nome: 'Intelligenza Artificiale', sotto: 'Interior e Product Design', colore: '#77e7b7',
                    impronta: '70f89e94c5db98209f1f4e914b2f69065000c42c5f3e532d9e548782c1bcc402' }, // aantia
    rendering:    { nome: 'Rendering 3D', sotto: 'Cinema 4D e Corona', colore: '#a78bfa',
                    impronta: '69aa32834e5b0c68cf9c7f7d10475d616244336f35794eb236685b6072a02015' }, // aantrendering
    modellazione: { nome: 'Modellazione 3D', sotto: 'Product Design', colore: '#9d7bff',
                    impronta: '28f44b011c3d760aeee85e97876fb9eb115b3a4b2ff234e9d677b1fe765e8eb4' }  // aantmodellazione
  };

  const script = document.currentScript;
  const corso = CORSI[script && script.dataset.corso];
  if (!corso) return;
  const chiave = 'aant-accesso-' + script.dataset.corso;

  // La pagina è già aperta se su questo dispositivo è salvata l'impronta giusta (per sempre o per questa sessione).
  function leggi(memoria) { try { return memoria.getItem(chiave); } catch (e) { return null; } }
  if (leggi(localStorage) === corso.impronta || leggi(sessionStorage) === corso.impronta) return;

  const radice = document.documentElement;
  radice.classList.add('accesso-chiuso');
  const stile = document.createElement('style');
  stile.textContent = `
    html.accesso-chiuso body { overflow: hidden !important; }
    html.accesso-chiuso body > *:not(.accesso) { visibility: hidden !important; }
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
      radice.classList.remove('accesso-chiuso');
      pagina.remove();
      // Le scene 3D e le schede ricalcolano le misure ora che la pagina è visibile.
      window.dispatchEvent(new Event('resize'));
    });
  }

  if (document.body) mostra();
  else document.addEventListener('DOMContentLoaded', mostra, { once: true });
})();
