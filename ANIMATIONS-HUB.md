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

## Navbar + Menu

> These are **CSS-transition / IntersectionObserver** driven, not GSAP. React only
> flips state (open theme); the motion lives in the CSS modules.

### Navbar theme flip
- **Where:** the fixed navbar surfaces (logo card + Menu pill) + the logo mark.
- **User-facing description:** "as you scroll, the floating navbar recolors to suit
  the section under it — bone pills on dark/blue sections, an ink chip on light ones."
- **Trigger:** scroll; an IntersectionObserver with a 1px band at the navbar's
  vertical centre picks the section crossing that line.
- **Mechanics:** the observed section's `data-nav-theme` (`dark|blue|light`) sets a
  `pp-theme-*` class on the nav; CSS crossfades `background-color / border-color /
  color` over 0.5s `--pp-ease-out`. Light sections flip pills to ink + the logo stem
  to bone (blade stays blue).
- **Source ref:** `setupNavTheme` in `hero.js`.
- **Implementation note:** `src/hooks/useNavTheme.ts` returns the theme string;
  `Navbar` renders `pp-theme-${theme}` (no classList mutation, so it doesn't fight
  React). Rebuilds the observer on resize.
- **Feasibility / constraints:** needs `[data-nav-theme]` on every section; default
  is `dark`.

### Menu open / close (card unfold + content stagger)
- **Where:** the menu overlay card hanging from the navbar's right edge.
- **User-facing description:** "the Menu pill unfolds into a bone card; FR|EN, then
  the four links rise in one by one, then the bottom row; reverses on close."
- **Trigger:** click the Menu/Close button (or Esc / scrim click to close).
- **Mechanics (CSS, driven by `data-state` on the menu root):** panel `clip-path`
  `inset(1.59% 1.62% 89.38% 75.27% round 1.46%)` → `inset(0 round 1.81%)`, 0.9s open
  / 0.7s close; scrim opacity 0→1 (0.3s); `.lang` + `.foot` fade + `translateY(8px)→0`;
  each `.linkText` rises `translateY(108%)→0`; staggered via `transition-delay`
  (lang 0.08s, links 0.12/0.18/0.24/0.30s, foot 0.36s).
- **Source ref:** `menu.css` + `setupMenu` in `hero.js`.
- **Implementation note:** `Menu.tsx` (CSS module). `Navbar` owns `open` state and
  renders the Menu; `src/hooks/useMenu.ts` handles scroll-lock (Lenis via context),
  focus trap across the Close button + panel, Esc, and focus restore. Scrim + link
  clicks call `onClose`.
- **Feasibility / constraints:** reduced motion → instant show/hide (transitions
  off). Scroll lock uses the shared Lenis (`useLenis`), falling back to
  `overflow: hidden`.

### Menu pill morph (Menu ⇄ Close) + grip square-up
- **Where:** the navbar Menu button while the menu is open (`.is-menu-open`).
- **User-facing description:** "the Menu label slides up to reveal Close, the pill
  goes dark, and the 4-dot grip rotates into a square."
- **Mechanics:** label track `translateY(0 → -1.25em)` 0.6s (two stacked words in a
  1.25em mask); pill background → ink, color → bone; grip svg `rotate(0 → 45deg)`
  0.7s; the left logo card hides (`opacity 0`).
- **Source ref:** `menu.css` (navbar-side rules) + `setupMenu`.
- **Implementation note:** `Navbar.module.css` `.navMenuOpen` rules; the class is
  toggled by React `open` state.
- **Feasibility / constraints:** reduced motion → grip squares up instantly.

### Menu link per-letter hover stagger
- **Where:** each menu nav link on hover/focus.
- **User-facing description:** "hovering a link replays the rise letter-by-letter,
  each character offset slightly, and it turns blue."
- **Mechanics:** link text is split into `.linkChar` spans each carrying `--i`; on
  hover the `linkRise` keyframe (`translateY(108%)→0`, 0.5s) plays with
  `animation-delay: calc(var(--i) * 0.03s)`.
- **Source ref:** `menu.css` (`pp-menu-link-rise`) + the char split in `setupMenu`.
- **Implementation note:** `Menu.tsx` `LinkChars` renders the spans at SSR with
  inline `--i`; the keyframe lives in `Menu.module.css`.
- **Feasibility / constraints:** gated `@media (prefers-reduced-motion: no-preference)`.
