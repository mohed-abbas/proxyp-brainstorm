"use client";

import { type RefObject } from "react";
import s from "./Menu.module.css";
import { PpMark } from "@/components/shared/PpMark";

type NavContent = {
  lang: { current: string; alt: { label: string; href: string } };
  links: { label: string; href: string }[];
  social: { label: string; href: string; icon: string }[];
};

type MenuProps = {
  open: boolean;
  onClose: () => void;
  panelRef: RefObject<HTMLDivElement | null>;
  content: NavContent;
};

export function Menu({ open, onClose, panelRef, content }: MenuProps) {
  return (
    <div
      className={s.menu}
      data-state={open ? "open" : "closed"}
      aria-hidden={!open}
    >
      <button
        type="button"
        className={s.scrim}
        aria-label="Close menu"
        tabIndex={-1}
        onClick={onClose}
      />
      <div
        className={s.panel}
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
      >
        <p className={s.lang}>
          <span className={s.langCurrent}>{content.lang.current}{" | "}</span>
          <a className={s.langAlt} href={content.lang.alt.href}>
            {content.lang.alt.label}
          </a>
        </p>

        <nav className={s.navLinks} aria-label="Menu principal">
          {content.links.map((l) => (
            <a key={l.label} className={s.link} href={l.href} onClick={onClose}>
              <span className={s.linkText}>
                <span className={s.linkMain}>{l.label}</span>
                <span className={s.linkClone} aria-hidden="true">
                  {l.label}
                </span>
              </span>
            </a>
          ))}
        </nav>

        <div className={s.foot}>
          <a className={s.logo} href="#" aria-label="Proxy Papers — home">
            <PpMark />
          </a>
          <div className={s.social}>
            {content.social.map((soc) => (
              <a
                key={soc.label}
                className={s.socialLink}
                href={soc.href}
                aria-label={soc.label}
              >
                <img src={soc.icon} alt="" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
