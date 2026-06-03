/* Proxy Papers — Concept 03: Chaos to Order
   Intro: scattered document cards drift in, snap into one aligned stack,
   then dissolve as the mark + wordmark resolve out of it (dramatizes structurer/sécuriser).
   Shared mechanic afterwards: the persistent lockup shrinks & pins to the navbar centre on scroll. */

gsap.registerPlugin(ScrollTrigger);

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const body      = document.body;
const navbar    = document.querySelector("#navbar");
const lockup    = document.querySelector("#lockup");
const tagline   = document.querySelector(".tagline");
const scrollCue = document.querySelector(".scroll-cue");
const intro     = document.querySelector("#intro");
const field     = document.querySelector("#docField");

/* letter-split wordmark (kept for parity; revealed via lockup opacity here) */
function splitLetters(el) {
  const text = el.textContent; el.textContent = "";
  const frag = document.createDocumentFragment();
  [...text].forEach((ch) => { const s = document.createElement("span"); s.className = "ltr"; s.textContent = ch === " " ? " " : ch; frag.appendChild(s); });
  el.appendChild(frag); return el.querySelectorAll(".ltr");
}
const letters = splitLetters(document.querySelector(".wordmark"));

/* build the scattered documents */
const N = 7;
const scatter = [
  { x: -250, y: -50, r: -15 }, { x: 230, y: -95, r: 13 }, { x: -140, y: 110, r: -9 },
  { x: 175, y: 90, r: 17 }, { x: -285, y: 60, r: 7 }, { x: 70, y: -165, r: -12 }, { x: 300, y: 150, r: 10 },
];
const cards = [];
for (let i = 0; i < N; i++) { const d = document.createElement("div"); d.className = "doc"; field.appendChild(d); cards.push(d); }

/* ============================================================
   SHARED MECHANIC — scroll-driven shrink + pin to navbar centre
   ============================================================ */
const NAV_CENTER = 32;
const NAV_HEIGHT = 30;
let baseHeight = 1;
function measureBase() { gsap.set(lockup, { scale: 1, y: 0 }); baseHeight = lockup.getBoundingClientRect().height || 1; }

const shrink = gsap.timeline({
  scrollTrigger: { trigger: document.body, start: "top top", end: () => "+=" + window.innerHeight * 0.85, scrub: 0.4, invalidateOnRefresh: true, onRefreshInit: measureBase },
});
shrink
  .to(tagline,   { opacity: 0, y: -28, ease: "none" }, 0)
  .to(scrollCue, { opacity: 0, ease: "none" }, 0)
  .to(lockup, { y: () => NAV_CENTER - window.innerHeight / 2, scale: () => NAV_HEIGHT / baseHeight, ease: "none" }, 0);

window.addEventListener("scroll", () => { navbar.classList.toggle("scrolled", window.scrollY > 40); });

/* ============================================================
   INTRO — chaos → order choreography
   ============================================================ */
function setIntroStart() {
  gsap.set(intro, { opacity: 1, display: "flex" });
  gsap.set(lockup, { opacity: 0 });
  gsap.set(letters, { opacity: 1, y: 0 });
  cards.forEach((c, i) => gsap.set(c, { x: scatter[i].x, y: scatter[i].y, rotation: scatter[i].r, opacity: 0, scale: 1.05, transformOrigin: "50% 50%" }));
  gsap.set(tagline, { opacity: 0, y: 14 });
  gsap.set([scrollCue, navbar], { opacity: 0 });
}

function playIntro() {
  setIntroStart();
  const mid = (N - 1) / 2;
  const tl = gsap.timeline({ onComplete: enableScroll });
  tl.to(cards, { opacity: 1, duration: 0.55, stagger: 0.06, ease: "power2.out" }, 0.1)
    // snap into a tidy, near-aligned stack
    .to(cards, {
      x: (i) => (i - mid) * 2,
      y: (i) => (i - mid) * -2,
      rotation: (i) => (i - mid) * 1.1,
      scale: 1, duration: 0.95, stagger: 0.05, ease: "power3.inOut",
    }, 0.7)
    // dissolve the stack as the mark resolves out of it
    .to(cards, { opacity: 0, y: "-=10", scale: 0.97, duration: 0.5, stagger: 0.03, ease: "power2.in" }, "+=0.3")
    .to(lockup, { opacity: 1, duration: 0.85, ease: "power2.out" }, "-=0.42")
    .to(tagline, { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }, "-=0.45")
    .to(intro, { opacity: 0, duration: 0.5, onComplete: () => gsap.set(intro, { display: "none" }) }, "-=0.3")
    .to(scrollCue, { opacity: 1, duration: 0.6 }, "-=0.55")
    .to(navbar, { opacity: 1, duration: 0.7 }, "-=0.75");
  return tl;
}

function settleInstantly() {
  gsap.set(intro, { display: "none", opacity: 0 });
  gsap.set(lockup, { opacity: 1 });
  gsap.set(letters, { opacity: 1, y: 0 });
  gsap.set([tagline, scrollCue, navbar], { opacity: 1, y: 0 });
  enableScroll();
}

function enableScroll() { body.classList.remove("pre-intro"); ScrollTrigger.refresh(); }

/* ============================================================
   THEME TOGGLE (light default, persisted)
   ============================================================ */
const themeToggle = document.querySelector("#themeToggle");
if (localStorage.getItem("pp-theme") === "dark") document.documentElement.setAttribute("data-theme", "dark");
themeToggle.addEventListener("click", () => {
  const dark = document.documentElement.getAttribute("data-theme") === "dark";
  if (dark) { document.documentElement.removeAttribute("data-theme"); localStorage.setItem("pp-theme", "light"); }
  else { document.documentElement.setAttribute("data-theme", "dark"); localStorage.setItem("pp-theme", "dark"); }
});

/* ---------- replay (prototype only) ---------- */
document.querySelector("#replay").addEventListener("click", () => {
  window.scrollTo(0, 0);
  navbar.classList.remove("scrolled");
  body.classList.add("pre-intro");
  gsap.set(lockup, { scale: 1, y: 0 });
  if (reduceMotion) settleInstantly(); else playIntro();
});

/* ---------- boot ---------- */
function boot() { if (reduceMotion) settleInstantly(); else playIntro(); }
if (document.fonts && document.fonts.ready) document.fonts.ready.then(boot);
else window.addEventListener("load", boot);
