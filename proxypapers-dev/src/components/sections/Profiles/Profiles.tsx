"use client";

import { useRef, type CSSProperties } from "react";
import s from "./Profiles.module.css";
import { useContent } from "@/lib/i18n/LocaleProvider";
import { SplitText } from "@/components/shared/SplitText";
import { PpButton } from "@/components/shared/PpButton";
import { useProfiles } from "@/lib/animations/useProfiles";

// Fan-entry offset each card winds back to at the start of the scrubbed flip.
// Design constants (not content): the per-card --rot / --dx / --dy from the
// source markup. The GSAP hook reads them off the rendered cards.
const FAN: Record<string, CSSProperties> = {
  "01": { "--rot": "-10deg", "--dx": "8.77vw", "--dy": "1.59vw" } as CSSProperties,
  "02": { "--rot": "0deg", "--dx": "-2.22vw", "--dy": "0vw" } as CSSProperties,
  "03": { "--rot": "10deg", "--dx": "-8.77vw", "--dy": "1.59vw" } as CSSProperties,
};

export function Profiles() {
  const profiles = useContent("profiles");
  const root = useRef<HTMLElement>(null);
  useProfiles(root, s);

  return (
    <section
      className={s.profiles}
      aria-label="The three support profiles"
      data-nav-theme="dark"
      ref={root}
    >
      <div className={s.frame}>
        <div className={s.content}>
          <h2 className={s.title}>
            <SplitText
              as="span"
              className={s.titleLine}
              words={profiles.title.lines[0].split(" ")}
            />
            <SplitText
              as="span"
              className={`${s.titleLine} ${s.titleLineMuted}`}
              words={profiles.title.lines[1].split(" ")}
            />
          </h2>
          <SplitText
            as="p"
            className={s.body}
            words={profiles.body.split(" ")}
          />

          <div className={s.deck}>
            {profiles.cards.map((card) => (
              <article
                key={card.id}
                className={s.card}
                data-profile={card.id}
                style={FAN[card.id]}
              >
                <div className={s.cardPos}>
                  <div className={s.cardFlip}>
                    <div className={s.cardFace}>
                      <span className={s.cardNum}>{card.num}</span>
                      <span className={s.cardMark} />
                    </div>
                    <div className={`${s.cardFace} ${s.cardFaceBack}`}>
                      <span className={s.cardNum}>{card.num}</span>
                      <div className={s.cardMeta}>
                        <span className={s.cardName}>{card.name}</span>
                        <span className={s.cardDesc}>{card.desc}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div className={s.cta}>
            <PpButton href={profiles.cta.href} label={profiles.cta.label} />
          </div>
        </div>
      </div>
    </section>
  );
}
