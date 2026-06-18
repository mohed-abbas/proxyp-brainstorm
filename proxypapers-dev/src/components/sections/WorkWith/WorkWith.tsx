"use client";

import { useRef } from "react";
import s from "./WorkWith.module.css";
import content from "@/data/en/work-with.json";
import { SplitText } from "@/components/shared/SplitText";
import { useWorkWith } from "@/lib/animations/useWorkWith";

// WorkWith — "The profiles we work with." (Figma 162:3, "PRofile Work With"). A
// full-bleed Chinese-Black band: a small caption on the left and a column of referrer
// professions on the right (iventions' "worked" mechanic). On native scroll the caption is
// sticky on a focus line and the list scrolls past it — whichever profession reaches that
// line, level with the caption, lights Proxy Blue. Below 1024 it stacks and the highlight
// tracks the viewport centre. DARK surface. See useWorkWith.
export function WorkWith() {
  const root = useRef<HTMLElement>(null);
  useWorkWith(root, s);

  return (
    <section
      className={s.workWith}
      aria-label="The profiles we work with"
      data-nav-theme="dark"
      ref={root}
    >
      <div className={s.content}>
        <SplitText as="p" className={s.label} words={content.label.split(" ")} />

        <ul className={s.list}>
          {content.profiles.map((profile, i) => (
            <li
              className={s.item}
              key={i}
              data-active={profile.accent ? "true" : undefined}
            >
              <SplitText words={[profile.text]} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
