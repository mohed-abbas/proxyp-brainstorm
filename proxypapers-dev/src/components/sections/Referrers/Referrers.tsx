"use client";

import { useRef } from "react";
import s from "./Referrers.module.css";
import referrers from "@/data/en/referrers.json";
import { SplitText } from "@/components/shared/SplitText";
import { PpMark } from "@/components/shared/PpMark";
import { useReferrers } from "@/lib/animations/useReferrers";

const ringAvatars = (ring: string) =>
  referrers.advisors.filter((a) => a.ring === ring);

export function Referrers() {
  const root = useRef<HTMLElement>(null);
  useReferrers(root, s);

  return (
    <section
      className={s.referrers}
      aria-label="For advisors who refer high-net-worth clients"
      data-nav-theme="dark"
      ref={root}
    >
      <div className={s.content}>
        <SplitText
          as="h2"
          className={s.title}
          words={referrers.title.split(" ")}
        />

        <div className={s.orbit} aria-hidden="true">
          <div className={s.field}>
            <svg
              className={s.rings}
              viewBox="0 0 494 494"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="247" cy="247" r="116" />
              <circle cx="247" cy="247" r="185" />
              <circle className={s.ringOuter} cx="247" cy="247" r="246" />
            </svg>

            {(["inner", "middle"] as const).map((ring) => (
              <div
                key={ring}
                className={s.orbitLayer}
                data-ring={ring}
              >
                {ringAvatars(ring).map((a) => (
                  <span
                    key={a.id}
                    className={s.avatar}
                    data-avatar={a.id}
                  >
                    <img src={a.img} alt="" />
                  </span>
                ))}
              </div>
            ))}

            <span className={s.mark}>
              <PpMark />
            </span>
          </div>
        </div>

        <div className={s.foot}>
          <SplitText
            as="p"
            className={s.body}
            words={referrers.body.split(" ")}
          />
          <a className={s.cta} href={referrers.cta.href}>
            <span className={s.ctaRoll}>
              <span className={s.ctaMain}>{referrers.cta.label}</span>
              <span className={s.ctaClone} aria-hidden="true">
                {referrers.cta.label}
              </span>
            </span>
          </a>
        </div>
      </div>
    </section>
  );
}
