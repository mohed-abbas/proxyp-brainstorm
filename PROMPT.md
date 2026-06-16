# PROMPT.md — Proxy Papers Next.js port: rules & approach

The standing instructions for porting `design-final/hero.html` into the
`proxypapers-dev/` Next.js app. This is the canonical reference — revisit it
before each section.

## Goal

Port the complete landing page, **section by section**, from the source of truth
`design-final/` into `proxypapers-dev/`. Reproduce design and animation exactly.

## Rules

1. **Libraries** — install and configure `gsap` (+ `ScrollTrigger`) and `lenis`
   to match the source. Wire them the React way: `@gsap/react` `useGSAP` + a root
   `LenisProvider`.
2. **Folder structure** — production-grade `src/` + per-section co-location
   (chosen from proposed options). Comprehensive and easy to maintain.
3. **Assets** — recover all used icons, logos, images, fonts and place them in the
   recommended locations.
4. **Reusable components** — Navbar, Footer, and the **Trust** section are reused
   across pages; build them as shared, content-driven components.
5. **Port order** — section by section: **Hero first**, then the next, then next.
   Before each section, collect its complete context from `design-final/hero.html`.
   After each section, **pause for review** before moving on.
6. **No TailwindCSS** — use CSS Modules (chosen) + global tokens. Never Tailwind.
7. **Animations match the source exactly.**
8. **ANIMATIONS-HUB.md** — store a detailed description of every animation (name,
   how to describe it to the user, how it's defined, how to implement it, and a
   feasibility note). Written so *I* understand it better than the user, as a
   context bank for future animation requests. Library only — not executed.
9. **Build + lint** — check for build and lint errors consistently before every
   commit, so deployment is clean.
10. **Commit locally** section by section once done and tested. Push to remote all
    at once, later, only when the user says.
11. **/data content** — store static site content as JSON under
    `proxypapers-dev/src/data` (i18n-ready; English first). One place for all
    language strings.
12. **Clean code** — human-readable, no long paragraph-style comments in code.
    Emphasis / decisions go in `dev-docs/DETAILS.md`; issues / corrections in
    `dev-docs/ISSUES.md`. Write these with the `/stop-slop` skill, as human-
    readable as possible. `dev-docs/` is tracked.
13. **Commit messages** — no mention of AI / Claude usage.
14. **proxypapers-dev is code-only** — pre-existing AI docs (`AGENTS.md`,
    `CLAUDE.md`) are left as-is. Heed `proxypapers-dev/AGENTS.md`: this Next.js
    (v16) has breaking changes — read `node_modules/next/dist/docs/` before
    writing app code. That note has been added to the repo-root `CLAUDE.md`.

## Doc locations

- Repo root: `PROMPT.md` (this file), `ANIMATIONS-HUB.md`, `dev-docs/`,
  `dev-docs/PORT-PLAN.md`.
- Inside `proxypapers-dev/`: code + `src/data` content only.

## Also remembered (project memory)

- Verify visual/animation work primarily with the **Playwright MCP** (screenshots,
  triggering animations, geometry assertions against the source).
- Commit messages omit the `Co-Authored-By` trailer.
