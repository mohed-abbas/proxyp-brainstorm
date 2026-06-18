"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  type ReactNode,
  type RefObject,
} from "react";
import Lenis from "lenis";
import { gsap, ScrollTrigger } from "@/lib/gsap";

const LenisContext = createContext<RefObject<Lenis | null> | null>(null);

// Access the shared Lenis instance ref (e.g. to stop/start scroll during
// overlays). Read `.current` inside an effect or event handler, where it is set.
export const useLenis = () => useContext(LenisContext);

// One Lenis instance for the whole app, driven by gsap.ticker so GSAP and
// smooth scroll share a single rAF loop. Easing + duration match the source
// (design-final/scripts/hero.js). Held in a stable ref so consumers can reach it
// without forcing a re-render.
export function LenisProvider({ children }: { children: ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    const instance = new Lenis({
      duration: 1.8,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    });

    instance.on("scroll", ScrollTrigger.update);

    const raf = (time: number) => instance.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);
    lenisRef.current = instance;

    // Stop until the onboarding curtain releases (matches the source). The welcome
    // assembles on a clock with scroll locked; the intro controller calls .start()
    // on ready. Only lock when a curtain is actually present — pages without an
    // Onboarding (e.g. /referrals) have nothing to call .start(), so locking there
    // would strand the page scroll-locked. Reduced motion / no-JS never locks.
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const hasOnboarding = !!document.querySelector(".ob-stage");
    if (hasOnboarding && document.documentElement.classList.contains("js") && !reduced) {
      instance.stop();
    }

    return () => {
      gsap.ticker.remove(raf);
      instance.destroy();
      lenisRef.current = null;
    };
  }, []);

  return <LenisContext.Provider value={lenisRef}>{children}</LenisContext.Provider>;
}
