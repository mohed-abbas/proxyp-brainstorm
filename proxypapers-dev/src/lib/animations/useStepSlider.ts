import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import type { RefObject } from "react";

type Styles = Record<string, string>;

// StepSection slider — the scroll-driven five-step conveyor (Figma 142:307).
//
// Desktop (≥1024, motion OK): the section fits the viewport and PINS. The five steps
// are one tall filmstrip (the .stepViewport strip) inside a one-step clip window (the
// Bone .stepCard). Scroll progress translates the strip up by exactly one card per
// step, so as the active step climbs out the top the next rises from the bottom in
// the SAME continuous travel — a vertical conveyor, no fade gap. Non-active steps dim
// so focus lands on the one in frame; the pagination dots track it. Snapped to rest
// on a card; fully reversible.
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
        // strip's own height — translate by that per step. Active = full opacity,
        // the rest dim.
        const perCard = 100 / n;
        gsap.set(strip, { yPercent: 0 });

        let current = -1;
        const setActive = (idx: number) => {
          if (idx === current) return;
          current = idx;
          dots.forEach((d, i) => d.classList.toggle(s.dotActive, i === idx));
          slides.forEach((sl, i) =>
            gsap.to(sl, {
              opacity: i === idx ? 1 : 0.25,
              duration: 0.3,
              ease: "power1.out",
              overwrite: "auto",
            }),
          );
        };
        setActive(0);

        // Pinned, scrubbed + snapped: ~0.6 viewport-heights of scroll per step. The
        // strip's travel is mapped straight off scroll progress (scrub smooths it),
        // so the motion is one continuous conveyor rather than discrete swaps.
        const STEP_VH = 0.6;
        const st = ScrollTrigger.create({
          trigger: section,
          start: "top top",
          end: "+=" + Math.round((n - 1) * STEP_VH * 100) + "%",
          pin: true,
          pinType: "transform",
          anticipatePin: 1,
          scrub: 0.6,
          snap: {
            snapTo: 1 / (n - 1),
            duration: { min: 0.1, max: 0.3 },
            ease: "power1.inOut",
          },
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            gsap.set(strip, { yPercent: -perCard * self.progress * (n - 1) });
            setActive(Math.round(self.progress * (n - 1)));
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
