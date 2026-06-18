"use client";

import { useRef } from "react";
import s from "./TooMuch.module.css";
import toomuch from "@/data/en/toomuch.json";
import { SplitText } from "@/components/shared/SplitText";
import { useTooMuch } from "@/lib/animations/useTooMuch";

// TooMuch — the referrals page's first mid-page statement (Figma 123:358). A short
// Bone White band under the hero: a centred 748px column with a fully Proxy-Blue
// headline ("the brand at full presence") over a muted-ink reality check. The
// headline rises word-by-word and the copy settles in on scroll (see useTooMuch).
export function TooMuch() {
  const root = useRef<HTMLElement>(null);
  useTooMuch(root, s);

  return (
    <section
      className={s.tooMuch}
      aria-label="The cost of retrieving information"
      data-nav-theme="light"
      ref={root}
    >
      <div className={s.content}>
        <SplitText
          as="h2"
          className={s.headline}
          words={toomuch.headline.split(" ")}
        />
        <SplitText
          as="p"
          className={s.body}
          words={toomuch.body.split(" ")}
        />
      </div>
    </section>
  );
}
