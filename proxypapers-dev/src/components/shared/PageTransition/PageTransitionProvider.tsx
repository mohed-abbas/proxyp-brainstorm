"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { gsap } from "@/lib/gsap";
import { useLenis } from "@/lib/lenis/LenisProvider";
import { markClientNavigated } from "@/lib/intro/navState";
import { PpMark } from "@/components/shared/PpMark";
import s from "./PageTransition.module.css";

// Routes the transition does NOT intercept — the home page owns its onboarding
// welcome curtain, so letting "/" navigate normally avoids two curtains fighting.
const SKIP = new Set<string>(["/"]);

// Timing (seconds). Cover is a touch quicker than reveal so the new page lands
// with a slightly more generous unveil. Motion is seasoning: deliberate, calm.
const T = {
  cover: 0.72, // black sweeps bottom → full
  fade: 0.26, // crossfade black cover → blue reveal (no hard cut)
  reveal: 0.82, // blue sweeps full → off the top
};

// Bend amplitude, in viewBox units (≈ % of viewport height). How far the leading
// (cover) / trailing (reveal) edge bulges past its baseline at mid-travel. The
// bulge rises 0 → BEND → 0 across each sweep, so the edge is flat at both rest
// poses and curved only while moving — the "bending" read.
const BEND = 16;

// ── Path geometry (viewBox 0 0 100 100, preserveAspectRatio:none) ───────────
// One quadratic edge spanning the full width. `edge` is the baseline y of the
// edge at the two corners; the control point sits at `edge - bend*2` so the
// curve's midpoint lands exactly `bend` above the baseline (quadratic midpoint
// = (P0 + P2)/2 mixed halfway toward the control).
//
// COVER fills from its curved TOP edge down to the bottom (anchored at y=100):
//   edge 100 → 0  ·  hidden (zero-area line at the bottom) → full screen.
const coverD = (edge: number, bend: number) =>
  `M0 100 L0 ${edge} Q50 ${edge - bend * 2} 100 ${edge} L100 100 Z`;
// REVEAL fills from the top (anchored at y=0) down to its curved BOTTOM edge:
//   edge 100 → 0  ·  full screen → gone (retreated up off the top).
const revealD = (edge: number, bend: number) =>
  `M0 0 L100 0 L100 ${edge} Q50 ${edge - bend * 2} 0 ${edge} Z`;

const reduced = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Drives the bending-mask page transition. Renders the children plus a fixed
// overlay holding two black SVG mask layers. A capture-phase click interceptor
// upgrades every internal <a href> into an animated client-side navigation:
// the COVER mask bends up over the leaving page, the route swaps under full
// black, then the REVEAL mask bends up and off the arriving page. Back/forward
// and reduced-motion fall through to an instant swap.
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
  // router + Lenis ref, parks both masks hidden, binds the click interceptor,
  // and publishes playReveal via revealRef for the pathname effect to fire.
  useEffect(() => {
    const root = overlayRef.current;
    if (!root) return;

    const cover = root.querySelector<SVGPathElement>('[data-mask="cover"]')!;
    const reveal = root.querySelector<SVGPathElement>('[data-mask="reveal"]')!;
    const revealSvg = reveal.ownerSVGElement!;
    const mark = root.querySelector<SVGElement>(`.${s.mark}`)!;

    // Proxy state GSAP tweens; redrawn into the path `d` each frame.
    const cState = { edge: 100, bend: 0 };
    const rState = { edge: 100, bend: 0 };
    const drawCover = () => cover.setAttribute("d", coverD(cState.edge, cState.bend));
    const drawReveal = () => reveal.setAttribute("d", revealD(rState.edge, rState.bend));

    // Idle: both masks hidden (zero-area paths) — no flash before first run.
    cover.setAttribute("d", coverD(100, 0));
    reveal.setAttribute("d", revealD(0, 0));
    gsap.set(mark, { opacity: 0, yPercent: 0 });

    // COVER: black sweeps bottom → full, leading edge bulging then flattening.
    // onDone fires under full cover (safe to swap the route).
    const playCover = (onDone: () => void) => {
      cState.edge = 100;
      cState.bend = 0;
      drawCover();
      reveal.setAttribute("d", revealD(0, 0)); // keep reveal layer out of the way
      gsap.set(root, { pointerEvents: "auto" });
      gsap.set(mark, { opacity: 0, yPercent: 18 });
      gsap
        .timeline({ onUpdate: drawCover, onComplete: onDone })
        .to(cState, { edge: 0, duration: T.cover, ease: "power2.inOut" }, 0)
        .to(
          cState,
          { bend: BEND, duration: T.cover / 2, ease: "sine.inOut", yoyo: true, repeat: 1 },
          0,
        )
        // Mark settles in as the black closes over the leaving page.
        .to(mark, { opacity: 1, yPercent: 0, duration: 0.5, ease: "power3.out" }, T.cover - 0.5);
    };

    // REVEAL: the reveal layer takes the screen (full black on top of the cover),
    // then black sweeps full → off the top, trailing edge bending the same way.
    const playReveal = (onDone: () => void) => {
      rState.edge = 100;
      rState.bend = 0;
      reveal.setAttribute("d", revealD(100, 0)); // full blue, ready over the black
      drawReveal();
      gsap.set(revealSvg, { opacity: 0 }); // start transparent → crossfade in
      gsap
        .timeline({
          onUpdate: drawReveal,
          onComplete: () => {
            gsap.set(root, { pointerEvents: "none" });
            gsap.set(revealSvg, { opacity: 1 }); // reset for next run
            reveal.setAttribute("d", revealD(0, 0)); // park hidden (idle)
            gsap.set(mark, { opacity: 0, yPercent: 0 });
            onDone();
          },
        })
        // 1) Crossfade black → blue (the cover sits under the fading-in blue, so
        //    the colour change is a soft dissolve, never a hard cut / flicker).
        .to(revealSvg, { opacity: 1, duration: T.fade, ease: "power1.inOut" }, 0)
        // Once blue fully owns the screen, retire the cover layer beneath it.
        .add(() => cover.setAttribute("d", coverD(100, 0)), T.fade)
        // 2) Blue sweeps full → off the top, trailing edge bending.
        .to(rState, { edge: 0, duration: T.reveal, ease: "power2.inOut" }, T.fade)
        .to(
          rState,
          { bend: BEND, duration: T.reveal / 2, ease: "sine.inOut", yoyo: true, repeat: 1 },
          T.fade,
        )
        // Mark rides up and fades as the blue clears the screen.
        .to(
          mark,
          { opacity: 0, yPercent: -22, duration: T.reveal * 0.6, ease: "power2.in" },
          T.fade,
        );
    };
    revealRef.current = playReveal;

    const startCover = (to: string) => {
      // Mark before navigating so the destination's mount effects see it — lets the
      // home page suppress its welcome curtain on a client-side return.
      markClientNavigated();
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

    // Back/forward bypass the click interceptor; mark here too (fires before React
    // commits the new tree) so a popstate return to home also skips the welcome.
    const onPopState = () => markClientNavigated();

    document.addEventListener("click", onClick, true);
    window.addEventListener("popstate", onPopState);
    return () => {
      document.removeEventListener("click", onClick, true);
      window.removeEventListener("popstate", onPopState);
    };
  }, [router, lenis]);

  // When the route has actually swapped (under cover), reveal the new page.
  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    if (!pendingReveal.current) return; // back/forward etc. → no cover, no reveal
    pendingReveal.current = false;
    // One frame for the new page to commit before the reveal sweep.
    requestAnimationFrame(() => revealRef.current(() => (animating.current = false)));
  }, [pathname]);

  return (
    <>
      {children}
      <div className={s.overlay} ref={overlayRef} aria-hidden="true">
        <svg
          className={`${s.mask} ${s.maskCover}`}
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          <path data-mask="cover" d="M0 100 L0 100 Q50 100 100 100 L100 100 Z" />
        </svg>
        <svg
          className={`${s.mask} ${s.maskReveal}`}
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          <path data-mask="reveal" d="M0 0 L100 0 L100 0 Q50 0 0 0 Z" />
        </svg>
        <div className={s.markWrap}>
          <PpMark className={s.mark} />
        </div>
      </div>
    </>
  );
}
