import s from "./ApproachHero.module.css";
import content from "@/data/en/approach.json";

const { headline, lede } = content.hero;

// Approach hero — ported 1:1 from Figma (node 601:4, 1512×1122 artboard). A dark
// Chinese-Black ground carrying the signature "sky river": a cloud-textured Proxy-Blue
// band that sweeps diagonally across the canvas (hairline edges, a dashed flight path,
// three drifting document icons), bleeding off both sides. The band is a single
// pre-composited asset (Figma export of node 532:26) mapped exactly to the frame's
// x[0–1512]/y[0–977] region; the headline ("A method," / "not a promise") and the
// "Since 2016…" lede ride on top as live text, pinned to the artboard via --pp-scale.
export function ApproachHero() {
  return (
    <section className={s.hero} data-nav-theme="dark" aria-label="Our approach">
      <div className={s.frame}>
        {/* The sky-river composition — band + clouds + hairlines + dashed path +
            document icons, baked into one image. Decorative. */}
        <img
          className={s.band}
          src="/images/approach-band.webp"
          alt=""
          aria-hidden="true"
        />

        <h1 className={s.headline}>
          <span className={s.line1}>
            {headline.lead}{" "}
            <span className={s.accent}>{headline.accent}</span>
          </span>
          <span className={s.line2}>{headline.tail}</span>
        </h1>

        <p className={s.lede}>{lede}</p>
      </div>
    </section>
  );
}
