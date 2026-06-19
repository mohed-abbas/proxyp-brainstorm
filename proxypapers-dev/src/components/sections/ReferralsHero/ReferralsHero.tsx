"use client";

import { useRef } from "react";
import s from "./ReferralsHero.module.css";
import content from "@/data/en/referrals.json";
import { SplitText, type SplitWord } from "@/components/shared/SplitText";
import { PpButton } from "@/components/shared/PpButton";
import { PpMark } from "@/components/shared/PpMark";
import { useReferralsHero } from "@/lib/animations/useReferralsHero";
import { useReferralsOrbit } from "@/lib/animations/useReferralsOrbit";

type Styles = Record<string, string>;

const spiralAvatars = content.hero.spiral.avatars;
const ringAvatars = (ring: string) =>
  spiralAvatars.filter((a) => a.ring === ring);

// The advisor spiral — Figma's exact layout (node 123:379): six concentric rings
// alternating solid/dashed (radii 86.5 · 150.5 · 222.5 · 302.5 · 379.5 · 440.5,
// centred in an 881-unit field), six avatars on the three solid rings, and a
// 58.9px centre P-node. Only the MOTION (load reveal + perpetual rotation) is
// borrowed from the home Referrers diagram — see useReferralsOrbit. The whole
// field is clipped to the blue band shape, so the big rings read as the shallow
// arcs of the Figma band and orbiting avatars dissolve at the band's edges.
function ReferralsSpiral({ styles }: { styles: Styles }) {
  const orbit = useRef<HTMLDivElement>(null);
  useReferralsOrbit(orbit, styles);

  return (
    <div className={styles.spiral} ref={orbit} aria-hidden="true">
      <div className={styles.field}>
        <svg
          className={styles.rings}
          viewBox="0 0 881 881"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle className={styles.ringSolid} cx="440.5" cy="440.5" r="86.5" />
          <circle className={styles.ringDash} cx="440.5" cy="440.5" r="150.5" />
          <circle className={styles.ringSolid} cx="440.5" cy="440.5" r="222.5" />
          <circle className={styles.ringDash} cx="440.5" cy="440.5" r="302.5" />
          <circle className={styles.ringSolid} cx="440.5" cy="440.5" r="379.5" />
          <circle className={styles.ringDash} cx="440.5" cy="440.5" r="440.5" />
        </svg>

        {(["r1", "r2", "r3"] as const).map((ring) => (
          <div key={ring} className={styles.orbitLayer} data-ring={ring}>
            {ringAvatars(ring).map((a) => (
              <span key={a.id} className={styles.avatar} data-avatar={a.id}>
                <img src={a.img} alt="" />
              </span>
            ))}
          </div>
        ))}

        <span className={styles.mark}>
          <PpMark />
        </span>
      </div>
    </div>
  );
}

// Referrals hero — ported from Figma (band node 123:369). A Chinese-Black canvas
// carrying a Proxy-Blue "bowtie" band: a full-bleed blue shape (band-blue.webp)
// pinched at the waist, fluffy-cloud wisps revealed through a sky mask at its wide
// ends, and two bone hairline curves tracing its top and bottom edges. The advisor
// network at the waist is NOT baked into the band — it is the live ReferralsSpiral
// (the home orbital), masked to the waist and perpetually spinning.
export function ReferralsHero() {
  const root = useRef<HTMLElement>(null);
  useReferralsHero(root, s);

  const { clients, firm, body, cta } = content.hero;

  // "For your clients." — the turn word ("clients.") carries the Proxy-Blue accent.
  const clientsWords: SplitWord[] = [
    ...clients.lead.trim().split(" "),
    { text: clients.accent, className: s.accent },
  ];
  const firmWords: SplitWord[] = firm.split(" ");

  return (
    <main className={s.hero} data-nav-theme="dark" ref={root}>
      <div className={s.frame}>
        {/* Band layers, ordered bottom→top per Figma: blue → spiral → clouds →
            hairlines (clouds paint over the spiral's outer rings at the flanks;
            the bone hairlines sit on top, tracing the band's edges). The .band
            window covers the full hero (100vw × 100svh, centred); .bandInner
            cover-scales the composition inside it. */}
        <div className={s.band} aria-hidden="true">
          {/* The composition — the 1512×941 design frame, cover-scaled and centred
              in the .band crop window. Its own --pp-scale drives every layer so they
              scale together; the window crops the bowtie's flared tips. */}
          <div className={s.bandInner}>
            {/* Blue bowtie shape (extends well past the frame; tips cropped by .band). */}
            <img className={s.bandBlue} src="/images/referrals/band-blue.webp" alt="" />

            {/* The live advisor spiral at the waist. */}
            <ReferralsSpiral styles={s} />

            {/* Cloud wisps — the fluffy texture revealed through the sky-shaped mask,
                two instances, clipped to the band shape via .clouds. */}
            <div className={s.clouds}>
              <img className={`${s.cloud} ${s.cloudA}`} src="/images/referrals/cloud-tex.webp" alt="" />
              <img className={`${s.cloud} ${s.cloudB}`} src="/images/referrals/cloud-tex.webp" alt="" />
            </div>

            {/* Bone hairlines tracing the band's curved top + bottom edges. */}
            <img className={s.hairTop} src="/images/referrals/hair-top.svg" alt="" />
            <img className={s.hairBot} src="/images/referrals/hair-bot.svg" alt="" />
          </div>
        </div>

        <SplitText as="h1" className={s.clients} words={clientsWords} />

        {/* "For your firm." + body + CTA are ONE left-aligned block at the gutter
            (a deliberate desktop deviation from the artboard, which split the firm
            headline left and the body/CTA lower-centre). The reveal hook targets
            by class, so re-nesting firm here is animation-safe. */}
        <div className={s.foot}>
          <SplitText as="h2" className={s.firm} words={firmWords} />
          <p className={s.body}>{body}</p>
          <div className={s.cta}>
            <PpButton href={cta.href} label={cta.label} />
          </div>
        </div>
      </div>
    </main>
  );
}
