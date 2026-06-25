import s from "./FreedomSection.module.css";
import content from "@/data/en/approach.json";

const { heading, body, cards } = content.freedom;

// FreedomSection — ported 1:1 from Figma (node 142:270, 1512×645). A full-width Bone
// panel (20px radius) on the dark page ground: a centred Proxy-Blue heading over a
// two-weight body paragraph, then two side-by-side statement cards — a filled blue
// "Freedom" card and an ink-outlined "Independence" card. Mirrors the Method panel's
// full-bleed-panel → 1512 frame → centred-content structure; lengths are literal
// artboard px * var(--pp-scale).
export function FreedomSection() {
  return (
    <section className={s.freedom} data-nav-theme="light" aria-label="Freedom and independence">
      <div className={s.frame}>
        <div className={s.content}>
          <header className={s.head}>
            <h2 className={s.heading}>{heading}</h2>
            <p className={s.body}>
              <span className={s.bodyLead}>{body.lead}</span>
              <span className={s.bodyRest}>{body.rest}</span>
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
