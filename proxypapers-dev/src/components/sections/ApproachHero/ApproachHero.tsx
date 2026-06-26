"use client";

import { useRef } from "react";
import s from "./ApproachHero.module.css";
import { useContent } from "@/lib/i18n/LocaleProvider";
import { SplitText, type SplitWord } from "@/components/shared/SplitText";
import { useApproachHero } from "@/lib/animations/useApproachHero";

// Approach hero — ported from Figma (node 634:6). A Chinese-Black canvas carrying the
// Proxy-Blue "sky river" band (the same band family as ReferralsHero, here un-mirrored):
// a full-bleed blue shape pinched at the waist, fluffy-cloud wisps revealed through a
// sky mask, two bone hairlines tracing its edges, and a dashed flight-path with three
// drifting file marks at the waist. The split headline sits in the dark shoulders; the
// lede anchors bottom-left. Band layers are live (not a baked crop) inside a cover-
// cropped window, so the wide river fills the hero and crops like Figma — see the CSS.
export function ApproachHero() {
  const content = useContent("approach");
  const root = useRef<HTMLElement>(null);
  useApproachHero(root, s);

  const { headline, lede } = content.hero;

  // "A method," — the turn word ("method,") carries the Proxy-Blue accent.
  const line1Words: SplitWord[] = [
    headline.lead,
    { text: headline.accent, className: s.accent },
  ];
  const line2Words: SplitWord[] = headline.tail.split(" ");

  return (
    <section
      className={s.hero}
      data-nav-theme="dark"
      aria-label="Our approach"
      ref={root}
    >
      <div className={s.frame}>
        {/* Band layers, ordered bottom→top per Figma: blue → masked clouds → hairlines
            → dashed path → file marks. The .band window covers the full hero (100vw ×
            100svh, centred); .bandInner cover-scales the composition inside it. */}
        <div className={s.band} aria-hidden="true">
          <div className={s.bandInner}>
            <img className={s.bandBlue} src="/images/referrals/band-blue.webp" alt="" />

            <div className={s.clouds}>
              <img className={`${s.cloud} ${s.cloudA}`} src="/images/referrals/cloud-tex.webp" alt="" />
              <img className={`${s.cloud} ${s.cloudB}`} src="/images/referrals/cloud-tex.webp" alt="" />
            </div>

            <img className={s.hairTop} src="/images/referrals/hair-top.svg" alt="" />
            <img className={s.hairBot} src="/images/referrals/hair-bot.svg" alt="" />

            <img className={s.dashed} src="/images/approach/dashed.svg" alt="" />

            {/* Three glassy file marks (Figma nodes 634:24/28/26) — the exact exported
                SVGs (translucent gradient fill + vertically-fading stroke). */}
            <div className={s.marks}>
              <img className={`${s.mark} ${s.mark1}`} src="/images/approach/mark-1.svg" alt="" />
              <img className={`${s.mark} ${s.mark2}`} src="/images/approach/mark-2.svg" alt="" />
              <img className={`${s.mark} ${s.mark3}`} src="/images/approach/mark-3.svg" alt="" />
            </div>
          </div>
        </div>

        <SplitText as="h1" className={s.line1} words={line1Words} />
        <SplitText as="p" className={s.line2} words={line2Words} />
        <p className={s.lede}>{lede}</p>
      </div>
    </section>
  );
}
