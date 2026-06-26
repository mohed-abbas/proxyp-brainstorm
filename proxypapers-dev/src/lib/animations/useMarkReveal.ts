import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";
import type { RefObject } from "react";

type Styles = Record<string, string>;

// useMarkReveal — the /approach "Pioneer since 2016" scene (Figma 634:209 + separated
// state 634:343). The section pins; two beats with DIFFERENT drivers:
//
//  1. ASSEMBLE (scroll-scrubbed) — the bone stem stays put while the Proxy-Blue blade
//     slides from its separated spot (+731 / +59 design-px) into the stem, forming the
//     P-mark, tied to scroll. A hold tween follows so the pin keeps holding past the
//     meeting point. (The blade's CSS position IS its resting spot, so we translate it.)
//  2. REVEAL (auto-played) — the MOMENT the two vectors meet, a SEPARATE, self-playing
//     timeline runs on its own (not scrubbed): every text block rises with the site-wide
//     per-word slide-up mask (.r-word__in: yPercent 120 → 0), the dashed connectors draw
//     on (arrow = rect mask grows top→bottom, snake = normalized stroke dashoffset 1→0),
//     and the blue dots pop at the snake's termini. Scrolling back past the meeting point
//     reverses it. A scrub-progress threshold (assemble vs. hold split) is the trigger.
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

        // ── REVEAL — a self-playing timeline (paused). Plays once the vectors meet;
        // reverses if the user scrolls back before the meeting point. Real-time seconds,
        // NOT scrubbed. Mask fromTos carry immediateRender so the collapsed state is set
        // at build and reasserted on reverse → connectors stay undrawn until it plays.
        const reveal = gsap.timeline({
          paused: true,
          defaults: { ease: "power3.out" },
        });
        reveal.to(yearWords, { yPercent: 0, duration: 0.6, stagger: 0.1 }, 0);
        if (arrowMask)
          reveal.fromTo(
            arrowMask,
            { attr: { height: 0 } },
            { attr: { height: 259 }, duration: 0.7, ease: "none", immediateRender: true },
            0.2,
          );
        reveal.to(dotStart, { autoAlpha: 1, scale: 1, duration: 0.3, ease: "back.out(2)" }, 0.15);
        if (snakeMask)
          reveal.fromTo(
            snakeMask,
            { attr: { "stroke-dashoffset": 1 } },
            { attr: { "stroke-dashoffset": 0 }, duration: 1.0, ease: "none", immediateRender: true },
            0.2,
          );
        reveal.to(dotEnd, { autoAlpha: 1, scale: 1, duration: 0.3, ease: "back.out(2)" }, 1.1);
        reveal
          .to(labelWords, { yPercent: 0, duration: 0.5, stagger: 0.06 }, 0.3)
          .to(bodyWords, { yPercent: 0, duration: 0.45, stagger: 0.012 }, 0.45)
          .to(headWords, { yPercent: 0, duration: 0.6, stagger: 0.05 }, 0.55);

        // ── ASSEMBLE — scroll-scrubbed, pinned. The blade meets the stem over the first
        // half (duration 1); an empty hold (duration 1) fills the rest of the pin so the
        // section stays put while the reveal auto-plays. The vectors meet at progress 0.5.
        const MEET = 0.5;
        const assemble = gsap.timeline({
          defaults: { force3D: true },
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: "+=180%",
            scrub: 1,
            pin: true,
            pinType: "transform",
            pinSpacing: true,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              // The instant the vectors meet, let the reveal run on its own; scrubbing
              // back before the meeting point rewinds it.
              if (self.progress >= MEET) reveal.play();
              else reveal.reverse();
            },
          },
        });
        assemble
          .fromTo(
            angle,
            { x: () => 731 * u(), y: () => 59 * u() },
            { x: 0, y: 0, duration: 1, ease: "power2.inOut" },
            0,
          )
          .to({}, { duration: 1 }); // hold — keeps the section pinned for the auto reveal
      });
    },
    { scope },
  );
}
