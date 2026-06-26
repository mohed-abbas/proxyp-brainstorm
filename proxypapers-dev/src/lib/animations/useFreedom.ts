import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";
import type { RefObject } from "react";

type Styles = Record<string, string>;

// Freedom — a once-on-enter reveal for the /approach freedom panel. As the section
// arrives, the Proxy-Blue heading rises word-by-word, the two-weight body settles
// word-by-word just after, then the two statement cards lift in. Mirrors useClosing's
// enter-reveal shape (power3.out, word masks via .r-word__in). Reduced motion returns
// early → the settled panel renders from the CSS base (text already visible).
export function useFreedom(scope: RefObject<HTMLElement | null>, s: Styles) {
  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      const q = gsap.utils.selector(scope);
      const section = scope.current;
      if (!section) return;

      const headWords = q(`.${s.heading} .r-word__in`);
      const bodyWords = q(`.${s.body} .r-word__in`);
      const cards = q(`.${s.card}`);

      gsap.set(headWords, { yPercent: 110 });
      gsap.set(bodyWords, { yPercent: 120 });
      gsap.set(cards, { autoAlpha: 0, y: 28 });

      gsap
        .timeline({
          defaults: { ease: "power3.out", force3D: true },
          scrollTrigger: { trigger: section, start: "top 78%", once: true },
        })
        .to(headWords, { yPercent: 0, duration: 0.7, stagger: 0.05 }, 0)
        .to(bodyWords, { yPercent: 0, duration: 0.7, stagger: 0.012 }, 0.35)
        .to(cards, { autoAlpha: 1, y: 0, duration: 0.7, stagger: 0.12 }, 0.6);
    },
    { scope },
  );
}
