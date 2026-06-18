import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";
import type { RefObject } from "react";

type Styles = Record<string, string>;

// Sliders — the pinned benefit slider (Figma 141:480, iventions motion).
//
// Desktop (≥1024, ≥2 slides): the section PINS, then a SCRUBBED master timeline rolls the
// benefits continuously with scroll (tied 1:1, reversible). The title and body are vertical
// rollers — each is offset from the frame centre by (index − pos) row-heights, so they roll
// as whole rows; their layers are gradient-masked so the centre is solid and neighbours
// ghost above/below. The photo cross-fades by proximity. An eased step + a pos-holding dwell
// per benefit give iventions' "rest then roll". The tilted frame tilts subtly with the mouse
// (base 3D pose + gentle pointer ±°, eased back); --pp-rx/--pp-ry are inherited from the
// section so every overlapped card tilts identically.
//
// Mobile (<1024): no pin / no scrub / no tilt; every slide is a gallery card (title on it)
// above its body, word-rising on enter. Reduced motion: settled, static.
//
// `dwell` switches the roll feel: false (default) = one continuous, never-stopping roll
// (smooth); true = ease into each benefit and REST before rolling on (stops at each slide).
export function useSliders(scope: RefObject<HTMLElement | null>, s: Styles, dwell: boolean) {
  useGSAP(
    () => {
      const section = scope.current;
      if (!section) return;

      // Reduced motion → leave everything at rest (CSS already shows the gallery).
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      const q = gsap.utils.selector(scope);
      const labelWords = q(`.${s.label} .r-word__in`);
      const slides = Array.from(section.querySelectorAll<HTMLElement>(`.${s.slide}`));
      const ch = slides.map((sl) => ({
        title: sl.querySelector<HTMLElement>(`.${s.cardTitle}`),
        titleWords: Array.from(sl.querySelectorAll<HTMLElement>(`.${s.cardTitle} .r-word__in`)),
        img: sl.querySelector<HTMLElement>(`.${s.cardImg}`),
        overlay: sl.querySelector<HTMLElement>(`.${s.cardOverlay}`),
        bodyEl: sl.querySelector<HTMLElement>(`.${s.body}`),
        bodyWords: Array.from(sl.querySelectorAll<HTMLElement>(`.${s.body} .r-word__in`)),
      }));

      // Subtle mouse-driven 3D tilt on the card frame (prototype 05 pattern). The base
      // pose gives the "impression of 3D"; the pointer nudges it ±AMP°, eased back on
      // leave. Vars live on the section and are inherited by every .card3d.
      const enableTilt = () => {
        const BASE_RX = 4;
        const BASE_RY = -9;
        const AMP = 4;
        gsap.set(section, { "--pp-rx": BASE_RX, "--pp-ry": BASE_RY });
        const setRX = gsap.quickTo(section, "--pp-rx", { duration: 0.5, ease: "power2.out" });
        const setRY = gsap.quickTo(section, "--pp-ry", { duration: 0.5, ease: "power2.out" });
        const onMove = (e: PointerEvent) => {
          const nx = (e.clientX / window.innerWidth - 0.5) * 2; // -1..1
          const ny = (e.clientY / window.innerHeight - 0.5) * 2; // -1..1
          setRX(BASE_RX - ny * AMP);
          setRY(BASE_RY + nx * AMP);
        };
        const onLeave = () => {
          setRX(BASE_RX);
          setRY(BASE_RY);
        };
        window.addEventListener("pointermove", onMove);
        window.addEventListener("blur", onLeave);
        return () => {
          window.removeEventListener("pointermove", onMove);
          window.removeEventListener("blur", onLeave);
        };
      };

      const mm = gsap.matchMedia();

      // ── Desktop ───────────────────────────────────────────────────────────────
      mm.add("(min-width: 1024px)", () => {
        const tiltCleanup = enableTilt();

        // Single card: nothing to slide — just a simple enter reveal.
        if (slides.length < 2) {
          gsap.set(labelWords, { yPercent: 120 });
          gsap.set(ch[0].titleWords, { yPercent: 120 });
          gsap.set(ch[0].bodyWords, { yPercent: 120 });
          gsap
            .timeline({
              defaults: { ease: "power3.out", force3D: true },
              scrollTrigger: { trigger: section, start: "top 80%", once: true },
            })
            .to(labelWords, { yPercent: 0, duration: 0.7, stagger: 0.05 }, 0)
            .to(ch[0].titleWords, { yPercent: 0, duration: 0.7, stagger: 0.04 }, 0.25)
            .to(ch[0].bodyWords, { yPercent: 0, duration: 0.7, stagger: 0.02 }, 0.4);
          return tiltCleanup;
        }

        section.dataset.mode = "slider";

        const n = slides.length;

        // Roller pitches (px), measured from the laid-out frame + bodies so they track the
        // responsive --pp-scale. rowH = how far the title stack steps per benefit (neighbours
        // land just off the card); bodyRowH = the body slot (tallest body + a gap) so a body
        // never overlaps its neighbour mid-roll. Re-measured on every ScrollTrigger refresh.
        let rowH = 0;
        let bodyRowH = 0;
        const measure = () => {
          const cardEl = slides[0].querySelector<HTMLElement>(`.${s.card}`);
          rowH = (cardEl ? cardEl.offsetHeight : 296) * 0.66;
          const bodyH = ch.map((c) => (c.bodyEl ? c.bodyEl.offsetHeight : 0));
          bodyRowH = Math.max(80, ...bodyH) + rowH * 0.18;
        };
        measure();

        // Apply the continuous roll for a position (0..n−1): every title/body is offset from
        // centre by (its index − pos) row-heights, so `pos` is the benefit at the frame
        // centre; the photo cross-fades by proximity (full at its integer pos, gone a row
        // away). Driven each frame by the scrubbed proxy below — absolute, no relative tweens,
        // so it stays correct through refreshes/resizes.
        const roll = { pos: 0 };
        const applyRoll = () => {
          ch.forEach((c, j) => {
            const off = j - roll.pos;
            gsap.set(c.title, { y: off * rowH });
            gsap.set(c.bodyEl, { y: off * bodyRowH });
            gsap.set([c.img, c.overlay], { autoAlpha: Math.max(0, 1 - Math.abs(off)) });
          });
        };

        // Block rollers now — titles/bodies move as whole rows at opacity 1 (the gradient
        // mask does the edge-fade), so park their words at rest (no per-word rise here).
        ch.forEach((c) => {
          gsap.set(c.titleWords, { yPercent: 0 });
          gsap.set(c.bodyWords, { yPercent: 0 });
        });
        gsap.set(labelWords, { yPercent: 120 });
        applyRoll();

        // Enter: fade the deck up + rise the label as the section arrives (before the pin).
        const deck = slides[0].parentElement;
        const enterTl = gsap.timeline({
          defaults: { ease: "power3.out" },
          scrollTrigger: { trigger: section, start: "top 80%", once: true },
        });
        if (deck) enterTl.from(deck, { autoAlpha: 0, duration: 0.7 }, 0);
        enterTl.to(labelWords, { yPercent: 0, duration: 0.7, stagger: 0.05 }, 0.1);

        // Pinned, SCRUBBED master timeline (iventions): the benefits roll through the frame
        // centre — title, body and photo in lockstep, tied 1:1 to scroll and reversible.
        // Length = n viewport-heights (the equal-band pacing kept).
        const SLIDE_VH = 1;
        const ROLL = 1;
        const DWELL = 0.6;
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: "+=" + Math.round(n * SLIDE_VH * 100) + "%",
            pin: true,
            pinType: "transform",
            anticipatePin: 1,
            scrub: 1.2,
            invalidateOnRefresh: true,
            onRefresh: () => {
              measure();
              applyRoll();
            },
          },
          onUpdate: applyRoll,
        });
        if (dwell) {
          // Dwell mode: ease into each benefit, then HOLD pos (the rest-on-stat) before
          // rolling on — the "stops at each slide" feel.
          for (let i = 1; i < n; i++) {
            tl.to(roll, { pos: i, ease: "power2.inOut", duration: ROLL }).to(roll, {
              pos: i,
              duration: DWELL,
            });
          }
        } else {
          // Smooth mode (default): one continuous linear roll across every benefit — never
          // stops; the content glides steadily with the scroll.
          tl.to(roll, { pos: n - 1, ease: "none", duration: n - 1 });
        }

        return () => {
          tiltCleanup();
          delete section.dataset.mode;
        };
      });

      // ── Tablet + mobile: vertical gallery, each slide reveals on enter ───────────
      mm.add("(max-width: 1023px)", () => {
        gsap.set(labelWords, { yPercent: 120 });
        gsap
          .timeline({ scrollTrigger: { trigger: section, start: "top 85%", once: true } })
          .to(labelWords, { yPercent: 0, duration: 0.7, stagger: 0.05, ease: "power3.out" });

        slides.forEach((sl, i) => {
          gsap.set(ch[i].titleWords, { yPercent: 120 });
          gsap.set(ch[i].bodyWords, { yPercent: 120 });
          gsap
            .timeline({ scrollTrigger: { trigger: sl, start: "top 85%", once: true } })
            .to(ch[i].titleWords, { yPercent: 0, duration: 0.7, stagger: 0.04, ease: "power3.out" }, 0)
            .to(ch[i].bodyWords, { yPercent: 0, duration: 0.7, stagger: 0.02, ease: "power3.out" }, 0.15);
        });
      });
    },
    { scope, dependencies: [dwell], revertOnUpdate: true },
  );
}
