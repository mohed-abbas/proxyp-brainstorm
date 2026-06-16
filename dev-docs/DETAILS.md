# DETAILS.md — decisions & things worth knowing

Notable decisions made while porting `design-final/` into `proxypapers-dev/`.
One short entry per decision, newest at the bottom.

> Note: entries are kept human-readable and will be refined with `/stop-slop`
> once it is installed.

## Step 0 — Foundation

- **Stack added:** `gsap` 3.15.x, `@gsap/react` 2.1.x, `lenis` 1.3.x. The source
  used GSAP/ScrollTrigger 3.12.5 + Lenis 1.1.18 via CDN; the newer npm versions
  are API-compatible. GSAP is registered once in `src/lib/gsap.ts`; Lenis runs in
  `src/lib/lenis/LenisProvider.tsx` and is driven by `gsap.ticker`.

- **Tailwind removed entirely.** Uninstalled `tailwindcss` + `@tailwindcss/postcss`,
  deleted `postcss.config.mjs`, and stripped the Tailwind import / `@theme` block
  from `globals.css`. Styling is CSS Modules per component + global tokens.

- **Fonts live in `src/assets/fonts/`, not `public/`.** `next/font/local` processes
  font files from a relative import path at build time (self-hosting, no layout
  shift), so the two PP Neue Montreal woffs are co-located for the font module
  (`src/lib/fonts.ts`) rather than served from `public/`. The generated family is
  exposed as `--font-pp-neue-montreal` and consumed by `--pp-font` in `globals.css`.

- **`src/` layout.** Moved `app/` to `src/app/` and set the path alias
  `@/* → ./src/*` in `tsconfig.json`. Components live under
  `src/components/{sections,shared}`, helpers under `src/lib` + `src/hooks`,
  content under `src/data/en`.

- **Turbopack root pinned.** A stray `package-lock.json` in `$HOME` made Next infer
  the wrong workspace root; `next.config.ts` sets `turbopack.root = __dirname` to
  fix it.

- **Asset placement.** Photographic/raster assets (clouds, grain, hero-lens,
  advisor avatars) → `public/images/`. SVG icons and brand marks → `public/icons/`.
  Brand marks that need to animate (P-mark, lockup) will become inline TSX when the
  hero / onboarding sections are ported.

- **Content is English.** The current `design-final` copy is already English, so
  `src/data/en/*.json` maps directly from the source.

## Step 1 — Hero

- **CSS Modules use camelCase class names.** The source uses kebab BEM
  (`.hero-lens`); the module renames them (`.lens`, `.docRow`, …) so JS can read
  `styles.lens` cleanly and GSAP can target `gsap.utils.selector(scope)` + the
  hashed module class. Styles are a faithful copy of `hero.css`; only the class
  *names* changed. The shared reveal primitive (`.r-word` / `.r-word__in`) stays
  global so timelines can select it across sections.

- **Armed states moved from CSS to GSAP.** The source hides the lens / conveyor /
  card / statement / words via `html.js .hero-* { opacity: 0 }`. The port renders
  the *settled* state by default (correct for SSR / no-JS / reduced motion) and the
  `useGSAP` hook arms the hidden state with `gsap.set` before playing. `useGSAP`
  runs in a layout effect, so arming happens before paint — no flash.

- **The brand-card mark stays an `<img>`, not the inline `PpMark`.** In the source
  the card loads `pp-mark.svg` via `<img>`, which is isolated: the page's theme CSS
  vars don't reach it, so its stem stays ink and blade stays blue even though the
  page is in the dark theme (where `--pp-lockup-ink` is bone). Inlining the SVG
  would inherit the dark theme and turn the stem bone (invisible on the bone card).
  So the card uses `<img src="/icons/pp-mark.svg">`. `PpMark` (inline) is reserved
  for the navbar / onboarding where the parts must be recolored/animated.

- **Hero intro plays on mount (for now).** See ISSUES.md — the source triggers it
  from the onboarding curtain. The port auto-plays and reveals the card itself
  until Step 10 reclaims that.

- **`<img>` lint rule disabled.** `@next/next/no-img-element` is off project-wide:
  the lens / clouds / arcs are CSS-masked and vw/cqw-scaled, where `next/image`'s
  wrapper + optimization interfere with the mask and object-fit scale model.

- **Parity check.** Playwright geometry at 1512×900 matches the source exactly:
  frame `0,121,1512,789`; lens `1512×595`; title 61px centered; brand card `84×85`
  centered at `756,542` (bone bg); statement box matching. The navbar is absent by
  design (Step 2).

## Step 2 — Navbar + Menu

- **One interactive unit.** `Navbar` owns the `open` state and renders the `Menu`
  overlay, because they're coupled: the Menu pill morphs into the Close affordance,
  the focus trap spans the button + panel, and `.is-menu-open` on the nav drives the
  pill/grip/label. Page composition is just `<Navbar /><Hero />`.

- **Theme via React state, not classList.** `useNavTheme` returns the current theme
  string and `Navbar` renders `pp-theme-${theme}`. The source mutated the nav's
  classList directly; in React that would be clobbered on the next render (e.g. when
  `open` toggles), so the hook returns state instead.

- **Lenis exposed via a ref context.** `LenisProvider` now provides a stable
  `RefObject<Lenis>` (not state) through context; `useMenu` reads `.current` to
  stop/start scroll. A first attempt used `useState` + `setState` inside the init
  effect, which trips Next 16's `react-hooks/set-state-in-effect` lint rule — the
  ref avoids both the lint error and an extra render. Falls back to
  `documentElement.style.overflow` when Lenis isn't ready.

- **Scrim is a real `<button>`.** The click-outside-to-close scrim is a full-bleed
  `<button aria-label="Close menu" tabIndex={-1}>` rather than a div-with-onClick,
  so it satisfies jsx-a11y without a disable comment. It sits outside the focus
  trap's element list, so Tab never lands on it.

- **Logo marks are inline `PpMark`, not `<img>`.** The navbar logo must recolor
  (stem flips bone on light sections), which an isolated `<img>` SVG can't do.
  `PpMark` gained an optional `label`: omitted → `aria-hidden` (decorative, the
  wrapping `<a>` carries the name); provided → `role="img"` + `aria-label`.

- **Nav link hover roll-to-blue (post-port change).** The original per-letter rise
  hover (`.linkChar` split + `linkRise` keyframe staggered by `--i`) was replaced with
  the same two-copy roll-to-blue used on the Trust certs, so both share one hover
  language. Each link now renders `.linkMain` (ink) + `.linkClone` (blue, `top:100%`)
  inside `.linkText`; on hover both `translateY(-100%)`. `.linkText` (the menu-open
  block-rise layer) gained `position:relative` so the absolute clone stays parented to
  it even when the open state sets `transform:none` (which would otherwise drop the
  transform-created containing block). The menu-open reveal itself is unchanged. CSS,
  not GSAP, for the same reason as the certs (no per-node listeners to lose) and for
  parity with that effect. `LinkChars` and the `linkRise` keyframe were removed.
  Descender headroom: the copies carry `padding:0.12em 0` and `.link` a matching
  `margin-block:-0.12em`, so the roll travels one *padded* line (clearing the "p"
  tails in "Approach" that a bare `-100%` left peeking at the mask top) while each
  link's text position and the column rhythm stay pixel-identical to the source
  (verified: text tops 123/196/269/342 in-panel).

- **Parity check.** Playwright at 1512×900: navbar renders bone logo card + Menu
  pill over the dark hero; opening the menu unfolds the bone card at panel rect
  `889,55,554×554` — identical to the source — with FR|EN, the four links, P-mark +
  socials, and the pill morphed to the dark Close chip. (A transient `x=874` read
  occurred when measuring synchronously on a fresh, pre-layout load; settled value
  is `889`.)

## Step 3 — Problem

- **Lives inside `.page-frame`.** The source opens a `.page-frame` wrapper just
  before the Problem section (and re-opens it later for Method), so `page.tsx`
  composes `<Problem />` inside a `<div className="page-frame">`. That gives the
  section its `cqw` basis (capped at 1512px). Profiles/Method below will sit
  outside the frame as in the source.

- **Zigzag is a shared `<Zigzag>` SVG component.** The blue zigzag path is byte-
  identical in all three cards, so it's one component rendered three times. The
  path carries `pathLength="100"` so the draw normalises across the differing card
  sizes (a single `strokeDashoffset 100→0` works for all).

- **Settled-by-default zigzag.** The module renders `.zigzagPath` with
  `stroke-dashoffset: 0` (drawn) — the correct no-JS / reduced-motion state (matches
  the source's `html:not(.js)` fallback). The `useProblem` hook then arms the live
  state: VOLUME starts undrawn and draws on the scroll reveal; the small cards rest
  invisible (`100`) and draw on hover.

- **VOLUME vs small cards.** VOLUME's zigzag is a load-in moment only (draws once on
  the reveal, no hover). FRICTION + RISK have no reveal-draw; they trace on hover and
  erase on leave. The hook splits the paths on identity (`!== volumePath`).

- **Hover listeners cleaned up via the `useGSAP` callback's return.** The two
  `mouseenter`/`mouseleave` handlers per small card are plain DOM listeners (not GSAP
  objects), so they're collected in a teardown array and removed in the cleanup
  function returned from the `useGSAP` callback (gsap.context honours it).

- **Word subsets re-queried by module-class descendant selectors.** After parking
  all `.r-word__in`, the timeline targets `.eyebrow .r-word__in`,
  `.headline .r-word__in`, `.body .r-word__in` (hashed module classes compose into
  descendant selectors via `gsap.utils.selector`), reproducing the source's separate
  `splitWords` calls and their distinct staggers.

- **Parity check.** Playwright at 1512×900 (section-relative rects): eyebrow
  `79.2,203.5,659.3×16.8`, headline `…,243.1,…×92.8`, body `…,358.9,545.5×118.8`,
  underline rule `79.2,220.3,74.3×9.8`, VOLUME `758.3,204.5,321.7×492`, FRICTION
  `1099.9,204.5,…×239.6`, RISK `…,469.8,…×226.7` — all identical to the source.
  Zigzag states match (VOLUME `dashoffset 0`, small cards `100`); hover on FRICTION
  drives `100→0` and back to `100` on leave. Screenshots are pixel-identical.

## Step 4 — Profiles

- **Shared button promoted to a global `.pp-btn`.** The CTA reuses the hero's pill
  button. Rather than duplicate it, the button moved out of `Hero.module.css` into a
  global `.pp-btn` primitive in `globals.css` (alongside `.r-word`, `.page-frame`,
  `.pp-lockup`). Hero's CTA now uses `className="pp-btn"`; Profiles' CTA uses
  `${s.cta} pp-btn` (`.cta` only positions it). Moving the rule between stylesheets
  doesn't change `cqw` resolution (it depends on the element's container ancestors,
  not the rule's origin), so the hero button is unchanged — verified identical.

- **Composed OUTSIDE `.page-frame`.** Like the source, Profiles is full-bleed; its
  own `.frame` (`width: min(100vw,1512px)` + `container-type`) re-creates the 1512
  basis so the deck's `cqw`/`calc` freeze at native size above the design width.

- **Cards identified by `data-profile` (not modifier classes).** Module classes are
  hashed, so the per-card colour/position rules key off `[data-profile="01|02|03"]`
  and the GSAP hook selects the same way. Card render order is `01,02,03`; stacking
  is set by explicit `z-index` (the source's DOM riffle order is irrelevant once
  z-index is explicit).

- **Fan offsets are design constants in the component, content is JSON.** The
  per-card `--rot/--dx/--dy` fan-entry vars live in a `FAN` map in `Profiles.tsx`
  (presentational), while `num/name/desc` + title/body/CTA copy live in
  `profiles.json`. The hook reads the rendered `--dx/--dy` via `getComputedStyle`,
  converts vw→px against the live viewport, and scales by the deck's live shrink
  factor (GSAP 3 doesn't resolve vw on `x/y`).

- **Front face needs no modifier class.** The source's `--front` face carries no
  styles (the base `.cardFace` + the pre-rotated `--back` are enough), so the port
  drops it — the front is just `.cardFace`.

- **Parity check.** Playwright at 1512×900: entry state (at pin start) has cards
  fanned — 01 `rotate(-10°)`, 02 flat with `−37.8px` x-shift, 03 `rotate(+10°)`, all
  flips at identity (fronts showing). Scrubbed to the pin end, all `.cardPos` resolve
  to identity (flat row), all `.cardFlip` to `rotateY(180°)` (backs: Essentiel /
  Signature / Exception), CTA opacity 1 — transforms identical to the source at both
  ends. Entry and resolved screenshots are pixel-identical (incl. the nav logo
  overlapping the title, which matches the source). Both CTAs render the shared
  `.pp-btn` (blue pill, ~45px radius).

## Step 5 — Method

- **Composed in the re-opened `.page-frame`.** The source closes the frame after
  Profiles and re-opens it for Method, so `page.tsx` wraps `<Method />` in a second
  `<div className="page-frame">`. The blue panel is capped inside the 1512 column
  (its 20px corners round against the page ground at the seams).

- **Straightforward port — no pin, no scrub, no hover-draw.** Method is the simplest
  section: a `once: true` scroll reveal (header words → step rows → link), built with
  plain flexbox (mirrors the Figma auto-layout). The only hover is the footer link's
  arrow nudge, which is pure CSS — the hook never touches it.

- **Two-clause inline title.** The title is two `<SplitText as="span">` segments
  ("Five steps," + muted "one single contact.") flowing inline on one line, with a
  literal `{" "}` between them so the clauses keep their space (the source relied on
  collapsed HTML whitespace between the two spans).

- **`text-box: trim-both` kept as-authored.** The giant step name uses the source's
  `text-box: trim-both cap alphabetic` (Chrome cap-to-baseline trim); ported
  verbatim — progressive enhancement, harmless where unsupported.

- **Parity check.** Playwright at 1512×900 (section-relative rects) is byte-for-byte
  identical to the source: title `75.2,138,630.7×50.9`, lede `837.6,140.5,584.1×45.9`,
  step 01 `75.2,307.8,1346.5×115.2`, step 05 `75.2,831.8,…`, link
  `1256.8,1065.7,164.9×25.9`; panel `rgb(90,144,244)` + `19.8px` radius. Screenshots
  pixel-identical; the `data-nav-theme="blue"` flip is handled by the existing nav
  observer.

## Step 6 — Trust (shared/reusable)

- **Lives under `components/shared/Trust`, content-prop driven.** Trust takes an
  optional `content: TrustContent` prop (eyebrow / certs / title lines / body),
  defaulting to `data/en/trust.json`, so other pages can reuse the band with their
  own copy. Composed OUTSIDE `.page-frame` (full-bleed exception) so the panel opens
  to the full viewport width.

- **One hook does both animations.** `useTrust` ports `setupTrust` (the pinned
  scrubbed expand) AND `setupCertsMarquee` (the clone-to-fill infinite strip),
  because both target the same section. Reduced motion returns early before either.

- **Marquee is CSS keyframes, not GSAP.** The hook only clones the authored cert set
  to fill the viewport and sets two custom props (`--marquee-shift`,
  `--marquee-duration`); the loop itself is a CSS `@keyframes` on the track. GSAP
  scales/raises the PARENT `.certs` during the open — never the track — so the
  track's pixel width is fixed and the loop never re-measures mid-open (the source's
  hard-won fix for the open-time stutter). The keyframe name is scoped by CSS
  modules along with its reference, so it resolves within the module.

- **Cloning React-rendered nodes is safe here.** `useTrust` captures the one
  authored set from the live DOM and `cloneNode`s it (matching the source exactly).
  Safe because the Trust component has no state and its parent never re-renders, so
  React never reconciles the cloned children away.

- **vw→px conversion for the collapsed offsets.** GSAP treats vw on transforms as
  px, so the collapsed card's `y`/`width` distances use `cap(vw,px) = min(vw→px,px)`
  against the live viewport (mirrors the CSS `min(vw,px)` caps, keeping the collapsed
  card Figma-accurate above 1512px).

- **Title lines are plain spans.** Only the body uses `<SplitText>` (per-word);
  the two title lines are plain `<span>`s — the timeline fades/rises line 2 and
  tweens the title colour, but doesn't split the title into words (matches source).

- **Parity check.** Playwright at 1512×900: collapsed (pin start) panel `440px`,
  eyebrow top, certs strip low + scaled, empty centre, no frame — pixel-identical to
  source. Scrubbed open: panel `1497px` (full viewport), frame opacity 1, body
  opacity 1, title `rgb(22,23,24)`, marquee scaled up with blue dots — content
  pixel-identical. `--marquee-shift` measured (`2656px` at 1512, 2 copies). The open
  band's vertical position + nav light-flip can't be exercised yet because Trust is
  currently the last section (no scroll runway past the pin); both will match the
  source once Referrers/Closing/Footer are composed below it (see ISSUES.md).

- **Cert hover roll-to-blue (post-port addition).** Each cert is wrapped in a
  masked two-copy element (`.certLabel > .certMain` ink + `.certClone` blue at
  `top:100%`); on `:hover` both `translateY(-100%)` so the ink word rolls out the top
  and a Proxy-Blue duplicate rolls up to replace it. Adapted from apechain.com's
  `SectionDiscoverApps` (not in design-final). **Driven by CSS, not GSAP, on
  purpose:** the marquee `cloneNode(true)`s cert nodes, which would drop per-node JS
  listeners, so a class-based `:hover` is the only approach that covers every clone
  for free (no rebinding on rebuild/resize). The descender buffer (`padding:0.12em 0`)
  lives on the copies, not the mask, so each copy is one padded line tall and the
  `-100%` roll lands the clone pixel-aligned with where main sat (verified:
  copy-height 61, clone parked at +61, hover lands at mask-top offset 0). Reduced
  motion disables the transition + hover transform.

## Step 7 — Referrers

- **Full-bleed, raw vw (outside `.page-frame`).** Like Trust/Profiles, the dark
  band runs edge-to-edge; the centred column + radar keep Figma size via
  `min(vw, px)` caps and scale down below 1512px. Height capped `min(100vh, 800px)`.

- **One 494×494 coordinate field.** Rings, centre mark and the five avatars all
  position as a % of a single absolutely-placed field (clipped to the top ~298/358),
  so the diagram is resolution-independent and ports 1:1 from the source.

- **Avatars are a `.map()` with data-attribute hooks.** `referrers.json` carries the
  five advisors (id + ring + img); the component renders two orbit layers
  (`data-ring="inner|middle"`) and the per-avatar positions live in the module as
  `.avatar[data-avatar="N"]` selectors (module classes are hashed, so geometry is
  keyed off stable data-attributes — same approach as Profiles' `data-profile`).

- **CTA kept section-local (not `.pp-btn`).** The shared `.pp-btn` primitive is
  `cqw`-based with a `translateY(-1px)/brightness(1.08)` hover; the Referrers CTA is
  full-bleed `vw`-based with `translateY(max(-2px,-0.1323vw))/brightness(1.07)` and a
  0.4s transition. To match the source exactly it stays a local `.cta` class.

- **Centre mark reuses `<PpMark>`.** The glassy chip wraps the shared inlined P-mark;
  `:global(.lk-mark__stem/blade)` recolour it via `--pp-lockup-ink/blade` (dark
  theme → bone stem, blue blade).

- **Orbit transforms don't conflict.** The reveal scales the `.avatar` span; the
  perpetual spin rotates the parent orbit layer; the upright-face counter-rotation
  is on the inner `<img>`. Three separate nodes → no transform clobbering.

- **Parity check.** Playwright at 1512×900 vs source: layout/typography/radar
  geometry match; reveal timing + the counter-rotating perpetual orbit match;
  `data-nav-theme="dark"` keeps the navbar dark over the band.

## Step 8 — Closing

- **Full-bleed bone band with a re-created 1512 frame.** Like Trust/Referrers the
  band runs edge-to-edge (raw vw, outside `.page-frame`); `.inner` is a
  `min(100vw, 1512px)` positioning context so the two CORNER-anchored blocks
  (headline absolute upper-left, action absolute lower-right) land on their Figma
  coordinates and freeze at/above 1512px. Band has `border-radius: min(1.3228vw,20px)`.

- **Plain underline link, not `.pp-btn`.** The CTA here is a Proxy-Blue text link
  with a bottom border + inline arrow (pure-CSS hover nudge), matching the Method
  link pattern — distinct from the pill buttons elsewhere, so it stays section-local.

- **`data-nav-theme="light"`.** Second light band after Trust; the navbar flips to
  its light (ink) surface over it.

- **Parity check.** Playwright at 1512×900 vs source: corner-anchored layout,
  oversized blue headline, right-set link + copy, and the word-by-word reveal all
  match; navbar flips light over the band.

## Step 9 — Footer (shared) + nav handoff

- **Full-bleed blue card, content capped per-metric.** Like the other below-hero
  bands the card runs edge-to-edge (raw vw, outside `.page-frame`); each content
  metric is `min(vw, px)` so the layout freezes at Figma size at/above 1512px while
  the atmosphere (grain + clouds) stays vw to keep filling wide screens. Rounded top
  corners only (`min(1.3228vw,20px) … 0 0`); `margin-top: 1rem` breathing gap.

- **P-mark reuses `<PpMark>`, recoloured all-bone.** The footer mark fills BOTH
  paths bone (not the themed stem/blade split), so the module overrides
  `:global(.lk-mark__stem/blade) { fill: var(--pp-bone) }` on `.markSvg`.

- **Columns + links are `.map()`s.** `footer.json` carries the two columns (id +
  aria-label + two link groups each); `data-col` drives the per-column width
  (88px vs 218px). The active link gets `.linkActive` (underline).

- **Nav handoff is a separate hook on the Navbar.** `useNavHandoff(navRef)` runs a
  scrubbed `autoAlpha` fade of the nav tied to the `<footer>` scroll position
  (`top 75%` → `top 15%`). The trigger is the stable `<footer>` tag (module classes
  are hashed). NOT gated on reduced motion — it's scroll-position driven and
  prevents the fixed nav from overlapping the footer's own nav (matches source).
  Carries `refreshPriority: -1` so it refreshes AFTER the pinned sections
  (Profiles/Trust): the Navbar mounts before them, so without this the trigger
  resolves its start/end against a pre-pin (too short) document and fires ~2400px
  early. See ISSUES.md (Step 9) for the full diagnosis.

- **`data-nav-theme="blue"`.** Over the footer the navbar takes its blue theme
  (mark all-bone) right up until the handoff fades it out.

- **Parity check.** Playwright at 1512×900 vs source: brand column, copyright,
  divider + column layout, link sizing/active underline, atmosphere, and the
  reveal cascade match; the nav pill fades out as the footer fills the screen.

## Step 10 — Onboarding overlay + curtain handoff (capstone)

- **One controller, three components.** The source merges onboarding → hero in a
  single IIFE (`setupOnboardingIntro` + `buildHeroIntro` + `runCurtain` + the asset
  gate). The port keeps the same single coordinator (`useOnboarding`, called from
  `<Onboarding>`) but the hero intro it plays is built in `<Hero>`. The paused hero
  timeline + idle starter are shared via a tiny `IntroProvider` (imperative
  `registerHero`/`getHero` over an internal ref — not a mutable context value, which
  the React-compiler lint forbids). Effect order is irrelevant: the curtain reads
  the handles on its async asset gate, by which point `<Hero>` has registered them.

- **Onboarding CSS lives in `globals.css`, not a module.** `onboarding.css` +
  `intro.css` are ported verbatim under their original global class names
  (`.ob-stage`, `.ob-cloud--*`, `.pp-nav-fly`, …). The overlay is one-off page
  furniture the controller queries directly; module-hashing those classes would
  break the queries for no benefit. Asset URLs rebased to `/images/*`.

- **`js` flag set pre-paint (inline script).** An inline `<script>` adds
  `documentElement.classList.add("js")` as the first body child (matches the
  source's head script), so `html.js .ob-stage { position:fixed; … }` applies from
  first paint and the hero never flashes before the overlay covers it. `<html>`
  carries `suppressHydrationWarning` so React leaves the script-added class alone.
  The controller removes `js` under reduced motion to land on the settled hero.

- **Settled-by-default still holds.** No-JS / reduced motion: the overlay is
  `display:none`, the hero card + navbar logo show (the `html.js [data-*]` arming
  doesn't apply), scroll is unlocked, and Lenis runs normally. With JS the overlay
  covers the hero, scroll is CSS-locked (`html.js:not(.pp-ready)`) AND Lenis is
  `.stop()`ed by `LenisProvider`, released on `.pp-ready`.

- **Cross-component elements reached by reference, not selector.** `useGSAP` runs
  the body inside a `gsap.context` scoped to the `.ob-stage`, which scopes selector
  TEXT to that element. The hero card + navbar logo live outside it, so they're
  resolved with `document.querySelector` and animated by element reference. (This
  was the one real bug found in verification — see ISSUES.md.)

- **Hooks for cross-module elements.** `data-axis-card` on the hero's lens card and
  `data-nav-logo` on the navbar logo give the controller stable selectors (module
  classes are hashed); `globals.css` arms both hidden via `html.js [data-…]` and the
  curtain reveals them. The hero card reveal was removed from `useHeroIntro` (the
  curtain owns it now); the cloud idle drift moved into a stored `idle()` the curtain
  starts (was auto-run on build).

- **Parity check.** Playwright at 1512×900 vs source: the welcome screen (blue
  ground, grain, corner clouds, watermark P, centred bone mark, loader) is pixel-
  identical; the settled hero matches exactly — card rect 714/500/84/85, card-img
  738/515/36/55, nav-logo 78/64/49/50, `pp-ready` set, overlay `autoAlpha 0`, fly
  faded, card opacity 1. Scroll releases (doc 9235px scrollable). Narrow width
  (390): the overlay scales as drawn. Nav-handoff window re-confirmed post-Step-10
  (deferred watch item): nav opacity 1 → 0.53 → 0 across scrollY 7745 → 8000 → 8285,
  i.e. at the footer, not early.

## Post-port — site-wide CTA / link hover roll

- **One hover language across all CTAs/links.** The masked roll-to-blue (shipped on
  Trust certs + menu links) was extended to every call-to-action. Two variants share
  the same mechanic (two padded copies in an `overflow:hidden` mask, clone at
  `top:100%`, both `translateY(-100%)` on hover, `0.5s` expo-out):
  - **Filled pills** (Hero / Profiles / Referrers) → **inverted roll**: the pill also
    transitions `background-color` blue→bone while the label rolls bone→Proxy-Blue. The
    bone label is invisible "to blue" on a blue ground, so per the user the pill fills
    bone and the label reveals blue — a real reveal, not a no-op. Dropped the old
    `brightness()` filter; kept the `translateY(-1px)` lift.
  - **Text links** → roll to blue: Hero secondary (faded-bone → blue, underline goes
    blue); Closing (defaulted main to `--pp-ink` so it rolls ink→blue — the link keeps
    `color:--pp-blue` so its underline + arrow stay blue; arrow keeps its nudge).
- **Shared `PpButton`.** Pills now render via `components/shared/PpButton`, which wraps
  the label in the `.pp-btn__main/__clone` structure; the invert + roll live on global
  `.pp-btn`/`.pp-btn__*` in `globals.css`. Hero and Profiles use it. **Referrers keeps a
  local copy** (`.cta` + `.ctaRoll/.ctaMain/.ctaClone`) because that CTA is deliberately
  not `.pp-btn` (full-bleed vw-based — see ISSUES.md Step 7).
- **Profiles centering vs the lift.** Profiles' `.cta` centers with
  `transform: translateX(-50%)`, which `.pp-btn:hover`'s `translateY(-1px)` would
  clobber (a horizontal jump). Fixed by wrapping `PpButton` in the positioning
  `div.cta` so the two transforms live on different elements. Verified: CTA centre x is
  stable on hover (726 → 726).
- **Verified (Playwright 1512×900).** All five: pill backgrounds compute to
  `rgb(247,244,240)` on hover, labels roll `translateY(-100%)`, clones `rgb(90,144,244)`;
  Closing rests ink with blue underline+arrow and rolls to blue. Build + lint clean.
