"use client";

import { useRef } from "react";
import s from "./Hero.module.css";
import heroContent from "@/data/en/hero.json";
import { SplitText, type SplitWord } from "@/components/shared/SplitText";
import { useHeroIntro } from "@/lib/animations/useHeroIntro";
import { Conveyor } from "./Conveyor";

export function Hero() {
  const root = useRef<HTMLElement>(null);
  useHeroIntro(root, s);

  const titleWords: SplitWord[] = [
    ...heroContent.title.lead,
    { text: heroContent.title.accent, className: s.grad },
  ];

  return (
    <main className={s.hero} data-nav-theme="dark" ref={root}>
      <div className={s.frame}>
        {/* Horizon lens: blue bowtie + masked clouds + arc hairlines */}
        <div className={s.lens} aria-hidden="true">
          <img className={s.lensFill} src="/images/hero-lens.webp" alt="" />
          <div className={s.lensClouds}>
            <img
              className={`${s.cloud} ${s.cloudLeft}`}
              src="/images/clouds.webp"
              alt=""
            />
            <img
              className={`${s.cloud} ${s.cloudRight}`}
              src="/images/clouds.webp"
              alt=""
            />
          </div>
          <img className={`${s.arc} ${s.arcTop}`} src="/icons/hero-arc.svg" alt="" />
          <img
            className={`${s.arc} ${s.arcBottom}`}
            src="/icons/hero-arc.svg"
            alt=""
          />
        </div>

        <Conveyor documents={heroContent.documents} />

        {/* Centre axis + brand card */}
        <div className={s.axis} aria-hidden="true">
          <span className={s.axisLine} />
          <div className={s.axisCard} data-axis-card>
            <img src="/icons/pp-mark.svg" alt="" />
          </div>
        </div>

        {/* Headline block */}
        <header className={s.lead}>
          <SplitText as="h1" className={s.leadTitle} words={titleWords} />
          <p className={s.leadBody}>{heroContent.body}</p>
          <div className={s.leadCta}>
            <a className="pp-btn" href={heroContent.cta.primary.href}>
              {heroContent.cta.primary.label}
            </a>
            <a className={s.link} href={heroContent.cta.secondary.href}>
              {heroContent.cta.secondary.label}
            </a>
          </div>
        </header>

        {/* Positioning statement */}
        <p className={s.statement}>{heroContent.statement}</p>
      </div>
    </main>
  );
}
