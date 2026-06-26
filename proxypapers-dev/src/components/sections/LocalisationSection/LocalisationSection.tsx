"use client";

import { useRef } from "react";
import s from "./LocalisationSection.module.css";
import content from "@/data/en/approach.json";
import { useLocalisation } from "@/lib/animations/useLocalisation";

const { pill, title, subtitle, body, features, cards } = content.localisation;

// LocalisationSection — the Papers Box (Figma 142:574). On the Chinese-Black ground, a
// centred column ("Hosted in France" pill → "The Papers Box" accent + "Your Secure
// Digital Framework." → body → two rows of feature checks) with four glassy, rotated
// file cards (Tax · Real Estate · Succession · Insurance) at the corners. Lengths are
// literal artboard px * var(--pp-scale); below 1024 it reflows to a centred fluid column
// and the cards drop away.
//
// The corner layout is the resting state. useLocalisation deals the cards in from a
// centre cluster (the Figma "Contracted Version", node 142:519) once the whole section
// is in view, while the text rises — see the hook for the choreography.

// lucide/check (Figma node 142:549) — currentColor stroke so it themes via CSS.
function CheckIcon() {
  return (
    <svg
      className={s.checkIcon}
      viewBox="0 0 18 18"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M15 4.5 6.75 12.75 3 9"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// lucide/file (Figma node 142:463) — the card document mark.
function FileIcon() {
  return (
    <svg
      className={s.fileIcon}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M14 2v4a2 2 0 0 0 2 2h4"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function LocalisationSection() {
  const scope = useRef<HTMLElement>(null);
  useLocalisation(scope, s);

  return (
    <section
      ref={scope}
      className={s.section}
      data-nav-theme="dark"
      aria-label="The Papers Box — your secure digital framework"
    >
      <div className={s.frame}>
        {/* Centred text column (node 142:481). */}
        <div className={s.content}>
          <div className={s.heading}>
            <span className={s.pill}>{pill}</span>
            <p className={s.title}>{title}</p>
            <p className={s.subtitle}>{subtitle}</p>
          </div>

          <p className={s.body}>{body}</p>

          <ul className={s.features}>
            {features.map((label) => (
              <li key={label} className={s.feature}>
                <CheckIcon />
                <span className={s.featureLabel}>{label}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Four glassy, rotated file cards clustered as a stack over the centre (nodes
            142:491–518), frosting the text behind them. Decorative product illustration
            — hidden from assistive tech and dropped below 1024. */}
        <ul className={s.cards} aria-hidden="true">
          {cards.map((card) => (
            <li key={card.key} className={`${s.cardWrap} ${s[`card_${card.key}`]}`}>
              <div className={s.card}>
                <div className={s.cardInner}>
                  <span className={s.cardBadge}>
                    <FileIcon />
                  </span>
                  <p className={s.cardLabel}>{card.label}</p>
                  <p className={s.cardMeta}>{card.meta}</p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
