"use client";

import { useRef } from "react";
import s from "./MarkReveal.module.css";
import content from "@/data/en/mark-reveal.json";
import { SplitText } from "@/components/shared/SplitText";
import { useMarkReveal } from "@/lib/animations/useMarkReveal";

// MarkReveal — the /approach "Pioneer since 2016" history section (Figma 634:209
// "MapSection", with the separated initial state from 634:343). The P-mark is shown
// PULLED APART (bone stem low-left, Proxy-Blue blade high-right); on scroll the section
// pins, the blade slides into the fixed stem to ASSEMBLE the logo, then the rest of the
// composition reveals: the 2016/2026 years on the blade joined by a dashed down-arrow,
// the "Pioneer since 2016. Relevant today." headline, and a two-step timeline on the
// right linked by a dashed snake connector with Proxy-Blue end dots.
//
// Geometry is expressed in the 1512×982 artboard so the stem sits at the SAME place in
// both states (only the blade moves, by −731/−59 design-px). Lengths ride --mark-u, a
// contain-fit unit (min of vw/vh ratios) so the whole scene fits the viewport on both
// axes. Copy reveals with the site-wide per-word slide-up mask (SplitText → .r-word);
// the dashed connectors DRAW on (mask wipe), they don't fade. See useMarkReveal.

// StemVector (node 634:346 / 634:212) — bone-white lower-left half of the P. Fixed.
function StemHalf() {
  return (
    <svg
      className={s.halfSvg}
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

// AngleVector (node 634:347 / 634:211) — Proxy-Blue upper-right half. Slides in.
function AngleHalf() {
  return (
    <svg
      className={s.halfSvg}
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

// Vector 33 (node 634:216) — dashed curve + arrowhead from 2016 down to 2026. Drawn on
// via a rect mask that grows top→bottom (the path is monotonic in Y). Authored revealed
// so no-JS / reduced motion shows the full arrow; the hook collapses + grows it.
function DownArrow() {
  return (
    <svg
      className={s.arrowSvg}
      viewBox="0 0 187 259"
      fill="none"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <mask id="mr-arrow-mask" maskUnits="userSpaceOnUse">
          <rect
            className={s.arrowMask}
            x="0"
            y="0"
            width="187"
            height="259"
            fill="#fff"
          />
        </mask>
      </defs>
      <path
        mask="url(#mr-arrow-mask)"
        d="M173.939 258.561C174.525 259.146 175.475 259.146 176.061 258.561L185.607 249.015C186.192 248.429 186.192 247.479 185.607 246.893C185.021 246.308 184.071 246.308 183.485 246.893L175 255.379L166.515 246.893C165.929 246.308 164.979 246.308 164.393 246.893C163.808 247.479 163.808 248.429 164.393 249.015L173.939 258.561ZM0 1.5V3H9.375V1.5V0H0V1.5ZM28.125 1.5V3H46.875V1.5V0H28.125V1.5ZM65.625 1.5V3H75V1.5V0H65.625V1.5ZM75 1.5V3C78.2599 3 81.4824 3.15831 84.6602 3.46758L84.8055 1.97463L84.9508 0.481686C81.6765 0.163031 78.3571 0 75 0V1.5ZM104.038 5.78132L103.603 7.21688C109.832 9.10398 115.8 11.5915 121.44 14.6124L122.148 13.2901L122.856 11.9678C117.044 8.85472 110.893 6.29085 104.473 4.34576L104.038 5.78132ZM138.44 24.196L137.488 25.355C142.473 29.4509 147.049 34.0268 151.145 39.0119L152.304 38.0597L153.463 37.1074C149.243 31.9713 144.529 27.2569 139.393 23.037L138.44 24.196ZM163.21 54.3519L161.888 55.0602C164.908 60.7001 167.396 66.668 169.283 72.8966L170.719 72.4617L172.154 72.0267C170.209 65.6067 167.645 59.4559 164.532 53.6437L163.21 54.3519ZM174.525 91.6945L173.032 91.8398C173.342 95.0176 173.5 98.2401 173.5 101.5H175H176.5C176.5 98.1429 176.337 94.8235 176.018 91.5492L174.525 91.6945ZM175 101.5H173.5V111.25H175H176.5V101.5H175ZM175 130.75H173.5V150.25H175H176.5V130.75H175ZM175 169.75H173.5V189.25H175H176.5V169.75H175ZM175 208.75H173.5V228.25H175H176.5V208.75H175ZM175 247.75H173.5V257.5H175H176.5V247.75H175Z"
        fill="var(--pp-bone)"
      />
    </svg>
  );
}

// Vector 34 (node 634:226) — dashed snake connector linking the two timeline steps.
// Drawn on via a normalized stroke mask (pathLength 1, dashoffset 1→0) so the 18/18
// dashes appear progressively along the curve. Authored revealed for no-JS fallback.
function SnakeLine() {
  const d =
    "M65 1.5C29.9299 1.5 1.5 29.9299 1.5 65V87.75C1.5 135.385 40.1154 174 87.75 174H374.5C432.766 174 480 221.234 480 279.5C480 337.766 432.766 385 374.5 385H353.5";
  return (
    <svg
      className={s.snakeSvg}
      viewBox="0 0 482 387"
      fill="none"
      preserveAspectRatio="none"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <mask id="mr-snake-mask" maskUnits="userSpaceOnUse">
          <path
            className={s.snakeMask}
            d={d}
            fill="none"
            stroke="#fff"
            strokeWidth="8"
            pathLength={1}
            strokeDasharray="1 1"
            strokeDashoffset={0}
          />
        </mask>
      </defs>
      <path
        mask="url(#mr-snake-mask)"
        d={d}
        stroke="var(--pp-bone)"
        strokeWidth="3"
        strokeDasharray="18 18"
      />
    </svg>
  );
}

export function MarkReveal() {
  const scope = useRef<HTMLElement>(null);
  useMarkReveal(scope, s);

  const { years, headline, timeline } = content;

  return (
    <section
      ref={scope}
      className={s.section}
      data-nav-theme="dark"
      aria-label={content.ariaLabel}
    >
      <div className={s.frame}>
        {/* P-mark — blade renders first so the fixed bone stem sits on top in the
            overlap, matching the assembled lockup. */}
        <div className={s.mark} aria-hidden="true">
          <span className={s.angle}>
            <AngleHalf />
          </span>
          <span className={s.stem}>
            <StemHalf />
          </span>
        </div>

        {/* Years on the blade, joined by the dashed down-arrow. */}
        <SplitText
          as="p"
          className={`${s.year} ${s.yearStart}`}
          words={[years.start]}
        />
        <SplitText
          as="p"
          className={`${s.year} ${s.yearEnd}`}
          words={[years.end]}
        />
        <span className={s.arrow} aria-hidden="true">
          <DownArrow />
        </span>

        {/* Headline, anchored bottom-centre over the ground. */}
        <SplitText
          as="h2"
          className={s.headline}
          words={headline.split(" ")}
        />

        {/* Right-side timeline: two steps linked by the dashed snake + blue end dots. */}
        <div className={s.timeline}>
          <span className={s.snake} aria-hidden="true">
            <SnakeLine />
          </span>
          <span className={`${s.dot} ${s.dotStart}`} aria-hidden="true" />
          <span className={`${s.dot} ${s.dotEnd}`} aria-hidden="true" />

          {timeline.map((step, i) => (
            <div
              key={step.label}
              className={`${s.entry} ${i === 0 ? s.entryTop : s.entryBottom}`}
            >
              <SplitText
                as="p"
                className={s.entryLabel}
                words={step.label.split(" ")}
              />
              <SplitText
                as="p"
                className={s.entryBody}
                words={step.body.split(" ")}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
