import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";
import type { RefObject } from "react";

type Styles = Record<string, string>;

// Method reveal — ported from setupMethod() in design-final/scripts/hero.js.
// A once-on-enter scroll reveal (not scrubbed, not pinned): header rises
// word-by-word, the five step rows settle up top-to-bottom, the link fades in
// last. Link hover (arrow nudge) is pure CSS. Reduced motion returns early.
export function useMethod(scope: RefObject<HTMLElement | null>, s: Styles) {
  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      const q = gsap.utils.selector(scope);
      const section = scope.current;
      if (!section) return;

      const titleWords = q(`.${s.title} .r-word__in`);
      const ledeWords = q(`.${s.lede} .r-word__in`);
      const allWords = [...titleWords, ...ledeWords];
      const steps = q(`.${s.step}`);
      const link = q(`.${s.link}`);

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
    },
    { scope },
  );
}
