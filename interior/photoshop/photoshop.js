/* Photoshop Interior · le funzioni proprie del corso.
   Le schede (indirizzi, tasto Indietro, barra attaccata) sono comuni: assets/schede.js. */
(function () {
  function stopVideo() {
      const player = document.getElementById("video-player");
      if (!player || player.hidden) return;
      player.src = "about:blank";
      player.hidden = true;
      document.getElementById("video-frame").hidden = true;
      document.getElementById("video-current").hidden = true;
      document.getElementById("video-current-title").textContent = "Nessun video selezionato";
      document.getElementById("video-direct-link").hidden = true;
      document.querySelectorAll(".video-choice").forEach(function (button) { button.setAttribute("aria-pressed", "false"); });
  }
  document.getElementById("video-start").addEventListener("click", function () {
      document.querySelector(".video-course-panel:not([hidden]) .video-choice")?.click();
  });
  document.querySelectorAll(".video-course-choice").forEach(function (button) {
      button.addEventListener("click", function () {
          const course = button.dataset.videoCourse;
          stopVideo();
          document.querySelectorAll(".video-course-choice").forEach(function (choice) { choice.setAttribute("aria-pressed", String(choice === button)); });
          document.querySelectorAll(".video-course-panel").forEach(function (panel) { panel.hidden = panel.id !== "video-panel-" + course; });
          document.getElementById("video-start").textContent = course === "ombre" ? "Inizia dal capitolo 1 →" : "Inizia dal video 01 →";
      });
  });
  document.querySelectorAll(".video-choice").forEach(function (button) {
      button.addEventListener("click", function () {
          const id = button.dataset.videoId;
          const title = button.dataset.videoTitle;
          const player = document.getElementById("video-player");
          player.src = "https://drive.google.com/file/d/" + id + "/preview";
          player.title = title;
          player.hidden = false;
          document.getElementById("video-frame").hidden = false;
          document.getElementById("video-current").hidden = false;
          document.getElementById("video-current-title").textContent = title;
          const directLink = document.getElementById("video-direct-link");
          directLink.href = "https://drive.google.com/file/d/" + id + "/view";
          directLink.hidden = false;
          document.querySelectorAll(".video-choice").forEach(function (choice) { choice.setAttribute("aria-pressed", String(choice === button)); });
          document.getElementById("video-frame").scrollIntoView({ block: "start", behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
      });
  });
  const shortcutKeys = document.querySelectorAll("#tab-scorciatoie kbd");
  const shortcutToggle = document.getElementById("shortcut-platform-toggle");
  shortcutKeys.forEach(function (key) { key.dataset.windows = key.textContent; });

  function showShortcutPlatform(isMac) {
      shortcutKeys.forEach(function (key) { key.textContent = isMac && key.dataset.mac ? key.dataset.mac : key.dataset.windows; });
      document.getElementById("shortcut-platform-name").textContent = isMac ? "Mac" : "Windows";
      document.getElementById("shortcut-platform-note").textContent = isMac
          ? "Su Mac, Cmd è il tasto ⌘ e Option è il tasto ⌥."
          : "Le combinazioni mostrate sono quelle predefinite per Windows.";
      shortcutToggle.textContent = isMac ? "Mostra tasti Windows" : "Mostra tasti Mac";
      shortcutToggle.dataset.platform = isMac ? "mac" : "windows";
      try { localStorage.setItem("photoshop-shortcut-platform", isMac ? "mac" : "windows"); } catch (error) { /* La guida funziona anche senza memoria locale. */ }
  }

  shortcutToggle.addEventListener("click", function () { showShortcutPlatform(shortcutToggle.dataset.platform !== "mac"); });
  try {
      if (localStorage.getItem("photoshop-shortcut-platform") === "mac") showShortcutPlatform(true);
  } catch (error) { /* La guida resta su Windows se la memoria locale non è disponibile. */ }

  // lasciando la scheda Video, il video si ferma
  document.addEventListener("scheda", function (e) { if (e.detail.prima === "video") stopVideo(); });

  /* ---------- Calendario: «La tua classe» mostra solo le date della classe scelta ---------- */
  const leggi = function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } };
  const salva = function (k, v) { try { localStorage.setItem(k, v); } catch (e) {} };
  const grid = document.querySelector("#tab-calendario .calendar-grid");
  if (grid) {
    const cards = [...grid.querySelectorAll(".class-card")];
    const picker = document.createElement("div");
    picker.className = "gs-class-picker";
    picker.innerHTML = '<span>La tua classe</span><div role="group" aria-label="Classe Photoshop Interior">' +
      ["2A", "2B", "2C"].map(function (n) { return '<button type="button" data-gs-class="' + n + '" aria-pressed="false">' + n + '</button>'; }).join("") + '</div>';
    const empty = document.createElement("p");
    empty.className = "gs-class-empty";
    empty.textContent = "Seleziona la tua classe per vedere le date confermate.";
    grid.before(picker);
    grid.after(empty);
    grid.classList.add("gs-filtered");
    const chooseClass = function (name) {
      const selected = ["2A", "2B", "2C"].includes(name) ? name : null;
      picker.querySelectorAll("button").forEach(function (b) { b.setAttribute("aria-pressed", String(b.dataset.gsClass === selected)); });
      cards.forEach(function (card) { card.hidden = !selected || !card.querySelector("h3")?.textContent.includes(selected); });
      empty.hidden = !!selected;
      if (selected) salva("gs-site-photoshop-class", selected);
    };
    picker.addEventListener("click", function (e) {
      const b = e.target.closest("button[data-gs-class]");
      if (b) chooseClass(b.dataset.gsClass);
    });
    chooseClass(leggi("gs-site-photoshop-class"));
  }
})();

// Programma: il domino delle tappe. Gli stati vengono da LEZIONI_CORSO (giorno e archivio).
// Le tessere già fatte cadono una dopo l'altra ogni volta che si apre la scheda, e restano appoggiate.
(() => {
  const lista = document.querySelector('.pg-tessere');
  const corso = window.LEZIONI_CORSO;
  if (!lista || !corso) return;
  const fatte = (corso.archivio || []).map(Number);
  const oggi = Number(corso.giorno) || 0;
  const tessere = [...lista.querySelectorAll('li')];
  const daCadere = tessere.filter(li => fatte.includes(Number(li.dataset.n)));
  const tesseraOggi = tessere.find(li => Number(li.dataset.n) === oggi && !fatte.includes(oggi));
  tessere.forEach(li => {
    const n = Number(li.dataset.n), stato = li.querySelector('.pg-stato');
    if (fatte.includes(n)) stato.textContent = 'Fatta ✓';
    else if (li === tesseraOggi) { li.classList.add('oggi'); stato.textContent = 'Sei qui'; }
    else stato.textContent = 'In arrivo';
  });
  const fine = () => lista.style.setProperty('--pg-fatte', daCadere.length + (tesseraOggi ? .5 : 0));
  let timer = [];
  const cadi = () => {
    timer.forEach(clearTimeout); timer = [];
    const fermo = window.Studio && Studio.fermo;
    if (fermo) { daCadere.forEach(li => li.classList.add('giu')); fine(); return; }
    daCadere.forEach(li => li.classList.remove('giu', 'cade'));
    if (tesseraOggi) tesseraOggi.classList.remove('spinta');
    lista.style.setProperty('--pg-fatte', 0);
    void lista.offsetWidth;
    const passo = 420, attesa = 350;
    daCadere.forEach((li, i) => timer.push(setTimeout(() => {
      li.classList.add('giu', 'cade');
      lista.style.setProperty('--pg-fatte', i + 1);
    }, attesa + i * passo)));
    timer.push(setTimeout(() => {
      fine();
      if (tesseraOggi) tesseraOggi.classList.add('spinta');
    }, attesa + daCadere.length * passo + 150));
  };
  const pannello = lista.closest('[data-scheda]');
  if (pannello && !pannello.hidden) requestAnimationFrame(cadi);
  document.addEventListener('scheda', e => { if (e.detail && e.detail.scheda === 'programma') requestAnimationFrame(() => requestAnimationFrame(cadi)); });
  const rifai = document.querySelector('.pg-rifai');
  if (rifai) { rifai.hidden = !daCadere.length; rifai.addEventListener('click', cadi); }
})();
