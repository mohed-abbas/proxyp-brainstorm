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

  // ── Problem section (below the hero) ───────────────────────────────────────
  // Wrap each WORD of an element in its own overflow-masked track and return the
  // inner spans, so they rise + clip in independently. Words stay inline-block,
  // so they still wrap naturally across lines.
  const splitWords = (el) => {
    const text = el.textContent.replace(/\s+/g, " ").trim();
    el.textContent = "";
    return text.split(" ").map((w) => {
      const word = document.createElement("span");
      word.className = "r-word";
      const inner = document.createElement("span");
      inner.className = "r-word__in";
      inner.textContent = w;
      word.appendChild(inner);
      el.appendChild(word);
      el.appendChild(document.createTextNode(" "));
      return inner;
    });
  };

  // The problem section reveals as it scrolls into view (ScrollTrigger), not on
  // load — the visitor is still on the hero at load. Same per-word stagger as
  // the rest of the brand; the three data cards settle up after the body. Each
  // card traces its blue zigzag on hover.
  const setupProblem = (gsap) => {
    const section = document.querySelector(".problem");
    if (!section) return;
    const ST = window.ScrollTrigger;

    const eyebrowWords = splitWords(section.querySelector(".problem__eyebrow-label"));
    const headlineWords = splitWords(section.querySelector(".problem__headline"));
    const bodyWords = splitWords(section.querySelector(".problem__body"));
    const rule = section.querySelector(".problem__eyebrow-rule");
    const cards = gsap.utils.toArray(".problem-card");
    const allWords = [...eyebrowWords, ...headlineWords, ...bodyWords];

    // Unhide the containers (the words/cards are parked, so still invisible).
    gsap.set([".problem__eyebrow", ".problem__headline", ".problem__body"], {
      visibility: "visible",
    });

    // Two zigzag behaviours (pathLength=100 normalises the draw across sizes):
    //  • VOLUME (large) — draws itself in with the reveal and rests DRAWN; hover
    //    plays it in REVERSE (undraws), leaving redraws it.
    //  • FRICTION + RISK (small) — rest invisible; draw on hover, erase on leave.
    const volumeCard = section.querySelector(".problem-card--volume");
    const volumePath = volumeCard && volumeCard.querySelector(".zigzag__path");
    const smallPaths = cards
      .filter((c) => c !== volumeCard)
      .map((c) => c.querySelector(".zigzag__path"))
      .filter(Boolean);

    const animate = (path, offset, dur = 0.9) =>
      gsap.to(path, { strokeDashoffset: offset, duration: dur, ease: "power2.inOut", overwrite: true });

    gsap.set([volumePath, ...smallPaths], { strokeDasharray: 100 });

    if (volumePath) {
      volumeCard.addEventListener("mouseenter", () => animate(volumePath, 100)); // reverse
      volumeCard.addEventListener("mouseleave", () => animate(volumePath, 0)); // redraw
    }
    smallPaths.forEach((path) => {
      gsap.set(path, { strokeDashoffset: 100 }); // rests invisible
      const card = path.closest(".problem-card");
      card.addEventListener("mouseenter", () => animate(path, 0));
      card.addEventListener("mouseleave", () => animate(path, 100));
    });

    // No ScrollTrigger → just show the settled state (VOLUME drawn).
    if (!ST) {
      gsap.set(allWords, { yPercent: 0 });
      gsap.set(rule, { autoAlpha: 1, scaleX: 1 });
      gsap.set(cards, { autoAlpha: 1, y: 0 });
      if (volumePath) gsap.set(volumePath, { strokeDashoffset: 0 });
      return;
    }

    // Parked start state.
    gsap.set(allWords, { yPercent: 120 });
    gsap.set(rule, { autoAlpha: 0, scaleX: 0, rotation: 0.33, transformOrigin: "left center" });
    gsap.set(cards, { autoAlpha: 0, y: 28 });
    if (volumePath) gsap.set(volumePath, { strokeDashoffset: 100 }); // starts undrawn

    const tl = gsap
      .timeline({
        defaults: { ease: "power3.out", force3D: true },
        scrollTrigger: { trigger: section, start: "top 72%", once: true },
      })
      .to(eyebrowWords, { yPercent: 0, duration: 0.6 }, 0.0)
      .to(rule, { autoAlpha: 1, scaleX: 1, duration: 0.7 }, 0.1)
      .to(headlineWords, { yPercent: 0, duration: 0.7, stagger: 0.06 }, 0.25)
      .to(bodyWords, { yPercent: 0, duration: 0.7, stagger: 0.018 }, 0.7)
      .to(cards, { autoAlpha: 1, y: 0, duration: 0.8, stagger: 0.14 }, 0.95);

    // VOLUME's zigzag draws itself along its path as the card settles in.
    if (volumePath)
      tl.to(volumePath, { strokeDashoffset: 0, duration: 1.2, ease: "power2.inOut" }, 0.95);
  };

  // The profiles section reveals as it scrolls into view (ScrollTrigger), same
  // as the problem section: title + body rise word-by-word, then the three fanned
  // cards settle up centre-first. Hover lift is pure CSS (see profiles.css), so
  // there's nothing to wire here for it.
  const setupProfiles = (gsap) => {
    const section = document.querySelector(".profiles");
    if (!section) return;
    const ST = window.ScrollTrigger;

    const titleWords = gsap.utils
      .toArray(".profiles__title-line", section)
      .flatMap(splitWords);
    const bodyWords = splitWords(section.querySelector(".profiles__body"));
    const allWords = [...titleWords, ...bodyWords];

    // Reveal order: 02 (centre, on top) first, then the two blue cards.
    const cards = ["--02", "--01", "--03"]
      .map((m) => section.querySelector(`.profiles__card${m}`))
      .filter(Boolean);

    gsap.set([".profiles__title", ".profiles__body"], { visibility: "visible" });

    // No ScrollTrigger → settled state.
    if (!ST) {
      gsap.set(allWords, { yPercent: 0 });
      gsap.set(cards, { autoAlpha: 1, y: 0 });
      return;
    }

    // Parked start state.
    gsap.set(allWords, { yPercent: 120 });
    gsap.set(cards, { autoAlpha: 0, y: 30 });

    gsap
      .timeline({
        defaults: { ease: "power3.out", force3D: true },
        scrollTrigger: { trigger: section, start: "top 72%", once: true },
      })
      .to(titleWords, { yPercent: 0, duration: 0.7, stagger: 0.06 }, 0.0)
      .to(bodyWords, { yPercent: 0, duration: 0.7, stagger: 0.018 }, 0.35)
      .to(cards, { autoAlpha: 1, y: 0, duration: 0.85, stagger: 0.12 }, 0.5);
  };

  // The method section reveals as it scrolls into view (ScrollTrigger), same
  // house style: header rises word-by-word, then the five step rows settle up
  // top-to-bottom, and the "full approach" link fades in last. Link hover is
  // pure CSS (see method.css).
  const setupMethod = (gsap) => {
    const section = document.querySelector(".method");
    if (!section) return;
    const ST = window.ScrollTrigger;

    const titleWords = gsap.utils
      .toArray(".method__title-seg", section)
      .flatMap(splitWords);
    const ledeWords = splitWords(section.querySelector(".method__lede"));
    const allWords = [...titleWords, ...ledeWords];
    const steps = gsap.utils.toArray(".method__step", section);
    const link = section.querySelector(".method__link");

    gsap.set([".method__head", ".method__steps", ".method__link"], {
      visibility: "visible",
    });

    // No ScrollTrigger → settled state.
    if (!ST) {
      gsap.set(allWords, { yPercent: 0 });
      gsap.set([...steps, link], { autoAlpha: 1, y: 0 });
      return;
    }

    // Parked start state.
    gsap.set(allWords, { yPercent: 120 });
    gsap.set(steps, { autoAlpha: 0, y: 30 });
    gsap.set(link, { autoAlpha: 0, y: 16 });

    gsap
      .timeline({
        defaults: { ease: "power3.out", force3D: true },
        scrollTrigger: { trigger: section, start: "top 72%", once: true },
      })
      .to(titleWords, { yPercent: 0, duration: 0.7, stagger: 0.06 }, 0.0)
      .to(ledeWords, { yPercent: 0, duration: 0.7, stagger: 0.018 }, 0.3)
      .to(steps, { autoAlpha: 1, y: 0, duration: 0.7, stagger: 0.1 }, 0.45)
      .to(link, { autoAlpha: 1, y: 0, duration: 0.6 }, 1.0);
  };

  // The trust band reveals as it scrolls into view (ScrollTrigger), house style:
  // the centred title and body rise word-by-word. The inset frame is static.
  const setupTrust = (gsap) => {
    const section = document.querySelector(".trust");
    if (!section) return;
    const ST = window.ScrollTrigger;

    const titleWords = gsap.utils
      .toArray(".trust__title-line", section)
      .flatMap(splitWords);
    const bodyWords = splitWords(section.querySelector(".trust__body"));
    const allWords = [...titleWords, ...bodyWords];

    gsap.set(".trust__content", { visibility: "visible" });

    if (!ST) {
      gsap.set(allWords, { yPercent: 0 });
      return;
    }

    gsap.set(allWords, { yPercent: 120 });
    gsap
      .timeline({
        defaults: { ease: "power3.out", force3D: true },
        scrollTrigger: { trigger: section, start: "top 78%", once: true },
      })
      .to(titleWords, { yPercent: 0, duration: 0.7, stagger: 0.06 }, 0.0)
      .to(bodyWords, { yPercent: 0, duration: 0.7, stagger: 0.016 }, 0.3);
  };

  // The referrers section reveals as it scrolls into view (ScrollTrigger): the
  // title rises word-by-word, the orbit assembles (rings fade in, mark pops, the
  // five avatars pop in around it), then the body and CTA settle. Orbit is
  // decorative; CTA hover is pure CSS.
  const setupReferrers = (gsap) => {
    const section = document.querySelector(".referrers");
    if (!section) return;
    const ST = window.ScrollTrigger;

    const titleWords = splitWords(section.querySelector(".referrers__title"));
    const bodyWords = splitWords(section.querySelector(".referrers__body"));
    const allWords = [...titleWords, ...bodyWords];
    const rings = section.querySelector(".referrers__rings");
    const mark = section.querySelector(".referrers__mark");
    const avatars = gsap.utils.toArray(".referrers__avatar", section);
    const cta = section.querySelector(".referrers__cta");

    gsap.set([".referrers__title", ".referrers__orbit", ".referrers__foot"], {
      visibility: "visible",
    });

    if (!ST) {
      gsap.set(allWords, { yPercent: 0 });
      gsap.set([rings, mark, ...avatars, cta], { autoAlpha: 1, scale: 1, y: 0 });
      return;
    }

    gsap.set(allWords, { yPercent: 120 });
    gsap.set(rings, { autoAlpha: 0, scale: 0.85, transformOrigin: "50% 50%" });
    gsap.set([mark, ...avatars], { autoAlpha: 0, scale: 0, transformOrigin: "50% 50%" });
    gsap.set(cta, { autoAlpha: 0, y: 16 });

    gsap
      .timeline({
        defaults: { ease: "power3.out", force3D: true },
        scrollTrigger: { trigger: section, start: "top 70%", once: true },
      })
      .to(titleWords, { yPercent: 0, duration: 0.7, stagger: 0.05 }, 0.0)
      .to(rings, { autoAlpha: 1, scale: 1, duration: 0.9, ease: "power2.out" }, 0.25)
      .to(mark, { autoAlpha: 1, scale: 1, duration: 0.6, ease: "back.out(1.6)" }, 0.4)
      .to(avatars, { autoAlpha: 1, scale: 1, duration: 0.55, ease: "back.out(1.7)", stagger: 0.09 }, 0.5)
      .to(bodyWords, { yPercent: 0, duration: 0.7, stagger: 0.014 }, 0.7)
      .to(cta, { autoAlpha: 1, y: 0, duration: 0.6 }, 1.0);
  };

  // Navbar theme switching — the fixed lockup recolors to match the section
  // currently under it, so its blue blade never lands blue-on-blue (e.g. over the
  // all-blue method panel the mark goes all-bone). Driven by an IntersectionObserver
  // — independent of GSAP/Lenis, so it works under reduced motion too. Each section
  // declares its tone via data-nav-theme; theme.css owns the actual token values.
  const setupNavTheme = () => {
    const nav = document.querySelector(".pp-nav");
    const sections = [...document.querySelectorAll("[data-nav-theme]")];
    if (!nav || !sections.length || !("IntersectionObserver" in window)) return;

    const THEME_CLASSES = ["pp-theme-dark", "pp-theme-blue", "pp-theme-light"];
    const apply = (theme) => {
      const cls = "pp-theme-" + theme;
      if (nav.classList.contains(cls)) return;
      nav.classList.remove(...THEME_CLASSES);
      nav.classList.add(cls);
    };

    // A 1px detection band at the navbar's vertical centre. The section whose body
    // crosses that line owns the bar's theme. Rebuilt on resize (navbar is vw-sized).
    let io;
    const build = () => {
      if (io) io.disconnect();
      const r = nav.getBoundingClientRect();
      const line = r.top + r.height / 2;
      const below = Math.max(0, window.innerHeight - line - 1);
      io = new IntersectionObserver(
        (entries) =>
          entries.forEach((e) => {
            if (e.isIntersecting) apply(e.target.dataset.navTheme);
          }),
        { rootMargin: `-${line}px 0px -${below}px 0px`, threshold: 0 },
      );
      sections.forEach((s) => io.observe(s));
    };
    build();
    addEventListener("resize", build, { passive: true });
  };

  const start = () => {
    buildConveyor(); // rows exist regardless of GSAP (decorative, progressive)
    setupNavTheme(); // always on — not gated behind GSAP/reduced motion

    const gsap = window.gsap;
    if (!gsap || prefersReduced) {
      root.classList.remove("js"); // settled state
      return;
    }
    if (window.ScrollTrigger) gsap.registerPlugin(window.ScrollTrigger);

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

    // ── Lenis — one shared instance for the whole page (hero + problem + …) ─────
    if (window.Lenis) {
      const lenis = new window.Lenis({
        duration: 1.8,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      });
      gsap.ticker.add((time) => lenis.raf(time * 1000));
      gsap.ticker.lagSmoothing(0);
      // Keep ScrollTrigger in sync with Lenis's virtual scroll position.
      if (window.ScrollTrigger) lenis.on("scroll", window.ScrollTrigger.update);
      window.__lenis = lenis;
    }

    // Build the problem + profiles scroll-in reveals.
    setupProblem(gsap);
    setupProfiles(gsap);
    setupMethod(gsap);
    setupTrust(gsap);
    setupReferrers(gsap);

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
