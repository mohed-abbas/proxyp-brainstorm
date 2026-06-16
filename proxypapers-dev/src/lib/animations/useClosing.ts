import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";
import type { RefObject } from "react";

type Styles = Record<string, string>;

// Closing — ported from setupClosing() in design-final/scripts/hero.js.
// A once-on-enter scroll reveal: the oversized headline rises word-by-word, then
// the link fades up and the reassurance copy settles word-by-word. Link hover
// (arrow nudge) is pure CSS. Reduced motion returns early → settled band renders.
export function useClosing(scope: RefObject<HTMLElement | null>, s: Styles) {
  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      const q = gsap.utils.selector(scope);
      const section = scope.current;
      if (!section) return;

      const titleWords = q(`.${s.title} .r-word__in`);
      const bodyWords = q(`.${s.body} .r-word__in`);
      const link = q(`.${s.link}`);

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
    },
    { scope },
  );
}
