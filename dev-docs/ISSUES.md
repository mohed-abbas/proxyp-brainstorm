# ISSUES.md — issues & corrections

Problems found while porting, source/design mismatches, and how they were
resolved. One short entry each, newest at the bottom.

> Note: entries are kept human-readable and will be refined with `/stop-slop`
> once it is installed.

## Step 0 — Foundation

- _No issues._ Foundation builds and lints clean. Nothing from the source needed
  correcting yet.

## Open / to watch

- **Onboarding scroll-lock.** The source locks scroll (Lenis stopped) during the
  welcome→hero handoff and releases it on ready. `LenisProvider` currently runs
  Lenis unconditionally; scroll-lock control must be added when the onboarding
  section (Step 10) is ported.
- **GSAP/Lenis version drift.** Port uses newer majors/minors than the source CDN
  pins. Watch for any easing/ScrollTrigger behavior differences during per-section
  Playwright parity checks.
