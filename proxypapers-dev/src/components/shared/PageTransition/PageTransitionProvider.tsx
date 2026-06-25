"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { gsap } from "@/lib/gsap";
import { useLenis } from "@/lib/lenis/LenisProvider";
import { FoldMark } from "@/components/shared/FoldMark";
import s from "./PageTransition.module.css";

// Routes the transition does NOT intercept — the home page owns its onboarding
// welcome curtain, so letting "/" navigate normally avoids two curtains fighting.
const SKIP = new Set<string>(["/"]);

// Timing — matched to the onboarding welcome (soft power1.inOut curtain, slow
// deliberate fold). Deliberately heavy: ~3s end-to-end is the welcome's pace.
const T = {
  cover: 1.05, // curtain rises bottom → full
  fold: 0.42, // one panel folds (slow, paper-paced)
  foldStagger: 0.17, // gap between stem → bowl → bar
  reveal: 1.0, // curtain continues up and off the top
  unfold: 0.4, // one panel unfolds back open
  unfoldStagger: 0.15,
};

// The fold stops SHORT of edge-on so the mark never collapses to an invisible
// line — at ~75° each panel is a thin-but-visible sliver, so the folded mark
// stays legible (no lone "seam" line floating on an empty field).
const FOLD_MAX = 75;

const reduced = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Drives the fold page transition. Renders the children plus a fixed Proxy-Blue
// curtain overlay (FoldMark + seam). A capture-phase click interceptor upgrades
// every internal <a href> into an animated client-side navigation: cover + fold
// shut, swap the route under full cover, then unfold + reveal. Back/forward and
// reduced-motion fall through to an instant swap.
export function PageTransitionProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const lenis = useLenis();

  const overlayRef = useRef<HTMLDivElement>(null);
  const animating = useRef(false);
  const pendingReveal = useRef(false);
  const mounted = useRef(false);
  // Set by the mount effect; called by the pathname effect once the route swaps.
  const revealRef = useRef<(onDone: () => void) => void>(() => {});

  // All imperative wiring lives in one mount effect: it closes over the (stable)
  // router + Lenis ref, parks the curtain, binds the click interceptor, and
  // publishes playReveal via revealRef for the pathname effect to fire.
  useEffect(() => {
    const root = overlayRef.current;
    if (!root) return;

    const els = () => ({
      panel: root.querySelector<HTMLElement>(`.${s.panel}`)!,
      mark: root.querySelector<SVGElement>(`.${s.mark}`)!,
      overlay: root,
      folds: Array.from(root.querySelectorAll<SVGPathElement>("[data-fold]")),
      bar: root.querySelector<SVGPathElement>('[data-fold="bar"]')!,
      bowl: root.querySelector<SVGPathElement>('[data-fold="bowl"]')!,
      stem: root.querySelector<SVGPathElement>('[data-fold="stem"]')!,
    });

    // COVER + FOLD: curtain rises, mark fades in open, then stem → bowl → bar fold
    // (to FOLD_MAX, never edge-on). onDone fires under full cover (safe to swap).
    const playCover = (onDone: () => void) => {
      const { overlay, panel, mark, folds, bar, bowl, stem } = els();
      const f0 = T.cover - 0.12;
      gsap
        .timeline({ onComplete: onDone })
        .set(overlay, { pointerEvents: "auto" })
        .set(panel, { y: 0, yPercent: 100 })
        .set(mark, { opacity: 0, yPercent: 0 })
        .set(folds, { "--fold": 0 })
        .to(panel, { yPercent: 0, duration: T.cover, ease: "power1.inOut" }, 0)
        .to(mark, { opacity: 1, duration: 0.45, ease: "power2.out" }, T.cover - 0.55)
        .to(stem, { "--fold": FOLD_MAX, duration: T.fold, ease: "power2.in" }, f0)
        .to(bowl, { "--fold": FOLD_MAX, duration: T.fold, ease: "power2.in" }, f0 + T.foldStagger)
        .to(bar, { "--fold": FOLD_MAX, duration: T.fold, ease: "power2.in" }, f0 + T.foldStagger * 2);
    };

    // UNFOLD + REVEAL: bar → bowl → stem unfold back open, then the curtain
    // continues up and off the top (mark rides and fades).
    const playReveal = (onDone: () => void) => {
      const { overlay, panel, mark, bar, bowl, stem } = els();
      const r0 = T.unfoldStagger * 2 + T.unfold * 0.45;
      gsap
        .timeline({
          onComplete: () => {
            gsap.set(overlay, { pointerEvents: "none" });
            // Re-park the curtain BELOW (its idle state) rather than leaving it
            // pushed up off-screen, where the oversized watermark would bleed a
            // sliver back into the top of the viewport.
            gsap.set(panel, { yPercent: 100 });
            onDone();
          },
        })
        .to(bar, { "--fold": 0, duration: T.unfold, ease: "power3.out" }, 0)
        .to(bowl, { "--fold": 0, duration: T.unfold, ease: "power3.out" }, T.unfoldStagger)
        .to(stem, { "--fold": 0, duration: T.unfold, ease: "power3.out" }, T.unfoldStagger * 2)
        .to(panel, { yPercent: -100, duration: T.reveal, ease: "power1.inOut" }, r0)
        .to(
          mark,
          { yPercent: -42, opacity: 0, duration: T.reveal * 0.7, ease: "power2.in" },
          r0,
        );
    };
    revealRef.current = playReveal;

    const startCover = (to: string) => {
      if (reduced()) {
        router.push(to);
        return;
      }
      animating.current = true;
      playCover(() => {
        // Under full cover: reset scroll, then swap the route.
        lenis?.current?.scrollTo(0, { immediate: true });
        window.scrollTo(0, 0);
        pendingReveal.current = true;
        router.push(to);
      });
    };

    // Park the curtain off-screen (GSAP owns the transform from here).
    gsap.set(els().panel, { y: 0, yPercent: 100 });
    gsap.set(els().mark, { opacity: 0, yPercent: 0 });
    gsap.set(els().folds, { "--fold": 0 });

    // Intercept internal <a> clicks in the capture phase (before the anchor's own
    // navigation), upgrading them to animated client-side transitions.
    const onClick = (e: MouseEvent) => {
      if (
        e.defaultPrevented ||
        e.button !== 0 ||
        e.metaKey ||
        e.ctrlKey ||
        e.shiftKey ||
        e.altKey
      )
        return;
      const a = (e.target as Element | null)?.closest?.("a");
      if (!a) return;
      const href = a.getAttribute("href");
      const target = a.getAttribute("target");
      if (!href || (target && target !== "_self") || a.hasAttribute("download")) return;

      let url: URL;
      try {
        url = new URL(href, window.location.href);
      } catch {
        return;
      }
      if (url.origin !== window.location.origin) return;
      const dest = url.pathname;
      if (dest === window.location.pathname) return; // same page / hash-only
      if (SKIP.has(dest)) return; // home keeps its onboarding welcome

      e.preventDefault();
      if (animating.current) return; // ignore clicks mid-transition
      startCover(url.pathname + url.search + url.hash);
    };

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [router, lenis]);

  // When the route has actually swapped (under cover), reveal the new page.
  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    if (!pendingReveal.current) return; // back/forward etc. → no cover, no reveal
    pendingReveal.current = false;
    // One frame for the new page to commit before unfolding.
    requestAnimationFrame(() => revealRef.current(() => (animating.current = false)));
  }, [pathname]);

  return (
    <>
      {children}
      <div className={s.overlay} ref={overlayRef} aria-hidden="true">
        <div className={s.panel}>
          {/* Grain + faint watermark borrow the onboarding's atmosphere so the
              curtain reads as the same world as the welcome, not a bare field. */}
          <span className={s.grain} aria-hidden="true" />
          <span className={s.watermark} aria-hidden="true">
            <img src="/icons/pp-watermark.svg" alt="" />
          </span>
          <div className={s.stage}>
            <FoldMark className={s.mark} />
          </div>
        </div>
      </div>
    </>
  );
}
