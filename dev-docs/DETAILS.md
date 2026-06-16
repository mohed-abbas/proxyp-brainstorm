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
