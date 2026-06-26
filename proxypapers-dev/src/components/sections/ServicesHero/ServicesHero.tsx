"use client";

import { useRef } from "react";
import s from "./ServicesHero.module.css";
import { useContent } from "@/lib/i18n/LocaleProvider";
import { SplitText, type SplitWord } from "@/components/shared/SplitText";
import { PpMark } from "@/components/shared/PpMark";
import { useServicesHero } from "@/lib/animations/useServicesHero";
import { useServicesOrbit } from "@/lib/animations/useServicesOrbit";

type Styles = Record<string, string>;

// The profiles orbit — Figma node 160:407. Three concentric rings (radii 137 · 241 ·
// 361, centred on the 78px bone P-disc at field 384,371 in the 768×742 box) carry the
// three locked profile chips (Essentiel · Signature · Exception) along one up-left
// radial, each rotated tangent to its ring. Rebuilt as live DOM (not the flat Figma
// export) so the labels stay crisp + theme-correct and the rings can breathe; motion
// lives in useServicesOrbit. The field is anchored to the hero's bottom-right and
// bleeds off the corner (clipped by the hero's overflow + rounded corner).
function ProfilesOrbit({ styles }: { styles: Styles }) {
  const profiles = useContent("services").hero.profiles;
  const orbit = useRef<HTMLDivElement>(null);
  useServicesOrbit(orbit, styles);

  return (
    <div className={styles.orbit} ref={orbit} aria-hidden="true">
      <svg
        className={styles.rings}
        viewBox="0 0 768 742"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle className={styles.ringSolid} cx="384" cy="371" r="361" />
        <circle className={styles.ringDash} cx="384" cy="371" r="241" />
        <circle className={styles.ringSolid} cx="384" cy="371" r="137" />
      </svg>

      {profiles.map((p) => (
        <span key={p.id} className={styles.chip} data-ring={p.ring}>
          {p.label}
        </span>
      ))}

      <span className={styles.mark}>
        <PpMark />
      </span>
    </div>
  );
}

// Services hero — ported 1:1 from Figma (node 158:349, 1512×983 artboard). The brand
// at full presence: a full-bleed Proxy-Blue ground (rounded bottom corners) with a
// faint grain overlay and two soft cloud wisps for atmospheric depth, carrying the
// "Three profiles…" statement (the accent word turns Chinese-Black, the reverse of
// the blue-accent treatment elsewhere), a body line, and the white "no public pricing"
// badge. The live ProfilesOrbit sits at the bottom-right, bleeding off the corner.
export function ServicesHero() {
  const content = useContent("services");
  const root = useRef<HTMLElement>(null);
  useServicesHero(root, s);

  const { headline, body, badge } = content.hero;

  // "Three profiles. One shared framework. No fixed packages." — "profiles." carries
  // the ink accent; the remaining words stay bone.
  const headlineWords: SplitWord[] = [
    headline.lead.trim(),
    { text: headline.accent, className: s.accent },
    ...headline.rest.trim().split(" "),
  ];

  return (
    <main className={s.hero} data-nav-theme="blue" ref={root}>
      {/* Atmosphere — blue ground (on .hero) + grain + two cloud wisps. Decorative. */}
      <div className={s.bg} aria-hidden="true">
        <div className={s.grain} />
        <img className={`${s.cloud} ${s.cloudTop}`} src="/images/clouds.webp" alt="" />
        <img className={`${s.cloud} ${s.cloudBot}`} src="/images/clouds.webp" alt="" />
      </div>

      <div className={s.frame}>
        <div className={s.copy}>
          <SplitText as="h1" className={s.headline} words={headlineWords} />
          <p className={s.body}>{body}</p>
          <div className={s.badge}>
            <span className={s.badgeDot} aria-hidden="true" />
            <span className={s.badgeText}>{badge}</span>
          </div>
        </div>

        <ProfilesOrbit styles={s} />
      </div>
    </main>
  );
}
