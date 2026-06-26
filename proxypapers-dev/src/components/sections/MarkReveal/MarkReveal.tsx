"use client";

import { useRef } from "react";
import s from "./MarkReveal.module.css";

// MarkReveal — the /approach P-mark section (Figma 634:343, "SeparatedVector").
// The P-mark is shown PULLED APART on the Chinese-Black ground: the bone-white
// stem (StemVector, node 634:346) sits low-left, the Proxy-Blue blade (AngleVector,
// node 634:347) sits high-right, with a gap between them. This is the INITIAL state;
// the assemble-on-scroll choreography to the locked mark is added next.
//
// Each half is its own inline SVG, absolutely placed inside the 1362×626 vector box
// (centred in the 1512×982 artboard via flex — which reproduces the exact Figma
// offsets left 75 / top 178). Lengths ride a local --mark-u unit (= --pp-scale on
// desktop, viewport-relative below 1024) so the whole mark scales as one piece.

// StemVector (node 634:346) — bone-white lower-left half of the P.
function StemHalf() {
  return (
    <svg
      className={s.stemSvg}
      viewBox="0 0 315 626"
      fill="none"
      preserveAspectRatio="none"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M315 0V600.987C315 614.836 303.681 626 289.827 626H50.4304C22.5543 626 0 603.589 0 575.89V333.732C0 320.47 5.3218 307.712 14.7828 298.311L315 0Z"
        fill="var(--pp-bone)"
      />
    </svg>
  );
}

// AngleVector (node 634:347) — Proxy-Blue upper-right half of the P.
function AngleHalf() {
  return (
    <svg
      className={s.angleSvg}
      viewBox="0 0 631 625"
      fill="none"
      preserveAspectRatio="none"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M631 174.98V574.97C631 602.625 608.41 625 580.49 625H315.415V312.5H50.5105C22.5901 312.5 0 290.125 0 262.47V50.0302C0 22.3753 22.5901 0 50.5105 0H454.34C551.892 0 631 78.3555 631 174.98Z"
        fill="var(--pp-blue)"
      />
    </svg>
  );
}

export function MarkReveal() {
  const scope = useRef<HTMLElement>(null);

  return (
    <section
      ref={scope}
      className={s.section}
      data-nav-theme="dark"
      aria-label="The Proxy Papers mark"
    >
      <div className={s.markFrame} aria-hidden="true">
        <span className={s.stem}>
          <StemHalf />
        </span>
        <span className={s.angle}>
          <AngleHalf />
        </span>
      </div>
    </section>
  );
}
