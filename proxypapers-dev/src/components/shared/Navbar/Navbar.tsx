"use client";

import { useCallback, useRef, useState } from "react";
import s from "./Navbar.module.css";
import navContent from "@/data/en/nav.json";
import { PpMark } from "@/components/shared/PpMark";
import { Menu } from "@/components/shared/Menu";
import { useNavTheme } from "@/hooks/useNavTheme";
import { useMenu } from "@/hooks/useMenu";

export function Navbar() {
  const navRef = useRef<HTMLElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);

  const theme = useNavTheme(navRef);
  useMenu({ open, onClose: close, btnRef, panelRef });

  return (
    <>
      <nav
        ref={navRef}
        className={`${s.nav} pp-theme-${theme}${open ? ` ${s.navMenuOpen}` : ""}`}
        aria-label="Primary"
      >
        <a
          className={s.logo}
          href={navContent.home.href}
          aria-label={navContent.home.label}
        >
          <PpMark />
        </a>

        <button
          ref={btnRef}
          className={s.menuBtn}
          type="button"
          aria-label={open ? navContent.menu.closeLabel : navContent.menu.openLabel}
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
        >
          <span className={s.menuIcon} aria-hidden="true">
            {/* lucide "grip" — a 4-dot diamond that squares up on open */}
            <svg viewBox="0 0 23 23" fill="none" xmlns="http://www.w3.org/2000/svg">
              <g
                stroke="currentColor"
                strokeWidth={1.888}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11.331" cy="4.721" r="0.944" />
                <circle cx="17.941" cy="11.331" r="0.944" />
                <circle cx="4.722" cy="11.331" r="0.944" />
                <circle cx="11.331" cy="17.940" r="0.944" />
              </g>
            </svg>
          </span>
          <span className={s.menuLabel} aria-hidden="true">
            <span className={s.menuLabelTrack}>
              <span className={s.menuLabelWord}>{navContent.menu.open}</span>
              <span className={s.menuLabelWord}>{navContent.menu.close}</span>
            </span>
          </span>
        </button>
      </nav>

      <Menu open={open} onClose={close} panelRef={panelRef} content={navContent} />
    </>
  );
}
