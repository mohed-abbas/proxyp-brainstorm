"use client";

import { useRef } from "react";
import s from "./Sliders.module.css";
import sliders from "@/data/en/sliders.json";
import { SplitText } from "@/components/shared/SplitText";
import { useSliders } from "@/lib/animations/useSliders";

// Sliders — "What Proxy Papers brings you" (Figma 141:480). A full-viewport dark
// section that PINS on entry: each scroll step advances one benefit — the card photo
// swaps and the card title + right-hand body change with it — while the tilted frame
// stays put and the left label stays fixed (see useSliders). Below 1024 (and for
// reduced motion / no-JS) it degrades to a settled vertical gallery of every slide.
export function Sliders() {
  const root = useRef<HTMLElement>(null);
  useSliders(root, s);

  return (
    <section
      className={s.sliders}
      aria-label={sliders.label}
      data-nav-theme="dark"
      ref={root}
    >
      <div className={s.frame}>
        <div className={s.row}>
          <SplitText as="p" className={s.label} words={sliders.label.split(" ")} />

          <div className={s.deck}>
            {sliders.cards.map((card) => (
              <div className={s.slide} key={card.id} data-slide={card.id}>
                <div className={s.stage}>
                  <div className={s.cardTilt}>
                    <article className={s.card}>
                      <img
                        className={s.cardImg}
                        src={card.img}
                        alt=""
                        style={{ objectPosition: card.imgPos ?? "50% 50%" }}
                      />
                      <span className={s.cardOverlay} aria-hidden="true" />
                      <div className={s.cardLabel}>
                        <div className={s.cardTitleTilt}>
                          <SplitText
                            as="p"
                            className={s.cardTitle}
                            words={card.title.split(" ")}
                          />
                        </div>
                      </div>
                    </article>
                  </div>
                </div>

                <SplitText
                  as="p"
                  className={s.body}
                  words={card.body.split(" ")}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
