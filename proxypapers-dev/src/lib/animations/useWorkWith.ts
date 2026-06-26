import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import type { RefObject } from "react";

type Styles = Record<string, string>;

// WorkWith — iventions' "worked" mechanic, on NATIVE scroll (no pin, no scrub — it moves
// at the page's own speed).
//
// Desktop (≥1024): the caption is position:sticky on a focus line and the list scrolls
// past it. The profession crossing that line — level with the caption — lights Proxy Blue
// (CSS owns the 0.6s colour ease); the rest hold Bone. The caption word-rises and the list
// fades in as the section arrives.
//
// Mobile (<1024): caption stacks over the list, both word-rise on enter, and the highlight
// tracks whichever profession is nearest the viewport centre.
//
// The highlight is recomputed each scroll frame (ScrollTrigger.onUpdate, driven by Lenis).
// Reduced motion returns early → settled band, the SSR default-active profession stays blue.
export function useWorkWith(scope: RefObject<HTMLElement | null>, s: Styles) {
  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      const section = scope.current;
      if (!section) return;
      const q = gsap.utils.selector(scope);
      const labelEl = section.querySelector<HTMLElement>(`.${s.label}`);
      const labelWords = q(`.${s.label} .r-word__in`);
      const items = Array.from(section.querySelectorAll<HTMLElement>(`.${s.item}`));
      const list = section.querySelector<HTMLElement>(`.${s.list}`);
      const n = items.length;
      if (!labelEl || n === 0) return;

      const setActive = (idx: number) => {
        items.forEach((el, i) => {
          if (i === idx) el.dataset.active = "true";
          else delete el.dataset.active;
        });
      };

      // Flag the profession whose centre is nearest the focus line (a viewport Y).
      // The professions don't move relative to the document (no pin, no transform
      // here), so their centres are measured ONCE (per refresh/resize) as
      // document-relative Ys and cached. Per scroll frame we then only read the
      // scroll offset (one value) and do arithmetic — no per-item layout reads.
      const trackHighlight = (focusY: () => number) => {
        let current = -1;
        let centres: number[] = []; // document-relative centre Y of each item
        const measure = () => {
          const sy = window.scrollY;
          centres = items.map((el) => {
            const r = el.getBoundingClientRect();
            return r.top + sy + r.height / 2;
          });
        };
        const update = () => {
          const f = focusY(); // viewport Y of the focus line
          const sy = window.scrollY;
          let best = 0;
          let bestDist = Infinity;
          for (let i = 0; i < centres.length; i++) {
            const dist = Math.abs(centres[i] - sy - f);
            if (dist < bestDist) {
              bestDist = dist;
              best = i;
            }
          }
          if (best === current) return;
          current = best;
          setActive(best);
        };
        const st = ScrollTrigger.create({
          trigger: section,
          start: "top bottom",
          end: "bottom top",
          onUpdate: update,
          // Re-measure when layout may have changed, then re-evaluate.
          onRefresh: () => {
            measure();
            update();
          },
          onToggle: update,
        });
        measure();
        update();
        return () => st.kill();
      };

      const mm = gsap.matchMedia();

      // ── Desktop: sticky caption, focus line = the caption's centre ──────────────
      mm.add("(min-width: 1024px)", () => {
        gsap.set(labelWords, { yPercent: 120 });
        gsap
          .timeline({
            defaults: { ease: "power3.out" },
            scrollTrigger: { trigger: section, start: "top 80%", once: true },
          })
          .from(list, { autoAlpha: 0, duration: 0.7 }, 0)
          .to(labelWords, { yPercent: 0, duration: 0.7, stagger: 0.06 }, 0.1);

        return trackHighlight(() => {
          const r = labelEl.getBoundingClientRect();
          return r.top + r.height / 2;
        });
      });

      // ── Mobile: stacked, focus line = viewport centre ───────────────────────────
      mm.add("(max-width: 1023px)", () => {
        const itemWords = q(`.${s.item} .r-word__in`);
        gsap.set([labelWords, ...itemWords], { yPercent: 120 });
        gsap
          .timeline({
            defaults: { ease: "power3.out" },
            scrollTrigger: { trigger: section, start: "top 78%", once: true },
          })
          .to(labelWords, { yPercent: 0, duration: 0.7, stagger: 0.06 }, 0)
          .to(itemWords, { yPercent: 0, duration: 0.7, stagger: 0.08 }, 0.25);

        return trackHighlight(() => window.innerHeight / 2);
      });
    },
    { scope, revertOnUpdate: true },
  );
}
