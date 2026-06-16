import { useEffect, useRef, type RefObject } from "react";
import { useLenis } from "@/lib/lenis/LenisProvider";

type UseMenuArgs = {
  open: boolean;
  onClose: () => void;
  btnRef: RefObject<HTMLButtonElement | null>;
  panelRef: RefObject<HTMLDivElement | null>;
};

const FOCUSABLE =
  'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

// Menu plumbing — ported from setupMenu in design-final/scripts/hero.js: while
// open, lock scroll (Lenis), trap focus across the Close button + panel, close on
// Escape, and restore focus on close. The open/close animation itself is CSS,
// driven by the panel's data-state (see Menu.module.css). Scrim + link clicks
// call onClose directly from the markup.
export function useMenu({ open, onClose, btnRef, panelRef }: UseMenuArgs) {
  const lenisRef = useLenis();
  const lastFocus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const panel = panelRef.current;
    const btn = btnRef.current;
    const lenis = lenisRef?.current ?? null;

    lastFocus.current = document.activeElement as HTMLElement;
    if (lenis) lenis.stop();
    else document.documentElement.style.overflow = "hidden";

    const focusables = (): HTMLElement[] =>
      [
        btn,
        ...(panel ? panel.querySelectorAll<HTMLElement>(FOCUSABLE) : []),
      ].filter((el): el is HTMLElement => !!el);

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key !== "Tab") return;
      const items = focusables();
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;
      if (e.shiftKey && active === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);

    // Focus the first nav link once the panel has painted, so the reveal reads.
    const firstLink = panel?.querySelector<HTMLElement>("nav a");
    const raf = requestAnimationFrame(() => firstLink?.focus());

    return () => {
      document.removeEventListener("keydown", onKey);
      cancelAnimationFrame(raf);
      if (lenis) lenis.start();
      else document.documentElement.style.overflow = "";
      lastFocus.current?.focus();
    };
  }, [open, lenisRef, onClose, btnRef, panelRef]);
}
