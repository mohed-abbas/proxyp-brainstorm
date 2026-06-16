import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";
import type { RefObject } from "react";

type Styles = Record<string, string>;

// Footer — ported from setupFooter() in design-final/scripts/hero.js. A once-on-
// enter scroll reveal: the hairline dividers draw down (scaleY), the P-mark fades
// + lifts, the two columns of links rise in a staggered cascade, then the
// copyright settles. yPercent keeps the lift resolution-independent. The
// atmosphere (grain + clouds) always renders. Reduced motion returns early.
export function useFooter(scope: RefObject<HTMLElement | null>, s: Styles) {
  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      const q = gsap.utils.selector(scope);
      const section = scope.current;
      if (!section) return;

      const mark = q(`.${s.mark}`);
      const rules = q(`.${s.rule}`);
      const links = q(`.${s.link}`);
      const legal = q(`.${s.legal}`);

      gsap.set(mark, { autoAlpha: 0, yPercent: 12 });
      gsap.set(rules, { autoAlpha: 0, scaleY: 0 });
      gsap.set(links, { autoAlpha: 0, yPercent: 70 });
      gsap.set(legal, { autoAlpha: 0, yPercent: 85 });

      gsap
        .timeline({
          defaults: { ease: "power3.out", force3D: true },
          scrollTrigger: { trigger: section, start: "top 82%", once: true },
        })
        .to(rules, { autoAlpha: 1, scaleY: 1, duration: 0.9, ease: "power2.out", stagger: 0.08 }, 0.0)
        .to(mark, { autoAlpha: 1, yPercent: 0, duration: 0.9, ease: "power2.out" }, 0.15)
        .to(links, { autoAlpha: 1, yPercent: 0, duration: 0.7, stagger: 0.05 }, 0.3)
        .to(legal, { autoAlpha: 1, yPercent: 0, duration: 0.6 }, 0.7);
    },
    { scope },
  );
}
