const courses = {
  "rendering-interior": { name: "Rendering 3D · Interior", path: "/interior/rendering3d/", first: "programma", calendar: true },
  "photoshop-interior": { name: "Photoshop · Interior", path: "/interior/photoshop/", first: "programma", calendar: true },
  "ia-interior": { name: "Intelligenza Artificiale · Interior", path: "/interior/ia/", first: "programma", calendar: true },
  "corona-interior": { name: "Corona · Rendering 3D", path: "/interior/rendering3d/corona.html", first: "dizionario", calendar: false },
  "modellazione-product": { name: "Modellazione 3D · Product", path: "/product/modellazione/", first: "", calendar: false },
  "photoshop-product": { name: "Photoshop · Product", path: "/product/photoshop/", first: "", calendar: false },
  "ia-product": { name: "Intelligenza Artificiale · Product", path: "/product/ia/", first: "calendario", calendar: true }
};

function readSaved(key) {
  try { return localStorage.getItem(key); } catch { return null; }
}
function save(key, value) {
  try { localStorage.setItem(key, value); } catch { /* Links still work without storage. */ }
}

function selectDepartment(department) {
  if (department !== "interior" && department !== "product") department = "interior";
  for (const button of document.querySelectorAll(".dept-switch button")) {
    button.setAttribute("aria-pressed", String(button.dataset.dept === department));
  }
  for (const panel of document.querySelectorAll(".quick-panel")) {
    panel.hidden = panel.dataset.deptPanel !== department;
  }
  save("gs-site-department", department);
}

selectDepartment(readSaved("gs-site-department"));
document.querySelectorAll(".dept-switch button").forEach(button => {
  button.addEventListener("click", () => selectDepartment(button.dataset.dept));
});

const lastSlug = readSaved("gs-site-last-course");
if (courses[lastSlug]) {
  const course = courses[lastSlug];
  const box = document.getElementById("last-course");
  const lastSection = readSaved("gs-site-last-section");
  document.getElementById("last-course-name").textContent = course.name;
  document.getElementById("last-course-open").href = course.path + (lastSection || course.first ? `#${lastSection || course.first}` : "");
  const calendarLink = document.getElementById("last-course-calendar");
  calendarLink.href = course.path + "#calendario";
  calendarLink.hidden = !course.calendar;
  box.hidden = false;
}

for (const anchor of document.querySelectorAll("a[href]")) {
  const url = new URL(anchor.href);
  if (!Object.values(courses).some(course => course.path === url.pathname)) continue;
  url.searchParams.set("v", "scontorno-20261010");
  anchor.href = url.href;
}

document.addEventListener("click", event => {
  const anchor = event.target.closest("a[href]");
  if (!anchor) return;
  const url = new URL(anchor.href);
  const courseEntry = Object.entries(courses).find(([, course]) => url.pathname === course.path);
  if (!courseEntry) return;
  save("gs-site-last-course", courseEntry[0]);
  save("gs-site-last-section", url.hash.slice(1));
});
