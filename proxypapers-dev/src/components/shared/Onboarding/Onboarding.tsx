"use client";

import { useRef } from "react";
import { useOnboarding } from "@/lib/animations/useOnboarding";

// Welcome overlay — ported from the .ob-stage block in design-final/hero.html.
// Proxy Blue at full presence: grain, corner clouds, the watermark P, and the
// centred P-mark over a hairline loader. Styling + arming live in globals.css
// (global .ob-* classes the curtain controller queries). The wordmark is
// intentionally omitted here — only the mark + loader resolve on the welcome.
export function Onboarding() {
  const stage = useRef<HTMLDivElement>(null);
  useOnboarding(stage);

  return (
    <div className="ob-stage pp-theme-blue" ref={stage}>
      <div className="ob-grain" aria-hidden="true" />

      <div className="ob-watermark" aria-hidden="true">
        <img src="/icons/pp-watermark.svg" alt="" />
      </div>

      <div className="ob-cloud ob-cloud--left" aria-hidden="true">
        <img src="/images/clouds.webp" alt="" />
      </div>
      <div className="ob-cloud ob-cloud--top-right" aria-hidden="true">
        <img src="/images/clouds.webp" alt="" />
      </div>

      <div className="ob-brand" role="img" aria-label="Proxy Papers">
        <svg
          className="pp-lockup ob-lockup"
          viewBox="0 0 184.958 276.692"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g className="lk-mark">
            <path
              className="lk-mark__stem"
              d="M92.4791 92.2305V269.321C92.4791 273.402 89.1559 276.692 85.0887 276.692H14.8056C6.62159 276.692 0 270.088 0 261.926V190.57C0 186.662 1.5624 182.903 4.34 180.133L92.4791 92.2305Z"
            />
            <path
              className="lk-mark__blade"
              d="M184.958 51.6432V169.695C184.958 177.857 178.337 184.461 170.153 184.461H92.4543V92.2305H14.8056C6.62159 92.2305 0 85.6267 0 77.4647V14.7658C0 6.6038 6.62159 0 14.8056 0H133.176C161.77 0 184.958 23.1256 184.958 51.6432Z"
            />
          </g>
        </svg>

        <div className="ob-divider" aria-hidden="true">
          <span className="ob-divider__track" />
          <span className="ob-divider__fill" />
        </div>
      </div>
    </div>
  );
}
