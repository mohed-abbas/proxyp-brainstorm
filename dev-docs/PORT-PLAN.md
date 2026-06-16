# Port the Proxy Papers landing page (design-final/hero.html) to Next.js

## Context

`design-final/` is a finished, plain HTML/CSS/GSAP landing page — the **source of
truth**. We are porting it, section by section, into the freshly scaffolded
Next.js app at `proxypapers-dev/` (Next 16.2.9, React 19.2.4, TS 5). The goal is a
production-grade, maintainable codebase that reproduces the design and its
animations **exactly**, with content externalized for future i18n.

Confirmed decisions:
- **Folder layout:** `src/` + per-section co-location (component + its CSS module).
- **Styling:** CSS Modules per component + a global `globals.css` for tokens,
  reset, theme contexts (`.pp-theme-*`) and shared primitives (`.r-word`,
  `.page-frame`). **No Tailwind** (removed entirely).
- **Animations:** `gsap` + `ScrollTrigger` + `lenis`, wired the React way via
  `@gsap/react` (`useGSAP`) and a root `LenisProvider`. Motion must match source.
- **Dev-docs:** written with `/stop-slop` once you install it.
- `proxypapers-dev/` stays **code-only**. Meta/dev docs (`dev-docs/`,
  `ANIMATIONS-HUB.md`, `PROMPT.md`) live at the **repo root**. App **content**
  (`/data` JSON) lives **inside** `proxypapers-dev/src/data` (it's app content).
- Commit **locally** per section after build+lint pass. No push until you say so.
  No AI/Claude mention in commit messages (and no Co-Authored-By trailer).

## Source map (from exploration)

- **One page, 11 visual regions** in `hero.html` (document order): Onboarding
  overlay → Navbar → Menu → Hero → `.page-frame` { Problem } → Profiles → Method
  → Trust → Referrers → Closing → Footer. Navbar/Menu are fixed; several sections
  are full-bleed "exceptions" that sit *outside* `.page-frame`.
- **13 CSS files** under `styles/` (theme + per-section). `theme.css` maps 1:1 to
  `globals.css` (tokens: `--pp-blue #5a90f4`, `--pp-ink #161718`, `--pp-bone
  #f7f4f0`; `--pp-font`; `--pp-ease-out`; theme contexts; `.r-word`; `.page-frame`).
- **`scripts/hero.js`** (~1266 lines) = one Lenis + one ScrollTrigger registry and
  ~14 animation functions: `setupOnboardingIntro`, `runCurtain`, `buildHeroIntro`,
  `buildConveyor`, `setupProblem`, `setupProfiles`, `setupMethod`, `setupTrust`,
  `setupCertsMarquee`, `setupReferrers`, `setupClosing`, `setupFooter`,
  `setupNavHandoff`, `setupNavTheme`, `setupMenu`, plus `splitWords` helper.
- **Assets** (all local, in `design-final/assets/`): fonts
  `ppneuemontreal-book.woff` (400) + `-bold.woff` (700); SVGs `pp-mark`,
  `pp-lockup`, `pp-watermark`, `hero-arc`, `problem-accent-underline`, `icon-grip`,
  `icon-instagram`, `icon-x`, `icon-linkedin`; WebP `clouds`, `grain`, `hero-lens`;
  PNGs `advisor-1..5`.
- **CDN deps to vendor as npm**: gsap 3.12.5, ScrollTrigger 3.12.5, lenis 1.1.18.

## Target structure (`proxypapers-dev/`)

```
src/
  app/        layout.tsx  page.tsx  globals.css      (page.tsx composes sections)
  components/
    sections/ Hero/ Problem/ Profiles/ Method/ Referrers/ Closing/
    shared/   Navbar/ Menu/ Footer/ Trust/  Onboarding/
              (each folder: Component.tsx + Component.module.css + index.ts)
  lib/
    gsap.ts            register ScrollTrigger once (client)
    lenis/             LenisProvider (context) + gsap.ticker + ScrollTrigger sync
    animations/        per-section useGSAP hooks (1:1 with hero.js functions)
  hooks/    useSplitWords / SplitText, useScrollReveal helpers
  data/     en/ hero.json problem.json profiles.json ... (typed content)
  types/    content + animation types
public/  fonts/  images/  icons/
```
Repo root (tracked): `dev-docs/DETAILS.md`, `dev-docs/ISSUES.md`,
`ANIMATIONS-HUB.md`, `PROMPT.md`; update repo-root `CLAUDE.md`.

## Key technical approach

- **Client islands:** animated sections are `"use client"`. Static copy is read
  from `src/data/en/*.json` via a tiny typed loader (`getContent(locale='en')`),
  so a future locale is a new JSON folder — no markup change.
- **Per-word reveal:** instead of runtime DOM splitting, a `<SplitText>` helper
  renders words pre-wrapped in `.r-word > .r-word__in` spans (SSR-safe, no flash);
  `useGSAP` targets them by ref. Mirrors `splitWords()` output exactly.
- **GSAP/Lenis lifecycle:** `LenisProvider` in `layout.tsx` creates one Lenis,
  drives it from `gsap.ticker`, and calls `ScrollTrigger.update` on scroll;
  `lib/gsap.ts` registers ScrollTrigger once. Each section's `useGSAP` builds its
  timeline scoped to the component ref, with `revertOnUpdate`/cleanup handled by
  the hook. Durations, eases, stagger, trigger %s copied verbatim from `hero.js`.
- **Scale model ports as-is:** `container-type: inline-size` + `cqw` + `min(vw,px)`
  are plain CSS — they move into modules unchanged. `.page-frame` and the
  full-bleed exceptions are reproduced in `page.tsx`'s composition.
- **Fonts:** `next/font/local` self-hosts the two PP Neue Montreal woffs (remove
  Geist). `next/font` exposes a CSS var consumed by `--pp-font`.
- **Next 16 caveat (AGENTS.md):** after `npm install`, read the relevant guides in
  `node_modules/next/dist/docs/` before writing app code — APIs may differ from
  training data. Keep `proxypapers-dev/AGENTS.md` + `CLAUDE.md` untouched.

## Work plan (each numbered step = build + lint + your review + local commit)

**Step 0 — Foundation (one commit, no review gate needed but I'll show you):**
1. `npm install`; then read `node_modules/next/dist/docs/` for Next 16 specifics.
2. Add `gsap`, `@gsap/react`, `lenis`. Remove `tailwindcss` + `@tailwindcss/postcss`;
   strip Tailwind from `postcss.config.mjs`, `globals.css`, `layout.tsx`, `page.tsx`.
3. Create `src/` tree; move `app/` → `src/app/`; set tsconfig alias `@/* → src/*`.
4. `globals.css` ← ported `theme.css` (tokens, reset, theme contexts, `.r-word`,
   `.page-frame`, Lenis base). Wire `next/font/local` fonts.
5. Recover **all assets** into `public/{fonts,images,icons}` (remove default
   `next.svg`/`vercel.svg` etc.). Inline SVGs (mark/lockup/grip) become small TSX.
6. `lib/gsap.ts`, `lib/lenis/LenisProvider`, `hooks/useSplitWords`; `data/` + `types/`
   scaffold; create `dev-docs/`, `ANIMATIONS-HUB.md`, `PROMPT.md`; update root
   `CLAUDE.md` (Next-16 rule, no-Tailwind, dev-docs convention). `npm run build` +
   `npm run lint` clean. Commit.

**Steps 1–10 — sections, in this order** (hero first per your instruction, then
document order; shared components built where first needed):
1. **Hero** (+ static Navbar shell so layout/positioning reads correctly).
2. **Navbar + Menu** (shared): `setupNavTheme` (IntersectionObserver theme flip) +
   `setupMenu` (open/close, focus trap, per-char hover stagger).
3. **Problem** (`.page-frame`): reveal + per-word + hover zigzag draw.
4. **Profiles**: pinned scroll-scrub 3D flip deck (vw→px conversion, fan entry).
5. **Method**: blue full-presence panel, cascading steps.
6. **Trust** (shared/reusable, content-prop driven): pinned panel expand + infinite
   certs marquee (`setupCertsMarquee`, pure CSS loop).
7. **Referrers**: orbital diagram + perpetual counter-rotating rings.
8. **Closing**: corner-anchored CTA reveal.
9. **Footer** (shared) + `setupNavHandoff` (navbar fades into footer).
10. **Onboarding overlay + curtain handoff** (capstone): `setupOnboardingIntro`,
    `runCurtain` (curtain wipe + mark settle into hero lens + cloud parallax),
    scroll-lock release. Ties Navbar + Hero together; done last because it depends
    on both. NOTE: the current `design-final` lands the mark in the hero lens
    (recent work) — port that landed behavior, not the old fly-to-navbar.

**Per-section loop:** (a) re-read the section's markup + CSS + JS from
`design-final/hero.html` to gather full context; (b) port markup → component,
copy → `data/en/*.json`, CSS → `*.module.css`, animation → `useGSAP` hook;
(c) append the animation to `ANIMATIONS-HUB.md` (template below); (d) log any
notable decisions in `dev-docs/DETAILS.md`, any source bugs/mismatches in
`dev-docs/ISSUES.md`; (e) `npm run build` + `npm run lint` clean; (f) **pause for
your review**; (g) commit locally on approval.

## ANIMATIONS-HUB.md entry template (rule 8 — written for *my* future use)

Per animation: **Name** · **Where** (section/element) · **User-facing description**
(how to describe/request it in plain words) · **Trigger** (load / scroll-trigger %s
/ scrub / hover / perpetual) · **Mechanics** (GSAP props, durations, eases,
stagger, from→to values, ScrollTrigger config) · **Source ref** (`hero.js`
function) · **Implementation note** (how to rebuild in React) · **Feasibility /
constraints** (gotchas, dependencies, reduced-motion behavior). Library only — not
executed; it's the context bank for future animation requests.

## Conventions applied throughout

- Clean, human-readable component code; **no long paragraph comments** in code —
  rationale → `dev-docs/DETAILS.md`, issues/corrections → `dev-docs/ISSUES.md`
  (both via `/stop-slop`).
- Build + lint pass is a hard gate before every commit (rule 9).
- Commit messages: plain, descriptive, **no AI/Claude mention**, no Co-Authored-By.
- Reduced-motion + no-JS paths preserved (settled state), matching source.

## Verification (per section + at the end) — Playwright MCP is the primary tool

1. **Playwright MCP** drives all visual/animation verification. Serve both apps
   (`npm run dev` for the port; `python3 -m http.server` at repo root for the
   `design-final` source), open each in Playwright at the **same viewport**
   (1512×900 reference, plus a narrow width), and:
   - screenshot the section in both and compare layout/spacing/typography;
   - trigger the animation via Playwright (scroll to the section, hover, reload for
     load-intros) and confirm timing, easing feel, and end-state parity;
   - `browser_evaluate` to assert key geometry (element rects/centers) and computed
     styles match the source where it matters (e.g. lens center, card sizes).
2. `npm run build` (no type/build errors) + `npm run lint` (clean) before every commit.
3. Final pass: full-page Playwright scroll-through at 1512px and a narrow width to
   confirm the `cqw`/`min(vw,px)` scale model + full-bleed exceptions behave like
   source; verify reduced-motion lands on the settled hero. Close the Playwright
   instance when done with each verification round.

## Files touched (representative, not exhaustive)

- New: `proxypapers-dev/src/**` (app, components, lib, hooks, data, types),
  `proxypapers-dev/public/{fonts,images,icons}/**`.
- Edited: `proxypapers-dev/{package.json, postcss.config.mjs, tsconfig.json}`,
  `proxypapers-dev/src/app/{layout.tsx,page.tsx,globals.css}`.
- Repo root: `dev-docs/{DETAILS.md,ISSUES.md}`, `ANIMATIONS-HUB.md`, `PROMPT.md`,
  `CLAUDE.md` (append port conventions + Next-16 note).
- Untouched: `design-final/**` (read-only source), `proxypapers-dev/AGENTS.md`,
  `proxypapers-dev/CLAUDE.md`.
