import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { useLenis } from "@/lib/lenis/LenisProvider";
import { useIntro } from "@/lib/intro/IntroProvider";
import { hasClientNavigated } from "@/lib/intro/navState";
import type { RefObject } from "react";

const SVGNS = "http://www.w3.org/2000/svg";
const BONE = "#f7f4f0";
const BLUE = "#5a90f4";
const INK = "#161718";

// Onboarding intro + curtain handoff — ported from setupOnboardingIntro() and
// runCurtain() in design-final/scripts/hero.js (the one controller that merges
// onboarding → hero). The welcome assembles on a clock (scroll is locked), then
// the curtain wipes the blue overlay away bottom-up while the held P-mark settles
// into the hero's lens card and the hero assembles around it. On landing the
// scroll lock releases. Reduced motion / no overlay → land straight on the hero.
export function useOnboarding(stageRef: RefObject<HTMLDivElement | null>) {
  const lenisRef = useLenis();
  const intro = useIntro();

  useGSAP(() => {
    const root = document.documentElement;
    const obStage = stageRef.current;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Hand the page over to normal scrolling once the welcome resolves.
    const release = () => {
      root.classList.add("pp-ready");
      lenisRef?.current?.start();
      ScrollTrigger.refresh();
    };

    const lockup = obStage?.querySelector<SVGSVGElement>(".ob-lockup");

    // Settled path — reduced motion or no overlay: drop the welcome (removing
    // `js` hides the overlay + unlocks scroll via CSS) and land on the hero.
    if (reduced || !obStage || !lockup) {
      root.classList.remove("js");
      return;
    }

    // Client-side return to home (not a fresh load): the page transition already
    // animates the swap, so the welcome curtain must NOT play — running both is the
    // glitchy overlap. Hide the overlay now and settle the hero in place. (A real
    // refresh resets hasClientNavigated, so the welcome still plays on a genuine
    // reload of the home page.)
    if (hasClientNavigated()) {
      gsap.set(obStage, { autoAlpha: 0, pointerEvents: "none" });
      // Hero's useGSAP runs after this sibling's, so its timeline isn't registered
      // yet — wait one frame (all mount effects have committed by then) to settle.
      requestAnimationFrame(() => {
        const hero = intro?.getHero();
        document.querySelector("[data-nav-logo]")?.classList.add("is-landed");
        const card = document.querySelector("[data-axis-card]");
        if (card) gsap.set(card, { opacity: 1 });
        hero?.heroTl?.progress(1, false); // jump to settled; fire onComplete (conveyor)
        hero?.heroIdle?.();
        release();
      });
      return;
    }

    // ── Assemble (setupOnboardingIntro) ──────────────────────────────────────
    // Wrap each mark half in a clip rect sitting on its own baseline, then park
    // it below (clipped away) so it can slide up into view. The onboarding lockup
    // carries only the P-mark, so there are no wordmark glyphs to wrap.
    const PAD_X = 2;
    const PAD_TOP = 6;
    const rise = new Map<Element, number>();
    let clipN = 0;

    let defs = lockup.querySelector("defs");
    if (!defs) {
      defs = document.createElementNS(SVGNS, "defs");
      lockup.insertBefore(defs, lockup.firstChild);
    }

    const wrap = (path: SVGGraphicsElement) => {
      const bb = path.getBBox();
      const id = "ob-clip-" + clipN++;
      const cp = document.createElementNS(SVGNS, "clipPath");
      cp.setAttribute("id", id);
      cp.setAttribute("clipPathUnits", "userSpaceOnUse");
      const rect = document.createElementNS(SVGNS, "rect");
      rect.setAttribute("x", String(bb.x - PAD_X));
      rect.setAttribute("y", String(bb.y - PAD_TOP));
      rect.setAttribute("width", String(bb.width + PAD_X * 2));
      rect.setAttribute("height", String(bb.height + PAD_TOP));
      cp.appendChild(rect);
      defs!.appendChild(cp);

      const g = document.createElementNS(SVGNS, "g");
      g.setAttribute("clip-path", "url(#" + id + ")");
      path.parentNode!.insertBefore(g, path);
      g.appendChild(path);

      rise.set(path, bb.height + PAD_TOP);
    };

    const mark = lockup.querySelector<SVGGElement>(".lk-mark");
    const stem = lockup.querySelector<SVGPathElement>(".lk-mark__stem");
    const blade = lockup.querySelector<SVGPathElement>(".lk-mark__blade");
    if (!mark || !stem || !blade) {
      root.classList.remove("js");
      return;
    }
    const parts = [stem, blade];
    parts.forEach(wrap);

    gsap.set(mark, { opacity: 1 });
    gsap.set(parts, { opacity: 1, y: (i, t: Element) => rise.get(t) ?? 0 });

    const q = gsap.utils.selector(obStage);
    const obTl = gsap.timeline({ defaults: { ease: "power3.out" }, paused: true });

    obTl
      .to(q(".ob-watermark"), { opacity: 0.2, duration: 1.6, ease: "power2.out" }, 0)
      .fromTo(
        q(".ob-cloud--left"),
        { opacity: 0, xPercent: -6 },
        { opacity: 1, xPercent: 0, duration: 1.8, ease: "power2.out" },
        0,
      )
      .fromTo(
        q(".ob-cloud--top-right"),
        { opacity: 0, yPercent: -5 },
        { opacity: 1, yPercent: 0, duration: 1.8, ease: "power2.out" },
        0.1,
      );

    obTl.to([stem, blade], { y: 0, duration: 0.7, stagger: 0.14 }, 0.35);

    obTl.fromTo(
      q(".ob-divider__fill"),
      { width: "0%" },
      { width: "100%", duration: 1.7, ease: "none" },
      0.35,
    );

    // ── Curtain handoff (runCurtain) ─────────────────────────────────────────
    let fly: SVGSVGElement | null = null;

    const runCurtain = () => {
      const hero = intro?.getHero();
      const navLogo = document.querySelector("[data-nav-logo]");
      const divider = q(".ob-divider");
      // The hero card + its mark live OUTSIDE the ob-stage scope, so they must be
      // animated by element reference — useGSAP scopes selector strings to the
      // stage, where they don't exist.
      const card = document.querySelector("[data-axis-card]");
      const cardImg = card?.querySelector("img") ?? card;

      // Fallback — no landing target: reveal the hero + card and release.
      if (!navLogo || !cardImg) {
        gsap.set(obStage, { autoAlpha: 0, pointerEvents: "none" });
        navLogo?.classList.add("is-landed");
        if (card) gsap.set(card, { opacity: 1 });
        hero?.heroTl?.play();
        hero?.heroIdle?.();
        release();
        return;
      }

      // The flying mark — a standalone svg holding clones of the stem + blade,
      // lifted above the overlay (z 250) so the rising curtain never clips it.
      const bb = mark.getBBox();
      fly = document.createElementNS(SVGNS, "svg");
      fly.setAttribute("class", "pp-nav-fly");
      fly.setAttribute("viewBox", `${bb.x} ${bb.y} ${bb.width} ${bb.height}`);
      fly.setAttribute("fill", "none");
      fly.setAttribute("aria-hidden", "true");
      const flyStem = document.createElementNS(SVGNS, "path");
      flyStem.setAttribute("d", stem.getAttribute("d")!);
      const flyBlade = document.createElementNS(SVGNS, "path");
      flyBlade.setAttribute("d", blade.getAttribute("d")!);
      fly.appendChild(flyStem);
      fly.appendChild(flyBlade);
      document.body.appendChild(fly);

      const restMark = mark.getBoundingClientRect();
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
      gsap.set([flyStem, flyBlade], { fill: BONE });
      gsap.set(mark, { opacity: 0 });

      // Landing target — the mark inside the hero's lens card. It stays at its
      // x-centre and eases DOWN into the card, shrinking to its size.
      const restLens = cardImg.getBoundingClientRect();
      const markCX = restMark.left + restMark.width / 2;
      const markCY = restMark.top + restMark.height / 2;
      const lensCX = restLens.left + restLens.width / 2;
      const lensCY = restLens.top + restLens.height / 2;
      const settleX = lensCX - markCX;
      const settleY = lensCY - markCY;
      const settleScale = restLens.height / restMark.height;

      // Recolor the clone across the settle so it matches the carded mark (ink
      // stem, blue blade) the instant it's swapped in — bone→ink/blue, no pop.
      const recolor = (p: number) => {
        gsap.set(flyBlade, { fill: gsap.utils.interpolate(BONE, BLUE, p) });
        gsap.set(flyStem, { fill: gsap.utils.interpolate(BONE, INK, p) });
      };

      const cloudL = obStage.querySelector(".ob-cloud--left");
      const cloudTR = obStage.querySelector(".ob-cloud--top-right");
      let navShown = false;
      const onCurtain = (e: number) => {
        gsap.set(obStage, {
          clipPath: `inset(0px 0px ${(e * 100).toFixed(3)}% 0px)`,
        });
        if (cloudL)
          gsap.set(cloudL, { yPercent: -4 * e, xPercent: -2.5 * e, scale: 1 + 0.04 * e });
        if (cloudTR)
          gsap.set(cloudTR, { yPercent: -7 * e, xPercent: 3.5 * e, scale: 1 + 0.07 * e });
        if (!navShown && e >= 0.9) {
          navShown = true;
          navLogo.classList.add("is-landed");
        }
      };

      const proxy = { e: 0 };
      gsap.set(obStage, { clipPath: "inset(0px 0px 0px 0px)" });

      const CURTAIN_AT = 0.55;
      const CURTAIN_DUR = 2.0;
      const SETTLE_AT = CURTAIN_AT + CURTAIN_DUR * 0.62;
      const SETTLE_DUR = 1.1;

      const tl = gsap.timeline({
        onComplete: () => {
          gsap.set(obStage, { autoAlpha: 0, pointerEvents: "none" });
          release();
        },
      });
      // Beat 1 — the loader fades away.
      tl.to(divider, { autoAlpha: 0, duration: 0.5, ease: "power1.out" }, 0);
      // Beat 2 — the curtain rises in one fluent motion; the mark holds centred.
      tl.to(
        proxy,
        {
          e: 1,
          duration: CURTAIN_DUR,
          ease: "power1.inOut",
          onUpdate: () => onCurtain(proxy.e),
        },
        CURTAIN_AT,
      );
      // Beat 3 — assemble the hero AND ease the held mark into the lens card,
      // recoloring as it shrinks. Started together so the descent rides the hero.
      tl.add(() => {
        hero?.heroTl?.play();
        hero?.heroIdle?.();
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
      // Land — fade the carded mark in and dissolve the clone into it, unseen.
      tl.add(() => {
        gsap.to(card, { opacity: 1, duration: 0.3, ease: "power1.out" });
        gsap.to(fly, { autoAlpha: 0, duration: 0.3, ease: "power1.out" });
      }, SETTLE_AT + SETTLE_DUR - 0.05);
    };

    obTl.eventCallback("onComplete", runCurtain);

    // ── Asset gate — play once fonts + key images decode (or after 1.4s). ─────
    const decode = (src: string) => {
      const img = new Image();
      img.src = src;
      return img.decode ? img.decode().catch(() => {}) : Promise.resolve();
    };
    const ready = Promise.all([
      document.fonts ? document.fonts.ready : Promise.resolve(),
      decode("/images/clouds.webp"),
      decode("/images/grain.webp"),
      decode("/images/hero-lens.webp"),
    ]);
    let played = false;
    const play = () => {
      if (!played) {
        played = true;
        obTl.play();
      }
    };
    Promise.race([ready, new Promise((r) => setTimeout(r, 1400))]).then(play);

    // Clean up the runtime-built clone + timelines (HMR / unmount).
    return () => {
      obTl.kill();
      fly?.remove();
    };
  }, { scope: stageRef });
}
