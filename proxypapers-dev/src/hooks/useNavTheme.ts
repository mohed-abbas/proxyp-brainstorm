import { useEffect, useState, type RefObject } from "react";

export type NavTheme = "dark" | "blue" | "light";

// Flip the navbar theme to match the section under it. Ported from setupNavTheme
// in design-final/scripts/hero.js: a 1px detection band at the navbar's vertical
// centre; whichever [data-nav-theme] section crosses that line owns the theme.
// Returns the current theme so the caller renders the matching class (instead of
// mutating classList, which would fight React).
export function useNavTheme(navRef: RefObject<HTMLElement | null>): NavTheme {
  const [theme, setTheme] = useState<NavTheme>("dark");

  useEffect(() => {
    const nav = navRef.current;
    if (!nav || !("IntersectionObserver" in window)) return;
    const sections = [
      ...document.querySelectorAll<HTMLElement>("[data-nav-theme]"),
    ];
    if (!sections.length) return;

    let io: IntersectionObserver | undefined;
    const build = () => {
      io?.disconnect();
      const r = nav.getBoundingClientRect();
      const line = r.top + r.height / 2;
      const below = Math.max(0, window.innerHeight - line - 1);
      io = new IntersectionObserver(
        (entries) =>
          entries.forEach((e) => {
            if (e.isIntersecting) {
              const t = (e.target as HTMLElement).dataset.navTheme as NavTheme;
              if (t) setTheme(t);
            }
          }),
        { rootMargin: `-${line}px 0px -${below}px 0px`, threshold: 0 },
      );
      sections.forEach((s) => io!.observe(s));
    };
    build();

    addEventListener("resize", build, { passive: true });
    return () => {
      io?.disconnect();
      removeEventListener("resize", build);
    };
  }, [navRef]);

  return theme;
}
