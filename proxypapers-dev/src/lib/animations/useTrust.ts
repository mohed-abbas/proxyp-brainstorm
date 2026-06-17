import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";
import type { RefObject } from "react";

type Styles = Record<string, string>;

// px/s at full size — matches the source's ~40s feel.
const CERTS_SPEED = 52;

// Trust — ported from setupTrust() + setupCertsMarquee() in
// design-final/scripts/hero.js.
//
//  • Marquee: the markup authors ONE cert set; we clone it until the track always
//    overflows the viewport, then loop (CSS keyframes) by exactly one set's width,
//    so the scroll is seamless for any cert count / screen width. font-size is
//    constant; the compact state is a transform scale on the PARENT, never the
//    track, so the loop never re-measures mid-open.
//  • Expand: the band PINS centred, then a heavy-scrubbed timeline opens the panel
//    width, fades in the frame, lifts the eyebrow away, rises + brightens the
//    title, scales the marquee up into place, and settles the body word-by-word.
//
// Reduced motion returns early → the settled full band renders (static strip).
export function useTrust(scope: RefObject<HTMLElement | null>, s: Styles) {
  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      const section = scope.current;
      if (!section) return;
      const q = (sel: string) => section.querySelector<HTMLElement>(sel);

      // ── Certifications marquee (clone-to-fill + seamless one-set loop) ──────
      const track = q(`.${s.certsTrack}`);
      let onResize: (() => void) | null = null;
      if (track) {
        const unit = Array.from(track.children);
        if (unit.length) {
          const build = () => {
            track.replaceChildren(...unit.map((el) => el.cloneNode(true)));
            const approx = Array.from(track.children).reduce(
              (w, el) =>
                w +
                (el as HTMLElement).offsetWidth +
                parseFloat(getComputedStyle(el as HTMLElement).marginRight),
              0,
            );
            if (!approx) return;
            const copies = Math.max(
              2,
              Math.ceil(window.innerWidth / approx) + 1,
            );
            for (let i = 1; i < copies; i++) {
              unit.forEach((el) => track.appendChild(el.cloneNode(true)));
            }
            const kids = Array.from(track.children) as HTMLElement[];
            const period = kids[unit.length].offsetLeft - kids[0].offsetLeft;
            track.style.setProperty("--marquee-shift", period + "px");
            track.style.setProperty(
              "--marquee-duration",
              period / CERTS_SPEED + "s",
            );
          };

          if (document.fonts && document.fonts.ready)
            document.fonts.ready.then(build);
          else build();

          let raf = 0;
          onResize = () => {
            cancelAnimationFrame(raf);
            raf = requestAnimationFrame(build);
          };
          window.addEventListener("resize", onResize);
        }
      }

      // ── Expand timeline — desktop only ──────────────────────────────────────
      // The collapsed "from" card + pinned scrub assume the desktop panel. Below
      // 1024 the panel is reflowed full-width, so the compact card would clip the
      // larger title; gate the expand to desktop and let mobile render the settled
      // band (CSS base) with the marquee still scrolling.
      const mm = gsap.matchMedia();
      mm.add("(min-width: 1024px)", () => {
        const panel = q(`.${s.panel}`);
        const frame = q(`.${s.frame}`);
        const eyebrow = q(`.${s.eyebrow}`);
        const certs = q(`.${s.certs}`);
        const content = q(`.${s.content}`);
        const title = q(`.${s.title}`);
        const titleLines = section.querySelectorAll<HTMLElement>(`.${s.titleLine}`);
        const line2 = titleLines[1];
        const bodyWords = gsap.utils.selector(scope)(`.${s.body} .r-word__in`);

        const vwToPx = (vw: number) => (vw / 100) * window.innerWidth;
        const cap = (vw: number, px: number) => Math.min(vwToPx(vw), px);

        // Collapsed initial state — the Figma "from" card.
        gsap.set(panel, { width: cap(29.1005, 440) });
        gsap.set(frame, { autoAlpha: 0 });
        gsap.set(eyebrow, { autoAlpha: 1, y: 0 });
        gsap.set(certs, {
          autoAlpha: 1,
          yPercent: -50,
          y: cap(6.1508, 93),
          scale: 18.2 / 49,
          // Left x-origin keeps the first cert flush with the panel's left edge
          // while the compact scale runs, so the marquee never flashes a bone gap
          // on the left at a loop wrap. At scale 1 the origin is irrelevant, so the
          // expanded end-state is unchanged.
          transformOrigin: "0% 50%",
        });
        gsap.set(content, { y: cap(28.5714, 432) });
        gsap.set(title, { color: "rgba(22, 23, 24, 0.6)" });
        gsap.set(line2, { autoAlpha: 0, yPercent: 40 });
        gsap.set(bodyWords, { yPercent: 120 });
        gsap.set(q(`.${s.body}`), { autoAlpha: 0 });

        gsap
          .timeline({
            defaults: { ease: "power3.out", force3D: true },
            scrollTrigger: {
              trigger: section,
              start: "center center",
              end: "+=120%",
              scrub: 2.4,
              pin: true,
              pinType: "transform",
              pinSpacing: true,
              anticipatePin: 1,
              invalidateOnRefresh: true,
            },
          })
          .to(panel, { width: "100%", duration: 1.5, ease: "power2.inOut" }, 0)
          .to(content, { y: 0, duration: 1.5, ease: "power2.inOut" }, 0)
          .to(eyebrow, { autoAlpha: 0, y: "-1.1vw", duration: 0.45 }, 0)
          .to(certs, { y: 0, scale: 1, duration: 1.5, ease: "power2.inOut" }, 0)
          .to(frame, { autoAlpha: 1, duration: 0.6 }, 0.4)
          .to(line2, { autoAlpha: 1, yPercent: 0, duration: 0.6 }, 0.5)
          .to(title, { color: "rgb(22, 23, 24)", duration: 0.7 }, 0.6)
          .to(q(`.${s.body}`), { autoAlpha: 1, duration: 0.5 }, 0.85)
          .to(bodyWords, { yPercent: 0, duration: 0.5, stagger: 0.008 }, 0.9)
          .to(panel, { duration: 0.6 });
      });

      return () => {
        if (onResize) window.removeEventListener("resize", onResize);
      };
    },
    { scope },
  );
}
