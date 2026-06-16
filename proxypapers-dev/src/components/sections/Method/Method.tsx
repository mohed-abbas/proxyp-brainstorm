"use client";

import { useRef } from "react";
import s from "./Method.module.css";
import method from "@/data/en/method.json";
import { SplitText } from "@/components/shared/SplitText";
import { useMethod } from "@/lib/animations/useMethod";

export function Method() {
  const root = useRef<HTMLElement>(null);
  useMethod(root, s);

  return (
    <section
      className={s.method}
      aria-label="The five-step method"
      data-nav-theme="blue"
      ref={root}
    >
      <div className={s.frame}>
        <div className={s.content}>
          <header className={s.head}>
            <h2 className={s.title}>
              <SplitText
                as="span"
                className={s.titleSeg}
                words={method.title.segs[0].split(" ")}
              />{" "}
              <SplitText
                as="span"
                className={`${s.titleSeg} ${s.titleSegMuted}`}
                words={method.title.segs[1].split(" ")}
              />
            </h2>
            <SplitText as="p" className={s.lede} words={method.lede.split(" ")} />
          </header>

          <ol className={s.steps}>
            {method.steps.map((step) => (
              <li key={step.num} className={s.step}>
                <span className={s.stepNum}>{step.num}</span>
                <div className={s.stepRow}>
                  <h3 className={s.stepName}>{step.name}</h3>
                  <p className={s.stepDesc}>{step.desc}</p>
                </div>
              </li>
            ))}
          </ol>

          <a className={s.link} href={method.link.href}>
            <span className={s.linkRoll}>
              <span className={s.linkMain}>{method.link.label}</span>
              <span className={s.linkClone} aria-hidden="true">
                {method.link.label}
              </span>
            </span>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M5 12h14" />
              <path d="m12 5 7 7-7 7" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}
