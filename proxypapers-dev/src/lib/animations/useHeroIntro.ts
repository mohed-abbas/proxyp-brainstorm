import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";
import { useIntro } from "@/lib/intro/IntroProvider";
import type { RefObject } from "react";

type Styles = Record<string, string>;

// Hero intro — ported from buildHeroIntro() in design-final/scripts/hero.js. The
// section renders settled by default (SSR / reduced motion); this hook arms the
// hidden state and builds the reveal PAUSED. The onboarding curtain plays it (and
// reveals the brand card as the welcome mark settles into it) — so the card is NOT
// touched here; it's armed-hidden in CSS (html.js [data-axis-card]) and revealed
// by the curtain. The timeline + idle starter are shared via the intro store.
export function useHeroIntro(scope: RefObject<HTMLElement | null>, s: Styles) {
  const intro = useIntro();

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
      gsap.set([q(`.${s.conveyor}`), q(`.${s.axis}`)], { opacity: 0 });
      gsap.set([q(`.${s.leadBody}`), q(`.${s.leadCta}`)], { opacity: 0, y: 16 });
      gsap.set(q(`.${s.statement}`), { opacity: 0, y: 16 });
      gsap.set(words, { yPercent: 110 });
      gsap.set(q(`.${s.axisLine}`), { scaleY: 0, transformOrigin: "50% 50%" });

      const tl = gsap.timeline({ defaults: { ease: "power3.out" }, paused: true });

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
      tl.to(q(`.${s.statement}`), { opacity: 1, y: 0, duration: 0.8 }, 1.2);

      // Drop the inline transforms GSAP leaves at rest on the two elements whose
      // CSS transform differs by breakpoint — the lens (reveal scaleY) and the
      // statement (reveal y, which preserves the desktop translateX(-50%)). Once
      // the reveal is done their rest state is identity/centre, so clearing the
      // inline transform is visually seamless but lets the responsive CSS
      // (mobile translate vs desktop) govern. Without this, the stale desktop
      // transform shadows the mobile @media rule on a live resize and the hero
      // only reflows after a refresh.
      tl.set([q(`.${s.lens}`), q(`.${s.statement}`)], { clearProps: "transform" });

      // Endless conveyor drift, started once the intro resolves.
      const tracks = q(`.${s.track}`);
      tl.eventCallback("onComplete", () => {
        gsap.fromTo(
          tracks,
          { xPercent: -50 },
          { xPercent: 0, duration: 64, ease: "none", repeat: -1 },
        );
      });

      // Continuous cloud drift inside the lens — started by the curtain (hero.idle).
      const idle = () => {
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
      };

      intro?.registerHero(tl, idle);
    },
    { scope },
  );
}
