"use client";

import { useRef } from "react";
import s from "./Closing.module.css";
import closing from "@/data/en/closing.json";
import { SplitText } from "@/components/shared/SplitText";
import { useClosing } from "@/lib/animations/useClosing";

export function Closing() {
  const root = useRef<HTMLElement>(null);
  useClosing(root, s);

  return (
    <section
      className={s.closing}
      aria-label="Request a discovery meeting"
      data-nav-theme="light"
      ref={root}
    >
      <div className={s.inner}>
        <SplitText
          as="h2"
          className={s.title}
          words={closing.title.split(" ")}
        />
        <div className={s.action}>
          <a className={s.link} href={closing.link.href}>
            <span className={s.linkRoll}>
              <span className={s.linkMain}>{closing.link.label}</span>
              <span className={s.linkClone} aria-hidden="true">
                {closing.link.label}
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
          <SplitText
            as="p"
            className={s.body}
            words={closing.body.split(" ")}
          />
        </div>
      </div>
    </section>
  );
}
