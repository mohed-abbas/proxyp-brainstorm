import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import type { RefObject } from "react";

type Styles = Record<string, string>;

// Service profiles deck (Figma 160:411 / 160:605 / 160:675).
//
// Desktop (≥1024, motion allowed): the section PINS when framed, then a scrubbed timeline
// stacks the cards — each card after the first slides up from one frame below to cover the
// previous, while the card beneath recedes (scale-down) for depth. The cards overlay
// (absolute, full-frame) only in this branch; the CSS arms the incoming cards one frame
// down (html.js) so SSR paints them parked, flash-free.
//
// Tablet/mobile (<1024): no pin — the cards rest in a readable vertical flow (CSS base)
// and get a light per-card rise-in.
//
// Reduced motion → early return; the CSS settled state (vertical flow) carries it.
export function useServiceCards(scope: RefObject<HTMLElement | null>, s: Styles) {
  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      const section = scope.current;
      if (!section) return;

      const slots = gsap.utils.toArray<HTMLElement>(`.${s.slot}`, section);
      if (!slots.length) return;

      const mm = gsap.matchMedia();

      // Desktop ≥1024: pinned stacked-scroll.
      mm.add("(min-width: 1024px)", () => {
        // A single card has nothing to stack onto — a gentle enter reveal instead.
        if (slots.length < 2) {
          gsap.from(slots[0], {
            autoAlpha: 0,
            y: 48,
            duration: 0.9,
            ease: "power3.out",
            scrollTrigger: { trigger: section, start: "top 75%", once: true },
          });
          ScrollTrigger.refresh();
          return;
        }

        // Incoming cards rest one frame below (matches the html.js arming in CSS).
        const incoming = slots.slice(1);
        gsap.set(incoming, { yPercent: 100 });

        // Each card settles a touch LOWER than the one before, so the previous cards'
        // top edges peek above it (a stacked-deck look). PEEK is authored in design px and
        // tracks the live card scale. Cards keep full size — no recede — so the deck stays
        // full-bleed; the front card's shadow separates it from the peeking stack.
        const PEEK = 36;
        const scaleNow = () => Math.min(window.innerWidth / 1512, 1);

        const tl = gsap.timeline({
          // duration 1 per step so each transition fills exactly one viewport of scroll
          // (positioned at integer idx below → contiguous, no dead zones).
          defaults: { ease: "none", duration: 1 },
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: () => `+=${(slots.length - 1) * 100}%`,
            pin: true,
            pinType: "transform",
            anticipatePin: 1,
            scrub: 1,
            invalidateOnRefresh: true,
          },
        });
        incoming.forEach((slot, idx) => {
          const depth = idx + 1; // 1st incoming peeks 1×, 2nd 2×, …
          tl.to(slot, { yPercent: 0, y: () => depth * PEEK * scaleNow() }, idx);
        });

        ScrollTrigger.refresh();
      });

      // Tablet + mobile <1024: cards rest in flow; a light per-card rise-in.
      mm.add("(max-width: 1023px)", () => {
        gsap.from(slots, {
          autoAlpha: 0,
          y: 28,
          duration: 0.7,
          stagger: 0.12,
          ease: "power3.out",
          scrollTrigger: { trigger: section, start: "top 78%", once: true },
        });
      });
    },
    { scope },
  );
}
