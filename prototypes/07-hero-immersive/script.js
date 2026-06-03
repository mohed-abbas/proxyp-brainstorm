/* Proxy Papers — Hero 07: "Immersive" (product-forward)
   Headline reveals, the Papers Box scales/settles in 3D with orbiting chips,
   then a continuous idle float; mouse-parallax tilts it and shifts chips by depth. */

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
  gsap.set(tilt, { opacity: 0 });
  gsap.set(pbox, { scale: 0.9, y: 30, transformOrigin: "50% 50%" });
  gsap.set(chips, { opacity: 0, scale: 0.86 });
}
function playIntro() {
  setStart();
  const tl = gsap.timeline({ defaults: { ease: "power3.out" }, onComplete: () => { body.classList.remove("pre-intro"); enableMotion(); } });
  tl.to(".eyebrow", { y: 0, opacity: 1, duration: 0.6 }, 0.1)
    .to(headlineSpans, { yPercent: 0, duration: 0.85, stagger: 0.09 }, 0.2)
    .to(tilt, { opacity: 1, duration: 0.6 }, 0.5)
    .to(pbox, { scale: 1, y: 0, duration: 1.15, ease: "power4.out" }, 0.5)
    .to(chips, { opacity: 1, scale: 1, duration: 0.7, stagger: 0.13, ease: "back.out(1.6)" }, 0.95)
    .to(".hero__cta", { y: 0, opacity: 1, duration: 0.7 }, 1.05);
  return tl;
}
function settleInstantly() {
  gsap.set(headlineSpans, { yPercent: 0 });
  gsap.set(reveals, { y: 0, opacity: 1 });
  gsap.set(tilt, { opacity: 1 }); gsap.set(pbox, { scale: 1, y: 0 });
  gsap.set(chips, { opacity: 1, scale: 1 });
  body.classList.remove("pre-intro");
}

let motionOn = false;
function enableMotion() {
  if (reduceMotion || motionOn) return; motionOn = true;
  // continuous idle float on the card
  gsap.to(pbox, { y: "+=14", duration: 3.6, ease: "sine.inOut", repeat: -1, yoyo: true });
  chips.forEach((c, i) => gsap.to(c, { y: "+=" + (8 + i * 3), duration: 3 + i * 0.5, ease: "sine.inOut", repeat: -1, yoyo: true, delay: i * 0.3 }));
  // mouse parallax (rotation on card; depth-shift chips via x only to avoid clashing with idle-y)
  const setRX = gsap.quickTo(tilt, "--rx", { duration: 0.5, ease: "power2.out" });
  const setRY = gsap.quickTo(tilt, "--ry", { duration: 0.5, ease: "power2.out" });
  const cs = chips.map((c) => ({ depth: parseFloat(c.dataset.depth) || 0, x: gsap.quickTo(c, "x", { duration: 0.6, ease: "power2.out" }) }));
  window.addEventListener("pointermove", (e) => {
    const nx = e.clientX / window.innerWidth - 0.5, ny = e.clientY / window.innerHeight - 0.5;
    setRX(6 - ny * 9); setRY(nx * 13);
    cs.forEach((c) => c.x(-nx * c.depth));
  });
  // scroll: slight scale-down + lift as you leave the hero
  gsap.to(stage, { yPercent: -10, scale: 0.96, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: 0.5 } });
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
  gsap.killTweensOf([pbox, ...chips]); motionOn = false;
  if (reduceMotion) settleInstantly(); else playIntro();
});

function boot() { if (reduceMotion) settleInstantly(); else playIntro(); }
if (document.fonts && document.fonts.ready) document.fonts.ready.then(boot); else window.addEventListener("load", boot);
