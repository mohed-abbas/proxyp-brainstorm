import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import type { RefObject } from "react";

type Styles = Record<string, string>;

// Per-card deal-out, in deck order (back of the stack deals first → front last):
//   dx/dy  — the card's offset in the centre cluster from its resting corner, in
//            expanded-artboard px (the Figma "Contracted Version", node 142:519),
//            scaled by --pp-scale at runtime.
//   r0     — the contracted (clustered) rotation; r1 — the resting corner rotation
//            (matches the rotate() on each .card in CSS).
const CARDS = [
  { key: "realEstate", dx: -454.44, dy: 152.19, r0: 11.53, r1: 14.32 },
  { key: "succession", dx: 360.04, dy: -286.39, r0: -10.64, r1: 30 },
  { key: "insurance", dx: -357.05, dy: -192.39, r0: 12.23, r1: -30 },
  { key: "tax", dx: 366.25, dy: 252.19, r0: -14.43, r1: -13.74 },
] as const;

// Reference artboard width the dx/dy are measured against (the expanded frame).
const ARTBOARD_W = 1150.53;

// LocalisationSection deal-out (Figma: contracted 142:519 → expanded 142:574). The four
// file cards sit stacked over the centre — the contracted composition, frosting the text
// — and STAY there, visible, as the section scrolls in. Only once 70% of the section has
// scrolled into view (start "70% bottom") do they fan out to the four corners, settling to
// their resting rotation and sharpening the text as they clear it. Cards deal back-of-deck
// first so the stack reads as opening up.
//
// Flash-free: the cards are armed opacity:0 in CSS under html.js so SSR doesn't flash them
// at the corners; this hook immediately places them in the visible cluster, then the deal-
// out waits on the trigger. The text is not armed — it paints at its resting position from
// SSR (it never moves) and is simply un-frosted as the cards leave. Reduced motion → early
// return; the CSS reduced-motion rule shows the settled corner layout with no tween.
//
// Desktop only (≥1024): below that the cards are display:none and the column is a fluid
// static stack, so there is nothing to deal — matchMedia scopes the rig to ≥1024.
export function useLocalisation(scope: RefObject<HTMLElement | null>, s: Styles) {
  useGSAP(
    () => {
      const section = scope.current;
      if (!section) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      const mm = gsap.matchMedia();

      mm.add("(min-width: 1024px)", () => {
        const q = gsap.utils.selector(scope);
        const frame = q(`.${s.frame}`)[0] as HTMLElement | undefined;
        if (!frame) return;

        // design-px → rendered-px: --pp-scale doesn't resolve via getComputedStyle, so
        // measure it off the frame (its width is exactly ARTBOARD_W design-px).
        const scale = frame.getBoundingClientRect().width / ARTBOARD_W;

        // Resolve each card's wrapper + glass surface and its clustered from-offset.
        const items = CARDS.map((c) => {
          const wrap = q(`.${s[`card_${c.key}`]}`)[0] as HTMLElement | undefined;
          const card = wrap?.querySelector(`.${s.card}`) as HTMLElement | null;
          return wrap && card ? { ...c, wrap, card } : null;
        }).filter(Boolean) as Array<
          (typeof CARDS)[number] & { wrap: HTMLElement; card: HTMLElement }
        >;

        // Show the clustered start immediately + VISIBLE: wrappers translated to the centre
        // cluster, glass rotated to the contracted angle. This contracted composition stays
        // on screen as the section scrolls in (CSS armed the wrappers opacity:0 only to
        // avoid an SSR flash at the corners — this makes them visible in the cluster).
        items.forEach(({ wrap, card, dx, dy, r0 }) => {
          gsap.set(wrap, { opacity: 1, x: dx * scale, y: dy * scale });
          gsap.set(card, { rotation: r0 });
        });

        const tl = gsap.timeline({
          defaults: { ease: "power3.out" },
          // Fire once 70% of the section has scrolled into view (the point 70% down the
          // section reaches the viewport bottom).
          scrollTrigger: { trigger: section, start: "70% bottom", once: true },
        });

        // Once the whole section is in view, cards fan out from the cluster to their corners
        // + settle to the resting rotation, staggered back-of-deck → front. The frosted text
        // beneath sharpens as the stack clears it.
        items.forEach(({ wrap, card, r1 }, i) => {
          const at = i * 0.08;
          tl.to(wrap, { x: 0, y: 0, duration: 0.9 }, at);
          tl.to(card, { rotation: r1, duration: 0.9 }, at);
        });

        return () => {
          tl.scrollTrigger?.kill();
          tl.kill();
          // matchMedia reverts the inline transforms/opacity GSAP set; nothing else to
          // restore (no classList state here).
        };
      });

      // Belt-and-braces for late layout (fonts/images shifting the trigger point).
      ScrollTrigger.refresh();
    },
    { scope, revertOnUpdate: true },
  );
}
