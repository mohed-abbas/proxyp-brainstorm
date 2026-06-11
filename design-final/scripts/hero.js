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

  // The profiles section is a PINNED, scrubbed 3D flip. Two independent triggers:
  //  A) the header (title + body) rises word-by-word on its own once-reveal;
  //  B) the deck + CTA: the section pins when framed, and the flip scrubs across
  //     the pin — each card winds out of a fanned FRONT stack (un-tilting rotation→0,
  //     spreading x/y→0, flipping rotateY 0→180 to its named BACK), centre-first,
  //     then the CTA fades up and the deck HOLDS for a reading dwell before release.
  // The CSS base is the resolved flat back-spread, so no-JS / reduced motion lands
  // there; here we wind the cards back into the fan and play them forward.
  // Transform layering (see profiles.css): outer .profiles__card = slot + perspective
  // + hover (GSAP-free); .profiles__card-pos = spread + tilt; .profiles__card-flip =
  // rotateY. The fan offset lives in each card's --dx/--dy/--rot vars (read here).
  const setupProfiles = (gsap) => {
    const section = document.querySelector(".profiles");
    if (!section) return;
    const ST = window.ScrollTrigger;

    const titleWords = gsap.utils
      .toArray(".profiles__title-line", section)
      .flatMap(splitWords);
    const bodyWords = splitWords(section.querySelector(".profiles__body"));
    const allWords = [...titleWords, ...bodyWords];

    // Centre-first order (02 leads), matching the deck's read.
    const cards = ["--02", "--01", "--03"]
      .map((m) => section.querySelector(`.profiles__card${m}`))
      .filter(Boolean);
    const pos = cards.map((c) => c.querySelector(".profiles__card-pos"));
    const flips = cards.map((c) => c.querySelector(".profiles__card-flip"));
    const cta = section.querySelector(".profiles__cta");

    // Fan offset each card winds back to at p=0 — single source: the inline vars.
    // GSAP 3.12 does NOT resolve vw units on x/y (it treats "18.98vw" as ~19px),
    // so we convert the authored vw offsets to pixels against the live viewport
    // here — keeping the deltas responsive while landing the exact stack we want.
    const vwToPx = (v) => {
      v = (v || "").trim();
      if (v.endsWith("vw")) return (parseFloat(v) * window.innerWidth) / 100;
      return parseFloat(v) || 0;
    };
    const fan = cards.map((c) => {
      const cs = getComputedStyle(c);
      return {
        dx: vwToPx(cs.getPropertyValue("--dx")),
        dy: vwToPx(cs.getPropertyValue("--dy")),
        rot: parseFloat(cs.getPropertyValue("--rot")) || 0,
      };
    });

    gsap.set([".profiles__title", ".profiles__body"], { visibility: "visible" });

    // No ScrollTrigger → resolved state (flat spread, backs out, CTA shown).
    if (!ST) {
      gsap.set(allWords, { yPercent: 0 });
      gsap.set(pos, { x: 0, y: 0, rotation: 0 });
      gsap.set(flips, { rotationY: 180 });
      gsap.set(cta, { autoAlpha: 1, y: 0 });
      cards.forEach((c) => c.classList.add("is-settled"));
      return;
    }

    // ── A. Header once-reveal ──────────────────────────────────────────────
    gsap.set(allWords, { yPercent: 120 });
    gsap
      .timeline({
        defaults: { ease: "power3.out", force3D: true },
        scrollTrigger: { trigger: section, start: "top 72%", once: true },
      })
      .to(titleWords, { yPercent: 0, duration: 0.7, stagger: 0.06 }, 0.0)
      .to(bodyWords, { yPercent: 0, duration: 0.7, stagger: 0.018 }, 0.35);

    // ── B. Deck + CTA — pinned, scrubbed flip with a reading dwell ─────────
    // The section PINS when it reaches the top of the viewport (whole composition
    // framed), then the flip SCRUBS across the pin. Because the pace is set by the
    // pin DISTANCE we choose (one viewport) rather than scroll velocity, it's slow
    // and smooth — and eased tweens keep it consistent with the rest of the site.
    // The flip resolves in the first ~⅔ of the pin; the tail HOLDS the flipped deck
    // still so the cards can be read before the section releases.
    // Park at the fanned FRONT: wind back from the CSS base (flat back-spread).
    pos.forEach((p, i) =>
      gsap.set(p, { x: fan[i].dx, y: fan[i].dy, rotation: fan[i].rot, force3D: true })
    );
    gsap.set(flips, { rotationY: 0, force3D: true });
    gsap.set(cta, { autoAlpha: 0, y: 16 });

    const deck = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: "top top",
        end: "+=160%", // generous pin → the flip is spread over ~1.5× more scroll
                       // than a one-viewport pin, so each degree of rotation costs
                       // more wheel — the motion reads slow and deliberate, not fast.
        pin: true,
        anticipatePin: 1,
        scrub: 2.4, // heavy smoothing: the timeline trails the wheel by a longer
                    // beat and glides to rest when you stop, so the pin feels soft
                    // and inertial. NB this does not change the SPEED — the scroll-
                    // distance→rotation mapping (set by the pin distance) is the
                    // same; scrub only governs how softly it tracks/settles.
        onUpdate: (self) => {
          // Hover enabled only after the flip resolves (~0.66 through the timeline;
          // the remainder is the reading dwell).
          const settled = self.progress > 0.66;
          cards.forEach((c) => c.classList.toggle("is-settled", settled));
        },
      },
    });
    deck
      // un-tilt + spread to the flat slots. ease-IN-out (not out): the cards ease
      // INTO motion as the pin engages, so the lock feels soft instead of snapping
      // straight to full speed; they also ease to rest at the slots.
      .to(pos, { x: 0, y: 0, rotation: 0, duration: 1.2, stagger: 0.15, ease: "power1.inOut", force3D: true }, 0)
      // flip front→back — gentle in-out so there's no fast mid-rotation burst.
      .to(flips, { rotationY: 180, duration: 1.4, stagger: 0.15, ease: "power1.inOut", force3D: true }, 0.3)
      // CTA fades up as the flip lands
      .to(cta, { autoAlpha: 1, y: 0, duration: 0.5, ease: "power2.out" }, 1.6)
      // dwell — hold the flipped deck still so the cards can be read before release
      .to({}, { duration: 0.9 });

    window.__profilesDeck = deck;
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

  // The closing CTA band reveals as it scrolls into view (ScrollTrigger): the
  // oversized headline rises word-by-word, then the link + reassurance copy
  // settle in. Link hover is pure CSS.
  const setupClosing = (gsap) => {
    const section = document.querySelector(".closing");
    if (!section) return;
    const ST = window.ScrollTrigger;

    const titleWords = splitWords(section.querySelector(".closing__title"));
    const bodyWords = splitWords(section.querySelector(".closing__body"));
    const link = section.querySelector(".closing__link");

    gsap.set([".closing__title", ".closing__action"], { visibility: "visible" });

    if (!ST) {
      gsap.set([...titleWords, ...bodyWords], { yPercent: 0 });
      gsap.set(link, { autoAlpha: 1, y: 0 });
      return;
    }

    gsap.set([...titleWords, ...bodyWords], { yPercent: 120 });
    gsap.set(link, { autoAlpha: 0, y: 16 });

    gsap
      .timeline({
        defaults: { ease: "power3.out", force3D: true },
        scrollTrigger: { trigger: section, start: "top 78%", once: true },
      })
      .to(titleWords, { yPercent: 0, duration: 0.75, stagger: 0.07 }, 0.0)
      .to(link, { autoAlpha: 1, y: 0, duration: 0.6 }, 0.45)
      .to(bodyWords, { yPercent: 0, duration: 0.7, stagger: 0.016 }, 0.55);
  };

  // The footer is where the brand comes HOME — the reverse of the onboarding
  // curtain (see runCurtain). As the visitor scrolls into the bottom of the page,
  // the navbar's pinned P-mark detaches, grows ~20x and settles into the footer
  // lockup; "Proxy / Papers" rises behind its masks; the footer nav row + legal
  // settle; and the now-empty navbar pill fades away. Scroll back up and it all
  // reverses (the mark shrinks back into the navbar). Scroll-SCRUBBED across the
  // footer's own height (it is taller than the viewport, so we don't pin) — the
  // whole sequence is tied to scroll position and fully reversible.
  //
  // Mechanic mirrors runCurtain: a position:fixed SVG clone of the mark's two
  // paths flies between two live-measured rects. Here source = the navbar logo
  // (fixed, stable) and target = where the footer mark rests AT PAGE BOTTOM —
  // computable without scrolling there (docTop - maxScroll), since the footer is
  // the last element. Geometry is re-measured on ScrollTrigger refresh (resize).
  const setupFooter = (gsap) => {
    const section = document.querySelector(".footer");
    if (!section) return;
    const ST = window.ScrollTrigger;

    const navWords = gsap.utils
      .toArray(section.querySelectorAll(".footer__nav-link"))
      .flatMap(splitWords);
    const legalWords = gsap.utils
      .toArray(section.querySelectorAll(".footer__legal p, .footer__legal-links a"))
      .flatMap(splitWords);
    const wordLines = gsap.utils.toArray(section.querySelectorAll(".footer__word-in"));
    const wordMasks = gsap.utils.toArray(section.querySelectorAll(".footer__word-line"));
    const rules = gsap.utils.toArray(section.querySelectorAll(".footer__rule"));
    const mark = section.querySelector(".footer__mark");

    gsap.set([".footer__nav", ".footer__lockup", ".footer__legal"], {
      visibility: "visible",
    });

    // Settled fallback — no ScrollTrigger (also the !gsap / reduced-motion paths,
    // which strip .js upstream so the CSS armed states paint): footer fully shown,
    // navbar untouched, no clone, descenders visible.
    if (!ST) {
      gsap.set([...navWords, ...legalWords, ...wordLines], { yPercent: 0 });
      gsap.set([mark, ...rules], { autoAlpha: 1 });
      gsap.set(wordMasks, { overflow: "visible" });
      return;
    }

    const INK = "#161718";
    const BONE = "#f7f4f0";
    const BLUE = "#5a90f4";

    // The footer is taller than the viewport, so we can't pin and can't see the whole
    // band at once — it reveals top-to-bottom as you scroll. The flow the client asked
    // for is strictly LOGO-FIRST, TEXT-SECOND:
    //   0   .. ARM   the footer rises into view BLANK (the dark band, nothing armed)
    //   ARM          the footer has climbed to ~60% of the viewport → the navbar's
    //                pinned mark UNPINS (a fixed clone stands in) and the pill fades
    //   ARM .. LAND  the clone flies DOWN + grows ~20× into the footer lockup
    //   LAND         the clone lands exactly on the real .footer__mark — swapped for it
    //   LAND .. 1    only NOW does the text reveal — wordmark, nav row, rules, legal —
    //                in physical top-to-bottom order so each lands while it is on screen
    // Fully scroll-scrubbed and reversible (scroll up → text retracts, mark shrinks back
    // into the navbar, pill returns). ARM/LAND are scroll-progress fractions of the
    // footer's own height; the landing GEOMETRY is re-measured live, so the swap is
    // pixel-exact at any viewport size even though the beats stay fixed.
    const ARM = 0.4; // flight begins — footer ~60% up the viewport (tuned in verify)
    const LAND = 0.7; // clone lands on the real mark; the text reveal starts here

    // ── Build the flying mark — a clone of the navbar logo's stem + blade, lifted to
    // z 150 (above the navbar's 100) so it rides over everything as it flies. The stem
    // starts INK (matching the navbar over the light closing section, where a bone stem
    // would vanish) and flips to BONE as it grows onto the dark footer; the blade stays
    // Proxy Blue throughout.
    const navLogo = document.querySelector(".pp-nav__logo");
    const navSvg = navLogo && navLogo.querySelector("svg");
    const nav = document.querySelector(".pp-nav");
    let fly = null;
    let flyStem = null;
    let flyBlade = null;
    if (navSvg) {
      fly = document.createElementNS(SVGNS, "svg");
      fly.setAttribute("class", "pp-footer-fly");
      fly.setAttribute("viewBox", navSvg.getAttribute("viewBox"));
      fly.setAttribute("fill", "none");
      fly.setAttribute("aria-hidden", "true");
      flyStem = document.createElementNS(SVGNS, "path");
      flyStem.setAttribute("d", navSvg.querySelector(".lk-mark__stem").getAttribute("d"));
      flyBlade = document.createElementNS(SVGNS, "path");
      flyBlade.setAttribute("d", navSvg.querySelector(".lk-mark__blade").getAttribute("d"));
      fly.appendChild(flyStem);
      fly.appendChild(flyBlade);
      document.body.appendChild(fly);
      gsap.set(flyStem, { fill: INK });
      gsap.set(flyBlade, { fill: BLUE });
      gsap.set(fly, { autoAlpha: 0, transformOrigin: "center center" });
    }

    // ── Live geometry (FLIP-invert): the clone's UNTRANSFORMED box is the footer
    // mark's on-screen rect AT THE LANDING SCROLL (progress = LAND), so at the end of
    // the flight the clone equals the real mark exactly — a pixel-clean, reversible
    // swap. At flight progress f<1 it is scaled DOWN + translated back toward the navbar
    // logo (invScale ≈ navH/markH); basing the box on the big target (not the ~21px
    // navbar) keeps the LANDING exact and pushes any sub-pixel rounding to the navbar
    // end, where the clone is hidden + coincident with the tiny logo. The landing scroll
    // is  Sland = st.start + LAND·(st.end − st.start);  the mark's on-screen top there
    // is its document-top minus Sland — computable without scrolling there. Re-measured
    // on refresh so resize never drifts.
    const flightEase = gsap.parseEase("power2.inOut");
    const geo = { left: 0, top: 0, w: 0, h: 0, invScale: 1, dx0: 0, dy0: 0 };
    let stRef = null;
    const flightProgress = (p) =>
      flightEase(gsap.utils.clamp(0, 1, (p - ARM) / (LAND - ARM)));
    const applyFlight = (f) => {
      if (!fly) return;
      gsap.set(fly, {
        left: geo.left,
        top: geo.top,
        width: geo.w,
        height: geo.h,
        x: geo.dx0 * (1 - f),
        y: geo.dy0 * (1 - f),
        scale: geo.invScale + (1 - geo.invScale) * f,
      });
      // Stem INK → BONE across the descent, as it crosses onto the dark footer.
      const sf = gsap.utils.clamp(0, 1, (f - 0.15) / 0.6);
      gsap.set(flyStem, { fill: gsap.utils.interpolate(INK, BONE, sf) });
    };
    const measure = () => {
      if (!fly || !navSvg || !stRef) return;
      const navRect = navSvg.getBoundingClientRect();
      const markRect = mark.getBoundingClientRect(); // hidden (autoAlpha) but still laid out
      const markDocTop = markRect.top + window.scrollY; // document-space, scroll-invariant
      const sland = stRef.start + LAND * (stRef.end - stRef.start); // scroll at the landing
      geo.left = markRect.left; // x is unaffected by vertical scroll
      geo.top = markDocTop - sland; // the mark's on-screen top at the landing scroll
      geo.w = markRect.width;
      geo.h = markRect.height;
      geo.invScale = navRect.height / markRect.height;
      // Offset that carries the clone's centre back to the navbar logo's centre at f=0.
      geo.dx0 = navRect.left + navRect.width / 2 - (geo.left + geo.w / 2);
      geo.dy0 = navRect.top + navRect.height / 2 - (geo.top + geo.h / 2);
      applyFlight(flightProgress(stRef.progress)); // keep the clone correct right now
    };

    // Park (p=0): footer content hidden, clone hidden + parked on the navbar. We do
    // NOT touch the navbar logo here — the onboarding curtain still owns it at load;
    // the latch only manages it once the visitor scrolls into the footer band (long
    // after the curtain has landed).
    gsap.set([...navWords, ...legalWords], { yPercent: 120 });
    gsap.set(wordLines, { yPercent: 110 });
    gsap.set([mark, ...rules], { autoAlpha: 0 });

    // Swap latch (reversible): below ARM the real navbar logo shows and the footer is
    // blank; in [ARM, LAND) the clone stands in for the logo and flies; at/after LAND
    // the real footer mark is swapped in (coincident with the clone at the landing
    // scroll, so the handoff is invisible both ways). Wordmark masks open just past the
    // landing so descenders show at rest, and re-close on scroll-up.
    // touchNav=false on refresh: the onboarding curtain owns the navbar logo at the
    // INITIAL refresh (pre-handoff), so refresh only touches the footer-side elements;
    // the navbar logo is managed on scroll (onUpdate).
    const latch = (p, touchNav) => {
      const flying = p >= ARM && p < LAND;
      const landed = p >= LAND;
      if (touchNav && navLogo) gsap.set(navLogo, { autoAlpha: p >= ARM ? 0 : 1 });
      if (fly) gsap.set(fly, { autoAlpha: flying ? 1 : 0 });
      gsap.set(mark, { autoAlpha: landed ? 1 : 0 });
      gsap.set(wordMasks, { overflow: p > LAND + 0.05 ? "visible" : "hidden" });
    };

    const tl = gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: {
        trigger: section,
        start: "top bottom", // footer's top reaches the viewport bottom (it enters)
        end: "bottom bottom", // footer's bottom reaches the viewport bottom (page end)
        scrub: 1,
        onRefresh: (self) => {
          stRef = self;
          measure();
          latch(self.progress, false);
        },
        onUpdate: (self) => {
          applyFlight(flightProgress(self.progress));
          latch(self.progress, true);
        },
      },
    });

    // CONTENT reveals — all gated AFTER the logo lands (positions ≥ LAND). The terminal
    // marker below pins the timeline's total duration to exactly 1.0, so each authored
    // position maps 1:1 to scroll progress and shares the flight's clock. (Without it the
    // 12-word legal stagger pushes the total past 1.0; GSAP then normalises against that
    // total and every reveal fires EARLIER — bleeding the text back into the flight.)
    // Order follows physical top-to-bottom visibility so every row lands while it is on
    // screen: the navbar pill fades as the mark detaches; the rules, the footer nav row
    // and the giant wordmark reveal right on landing (the payoff beside the freshly-grown
    // mark); the legal row settles last, as it scrolls into view at the very bottom.
    tl
      .to(nav, { autoAlpha: 0, duration: 0.12 }, ARM)
      .to(rules, { autoAlpha: 1, duration: 0.14 }, LAND + 0.02)
      .to(navWords, { yPercent: 0, duration: 0.13, stagger: 0.025 }, LAND + 0.02)
      .to(wordLines, { yPercent: 0, duration: 0.15, stagger: 0.06 }, LAND + 0.03)
      .to(legalWords, { yPercent: 0, duration: 0.09, stagger: 0.0045 }, 0.85)
      .set({}, { x: 0 }, 1.0); // pin total duration to 1.0 (see note above)

    window.__footerST = tl.scrollTrigger;
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

  // SVG namespace for the runtime-built clip wraps + the flying mark clone.
  const SVGNS = "http://www.w3.org/2000/svg";

  // ── Onboarding assemble (the welcome intro) ────────────────────────────────
  // Ported from onboarding.js so the merged page has ONE controller. The brand
  // resolves onto the blue overlay: atmosphere breathes in, the P-mark assembles,
  // "Proxy" then "Papers" reveal letter-by-letter via a per-glyph clip-wipe from
  // each glyph's own baseline, and the hairline loader fills. Returns the wrapped
  // parts + their rise distances so the handoff can wipe the wordmark back out and
  // fly the mark, plus the paused timeline.
  const setupOnboardingIntro = (gsap) => {
    const lockup = document.querySelector(".ob-lockup");
    if (!lockup) return null;

    const PAD_X = 2;
    const PAD_TOP = 6;
    const rise = new Map();
    let clipN = 0;

    let defs = lockup.querySelector("defs");
    if (!defs) {
      defs = document.createElementNS(SVGNS, "defs");
      lockup.insertBefore(defs, lockup.firstChild);
    }

    // Wrap a path in a <g clip-path> whose rect bottom sits on the path's own base,
    // then park the path below that base (clipped away) so it can slide up into view.
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

    gsap.set(lockup.querySelector(".lk-mark"), { opacity: 1 });
    gsap.set(parts, { opacity: 1, y: (i, t) => rise.get(t) });

    const STAG = 0.06;
    const tl = gsap.timeline({ defaults: { ease: "power3.out" }, paused: true });

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

    tl.to([stem, blade], { y: 0, duration: 0.7, stagger: 0.14 }, 0.35)
      .to(proxy, { y: 0, duration: 0.7, stagger: STAG }, 0.65)
      .to(papers, { y: 0, duration: 0.7, stagger: STAG }, 0.93);

    tl.fromTo(
      ".ob-divider__fill",
      { width: "0%" },
      { width: "100%", duration: 1.7, ease: "none" },
      0.35,
    );

    return {
      tl,
      lockup,
      stem,
      blade,
      mark: lockup.querySelector(".lk-mark"),
      wordGlyphs: [...proxy, ...papers],
      rise,
    };
  };

  // ── Hero intro (built paused; fired when the handoff lands) ─────────────────
  // In the merged page the visitor is on the onboarding at load, so the hero no
  // longer plays on load — it plays when the lockup lands in the navbar (the blue
  // dissolves to the dark canvas, then the hero assembles onto it). Returns the
  // paused timeline plus the two endless drifts to start alongside it.
  const buildHeroIntro = (gsap) => {
    const words = gsap.utils.toArray(".hero-lead__title .r-word__in");
    gsap.set(words, { yPercent: 110 });

    const tl = gsap.timeline({ defaults: { ease: "power3.out" }, paused: true });

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

    // Endless conveyor drift LEFT→RIGHT (the product-feel moment), started once
    // the intro resolves so each skeleton row becomes its content row at centre.
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

    return { tl, idle };
  };

  // ── The curtain handoff (welcome → hero), auto-played ───────────────────────
  // Once the welcome resolves it plays itself — no scroll. Beat 1: the loader fades
  // away. Beat 2: a curtain rises from the bottom, revealing the dark hero — the blue
  // overlay is clip-wiped away from the bottom up, so its rising top edge is the
  // curtain. The curtain rises in ONE fluent, uninterrupted motion — it never pauses. The
  // P-mark reacts to the APPROACHING edge: it rests until the edge climbs to within 2rem of
  // its base, then eases up and into the navbar over the rest of the rise (riding a
  // smootherstep, so it lifts off from rest with no jump and softens into the dock, all
  // while the curtain keeps moving past it at full speed), shrinking to navbar size, its
  // blade flipping bone→blue as it crosses onto the dark. The wordmark fades + lifts over
  // the curtain's climb, gone by the time the mark lifts off. When the mark docks the real
  // navbar logo swaps in for the clone (coincident, unseen), the hero assembles, and only
  // then is the scroll lock released.
  const runCurtain = (gsap, ob, hero, lenis) => {
    const obStage = document.querySelector(".ob-stage");
    const navLogo = document.querySelector(".pp-nav__logo");
    const divider = document.querySelector(".ob-divider");

    // Release the scroll lock + hand the page over to normal scrolling.
    const release = () => {
      root.classList.add("pp-ready");
      if (lenis) lenis.start();
      if (window.ScrollTrigger) window.ScrollTrigger.refresh();
    };

    // No overlay / mark to fly → just reveal the hero and release.
    if (!ob || !obStage || !navLogo) {
      if (obStage) gsap.set(obStage, { autoAlpha: 0, pointerEvents: "none" });
      if (navLogo) navLogo.classList.add("is-landed");
      hero.tl.play();
      hero.idle();
      release();
      return;
    }

    const BONE = "#f7f4f0";
    const BLUE = "#5a90f4";

    // The flying mark — a standalone svg holding clones of just the stem + blade,
    // lifted ABOVE the overlay (z 250) so the rising curtain never clips it: it rides
    // the edge whole while the wordmark beneath it is consumed.
    const bb = ob.mark.getBBox();
    const fly = document.createElementNS(SVGNS, "svg");
    fly.setAttribute("class", "pp-nav-fly");
    fly.setAttribute("viewBox", `${bb.x} ${bb.y} ${bb.width} ${bb.height}`);
    fly.setAttribute("fill", "none");
    fly.setAttribute("aria-hidden", "true");
    const flyStem = document.createElementNS(SVGNS, "path");
    flyStem.setAttribute("d", ob.stem.getAttribute("d"));
    const flyBlade = document.createElementNS(SVGNS, "path");
    flyBlade.setAttribute("d", ob.blade.getAttribute("d"));
    fly.appendChild(flyStem);
    fly.appendChild(flyBlade);
    document.body.appendChild(fly);

    // Rest geometry (the lockup is settled — the welcome just finished). The clone
    // starts coincident with the lockup's mark and the lockup's own mark is hidden,
    // so the clone is the only mark on screen.
    const restMark = ob.mark.getBoundingClientRect();
    const restNav = navLogo.getBoundingClientRect();
    gsap.set(fly, {
      left: restMark.left,
      top: restMark.top,
      width: restMark.width,
      height: restMark.height,
      x: 0,
      y: 0,
      scale: 1,
      transformOrigin: "center center",
    });
    gsap.set([flyStem, flyBlade], { fill: BONE }); // welcome look — all bone on blue
    gsap.set(ob.mark, { opacity: 0 }); // the clone stands in for it

    // Geometry for the ride. The curtain edge's screen-Y as a function of coverage
    // e∈[0,1] (0 = at the bottom, 1 = at the top) is vh·(1−e). The mark latches when
    // that edge reaches its centre (eLatch) and is fully in the navbar when the edge
    // reaches the navbar centre (eNav); between, its centre IS the edge.
    const vh = window.innerHeight;
    const markCX = restMark.left + restMark.width / 2;
    const markCY = restMark.top + restMark.height / 2;
    const navCX = restNav.left + restNav.width / 2;
    const navCY = restNav.top + restNav.height / 2;
    const navScale = restNav.height / restMark.height;
    // The mark reacts to the APPROACHING curtain rather than waiting for exact contact: it
    // begins easing up once the edge is GAP_TRIG below its base, and a hard floor (BASE_GAP)
    // guarantees the rising edge never comes closer than that to the mark's base — if the
    // curtain climbs too near, it pushes the mark ahead, so they never touch. eLatch = where
    // the easing begins; eNav = edge at the navbar centre.
    const rem = parseFloat(getComputedStyle(root).fontSize || "16");
    const GAP_TRIG = 5 * rem; // the mark begins easing up once the edge is this far below its base
    // (early enough that it's already moving near edge-speed before the curtain closes in,
    // so the cushion below holds without the mark ever snapping into motion)
    const BASE_GAP = 3 * rem; // hard floor — the edge is NEVER allowed within this of the mark's base
    const restH = restMark.height;
    const navH = restNav.height;
    const markBottom = markCY + restH / 2;
    const eLatch = gsap.utils.clamp(0, 1, 1 - (markBottom + GAP_TRIG) / vh);
    const eNav = gsap.utils.clamp(0, 1, 1 - navCY / vh);
    // Smootherstep — zero slope at BOTH ends. The mark's travel rides this, so it eases off
    // its rest and softens into the dock WITHOUT the curtain ever having to slow down: the
    // curtain stays one fluent motion; only the mark's own progress is eased.
    const sstep = (x) => x * x * x * (x * (x * 6 - 15) + 10);

    // The wordmark fades + lifts as the curtain climbs toward the mark, gone by the time
    // the mark lifts off — a smooth dissolve in step with the rise, never a hard clip.
    const wordGroups = ob.lockup.querySelectorAll("[data-word]");
    const lockRect = ob.lockup.getBoundingClientRect();
    const toUnits = 783 / (lockRect.width || 351); // screen px → lockup user units
    const TEXT_LIFT = 44; // px the wordmark rises as it dissolves (it moves along too)

    let landed = false;
    const applyCurtain = (e) => {
      // The curtain — wipe the blue overlay away from the bottom up. Its rising top edge:
      const edgeY = vh * (1 - e);
      gsap.set(obStage, { clipPath: `inset(0px 0px ${(e * 100).toFixed(3)}% 0px)` });

      // The mark eases up along a smootherstep (smooth lift-off from rest — no jump — even
      // as the curtain sweeps past at full speed). BUT it is ALSO never allowed within
      // BASE_GAP of the rising edge: if the curtain climbs close, it pushes the mark ahead
      // so a constant cushion stays between the edge and the mark's base — the curtain never
      // touches the mark. The position is whichever sits higher (smaller Y).
      const f = gsap.utils.clamp(0, 1, (e - eLatch) / (eNav - eLatch));
      const mEase = sstep(f);
      const cyEase = markCY + (navCY - markCY) * mEase; // the mark's own eased schedule
      const hEase = restH + (navH - restH) * mEase; // its height at this progress
      const cyGap = edgeY - BASE_GAP - hEase / 2; // highest its centre may sit and keep the cushion
      const cy = gsap.utils.clamp(navCY, markCY, Math.min(cyEase, cyGap));
      // Scale + horizontal drift follow the ACTUAL vertical progress, so they stay in step.
      const p = gsap.utils.clamp(0, 1, (markCY - cy) / (markCY - navCY));
      gsap.set(fly, {
        x: (navCX - markCX) * p,
        y: cy - markCY,
        scale: 1 + (navScale - 1) * p,
      });

      // The wordmark fades + lifts over the curtain's CLIMB to the mark, fully gone by
      // the time the mark lifts off (eLatch), so the mark leaves a clean ground.
      const tg = gsap.utils.clamp(0, 1, e / eLatch);
      gsap.set(wordGroups, { autoAlpha: 1 - tg, y: -TEXT_LIFT * toUnits * tg });

      // Blade flips bone→blue over the back half of the ride as the mark crosses onto the dark.
      const bf = gsap.utils.clamp(0, 1, (p - 0.5) / 0.5);
      gsap.set(flyBlade, { fill: gsap.utils.interpolate(BONE, BLUE, bf) });

      // Once the rising edge has cleared the mark's docked spot, the navbar is revealed:
      // swap the clone for the real logo (coincident, unseen) and assemble the hero.
      if (!landed && edgeY <= navCY - navH / 2) {
        landed = true;
        navLogo.classList.add("is-landed");
        gsap.set(fly, { autoAlpha: 0 });
        hero.tl.play();
        hero.idle();
      }
    };

    const proxy = { e: 0 };
    gsap.set(obStage, { clipPath: "inset(0px 0px 0px 0px)" });

    const tl = gsap.timeline({
      onComplete: () => {
        gsap.set(obStage, { autoAlpha: 0, pointerEvents: "none" });
        release();
      },
    });
    // Beat 1 — the loader, its job done, fades away.
    tl.to(divider, { autoAlpha: 0, duration: 0.5, ease: "power1.out" }, 0);
    // Beat 2 — the curtain rises in ONE fluent, uninterrupted motion from the bottom to
    // the top (it never slows or pauses mid-rise). The mark and wordmark respond to it via
    // their own eased mappings in applyCurtain, so the curtain stays continuous throughout.
    tl.to(
      proxy,
      { e: 1, duration: 2.0, ease: "power1.inOut", onUpdate: () => applyCurtain(proxy.e) },
      0.55,
    );

    window.__curtain = tl;
  };

  const start = () => {
    buildConveyor(); // rows exist regardless of GSAP (decorative, progressive)
    setupNavTheme(); // always on — not gated behind GSAP/reduced motion

    const gsap = window.gsap;
    if (!gsap || prefersReduced) {
      root.classList.remove("js"); // settled state (no welcome — lands on the hero)
      return;
    }
    if (window.ScrollTrigger) gsap.registerPlugin(window.ScrollTrigger);

    const ob = setupOnboardingIntro(gsap);
    const hero = buildHeroIntro(gsap);
    window.__obIntro = ob && ob.tl;
    window.__heroIntro = hero.tl;

    // Section reveals below the hero — built now; each fires on its own scroll-in.
    setupProblem(gsap);
    setupProfiles(gsap);
    setupMethod(gsap);
    setupTrust(gsap);
    setupReferrers(gsap);
    setupClosing(gsap);
    setupFooter(gsap);

    // One shared Lenis — STOPPED until the curtain handoff finishes, so the page
    // can't scroll while the welcome assembles and the curtain plays. Started on ready.
    let lenis = null;
    if (window.Lenis) {
      lenis = new window.Lenis({
        duration: 1.8,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      });
      gsap.ticker.add((time) => lenis.raf(time * 1000));
      gsap.ticker.lagSmoothing(0);
      if (window.ScrollTrigger) lenis.on("scroll", window.ScrollTrigger.update);
      lenis.stop();
      window.__lenis = lenis;
    }

    // No onboarding overlay present (shouldn't happen) → straight to the hero.
    if (!ob) {
      runCurtain(gsap, null, hero, lenis);
      return;
    }

    // When the welcome resolves, auto-play the curtain handoff (the lockup is at rest,
    // so the ride geometry is exact). It releases the scroll lock when it lands.
    ob.tl.eventCallback("onComplete", () => runCurtain(gsap, ob, hero, lenis));

    // ── Asset gate ──────────────────────────────────────────────────────────────
    const decode = (src) => {
      const img = new Image();
      img.src = src;
      return img.decode ? img.decode().catch(() => {}) : Promise.resolve();
    };
    const ready = Promise.all([
      document.fonts ? document.fonts.ready : Promise.resolve(),
      decode("assets/clouds.webp"),
      decode("assets/grain.webp"),
      decode("assets/hero-lens.webp"),
    ]);
    Promise.race([ready, new Promise((r) => setTimeout(r, 1400))]).then(() =>
      ob.tl.play(),
    );
  };

  if (document.readyState === "loading") {
    window.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();
