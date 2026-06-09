/* ============================================================================
   Hero — intro choreography + document conveyor
   The lens opens, the headline reveals word-by-word, the body and CTAs rise, the
   brand card and its axis draw in, and the document conveyor fades up and begins
   a slow, endless drift — the one product-feel moment for the Papers Box. No
   GSAP / reduced motion falls back to the settled state.

   Port note (React/Next): DOCS is the data source for the conveyor — render it
   with .map() in JSX; the intro is a useGSAP/useEffect mount effect.
   ========================================================================== */
(() => {
  "use strict";

  const root = document.documentElement;
  const prefersReduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ── Document conveyor data ──────────────────────────────────────────────────
  // Realistic estate documents for a French HNWI (kept in EN to match the Figma).
  const DOCS = [
    { cat: "Real Estate", title: "Deed of sale", sub: "Primary residence", chips: [{ t: "Up to date" }, { t: "Shared" }] },
    { cat: "Tax", title: "Property tax notice", sub: "2026 assessment", chips: [{ t: "Due", due: true }, { t: "30 days", due: true }] },
    { cat: "Real Estate", title: "Rental lease", sub: "Investment property", chips: [{ t: "Renews" }, { t: "60 days" }] },
    { cat: "Legal", title: "Shareholders' agreement", sub: "Holding company", chips: [{ t: "Up to date" }, { t: "Private" }] },
    { cat: "Estate", title: "Will & testament", sub: "Notarized", chips: [{ t: "Up to date" }, { t: "Sealed" }] },
    { cat: "Insurance", title: "Life insurance policy", sub: "Beneficiary clause", chips: [{ t: "Renews" }, { t: "Annual" }] },
    { cat: "Banking", title: "Mandate of protection", sub: "Future protection", chips: [{ t: "Up to date" }, { t: "Shared" }] },
    { cat: "Tax", title: "Wealth tax return", sub: "IFI · 2025", chips: [{ t: "Filed" }, { t: "Archived" }] },
  ];

  // lucide "file" icon (stroke = currentColor)
  const FILE_ICON =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" ' +
    'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    '<path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5z"/>' +
    '<path d="M14 2v6h6"/></svg>';

  const rowMarkup = (d) => {
    const chips = d.chips
      .map(
        (c) =>
          `<span class="doc-row__chip${c.due ? " doc-row__chip--due" : ""}">${c.t}</span>`,
      )
      .join("");
    return (
      `<article class="doc-row">` +
      `<span class="doc-row__icon">${FILE_ICON}</span>` +
      `<span class="doc-row__main">` +
      `<span class="doc-row__title">${d.title}</span>` +
      `<span class="doc-row__sub">${d.sub}</span>` +
      `<span class="doc-row__chips">${chips}</span>` +
      `</span>` +
      `<span class="doc-row__cat">${d.cat}</span>` +
      `</article>`
    );
  };

  // Skeleton variant — same footprint as a content row, but placeholder bars
  // instead of readable data (the unstructured "before Proxy Papers" state).
  const skeletonMarkup = () =>
    `<article class="doc-row doc-row--skeleton">` +
    `<span class="doc-row__icon">${FILE_ICON}</span>` +
    `<span class="doc-row__main">` +
    `<span class="sk-bar sk-bar--title"></span>` +
    `<span class="sk-bar sk-bar--sub"></span>` +
    `<span class="doc-row__chips"><span class="sk-bar sk-bar--chip"></span><span class="sk-bar sk-bar--chip"></span></span>` +
    `</span>` +
    `<span class="sk-bar sk-bar--cat"></span>` +
    `</article>`;

  const buildConveyor = () => {
    const skTrack = document.querySelector("[data-conveyor-skeleton]");
    const ctTrack = document.querySelector("[data-conveyor-content]");
    if (!skTrack || !ctTrack) return;
    // Both layers share identical positions/order so each row's skeleton aligns
    // with its content as it crosses centre. Two passes → seamless loop.
    const skeleton = DOCS.map(skeletonMarkup).join("");
    const content = DOCS.map(rowMarkup).join("");
    skTrack.innerHTML = skeleton + skeleton;
    ctTrack.innerHTML = content + content;
  };

  const start = () => {
    buildConveyor(); // rows exist regardless of GSAP (decorative, progressive)

    const gsap = window.gsap;
    if (!gsap || prefersReduced) {
      root.classList.remove("js"); // settled state
      return;
    }

    // ── Intro timeline ────────────────────────────────────────────────────────
    const words = gsap.utils.toArray(".hero-lead__title .r-word__in");
    gsap.set(words, { yPercent: 110 });

    const tl = gsap.timeline({
      defaults: { ease: "power3.out" },
      paused: true,
    });

    // Lens opens from its waist, arcs included.
    tl.fromTo(
      ".hero-lens",
      { opacity: 0, scaleY: 0.9, transformOrigin: "50% 50%" },
      { opacity: 1, scaleY: 1, duration: 1.3, ease: "power2.out" },
      0,
    );

    // Headline reveals word-by-word.
    tl.to(words, { yPercent: 0, duration: 0.75, stagger: 0.08 }, 0.25);

    // Body + CTAs rise in.
    tl.fromTo(
      [".hero-lead__body", ".hero-lead__cta"],
      { opacity: 0, y: 16 },
      { opacity: 1, y: 0, duration: 0.7, stagger: 0.1 },
      0.6,
    );

    // Axis line draws, brand card pops, conveyor fades up.
    tl.fromTo(
      ".hero-axis__line",
      { scaleY: 0, transformOrigin: "50% 50%" },
      { scaleY: 1, opacity: 1, duration: 0.9, ease: "power2.inOut" },
      0.7,
    )
      .set(".hero-axis", { opacity: 1 }, 0.7)
      .fromTo(
        ".hero-axis__card",
        { opacity: 0, scale: 0.6 },
        { opacity: 1, scale: 1, duration: 0.7, ease: "back.out(1.7)" },
        1.0,
      )
      .to(".hero-conveyor", { opacity: 1, duration: 0.9 }, 0.9);

    // Statement settles in last.
    tl.fromTo(
      ".hero-statement",
      { opacity: 0, y: 16 },
      { opacity: 1, y: 0, duration: 0.8 },
      1.2,
    );

    // ── Endless conveyor drift LEFT→RIGHT (the product-feel moment) ─────────────
    // Both tracks run in lockstep so each skeleton row becomes its own content
    // row as it passes the centre. -50→0 moves the content rightward seamlessly.
    const tracks = gsap.utils.toArray(".hero-conveyor__track");
    const marquee = () => {
      if (tracks.length)
        gsap.fromTo(
          tracks,
          { xPercent: -50 },
          { xPercent: 0, duration: 64, ease: "none", repeat: -1 },
        );
    };
    tl.eventCallback("onComplete", marquee);

    // Subtle continuous cloud drift inside the lens.
    const idle = () => {
      gsap.to(".hero-cloud--left", { xPercent: 3, duration: 18, ease: "sine.inOut", repeat: -1, yoyo: true });
      gsap.to(".hero-cloud--right", { xPercent: -3, duration: 20, ease: "sine.inOut", repeat: -1, yoyo: true });
    };
    idle();

    window.__heroIntro = tl;

    // ── Lenis (shared house scroll feel; ready for the page below the hero) ─────
    if (window.Lenis) {
      const lenis = new window.Lenis({
        duration: 1.8,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      });
      gsap.ticker.add((time) => lenis.raf(time * 1000));
      gsap.ticker.lagSmoothing(0);
      window.__lenis = lenis;
    }

    // ── Asset gate ──────────────────────────────────────────────────────────────
    const decode = (src) => {
      const img = new Image();
      img.src = src;
      return img.decode ? img.decode().catch(() => {}) : Promise.resolve();
    };
    const ready = Promise.all([
      document.fonts ? document.fonts.ready : Promise.resolve(),
      decode("assets/hero-lens.webp"),
      decode("assets/clouds.webp"),
    ]);
    Promise.race([ready, new Promise((r) => setTimeout(r, 1400))]).then(() =>
      tl.play(),
    );
  };

  if (document.readyState === "loading") {
    window.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();
