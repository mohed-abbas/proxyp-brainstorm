import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";
import type { RefObject } from "react";

type Styles = Record<string, string>;

// Services hero intro. Plays on mount — this page has no onboarding curtain (that
// stays landing-only), so the hero is self-contained. It reuses the referrals-hero
// reveal MECHANICS: the headline words rise word-by-word (.r-word__in, yPercent
// 110→0, staggered), then the body + badge fade up. The orbit reveals itself via
// useServicesOrbit (kicked slightly later so the diagram follows the statement).
//
// Flash-free: the headline, body and badge are armed opacity:0 in CSS under html.js,
// so SSR paints hidden and this reveal animates them in. GSAP owns the word transform
// entirely. Reduced motion lands on the settled state with no tween.
export function useServicesHero(scope: RefObject<HTMLElement | null>, s: Styles) {
  useGSAP(
    () => {
      const q = gsap.utils.selector(scope);
      const words = q(".r-word__in");
      const head = q(`.${s.headline}`);
      const reveal = [...q(`.${s.body}`), ...q(`.${s.badge}`)];

      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        gsap.set([...head, ...reveal], { opacity: 1 });
        gsap.set(reveal, { y: 0 });
        gsap.set(words, { yPercent: 0 });
        return;
      }

      // Reveal the headline container (the word mask still hides the glyphs until the
      // tween lifts them) and arm the rest hidden.
      gsap.set(head, { opacity: 1 });
      gsap.set(words, { yPercent: 110 });
      gsap.set(reveal, { opacity: 0, y: 16 });

      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.to(words, { yPercent: 0, duration: 0.8, stagger: 0.06 }, 0);
      tl.to(reveal, { opacity: 1, y: 0, duration: 0.7, stagger: 0.14 }, 0.5);
    },
    { scope },
  );
}
