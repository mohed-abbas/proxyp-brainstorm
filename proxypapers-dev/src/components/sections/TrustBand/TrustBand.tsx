"use client";

import { useRef } from "react";
import s from "./TrustBand.module.css";
import { useContent } from "@/lib/i18n/LocaleProvider";
import { SplitText } from "@/components/shared/SplitText";
import { useTrustBand } from "@/lib/animations/useTrustBand";

export type TrustBandContent = {
  ariaLabel: string;
  eyebrow: string;
  certs: string[];
  title: { lines: string[] };
  body: string;
};

// TrustBand — the /approach "Security & certifications" band (Figma 634:133 /
// 634:322). Same markup + CSS as the shared Trust band and the same pinned/scrubbed
// expand (via useTrustBand, a fork of useTrust); it differs only in copy and a
// Proxy-Blue accent title. Content lives in data/<locale>/trust-band.json.
export function TrustBand({
  content: contentProp,
}: {
  content?: TrustBandContent;
}) {
  const fallback = useContent("trust-band") as TrustBandContent;
  const content = contentProp ?? fallback;
  const root = useRef<HTMLElement>(null);
  useTrustBand(root, s);

  return (
    <section
      className={s.trust}
      aria-label={content.ariaLabel}
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
