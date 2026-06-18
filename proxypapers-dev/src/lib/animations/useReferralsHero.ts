import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";
import type { RefObject } from "react";

type Styles = Record<string, string>;

// Referrals hero intro. Plays on mount — this page has no onboarding curtain (that
// stays landing-only), so the hero is self-contained rather than curtain-driven
// like the landing hero. It reuses the landing hero's reveal MECHANICS: headline
// words rise word-by-word (.r-word__in, yPercent 110→0, staggered), body + CTA
// fade up, then the band "opens" from its waist (opacity + scaleY 0.9→1) the same
// way the hero lens does. Order, per request: the text leads, the band follows.
//
// Flash-free: the headline containers, band, body and CTA are armed opacity:0 in
// CSS under html.js, so SSR paints hidden and this reveal animates them in. GSAP
// owns the word transform entirely (the containers, not the words, carry the CSS
// arm — so nothing competes with the inline transform the word tween writes).
// Reduced motion lands on the settled state with no tween (overriding the arm).
export function useReferralsHero(scope: RefObject<HTMLElement | null>, s: Styles) {
  useGSAP(
    () => {
      const q = gsap.utils.selector(scope);
      const words = q(".r-word__in");
      const heads = [...q(`.${s.clients}`), ...q(`.${s.firm}`)];
      const band = q(`.${s.band}`);
      const reveal = [...q(`.${s.body}`), ...q(`.${s.cta}`)];

      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        gsap.set([...heads, ...reveal, ...band], { opacity: 1 });
        gsap.set(reveal, { y: 0 });
        gsap.set(words, { yPercent: 0 });
        return;
      }

      // Reveal the headline containers (the word mask still hides the glyphs, which
      // sit below their clip until the tween lifts them) and arm the rest hidden.
      gsap.set(heads, { opacity: 1 });
      gsap.set(words, { yPercent: 110 });
      gsap.set(reveal, { opacity: 0, y: 16 });
      gsap.set(band, { opacity: 0, scaleY: 0.9, transformOrigin: "50% 50%" });

      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      // 1) Text leads: the two headlines, then the body + CTA.
      tl.to(words, { yPercent: 0, duration: 0.75, stagger: 0.08 }, 0);
      tl.to(reveal, { opacity: 1, y: 0, duration: 0.7, stagger: 0.12 }, 0.45);

      // 2) The band opens from its waist once the text has landed.
      tl.to(
        band,
        { opacity: 1, scaleY: 1, duration: 1.3, ease: "power2.out" },
        0.8,
      );

      // Drop the inline scaleY so the band's rest state is identity (CSS governs).
      tl.set(band, { clearProps: "transform" });
    },
    { scope },
  );
}
