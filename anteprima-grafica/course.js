const COURSES = {
  "photoshop-interior": {
    title: "Photoshop", department: "Interior Design", year: "2° anno", mark: "Ps", label: "IMMAGINE / LIVELLI",
    accent: "#59b8ff", wash: "rgba(49,168,255,.3)", live: "../interior/photoshop/",
    description: "Un corso per capire come intervenire sulle immagini e scegliere con criterio gli strumenti del proprio progetto.",
    statusLabel: "Prima lezione online", status: "“Conosciamoci” e il calendario delle classi 2A, 2B e 2C sono già disponibili.",
    meta: ["1° semestre", "Classi 2A · 2B · 2C", "A.A. 2026/2027"],
    tabs: [["programma","Programma lezioni"],["archivio","Archivio"],["appunti","Appunti"],["calendario","Calendario"],["video","Video"],["risorse","Risorse"],["scorciatoie","Scorciatoie"]],
    first: "programma", kind: "photoshop"
  },
  "rendering-interior": {
    title: "Rendering 3D", department: "Interior Design", year: "2° anno", mark: "3D", label: "GEOMETRIA / LUCE",
    accent: "#b58aff", wash: "rgba(145,70,255,.32)", live: "../interior/rendering3d/",
    description: "Modellazione, materiali e luce per dare forma e atmosfera agli spazi progettati.",
    statusLabel: "Materiali disponibili", status: "Il programma, l'archivio e i tutorial sono online. Le date del secondo semestre sono ancora da definire.",
    meta: ["2° anno", "Cinema 4D · Corona", "A.A. 2026/2027"],
    tabs: [["programma","Programma"],["archivio","Archivio"],["appunti","Appunti"],["calendario","Calendario"],["video","Video"],["risorse","Brand & Modelli"],["scorciatoie","Scorciatoie"],["corona","Corona"]],
    first: "programma", kind: "rendering"
  },
  "ia-interior": {
    title: "Intelligenza Artificiale", department: "Interior Design", year: "3° anno", mark: "AI", label: "METODO / POSSIBILITÀ",
    accent: "#77e7b7", wash: "rgba(52,211,153,.28)", live: "../interior/ia/",
    description: "Un laboratorio per integrare nuovi strumenti nel processo creativo e nel progetto di interior.",
    statusLabel: "Materiali disponibili", status: "Programma, archivio e calendario del primo semestre sono già pubblicati.",
    meta: ["3° anno", "Classi 3A · 3B · 3C", "A.A. 2026/2027"],
    tabs: [["programma","Programma"],["archivio","Archivio"],["bibliografia","Bibliografia"],["promptoteca","Promptoteca"],["vibe-coding","Vibe Coding"],["nexus","Nexus Hub"],["glossario","Glossario"],["calendario","Calendario"]],
    first: "programma", kind: "ia"
  },
  "modellazione-product": {
    title: "Modellazione 3D", department: "Product Design", year: "Corso in preparazione", mark: "3D", label: "VOLUME / FORMA",
    accent: "#ffb77d", wash: "rgba(251,146,60,.29)", live: "../product/modellazione/",
    description: "Uno spazio per i materiali di modellazione tridimensionale dedicati al progetto di prodotto.",
    statusLabel: "In preparazione", status: "Il corso esiste nell'hub; programma e materiali sono ancora in preparazione.",
    meta: ["Product Design", "A.A. 2026/2027"],
    tabs: [["panoramica","Panoramica"],["calendario","Calendario"]], first: "panoramica", kind: "pending"
  },
  "photoshop-product": {
    title: "Photoshop", department: "Product Design", year: "Corso in preparazione", mark: "Ps", label: "IMMAGINE / PRODOTTO",
    accent: "#59b8ff", wash: "rgba(49,168,255,.3)", live: "../product/photoshop/",
    description: "Postproduzione e immagini per comunicare forme, materiali e dettagli del progetto di prodotto.",
    statusLabel: "In preparazione", status: "Il corso esiste nell'hub; programma e materiali sono ancora in preparazione.",
    meta: ["Product Design", "A.A. 2026/2027"],
    tabs: [["panoramica","Panoramica"],["calendario","Calendario"]], first: "panoramica", kind: "pending"
  },
  "ia-product": {
    title: "Intelligenza Artificiale", department: "Product Design", year: "3° anno", mark: "AI", label: "ESPLORAZIONE / DESIGN",
    accent: "#77e7b7", wash: "rgba(52,211,153,.28)", live: "../product/ia/",
    description: "AI applicata alla ricerca e alla comunicazione del progetto di prodotto.",
    statusLabel: "Calendario online", status: "Le date del primo semestre per PD3 sono pubblicate; i materiali didattici sono in preparazione.",
    meta: ["3° anno", "Classe PD3", "A.A. 2026/2027"],
    tabs: [["panoramica","Panoramica"],["calendario","Calendario"]], first: "calendario", kind: "ia-product"
  }
};

const slug = new URLSearchParams(location.search).get("c");
const course = COURSES[slug] || COURSES["photoshop-interior"];
document.documentElement.style.setProperty("--accent", course.accent);
document.documentElement.style.setProperty("--accent-ink", "#091219");
document.documentElement.style.setProperty("--wash", course.wash);
document.title = `Anteprima · ${course.title} ${course.department} · Giovanni Savelli`;
document.getElementById("course-department").textContent = course.department;
document.getElementById("course-year").textContent = course.year;
document.getElementById("course-title").innerHTML = `${course.title}<span>.</span>`;
document.getElementById("course-description").textContent = course.description;
document.getElementById("course-meta").innerHTML = course.meta.map(item => `<span>${item}</span>`).join("");
document.getElementById("cover-mark").textContent = course.mark;
document.getElementById("cover-top-left").textContent = `AANT / ${course.department.toUpperCase()}`;
document.getElementById("cover-foot-left").textContent = course.label;
document.getElementById("course-status-label").textContent = course.statusLabel;
document.getElementById("course-status-text").textContent = course.status;
for (const id of ["bar-live","header-live","course-live","footer-live"]) document.getElementById(id).href = course.live;

const nav = document.getElementById("course-nav");
const content = document.getElementById("course-content");
nav.innerHTML = course.tabs.map(([key,label]) => `<button type="button" role="tab" id="tab-${key}" aria-controls="course-content" aria-selected="false" data-section="${key}">${label}</button>`).join("");

function photoshopProgram() {
  return `<p class="content-kicker">01 / PRIMA LEZIONE · 2 ORE</p><h2>Il percorso comincia qui.</h2>
    <p class="content-lead">Un primo incontro con il docente, con la classe e con l'interfaccia di Photoshop.</p>
    <article class="feature-lesson"><small>Lezione 01 / Conosciamoci</small><h3>Le nostre interfacce.</h3>
      <p>Prima di lavorare insieme sulle immagini, scopriamo chi siamo e come ci si orienta nel programma.</p>
      <div class="lesson-quote">In due ore voi non potete conoscere a fondo me, io non posso conoscere a fondo voi e voi non potete conoscere a fondo Photoshop. Possiamo però iniziare dalle <strong>nostre interfacce.</strong></div>
    </article>
    <div class="step-grid"><article class="step-card"><b>01 / VOI → ME</b><h4>Voi conoscete me</h4><p>Partiamo da un mio lavoro: chi sono, che cosa faccio e come affronto le immagini nella mia attività.</p></article>
      <article class="step-card"><b>02 / IO → VOI</b><h4>Io conosco voi</h4><p>Mi raccontate da dove partite, quali strumenti usate già e che cosa vorreste imparare a fare con le immagini.</p></article>
      <article class="step-card"><b>03 / VOI → PS</b><h4>Voi conoscete Photoshop</h4><p>Apriamo il programma e ne leggiamo la mappa: documento, strumenti, opzioni e livelli.</p></article></div>
    <p class="preview-note"><strong>Contenuto reale, nuova veste.</strong> Questa lezione riprende la pagina Photoshop già pubblicata. <a href="${course.live}#programma">Confrontala con la versione attuale ↗</a></p>`;
}

function renderingProgram() {
  return `<p class="content-kicker">Programma / Rendering 3D</p><h2>Un corso ricco, un ordine più chiaro.</h2><p class="content-lead">Il sito attuale arriva alla lezione 8 e raccoglie tutorial, video e materiali. Questa anteprima mostra come dare respiro a sezioni molto dense.</p>
    <div class="info-grid"><article class="info-card"><b>01 / PERCORSO</b><h3>Programma</h3><p>Le attività della lezione in evidenza restano subito riconoscibili.</p></article><article class="info-card"><b>02 / CONSULTAZIONE</b><h3>Archivio e tutorial</h3><p>Le lezioni passate e le guide mantengono un accesso diretto.</p></article><article class="info-card"><b>03 / MATERIALI</b><h3>Video e modelli</h3><p>Le risorse hanno spazi ordinati e leggibili.</p></article></div>
    <p class="preview-note"><strong>Anteprima grafica.</strong> Il programma completo e i materiali restano nella <a href="${course.live}#programma">pagina attuale ↗</a>.</p>`;
}

function iaProgram() {
  return `<p class="content-kicker">Programma / Intelligenza Artificiale</p><h2>Dal laboratorio al progetto.</h2><p class="content-lead">Il programma attuale è dedicato allo sviluppo del progetto di fine anno. La nuova struttura rende raggiungibili anche archivio, promptoteca, Vibe Coding e Nexus Hub.</p>
    <div class="info-grid"><article class="info-card"><b>01 / PROGETTO</b><h3>Programma</h3><p>Il lavoro del momento è in primo piano, senza perdere i collegamenti alle risorse.</p></article><article class="info-card"><b>02 / ESPLORAZIONE</b><h3>Promptoteca</h3><p>Uno spazio riconoscibile per esempi e sperimentazioni.</p></article><article class="info-card"><b>03 / RIFERIMENTI</b><h3>Archivio e glossario</h3><p>Le spiegazioni rimangono consultabili quando servono.</p></article></div>
    <p class="preview-note"><strong>Anteprima grafica.</strong> Il programma completo e i materiali restano nella <a href="${course.live}#programma">pagina attuale ↗</a>.</p>`;
}

function pendingProgram() {
  return `<p class="content-kicker">Panoramica / Product Design</p><h2>Uno spazio pronto a crescere.</h2><p class="content-lead">Il corso è ancora in preparazione. Qui la proposta mostra la sua identità visiva e il modo in cui programma, calendario e materiali potranno essere organizzati.</p>
    <div class="info-grid"><article class="info-card"><b>01 / IDENTITÀ</b><h3>Materia riconoscibile</h3><p>Colore e segno visivo sono coerenti con lo stesso argomento di Interior Design.</p></article><article class="info-card"><b>02 / STRUTTURA</b><h3>Navigazione semplice</h3><p>Le sezioni compariranno quando avranno contenuti reali.</p></article><article class="info-card"><b>03 / CONTINUITÀ</b><h3>Un solo hub</h3><p>Gli studenti ritrovano lo stesso linguaggio in tutti i corsi.</p></article></div>
    <p class="preview-note"><strong>Anteprima grafica.</strong> Nessun programma o data è stato aggiunto al <a href="${course.live}">corso attuale ↗</a>.</p>`;
}

function dateCard(name, detail, rows) {
  return `<article class="date-card"><h3>${name}</h3><small>${detail}</small><ul>${rows.map(([day,hours]) => `<li><time>${day}</time><span>${hours}</span></li>`).join("")}</ul></article>`;
}

function calendar() {
  if (course.kind === "photoshop") {
    return `<p class="content-kicker">1° semestre / Calendario</p><h2>Trova la tua classe.</h2><p class="content-lead">Qui compaiono solo gli incontri confermati. Per 2B e 2C resta un incontro di quattro ore in sospeso.</p><div class="date-grid">
      ${dateCard("2A","6 incontri · 20 ore",[["24 nov 2026","11–13"],["1 dic 2026","11–13"],["15 dic 2026","09–13"],["12 gen 2027","09–13"],["19 gen 2027","09–13"],["26 gen 2027","09–13"]])}
      ${dateCard("2B","5 incontri · 16 ore confermate",[["24 nov 2026","14–16"],["1 dic 2026","14–16"],["15 dic 2026","14–18"],["12 gen 2027","14–18"],["26 gen 2027","14–18"]])}
      ${dateCard("2C","6 incontri · 16 ore confermate",[["20 nov 2026","11–13"],["27 nov 2026","11–13"],["4 dic 2026","11–13"],["11 dic 2026","11–13"],["18 dic 2026","09–13"],["15 gen 2027","09–13"]])}</div>`;
  }
  if (course.kind === "rendering") return `<p class="content-kicker">Calendario / Rendering 3D</p><h2>Date da definire.</h2><p class="content-lead">Il calendario del secondo semestre 2026/2027 non è ancora disponibile. Questa è la veste prevista per le date, una volta confermate.</p><p class="preview-note">Lo stato aggiornato è nella <a href="${course.live}#calendario">pagina attuale ↗</a>.</p>`;
  if (course.kind === "ia") return `<p class="content-kicker">1° semestre / Calendario</p><h2>Classi 3A, 3B e 3C.</h2><p class="content-lead">Il calendario è già pubblicato. Nell'anteprima le classi avrebbero card separate, così ogni studente trova subito la propria.</p><div class="info-grid"><article class="info-card"><b>CLASSE</b><h3>3A</h3><p>Consulta tutte le date nel sito attuale.</p></article><article class="info-card"><b>CLASSE</b><h3>3B</h3><p>Consulta tutte le date nel sito attuale.</p></article><article class="info-card"><b>CLASSE</b><h3>3C</h3><p>Consulta tutte le date nel sito attuale.</p></article></div><p class="preview-note"><a href="${course.live}#calendario">Apri il calendario completo ↗</a></p>`;
  if (course.kind === "ia-product") return `<p class="content-kicker">1° semestre / Calendario</p><h2>Classe PD3.</h2><p class="content-lead">Quattro incontri confermati per il modulo Computer graphic III – AI.</p><div class="date-grid">${dateCard("PD3","4 incontri confermati",[["21 dic 2026","09–13"],["11 gen 2027","09–13"],["18 gen 2027","09–13"],["25 gen 2027","09–13"]])}</div><p class="preview-note"><a href="${course.live}#calendario">Verifica sul sito attuale ↗</a></p>`;
  return `<p class="content-kicker">Calendario / Product Design</p><h2>In preparazione.</h2><p class="content-lead">Non ci sono date da mostrare in questa anteprima. Quando saranno disponibili, compariranno qui con la stessa struttura usata dagli altri corsi.</p><p class="preview-note"><a href="${course.live}">Apri il corso attuale ↗</a></p>`;
}

function otherSection(key) {
  const label = course.tabs.find(([id]) => id === key)?.[1] || "Sezione";
  const descriptions = {
    archivio: "Le lezioni svolte, ordinate per ritrovare facilmente un argomento.",
    appunti: "Spiegazioni e guide da consultare durante il lavoro.",
    video: "I video del docente in uno spazio dedicato alla visione e al ripasso.",
    risorse: "File, riferimenti e materiali utili al progetto.",
    scorciatoie: "I comandi più usati, pronti da consultare mentre si lavora.",
    bibliografia: "Libri, manuali e riferimenti raccolti in un unico luogo.",
    promptoteca: "Esempi e strumenti per esplorare la scrittura dei prompt.",
    "vibe-coding": "Uno spazio per i progetti sviluppati attraverso il codice.",
    nexus: "Una bussola per orientarsi fra gli strumenti del corso.",
    glossario: "Le parole del corso spiegate e raggiungibili rapidamente.",
    corona: "La sottopagina Corona rimane un percorso riconoscibile e accessibile."
  };
  const destination = key === "corona" ? "../interior/rendering3d/corona.html" : course.live + "#" + key;
  return `<p class="content-kicker">Anteprima della sezione</p><h2>${label}.</h2><p class="content-lead">${descriptions[key] || "Una sezione del corso, nello stesso linguaggio grafico."}</p><div class="info-grid"><article class="info-card"><b>01 / VISTA</b><h3>Contenuto in evidenza</h3><p>Un'intestazione chiara indica subito dove ci si trova.</p></article><article class="info-card"><b>02 / LETTURA</b><h3>Blocchi leggibili</h3><p>Testo e materiali hanno spazio per respirare, anche sul telefono.</p></article><article class="info-card"><b>03 / AZIONE</b><h3>Link visibili</h3><p>Le risorse restano a portata di clic, senza menu nascosti.</p></article></div><p class="preview-note"><strong>Solo una prova grafica di questa sezione.</strong> Il contenuto completo è nel <a href="${destination}">sito attuale ↗</a>.</p>`;
}

function sectionHTML(key) {
  if (key === "calendario") return calendar();
  if (key === "programma" || key === "panoramica") {
    if (course.kind === "photoshop") return photoshopProgram();
    if (course.kind === "rendering") return renderingProgram();
    if (course.kind === "ia") return iaProgram();
    return pendingProgram();
  }
  return otherSection(key);
}

function showSection(key, push) {
  if (!course.tabs.some(([id]) => id === key)) key = course.first;
  nav.querySelectorAll("button").forEach(button => button.setAttribute("aria-selected", String(button.dataset.section === key)));
  content.setAttribute("aria-labelledby", `tab-${key}`);
  content.innerHTML = sectionHTML(key);
  if (push && location.hash !== `#${key}`) history.pushState(null, "", `#${key}`);
}

nav.addEventListener("click", event => {
  const button = event.target.closest("button[data-section]");
  if (button) showSection(button.dataset.section, true);
});
window.addEventListener("popstate", () => showSection(location.hash.slice(1), false));
window.addEventListener("hashchange", () => showSection(location.hash.slice(1), false));
showSection(location.hash.slice(1) || course.first, false);
