/* Proxy Papers — Concept 04: Editorial Statement
   Intro: a large editorial line reveals word-by-word ("Votre patrimoine est structuré."),
   then the turn ("Vos données, rarement."), then resolves to the mark + wordmark.
   Shared mechanic afterwards: the persistent lockup shrinks & pins to the navbar centre on scroll. */

gsap.registerPlugin(ScrollTrigger);

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const body      = document.body;
const navbar    = document.querySelector("#navbar");
const lockup    = document.querySelector("#lockup");
const tagline   = document.querySelector(".tagline");
const scrollCue = document.querySelector(".scroll-cue");
const intro     = document.querySelector("#intro");
const statement = document.querySelector("#statement");

/* letter-split wordmark (revealed via lockup opacity here) */
function splitLetters(el) {
  const text = el.textContent; el.textContent = "";
  const frag = document.createDocumentFragment();
  [...text].forEach((ch) => { const s = document.createElement("span"); s.className = "ltr"; s.textContent = ch === " " ? " " : ch; frag.appendChild(s); });
  el.appendChild(frag); return el.querySelectorAll(".ltr");
}
const letters = splitLetters(document.querySelector(".wordmark"));

/* word-split a statement line into masked, reveal-able words */
function splitWords(lineEl) {
  const words = lineEl.textContent.trim().split(/\s+/);
  lineEl.textContent = "";
  const inner = [];
  words.forEach((w, i) => {
    const wrap = document.createElement("span"); wrap.className = "word";
    const span = document.createElement("span"); span.textContent = w;
    if (/rarement/i.test(w)) span.classList.add("accent");   // accent the turn
    wrap.appendChild(span); lineEl.appendChild(wrap);
    if (i < words.length - 1) lineEl.appendChild(document.createTextNode(" "));
    inner.push(span);
  });
  return inner;
}
const w1 = splitWords(document.querySelector(".line-1"));
const w2 = splitWords(document.querySelector(".line-2"));

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
   INTRO — editorial statement choreography
   ============================================================ */
function setIntroStart() {
  gsap.set(intro, { opacity: 1, display: "flex" });
  gsap.set(statement, { opacity: 1, y: 0 });
  gsap.set([...w1, ...w2], { yPercent: 116 });
  gsap.set(lockup, { opacity: 0 });
  gsap.set(letters, { opacity: 1, y: 0 });
  gsap.set(tagline, { opacity: 0, y: 14 });
  gsap.set([scrollCue, navbar], { opacity: 0 });
}

function playIntro() {
  setIntroStart();
  const tl = gsap.timeline({ onComplete: enableScroll });
  tl.to(w1, { yPercent: 0, duration: 0.72, stagger: 0.055, ease: "power3.out" }, 0.25)
    .to(w2, { yPercent: 0, duration: 0.72, stagger: 0.055, ease: "power3.out" }, 1.05)
    .to(statement, { opacity: 0, y: -26, duration: 0.6, ease: "power2.in", onComplete: () => gsap.set(intro, { display: "none" }) }, "+=0.95")
    .to(lockup, { opacity: 1, duration: 0.85, ease: "power2.out" }, "-=0.22")
    .to(tagline, { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }, "-=0.45")
    .to(scrollCue, { opacity: 1, duration: 0.6 }, "-=0.5")
    .to(navbar, { opacity: 1, duration: 0.7 }, "-=0.75");
  return tl;
}

function settleInstantly() {
  gsap.set(intro, { display: "none" });
  gsap.set([...w1, ...w2], { yPercent: 0 });
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
