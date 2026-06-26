import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import type { RefObject } from "react";

type Styles = Record<string, string>;

// Services-hero profiles orbit. The LAYOUT is Figma's (three concentric rings, three
// profile chips on one up-left radial, centre P-disc); the MOTION echoes the referrals
// orbit but stays calmer — the profile names are meaningful labels, so they reveal and
// hold (readable) rather than perpetually spinning:
//   • Load — a once-on-mount reveal: the rings scale/fade in, the centre mark pops,
//     the chips stagger in. Delayed so it follows the hero's statement reveal.
//   • Rotation — onComplete sets only the dashed ring sweeping slowly, for an "alive"
//     feel that never moves the labels (motion as seasoning, per the brand contract).
// The chips animate opacity ONLY (autoAlpha) so their CSS translate+rotate tilt is
// never overwritten. Reduced motion returns early → the settled diagram renders static.
export function useServicesOrbit(scope: RefObject<HTMLElement | null>, s: Styles) {
  useGSAP(
    () => {
      const root = scope.current;
      if (!root) return;
      const q = gsap.utils.selector(scope);

      const rings = q(`.${s.rings}`);
      const dashed = root.querySelectorAll(`.${s.ringDash}`);
      const mark = q(`.${s.mark}`);
      const chips = q(`.${s.chip}`);

      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        gsap.set([...rings, ...mark, ...chips], { autoAlpha: 1 });
        gsap.set([...rings, ...mark], { scale: 1 });
        return;
      }

      gsap.set(rings, { autoAlpha: 0, scale: 0.92, transformOrigin: "50% 50%" });
      gsap.set(mark, { autoAlpha: 0, scale: 0, transformOrigin: "50% 50%" });
      // Chips: opacity only — preserve the CSS translate(-50%,-50%) rotate() tilt.
      gsap.set(chips, { autoAlpha: 0 });

      // Perpetual dashed-ring sweep — created in the reveal's onComplete (after
      // useGSAP's synchronous capture window). Track it to pause off-screen (invisible
      // → no visible change) and kill on cleanup rather than leaving it running.
      const spins: gsap.core.Tween[] = [];
      let visST: ScrollTrigger | undefined;

      const startOrbit = () => {
        // Dashed ring sweeps around the field centre (384, 371); the symmetric solid
        // rings stay put. Slow, so it reads as ambient, not busy.
        spins.push(
          gsap.to(dashed, {
            rotation: 360,
            duration: 120,
            svgOrigin: "384 371",
            ease: "none",
            repeat: -1,
          }),
        );

        visST = ScrollTrigger.create({
          trigger: root,
          start: "top bottom",
          end: "bottom top",
          onToggle: (self) =>
            self.isActive
              ? spins.forEach((t) => t.play())
              : spins.forEach((t) => t.pause()),
        });
      };

      gsap
        .timeline({
          defaults: { ease: "power3.out" },
          delay: 0.6,
          onComplete: startOrbit,
        })
        .to(rings, { autoAlpha: 1, scale: 1, duration: 0.9, ease: "power2.out" }, 0)
        .to(mark, { autoAlpha: 1, scale: 1, duration: 0.6, ease: "back.out(1.6)" }, 0.2)
        .to(chips, { autoAlpha: 1, duration: 0.6, stagger: 0.14 }, 0.35);

      return () => {
        spins.forEach((t) => t.kill());
        visST?.kill();
      };
    },
    { scope },
  );
}
