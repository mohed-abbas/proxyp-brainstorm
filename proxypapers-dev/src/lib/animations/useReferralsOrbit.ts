import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";
import type { RefObject } from "react";

type Styles = Record<string, string>;

// Referrals-hero advisor spiral animation. The LAYOUT is Figma's (six concentric
// rings, six avatars on the three solid rings, centre P-node); only the MOTION is
// borrowed from the home Referrers diagram (useReferrers):
//   • Load — a once-on-mount reveal: the rings scale/fade in, the centre mark pops,
//     the avatars stagger in. Delayed slightly so it follows the hero's text+band
//     reveal rather than racing it.
//   • Rotation — onComplete kicks off the perpetual orbit: each solid ring's avatar
//     layer rotates (r1 CW 42s, r2 CCW 52s, r3 CW 68s) with its avatar imgs counter-
//     rotating so faces stay upright, and the dashed rings sweep slowly.
// Reduced motion returns early → the settled diagram renders static.
export function useReferralsOrbit(scope: RefObject<HTMLElement | null>, s: Styles) {
  useGSAP(
    () => {
      const root = scope.current;
      if (!root) return;
      const q = gsap.utils.selector(scope);

      const rings = q(`.${s.rings}`);
      const mark = q(`.${s.mark}`);
      const avatars = q(`.${s.avatar}`);

      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        gsap.set([...rings, mark, ...avatars], { autoAlpha: 1, scale: 1 });
        return;
      }

      gsap.set(rings, { autoAlpha: 0, scale: 0.9, transformOrigin: "50% 50%" });
      gsap.set([mark, ...avatars], {
        autoAlpha: 0,
        scale: 0,
        transformOrigin: "50% 50%",
      });

      const spin = { ease: "none", repeat: -1 } as const;

      const startOrbit = () => {
        const ring = (id: string) => root.querySelector(`[data-ring="${id}"]`);
        const dashed = root.querySelectorAll(`.${s.ringDash}`);
        const orbits: [string, number, number][] = [
          ["r1", 360, 42],
          ["r2", -360, 52],
          ["r3", 360, 68],
        ];
        for (const [id, dir, duration] of orbits) {
          const layer = ring(id);
          if (!layer) continue;
          gsap.to(layer, { rotation: dir, duration, transformOrigin: "50% 50%", ...spin });
          gsap.to(layer.querySelectorAll("img"), {
            rotation: -dir,
            duration,
            transformOrigin: "50% 50%",
            ...spin,
          });
        }
        // Dashed rings sweep together around the field centre (440.5, 440.5).
        gsap.to(dashed, { rotation: 360, duration: 90, svgOrigin: "440.5 440.5", ...spin });
      };

      gsap
        .timeline({
          defaults: { ease: "power3.out" },
          delay: 0.7,
          onComplete: startOrbit,
        })
        .to(rings, { autoAlpha: 1, scale: 1, duration: 0.9, ease: "power2.out" }, 0)
        .to(mark, { autoAlpha: 1, scale: 1, duration: 0.6, ease: "back.out(1.6)" }, 0.15)
        .to(
          avatars,
          { autoAlpha: 1, scale: 1, duration: 0.55, ease: "back.out(1.7)", stagger: 0.09 },
          0.25,
        );
    },
    { scope },
  );
}
