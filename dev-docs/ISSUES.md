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

## Step 3 — Problem

- _No source mismatches._ Geometry and zigzag states match the source exactly (see
  DETAILS.md). One TypeScript wrinkle worth noting: `gsap.utils.selector` returns a
  union of `HTMLElement` types, which doesn't overlap `SVGPathElement`, so filtering
  the zigzag paths against `volumePath` needs a cast (`volumePath as Element | null`)
  — purely a typing concern, no runtime effect.

## Step 4 — Profiles

- _No source mismatches._ Fan-entry and resolved transforms match the source
  exactly at both ends of the scrub (see DETAILS.md). Worth watching as more pinned
  sections land: each pinned section's `useGSAP` calls `ScrollTrigger.refresh()`;
  with multiple pins + Lenis, confirm pin push-follow stays correct once Method
  (also pinned) is added — a single coordinated refresh may read cleaner than
  per-hook refreshes.

## Step 5 — Method

- _No source mismatches._ Geometry byte-for-byte identical to the source (see
  DETAILS.md). Note on the earlier Profiles watch item: Method turned out NOT to be
  pinned (it's a plain `once` reveal), so the multi-pin refresh concern doesn't
  apply here — revisit only if a later section adds a second pin.

## Step 6 — Trust (shared/reusable)

- **Pin release + nav light-flip not yet observable (no runway).** Trust is
  currently the LAST section composed, so there is no scrollable content past its
  pin; the band can't scroll up to release, and its `data-nav-theme="light"` band
  never crosses the navbar centre, so the nav light (ink-pill) flip can't be
  triggered in isolation. The collapsed and open states themselves are verified
  pixel-identical. **Re-verify the release + nav light-flip once Steps 7–9
  (Referrers / Closing / Footer) are composed below Trust.**

## Step 7 — Referrers

- _No source mismatches._ Geometry (one 494×494 % field), reveal timing, and the
  perpetual counter-rotating orbit match the source exactly (see DETAILS.md). Note:
  the section's CTA was deliberately NOT folded into the shared `.pp-btn` — it is
  full-bleed `vw`-based with a different hover/transition, so a local `.cta` keeps it
  faithful (DETAILS.md). Now that Referrers sits below Trust, the deferred Trust pin
  release + nav light-flip can finally be exercised — re-verify during the next
  full-scroll parity pass.

## Step 8 — Closing

- _No source mismatches._ Corner-anchored geometry (re-created 1512 frame inside a
  full-bleed bone band) and the once-on-enter word reveal match the source exactly
  (see DETAILS.md). The CTA is a plain blue underline link (like Method's), not a
  pill — kept section-local.

## Step 9 — Footer (shared) + nav handoff

- **Nav handoff fired ~2400px too early (FIXED).** The handoff scrub completed while
  the footer was still ~2.4 screens below the fold — the navbar vanished around the
  Trust pin. Root cause: `useNavHandoff` lives in `<Navbar>`, which mounts BEFORE the
  pinned sections (Profiles/Trust), so the trigger was created before their pin-
  spacing existed. Worse, it never self-corrected: during `ScrollTrigger.refresh()`,
  triggers refresh in start-position order, and the handoff's stale start sorted it
  BETWEEN the two pins, so it re-measured the document before both pin-spacers had
  been applied — perpetuating the error (offset == Profiles + Trust pin spacing,
  ~2400px). The footer REVEAL trigger (born in `<Footer>`, after the pins) measured
  correctly, which isolated the cause. Verified live: a freshly-created probe trigger
  computed the correct start (7623) where the live handoff was stuck at 5214.
  **Fix:** `refreshPriority: -1` (+ `invalidateOnRefresh: true`) on the handoff so it
  refreshes LAST, after every pin has applied its spacing, resolving start/end against
  the full document height. Post-fix sweep: opacity 1 at footer-top 75%, 0.5 at 45%,
  0 at 15% — exactly the intended window. Watch item for Step 10: the onboarding pins
  /scroll-lock may shift document height again; re-confirm the handoff window then.

- Layout (full-bleed blue card, capped content) and the reveal cascade match the
  source exactly (see DETAILS.md). The handoff hook targets the `<footer>` tag
  (stable) rather than a hashed module class. With the footer composed, the Closing
  band's `data-nav-theme="light"` flip and the Trust pin release now have full
  runway — confirmed during this pass.

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
