const previewCourses = {
  "rendering-interior": { name: "Rendering 3D · Interior", section: "programma", calendar: true },
  "photoshop-interior": { name: "Photoshop · Interior", section: "programma", calendar: true },
  "ia-interior": { name: "Intelligenza Artificiale · Interior", section: "programma", calendar: true },
  "modellazione-product": { name: "Modellazione 3D · Product", section: "panoramica", calendar: false },
  "photoshop-product": { name: "Photoshop · Product", section: "panoramica", calendar: false },
  "ia-product": { name: "Intelligenza Artificiale · Product", section: "panoramica", calendar: true }
};

function getPreference(key) {
  try { return localStorage.getItem(key); } catch { return null; }
}

function setPreference(key, value) {
  try { localStorage.setItem(key, value); } catch { /* Navigation works without storage. */ }
}

const departmentButtons = [...document.querySelectorAll(".dept-switch button")];
const departmentPanels = [...document.querySelectorAll(".quick-panel")];

function selectDepartment(department) {
  if (department !== "interior" && department !== "product") department = "interior";
  for (const button of departmentButtons) button.setAttribute("aria-pressed", String(button.dataset.dept === department));
  for (const panel of departmentPanels) panel.hidden = panel.dataset.deptPanel !== department;
  setPreference("gs-preview-department", department);
}

selectDepartment(getPreference("gs-preview-department"));
for (const button of departmentButtons) button.addEventListener("click", () => selectDepartment(button.dataset.dept));

const lastSlug = getPreference("gs-preview-last-course");
if (previewCourses[lastSlug]) {
  const lastCourse = previewCourses[lastSlug];
  const box = document.getElementById("last-course");
  document.getElementById("last-course-name").textContent = lastCourse.name;
  document.getElementById("last-course-open").href = `corso.html?c=${lastSlug}#${lastCourse.section}`;
  const calendarLink = document.getElementById("last-course-calendar");
  calendarLink.href = `corso.html?c=${lastSlug}#calendario`;
  calendarLink.hidden = !lastCourse.calendar;
  box.hidden = false;
}

for (const link of document.querySelectorAll('a[href*="corso.html?c="]')) {
  const url = new URL(link.href);
  url.searchParams.set("v", "ux-20261009-2");
  link.href = url.href;
}

document.addEventListener("click", event => {
  const link = event.target.closest('a[href*="corso.html?c="]');
  if (!link) return;
  const slug = new URL(link.href).searchParams.get("c");
  if (previewCourses[slug]) setPreference("gs-preview-last-course", slug);
});
