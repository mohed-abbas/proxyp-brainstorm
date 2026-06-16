"use client";

import { useRef } from "react";
import s from "./Problem.module.css";
import problem from "@/data/en/problem.json";
import { SplitText } from "@/components/shared/SplitText";
import { Zigzag } from "./Zigzag";
import { useProblem } from "@/lib/animations/useProblem";

export function Problem() {
  const root = useRef<HTMLElement>(null);
  useProblem(root, s);

  return (
    <section
      className={s.problem}
      aria-label="The problem Proxy Papers solves"
      data-nav-theme="dark"
      ref={root}
    >
      <div className={s.content}>
        <p className={s.eyebrow}>
          <SplitText words={problem.eyebrow.split(" ")} />
          <span className={s.eyebrowRule} aria-hidden="true">
            <img src="/icons/problem-accent-underline.svg" alt="" />
          </span>
        </p>

        <SplitText
          as="h2"
          className={s.headline}
          words={problem.headline.split(" ")}
        />

        <SplitText
          as="p"
          className={s.body}
          words={problem.body.split(" ")}
        />

        <article className={`${s.card} ${s.cardVolume}`}>
          <p className={s.cardLabel}>{problem.cards[0].label}</p>
          <p className={s.cardCopy}>{problem.cards[0].copy}</p>
          <div className={s.volumeGraphic} aria-hidden="true">
            <div className={s.graphicInner}>
              <Zigzag className={s.zigzagPath} />
            </div>
          </div>
        </article>

        <article className={`${s.card} ${s.cardFriction}`}>
          <p className={s.cardLabel}>{problem.cards[1].label}</p>
          <p className={s.cardCopy}>{problem.cards[1].copy}</p>
          <div className={s.cardGraphic} aria-hidden="true">
            <div className={s.graphicInner}>
              <Zigzag className={s.zigzagPath} />
            </div>
          </div>
        </article>

        <article className={`${s.card} ${s.cardRisk}`}>
          <p className={s.cardLabel}>{problem.cards[2].label}</p>
          <p className={s.cardCopy}>{problem.cards[2].copy}</p>
          <div className={s.cardGraphic} aria-hidden="true">
            <div className={s.graphicInner}>
              <Zigzag className={s.zigzagPath} />
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}
