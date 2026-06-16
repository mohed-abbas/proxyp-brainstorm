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

  // Scroll-linked reveal config. Stays scrubbed (progress follows the wheel, so a
  // fast scroll can't outrun and "miss" the reveal), but TUNED so its pace reads
  // like the non-scrubbed sections' self-timed cascade (~2s on enter):
  //   • a SHORT entry window — scrolling into the section quickly drives the
  //     target toward full, so it isn't dragged out over a long scroll distance;
  //   • scrub ≈ the authored timeline length (~2s) — so it then eases out over
  //     about the same duration the non-scrubbed timelines play at.
  const REVEAL_ST = (trigger, overrides = {}) => ({
    trigger,
    start: "top 85%", // arms just as the section enters from the bottom
    end: "top 60%", // short window — entering quickly drives the reveal to play
    scrub: 3, // softer, longer catch-up tail for a gentler reveal
    invalidateOnRefresh: true, // recompute vw/width start values on resize
    ...overrides,
  });

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
    //  • VOLUME (large) — draws itself in once with the reveal and rests DRAWN;
    //    no hover behaviour (the draw is a load-in moment only).
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

    // VOLUME has no hover behaviour — its draw happens once on the scroll reveal
    // (see the timeline below). Only the small cards react to hover.
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
        scrollTrigger: REVEAL_ST(section),
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
  // Transform layering (see profiles.css): outer .profiles__card = slot + perspective;
  // .profiles__card-pos = spread + tilt; .profiles__card-flip = rotateY. The fan
  // offset lives in each card's --dx/--dy/--rot vars (read here). No hover behaviour.
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
    // The deck scales itself down on short viewports (CSS --card-h, deck-only fit),
    // so keep the fanned-entry offsets in proportion with the live card width — else
    // a shrunk card would fan out by a full native-width offset and fly off-screen.
    const NATIVE_CARD_VW = 21.4947; // .profiles__card native width (325px)
    const fan = cards.map((c) => {
      const cs = getComputedStyle(c);
      const nativeW = (NATIVE_CARD_VW * window.innerWidth) / 100;
      const deckScale = (parseFloat(cs.width) || nativeW) / nativeW;
      return {
        dx: vwToPx(cs.getPropertyValue("--dx")) * deckScale,
        dy: vwToPx(cs.getPropertyValue("--dy")) * deckScale,
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
        pinType: "transform", // survive the .page-frame container-type: a fixed-pin
                              // would anchor to the contained frame, not the viewport
        anticipatePin: 1,
        scrub: 2.4, // heavy smoothing: the timeline trails the wheel by a longer
                    // beat and glides to rest when you stop, so the pin feels soft
                    // and inertial. NB this does not change the SPEED — the scroll-
                    // distance→rotation mapping (set by the pin distance) is the
                    // same; scrub only governs how softly it tracks/settles.
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

  // Certifications marquee — make the infinite scroll robust for ANY number of
  // certs and ANY viewport width. The HTML authors ONE set; we clone it until the
  // track always overflows the viewport, then loop by exactly one set's width.
  // (The old approach hard-coded two sets and looped by -50%, which only stays
  // gap-free while a single set is wider than the screen — too few certs or a
  // wide display would expose empty space.) font-size is constant, and setupTrust
  // scales the PARENT .trust__certs (never the track), so offsetWidth/offsetLeft
  // here are pure layout, untouched by that transform. The exact shift is read
  // from layout positions (set 2's first item vs set 1's), so the reset is
  // seam-free even with sub-pixel rounding. Runs independent of GSAP; skipped
  // under reduced motion (CSS also stops the animation there).
  const CERTS_SPEED = 52; // px/s at full size — matches the prior 40s feel
  const setupCertsMarquee = () => {
    const track = document.querySelector(".trust__certs-track");
    if (!track || prefersReduced) return;
    const unit = Array.from(track.children); // the one authored set
    if (!unit.length) return;

    const build = () => {
      // Lay down a single set, gauge its advance to pick a copy count.
      track.replaceChildren(...unit.map((el) => el.cloneNode(true)));
      const approx = Array.from(track.children).reduce(
        (w, el) => w + el.offsetWidth + parseFloat(getComputedStyle(el).marginRight),
        0,
      );
      if (!approx) return;
      // Enough whole sets to cover the viewport plus one spare, so content never
      // runs out before the loop resets. Always ≥ 2 so we can measure the period.
      const copies = Math.max(2, Math.ceil(window.innerWidth / approx) + 1);
      for (let i = 1; i < copies; i++) {
        unit.forEach((el) => track.appendChild(el.cloneNode(true)));
      }
      // Exact repeat period = where set 2 begins relative to set 1 (layout px).
      const kids = Array.from(track.children);
      const period = kids[unit.length].offsetLeft - kids[0].offsetLeft;
      track.style.setProperty("--marquee-shift", period + "px");
      track.style.setProperty("--marquee-duration", period / CERTS_SPEED + "s");
    };

    const refit = () => {
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(build);
      else build();
    };
    refit();
    // Re-measure on resize: font-size is min(vw, 49px), so the set width — and
    // the number of copies needed — change with the viewport.
    let raf = 0;
    window.addEventListener("resize", () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(build);
    });
  };

  // The trust band EXPANDS as it scrolls into view (ScrollTrigger). It opens
  // from the collapsed initial card (Figma 58:684) — a narrow 440px panel with a
  // "Sovereignty & trust" eyebrow up top and the dimmed title sitting low and
  // clipped — and grows to the full settled band (Figma 58:219): width fills,
  // the hairline frame fades in, the eyebrow lifts away, the title rises to
  // centre and brightens, and the body settles in word-by-word (house style).
  const setupTrust = (gsap) => {
    const section = document.querySelector(".trust");
    if (!section) return;
    const ST = window.ScrollTrigger;

    const panel = section.querySelector(".trust__panel");
    const frame = section.querySelector(".trust__frame");
    const eyebrow = section.querySelector(".trust__eyebrow");
    const certs = section.querySelector(".trust__certs");
    const content = section.querySelector(".trust__content");
    const title = section.querySelector(".trust__title");
    const titleLines = gsap.utils.toArray(".trust__title-line", section);
    const line2 = titleLines[1]; // "Protected data." — hidden in the tiny card
    const body = section.querySelector(".trust__body");
    const bodyWords = splitWords(body);

    gsap.set([content, certs], { visibility: "visible" });

    // No ScrollTrigger / reduced motion → render the settled full band as-is
    // (certs marquee already sits in its expanded place via CSS).
    if (!ST) {
      gsap.set(bodyWords, { yPercent: 0 });
      return;
    }

    // Collapsed initial state — the Figma "from" card (node 77:959): a 440×520
    // PORTRAIT card (so the open is width-only — Figma's collapsed height already
    // matches the full band). Per Figma: the eyebrow tag sits up top, a certs strip
    // rides the bottom (bleeding wider than the card), and the CENTRE IS EMPTY — the
    // title is pushed fully below the card edge (clipped by the panel's overflow)
    // and there is NO inset frame yet (the hairline belongs to the full band, so it
    // fades in as the card opens). "Protected data." + the body stay hidden until
    // the open. y is pushed in px (GSAP treats vw on transforms as px), so convert
    // against the live viewport.
    // Cap design distances at the Figma px (min(vw, px)) so the collapsed card stays
    // Figma-accurate on >1512px screens, matching the CSS caps now that the panel
    // opens full-bleed.
    const vwToPx = (vw) => (vw / 100) * window.innerWidth;
    const cap = (vw, px) => Math.min(vwToPx(vw), px);
    gsap.set(panel, { width: cap(29.1005, 440) }); // 440px — height stays the full band
    gsap.set(frame, { autoAlpha: 0 }); // no frame in the collapsed card (Figma)
    gsap.set(eyebrow, { autoAlpha: 1, y: 0 });
    // Certs marquee "from" state (Figma 77:959): scaled down (18.2/49) and
    // dropped to the card bottom. We size it with a transform scale — NOT a
    // font-size tween — so the track's pixel width stays FIXED and the marquee's
    // loop never gets re-measured mid-open (that re-measuring, of a width that
    // changed every frame, was the stutter). yPercent:-50 keeps it centred on its
    // line while y adds the ~93px drop; both undo to the expanded place on open.
    // The inner track keeps marquee-ing throughout (CSS).
    gsap.set(certs, {
      autoAlpha: 1,
      yPercent: -50,
      y: cap(6.1508, 93),
      scale: 18.2 / 49, // compact size as a pure transform (no font-size relayout)
      transformOrigin: "50% 50%",
    });
    // Compact card (Figma 77:959) has an EMPTY centre — the title is pushed fully
    // below the card edge (clipped by the panel's overflow) so it doesn't clash
    // with the certs strip; it rises into the open band on expand. (Larger than
    // before — the settled title block now sits higher to make room for the
    // marquee below it, so it starts further down to clear the card.)
    gsap.set(content, { y: cap(28.5714, 432) });
    gsap.set(title, { color: "rgba(22, 23, 24, 0.6)" });
    gsap.set(line2, { autoAlpha: 0, yPercent: 40 });
    gsap.set(bodyWords, { yPercent: 120 });
    gsap.set(body, { autoAlpha: 0 });

    gsap
      .timeline({
        defaults: { ease: "power3.out", force3D: true },
        // Vooban's solution: PIN the card centred in the viewport, then scrub the
        // window open over the pin distance so it unfolds while held in view (not
        // racing off to the top edge).
        //
        // Pace is decoupled from scroll FORCE — same recipe as the profiles deck:
        // a HEAVY scrub (2.4) over a GENEROUS pin distance. The heavy scrub means
        // the open always glides toward the scroll target over ~2.4s no matter how
        // hard you flick (a hard scroll can't make it race), and the generous
        // distance gives that smoothing room so it never lurches and always
        // completes while still centred. Eased expand (power2.inOut) keeps the
        // boundaries calm; the dwell holds the open band before the pin releases.
        scrollTrigger: {
          trigger: section,
          start: "center center", // pin once the card is centred
          end: "+=120%", // generous runway (viewport-relative) so the heavy scrub
                         // has room — mirrors the profiles deck's long pin
          scrub: 2.4, // heavy smoothing → consistent pace regardless of scroll force
          pin: true,
          pinType: "transform", // survive the .page-frame container-type: a fixed-pin
                                // would anchor to the contained frame, not the viewport
          pinSpacing: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      })
      .to(panel, { width: "100%", duration: 1.5, ease: "power2.inOut" }, 0) // width-only open (Figma)
      .to(content, { y: 0, duration: 1.5, ease: "power2.inOut" }, 0)
      .to(eyebrow, { autoAlpha: 0, y: "-1.1vw", duration: 0.45 }, 0)
      // The certs marquee scales up (0.371 → 1) and rises into the open band,
      // tracking the panel open (same duration/ease as the width + content rise).
      .to(
        certs,
        { y: 0, scale: 1, duration: 1.5, ease: "power2.inOut" },
        0
      )
      .to(frame, { autoAlpha: 1, duration: 0.6 }, 0.4) // hairline frame fades in as it opens
      .to(line2, { autoAlpha: 1, yPercent: 0, duration: 0.6 }, 0.5)
      .to(title, { color: "rgb(22, 23, 24)", duration: 0.7 }, 0.6)
      .to(body, { autoAlpha: 1, duration: 0.5 }, 0.85)
      .to(bodyWords, { yPercent: 0, duration: 0.5, stagger: 0.008 }, 0.9)
      // Dwell — the open band rests centred while the heavy scrub settles, so even
      // a hard flick lands the completed open in view before the pin releases
      // (a real DOM target, so no force3D warning).
      .to(panel, { duration: 0.6 });
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

    // Perpetual orbit — once the diagram has assembled, the three rings drift at
    // their own slow pace, alternating direction (inner CW, middle CCW, outer CW)
    // so the radar reads as living-but-calm. The centre mark holds still; the two
    // inner/middle rings carry avatars, so each avatar's img counter-rotates to
    // keep faces upright. The outer dashed ring spins on its own (the dashes make
    // the rotation read). Linear ease + long durations keep it subtle and smooth.
    const startOrbit = () => {
      const innerLayer = section.querySelector(".referrers__orbit-layer--inner");
      const middleLayer = section.querySelector(".referrers__orbit-layer--middle");
      const outerRing = section.querySelector(".referrers__ring--outer");
      const spin = { ease: "none", repeat: -1 };

      // Inner ring + its avatars — clockwise.
      gsap.to(innerLayer, { rotation: 360, duration: 42, transformOrigin: "50% 50%", ...spin });
      gsap.to(innerLayer.querySelectorAll("img"), { rotation: -360, duration: 42, transformOrigin: "50% 50%", ...spin });

      // Middle ring + its avatars — counter-clockwise.
      gsap.to(middleLayer, { rotation: -360, duration: 52, transformOrigin: "50% 50%", ...spin });
      gsap.to(middleLayer.querySelectorAll("img"), { rotation: 360, duration: 52, transformOrigin: "50% 50%", ...spin });

      // Outer dashed ring — clockwise, rotated about the field centre (247,247).
      gsap.to(outerRing, { rotation: 360, duration: 68, svgOrigin: "247 247", ...spin });
    };

    gsap
      .timeline({
        defaults: { ease: "power3.out", force3D: true },
        scrollTrigger: { trigger: section, start: "top 70%", once: true },
        onComplete: startOrbit,
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

  // The footer is the page's blue-card close. As it scrolls in, the fixed navbar
  // hands off (setupNavHandoff fades the pill out) and the footer reveals: the
  // hairline dividers draw down, the P-mark fades + lifts, the two columns of
  // links rise in a staggered cascade, then the copyright settles. House stagger.
  // Reduced-motion / no-JS skip this (and .js is stripped), so the settled footer
  // just renders.
  const setupFooter = (gsap) => {
    const section = document.querySelector(".footer");
    if (!section) return;
    const ST = window.ScrollTrigger;

    const mark = section.querySelector(".footer__mark");
    const cols = gsap.utils.toArray(section.querySelectorAll(".footer__col"));
    const rules = gsap.utils.toArray(section.querySelectorAll(".footer__rule"));
    const links = gsap.utils.toArray(section.querySelectorAll(".footer__link"));
    const legal = section.querySelector(".footer__legal");

    // Un-hide the column containers up front: the links use autoAlpha (which sets
    // visibility:inherit when shown), so a parent left at the CSS-armed hidden
    // state would keep them invisible.
    gsap.set([mark, ...cols, ...rules, ...links, legal], { visibility: "visible" });

    if (!ST) {
      gsap.set([mark, ...rules, ...links, legal], { autoAlpha: 1, y: 0 });
      gsap.set(rules, { scaleY: 1 });
      return;
    }

    // yPercent (element-relative) keeps the lift resolution-independent — GSAP
    // would otherwise read a "vw" transform as px.
    gsap.set(mark, { autoAlpha: 0, yPercent: 12 });
    gsap.set(rules, { autoAlpha: 0, scaleY: 0 });
    gsap.set(links, { autoAlpha: 0, yPercent: 70 });
    gsap.set(legal, { autoAlpha: 0, yPercent: 85 });

    gsap
      .timeline({
        defaults: { ease: "power3.out", force3D: true },
        scrollTrigger: { trigger: section, start: "top 82%", once: true },
      })
      .to(rules, { autoAlpha: 1, scaleY: 1, duration: 0.9, ease: "power2.out", stagger: 0.08 }, 0.0)
      .to(mark, { autoAlpha: 1, yPercent: 0, duration: 0.9, ease: "power2.out" }, 0.15)
      .to(links, { autoAlpha: 1, yPercent: 0, duration: 0.7, stagger: 0.05 }, 0.3)
      .to(legal, { autoAlpha: 1, yPercent: 0, duration: 0.6 }, 0.7);
  };

  // Footer mechanic — the fixed navbar HANDS OFF to the footer's own nav. As the
  // full-height footer scrolls in, the pill fades out smoothly (scrubbed to the
  // scroll) so by the time the footer fills the screen only the footer's nav remains;
  // it fades back in on scroll-up. Opacity only — never touches the bar's theme
  // (setupNavTheme) or the logo's .is-landed opacity (the curtain).
  const setupNavHandoff = (gsap) => {
    const ST = window.ScrollTrigger;
    const nav = document.querySelector(".pp-nav");
    const section = document.querySelector(".footer");
    if (!ST || !nav || !section) return;

    gsap.to(nav, {
      autoAlpha: 0,
      ease: "none",
      scrollTrigger: {
        trigger: section,
        start: "top 75%", // footer is well into view
        end: "top 15%", // footer has nearly taken over the screen
        scrub: true,
      },
    });
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

  // Menu (open state) — Figma 245:647. The animation lives in menu.css, driven by
  // the panel's data-state; this controller only flips that state and handles the
  // plumbing: the navbar pill's Menu→Close morph (.is-menu-open), the scroll lock
  // (Lenis), focus management (move in, trap, restore), Esc + scrim-click close.
  // Pure DOM — not gated behind GSAP/reduced motion, so the menu always works.
  const setupMenu = () => {
    const menu = document.querySelector(".pp-menu");
    const panel = menu && menu.querySelector(".pp-menu__panel");
    const btn = document.querySelector(".pp-nav__menu");
    const nav = document.querySelector(".pp-nav");
    if (!menu || !panel || !btn || !nav) return;

    // Split each link into per-character spans so hover can stagger them (each
    // carries its index in --i; the rise + delay live in menu.css). The whole
    // line still rides the on-load reveal via the parent .pp-menu__link-text.
    panel.querySelectorAll(".pp-menu__link-text").forEach((el) => {
      const text = el.textContent;
      el.textContent = "";
      [...text].forEach((ch, i) => {
        const s = document.createElement("span");
        s.className = "pp-menu__link-char";
        s.textContent = ch === " " ? " " : ch;
        s.style.setProperty("--i", i);
        el.appendChild(s);
      });
    });

    const FOCUSABLE =
      'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';
    let open = false;
    let lastFocus = null;

    const focusables = () => [btn, ...panel.querySelectorAll(FOCUSABLE)];

    const onKey = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        close();
        return;
      }
      if (e.key !== "Tab") return;
      // Trap focus across the pill (the close affordance) + the panel.
      const items = focusables();
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;
      if (e.shiftKey && active === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    };

    const setOpen = () => {
      open = true;
      lastFocus = document.activeElement;
      menu.dataset.state = "open";
      menu.setAttribute("aria-hidden", "false");
      nav.classList.add("is-menu-open");
      btn.setAttribute("aria-expanded", "true");
      btn.setAttribute("aria-label", "Close menu"); // accessible name; label is CSS-animated + aria-hidden
      if (window.__lenis) window.__lenis.stop();
      else root.style.overflow = "hidden";
      document.addEventListener("keydown", onKey);
      // Let the panel paint before focusing the first link, so the reveal reads.
      const first = panel.querySelector(".pp-menu__link");
      if (first) requestAnimationFrame(() => first.focus());
    };

    const close = () => {
      if (!open) return;
      open = false;
      menu.dataset.state = "closed";
      menu.setAttribute("aria-hidden", "true");
      nav.classList.remove("is-menu-open");
      btn.setAttribute("aria-expanded", "false");
      btn.setAttribute("aria-label", "Open menu");
      if (window.__lenis) window.__lenis.start();
      else root.style.overflow = "";
      document.removeEventListener("keydown", onKey);
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    };

    btn.addEventListener("click", (e) => {
      e.preventDefault();
      open ? close() : setOpen();
    });
    menu.querySelectorAll("[data-menu-close]").forEach((el) =>
      el.addEventListener("click", close),
    );
    // Selecting a destination closes the menu (links are placeholders for now).
    panel
      .querySelectorAll(".pp-menu__link")
      .forEach((l) => l.addEventListener("click", close));
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
    // Axis line draws + conveyor fades up. The brand CARD is NOT popped here — the
    // onboarding mark settles INTO it (see runCurtain), so the card reveals itself at
    // the landing. (Revealing .hero-axis shows the line; the card stays armed-hidden
    // via html.js .hero-axis__card { opacity:0 } until the landing fades it in.)
    tl.fromTo(
      ".hero-axis__line",
      { scaleY: 0, transformOrigin: "50% 50%" },
      { scaleY: 1, opacity: 1, duration: 0.9, ease: "power2.inOut" },
      0.7,
    )
      .set(".hero-axis", { opacity: 1 }, 0.7)
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
  // overlay is clip-wiped away from the bottom up, so its rising top edge is the curtain.
  // It rises in ONE fluent, uninterrupted motion. The P-mark does NOT fly to the navbar;
  // it STAYS centred (held in place) through the wipe. Beat 3: once the hero ground is
  // revealed, the held mark eases DOWN a little and shrinks into the hero's lens-centre
  // card (.hero-axis__card) — its blade flipping bone→blue and stem bone→ink — while the
  // hero assembles around it; the real carded mark fades in and the clone dissolves into
  // it (coincident, unseen). The navbar's own logo appears as the edge clears the top.
  // The scroll lock releases once it all settles.
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

    // No overlay / mark to fly → just reveal the hero and release. The lens card is
    // armed-hidden (its self-pop was removed), so reveal it here too.
    if (!ob || !obStage || !navLogo) {
      if (obStage) gsap.set(obStage, { autoAlpha: 0, pointerEvents: "none" });
      if (navLogo) navLogo.classList.add("is-landed");
      gsap.set(".hero-axis__card", { opacity: 1 });
      hero.tl.play();
      hero.idle();
      release();
      return;
    }

    const BONE = "#f7f4f0";
    const BLUE = "#5a90f4";
    const INK = "#161718"; // lockup ink — the settled stem colour (pp-mark.svg)

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

    // The landing target — the brand mark INSIDE the hero's lens-centre card
    // (.hero-axis__card img holds pp-mark.svg). It's armed-hidden but laid out, so its
    // rect is exact. The mark no longer flies to the navbar; it holds its x-centre and
    // eases DOWN into this card, shrinking to its size — "stays in place, settles in".
    const lensMark =
      document.querySelector(".hero-axis__card img") ||
      document.querySelector(".hero-axis__card");
    const restLens = lensMark.getBoundingClientRect();
    const markCX = restMark.left + restMark.width / 2;
    const markCY = restMark.top + restMark.height / 2;
    const lensCX = restLens.left + restLens.width / 2;
    const lensCY = restLens.top + restLens.height / 2;
    const settleX = lensCX - markCX; // ≈ 0 — stays horizontally centred
    const settleY = lensCY - markCY; // ≈ +116 — a small downward settle
    const settleScale = restLens.height / restMark.height; // shrink to the card mark

    // Recolor the clone across the settle so it MATCHES pp-mark.svg (ink stem, blue
    // blade) the instant it's swapped for the real carded mark — bone→ink/blue, no pop.
    const recolor = (p) => {
      gsap.set(flyBlade, { fill: gsap.utils.interpolate(BONE, BLUE, p) });
      gsap.set(flyStem, { fill: gsap.utils.interpolate(BONE, INK, p) });
    };

    // The curtain wipe (blue overlay clipped away bottom→top) + the navbar logo reveal
    // as the rising edge clears the top strip. The mark is HELD here (clone untouched),
    // but the corner CLOUDS drift up-and-outward at DIFFERENT rates as the curtain lifts
    // (parallax → depth) with a faint push-in, so the world reads as receding/parting
    // rather than sitting frozen while the blue is pulled away. Restrained on purpose.
    const cloudL = document.querySelector(".ob-cloud--left"); // background — slower
    const cloudTR = document.querySelector(".ob-cloud--top-right"); // foreground — faster
    let navShown = false;
    const onCurtain = (e) => {
      gsap.set(obStage, { clipPath: `inset(0px 0px ${(e * 100).toFixed(3)}% 0px)` });
      // e is already eased (the curtain tween), so the parallax inherits that easing.
      if (cloudL)
        gsap.set(cloudL, { yPercent: -4 * e, xPercent: -2.5 * e, scale: 1 + 0.04 * e });
      if (cloudTR)
        gsap.set(cloudTR, { yPercent: -7 * e, xPercent: 3.5 * e, scale: 1 + 0.07 * e });
      if (!navShown && e >= 0.9) {
        navShown = true;
        navLogo.classList.add("is-landed"); // corner logo appears with the hero
      }
    };

    const proxy = { e: 0 };
    gsap.set(obStage, { clipPath: "inset(0px 0px 0px 0px)" });

    const CURTAIN_AT = 0.55;
    const CURTAIN_DUR = 2.0;
    // Hold the mark through most of the wipe, then settle it as the hero ground is
    // revealed (overlapping the curtain's tail so it reads as one fluent motion).
    const SETTLE_AT = CURTAIN_AT + CURTAIN_DUR * 0.62;
    const SETTLE_DUR = 1.1;

    const tl = gsap.timeline({
      onComplete: () => {
        gsap.set(obStage, { autoAlpha: 0, pointerEvents: "none" });
        release();
      },
    });
    // Beat 1 — the loader, its job done, fades away.
    tl.to(divider, { autoAlpha: 0, duration: 0.5, ease: "power1.out" }, 0);
    // Beat 2 — the curtain rises in ONE fluent, uninterrupted motion from the bottom to
    // the top, revealing the dark hero. The mark stays put (held at its centre).
    tl.to(
      proxy,
      { e: 1, duration: CURTAIN_DUR, ease: "power1.inOut", onUpdate: () => onCurtain(proxy.e) },
      CURTAIN_AT,
    );
    // Beat 3 — once the hero ground is revealed, assemble the hero AND ease the held
    // mark down into the lens card, its blade flipping bone→blue and stem bone→ink as it
    // shrinks. Started together so the descent rides the hero coming up around it.
    tl.add(() => {
      hero.tl.play();
      hero.idle();
    }, SETTLE_AT);
    tl.to(
      fly,
      {
        x: settleX,
        y: settleY,
        scale: settleScale,
        duration: SETTLE_DUR,
        ease: "power2.inOut",
        onUpdate: function () {
          recolor(this.progress());
        },
      },
      SETTLE_AT,
    );
    // Land — fade the real carded mark in (bone card materialises) and dissolve the
    // clone into it, coincident and recolored, so the swap is unseen.
    tl.add(() => {
      gsap.to(".hero-axis__card", { opacity: 1, duration: 0.3, ease: "power1.out" });
      gsap.to(fly, { autoAlpha: 0, duration: 0.3, ease: "power1.out" });
    }, SETTLE_AT + SETTLE_DUR - 0.05);

    window.__curtain = tl;
  };

  const start = () => {
    buildConveyor(); // rows exist regardless of GSAP (decorative, progressive)
    setupNavTheme(); // always on — not gated behind GSAP/reduced motion
    setupMenu(); // open-state menu — pure DOM, works without GSAP too
    setupCertsMarquee(); // robust infinite certs scroll — independent of GSAP

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
    setupNavHandoff(gsap);

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
