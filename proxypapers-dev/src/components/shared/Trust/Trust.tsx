"use client";

import { useRef } from "react";
import s from "./Trust.module.css";
import { useContent } from "@/lib/i18n/LocaleProvider";
import { SplitText } from "@/components/shared/SplitText";
import { useTrust } from "@/lib/animations/useTrust";

export type TrustContent = {
  eyebrow: string;
  certs: string[];
  title: { lines: string[] };
  body: string;
};

// Reassurance band. Reusable across pages via the `content` prop; defaults to the
// active locale's homepage copy (data/<locale>/trust.json).
export function Trust({ content: contentProp }: { content?: TrustContent }) {
  const fallback = useContent("trust") as TrustContent;
  const content = contentProp ?? fallback;
  const root = useRef<HTMLElement>(null);
  useTrust(root, s);

  return (
    <section
      className={s.trust}
      aria-label="Sovereign infrastructure and data protection"
      data-nav-theme="light"
      ref={root}
    >
      <div className={s.panel}>
        <span className={s.frame} aria-hidden="true" />
        <p className={s.eyebrow} aria-hidden="true">
          {content.eyebrow}
        </p>

        <div className={s.certsViewport} aria-hidden="true">
          <div className={s.certs}>
            <div className={s.certsTrack}>
              {content.certs.map((cert, i) => (
                <span key={i} className={s.cert}>
                  <span className={s.certLabel}>
                    <span className={s.certMain}>{cert}</span>
                    <span className={s.certClone} aria-hidden="true">
                      {cert}
                    </span>
                  </span>
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className={s.content}>
          <h2 className={s.title}>
            {content.title.lines.map((line, i) => (
              <span key={i} className={s.titleLine}>
                {line}
              </span>
            ))}
          </h2>
          <SplitText as="p" className={s.body} words={content.body.split(" ")} />
        </div>
      </div>
    </section>
  );
}
