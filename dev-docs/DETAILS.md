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
