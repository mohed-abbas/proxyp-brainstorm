"use client";

import { useRef } from "react";
import s from "./FreedomSection.module.css";
import content from "@/data/en/approach.json";
import { SplitText } from "@/components/shared/SplitText";
import { useFreedom } from "@/lib/animations/useFreedom";

const { heading, body, cards } = content.freedom;

// FreedomSection — ported 1:1 from Figma (node 142:270, 1512×645). A full-width Bone
// panel (20px radius) on the dark page ground: a centred Proxy-Blue heading over a
// two-weight body paragraph, then two side-by-side statement cards — a filled blue
// "Freedom" card and an ink-outlined "Independence" card. Mirrors the Method panel's
// full-bleed-panel → 1512 frame → centred-content structure; lengths are literal
// artboard px * var(--pp-scale).
//
// On enter, the heading + body reveal word-by-word and the cards lift in (useFreedom).
export function FreedomSection() {
  const root = useRef<HTMLElement>(null);
  useFreedom(root, s);

  return (
    <section
      className={s.freedom}
      data-nav-theme="light"
      aria-label="Freedom and independence"
      ref={root}
    >
      <div className={s.frame}>
        <div className={s.content}>
          <header className={s.head}>
            <SplitText as="h2" className={s.heading} words={heading.split(" ")} />
            <p className={s.body}>
              <SplitText className={s.bodyLead} words={body.lead.trim().split(" ")} />{" "}
              <SplitText className={s.bodyRest} words={body.rest.trim().split(" ")} />
            </p>
          </header>

          <ul className={s.cards}>
            {cards.map((card) => (
              <li
                key={card.eyebrow}
                className={`${s.card} ${card.variant === "blue" ? s.cardBlue : s.cardOutline}`}
              >
                <div className={s.cardInner}>
                  <p className={s.eyebrow}>{card.eyebrow}</p>
                  <p className={s.cardTitle}>{card.title}</p>
                  <p className={s.cardDesc}>{card.desc}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
