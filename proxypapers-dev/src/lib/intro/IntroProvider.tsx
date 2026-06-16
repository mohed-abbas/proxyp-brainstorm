"use client";

import {
  createContext,
  useContext,
  useMemo,
  useRef,
  type ReactNode,
} from "react";
import type { gsap } from "gsap";

type Timeline = gsap.core.Timeline;

// Handles the onboarding curtain needs from the hero: its paused intro timeline
// and the idle (continuous drift) starter. Hero registers these in its useGSAP;
// the curtain reads them when it plays. Exposed as an imperative API over an
// internal ref (not a mutable value) so neither side re-renders and effect order
// doesn't matter — the curtain reads on an async asset gate, after Hero has run.
type IntroHandles = {
  heroTl: Timeline | null;
  heroIdle: (() => void) | null;
};

type IntroApi = {
  registerHero: (tl: Timeline, idle: () => void) => void;
  getHero: () => IntroHandles;
};

const IntroContext = createContext<IntroApi | null>(null);

export const useIntro = () => useContext(IntroContext);

export function IntroProvider({ children }: { children: ReactNode }) {
  const handles = useRef<IntroHandles>({ heroTl: null, heroIdle: null });
  const api = useMemo<IntroApi>(
    () => ({
      registerHero: (tl, idle) => {
        handles.current.heroTl = tl;
        handles.current.heroIdle = idle;
      },
      getHero: () => handles.current,
    }),
    [],
  );

  return <IntroContext.Provider value={api}>{children}</IntroContext.Provider>;
}
