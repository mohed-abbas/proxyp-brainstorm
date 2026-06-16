import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";
import type { RefObject } from "react";

type Styles = Record<string, string>;

// Referrers — ported from setupReferrers() in design-final/scripts/hero.js.
// A once-on-enter scroll reveal: the title rises word-by-word, the radar rings
// fade/scale in, the centre mark pops, the avatars stagger in, the body settles
// word-by-word and the CTA fades up. onComplete kicks off the perpetual orbit —
// inner ring CW (42s), middle ring CCW (52s), outer dashed ring CW (68s); each
// avatar's img counter-rotates so faces stay upright. Reduced motion returns
// early → the settled diagram renders static.
export function useReferrers(scope: RefObject<HTMLElement | null>, s: Styles) {
  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      const q = gsap.utils.selector(scope);
      const section = scope.current;
      if (!section) return;

      const titleWords = q(`.${s.title} .r-word__in`);
      const bodyWords = q(`.${s.body} .r-word__in`);
      const allWords = [...titleWords, ...bodyWords];
      const rings = q(`.${s.rings}`);
      const mark = q(`.${s.mark}`);
      const avatars = q(`.${s.avatar}`);
      const cta = q(`.${s.cta}`);

      gsap.set(allWords, { yPercent: 120 });
      gsap.set(rings, { autoAlpha: 0, scale: 0.85, transformOrigin: "50% 50%" });
      gsap.set([mark, ...avatars], {
        autoAlpha: 0,
        scale: 0,
        transformOrigin: "50% 50%",
      });
      gsap.set(cta, { autoAlpha: 0, y: 16 });

      const startOrbit = () => {
        const innerLayer = section.querySelector(`[data-ring="inner"]`);
        const middleLayer = section.querySelector(`[data-ring="middle"]`);
        const outerRing = section.querySelector(`.${s.ringOuter}`);
        if (!innerLayer || !middleLayer || !outerRing) return;
        const spin = { ease: "none", repeat: -1 };

        gsap.to(innerLayer, { rotation: 360, duration: 42, transformOrigin: "50% 50%", ...spin });
        gsap.to(innerLayer.querySelectorAll("img"), { rotation: -360, duration: 42, transformOrigin: "50% 50%", ...spin });

        gsap.to(middleLayer, { rotation: -360, duration: 52, transformOrigin: "50% 50%", ...spin });
        gsap.to(middleLayer.querySelectorAll("img"), { rotation: 360, duration: 52, transformOrigin: "50% 50%", ...spin });

        gsap.to(outerRing, { rotation: 360, duration: 68, svgOrigin: "247 247", ...spin });
      };

      gsap
        .timeline({
          defaults: { ease: "power3.out", force3D: true },
          scrollTrigger: { trigger: section, start: "top 70%", once: true },
          onComplete: startOrbit,
        })
        .to(titleWords, { yPercent: 0, duration: 0.7, stagger: 0.05 }, 0.0)
        .to(rings, { autoAlpha: 1, scale: 1, duration: 0.9, ease: "power2.out" }, 0.25)
        .to(mark, { autoAlpha: 1, scale: 1, duration: 0.6, ease: "back.out(1.6)" }, 0.4)
        .to(avatars, { autoAlpha: 1, scale: 1, duration: 0.55, ease: "back.out(1.7)", stagger: 0.09 }, 0.5)
        .to(bodyWords, { yPercent: 0, duration: 0.7, stagger: 0.014 }, 0.7)
        .to(cta, { autoAlpha: 1, y: 0, duration: 0.6 }, 1.0);
    },
    { scope },
  );
}
