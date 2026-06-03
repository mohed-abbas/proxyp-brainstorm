/* Proxy Papers — Welcome layout explorations
   Four arrangements of the same welcome moment; switching morphs via CSS transitions
   (every part is anchored with top/left + translate, so the morph stays clean).
   Light default + dark toggle. */

const body = document.body;
const buttons = Array.from(document.querySelectorAll(".switcher button"));

/* enable transitions + fade-in only after first paint (no initial-position jump) */
requestAnimationFrame(() => requestAnimationFrame(() => body.classList.add("ready")));

function setLayout(name) {
  buttons.forEach((b) => b.classList.toggle("is-active", b.dataset.set === name));
  body.dataset.layout = name;
}
buttons.forEach((b) => b.addEventListener("click", () => setLayout(b.dataset.set)));

/* theme */
const themeToggle = document.querySelector("#themeToggle");
if (localStorage.getItem("pp-theme") === "dark") document.documentElement.setAttribute("data-theme", "dark");
themeToggle.addEventListener("click", () => {
  const dark = document.documentElement.getAttribute("data-theme") === "dark";
  if (dark) { document.documentElement.removeAttribute("data-theme"); localStorage.setItem("pp-theme", "light"); }
  else { document.documentElement.setAttribute("data-theme", "dark"); localStorage.setItem("pp-theme", "dark"); }
});
