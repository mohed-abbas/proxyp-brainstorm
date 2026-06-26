import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";
import type { RefObject } from "react";

type Styles = Record<string, string>;

// useMarkReveal — the /approach "Pioneer since 2016" scene (Figma 634:209 + separated
// state 634:343). Two pinned, scrubbed beats matching the brief:
//
//  1. ASSEMBLE — the section pins; the bone stem stays put while the Proxy-Blue blade
//     slides from its separated spot (+731 / +59 design-px) into the stem, forming the
//     P-mark. (The blade's CSS position IS its resting spot, so we translate it home.)
//  2. REVEAL — once assembled, the composition comes in: every text block rises with
//     the site-wide per-word slide-up mask (.r-word__in: yPercent 120 → 0), while the
//     dashed connectors DRAW ON — the down-arrow via a rect mask growing top→bottom,
//     the snake via a normalized stroke mask (dashoffset 1 → 0). The blue end dots pop
//     at the snake's start and end. Nothing fades.
//
// Lengths are design-px scaled by --mark-u; rather than parse that min() expression we
// derive the live px-per-design-unit from the rendered stem width (315 design-px), via
// function-based tween values so it re-evaluates on ScrollTrigger refresh / resize.
//
// Desktop only (≥1024): the compact diagram + pin assume the artboard layout. Below
// 1024 the section reflows to a stacked column and renders settled. Reduced motion
// returns early → the settled scene (CSS base + connectors authored revealed) renders.
export function useMarkReveal(scope: RefObject<HTMLElement | null>, s: Styles) {
  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      const section = scope.current;
      if (!section) return;
      const q = (sel: string) => section.querySelector<HTMLElement>(sel);
      const qa = (sel: string) =>
        Array.from(section.querySelectorAll<HTMLElement>(sel));

      const mm = gsap.matchMedia();
      mm.add("(min-width: 1024px)", () => {
        const stem = q(`.${s.stem}`);
        const angle = q(`.${s.angle}`);
        if (!stem || !angle) return;

        // Live design-px → CSS-px factor from the rendered stem (315 design-px wide).
        const u = () => stem.getBoundingClientRect().width / 315;

        const yearWords = qa(`.${s.year} .r-word__in`);
        const headWords = qa(`.${s.headline} .r-word__in`);
        const labelWords = qa(`.${s.entryLabel} .r-word__in`);
        const bodyWords = qa(`.${s.entryBody} .r-word__in`);
        const allWords = [...yearWords, ...headWords, ...labelWords, ...bodyWords];

        const arrowMask = q(`.${s.arrowMask}`);
        const snakeMask = q(`.${s.snakeMask}`);
        const dotStart = q(`.${s.dotStart}`);
        const dotEnd = q(`.${s.dotEnd}`);

        // Pre-reveal state. Words ride below their clip; dots shrink. The connectors'
        // collapsed state lives in their timeline fromTo (immediateRender) below, NOT a
        // standalone set — the masks are authored REVEALED for the no-JS / reduced-motion
        // fallback, and a bare set wouldn't survive ScrollTrigger's invalidateOnRefresh
        // (it would flash the fully-drawn lines at progress 0).
        gsap.set(allWords, { yPercent: 120 });
        gsap.set([dotStart, dotEnd], {
          autoAlpha: 0,
          scale: 0,
          transformOrigin: "50% 50%",
        });

        const tl = gsap.timeline({
          defaults: { ease: "power3.out", force3D: true },
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: "+=200%",
            scrub: 1.4,
            pin: true,
            pinType: "transform",
            pinSpacing: true,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        });

        // 1 — assemble: blade slides from the separated offset into the fixed stem.
        tl.fromTo(
          angle,
          { x: () => 731 * u(), y: () => 59 * u() },
          { x: 0, y: 0, duration: 1.3, ease: "power2.inOut" },
          0,
        );

        // 2 — reveal, after the mark has settled.
        // Years rise on the blade, then the down-arrow draws between them.
        tl.to(yearWords, { yPercent: 0, duration: 0.6, stagger: 0.12 }, 1.15);
        if (arrowMask)
          tl.fromTo(
            arrowMask,
            { attr: { height: 0 } },
            { attr: { height: 259 }, duration: 0.8, ease: "none", immediateRender: true },
            1.45,
          );

        // Snake draws start→end with its dots popping at each terminus.
        tl.to(dotStart, { autoAlpha: 1, scale: 1, duration: 0.3, ease: "back.out(2)" }, 1.4);
        if (snakeMask)
          tl.fromTo(
            snakeMask,
            { attr: { "stroke-dashoffset": 1 } },
            { attr: { "stroke-dashoffset": 0 }, duration: 1.1, ease: "none", immediateRender: true },
            1.45,
          );
        tl.to(dotEnd, { autoAlpha: 1, scale: 1, duration: 0.3, ease: "back.out(2)" }, 2.45);

        // Timeline copy rises, then the headline.
        tl.to(labelWords, { yPercent: 0, duration: 0.5, stagger: 0.06 }, 1.55)
          .to(bodyWords, { yPercent: 0, duration: 0.45, stagger: 0.012 }, 1.7)
          .to(headWords, { yPercent: 0, duration: 0.6, stagger: 0.05 }, 1.85)
          // small tail so the fully-assembled scene holds before unpin.
          .to({}, { duration: 0.4 });
      });
    },
    { scope },
  );
}
