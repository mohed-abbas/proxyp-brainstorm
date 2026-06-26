import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import type { RefObject } from "react";

type Styles = Record<string, string>;

// StepSection slider — the scroll-driven five-step conveyor (Figma 142:307).
//
// Desktop (≥1024, motion OK): the section fits the viewport and PINS. The five steps
// are one tall filmstrip (the .stepViewport strip) inside a one-step clip window (the
// Bone .stepCard). The motion is TRIGGERED, not scrubbed: each step holds dead-still
// while you scroll through its span, then crossing into the next step FIRES a crisp,
// fixed-pace glide that brings the next card up. Hold, trigger, glide, hold — so each
// transition plays as a real animation at its own tempo instead of crawling in lock-
// step with the scrollbar (which read as sluggish). Snap settles the scroll onto a
// step so you always rest inside a dwell. Non-active steps dim; the dots track the
// active card. Fully reversible — scrolling back fires the glide the other way.
//
// Mobile (<1024) / reduced-motion / no-JS: no pin, no conveyor — the default CSS
// shows all five steps as a stacked list (every step's content stays accessible).
//
// Progressive enhancement mirrors useSliders: the hook flips `data-mode="slider"` on
// the section (CSS then stacks the slides into a filmstrip + fits the section to the
// viewport); without JS the section keeps its natural stacked layout.
export function useStepSlider(scope: RefObject<HTMLElement | null>, s: Styles) {
  useGSAP(
    () => {
      const section = scope.current;
      if (!section) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      const q = gsap.utils.selector(scope);
      const strip = q(`.${s.stepViewport}`)[0] as HTMLElement | undefined;
      const slides = q(`.${s.stepSlide}`) as HTMLElement[];
      const dots = q(`.${s.dot}`) as HTMLElement[];
      const n = slides.length;
      if (!strip || n < 2) return; // single step → nothing to convey

      const mm = gsap.matchMedia();

      mm.add("(min-width: 1024px)", () => {
        section.dataset.mode = "slider";

        // The strip holds n equal card-height slides, so one card == 100/n % of the
        // strip's own height.
        const perCard = 100 / n;

        // go(idx): fire ONE crisp glide to a step (a fixed-duration tween, NOT scrub-
        // mapped), plus the dot + dimming for that step. overwrite:true so a fast scroll
        // across several steps collapses into a single glide to the final card.
        let idx = -1;
        const go = (next: number) => {
          next = Math.max(0, Math.min(n - 1, next));
          if (next === idx) return;
          idx = next;
          dots.forEach((d, i) => d.classList.toggle(s.dotActive, i === idx));
          gsap.to(strip, {
            yPercent: -perCard * idx,
            duration: 0.55,
            ease: "power2.out",
            overwrite: true,
          });
          slides.forEach((sl, i) =>
            gsap.to(sl, {
              opacity: i === idx ? 1 : 0.25,
              duration: 0.35,
              ease: "power1.out",
              overwrite: "auto",
            }),
          );
        };
        gsap.set(strip, { yPercent: 0 });
        go(0);

        // Pinned, ~0.6 viewport-heights of scroll per step — enough that each step holds
        // briefly before the next fires, without the section dragging on. NO scrub: the
        // strip glide is the fired tween above; ScrollTrigger only quantises scroll into
        // a step index. Snap settles the scroll onto a step so it rests inside a dwell.
        const STEP_VH = 0.6;
        const st = ScrollTrigger.create({
          trigger: section,
          start: "top top",
          end: "+=" + Math.round((n - 1) * STEP_VH * 100) + "%",
          pin: true,
          pinType: "transform",
          anticipatePin: 1,
          snap: {
            snapTo: 1 / (n - 1),
            duration: { min: 0.15, max: 0.35 },
            ease: "power1.inOut",
          },
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            // Cross a step's midpoint → trigger that step's glide.
            go(Math.round(self.progress * (n - 1)));
          },
        });

        return () => {
          st.kill();
          delete section.dataset.mode;
          // gsap.matchMedia reverts the strip transform + slide opacities; restore the
          // dot classes it can't (classList isn't gsap state) to first-active.
          dots.forEach((d, i) => d.classList.toggle(s.dotActive, i === 0));
        };
      });
    },
    { scope, revertOnUpdate: true },
  );
}
