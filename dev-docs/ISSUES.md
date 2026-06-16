# ISSUES.md — issues & corrections

Problems found while porting, source/design mismatches, and how they were
resolved. One short entry each, newest at the bottom.

> Note: entries are kept human-readable and will be refined with `/stop-slop`
> once it is installed.

## Step 0 — Foundation

- _No issues._ Foundation builds and lints clean. Nothing from the source needed
  correcting yet.

## Step 1 — Hero

- _No source mismatches._ Geometry matches the source exactly (see DETAILS.md).

## Step 2 — Navbar + Menu

- **Language toggle shows FR as current on English content.** The source menu
  renders `FR | EN` with FR as the current language and EN as the alternate link,
  even though all the copy is English. Ported faithfully for now (in `nav.json`),
  but this is backwards for the English build and will need revisiting when the i18n
  layer is wired (the current locale should drive which language reads as active).

## Open / to watch

- **Hero intro trigger + card reveal (Step 10 handoff).** The source's hero intro
  is a paused timeline played by the onboarding curtain, and the brand card is
  revealed as the onboarding mark settles into it. The port currently auto-plays
  the intro on mount and reveals the card itself. When the onboarding/curtain is
  ported, move the trigger to the curtain and drop the port-only card reveal in
  `useHeroIntro`.
- **Onboarding scroll-lock.** The source locks scroll (Lenis stopped) during the
  welcome→hero handoff and releases it on ready. `LenisProvider` currently runs
  Lenis unconditionally; scroll-lock control must be added when the onboarding
  section (Step 10) is ported.
- **GSAP/Lenis version drift.** Port uses newer majors/minors than the source CDN
  pins. Watch for any easing/ScrollTrigger behavior differences during per-section
  Playwright parity checks.
