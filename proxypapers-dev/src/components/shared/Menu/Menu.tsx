"use client";

import { type RefObject } from "react";
import s from "./Menu.module.css";
import { PpMark } from "@/components/shared/PpMark";
import { useLocalizedHref } from "@/lib/i18n/LocaleProvider";
import { LocaleSwitcher } from "@/lib/i18n/LocaleSwitcher";

type NavContent = {
  home: { href: string; label: string };
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
  const lh = useLocalizedHref();
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
        <LocaleSwitcher
          className={s.lang}
          currentClassName={s.langCurrent}
          altClassName={s.langAlt}
        />

        <nav className={s.navLinks} aria-label="Menu principal">
          {content.links.map((l) => (
            <a
              key={l.label}
              className={s.link}
              href={lh(l.href)}
              onClick={onClose}
            >
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
          <a
            className={s.logo}
            href={lh(content.home.href)}
            aria-label={content.home.label}
            onClick={onClose}
          >
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
