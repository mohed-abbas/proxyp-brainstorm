import { useGSAP } from "@gsap/react";
import { gsap, scheduleRefresh } from "@/lib/gsap";
import type { RefObject } from "react";

type Styles = Record<string, string>;

// Problem reveal — ported from setupProblem() in design-final/scripts/hero.js.
// Scroll-triggered (the visitor is still on the hero at load): the column rises
// word-by-word, the cards settle up, and VOLUME's zigzag draws itself in. The
// small cards (FRICTION, RISK) rest invisible and draw on hover.
//
// The section renders settled by default (SSR / reduced motion). Reduced motion
// returns early, leaving everything readable with all zigzags drawn.
export function useProblem(scope: RefObject<HTMLElement | null>, s: Styles) {
  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      const q = gsap.utils.selector(scope);
      const section = scope.current;
      if (!section) return;

      const words = q(".r-word__in");
      const rule = q(`.${s.eyebrowRule}`);
      const cards = q(`.${s.card}`);
      const paths = q(`.${s.zigzagPath}`);

      const volumeCard = section.querySelector<HTMLElement>(`.${s.cardVolume}`);
      const volumePath =
        volumeCard?.querySelector<SVGPathElement>(`.${s.zigzagPath}`) ?? null;
      const smallPaths = paths.filter((p) => p !== (volumePath as Element | null));

      const animate = (path: Element, offset: number, dur = 0.9) =>
        gsap.to(path, {
          strokeDashoffset: offset,
          duration: dur,
          ease: "power2.inOut",
          overwrite: true,
        });

      gsap.set(paths, { strokeDasharray: 100 });

      // Small cards (FRICTION, RISK): on desktop they rest invisible and draw on
      // hover, erasing on leave. Below 1024 there's no hover (touch), so the
      // hover-draw is skipped and the zigzags simply rest drawn — matching the
      // settled / no-JS state. gsap.matchMedia swaps the two on resize.
      const mm = gsap.matchMedia();
      mm.add("(min-width: 1024px)", () => {
        const teardown: Array<() => void> = [];
        smallPaths.forEach((path) => {
          gsap.set(path, { strokeDashoffset: 100 });
          const card = path.closest(`.${s.card}`);
          if (!card) return;
          const enter = () => animate(path, 0);
          const leave = () => animate(path, 100);
          card.addEventListener("mouseenter", enter);
          card.addEventListener("mouseleave", leave);
          teardown.push(() => {
            card.removeEventListener("mouseenter", enter);
            card.removeEventListener("mouseleave", leave);
          });
        });
        return () => teardown.forEach((fn) => fn());
      });
      mm.add("(max-width: 1023px)", () => {
        gsap.set(smallPaths, { strokeDashoffset: 0 });
      });

      // Parked start state.
      gsap.set(words, { yPercent: 120 });
      gsap.set(rule, {
        autoAlpha: 0,
        scaleX: 0,
        rotation: 0.33,
        transformOrigin: "left center",
      });
      gsap.set(cards, { autoAlpha: 0, y: 28 });
      if (volumePath) gsap.set(volumePath, { strokeDashoffset: 100 });

      const eyebrowWords = q(`.${s.eyebrow} .r-word__in`);
      const headlineWords = q(`.${s.headline} .r-word__in`);
      const bodyWords = q(`.${s.body} .r-word__in`);

      const tl = gsap.timeline({
        defaults: { ease: "power3.out", force3D: true },
        scrollTrigger: {
          trigger: section,
          start: "top 85%",
          end: "top 60%",
          scrub: 3,
          invalidateOnRefresh: true,
        },
      });

      tl.to(eyebrowWords, { yPercent: 0, duration: 0.6 }, 0.0)
        .to(rule, { autoAlpha: 1, scaleX: 1, duration: 0.7 }, 0.1)
        .to(headlineWords, { yPercent: 0, duration: 0.7, stagger: 0.06 }, 0.25)
        .to(bodyWords, { yPercent: 0, duration: 0.7, stagger: 0.018 }, 0.7)
        .to(cards, { autoAlpha: 1, y: 0, duration: 0.8, stagger: 0.14 }, 0.95);

      if (volumePath)
        tl.to(
          volumePath,
          { strokeDashoffset: 0, duration: 1.2, ease: "power2.inOut" },
          0.95,
        );

      scheduleRefresh();
    },
    { scope },
  );
}
