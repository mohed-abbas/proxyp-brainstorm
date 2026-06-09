/* ============================================================================
   Onboarding / Welcome — intro choreography
   The brand resolves onto the blue canvas: the watermark and clouds breathe in,
   the P-mark assembles, "Proxy" then "Papers" reveal letter-by-letter via a
   clip-wipe from each glyph's own baseline, and the hairline loader fills in
   step. Reduced motion or a missing GSAP CDN falls back to the settled state.

   Port note (React/Next): this is the screen's "mount effect". Lift the body
   into a useEffect/useGSAP hook; the markup is already a clean component tree.
   ========================================================================== */
(() => {
  "use strict";

  const root = document.documentElement;
  const SVGNS = "http://www.w3.org/2000/svg";
  const prefersReduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

  const start = () => {
    const lockup = document.querySelector(".ob-lockup");

    // Fallback: no GSAP (CDN blocked) or reduced motion → drop the armed class
    // so the CSS resolved state shows instantly, and stop.
    if (!window.gsap || prefersReduced || !lockup) {
      root.classList.remove("js");
      return;
    }

    const gsap = window.gsap;

    // ── Per-glyph clip-wipe setup ────────────────────────────────────────────
    // Wrap each path in a <g clip-path> whose rect bottom sits on the path's own
    // base. The path starts pushed below that base (clipped away) and slides up
    // into view — a crisp reveal from its own axis, no fade.
    const PAD_X = 2;
    const PAD_TOP = 6;
    const rise = new Map();
    let clipN = 0;

    let defs = lockup.querySelector("defs");
    if (!defs) {
      defs = document.createElementNS(SVGNS, "defs");
      lockup.insertBefore(defs, lockup.firstChild);
    }

    const wrap = (path) => {
      const bb = path.getBBox();
      const id = "ob-clip-" + clipN++;
      const cp = document.createElementNS(SVGNS, "clipPath");
      cp.setAttribute("id", id);
      cp.setAttribute("clipPathUnits", "userSpaceOnUse");
      const rect = document.createElementNS(SVGNS, "rect");
      rect.setAttribute("x", bb.x - PAD_X);
      rect.setAttribute("y", bb.y - PAD_TOP);
      rect.setAttribute("width", bb.width + PAD_X * 2);
      rect.setAttribute("height", bb.height + PAD_TOP);
      cp.appendChild(rect);
      defs.appendChild(cp);

      const g = document.createElementNS(SVGNS, "g");
      g.setAttribute("clip-path", "url(#" + id + ")");
      path.parentNode.insertBefore(g, path);
      g.appendChild(path);

      rise.set(path, bb.height + PAD_TOP);
    };

    const stem = lockup.querySelector(".lk-mark__stem");
    const blade = lockup.querySelector(".lk-mark__blade");
    const proxy = gsap.utils.toArray(
      lockup.querySelectorAll('[data-word="proxy"] .lk-glyph'),
    );
    const papers = gsap.utils.toArray(
      lockup.querySelectorAll('[data-word="papers"] .lk-glyph'),
    );
    const parts = [stem, blade, ...proxy, ...papers];
    parts.forEach(wrap);

    // Clips now hide everything; restore opacity (the CSS armed state had it 0
    // to avoid a flash) and park each part below its own base.
    gsap.set(lockup.querySelector(".lk-mark"), { opacity: 1 });
    gsap.set(parts, { opacity: 1, y: (i, t) => rise.get(t) });

    // ── Master intro timeline ─────────────────────────────────────────────────
    const STAG = 0.06;
    const tl = gsap.timeline({
      defaults: { ease: "power3.out" },
      paused: true,
    });

    // Atmosphere breathes in first, establishing the canvas the logo lands on.
    tl.to(".ob-watermark", { opacity: 0.2, duration: 1.6, ease: "power2.out" }, 0)
      .fromTo(
        ".ob-cloud--left",
        { opacity: 0, xPercent: -6 },
        { opacity: 1, xPercent: 0, duration: 1.8, ease: "power2.out" },
        0,
      )
      .fromTo(
        ".ob-cloud--top-right",
        { opacity: 0, yPercent: -5 },
        { opacity: 1, yPercent: 0, duration: 1.8, ease: "power2.out" },
        0.1,
      );

    // Logo assembles: mark leads, then Proxy, then Papers.
    tl.to([stem, blade], { y: 0, duration: 0.7, stagger: 0.14 }, 0.35)
      .to(proxy, { y: 0, duration: 0.7, stagger: STAG }, 0.65)
      .to(papers, { y: 0, duration: 0.7, stagger: STAG }, 0.93);

    // Hairline loader fills in step with the reveal (both land together).
    tl.fromTo(
      ".ob-divider__fill",
      { width: "0%" },
      { width: "100%", duration: 1.7, ease: "none" },
      0.35,
    );

    // Gentle, endless cloud drift once settled — atmosphere, not a loop you notice.
    const idle = () => {
      gsap.to(".ob-cloud--left", {
        xPercent: 2.5,
        yPercent: 1.5,
        duration: 14,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
      });
      gsap.to(".ob-cloud--top-right", {
        xPercent: -2,
        yPercent: 2.5,
        duration: 16,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
      });
    };
    tl.eventCallback("onComplete", idle);

    window.__obIntro = tl; // exposed for testing / scrubbing

    // ── Lenis smooth scroll ───────────────────────────────────────────────────
    // The welcome is a single viewport, but Lenis is wired now so the welcome→
    // hero scroll handoff (proven in the prototypes) composes on top unchanged,
    // and the house scroll feel is shared across every final screen.
    if (window.Lenis) {
      const lenis = new window.Lenis({
        duration: 1.8,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      });
      gsap.ticker.add((time) => lenis.raf(time * 1000));
      gsap.ticker.lagSmoothing(0);
      window.__lenis = lenis;
    }

    // ── Asset gate ────────────────────────────────────────────────────────────
    // Hold the intro until fonts + first-paint images are ready, so a cold-load
    // reflow/decode never lands mid-reveal. Resolve anyway after a short ceiling.
    const decode = (src) => {
      const img = new Image();
      img.src = src;
      return img.decode ? img.decode().catch(() => {}) : Promise.resolve();
    };
    const ready = Promise.all([
      document.fonts ? document.fonts.ready : Promise.resolve(),
      decode("assets/clouds.webp"),
      decode("assets/grain.webp"),
    ]);
    Promise.race([ready, new Promise((r) => setTimeout(r, 1200))]).then(() =>
      tl.play(),
    );
  };

  if (document.readyState === "loading") {
    window.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();
