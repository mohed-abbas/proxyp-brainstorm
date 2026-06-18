import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";
import type { RefObject } from "react";

type Styles = Record<string, string>;

// Tracks — a once-on-enter scroll reveal (house mechanic, like TooMuch). The title
// rises word-by-word; the right-hand intro and the two track columns then settle up
// just behind it. Reduced motion returns early → the card renders static/settled.
export function useTracks(scope: RefObject<HTMLElement | null>, s: Styles) {
  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      const q = gsap.utils.selector(scope);
      const section = scope.current;
      if (!section) return;

      const titleWords = q(`.${s.title} .r-word__in`);
      const settle = [q(`.${s.intro}`), ...q(`.${s.col}`)];

      gsap.set(titleWords, { yPercent: 120 });
      gsap.set(settle, { autoAlpha: 0, y: 28 });

      gsap
        .timeline({
          defaults: { ease: "power3.out", force3D: true },
          scrollTrigger: { trigger: section, start: "top 78%", once: true },
        })
        .to(titleWords, { yPercent: 0, duration: 0.75, stagger: 0.06 }, 0)
        .to(settle, { autoAlpha: 1, y: 0, duration: 0.7, stagger: 0.12 }, 0.35);
    },
    { scope },
  );
}
