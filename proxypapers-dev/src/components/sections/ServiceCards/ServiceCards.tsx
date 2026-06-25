"use client";

import { useRef, type CSSProperties } from "react";
import s from "./ServiceCards.module.css";
import data from "@/data/en/services-cards.json";
import { CardIcon } from "./CardIcon";
import { useServiceCards } from "@/lib/animations/useServiceCards";

type Styles = Record<string, string>;
type Tile = { icon: string; label: string; x: number; y: number; w: number; h: number };
type Card = (typeof data.cards)[number];

// Decorative sparkle bullet (Figma "Star 1", node 160:464) — a 12-point burst star marking
// the profile description. Exact vector path exported from Figma (27×28); `currentColor`
// lets the card theme drive the fill (ink on the light card, bone on the dark cards).
function Sparkle({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 27 28" fill="currentColor" aria-hidden="true">
      <path d="M13.3164 0L14.9689 8.9142L21.5454 2.67376L17.6426 10.8568L26.6312 9.67376L18.6639 14L26.6312 18.3262L17.6426 17.1432L21.5454 25.3262L14.9689 19.0858L13.3164 28L11.6639 19.0858L5.08741 25.3262L8.99017 17.1432L0.00161457 18.3262L7.96888 14L0.00161457 9.67376L8.99017 10.8568L5.08741 2.67376L11.6639 8.9142L13.3164 0Z" />
    </svg>
  );
}

// One profile card (Figma nodes 160:411 / 160:605 / 160:675, 1512×621). Carries the big
// index number, the profile title + subtitle, a sparkle-led description, an optional
// "inherits the previous tier" pill, the pricing line, and a bento of included-service
// tiles (each a bordered tile with a lucide icon + label, positioned from its design-pixel
// geometry). The light variant (Essentiel) is a bone card with a blue title; the dark
// variant (Signature/Exception) is an ink card with bone copy — selected via data-theme.
function ProfileCard({ card, styles }: { card: Card; styles: Styles }) {
  const { bento } = card;
  const inherits = "inherits" in card ? card.inherits : undefined;
  return (
    <article className={styles.card} data-card={card.id} data-theme={card.theme}>
      <span className={styles.num} aria-hidden="true">
        {card.number}
      </span>

      <div className={styles.copy}>
        <div className={styles.head}>
          <h3 className={styles.title}>{card.title}</h3>
          <p className={styles.subtitle}>{card.subtitle}</p>
        </div>
        <div className={styles.descRow}>
          <Sparkle className={styles.star} />
          <p className={styles.desc}>{card.description}</p>
        </div>
        {inherits && (
          <div className={styles.inherits}>
            <span className={styles.inheritsLabel}>{inherits.label}</span>
            <CardIcon name={inherits.icon} className={styles.inheritsIcon} />
          </div>
        )}
      </div>

      <p className={styles.pricing}>{card.pricing}</p>

      <div
        className={styles.bento}
        aria-hidden="true"
        style={{ "--bw": bento.w, "--bh": bento.h } as CSSProperties}
      >
        {(bento.tiles as Tile[]).map((t, i) => (
          <div
            key={i}
            className={styles.tile}
            style={
              { "--tx": t.x, "--ty": t.y, "--tw": t.w, "--th": t.h } as CSSProperties
            }
          >
            <span className={styles.tileInner}>
              <CardIcon name={t.icon} className={styles.tileIcon} />
              <span className={styles.tileLabel}>{t.label}</span>
            </span>
          </div>
        ))}
      </div>
    </article>
  );
}

// Service profiles — the three locked profiles (Essentiel · Signature · Exception) as a
// deck of cards (Figma nodes 160:411 / 160:605 / 160:675). Full-viewport section; on
// scroll the cards stack (the stacked-deck mechanic lands once all three cards are in —
// see useServiceCards). Bone cards lift off the Chinese-Black ground with a soft shadow.
export function ServiceCards() {
  const root = useRef<HTMLElement>(null);
  useServiceCards(root, s);

  return (
    <section className={s.cards} aria-label="Service profiles" data-nav-theme="dark" ref={root}>
      <div className={s.deck}>
        {data.cards.map((card) => (
          <div className={s.slot} key={card.id} data-slot={card.id}>
            <ProfileCard card={card} styles={s} />
          </div>
        ))}
      </div>
    </section>
  );
}
