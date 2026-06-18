import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";
import type { RefObject } from "react";

type Styles = Record<string, string>;

// WhiteLabel — the same reveal mechanic as Trust (setupTrust): the band PINS centred as a
// small compact card (eyebrow on top, a large P-badge in the middle), then a heavy-scrubbed
// timeline opens the panel to full width — the eyebrow lifts away, the badge shrinks and
// rises to the top, the concentric rings + YOU core grow in, the blue title rises
// word-by-word on the left and the body settles in word-by-word on the right — then holds
// open for a beat before releasing.
//
// Desktop only (≥1024): the compact card + pinned scrub assume the desktop panel. Below 1024
// (and reduced motion) the hook returns early and the settled open band renders (CSS base).
export function useWhiteLabel(scope: RefObject<HTMLElement | null>, s: Styles) {
  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      const section = scope.current;
      if (!section) return;
      const q = (sel: string) => section.querySelector<HTMLElement>(sel);

      const mm = gsap.matchMedia();
      mm.add("(min-width: 1024px)", () => {
        const panel = q(`.${s.panel}`);
        const eyebrow = q(`.${s.eyebrow}`);
        const title = q(`.${s.title}`);
        const body = q(`.${s.body}`);
        const badge = q(`.${s.badge}`);
        const rings = q(`.${s.rings}`);
        const sel = gsap.utils.selector(scope);
        const titleWords = sel(`.${s.title} .r-word__in`);
        const bodyWords = sel(`.${s.body} .r-word__in`);

        // GSAP treats vw on transforms as px, so resolve vw → px and cap at the Figma px.
        const vwToPx = (vw: number) => (vw / 100) * window.innerWidth;
        const cap = (vw: number, px: number) => Math.min(vwToPx(vw), px);

        // Collapsed initial state — the Figma compact card (144:2).
        gsap.set(panel, { width: cap(29.1005, 440) });
        gsap.set(eyebrow, { autoAlpha: 1, y: 0 });
        gsap.set([title, body], { autoAlpha: 0 });
        gsap.set(titleWords, { yPercent: 120 });
        gsap.set(bodyWords, { yPercent: 120 });
        // Badge: scale up to the compact size (114.44 / 58) and drop to the card centre
        // (+114.5px). transformOrigin centre so the scale grows around its own middle.
        gsap.set(badge, {
          scale: 114.44 / 58,
          y: cap(7.5728, 114.5),
          transformOrigin: "50% 50%",
        });
        gsap.set(rings, { autoAlpha: 0, scale: 0.7, transformOrigin: "50% 50%" });

        gsap
          .timeline({
            defaults: { ease: "power3.out", force3D: true },
            scrollTrigger: {
              trigger: section,
              start: "center center",
              end: "+=120%",
              scrub: 2.4,
              pin: true,
              pinType: "transform",
              pinSpacing: true,
              anticipatePin: 1,
              invalidateOnRefresh: true,
            },
          })
          .to(panel, { width: "100%", duration: 1.5, ease: "power2.inOut" }, 0)
          .to(badge, { scale: 1, y: 0, duration: 1.5, ease: "power2.inOut" }, 0)
          .to(eyebrow, { autoAlpha: 0, y: "-1.1vw", duration: 0.45 }, 0)
          .to(rings, { autoAlpha: 1, scale: 1, duration: 1.5, ease: "power2.inOut" }, 0)
          .to(title, { autoAlpha: 1, duration: 0.4 }, 0.45)
          .to(titleWords, { yPercent: 0, duration: 0.6, stagger: 0.04 }, 0.5)
          .to(body, { autoAlpha: 1, duration: 0.5 }, 0.85)
          .to(bodyWords, { yPercent: 0, duration: 0.5, stagger: 0.008 }, 0.9)
          .to(panel, { duration: 0.6 });
      });
    },
    { scope },
  );
}
