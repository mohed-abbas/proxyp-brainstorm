import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import type { RefObject } from "react";

type Styles = Record<string, string>;

// Sliders — the pinned benefit slider (Figma 141:480).
//
// Desktop (≥1024, ≥2 slides): the section PINS at top; scrolling advances one benefit
// at a time. The slides are overlapped in one fixed frame ([data-mode="slider"]); on
// each step the active slide cross-fades in and its title + body re-run the house
// word-rise, while the tilted frame stays put and the label stays fixed. No scrub /
// no native snap (snap would fight Lenis) — content swaps at progress thresholds.
//
// Mobile (<1024): no pin; every slide is shown as a vertical gallery, each revealing on
// enter. Reduced motion: settled, static. Single card: just the on-enter reveal.
export function useSliders(scope: RefObject<HTMLElement | null>, s: Styles) {
  useGSAP(
    () => {
      const section = scope.current;
      if (!section) return;

      // Reduced motion → leave everything at rest (CSS already shows the gallery).
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      const q = gsap.utils.selector(scope);
      const labelWords = q(`.${s.label} .r-word__in`);
      const slides = Array.from(section.querySelectorAll<HTMLElement>(`.${s.slide}`));
      const wordsOf = (slide: HTMLElement) =>
        Array.from(slide.querySelectorAll<HTMLElement>(".r-word__in"));

      // Label + first slide rise as the section scrolls into view (house reveal).
      const enterReveal = () => {
        gsap.set(labelWords, { yPercent: 120 });
        gsap.set(wordsOf(slides[0]), { yPercent: 120 });
        gsap
          .timeline({
            defaults: { ease: "power3.out", force3D: true },
            scrollTrigger: { trigger: section, start: "top 80%", once: true },
          })
          .to(labelWords, { yPercent: 0, duration: 0.7, stagger: 0.05 }, 0)
          .to(wordsOf(slides[0]), { yPercent: 0, duration: 0.7, stagger: 0.03 }, 0.2);
      };

      const mm = gsap.matchMedia();

      // ── Desktop ───────────────────────────────────────────────────────────────
      mm.add("(min-width: 1024px)", () => {
        // Single card: nothing to slide — just the on-enter reveal.
        if (slides.length < 2) {
          enterReveal();
          return;
        }

        // Engage slider mode: overlap the slides, hide all but the first.
        section.dataset.mode = "slider";
        gsap.set(slides, { autoAlpha: 0 });
        gsap.set(slides[0], { autoAlpha: 1 });
        // Park every slide's words below their mask (the first slide's rise on enter).
        slides.forEach((sl) => gsap.set(wordsOf(sl), { yPercent: 120 }));
        enterReveal();

        let current = 0;
        const last = slides.length - 1;

        const goTo = (i: number) => {
          const prev = current;
          current = i;
          gsap.to(slides[prev], { autoAlpha: 0, duration: 0.45, ease: "power2.out" });
          gsap.to(slides[i], { autoAlpha: 1, duration: 0.45, ease: "power2.out" });
          // New title + body re-run the word rise (title first by DOM order, then body).
          const words = wordsOf(slides[i]);
          gsap.set(words, { yPercent: 120 });
          gsap.to(words, {
            yPercent: 0,
            duration: 0.7,
            ease: "power3.out",
            stagger: 0.03,
          });
        };

        // Pin for (N-1) viewport-heights; swap the active slide at each step threshold.
        ScrollTrigger.create({
          trigger: section,
          start: "top top",
          end: "+=" + last * 100 + "%",
          pin: true,
          pinType: "transform",
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const i = Math.round(self.progress * last);
            if (i !== current) goTo(i);
          },
        });

        return () => {
          delete section.dataset.mode;
        };
      });

      // ── Tablet + mobile: vertical gallery, each slide reveals on enter ───────────
      mm.add("(max-width: 1023px)", () => {
        gsap.set(labelWords, { yPercent: 120 });
        gsap
          .timeline({
            scrollTrigger: { trigger: section, start: "top 85%", once: true },
          })
          .to(labelWords, {
            yPercent: 0,
            duration: 0.7,
            stagger: 0.05,
            ease: "power3.out",
          });

        slides.forEach((sl) => {
          const words = wordsOf(sl);
          gsap.set(words, { yPercent: 120 });
          gsap
            .timeline({
              scrollTrigger: { trigger: sl, start: "top 85%", once: true },
            })
            .to(words, {
              yPercent: 0,
              duration: 0.7,
              stagger: 0.02,
              ease: "power3.out",
            });
        });
      });
    },
    { scope },
  );
}
