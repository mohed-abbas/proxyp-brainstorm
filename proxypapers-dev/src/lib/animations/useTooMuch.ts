import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";
import type { RefObject } from "react";

type Styles = Record<string, string>;

// TooMuch — a once-on-enter scroll reveal (same house mechanic as Closing). The
// Proxy-Blue headline rises word-by-word, then the muted copy settles in just
// behind it. Reduced motion returns early → the settled band renders static.
export function useTooMuch(scope: RefObject<HTMLElement | null>, s: Styles) {
  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      const q = gsap.utils.selector(scope);
      const section = scope.current;
      if (!section) return;

      const headlineWords = q(`.${s.headline} .r-word__in`);
      const bodyWords = q(`.${s.body} .r-word__in`);

      gsap.set([...headlineWords, ...bodyWords], { yPercent: 120 });

      gsap
        .timeline({
          defaults: { ease: "power3.out", force3D: true },
          scrollTrigger: { trigger: section, start: "top 78%", once: true },
        })
        .to(headlineWords, { yPercent: 0, duration: 0.75, stagger: 0.07 }, 0.0)
        .to(bodyWords, { yPercent: 0, duration: 0.7, stagger: 0.016 }, 0.45);
    },
    { scope },
  );
}
