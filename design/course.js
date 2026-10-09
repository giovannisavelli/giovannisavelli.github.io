(() => {
  const entries = {
    "/interior/photoshop/": {
      slug: "photoshop-interior", css: "photoshop", title: "Photoshop", department: "Interior Design", year: "2° anno", mark: "Ps", label: "IMMAGINE / LIVELLI",
      description: "Impara a leggere e modificare le immagini con criterio. Qui trovi lezioni, video, strumenti e le date della tua classe.",
      tags: ["1° semestre", "Classi 2A · 2B · 2C", "A.A. 2026/2027"], actions: [["programma", "Programma"], ["calendario", "Calendario"], ["video", "Video"]]
    },
    "/interior/rendering3d/": {
      slug: "rendering-interior", css: "rendering", title: "Rendering 3D", department: "Interior Design", year: "2° anno", mark: "3D", label: "GEOMETRIA / LUCE",
      description: "Cinema 4D e Corona per dare forma, materiali e luce agli spazi. Programma, archivio e risorse restano sempre a portata di mano.",
      tags: ["2° anno", "Cinema 4D · Corona", "A.A. 2026/2027"], actions: [["programma", "Programma"], ["calendario", "Stato date"], ["video", "Video"]]
    },
    "/interior/rendering3d/corona.html": {
      slug: "corona-interior", css: "corona", title: "Corona", department: "Interior Design", year: "Rendering 3D", mark: "Cr", label: "MATERIALI / LUCE",
      description: "Dizionario PBR, texture e videoteca Corona: una guida da consultare mentre lavori ai tuoi render.",
      tags: ["Rendering 3D", "Cinema 4D · Corona", "A.A. 2026/2027"], actions: [["dizionario", "Dizionario"], ["proiezioni", "Texture"], ["videoteca", "Video"]]
    },
    "/interior/ia/": {
      slug: "ia-interior", css: "ia", title: "Intelligenza Artificiale", department: "Interior Design", year: "3° anno", mark: "AI", label: "METODO / POSSIBILITÀ",
      description: "Un laboratorio per usare l'IA nel processo creativo. Programma, archivio, promptoteca e calendario sono qui.",
      tags: ["3° anno", "Classi 3A · 3B · 3C", "A.A. 2026/2027"], actions: [["programma", "Programma"], ["calendario", "Calendario"], ["promptoteca", "Promptoteca"]]
    },
    "/product/modellazione/": {
      slug: "modellazione-product", css: "modellazione-product", title: "Modellazione 3D", department: "Product Design", year: "In preparazione", mark: "3D", label: "VOLUME / FORMA",
      description: "Lo spazio del corso di modellazione tridimensionale per Product Design.",
      tags: ["Product Design", "A.A. 2026/2027"], actions: []
    },
    "/product/photoshop/": {
      slug: "photoshop-product", css: "photoshop-product", title: "Photoshop", department: "Product Design", year: "In preparazione", mark: "Ps", label: "IMMAGINE / PRODOTTO",
      description: "Lo spazio del corso di postproduzione e comunicazione visiva per Product Design.",
      tags: ["Product Design", "A.A. 2026/2027"], actions: []
    },
    "/product/ia/": {
      slug: "ia-product", css: "ia-product", title: "Intelligenza Artificiale", department: "Product Design", year: "3° anno", mark: "AI", label: "ESPLORAZIONE / DESIGN",
      description: "Il calendario PD3 è disponibile. Programma e materiali didattici arriveranno in questo spazio.",
      tags: ["Classe PD3", "1° semestre", "A.A. 2026/2027"], actions: [["calendario", "Calendario"]]
    }
  };

  const course = entries[location.pathname];
  if (!course) return;
  document.body.classList.add("gs-course", `gs-course--${course.css}`);

  function save(key, value) {
    try { localStorage.setItem(key, value); } catch { /* Core navigation does not depend on storage. */ }
  }
  function read(key) {
    try { return localStorage.getItem(key); } catch { return null; }
  }
  function savePosition() {
    save("gs-site-last-course", course.slug);
    const current = course.actions.some(([hash]) => `#${hash}` === location.hash) ? location.hash.slice(1) : (course.actions[0]?.[0] || "");
    save("gs-site-last-section", current);
  }
  savePosition();

  const container = document.querySelector(".app-container, .shell, .box");
  if (!container) return;
  const actionLinks = course.actions.map(([hash, label]) => `<a href="#${hash}" data-gs-jump="${hash}">${label}</a>`).join("");
  const topbar = document.createElement("div");
  topbar.className = "gs-global-header";
  topbar.innerHTML = `<div class="gs-global-header-inner"><a class="gs-brand" href="/" aria-label="Tutti i corsi di Giovanni Savelli"><span class="gs-brand-mark">GS</span><span class="gs-brand-copy"><strong>Giovanni Savelli</strong><small>Hub docente / AANT</small></span></a><nav class="gs-header-actions" aria-label="Navigazione del corso"><a class="gs-all-courses" href="/">Tutti i corsi ↗</a>${actionLinks}</nav></div>`;
  document.body.insertBefore(topbar, document.body.firstChild);
  const accessibilityButton = document.querySelector(".fab-accessibility");
  if (accessibilityButton) topbar.querySelector(".gs-global-header-inner").appendChild(accessibilityButton);

  const hero = document.createElement("section");
  hero.className = "gs-course-hero";
  hero.setAttribute("aria-label", course.title + " · " + course.department);
  hero.innerHTML = `<div class="gs-course-intro"><div class="gs-breadcrumb"><a href="/">Tutti i corsi</a> / <span>${course.department}</span> / ${course.year}</div><h1>${course.title}<span>.</span></h1><p class="gs-course-description">${course.description}</p><div class="gs-course-tags">${course.tags.map(tag => `<span>${tag}</span>`).join("")}</div></div><div class="gs-course-art" aria-hidden="true"><strong>${course.mark}</strong><small>${course.label}</small></div>`;
  if (course.css === "photoshop") container.insertBefore(hero, container.querySelector(".topbar"));
  else container.insertBefore(hero, container.querySelector(".hero-banner") || container.firstChild);

  if (course.actions.length) {
    const mobile = document.createElement("nav");
    mobile.className = "gs-mobile-actions";
    mobile.setAttribute("aria-label", "Accesso rapido alle sezioni");
    mobile.innerHTML = actionLinks;
    document.body.appendChild(mobile);
  }

  const tabs = document.querySelector(".tabs, .nav-tabs");
  function scrollToSection(hash) {
    const target = tabs || document.getElementById(hash);
    if (target) target.scrollIntoView({ block: "start", behavior: "smooth" });
  }
  document.querySelectorAll("[data-gs-jump]").forEach(link => {
    link.addEventListener("click", event => {
      event.preventDefault();
      const hash = link.dataset.gsJump;
      if (location.hash !== `#${hash}`) location.hash = hash;
      else if (typeof showTabFromHash === "function") showTabFromHash();
      savePosition();
      requestAnimationFrame(() => scrollToSection(hash));
    });
  });
  function updateActions() {
    for (const link of document.querySelectorAll(".gs-mobile-actions a")) {
      link.setAttribute("aria-current", String(link.hash === location.hash));
    }
    savePosition();
  }
  window.addEventListener("hashchange", () => {
    updateActions();
    if (course.actions.some(([hash]) => `#${hash}` === location.hash)) requestAnimationFrame(() => scrollToSection(location.hash.slice(1)));
  });
  window.addEventListener("popstate", updateActions);
  if (tabs) tabs.addEventListener("click", () => setTimeout(updateActions, 0));
  updateActions();

  if (course.css === "photoshop") {
    const grid = document.querySelector("#tab-calendario .calendar-grid");
    if (grid) {
      const cards = [...grid.querySelectorAll(".class-card")];
      const picker = document.createElement("div");
      picker.className = "gs-class-picker";
      picker.innerHTML = `<span>La tua classe</span><div role="group" aria-label="Classe Photoshop Interior">${["2A", "2B", "2C"].map(name => `<button type="button" data-gs-class="${name}" aria-pressed="false">${name}</button>`).join("")}</div>`;
      const empty = document.createElement("p");
      empty.className = "gs-class-empty";
      empty.textContent = "Seleziona la tua classe per vedere le date confermate.";
      grid.before(picker);
      grid.after(empty);
      grid.classList.add("gs-filtered");
      function chooseClass(name) {
        const selected = ["2A", "2B", "2C"].includes(name) ? name : null;
        picker.querySelectorAll("button").forEach(button => button.setAttribute("aria-pressed", String(button.dataset.gsClass === selected)));
        cards.forEach(card => { card.hidden = !selected || !card.querySelector("h3")?.textContent.includes(selected); });
        empty.hidden = !!selected;
        if (selected) save("gs-site-photoshop-class", selected);
      }
      picker.addEventListener("click", event => {
        const button = event.target.closest("button[data-gs-class]");
        if (button) chooseClass(button.dataset.gsClass);
      });
      chooseClass(read("gs-site-photoshop-class"));
    }
  }

  if (course.css === "ia") {
    const savedClass = read("gs-site-ia-class");
    const buttons = [...document.querySelectorAll("#tab-cal .class-btn")];
    buttons.forEach(button => button.addEventListener("click", () => {
      const selected = button.textContent.trim().slice(-2);
      save("gs-site-ia-class", selected);
      buttons.forEach(item => item.setAttribute("aria-pressed", String(item === button)));
    }));
    const button = buttons.find(item => item.textContent.trim().endsWith(savedClass));
    if (button) button.click();
  }

  for (const anchor of document.querySelectorAll("a[href]")) {
    const url = new URL(anchor.href);
    if (url.origin !== location.origin) continue;
    if (url.pathname !== "/" && (url.pathname === location.pathname || !entries[url.pathname])) continue;
    url.searchParams.set("v", "site-20261009");
    anchor.href = url.href;
  }

  if (location.hash && course.actions.some(([hash]) => `#${hash}` === location.hash)) {
    window.addEventListener("load", () => requestAnimationFrame(() => scrollToSection(location.hash.slice(1))), { once: true });
  }
})();
