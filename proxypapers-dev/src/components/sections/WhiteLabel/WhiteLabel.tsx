"use client";

import { useRef } from "react";
import s from "./WhiteLabel.module.css";
import content from "@/data/en/white-label.json";
import { SplitText } from "@/components/shared/SplitText";
import { PpMark } from "@/components/shared/PpMark";
import { useWhiteLabel } from "@/lib/animations/useWhiteLabel";

// WhiteLabel — "A white-label option for firms that need it." (Figma compact 144:2 →
// expanded 123:58). A Bone-White band that PINS compact (eyebrow + a large centred
// P-badge) and, on a heavy-scrubbed scroll, opens into the full band: a Proxy-Blue
// title (left), muted body (right), and a centred radar — the P-badge shrinks up to the
// top, a connector draws up from the spiral, and concentric dashed/solid rings ring a YOU
// core. The reveal mechanic is the Trust section's (see useWhiteLabel). LIGHT surface.
// Below 1024 / reduced motion it renders the settled open band (mobile reflows to a stack).
export function WhiteLabel() {
  const root = useRef<HTMLElement>(null);
  useWhiteLabel(root, s);

  return (
    <section
      className={s.whiteLabel}
      aria-label="A white-label option for firms"
      data-nav-theme="light"
      ref={root}
    >
      <div className={s.panel}>
        {/* The 1512 artboard frame, centred in the panel; children sit at Figma coords. */}
        <div className={s.stage}>
          <p className={s.eyebrow} aria-hidden="true">
            {content.eyebrow}
          </p>

          <SplitText as="h2" className={s.title} words={content.title.split(" ")} />
          <SplitText as="p" className={s.body} words={content.body.split(" ")} />

          {/* Radar graphic — P-badge, a connector, and concentric rings around the YOU core. */}
          <div className={s.graphic} aria-hidden="true">
            <span className={s.badge}>
              <PpMark className={s.mark} />
            </span>
            <span className={s.line} />
            <div className={s.rings}>
              <span className={`${s.ring} ${s.r1}`} />
              <span className={`${s.ring} ${s.r2}`} />
              <span className={`${s.ring} ${s.r3}`} />
              <span className={s.core}>
                <span className={s.coreLabel}>{content.core}</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
