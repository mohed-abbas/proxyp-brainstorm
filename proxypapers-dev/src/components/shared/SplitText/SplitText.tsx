import { Fragment, type ElementType } from "react";

export type SplitWord = string | { text: string; className?: string };

type SplitTextProps = {
  as?: ElementType;
  words: SplitWord[];
  className?: string;
};

// Renders text word-by-word, each word wrapped in the global reveal-mask
// primitive (.r-word clips, .r-word__in rises). Pre-rendered at SSR so there is
// no runtime DOM splitting and no flash; a section's GSAP timeline targets
// `.r-word__in` within its scope. A word can carry an extra class (e.g. an accent).
export function SplitText({ as: As = "span", words, className }: SplitTextProps) {
  return (
    <As className={className}>
      {words.map((word, i) => {
        const text = typeof word === "string" ? word : word.text;
        const extra =
          typeof word === "object" && word.className ? ` ${word.className}` : "";
        return (
          <Fragment key={i}>
            <span className="r-word">
              <span className={`r-word__in${extra}`}>{text}</span>
            </span>
            {i < words.length - 1 ? " " : null}
          </Fragment>
        );
      })}
    </As>
  );
}
