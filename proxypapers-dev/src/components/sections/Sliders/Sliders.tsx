"use client";

import { useRef } from "react";
import s from "./Sliders.module.css";
import sliders from "@/data/en/sliders.json";
import { SplitText } from "@/components/shared/SplitText";
import { useSliders } from "@/lib/animations/useSliders";

// Sliders — "What Proxy Papers brings you" (Figma 141:480, iventions-inspired motion).
// Full-viewport dark section that PINS, then a scrubbed timeline rolls the benefits
// continuously with scroll (iventions): the title, the frame photo, and the body advance
// in lockstep — title & body are gradient-masked vertical rollers (centre solid, neighbours
// ghosted), the photo cross-fades — gliding smoothly with the scroll. The fixed left label
// stays; the center card reads 3D and tilts subtly with the mouse. Below 1024 /
// reduced-motion / no-JS it degrades to a settled vertical gallery (title → card → body
// per slide). See useSliders.
export function Sliders() {
  const root = useRef<HTMLElement>(null);

  useSliders(root, s);

  // Fixed left label, with the brand name "Proxy Papers" carried in Proxy Blue (accent).
  const labelWords = sliders.label
    .split(" ")
    .map((w) => (w === "Proxy" || w === "Papers" ? { text: w, className: s.labelAccent } : w));

  return (
    <section
      className={s.sliders}
      aria-label={sliders.label}
      data-nav-theme="dark"
      ref={root}
    >
      <div className={s.frame}>
        <div className={s.row}>
          <SplitText as="p" className={s.label} words={labelWords} />

          <div className={s.deck}>
            {sliders.cards.map((card) => (
              <div className={s.slide} key={card.id} data-slide={card.id}>
                <div className={s.stage}>
                  {/* 3D layer (mouse tilt) → brand 11.35° tilt → the clipped photo card. */}
                  <div className={s.card3d}>
                    <div className={s.cardTilt}>
                      <article className={s.card}>
                        <img
                          className={s.cardImg}
                          src={card.img}
                          alt=""
                          style={{ objectPosition: card.imgPos ?? "50% 50%" }}
                        />
                        <span className={s.cardOverlay} aria-hidden="true" />
                      </article>
                    </div>
                  </div>

                  {/* Title — flat (upright) over the tilted card. In the pinned slider every
                      slide's title shares this centre; the hook offsets them into a vertical
                      roller (current on the card, previous ghosted above, next below) and
                      re-runs the house word-rise as each lands. */}
                  <div className={s.titleLayer}>
                    <SplitText as="p" className={s.cardTitle} words={card.title.split(" ")} />
                  </div>
                </div>

                <div className={s.bodyViewport}>
                  <SplitText
                    as="p"
                    className={s.body}
                    words={card.body.split(" ")}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
