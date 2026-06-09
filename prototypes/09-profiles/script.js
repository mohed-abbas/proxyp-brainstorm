/* Proxy Papers — Section 09: "Trois profils"
   Title line-masks reveal, the three cards fan out of a stacked deck (centre first),
   then the deck tilts to the pointer and each card drifts by its data-depth. */

gsap.registerPlugin(ScrollTrigger);
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const body = document.body;
const deck = document.querySelector("#deck");
const titleSpans = gsap.utils.toArray(".profiles__title .ln > span");
const lede = document.querySelector(".profiles__lede");
const cards = gsap.utils.toArray(".deck .card");

/* resolve each card's fanned-out target from its inline CSS vars */
const px = (el, v) => parseFloat(getComputedStyle(el).getPropertyValue(v)) || 0;
const targets = cards.map((c) => ({
  el: c,
  x: px(c, "--tx"),
  y: px(c, "--ty"),
  rot: px(c, "--rot"),
  depth: parseFloat(c.dataset.depth) || 0,
}));
const centre = targets.find((t) => t.el.classList.contains("card--b"));
const sides = targets.filter((t) => !t.el.classList.contains("card--b"));

/* ---------- intro ---------- */
function setStart() {
  gsap.set(titleSpans, { yPercent: 115 });
  gsap.set(lede, { y: 16, opacity: 0 });
  // all cards stacked at centre, slightly down + small
  gsap.set(cards, { xPercent: -50, x: 0, y: 26, rotation: 0, scale: 0.88, opacity: 0, transformOrigin: "50% 8%" });
}
function playIntro() {
  setStart();
  const tl = gsap.timeline({
    defaults: { ease: "power3.out" },
    onComplete: () => { body.classList.remove("pre-intro"); enableParallax(); },
  });
  tl.to(titleSpans, { yPercent: 0, duration: 0.82, stagger: 0.1 }, 0.1)
    .to(lede, { y: 0, opacity: 1, duration: 0.7 }, 0.4)
    // centre card resolves first…
    .to(centre.el, { x: centre.x, y: centre.y, rotation: centre.rot, scale: 1, opacity: 1, duration: 0.95, ease: "power4.out" }, 0.45)
    // …then the two blue cards fan outward
    .to(sides.map((s) => s.el), {
      x: (i) => sides[i].x, y: (i) => sides[i].y, rotation: (i) => sides[i].rot,
      scale: 1, opacity: 1, duration: 1.0, stagger: 0.12, ease: "power4.out",
    }, 0.62);
  return tl;
}
function settleInstantly() {
  gsap.set(titleSpans, { yPercent: 0 });
  gsap.set(lede, { y: 0, opacity: 1 });
  targets.forEach((t) => gsap.set(t.el, { xPercent: -50, x: t.x, y: t.y, rotation: t.rot, scale: 1, opacity: 1, transformOrigin: "50% 8%" }));
  body.classList.remove("pre-intro");
}

/* ---------- mouse parallax (tilt the deck + depth-drift each card) ---------- */
let parallaxOn = false;
function enableParallax() {
  if (reduceMotion || parallaxOn) return; parallaxOn = true;
  const setRX = gsap.quickTo(deck, "--rx", { duration: 0.6, ease: "power2.out" });
  const setRY = gsap.quickTo(deck, "--ry", { duration: 0.6, ease: "power2.out" });
  const drift = targets.map((t) => ({
    base: t,
    qx: gsap.quickTo(t.el, "x", { duration: 0.7, ease: "power2.out" }),
    qy: gsap.quickTo(t.el, "y", { duration: 0.7, ease: "power2.out" }),
  }));
  window.addEventListener("pointermove", (e) => {
    const nx = e.clientX / window.innerWidth - 0.5;
    const ny = e.clientY / window.innerHeight - 0.5;
    setRX(-ny * 6); setRY(nx * 9);
    drift.forEach((d) => {
      d.qx(d.base.x - nx * d.base.depth);
      d.qy(d.base.y - ny * d.base.depth);
    });
  });
}

/* ---------- theme ---------- */
const themeToggle = document.querySelector("#themeToggle");
if (localStorage.getItem("pp-theme") === "dark") document.documentElement.setAttribute("data-theme", "dark");
themeToggle.addEventListener("click", () => {
  const dark = document.documentElement.getAttribute("data-theme") === "dark";
  if (dark) { document.documentElement.removeAttribute("data-theme"); localStorage.setItem("pp-theme", "light"); }
  else { document.documentElement.setAttribute("data-theme", "dark"); localStorage.setItem("pp-theme", "dark"); }
});

/* ---------- replay ---------- */
document.querySelector("#replay").addEventListener("click", () => {
  body.classList.add("pre-intro");
  if (reduceMotion) settleInstantly(); else playIntro();
});

/* ---------- boot ---------- */
function boot() { if (reduceMotion) settleInstantly(); else playIntro(); }
if (document.fonts && document.fonts.ready) document.fonts.ready.then(boot); else window.addEventListener("load", boot);
