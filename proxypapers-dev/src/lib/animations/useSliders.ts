import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import type { RefObject } from "react";

type Styles = Record<string, string>;

// Sliders — the pinned benefit slider (Figma 141:480, iventions-inspired motion).
//
// Desktop (≥1024, ≥2 slides): the section PINS; scrolling advances one benefit at a
// time. The titles form a VERTICAL ROLLER over the card — the current title sits on the
// frame, the previous ghosts above it and the next ghosts below; each step rolls the
// stack up. Underneath, the photo cross-fades and the body rises word-by-word, while the
// tilted frame stays put and tilts subtly with the mouse (a base 3D pose + a gentle
// pointer ±°, eased back on leave). The frame vars (--pp-rx/--pp-ry) are inherited from
// the section so every overlapped card tilts identically and stays aligned.
//
// Mobile (<1024): no pin / no tilt; every slide is a gallery card (title on it) above
// its body, revealing on enter. Reduced motion: settled, static.
export function useSliders(scope: RefObject<HTMLElement | null>, s: Styles) {
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

        // The roller pitch — neighbours sit just above/below the card.
        const cardEl = slides[0].querySelector<HTMLElement>(`.${s.card}`);
        const rowH = (cardEl ? cardEl.offsetHeight : 296) * 0.66;
        const op = (d: number) => (d === 0 ? 1 : d === 1 ? 0.22 : d === 2 ? 0.1 : 0.05);

        // Place every title relative to the active index: active on the card (y 0, full),
        // others stacked by rowH and faded — the vertical roller.
        const placeTitles = (active: number, animate: boolean) => {
          ch.forEach((c, j) => {
            const target = { y: (j - active) * rowH, autoAlpha: op(Math.abs(j - active)) };
            if (animate) gsap.to(c.title, { ...target, duration: 0.6, ease: "power3.out" });
            else gsap.set(c.title, target);
          });
        };

        // Park channels for slide 0 (photo + body visible; titles staged hidden for enter).
        // Slide 0's title words stage below the mask so they rise in on enter; every other
        // title rests at 0 (it word-rises only when it becomes active, in goTo).
        ch.forEach((c, i) => {
          gsap.set(c.title, { y: (i - 0) * rowH, autoAlpha: 0 });
          gsap.set(c.titleWords, { yPercent: i === 0 ? 120 : 0 });
          gsap.set([c.img, c.overlay], { autoAlpha: i === 0 ? 1 : 0 });
          gsap.set(c.bodyEl, { autoAlpha: i === 0 ? 1 : 0 });
          gsap.set(c.bodyWords, { yPercent: 120 });
        });
        gsap.set(labelWords, { yPercent: 120 });

        // Enter: label rises, the roller fades to its resting opacities, title 0 + body 0 rise.
        const enterTl = gsap.timeline({
          defaults: { ease: "power3.out", force3D: true },
          scrollTrigger: { trigger: section, start: "top 80%", once: true },
        });
        enterTl.to(labelWords, { yPercent: 0, duration: 0.7, stagger: 0.05 }, 0);
        enterTl.add(() => placeTitles(0, true), 0.15);
        enterTl.to(ch[0].titleWords, { yPercent: 0, duration: 0.7, stagger: 0.04 }, 0.3);
        enterTl.to(ch[0].bodyWords, { yPercent: 0, duration: 0.7, stagger: 0.02 }, 0.45);

        let current = 0;
        const last = slides.length - 1;

        const goTo = (i: number) => {
          const prev = current;
          current = i;
          placeTitles(i, true); // roll the whole title stack
          // Title — re-run the house word-rise as the new one lands on the card (the prev
          // title's words rest at 0 while it rolls away to a ghost).
          gsap.set(ch[i].titleWords, { yPercent: 120 });
          gsap.to(ch[i].titleWords, { yPercent: 0, duration: 0.7, ease: "power3.out", stagger: 0.04 });
          // Photo cross-fade.
          gsap.to([ch[prev].img, ch[prev].overlay], { autoAlpha: 0, duration: 0.5, ease: "power2.out" });
          gsap.to([ch[i].img, ch[i].overlay], { autoAlpha: 1, duration: 0.5, ease: "power2.out" });
          // Body — fade prev out, re-run the house word-rise on the new one.
          gsap.to(ch[prev].bodyEl, { autoAlpha: 0, duration: 0.35, ease: "power2.out" });
          gsap.set(ch[i].bodyWords, { yPercent: 120 });
          gsap.set(ch[i].bodyEl, { autoAlpha: 1 });
          gsap.to(ch[i].bodyWords, { yPercent: 0, duration: 0.7, ease: "power3.out", stagger: 0.02 });
        };

        // Pin for (N-1) viewport-heights; swap at each step threshold (no scrub/snap).
        ScrollTrigger.create({
          trigger: section,
          start: "top top",
          end: "+=" + last * 100 + "%",
          pin: true,
          pinType: "transform",
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const i = Math.round(self.progress * last);
            if (i !== current) goTo(i);
          },
        });

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
    { scope },
  );
}
