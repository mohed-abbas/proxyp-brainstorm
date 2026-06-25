import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";
import type { RefObject } from "react";

type Styles = Record<string, string>;

// "How to begin." reveal (Figma node 160:1015). Not pinned — a one-shot scroll-in: when the
// section enters the viewport the heading rises, the cloud tiles fade up, and the three step
// cards stagger in along the staircase (discovery → audit → engagement). Plays once.
//
// Flash-free: the heading, cards and clouds are armed opacity:0 in CSS under html.js, so SSR
// paints them hidden and this reveal animates them in. Reduced motion → early return; the CSS
// reduced-motion rule shows the settled composition with no tween.
export function useHowTo(scope: RefObject<HTMLElement | null>, s: Styles) {
  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      const section = scope.current;
      if (!section) return;

      const q = gsap.utils.selector(scope);
      const heading = q(`.${s.heading}`);
      const clouds = q(`.${s.cloud}`);
      // Cards in staircase order (DOM order = discovery, audit, engagement).
      const cards = q(`.${s.card}`);

      gsap.set([...heading, ...clouds], { opacity: 0, y: 24 });
      gsap.set(cards, { opacity: 0, y: 36 });

      const tl = gsap.timeline({
        defaults: { ease: "power3.out" },
        scrollTrigger: { trigger: section, start: "top 75%", once: true },
      });
      tl.to(heading, { opacity: 1, y: 0, duration: 0.7 }, 0);
      tl.to(clouds, { opacity: 1, y: 0, duration: 0.8, stagger: 0.12 }, 0.15);
      tl.to(cards, { opacity: 1, y: 0, duration: 0.7, stagger: 0.14 }, 0.3);
    },
    { scope },
  );
}
