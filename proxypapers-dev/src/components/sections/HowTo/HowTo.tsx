"use client";

import { useRef, type CSSProperties } from "react";
import s from "./HowTo.module.css";
import data from "@/data/en/how-to.json";
import { useHowTo } from "@/lib/animations/useHowTo";

type Step = (typeof data.steps)[number];
type Cloud = (typeof data.clouds)[number];

// One step card (Figma nodes 160:967 / 160:972 / 160:976, 670×194). Absolutely placed in
// the stage from its design-pixel position; carries the step eyebrow, title, body and an
// optional pill (outline "Free — 1H" on Step 1, filled "Billed" on Step 2). The blue
// variant reads in bone; the light variant carries blue copy on a bone ground.
function StepCard({ step }: { step: Step }) {
  const pill = "pill" in step ? step.pill : undefined;
  return (
    <article
      className={s.card}
      data-step={step.id}
      data-theme={step.theme}
      style={
        {
          "--cx": step.pos.x,
          "--cy": step.pos.y,
          "--cz": step.pos.z,
        } as CSSProperties
      }
    >
      <div
        className={s.copy}
        style={{ "--cw": step.copyWidth } as CSSProperties}
      >
        <span className={s.eyebrow}>{step.eyebrow}</span>
        <h3 className={s.title}>{step.title}</h3>
        <p className={s.body}>{step.body}</p>
      </div>

      {pill && (
        <span
          className={s.pill}
          data-variant={pill.variant}
          style={{ "--px": pill.x, "--py": pill.y } as CSSProperties}
        >
          {pill.label}
        </span>
      )}
    </article>
  );
}

// Decorative fluffy-cloud tile (Figma nodes 160:1001 / 160:1008) — a rounded sky photo
// filling the staircase's negative space (top-right + bottom-left). One is flipped so the
// two don't read as identical; a faint grain pass keeps the blue from going flat.
function CloudTile({ cloud }: { cloud: Cloud }) {
  return (
    <div
      className={s.cloud}
      data-cloud={cloud.id}
      data-flip={cloud.flip || undefined}
      aria-hidden="true"
      style={
        {
          "--cx": cloud.x,
          "--cy": cloud.y,
          "--cw": cloud.w,
          "--ch": cloud.h,
        } as CSSProperties
      }
    >
      <img className={s.cloudImg} src="/images/clouds.webp" alt="" />
      <span className={s.grain} />
    </div>
  );
}

// "How to begin." — the three-step onboarding path (Figma node 160:1015). A heading above
// a diagonal staircase of step cards (discovery → audit → engagement), with two cloud
// tiles filling the gaps and the bone "audit" card floating over them at the centre.
// Sits on the Chinese-Black ground; full-bleed up to the 1512 artboard, scaling below.
export function HowTo() {
  const root = useRef<HTMLElement>(null);
  useHowTo(root, s);

  return (
    <section className={s.how} aria-labelledby="how-to-heading" data-nav-theme="dark" ref={root}>
      <div className={s.inner}>
        <h2 id="how-to-heading" className={s.heading}>
          {data.heading}
        </h2>

        <div
          className={s.stage}
          style={{ "--sw": data.stage.w, "--sh": data.stage.h } as CSSProperties}
        >
          {data.clouds.map((c) => (
            <CloudTile key={c.id} cloud={c} />
          ))}
          {data.steps.map((step) => (
            <StepCard key={step.id} step={step} />
          ))}
        </div>
      </div>
    </section>
  );
}
