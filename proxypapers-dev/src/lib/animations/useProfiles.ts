import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import type { RefObject } from "react";

type Styles = Record<string, string>;

// Native .card width (325px → 21.4947vw of the 1512 frame). Used to keep the
// fanned-entry offsets in proportion when the deck scales down on short viewports.
const NATIVE_CARD_VW = 21.4947;

// Profiles — ported from setupProfiles() in design-final/scripts/hero.js. Two
// independent triggers:
//   A) header (title + body) rises word-by-word, once, on enter.
//   B) deck + CTA: the section PINS when framed, then a scrubbed timeline winds
//      each card out of the fanned FRONT stack (un-tilt, spread, flip to BACK),
//      centre-first; the CTA fades up and the deck HOLDS for a reading dwell.
// CSS base is the resolved flat back-spread, so no-JS / reduced motion lands
// there; reduced motion returns early.
export function useProfiles(scope: RefObject<HTMLElement | null>, s: Styles) {
  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      const q = gsap.utils.selector(scope);
      const section = scope.current;
      if (!section) return;

      const titleWords = q(`.${s.title} .r-word__in`);
      const bodyWords = q(`.${s.body} .r-word__in`);
      const allWords = [...titleWords, ...bodyWords];

      // Centre-first order (02 leads), matching the deck's read.
      const cards = ["02", "01", "03"]
        .map((id) => section.querySelector<HTMLElement>(`[data-profile="${id}"]`))
        .filter((c): c is HTMLElement => !!c);
      const pos = cards.map((c) => c.querySelector(`.${s.cardPos}`));
      const flips = cards.map((c) => c.querySelector(`.${s.cardFlip}`));
      const cta = q(`.${s.cta}`);

      // GSAP 3 doesn't resolve vw on x/y, so convert the authored vw offsets to px
      // against the live viewport, scaled by the deck's live shrink factor.
      const vwToPx = (v: string) => {
        v = (v || "").trim();
        if (v.endsWith("vw")) return (parseFloat(v) * window.innerWidth) / 100;
        return parseFloat(v) || 0;
      };
      const fan = cards.map((c) => {
        const cs = getComputedStyle(c);
        const nativeW = (NATIVE_CARD_VW * window.innerWidth) / 100;
        const deckScale = (parseFloat(cs.width) || nativeW) / nativeW;
        return {
          dx: vwToPx(cs.getPropertyValue("--dx")) * deckScale,
          dy: vwToPx(cs.getPropertyValue("--dy")) * deckScale,
          rot: parseFloat(cs.getPropertyValue("--rot")) || 0,
        };
      });

      // ── A. Header once-reveal ──────────────────────────────────────────────
      gsap.set(allWords, { yPercent: 120 });
      gsap
        .timeline({
          defaults: { ease: "power3.out", force3D: true },
          scrollTrigger: { trigger: section, start: "top 72%", once: true },
        })
        .to(titleWords, { yPercent: 0, duration: 0.7, stagger: 0.06 }, 0.0)
        .to(bodyWords, { yPercent: 0, duration: 0.7, stagger: 0.018 }, 0.35);

      // ── B. Deck + CTA — pinned, scrubbed flip with a reading dwell ─────────
      // Park at the fanned FRONT: wind back from the CSS base (flat back-spread).
      pos.forEach((p, i) =>
        gsap.set(p, { x: fan[i].dx, y: fan[i].dy, rotation: fan[i].rot, force3D: true }),
      );
      gsap.set(flips, { rotationY: 0, force3D: true });
      gsap.set(cta, { autoAlpha: 0, y: 16 });

      gsap
        .timeline({
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: "+=160%",
            pin: true,
            pinType: "transform",
            anticipatePin: 1,
            scrub: 2.4,
          },
        })
        .to(
          pos,
          { x: 0, y: 0, rotation: 0, duration: 1.2, stagger: 0.15, ease: "power1.inOut", force3D: true },
          0,
        )
        .to(
          flips,
          { rotationY: 180, duration: 1.4, stagger: 0.15, ease: "power1.inOut", force3D: true },
          0.3,
        )
        .to(cta, { autoAlpha: 1, y: 0, duration: 0.5, ease: "power2.out" }, 1.6)
        .to({}, { duration: 0.9 });

      ScrollTrigger.refresh();
    },
    { scope },
  );
}
