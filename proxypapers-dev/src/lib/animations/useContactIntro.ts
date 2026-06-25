import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { useLenis } from "@/lib/lenis/LenisProvider";
import type { RefObject } from "react";

type Styles = Record<string, string>;

// Contact intro — a leeroy.ca-style "curtain split", plays once on mount in three beats:
//   1. ENTRANCE — the title reveals word-by-word with the site's slide-up primitive
//      (.r-word__in yPercent 110→0, staggered) and the lead fades up under it.
//   2. HOLD — the header rests full-screen so it reads.
//   3. EXIT — the title rises out the top and the lead drops out the bottom (equal
//      speed, opposite directions = a parting curtain), each SCALING UP as it goes so
//      it reads like it's flying toward/past the camera (a 3D "out of the screen"
//      illusion); meanwhile the opaque form card slides up from below into the centre.
//
// Layout: the CSS turns the first screen into a 100vh .stage ONLY under html.js +
// motion-allowed desktop (see Contact.module.css). So the guards here MUST match that
// media query — otherwise we'd hide a card that has no stage to rise into. The title,
// lead and card are armed opacity:0 in CSS to avoid a first-frame flash; this sets the
// real start poses (word masks, lead offset, card below the fold) before paint.
//
// Static fallback (mobile, reduced motion, no-JS): the stage rule never applies, the
// page is the settled flow (header above card above band), and this hook clears any
// inline props and returns — every word of the header stays readable.
export function useContactIntro(scope: RefObject<HTMLElement | null>, s: Styles) {
  const lenisRef = useLenis();

  useGSAP(
    () => {
      const q = gsap.utils.selector(scope);
      const title = q(`.${s.title}`);
      const lead = q(`.${s.lead}`);
      const card = q(`.${s.card}`);
      const words = q(".r-word__in"); // the title's per-word reveal spans
      // The form's content rows, in DOM order, that rise once the card has arrived —
      // eyebrow, title, the four inputs, the source select, the consent and the submit
      // note. The BUTTONS (audience toggle + submit) are deliberately excluded: they
      // ride in with the card rather than sliding up on their own.
      const formItems = q(
        `.${s.eyebrow}, .${s.formTitle}, .${s.field}, .${s.selectRow}, .${s.consent}, .${s.note}`,
      );

      const desktop = window.matchMedia("(min-width: 1024px)").matches;
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      // No stage → no intro. Land on the settled, fully-visible layout.
      if (!desktop || reduced) {
        gsap.set([...title, ...lead, ...card, ...words, ...formItems], { clearProps: "all" });
        return;
      }

      const vh = window.innerHeight;

      // Lock scroll for the duration of the intro so a stray wheel/trackpad gesture
      // can't fight the curtain (which would desync the title/lead/card poses). Unlike
      // the onboarding pages, /contact has no curtain, so LenisProvider leaves scroll
      // RUNNING — we must stop it ourselves and release on completion.
      //
      // Lenis lives in an ancestor (LenisProvider) whose effect runs AFTER this
      // descendant effect (React flushes effects child→parent), so lenisRef.current is
      // still null right now and a plain stop() here would no-op. Poll a few frames
      // until the ref is populated, then stop. `cancelled` lets unlock abort a pending
      // lock (fast unmount) and guarantees release.
      let cancelled = false;
      const tryLock = (frame = 0) => {
        if (cancelled) return;
        const lenis = lenisRef?.current;
        if (lenis) {
          lenis.stop();
        } else if (frame < 120) {
          requestAnimationFrame(() => tryLock(frame + 1));
        }
      };
      const unlock = () => {
        cancelled = true;
        lenisRef?.current?.start();
        ScrollTrigger.refresh();
      };
      tryLock();

      // Arm: title container visible but its words masked below; lead offset + hidden;
      // card waiting below the fold (clipped by the stage's overflow) at FULL opacity —
      // it slides up as an opaque surface so it cleanly wipes over the descending lead
      // instead of letting the dark ground + lead ghost through a fading card.
      gsap.set(title, { opacity: 1 });
      gsap.set(words, { yPercent: 110 });
      gsap.set(lead, { opacity: 0, y: 24 });
      gsap.set(card, { yPercent: 110, opacity: 1 });
      // Form rows wait hidden + nudged down inside the (opaque) card, ready to slide up
      // once the card lands. Buttons are left untouched, so they show with the card.
      gsap.set(formItems, { opacity: 0, y: 20 });

      const tl = gsap.timeline({ delay: 0.2, onComplete: unlock });

      // 1. ENTRANCE — site reveal: words rise into their masks, lead fades up under.
      tl.to(
        words,
        { yPercent: 0, duration: 0.8, ease: "power3.out", stagger: 0.06 },
        0,
      );
      tl.to(lead, { opacity: 1, y: 0, duration: 0.7, ease: "power3.out" }, 0.35);

      // 2. HOLD, then 3. EXIT — slower than the entrance, accelerating out (power2.in)
      // with a scale-up so the halves read as flying toward the camera.
      const exitAt = 1.6;
      const exitDur = 1.15;
      tl.to(
        title,
        { y: -vh * 0.62, scale: 1.5, opacity: 0, duration: exitDur, ease: "power2.in" },
        exitAt,
      );
      tl.to(
        lead,
        { y: vh * 0.62, scale: 1.5, opacity: 0, duration: exitDur, ease: "power2.in" },
        exitAt,
      );
      // Card holds back until the header is ~90% gone, then glides up SLOWLY and
      // decelerates into place (power2.out) — its own beat, not an overlap. The tail of
      // the header's fade (last ~10%) bridges the handoff so the stage never reads empty.
      // clearProps:transform on finish drops the identity transform (avoids the
      // inline-transform-vs-breakpoint resize gotcha).
      const cardStart = exitAt + exitDur * 0.9;
      const cardDur = 1.3;
      tl.to(
        card,
        { yPercent: 0, duration: cardDur, ease: "power2.out", clearProps: "transform" },
        cardStart,
      );

      // 4. FORM FILL — the moment the card STARTS entering, its content rows rise with
      // the site's slide-up reveal (y + fade, staggered top→bottom), so the form fills
      // in as the card glides up (they finish about when it lands). Excludes the buttons,
      // so the toggle + submit ride in with the card while the rows fill around them.
      // clearProps:transform leaves the resting opacity inline (the rows stay visible)
      // while dropping the identity transform.
      tl.to(
        formItems,
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: "power3.out",
          stagger: 0.08,
          clearProps: "transform",
        },
        cardStart,
      );

      // Safety net: if the page unmounts mid-intro (client nav away), onComplete never
      // fires — restore scroll on cleanup so we never strand Lenis stopped.
      return unlock;
    },
    { scope },
  );
}
