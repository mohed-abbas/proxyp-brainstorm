type FoldMarkProps = {
  className?: string;
  label?: string;
};

// Proxy Papers P-mark, split into THREE hinged panels for the page-transition
// origami fold. Same geometry/viewBox as PpMark, but the single `blade` path is
// divided at the x=18.23 seam into `bar` (the top-left square) and `bowl` (the
// right loop — "the D"), with `stem` (the diagonal leg) kept whole. Each panel
// carries data-fold so the transition can rotate it about its own crease:
//   • stem → crease A (45° diagonal, stem folds up into the bowl)
//   • bowl → crease B (vertical x=18.23, the D folds left onto the bar)
//   • bar  → crease C (horizontal y=18.18, the bar tips down to the seam)
// Reassembled (bar + bowl) the silhouette is identical to PpMark. Shared PpMark
// is deliberately left untouched — this variant exists only to be folded.
export function FoldMark({ className, label }: FoldMarkProps) {
  const a11y = label
    ? { role: "img", "aria-label": label }
    : { "aria-hidden": true as const };
  return (
    <svg
      className={className}
      viewBox="0 0 36.4699 54.5578"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...a11y}
    >
      {/* BAR — top-left square (x 0–18.23, y 0–18.18), rounded top-left corner. */}
      <path
        className="fm-bar"
        data-fold="bar"
        d="M18.2301 0H2.91935C1.30564 0 0 1.30213 0 2.91151V15.2744C0 16.8838 1.30564 18.1859 2.91935 18.1859H18.2301V0Z"
      />
      {/* BOWL — the right loop "D" (x 18.23–36.47, y 0–36.37). */}
      <path
        className="fm-bowl"
        data-fold="bowl"
        d="M18.2301 0H26.2595C31.8977 0 36.4699 4.5599 36.4699 10.183V33.4604C36.4699 35.0697 35.1643 36.3719 33.5505 36.3719H18.2301V0Z"
      />
      {/* STEM — the diagonal leg (unchanged from PpMark). */}
      <path
        className="fm-stem"
        data-fold="stem"
        d="M18.2349 18.1859V53.1045C18.2349 53.9092 17.5797 54.5578 16.7777 54.5578H2.91935C1.30564 54.5578 0 53.2557 0 51.6463V37.5764C0 36.8059 0.308072 36.0646 0.855756 35.5184L18.2349 18.1859Z"
      />
    </svg>
  );
}
