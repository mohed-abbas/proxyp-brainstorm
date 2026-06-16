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
