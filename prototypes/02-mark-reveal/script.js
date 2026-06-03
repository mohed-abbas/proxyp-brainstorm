/* Proxy Papers — Concept 02: The Mark Reveal
   Intro: the P-mark assembles (bone stem + blue blade slide together at 45°),
   the wordmark reveals letter-by-letter, tagline rises.
   Then the SHARED mechanic: the lockup is one persistent element that, on scroll,
   scales down and pins to the centre of the navbar (à la Naked City Films). */

gsap.registerPlugin(ScrollTrigger);

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const body      = document.body;
const navbar    = document.querySelector("#navbar");
const lockup    = document.querySelector("#lockup");
const tagline   = document.querySelector(".tagline");
const scrollCue = document.querySelector(".scroll-cue");

/* ---------- letter-split the wordmark (for the reveal) ---------- */
function splitLetters(el) {
  const text = el.textContent;
  el.textContent = "";
  const frag = document.createDocumentFragment();
  [...text].forEach((ch) => {
    const s = document.createElement("span");
    s.className = "ltr";
    s.textContent = ch === " " ? " " : ch;
    frag.appendChild(s);
  });
  el.appendChild(frag);
  return el.querySelectorAll(".ltr");
}
const letters = splitLetters(document.querySelector(".wordmark"));

/* ============================================================
   SHARED MECHANIC — scroll-driven shrink + pin to navbar centre
   ============================================================ */
const NAV_CENTER = 32;     // navbar is 64px tall
const NAV_HEIGHT = 30;     // target lockup height when pinned (px)
let baseHeight = 1;

function measureBase() {
  gsap.set(lockup, { scale: 1, y: 0 });
  baseHeight = lockup.getBoundingClientRect().height || 1;
}

const shrink = gsap.timeline({
  scrollTrigger: {
    trigger: document.body,
    start: "top top",
    end: () => "+=" + window.innerHeight * 0.85,
    scrub: 0.4,
    invalidateOnRefresh: true,
    onRefreshInit: measureBase,
  },
});
shrink
  .to(tagline,   { opacity: 0, y: -28, ease: "none" }, 0)
  .to(scrollCue, { opacity: 0, ease: "none" }, 0)
  .to(lockup, {
    y: () => NAV_CENTER - window.innerHeight / 2,
    scale: () => NAV_HEIGHT / baseHeight,
    ease: "none",
  }, 0);

/* navbar surface appears once we leave the very top */
window.addEventListener("scroll", () => {
  navbar.classList.toggle("scrolled", window.scrollY > 40);
});

/* ============================================================
   INTRO — concept-specific choreography
   ============================================================ */
function setIntroStart() {
  gsap.set(".mark-blade", { xPercent: 64, yPercent: -58, rotation: -10, opacity: 0, transformOrigin: "50% 50%" });
  gsap.set(".mark-stem", { yPercent: 66, opacity: 0, transformOrigin: "50% 50%" });
  gsap.set(letters, { y: 16, opacity: 0 });
  gsap.set([tagline], { y: 14, opacity: 0 });
  gsap.set([scrollCue, navbar], { opacity: 0 });
}

function playIntro() {
  setIntroStart();
  const tl = gsap.timeline({ defaults: { ease: "power3.out" }, onComplete: enableScroll });
  tl.to(".mark-stem", { yPercent: 0, opacity: 1, duration: 0.9 }, 0.25)
    .to(".mark-blade", { xPercent: 0, yPercent: 0, rotation: 0, opacity: 1, duration: 1.05, ease: "power4.out" }, 0.38)
    .to(letters, { y: 0, opacity: 1, duration: 0.7, stagger: 0.028 }, 0.72)
    .to(tagline, { y: 0, opacity: 1, duration: 0.8 }, "-=0.25")
    .to(scrollCue, { opacity: 1, duration: 0.6 }, "-=0.4")
    .to(navbar, { opacity: 1, duration: 0.7 }, "-=0.7");
  return tl;
}

function settleInstantly() {
  gsap.set([".mark-blade", ".mark-stem", ...letters], { clearProps: "all" });
  gsap.set([".mark-blade"], { opacity: 1 });
  gsap.set([".mark-stem"], { opacity: 1 });
  gsap.set(letters, { y: 0, opacity: 1 });
  gsap.set([tagline, scrollCue, navbar], { opacity: 1, y: 0 });
  enableScroll();
}

function enableScroll() {
  body.classList.remove("pre-intro");
  ScrollTrigger.refresh();
}

/* ============================================================
   THEME TOGGLE (light default, persisted)
   ============================================================ */
const themeToggle = document.querySelector("#themeToggle");
const saved = localStorage.getItem("pp-theme");
if (saved === "dark") document.documentElement.setAttribute("data-theme", "dark");
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
  if (reduceMotion) settleInstantly();
  else playIntro();
  ScrollTrigger.refresh();
});

/* ---------- boot (after fonts so measurements are correct) ---------- */
function boot() {
  if (reduceMotion) settleInstantly();
  else playIntro();
  ScrollTrigger.refresh();
}
if (document.fonts && document.fonts.ready) document.fonts.ready.then(boot);
else window.addEventListener("load", boot);
