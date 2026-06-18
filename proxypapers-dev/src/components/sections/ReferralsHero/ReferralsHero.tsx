"use client";

import { useRef } from "react";
import s from "./ReferralsHero.module.css";
import content from "@/data/en/referrals.json";
import { SplitText, type SplitWord } from "@/components/shared/SplitText";
import { PpButton } from "@/components/shared/PpButton";
import { useReferralsHero } from "@/lib/animations/useReferralsHero";

// Referrals hero — ported from Figma (node 421:8). A Chinese-Black canvas split by
// a Proxy-Blue "bowtie" band that carries the advisor network (avatars on solid +
// dashed concentric arcs around a central P-mark node). For this layout pass the
// band is the exact Figma export (blue + clouds + arcs + avatars + P-node baked
// into one asset); the animation pass decomposes it into real, parallaxable layers
// (masked sky, inline-SVG arcs, <img> avatars, PpMark node).
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
        <img
          className={s.band}
          src="/images/referrals/band.webp"
          alt=""
          aria-hidden="true"
        />

        <SplitText as="h1" className={s.clients} words={clientsWords} />
        <SplitText as="h2" className={s.firm} words={firmWords} />

        <div className={s.foot}>
          <p className={s.body}>{body}</p>
          <div className={s.cta}>
            <PpButton href={cta.href} label={cta.label} />
          </div>
        </div>
      </div>
    </main>
  );
}
