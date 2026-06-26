import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";
import type { RefObject } from "react";

type Styles = Record<string, string>;

// StepSection header — a once-on-enter reveal that plays as the panel rises into view.
// It fires at "top 78%", i.e. BEFORE the desktop slider pins the section at "top top"
// (see useStepSlider), so the two compose: the header has settled by the time the pin
// engages. The "Five steps…" heading rises word-by-word, the lede settles word-by-word
// just after, then the two pre-engagement cards lift in and the connector fades up. The
// numbered steps below are owned by useStepSlider. Mirrors useFreedom's enter-reveal.
// Reduced motion returns early → the settled CSS base renders (text already visible).
export function useStepsHeader(scope: RefObject<HTMLElement | null>, s: Styles) {
  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      const q = gsap.utils.selector(scope);
      const section = scope.current;
      if (!section) return;

      const headWords = q(`.${s.heading} .r-word__in`);
      const ledeWords = q(`.${s.lede} .r-word__in`);
      const engCards = q(`.${s.engCard}`);
      const connector = q(`.${s.connector}`);

      gsap.set(headWords, { yPercent: 110 });
      gsap.set(ledeWords, { yPercent: 120 });
      gsap.set(engCards, { autoAlpha: 0, y: 28 });
      gsap.set(connector, { autoAlpha: 0 });

      gsap
        .timeline({
          defaults: { ease: "power3.out", force3D: true },
          scrollTrigger: { trigger: section, start: "top 78%", once: true },
        })
        .to(headWords, { yPercent: 0, duration: 0.7, stagger: 0.05 }, 0)
        .to(ledeWords, { yPercent: 0, duration: 0.7, stagger: 0.012 }, 0.3)
        .to(engCards, { autoAlpha: 1, y: 0, duration: 0.7, stagger: 0.12 }, 0.5)
        .to(connector, { autoAlpha: 1, duration: 0.5 }, 0.7);
    },
    { scope },
  );
}
