"use client";

import { useRef } from "react";
import s from "./StepSection.module.css";
import { useContent } from "@/lib/i18n/LocaleProvider";
import { SplitText } from "@/components/shared/SplitText";
import { useStepSlider } from "@/lib/animations/useStepSlider";
import { useStepsHeader } from "@/lib/animations/useStepsHeader";

// StepSection — ported 1:1 from Figma (node 142:307, 1512×1012). The expanded method:
// a full-width Proxy-Blue panel with the shared "Five steps, one single contact."
// header, the two pre-engagement cards (discovery meeting · onboarding audit), a
// "then the engagement begins" connector, and the five numbered steps on a Bone card.
//
// On desktop the steps are a scroll-driven slider (the section pins and each step
// rises into place as you scroll — see useStepSlider); on mobile / reduced-motion /
// no-JS the five steps render as a stacked list. Lengths are literal artboard
// px * var(--pp-scale).
export function StepSection() {
  const content = useContent("approach");
  const { heading, lede, engagement, connector, total, items } = content.steps;
  const root = useRef<HTMLElement>(null);
  useStepSlider(root, s);
  useStepsHeader(root, s);

  return (
    <section
      className={s.steps}
      data-nav-theme="blue"
      aria-label="The five-step method"
      ref={root}
    >
      <div className={s.frame}>
        <div className={s.content}>
          <header className={s.head}>
            <h2 className={s.heading}>
              <SplitText words={heading.lead.trim().split(" ")} />{" "}
              <SplitText className={s.headingMuted} words={heading.muted.trim().split(" ")} />
            </h2>
            <SplitText as="p" className={s.lede} words={lede.split(" ")} />
          </header>

          <div className={s.body}>
            {/* The two pre-engagement cards (node 142:408). */}
            <ul className={s.engCards}>
              {engagement.map((card) => (
                <li key={card.title} className={s.engCard}>
                  <div className={s.engInner}>
                    <div className={s.engRow}>
                      <p className={s.engTitle}>{card.title}</p>
                      <span
                        className={`${s.pill} ${
                          card.pill.variant === "filled" ? s.pillFilled : s.pillOutline
                        }`}
                      >
                        {card.pill.label}
                      </span>
                    </div>
                    <p className={s.engDesc}>{card.desc}</p>
                  </div>
                </li>
              ))}
            </ul>

            {/* Connector (node 142:430) — two hairline rules around a lowercase label. */}
            <div className={s.connector} aria-hidden="true">
              <span className={`${s.connectorRule} ${s.connectorRuleTop}`} />
              <span className={s.connectorLabel}>{connector}</span>
              <span className={`${s.connectorRule} ${s.connectorRuleBottom}`} />
            </div>

            {/* The numbered steps (node 142:418) — a slider on desktop, a list otherwise. */}
            <div className={s.stepGroup}>
              <div className={s.stepCard}>
                <div className={s.stepViewport}>
                  {items.map((step) => (
                    <article key={step.num} className={s.stepSlide}>
                      <div className={s.stepLead}>
                        <span className={s.stepNum}>{step.num}</span>
                        <h3 className={s.stepName}>{step.name}</h3>
                      </div>
                      <p className={s.stepDesc}>{step.desc}</p>
                    </article>
                  ))}
                </div>
              </div>

              <div
                className={s.dots}
                role="tablist"
                aria-label={`Five steps (${total})`}
              >
                {Array.from({ length: total }, (_, i) => (
                  <span
                    key={i}
                    className={`${s.dot} ${i === 0 ? s.dotActive : ""}`}
                    aria-hidden="true"
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
