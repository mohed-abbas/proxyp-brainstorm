import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";
import type { RefObject } from "react";

type Styles = Record<string, string>;

// Hero intro — ported from buildHeroIntro() in design-final/scripts/hero.js.
// The section renders settled by default (SSR / reduced motion), so this hook
// arms the hidden state and plays the reveal on mount.
//
// In the source the timeline is paused and the onboarding curtain plays it (and
// reveals the brand card as the mark settles into it). Until the onboarding is
// ported, the hero plays on mount and reveals the card itself; that trigger
// moves to the curtain handoff in the onboarding step.
export function useHeroIntro(scope: RefObject<HTMLElement | null>, s: Styles) {
  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      const q = gsap.utils.selector(scope);
      const words = q(".r-word__in");

      gsap.set(q(`.${s.lens}`), {
        opacity: 0,
        scaleY: 0.9,
        transformOrigin: "50% 50%",
      });
      gsap.set([q(`.${s.conveyor}`), q(`.${s.axis}`), q(`.${s.axisCard}`)], {
        opacity: 0,
      });
      gsap.set([q(`.${s.leadBody}`), q(`.${s.leadCta}`)], { opacity: 0, y: 16 });
      gsap.set(q(`.${s.statement}`), { opacity: 0, y: 16 });
      gsap.set(words, { yPercent: 110 });
      gsap.set(q(`.${s.axisLine}`), { scaleY: 0, transformOrigin: "50% 50%" });

      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.to(
        q(`.${s.lens}`),
        { opacity: 1, scaleY: 1, duration: 1.3, ease: "power2.out" },
        0,
      );
      tl.to(words, { yPercent: 0, duration: 0.75, stagger: 0.08 }, 0.25);
      tl.to(
        [q(`.${s.leadBody}`), q(`.${s.leadCta}`)],
        { opacity: 1, y: 0, duration: 0.7, stagger: 0.1 },
        0.6,
      );
      tl.to(
        q(`.${s.axisLine}`),
        { scaleY: 1, duration: 0.9, ease: "power2.inOut" },
        0.7,
      )
        .set(q(`.${s.axis}`), { opacity: 1 }, 0.7)
        .to(q(`.${s.conveyor}`), { opacity: 1, duration: 0.9 }, 0.9);
      tl.to(
        q(`.${s.axisCard}`),
        { opacity: 1, duration: 0.4, ease: "power1.out" },
        0.95,
      );
      tl.to(q(`.${s.statement}`), { opacity: 1, y: 0, duration: 0.8 }, 1.2);

      const tracks = q(`.${s.track}`);
      tl.eventCallback("onComplete", () => {
        gsap.fromTo(
          tracks,
          { xPercent: -50 },
          { xPercent: 0, duration: 64, ease: "none", repeat: -1 },
        );
      });

      gsap.to(q(`.${s.cloudLeft}`), {
        xPercent: 3,
        duration: 18,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
      });
      gsap.to(q(`.${s.cloudRight}`), {
        xPercent: -3,
        duration: 20,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
      });
    },
    { scope },
  );
}
