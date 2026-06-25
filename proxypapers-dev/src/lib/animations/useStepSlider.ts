import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import type { RefObject } from "react";

type Styles = Record<string, string>;

// StepSection slider — the scroll-driven five-step stepper (Figma 142:307).
//
// Desktop (≥1024, motion OK): the section fits the viewport and PINS; a scrubbed +
// snapped ScrollTrigger walks the active step 01→05. On each change the outgoing
// step slides up and fades out while the incoming step rises from below into place;
// the pagination dots track the active step. Driven by scroll, reversible.
//
// Mobile (<1024) / reduced-motion / no-JS: no pin, no swap — the default CSS shows
// all five steps as a stacked list (every step's content stays accessible).
//
// Progressive enhancement mirrors useSliders: the hook flips `data-mode="slider"` on
// the section (CSS then absolute-stacks the slides + fits the section to the
// viewport); without JS the section keeps its natural stacked layout.
export function useStepSlider(scope: RefObject<HTMLElement | null>, s: Styles) {
  useGSAP(
    () => {
      const section = scope.current;
      if (!section) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      const q = gsap.utils.selector(scope);
      const slides = q(`.${s.stepSlide}`) as HTMLElement[];
      const dots = q(`.${s.dot}`) as HTMLElement[];
      const n = slides.length;
      if (n < 2) return; // single step → nothing to slide

      const mm = gsap.matchMedia();

      mm.add("(min-width: 1024px)", () => {
        section.dataset.mode = "slider";

        // Park every slide off, then reveal the first.
        gsap.set(slides, { autoAlpha: 0, yPercent: 0 });
        gsap.set(slides[0], { autoAlpha: 1, yPercent: 0 });
        dots.forEach((d, i) => d.classList.toggle(s.dotActive, i === 0));

        let current = 0;
        const show = (idx: number, dir: number) => {
          if (idx === current || idx < 0 || idx >= n) return;
          const incoming = slides[idx];
          const outgoing = slides[current];
          gsap.to(outgoing, {
            yPercent: dir > 0 ? -45 : 45,
            autoAlpha: 0,
            duration: 0.45,
            ease: "power2.in",
            overwrite: "auto",
          });
          gsap.fromTo(
            incoming,
            { yPercent: dir > 0 ? 60 : -60, autoAlpha: 0 },
            { yPercent: 0, autoAlpha: 1, duration: 0.6, ease: "power3.out", overwrite: "auto" },
          );
          dots.forEach((d, i) => d.classList.toggle(s.dotActive, i === idx));
          current = idx;
        };

        // Pinned, scrubbed + snapped: ~0.6 viewport-heights of scroll per transition.
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
            const idx = Math.round(self.progress * (n - 1));
            show(idx, idx >= current ? 1 : -1);
          },
        });

        return () => {
          st.kill();
          delete section.dataset.mode;
          // gsap.matchMedia reverts the gsap.set/tweens; restore the dot classes it
          // can't (classList isn't gsap state) to the default first-active state.
          dots.forEach((d, i) => d.classList.toggle(s.dotActive, i === 0));
        };
      });
    },
    { scope, revertOnUpdate: true },
  );
}
