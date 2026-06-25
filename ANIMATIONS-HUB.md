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

### Menu link hover roll-to-blue (masked text swap)
- **Where:** each menu nav link on hover/focus.
- **User-facing description:** "hovering a link rolls the word up and swaps it to a
  blue copy of itself" — the ink word slides out the top while a Proxy-Blue duplicate
  rises from below; reverses on leave. (Replaced the earlier per-letter rise so the
  nav matches the Trust certs.)
- **Trigger:** hover / focus-visible (CSS).
- **Mechanics:** each link holds two stacked copies inside its `overflow:hidden`
  mask — `.linkMain` (ink) + `.linkClone` (`absolute; top:100%`, `--pp-blue`); on
  hover both `transform: translateY(-100%)`, `0.5s cubic-bezier(0.16,1,0.3,1)`. The
  copies sit inside `.linkText` (the menu-open reveal layer), which is
  `position:relative` so the clone stays parented through the open transform flip.
- **Source ref:** shares the Trust cert mechanic (adapted from apechain.com
  `SectionDiscoverApps`); not in design-final.
- **Implementation note:** `Menu.tsx` renders `.linkMain` + `.linkClone`; CSS in
  `Menu.module.css`. The menu-open block rise (`.linkText` `108%→0`) is unchanged and
  independent of the hover roll (different elements, different axes of state).
- **Feasibility / constraints:** reduced motion → roll disabled, falls back to a
  plain colour swap to blue so hover still reads.

## Problem

### Problem reveal (column rises + cards settle + VOLUME zigzag draws)
- **Where:** the Problem section (inside `.page-frame`), as it scrolls into view.
- **User-facing description:** "as the section enters, the PROBLEM eyebrow and its
  blue hand-drawn underline appear, the headline and body rise in word-by-word, the
  three data cards settle up from below, and the big blue zigzag in the VOLUME card
  traces itself in."
- **Trigger:** scroll-linked (scrubbed), NOT on load — the visitor is still on the
  hero at load. ScrollTrigger `start: top 85%`, `end: top 60%` (short entry window),
  `scrub: 3` (soft catch-up tail), `invalidateOnRefresh: true`.
- **Mechanics** (timeline, defaults `ease: power3.out`, `force3D`):
  - eyebrow words (`.r-word__in`): `yPercent 120→0`, dur 0.6, @0.
  - underline rule: `autoAlpha 0→1, scaleX 0→1`, dur 0.7, @0.1 (origin left center,
    held at `rotation: 0.33`).
  - headline words: `yPercent 120→0`, dur 0.7, stagger 0.06, @0.25.
  - body words: `yPercent 120→0`, dur 0.7, stagger 0.018, @0.7.
  - cards: `autoAlpha 0→1, y 28→0`, dur 0.8, stagger 0.14, @0.95.
  - VOLUME zigzag path: `strokeDashoffset 100→0`, dur 1.2, `power2.inOut`, @0.95
    (rests DRAWN; no hover).
- **Source ref:** `setupProblem` + `REVEAL_ST` in `hero.js`; `problem.css`.
- **Implementation note:** `src/lib/animations/useProblem.ts` (`useGSAP`, scoped to
  the section ref). Section renders settled by default; the hook arms the parked
  state with `gsap.set` (words `yPercent 120`, rule hidden, cards `autoAlpha 0`,
  paths `strokeDasharray 100`). Word subsets are re-queried by module-class
  descendant selectors (`.eyebrow .r-word__in`, etc.).
- **Feasibility / constraints:** reduced motion → hook returns early; settled render
  leaves everything readable with all zigzags drawn (`stroke-dashoffset: 0` default
  in the module). `pathLength=100` normalises the draw across the three card sizes.

### Problem card zigzag hover-draw (FRICTION + RISK)
- **Where:** the two smaller Problem cards (FRICTION top-right, RISK bottom-right).
- **User-facing description:** "the small cards' blue zigzag is hidden until you
  hover the card, when it traces itself in; it erases when you leave."
- **Trigger:** hover (`mouseenter` / `mouseleave`) on the card.
- **Mechanics:** the path rests at `strokeDashoffset 100` (invisible); enter tweens
  it to 0, leave back to 100 — dur 0.9, `power2.inOut`, `overwrite: true`.
- **Source ref:** the `smallPaths.forEach` listener block in `setupProblem`.
- **Implementation note:** listeners are attached inside `useProblem`'s `useGSAP`
  callback and removed via the returned cleanup. VOLUME is excluded (its draw is the
  load-in moment only).
- **Feasibility / constraints:** reduced motion → no listeners (hook returns early),
  so the small zigzags stay drawn (the readable settled state).

## Profiles

### Profiles header reveal (title + body word-by-word)
- **Where:** the Profiles editorial header (two title lines + right-aligned body).
- **User-facing description:** "the two-line title and the supporting copy rise in
  word-by-word as the section enters."
- **Trigger:** scroll, `start: top 72%`, `once: true` (plays once, not scrubbed —
  separate from the deck's pinned trigger).
- **Mechanics:** words parked `yPercent 120`; title words `yPercent 120→0` dur 0.7
  stagger 0.06 @0; body words same dur 0.7 stagger 0.018 @0.35. `ease power3.out`.
- **Source ref:** trigger A in `setupProfiles` (`hero.js`).
- **Implementation note:** `src/lib/animations/useProfiles.ts`. Title is two
  `<SplitText>` lines inside the `h2`; words queried by `.title .r-word__in` /
  `.body .r-word__in`.

### Profiles deck flip (pinned, scrubbed 3D card flip with dwell)
- **Where:** the three-card deck + the CTA beneath it.
- **User-facing description:** "the section locks in place; the fanned stack of
  cards (showing big numbers) un-tilts, spreads into an even row, and each card
  flips on its vertical axis to reveal its named back, centre card first; the CTA
  fades up and the flipped deck holds still for a beat before the section releases."
- **Trigger:** scroll, the section PINS (`start: top top`, `end: +=160%`, `pin: true`,
  `pinType: "transform"`, `anticipatePin: 1`, `scrub: 2.4`). The pin DISTANCE sets
  the pace (slow + deliberate); scrub 2.4 only softens how it tracks/settles.
- **Mechanics** (parked at fanned FRONT, then):
  - `.cardPos` (spread + tilt): `x/y → 0, rotation → 0`, dur 1.2, stagger 0.15,
    `power1.inOut`, @0. Parked values are the per-card `--dx/--dy` (vw→px) + `--rot`.
  - `.cardFlip` (rotateY): `0 → 180`, dur 1.4, stagger 0.15, `power1.inOut`, @0.3.
  - CTA: `autoAlpha 0→1, y 16→0`, dur 0.5, `power2.out`, @1.6.
  - dwell: empty `to({}, { duration: 0.9 })` tail holds the flipped deck.
  - Card order is centre-first: `["02","01","03"]`.
- **Transform layering:** `.card` (slot + perspective, GSAP never touches) →
  `.cardPos` (preserve-3d, spread/tilt) → `.cardFlip` (preserve-3d, rotateY) →
  two `backface-hidden` faces. CSS base is the resolved flat back-spread (180°), so
  no-JS / reduced motion lands there.
- **Source ref:** trigger B in `setupProfiles` (`hero.js`); `profiles.css`.
- **Implementation note:** `useProfiles.ts`. GSAP 3 doesn't resolve vw on x/y, so
  the `--dx/--dy` offsets are converted to px against the live viewport and scaled
  by the deck's live shrink factor (`deckScale`). Cards selected by
  `[data-profile="…"]`. `pinType: "transform"` is kept from the source (survives a
  `container-type` ancestor). Profiles is composed OUTSIDE `.page-frame`.
- **Feasibility / constraints:** reduced motion → hook returns early; the section
  shows the resolved flat back-spread (names + CTA visible). The CTA can fall below
  the fold by design on tall decks. The deck (only) scales down on short viewports
  via CSS `--card-h`; the fan offsets follow via `deckScale`.

## Method

### Method reveal (header + five steps + link, once on enter)
- **Where:** the Method blue panel (header, the five step rows, the footer link).
- **User-facing description:** "as the blue panel enters, the two-clause title and
  the lede rise in word-by-word, the five numbered step rows settle up one after
  another top-to-bottom, and the 'See our full approach' link fades in last."
- **Trigger:** scroll, `start: top 72%`, `once: true` (plays once; not scrubbed,
  not pinned).
- **Mechanics** (timeline, `ease: power3.out`):
  - title words (`.r-word__in`): `yPercent 120→0`, dur 0.7, stagger 0.06, @0.
  - lede words: `yPercent 120→0`, dur 0.7, stagger 0.018, @0.3.
  - steps: `autoAlpha 0→1, y 30→0`, dur 0.7, stagger 0.1, @0.45.
  - link: `autoAlpha 0→1, y 16→0`, dur 0.6, @1.0.
- **Source ref:** `setupMethod` in `hero.js`; `method.css`.
- **Implementation note:** `src/lib/animations/useMethod.ts` (`useGSAP`, scoped).
  Title is two inline `<SplitText>` segments (second muted) inside the `h2`, with a
  literal space between them. Steps are a `.map()` over `method.json`.
- **Feasibility / constraints:** reduced motion → hook returns early; the settled
  render shows everything in place. The link's arrow nudge on hover is pure CSS
  (`.link:hover svg { translateX }`), not GSAP. `data-nav-theme="blue"` flips the
  navbar to its blue surface over this panel (see Navbar theme flip).

## Trust (shared)

### Trust expand (pinned, scrubbed panel open + word-by-word body)
- **Where:** the Trust reassurance band (the bone panel + its contents).
- **User-facing description:** "the section locks centred as a small portrait card
  (eyebrow on top, a tiny certs strip along the bottom, empty middle); as you
  scroll it opens sideways to a full-width band — the hairline frame fades in, the
  eyebrow lifts away, the certs strip scales up and rises, the title rises to
  centre and darkens from grey to ink, and the body settles in word-by-word — then
  holds open for a beat before releasing."
- **Trigger:** scroll, the band PINS centred (`start: center center`,
  `end: +=120%`, `pin: true`, `pinType: "transform"`, `pinSpacing: true`,
  `anticipatePin: 1`, `scrub: 2.4`, `invalidateOnRefresh: true`). Heavy scrub over a
  generous pin distance → consistent glide regardless of scroll force.
- **Mechanics** (parked collapsed, then, `ease: power2.inOut` on the openers):
  - panel: `width cap(29.1vw,440) → 100%`, dur 1.5, @0 (width-only open).
  - content: `y cap(28.57vw,432) → 0`, dur 1.5, @0 (title block rises from below).
  - eyebrow: `autoAlpha 1→0, y → -1.1vw`, dur 0.45, @0.
  - certs (the PARENT, not the track): `scale 18.2/49 → 1, y cap(6.15vw,93) → 0`
    (keeps `yPercent:-50`), dur 1.5, @0.
  - frame: `autoAlpha 0→1`, dur 0.6, @0.4.
  - title line 2: `autoAlpha 0→1, yPercent 40→0`, dur 0.6, @0.5.
  - title colour: `rgba(22,23,24,0.6) → rgb(22,23,24)`, dur 0.7, @0.6.
  - body: `autoAlpha 0→1` @0.85; body words `yPercent 120→0` dur 0.5 stagger 0.008 @0.9.
  - dwell: `.to(panel, { duration: 0.6 })` tail holds the open band.
- **Source ref:** `setupTrust` in `hero.js`; `trust.css`.
- **Implementation note:** `src/lib/animations/useTrust.ts`. vw distances are
  converted to px (`cap(vw,px) = min(vw→px, px)`) because GSAP treats vw on
  transforms as px. Title is plain `<span>` lines (only the body is `<SplitText>`).
  Composed OUTSIDE `.page-frame` (full-bleed exception) so it opens to the viewport
  width. `data-nav-theme="light"` flips the navbar to its light (ink) surface.
- **Feasibility / constraints:** reduced motion → hook returns early; the settled
  full band renders (static single-set strip). Pin release + nav light-flip need
  scroll runway below Trust (sections after it) to be observed.

### Certifications marquee (persistent infinite, clone-to-fill)
- **Where:** the certs strip inside the Trust panel (present in both states).
- **User-facing description:** "a strip of certifications scrolls left forever,
  seamlessly, with a blue dot between each."
- **Trigger:** perpetual (CSS keyframes), built on mount; runs through both states.
- **Mechanics:** the markup authors ONE cert set; the hook clones it to
  `max(2, ceil(viewport / setWidth) + 1)` copies, measures the exact one-set period
  from layout (`children[unit].offsetLeft - children[0].offsetLeft`), and sets
  `--marquee-shift` (px) + `--marquee-duration` (`shift / 52 px·s⁻¹`). The CSS
  `@keyframes trust-marquee` translates the track `0 → -shift`, `linear infinite`.
  font-size is CONSTANT (49px); the compact state is a transform `scale` on the
  PARENT `.certs`, never the track, so the track's pixel width is fixed and the
  loop never re-measures mid-open. Rebuilds on resize (rAF-debounced); waits for
  `document.fonts.ready` first.
- **Source ref:** `setupCertsMarquee` in `hero.js`; `trust.css` (`@keyframes
  trust-marquee`).
- **Implementation note:** built inside `useTrust` (same section). The hook clones
  DOM nodes off the one authored set (`cloneNode`) — safe because the component
  never re-renders. The keyframe lives in `Trust.module.css` (CSS-modules scopes
  the name + its reference together). Resize listener cleaned up on revert.
- **Feasibility / constraints:** reduced motion → not built (hook returns early) and
  CSS `@media (prefers-reduced-motion: reduce)` also stops the animation; the strip
  renders static. Seamless for any cert count / screen width.

### Cert hover roll-to-blue (per-cert masked text swap)
- **Where:** each cert label in the Trust marquee (both states; reads in the
  expanded band).
- **User-facing description:** "hover a certification and it rolls up and swaps to a
  blue copy of itself" — the ink word slides out the top while a Proxy-Blue duplicate
  rises from below to replace it; reverses on mouse-out.
- **Trigger:** hover (CSS `:hover`).
- **Mechanics:** each cert holds two stacked copies in a `position:relative;
  overflow:hidden` mask (`.certLabel`): `.certMain` (ink, `--pp-ink`) and `.certClone`
  (`absolute; top:100%`, `--pp-blue`). Both copies carry `padding:0.12em 0` so each is
  one padded line tall — the clone parks exactly one copy-height below and a shared
  `transform: translateY(-100%)` lands it pixel-aligned where main sat. Transition
  `0.5s cubic-bezier(0.16,1,0.3,1)` (expo-out). The mask's `-0.12em` block margin
  keeps the strip's vertical rhythm unchanged. The `.cert::after` blue dot is static.
- **Source ref:** adapted from apechain.com `SectionDiscoverApps` category labels
  (NOT in design-final — a new addition). Brand: blue used sparingly, as an accent on
  interaction.
- **Implementation note:** pure CSS in `Trust.module.css` + a two-copy structure in
  `Trust.tsx`. CSS (not GSAP) on purpose: `useTrust`'s marquee `cloneNode(true)`
  copies the markup but not JS listeners, so a class-based `:hover` is the only thing
  that covers every cloned cert for free, with no rebinding on rebuild/resize.
- **Feasibility / constraints:** reduced motion → `@media (prefers-reduced-motion:
  reduce)` disables the transition and the hover transform (no roll). Works on every
  marquee clone; marquee keeps scrolling during hover (matches the reference).

### CTA / link hover roll (site-wide, two variants)
- **Where:** the page's CTAs and links — filled pills (Hero `Request a discovery
  meeting`, Profiles `Explore the services`, Referrers `Enter the referrers area`) and
  text links (Hero `Are you a referring advisor?`, Closing `Request a discovery
  meeting` + arrow, Method `See our full approach` + arrow). Extends the cert/nav roll
  language to every call-to-action.
- **User-facing description:**
  - Pills: "hover a button and it fills white while the label rolls up and turns blue."
  - Text links: "hover a link and the word rolls up and swaps to a blue copy."
- **Trigger:** hover / focus-visible (CSS).
- **Mechanics:** the shared masked roll — two stacked copies (`__main` + `__clone`,
  each `padding:0.12em 0`) in an `overflow:hidden` mask with `margin-block:-0.12em`;
  on hover both `translateY(-100%)`, `0.5s cubic-bezier(0.16,1,0.3,1)`; clone is
  `--pp-blue`.
  - **Filled pills (inverted roll):** the pill also transitions `background-color`
    `--pp-blue → --pp-bone` (`0.4s`); main copy is bone, clone blue → ends bone pill +
    blue label. Keeps the subtle `translateY(-1px)` lift; the brightness filter is gone.
  - **Text links (roll to blue):** no background; Hero secondary main = faded bone,
    its `::after` underline goes blue on hover; Closing main = `--pp-ink` (the link
    keeps `color:--pp-blue` so its underline + arrow stay blue), arrow keeps its nudge.
  - **Method link (motion-only roll):** the link sits on the full-presence blue panel
    with a bone label, so there's no further accent to reveal — the roll is bone→bone
    (clone inherits the link's bone), keeping the gesture + arrow nudge.
- **Source ref:** same mechanic as the Trust certs / menu links (adapted from
  apechain.com); not in design-final.
- **Implementation note:** pills go through a shared `PpButton`
  (`components/shared/PpButton`) that renders the masked label; the invert + roll live
  on global `.pp-btn` / `.pp-btn__*` in `globals.css`. Profiles wraps `PpButton` in its
  positioning `div.cta` so the pill's hover `translateY` doesn't clobber the wrapper's
  centering `translateX(-50%)`. Referrers keeps a local copy (`.cta` / `.ctaRoll/
  .ctaMain/.ctaClone`) since that CTA is deliberately not `.pp-btn` (full-bleed). Text
  links use module-scoped `.linkRoll/.linkMain/.linkClone`.
- **Feasibility / constraints:** reduced motion → pills invert/roll instantly
  (`transition:none`, valid end state); text links disable the roll and fall back to a
  plain colour swap to blue. Descender headroom via the same padding/negative-margin.

## Referrers

### Referrers reveal (title → radar assembles → avatars stagger → body/CTA)
- **Where:** the Referrers band — title, orbital radar (rings + centre P-mark +
  five advisor avatars), body, blue pill CTA.
- **User-facing description:** "the radar diagram builds itself as you scroll to
  it — rings fade in, the mark pops, the advisor faces appear one by one — then it
  keeps slowly spinning."
- **Trigger:** scroll-trigger, `start: "top 70%"`, `once: true` (fires once, not
  scrubbed). `onComplete` starts the perpetual orbit (below).
- **Mechanics:** timeline defaults `power3.out`, `force3D`. Park: title+body words
  `yPercent 120`; rings `autoAlpha 0, scale 0.85`; `[mark, ...avatars]` `autoAlpha
  0, scale 0`; cta `autoAlpha 0, y 16` (all `transformOrigin: 50% 50%`). Steps:
  - title words: `yPercent 0`, dur 0.7, stagger 0.05, @0.
  - rings: `autoAlpha 1, scale 1`, dur 0.9, `power2.out`, @0.25.
  - mark: `autoAlpha 1, scale 1`, dur 0.6, `back.out(1.6)`, @0.4.
  - avatars: `autoAlpha 1, scale 1`, dur 0.55, `back.out(1.7)`, stagger 0.09, @0.5.
  - body words: `yPercent 0`, dur 0.7, stagger 0.014, @0.7.
  - cta: `autoAlpha 1, y 0`, dur 0.6, @1.0.
- **Source ref:** `setupReferrers` in `hero.js`; `referrers.css`.
- **Implementation note:** `src/lib/animations/useReferrers.ts`. Settled-by-default
  (no `.js`-hide); the hook arms the parked state then reveals. Title + body are
  `<SplitText>`; avatars are a `.map()` over `referrers.json` advisors (grouped into
  inner/middle orbit layers via `data-ring`; positions via `data-avatar` selectors).
  Composed OUTSIDE `.page-frame` (full-bleed, raw vw). `data-nav-theme="dark"`.
- **Feasibility / constraints:** reduced motion → hook returns early; the settled
  radar renders static (rings/mark/avatars visible, orbit not spinning).

### Referrers perpetual orbit (counter-rotating rings, upright faces)
- **Where:** the radar inside Referrers, after the reveal completes.
- **User-facing description:** "the radar keeps drifting — inner ring one way,
  middle ring the other, the dashed outer ring slowly turning; the faces always
  stay upright."
- **Trigger:** perpetual (`repeat: -1`, `ease: "none"`), kicked off by the reveal
  timeline's `onComplete`.
- **Mechanics:** inner orbit layer `rotation 360`, dur 42 (CW); its imgs
  `rotation -360`, dur 42 (counter-rotate → upright). Middle layer `rotation -360`,
  dur 52 (CCW); its imgs `rotation 360`, dur 52. Outer dashed ring `rotation 360`,
  dur 68, `svgOrigin: "247 247"` (the 494×494 field centre). Layers use
  `transformOrigin: 50% 50%`; the centre mark holds still.
- **Source ref:** `startOrbit` inside `setupReferrers` in `hero.js`.
- **Implementation note:** layers selected via `[data-ring="inner|middle"]`, the
  outer ring via its module class; img counter-rotation targets `layer.querySelectorAll("img")`.
  Avatar reveal (scale on the `.avatar` span) and orbit rotation (on the parent
  layer) live on separate nodes, so transforms never conflict.
- **Feasibility / constraints:** reduced motion → not started (hook returns early).
  Long linear durations keep it calm; decorative (`aria-hidden`), no pointer events.

## Sliders (referrals page)

### Sliders benefit roller (pinned, SCRUBBED triple roller, iventions)
- **Where:** the Sliders section on `/referrals` ("What Proxy Papers brings you") — full
  viewport, dark. Fixed left label · centre photo frame (3D brand tilt + mouse) · right body.
- **User-facing description:** "the section pins and the benefits roll continuously as you
  scroll — the title (on the frame) and the body roll vertically in lockstep, the centre is
  solid and the neighbours ghost above/below, the photo cross-fades, and it eases to a rest
  on each benefit. Scrolling back rolls it back. Below 1024 it's a settled vertical gallery."
- **Trigger:** scroll, **pinned + scrubbed**. `gsap.timeline({ scrollTrigger: { trigger:
  section, start: "top top", end: "+=" + n*100 + "%" (n = benefit count), pin: true,
  pinType: "transform", anticipatePin: 1, scrub: 1.2, invalidateOnRefresh: true,
  onRefresh: re-measure } , onUpdate: applyRoll })`. A separate `once` trigger (`top 80%`)
  fades the deck up + rises the left label before the pin. Desktop-only via
  `gsap.matchMedia("(min-width:1024px)")`.
- **Mechanics:** the timeline scrubs a proxy `roll.pos` (0..n−1) — per benefit an eased step
  `to(roll,{pos:i, ease:"power2.inOut", duration:1})` then a pos-holding dwell
  `to(roll,{pos:i, duration:0.6})` (the rest-on-stat). Each frame `applyRoll()` offsets every
  title/body by `(index − pos) × rowH/bodyRowH` (absolute, no relative tweens → refresh-safe)
  and cross-fades each photo by `max(0, 1 − |index − pos|)`. Pitches measured from the
  laid-out card (`rowH = cardH × 0.66`) and tallest body (`bodyRowH = maxBodyH + rowH×0.18`),
  re-measured on refresh so they track `--pp-scale`. Title/body layers are gradient-masked
  viewports (`.titleLayer` 560·scale tall, mask 34–66%; `.bodyViewport` 232·scale tall, mask
  30–70%) so the centre row is solid and neighbours fade — the ghost-roll. Mouse 3D tilt
  (`--pp-rx/--pp-ry`, base 4/−9 ±4°, `quickTo` eased) is unchanged and inherited by every
  overlapped `.card3d`.
- **Source ref:** matches iventions.com (`.css-14hzl1p`) — three synced roller columns,
  scrub-tied with eased dwell + gradient-mask edges (measured live). Reuses the scrub+pin
  pattern of `useProfiles.ts` and the masked viewport of `Trust.module.css` `.certsViewport`.
- **Implementation note:** `useSliders.ts` (`useGSAP`, scope-scoped). Per-slide `.slide`
  blocks kept (overlapped + absolute in slider mode; vertical gallery on mobile). Title & body
  are SplitText markup but roll as whole blocks here (words parked at rest); the left label +
  the mobile gallery still word-rise. `data-mode="slider"` toggles the masked-viewport layout.
- **Feasibility / constraints:** desktop ≥1024 only; mobile (<1024) and reduced motion →
  settled gallery (no pin/scrub/tilt), each slide word-rises on enter. Scrub tracks Lenis via
  the shared ticker (`LenisProvider`). Tuning knobs: `scrub`, roll/dwell ratio (1 / 0.6),
  `rowH`/`bodyRowH`, mask stops, viewport heights.

## Closing

### Closing reveal (oversized headline → link → reassurance copy)
- **Where:** the Closing CTA band — Proxy Blue headline (upper-left), the
  "Request a discovery meeting" link + reassurance copy (lower-right).
- **User-facing description:** "the big closing headline rises word-by-word as you
  reach it, then the meeting link and the line under it settle in."
- **Trigger:** scroll-trigger, `start: "top 78%"`, `once: true` (fires once).
- **Mechanics:** timeline defaults `power3.out`, `force3D`. Park: title + body
  words `yPercent 120`; link `autoAlpha 0, y 16`. Steps:
  - title words: `yPercent 0`, dur 0.75, stagger 0.07, @0.
  - link: `autoAlpha 1, y 0`, dur 0.6, @0.45.
  - body words: `yPercent 0`, dur 0.7, stagger 0.016, @0.55.
- **Source ref:** `setupClosing` in `hero.js`; `closing.css`.
- **Implementation note:** `src/lib/animations/useClosing.ts`. Settled-by-default
  (no `.js`-hide). Title + body are `<SplitText>`; the link is a plain anchor with
  an inline arrow SVG whose hover nudge (`translateX`) is pure CSS. Full-bleed
  (outside `.page-frame`); `.inner` re-creates the 1512px frame so the corner-
  anchored blocks (title upper-left, action lower-right) resolve their absolute
  positions. `data-nav-theme="light"` flips the navbar to its light surface.
- **Feasibility / constraints:** reduced motion → hook returns early; the settled
  band renders (headline + link + copy in place).

## Footer (shared)

### Footer reveal (dividers draw → mark lifts → links cascade → copyright)
- **Where:** the blue footer card — hairline dividers, big bone P-mark + copyright,
  two columns of links.
- **User-facing description:** "as the footer scrolls up, the thin divider lines
  draw downward, the big logo fades and lifts, the link columns rise in a cascade,
  then the copyright line settles."
- **Trigger:** scroll-trigger, `start: "top 82%"`, `once: true`.
- **Mechanics:** timeline defaults `power3.out`, `force3D`. Park: mark `autoAlpha
  0, yPercent 12`; rules `autoAlpha 0, scaleY 0` (origin top centre); links
  `autoAlpha 0, yPercent 70`; legal `autoAlpha 0, yPercent 85`. Steps:
  - rules: `autoAlpha 1, scaleY 1`, dur 0.9, `power2.out`, stagger 0.08, @0.
  - mark: `autoAlpha 1, yPercent 0`, dur 0.9, `power2.out`, @0.15.
  - links: `autoAlpha 1, yPercent 0`, dur 0.7, stagger 0.05, @0.3.
  - legal: `autoAlpha 1, yPercent 0`, dur 0.6, @0.7.
- **Source ref:** `setupFooter` in `hero.js`; `footer.css`.
- **Implementation note:** `src/lib/animations/useFooter.ts`. Settled-by-default
  (no `.js`-hide); `yPercent` (element-relative) keeps the lift resolution-
  independent. Columns + their link lists are `.map()`s over `footer.json`; the
  P-mark reuses `<PpMark>` recoloured all-bone. Atmosphere (grain + two cloud
  overlays, reused onboarding assets) always renders. Full-bleed (outside
  `.page-frame`, raw vw). `data-nav-theme="blue"`.
- **Feasibility / constraints:** reduced motion → hook returns early; the settled
  footer renders (everything in place, atmosphere shown).

### Navbar handoff (pill fades out into the footer)
- **Where:** the fixed navbar, as the footer scrolls in.
- **User-facing description:** "the floating nav pill fades away as the footer
  takes over the screen, and fades back in when you scroll up."
- **Trigger:** scrubbed ScrollTrigger tied to the footer's scroll position
  (`start: "top 75%"`, `end: "top 15%"`, `scrub: true`).
- **Mechanics:** `gsap.to(nav, { autoAlpha: 0, ease: "none" })` scrubbed across the
  range. Opacity only — never touches the bar's theme (`useNavTheme`) or the logo
  state.
- **Source ref:** `setupNavHandoff` in `hero.js`.
- **Implementation note:** `src/lib/animations/useNavHandoff.ts`, called from
  `<Navbar>` with the nav ref; the trigger element is the `<footer>` (stable tag
  selector). NOT gated on reduced motion (scroll-position driven, matches source);
  without it two navs would overlap at the page bottom.
- **Feasibility / constraints:** depends on the footer being present in the DOM;
  the hook no-ops until it is.

### Onboarding assemble (the welcome intro)
- **Where:** the fixed blue `.ob-stage` overlay (welcome screen), on load.
- **User-facing description:** "the blue welcome screen breathes in — clouds drift
  in from the corners, the watermark P fades up, the P-mark slides up into place,
  and the hairline loader fills."
- **Trigger:** plays once on load, gated behind an asset gate (fonts + key images
  decode, or a 1.4s timeout) so it doesn't start on a half-loaded screen. The page
  is scroll-locked until the handoff that follows resolves.
- **Mechanics (paused timeline, `power3.out` default):**
  - watermark: `opacity 0.2`, dur 1.6, `power2.out`, @0.
  - cloud-left: `opacity 0→1, xPercent -6→0`, dur 1.8, `power2.out`, @0.
  - cloud-top-right: `opacity 0→1, yPercent -5→0`, dur 1.8, `power2.out`, @0.1.
  - mark halves (stem, blade): each clipped to its own baseline + parked below,
    then `y → 0`, dur 0.7, stagger 0.14, @0.35.
  - loader fill: `width 0%→100%`, dur 1.7, `none`, @0.35.
  - (the welcome lockup omits the wordmark, so there are no glyph reveals here.)
- **Source ref:** `setupOnboardingIntro` in `hero.js`; `onboarding.css`.
- **Implementation note:** `src/lib/animations/useOnboarding.ts` (combined with the
  curtain below). The clip wraps are built at runtime (SVG `<clipPath>` rects on
  each path's bbox baseline) exactly as the source does. Armed-hidden states live
  in `globals.css` (`html.js .ob-*`).
- **Feasibility / constraints:** reduced motion / no-JS → the controller removes
  the `js` class; the overlay is `display:none` and the page lands on the settled
  hero (no welcome).

### Curtain handoff (welcome → hero)
- **Where:** spans the `.ob-stage` overlay, the flying P-mark clone, the hero, and
  the navbar logo; auto-plays once the welcome assemble resolves.
- **User-facing description:** "the loader fades, a curtain wipes the blue away from
  the bottom up to reveal the dark hero, the held P-mark eases down into the hero's
  lens card (its blade turning blue, stem turning ink) as the hero assembles around
  it, and the navbar logo appears."
- **Trigger:** auto-played on the welcome timeline's `onComplete` (no scroll). On
  completion it releases the scroll lock (`.pp-ready`), starts Lenis, and refreshes
  ScrollTrigger.
- **Mechanics (one timeline):**
  - loader: `autoAlpha 0`, dur 0.5, `power1.out`, @0.
  - curtain wipe: a proxy `{e:0→1}`, dur 2.0, `power1.inOut`, @0.55 — `onUpdate`
    clip-wipes the overlay (`inset(0 0 e% 0)`) and parallaxes the corner clouds
    (`-4·e/-7·e` yPercent at different rates) with a faint scale-in; the navbar
    logo gets `.is-landed` once `e ≥ 0.9`.
  - hero assemble: the hero's paused intro timeline + idle drift are played at
    `SETTLE_AT` (= 0.55 + 2.0·0.62 ≈ 1.79).
  - mark settle: the fly clone `x→settleX (~0), y→settleY (~+116), scale→card size`,
    dur 1.1, `power2.inOut`, @`SETTLE_AT`; `onUpdate` recolours bone→blue (blade) /
    bone→ink (stem) across `this.progress()`.
  - land: the real carded mark fades in (`opacity 1`, dur 0.3) and the clone fades
    out (`autoAlpha 0`, dur 0.3) coincident, @`SETTLE_AT + 1.1 − 0.05`.
- **Source ref:** `runCurtain` in `hero.js`; `intro.css`.
- **Implementation note:** `src/lib/animations/useOnboarding.ts`. The fly is a
  runtime `<svg>` clone of the mark appended to `<body>` (z 250, above the overlay).
  The hero intro timeline + idle are shared from `<Hero>` via the `IntroProvider`
  (`registerHero`/`getHero`), since the curtain lives in `<Onboarding>`. The hero
  card and navbar logo are reached by element reference (NOT selector strings —
  `useGSAP`'s scope would confine selector text to the overlay). Lenis is stopped by
  `LenisProvider` while locked and started here on release.
- **Feasibility / constraints:** depends on the hero card + navbar logo being laid
  out (they're armed-hidden via opacity but keep layout, so their rects are exact);
  reduced motion skips the whole handoff (settled hero).

## Contact

### Contact intro — entrance reveal → hold → "curtain split" exit
- **Where:** `/contact` first screen — the header (title "Let's set a meeting." +
  lead) and the request-form card, inside a `.stage`. Title rendered via `SplitText`.
- **User-facing description:** "On load the title reveals word-by-word (the site's
  slide-up) with the lead fading up under it; it holds; then the title slides up out
  the top and the lead drops down out the bottom — both scaling up as they go, like
  they're flying out of the screen — while the form card slides up into the centre."
  Inspired by leeroy.ca/contact.
- **Trigger:** on load (auto-play once on mount). NOT scroll-driven — after it settles
  the user scrolls normally to reach the 01/02/03 band + footer below the stage.
- **Mechanics:** one `gsap.timeline({ delay: 0.2 })`, three beats:
  1. ENTRANCE — title words `.r-word__in` `yPercent 110→0`, dur 0.8 `power3.out`,
     stagger 0.06 @0; lead `opacity 0→1, y 24→0`, dur 0.7 `power3.out` @0.35.
  2. HOLD — gap until `exitAt = 1.6`.
  3. EXIT — title `y: -innerHeight*0.62, scale: 1→1.5, opacity: 0`, dur 1.15
     `power2.in` (accelerates out = toward-camera); lead mirrors `y: +…, scale 1.5,
     opacity 0` (equal speed, opposite directions = the curtain). Card armed
     `yPercent 110, opacity 1` (waits below the fold, clipped by the stage's
     `overflow:hidden`) holds until the header is ~90% gone, then tweens `yPercent 0`,
     dur 1.3 `power2.out` @`exitAt + exitDur*0.9` (≈2.64s) — its own beat, glides up and
     decelerates into place; the header fade's last ~10% bridges the handoff so the
     stage never reads empty. `clearProps:"transform"` on finish. Card stays FULL
     opacity the whole slide — it wipes over the descending lead as an opaque surface;
     fading it let the dark ground + lead ghost through.
  4. FORM FILL — the moment the card STARTS entering (`@cardStart`), the form's content
     rows (`.eyebrow, .formTitle, .field, .selectRow, .consent, .note` — 9 elements in
     DOM order) rise with the site's slide-up reveal (`y 20→0, opacity 0→1`, dur 0.6
     `power3.out`, `stagger 0.08`), so the form fills in as the card glides up and the
     rows finish about when it lands. The BUTTONS (audience toggle `.seg` + `.submit`)
     are deliberately excluded — they ride in with the card, never sliding.
     `clearProps:"transform"` on finish (resting opacity stays inline).
- **Scroll lock:** the intro locks Lenis for its duration (`lenis.stop()` → `start()`
  on the timeline's `onComplete`) so a stray wheel/trackpad gesture can't fight the
  curtain and desync the poses. `/contact` has no onboarding curtain, so `LenisProvider`
  leaves scroll running — the hook stops it itself. Because `LenisProvider` is an
  ancestor, its effect (which populates `lenisRef.current`) runs AFTER this descendant
  effect, so the ref is null at first; the hook polls a few `rAF` frames until it's set,
  then stops (a `cancelled` flag lets the cleanup / `onComplete` abort a pending lock and
  guarantees release on unmount). Mobile / reduced-motion / no-JS never lock (early
  return). After the card settles, scroll releases and the band + footer scroll normally.
- **Source ref:** none (new page, no design-final HTML); pattern = leeroy.ca/contact;
  entrance reuses the shared `.r-word` reveal primitive + `SplitText`.
- **Implementation note:** `src/lib/animations/useContactIntro.ts` (`useGSAP`, scope =
  section ref). The first screen becomes a 100vh `.stage` ONLY under
  `html.js + @media (min-width:1024px) and (prefers-reduced-motion: no-preference)`
  (header `position:absolute; inset:0; width:auto` flex-centred; card centred in flow).
  The hook's JS guards mirror that media query EXACTLY — else it would hide a header +
  card with no stage to play in. Title + lead + card armed `opacity:0` in CSS to kill a
  first-frame flash; the hook sets the real start poses (word masks, lead offset, card
  below the fold) pre-paint. `.title :global(.r-word){ padding-bottom:0.1em }` gives the
  "g" descender headroom in the mask (at rest and during the reveal).
- **Feasibility / constraints:** reduced motion / mobile (<1024) / no-JS → the stage
  rule never applies and the page is the settled static flow (header above card above
  band), so the lead copy is always readable; the hook early-returns with
  `clearProps:"all"` on title/lead/card/words. `y` uses a px value computed from
  `innerHeight` (not a `vh` string) so GSAP gets a concrete transform;
  `clearProps:"transform"` on the card avoids the inline-transform-vs-breakpoint
  shadowing gotcha on a later resize. Timing (`exitAt`, durations, `scale` amount) is
  the easy knob to tune.

### Contact form — audience toggle glide + submit roll-swap

- **What:** two CSS-only interactions on the form card. (1) The individual/advisor
  segmented control: a single blue pill (`.thumb`, absolutely positioned at half the
  inner width) GLIDES between the two halves via `transform: translateX(0 ↔ 100%)`
  (0.45s `--pp-ease-out`), driven by `data-pos={audience}`; the segments no longer
  paint their own background — only their text color crossfades (active → white). Reads
  as one connected element sliding, not two buttons recoloring. (2) The submit button
  now carries the shared `.pp-btn` roll-swap (pill fills bone, label rolls up to Proxy
  Blue) — same mechanic as the Hero/Profiles CTAs; it stays a real `<button
  type="submit">` (so it keeps the `.pp-btn__roll/__main/__clone` markup inline rather
  than swapping in `PpButton`, which is an `<a>`), and `.submit` is trimmed to just the
  form-width sizing.
- **Implementation note:** `Contact.module.css` `.toggle`/`.thumb`/`.seg` +
  `.submit`; thumb inset matches the toggle padding at both breakpoints so
  `translateX(100%)` lands exactly on the second half. Reduced motion drops the thumb
  transition. No JS — React state flips the `data-pos`/`data-active` attrs, CSS animates.
