# ANIMATIONS-HUB.md — Proxy Papers animation library

A catalogue of every animation in the Proxy Papers landing page, written as a
context bank for **me** (the agent). It is **not executed** and nothing imports
it — its purpose is that when an animation is referenced in the future, I have the
full picture of what it is, how it's built, and whether a requested change is
feasible.

Entries are added as each section is ported (source: `design-final/scripts/hero.js`
+ the section's CSS). Source CDN versions: GSAP 3.12.5, ScrollTrigger 3.12.5,
Lenis 1.1.18. The port uses GSAP 3.15.x, Lenis 1.3.x via `@gsap/react` `useGSAP`
+ a root `LenisProvider` (one Lenis driven by `gsap.ticker`; `ScrollTrigger.update`
on scroll).

## Entry template

> ### <Animation name>
> - **Where:** section / element(s) it applies to.
> - **User-facing description:** how to describe or request it in plain language.
> - **Trigger:** on load / scroll-trigger (start–end %) / scrub / hover / perpetual.
> - **Mechanics:** GSAP props (from → to), durations, eases, stagger,
>   ScrollTrigger config (trigger, start, end, scrub, pin), any measured values.
> - **Source ref:** function in `design-final/scripts/hero.js` (+ relevant CSS).
> - **Implementation note:** how it's rebuilt in React (`useGSAP` scope, refs,
>   `SplitText`, cleanup).
> - **Feasibility / constraints:** gotchas, dependencies, reduced-motion behavior,
>   what would make a requested variation hard or easy.

---

## Foundations (shared mechanics)

### Per-word reveal primitive (`.r-word` / `.r-word__in`)
- **Where:** every editorial headline/body that reveals word-by-word.
- **User-facing description:** "words rise up into place from behind a clipped
  line, one after another."
- **Trigger:** varies by section (load or scroll-trigger).
- **Mechanics:** each word is wrapped `<span class="r-word"><span
  class="r-word__in">word</span></span>`; `.r-word` clips (overflow hidden), the
  inner span animates `yPercent: 110/120 → 0` with a per-word `stagger`.
- **Source ref:** `splitWords(el)` in `hero.js`; `.r-word` in `theme.css`.
- **Implementation note:** a `SplitText` component renders the spans at SSR (no
  runtime DOM splitting, no flash); the section's `useGSAP` targets `.r-word__in`
  by ref. Classes are global (in `globals.css`).
- **Feasibility / constraints:** trivially reusable; stagger and direction are
  per-section. Reduced motion → words render in place.

### Lenis smooth scroll + GSAP ticker
- **Where:** whole page.
- **Mechanics:** one Lenis (`duration: 1.8`, easing
  `t => min(1, 1.001 - 2^(-10t))`), driven from `gsap.ticker`; `lenis.on('scroll',
  ScrollTrigger.update)`. Scroll is locked during the onboarding handoff and
  released on ready.
- **Source ref:** `start()` init in `hero.js`.
- **Implementation note:** `src/lib/lenis/LenisProvider.tsx`; scroll-lock control
  added when the onboarding section is ported.

<!-- Section entries are appended below as porting proceeds. -->

## Hero

### Hero intro (lens open → headline → body/CTA → axis/conveyor → statement)
- **Where:** the hero section, on entry.
- **User-facing description:** "the blue lens opens from its waist, the headline
  words rise in one by one, the body and buttons fade up, the centre axis line
  draws down with the brand card, the document conveyor fades in, and the
  positioning statement settles in last."
- **Trigger:** on load (standalone). In the source it is a *paused* timeline that
  the onboarding curtain plays once the welcome resolves; the brand card is
  revealed there as the mark settles into it. The port plays on mount until the
  onboarding handoff is built (Step 10), which will reclaim the trigger + card reveal.
- **Mechanics** (timeline, defaults `ease: power3.out`):
  - lens: `opacity 0→1, scaleY 0.9→1`, dur 1.3, `power2.out`, @0s.
  - title words (`.r-word__in`): `yPercent 110→0`, dur 0.75, stagger 0.08, @0.25.
  - body + CTA: `opacity 0→1, y 16→0`, dur 0.7, stagger 0.1, @0.6.
  - axis line: `scaleY 0→1`, dur 0.9, `power2.inOut`, @0.7; `.axis` opacity→1 @0.7;
    conveyor opacity→1 dur 0.9 @0.9.
  - brand card: `opacity 0→1`, dur 0.4, @0.95 (port-only; source's curtain owns this).
  - statement: `opacity 0→1, y 16→0`, dur 0.8, @1.2.
- **Source ref:** `buildHeroIntro` in `hero.js`.
- **Implementation note:** `src/lib/animations/useHeroIntro.ts` (`useGSAP`, scoped
  to the hero ref). Section renders settled by default; the hook arms hidden
  states with `gsap.set` then plays. Targets via `gsap.utils.selector(scope)` +
  module class names; words via the global `.r-word__in`.
- **Feasibility / constraints:** reduced motion → hook returns early, section stays
  settled. When onboarding lands, convert this to a paused timeline exposed to the
  curtain and drop the port-only card reveal.

### Conveyor marquee (endless document drift)
- **Where:** the hero document conveyor (two synced tracks).
- **User-facing description:** "documents drift slowly left→right through the lens;
  a skeleton row on the left becomes a structured row as it crosses the centre card."
- **Trigger:** perpetual, started on the intro timeline's `onComplete`.
- **Mechanics:** both tracks `xPercent -50→0`, dur 64s, `ease: none`, `repeat: -1`.
  Each track holds two passes of the documents so the wrap is seamless. The
  skeleton/content split is a CSS mask (left half vs right half), not animation.
- **Source ref:** `marquee()` inside `buildHeroIntro`; rows from `buildConveyor`.
- **Implementation note:** rows are React components (`Conveyor.tsx`), doubled in
  markup. The marquee tween runs on the two `.track` elements.
- **Feasibility / constraints:** reduced motion → no marquee (static rows). Loop
  distance is exactly one pass because the markup is doubled; no measuring needed.

### Idle cloud drift (hero lens)
- **Where:** the two cloud layers inside the lens.
- **User-facing description:** "the clouds inside the lens breathe slowly side to side."
- **Trigger:** perpetual, from mount.
- **Mechanics:** left cloud `xPercent → 3`, dur 18s; right cloud `xPercent → -3`,
  dur 20s; both `sine.inOut`, `repeat: -1`, `yoyo: true`.
- **Source ref:** `idle()` inside `buildHeroIntro`.
- **Feasibility / constraints:** reduced motion → not started.
