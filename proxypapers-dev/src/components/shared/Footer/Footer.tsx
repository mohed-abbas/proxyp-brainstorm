"use client";

import { useRef } from "react";
import s from "./Footer.module.css";
import { useContent, useLocalizedHref } from "@/lib/i18n/LocaleProvider";
import { PpMark } from "@/components/shared/PpMark";
import { useFooter } from "@/lib/animations/useFooter";

export function Footer() {
  const footer = useContent("footer");
  const lh = useLocalizedHref();
  const root = useRef<HTMLElement>(null);
  useFooter(root, s);

  return (
    <footer className={s.footer} data-nav-theme="blue" ref={root}>
      <div className={s.grain} aria-hidden="true" />
      <div className={`${s.cloud} ${s.cloudTop}`} aria-hidden="true">
        <img src="/images/clouds.webp" alt="" />
      </div>
      <div className={`${s.cloud} ${s.cloudLeft}`} aria-hidden="true">
        <img src="/images/clouds.webp" alt="" />
      </div>

      <div className={s.content}>
        <div className={s.brand}>
          <div className={s.mark} aria-hidden="true">
            <PpMark className={s.markSvg} />
          </div>
          <p className={s.legal}>{footer.legal}</p>
        </div>

        <div className={s.cols}>
          {footer.columns.map((col) => (
            <div key={col.id} className={s.unit}>
              <span className={s.rule} aria-hidden="true" />
              <nav className={s.col} data-col={col.id} aria-label={col.ariaLabel}>
                {col.groups.map((group, gi) => (
                  <ul key={gi} className={s.group}>
                    {group.map((item) => (
                      <li key={item.label}>
                        <a
                          className={`${s.link}${"active" in item && item.active ? ` ${s.linkActive}` : ""}`}
                          href={lh(item.href)}
                        >
                          {item.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                ))}
              </nav>
            </div>
          ))}
        </div>
      </div>
    </footer>
  );
}
