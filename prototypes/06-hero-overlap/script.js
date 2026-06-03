/* Proxy Papers — Hero 06: "Overlap"
   Huge headline reveals, the Papers Box card rises to overlap it, chips float in,
   foot (tagline + CTA) settles. Mouse-parallax tilts the card; chips shift by depth. */

gsap.registerPlugin(ScrollTrigger);
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const body = document.body, navbar = document.querySelector("#navbar");
const tilt = document.querySelector("#tilt"), stage = document.querySelector("#stage");
const headlineSpans = gsap.utils.toArray(".headline .ln > span");
const reveals = gsap.utils.toArray(".reveal");
const pbox = document.querySelector(".pbox");
const chips = gsap.utils.toArray(".chip");

function setStart() {
  gsap.set(headlineSpans, { yPercent: 115 });
  gsap.set(reveals, { y: 18, opacity: 0 });
  gsap.set(stage, { opacity: 0, y: 54 });
  gsap.set(pbox, { rotateY: -18, transformOrigin: "50% 50%" });
  gsap.set(chips, { opacity: 0, y: 22, scale: 0.92 });
}
function playIntro() {
  setStart();
  const tl = gsap.timeline({ defaults: { ease: "power3.out" }, onComplete: () => { body.classList.remove("pre-intro"); enableParallax(); } });
  tl.to(".eyebrow", { y: 0, opacity: 1, duration: 0.6 }, 0.1)
    .to(headlineSpans, { yPercent: 0, duration: 0.9, stagger: 0.1 }, 0.2)
    .to(stage, { opacity: 1, y: 0, duration: 1.1, ease: "power4.out" }, 0.55)
    .to(pbox, { rotateY: 0, duration: 1.1, ease: "power3.out" }, 0.6)
    .to(chips, { opacity: 1, y: 0, scale: 1, duration: 0.7, stagger: 0.14, ease: "back.out(1.5)" }, 1.0)
    .to([".tagline", ".hero__cta"], { y: 0, opacity: 1, duration: 0.7, stagger: 0.12 }, 0.95);
  return tl;
}
function settleInstantly() {
  gsap.set(headlineSpans, { yPercent: 0 });
  gsap.set(reveals, { y: 0, opacity: 1 });
  gsap.set(stage, { opacity: 1, y: 0 }); gsap.set(pbox, { rotateY: 0 });
  gsap.set(chips, { opacity: 1, y: 0, scale: 1 });
  body.classList.remove("pre-intro");
}

let parallaxOn = false;
function enableParallax() {
  if (reduceMotion || parallaxOn) return; parallaxOn = true;
  const setRX = gsap.quickTo(tilt, "--rx", { duration: 0.5, ease: "power2.out" });
  const setRY = gsap.quickTo(tilt, "--ry", { duration: 0.5, ease: "power2.out" });
  const cs = chips.map((c) => ({ depth: parseFloat(c.dataset.depth) || 0, x: gsap.quickTo(c, "x", { duration: 0.6, ease: "power2.out" }), y: gsap.quickTo(c, "y", { duration: 0.6, ease: "power2.out" }) }));
  window.addEventListener("pointermove", (e) => {
    const nx = e.clientX / window.innerWidth - 0.5, ny = e.clientY / window.innerHeight - 0.5;
    setRX(5 - ny * 9); setRY(-7 + nx * 12);
    cs.forEach((c) => { c.x(-nx * c.depth); c.y(-ny * c.depth); });
  });
  gsap.to(stage, { yPercent: -8, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: 0.5 } });
}

window.addEventListener("scroll", () => navbar.classList.toggle("scrolled", window.scrollY > 40));

const themeToggle = document.querySelector("#themeToggle");
if (localStorage.getItem("pp-theme") === "dark") document.documentElement.setAttribute("data-theme", "dark");
themeToggle.addEventListener("click", () => {
  const dark = document.documentElement.getAttribute("data-theme") === "dark";
  if (dark) { document.documentElement.removeAttribute("data-theme"); localStorage.setItem("pp-theme", "light"); }
  else { document.documentElement.setAttribute("data-theme", "dark"); localStorage.setItem("pp-theme", "dark"); }
});

document.querySelector("#replay").addEventListener("click", () => {
  window.scrollTo(0, 0); navbar.classList.remove("scrolled"); body.classList.add("pre-intro");
  if (reduceMotion) settleInstantly(); else playIntro();
});

function boot() { if (reduceMotion) settleInstantly(); else playIntro(); }
if (document.fonts && document.fonts.ready) document.fonts.ready.then(boot); else window.addEventListener("load", boot);
