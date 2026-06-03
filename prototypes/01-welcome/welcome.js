/* Proxy Papers — Welcome / onboarding screen
   Concept: "Gradient Awakening" — motion lives in light & depth, not objects.
   Sequence: gradient breathes up → a single blue light traces across →
   mark + wordmark + tagline materialize from depth → settle → (on enter) dissolve to hero. */

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const welcome    = document.querySelector("#welcome");
const gradient   = document.querySelector(".bg-gradient");
const trace      = document.querySelector(".light-trace");
const pieces      = gsap.utils.toArray(".materialize"); // mark, wordmark, 2 tagline lines
const enterCue   = document.querySelector("#enterCue");
const hero        = document.querySelector(".hero");
const replayBtn  = document.querySelector("#replay");

let dissolved = false;

/* The slow, continuous "breathing" of the gradient — runs for the life of the screen. */
function startBreathing() {
  gsap.to(gradient, {
    scale: 1.14,
    xPercent: 3,
    yPercent: -3,
    duration: 9,
    ease: "sine.inOut",
    repeat: -1,
    yoyo: true,
  });
}

/* Intro timeline. */
function playIntro() {
  gsap.killTweensOf([gradient, trace, ...pieces, enterCue]);

  // reset
  gsap.set(welcome, { autoAlpha: 1, filter: "blur(0px)", scale: 1 });
  gsap.set(gradient, { opacity: 0, scale: 1, xPercent: 0, yPercent: 0 });
  gsap.set(trace, { opacity: 0, x: 0 });
  gsap.set(pieces, { "--blur": 18, opacity: 0, y: 16, scale: 0.97 });
  gsap.set(enterCue, { opacity: 0, y: 6 });

  const tl = gsap.timeline({ defaults: { ease: "power2.out" } });

  tl.to(gradient, { opacity: 1, duration: 1.6, ease: "power1.inOut" }, 0)
    .add(startBreathing, 0.4)
    // blue light traces diagonally across, once
    .fromTo(trace,
      { opacity: 0, x: 0 },
      { opacity: 1, duration: 0.5, ease: "power1.in" }, 0.35)
    .to(trace, { x: "140vw", duration: 1.5, ease: "power2.inOut" }, 0.4)
    .to(trace, { opacity: 0, duration: 0.7, ease: "power1.out" }, 1.2)
    // pieces materialize from depth, gentle stagger
    .to(pieces, {
      "--blur": 0,
      opacity: 1,
      y: 0,
      scale: 1,
      duration: 1.5,
      ease: "power2.out",
      stagger: 0.28,
    }, 0.7)
    // settle, then invite
    .to(enterCue, { opacity: 1, y: 0, duration: 0.8 }, "-=0.4")
    .add(pulseCue);

  return tl;
}

/* Soft pulse on the enter cue while idle. */
function pulseCue() {
  gsap.to(enterCue, {
    opacity: 0.55,
    duration: 1.4,
    ease: "sine.inOut",
    repeat: -1,
    yoyo: true,
  });
}

/* Dissolve the welcome into the hero — push forward, blur, fade. */
function dissolve() {
  if (dissolved) return;
  dissolved = true;
  hero.setAttribute("aria-hidden", "false");

  gsap.timeline({
    onComplete: () => { document.body.style.overflow = "auto"; },
  })
    .to(enterCue, { opacity: 0, duration: 0.3 }, 0)
    .to(welcome, {
      autoAlpha: 0,
      scale: 1.06,
      filter: "blur(14px)",
      duration: 1.1,
      ease: "power2.inOut",
    }, 0)
    .fromTo(hero,
      { opacity: 0 },
      { opacity: 1, duration: 1.0, ease: "power1.out" }, 0.2);
}

/* ---- wiring ---- */
enterCue.addEventListener("click", dissolve);

replayBtn.addEventListener("click", () => {
  dissolved = false;
  document.body.style.overflow = "hidden";
  hero.setAttribute("aria-hidden", "true");
  gsap.set(hero, { opacity: 0 });
  if (reduceMotion) { settleInstantly(); } else { playIntro(); }
});

/* Reduced-motion: skip straight to the settled state. */
function settleInstantly() {
  gsap.set(welcome, { autoAlpha: 1, filter: "blur(0px)", scale: 1 });
  gsap.set(gradient, { opacity: 1 });
  gsap.set(pieces, { "--blur": 0, opacity: 1, y: 0, scale: 1 });
  gsap.set(enterCue, { opacity: 1, y: 0 });
}

if (reduceMotion) settleInstantly();
else playIntro();
