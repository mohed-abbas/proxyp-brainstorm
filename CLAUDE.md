# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

The rebuild of the **Proxy Papers** brand and website. As of now the directory holds the brief, brand assets, and HTML/CSS/GSAP prototypes — there is **no production codebase yet**, no build/lint/test commands, and it is not a git repo.

## Prototyping workflow (current phase)

We are **not** building in Framer yet. The current phase is **refined prototypes in plain HTML + CSS + GSAP** — to nail motion and look-and-feel before committing to Framer later. Keep prototypes dependency-light (GSAP via CDN, no build step) so they open directly in a browser.

We are prototyping three sections, in this order:
1. **Welcome / onboarding screen** — the branded entry moment shown *before* the landing page (a distinct screen, not the hero).
2. **Hero section** of the landing page.
3. **Second section**, directly below the hero.

Prototypes live under `prototypes/<NN-name>/` (one self-contained folder per section). Open `index.html` directly in a browser, or serve the folder (`python3 -m http.server` from `prototypes/`) — needed for automated/headless testing since some browsers block `file://`. CDN assets (GSAP, fonts) require internet.

Status — welcome-screen concepts built (each is a full welcome → hero → scroll demo, light + dark, light default):
- `01-welcome/` — "Gradient Awakening" (client said no; **kept as reference only, do not modify** — it's for the client's designer friend).
- `02-mark-reveal/` — "The Mark Reveal": the P-mark assembles (bone stem + blue blade slide together), wordmark reveals letter-by-letter, tagline rises.
- `03-chaos-to-order/` — "Chaos to Order": 7 scattered document cards drift in, snap into a tidy stack, dissolve as the mark resolves out of it.
- `04-editorial-statement/` — "Editorial Statement": "Votre patrimoine est structuré." / "Vos données, rarement." reveal word-by-word (accent blue on the turn), then resolve to the lockup.

SHARED MECHANIC (02/03/04, built once, identical across them): the logo + wordmark are ONE persistent element (`#lockup` inside a fixed full-screen `.brand-stage` flex-centered). After the intro it rests centered in the hero; a GSAP **ScrollTrigger** (scrub) shrinks it and translates it to the **navbar centre** (lands at y=32px, ~30px tall) and it pins there — the Naked City Films behavior. The navbar surface (blur + hairline) fades in past 40px scroll. Design rule that keeps the FLIP conflict-free: **intros only animate opacity + their own overlay elements, never the lockup's transform** — scale/translate of the lockup belongs solely to the scroll mechanic. Theme is persisted in `localStorage` (`pp-theme`); the mark's stem uses `--mark-ink` so it flips per theme while the blade stays Proxy Blue. Reduced-motion skips intros to the settled state. Concepts differ ONLY in the welcome intro choreography.

Hero explorations (Revolut-inspired motion craft — *not* the consumer aesthetic). Each is a standalone hero with the persistent lockup already resting in the navbar (the welcome→nav FLIP is proven in 02–04 and composes on top); focus here is hero LAYOUT. All reuse a shared "Papers Box" product card (glass surface, document-folder rows, 3D tilt) plus floating chips (échéance with progress ring, accès notaire) that stagger in and **mouse-parallax** by `data-depth`. Light + dark, light default.
- `05-hero-product/` — split: oversized headline left, Papers Box card right in 3D, parallax chips. The flagship translation.
- `06-hero-overlap/` — huge centered headline with the card overlapping its baseline (depth trick).
- `07-hero-immersive/` — product-forward: card centred & larger, three orbiting chips, continuous idle float, atmospheric glow.

Welcome layout explorations:
- `08-welcome-layouts/` — switcher morphing between four arrangements (Centré / Éditorial lower-left / Scindé with hairline seam / Ancré masthead-with-tagline-as-statement). Pure CSS-transition morph (every part anchored via top/left + translate so it morphs cleanly — Flip was tried and abandoned because it left stale transforms).

`prototypes/index.html` is a gallery linking all of the above. Note the HTTP server in this session served the **project root**, so prototypes are at `/prototypes/<name>/`.

Hero copy uses positioning-by-negation ("Ni votre banque, ni votre notaire…") and the trust strip (RGPD · NF203 · EU AI Act · tiers de confiance · hébergement souverain). The dedicated below-hero "second section" is still the next prototype to flesh out.

Asset notes for prototyping:
- **PP Neue Montreal** is a commercial typeface (Pangram Pangram). If the font files aren't present locally, prototype with a close free fallback (e.g. a neo-grotesk like Inter/Neue Haas substitute) and note it, rather than blocking.
- Only PNGs of the logo exist (`brandguide/`); there is no logo SVG yet. The P-mark (icon opened at 45°, blue + bone-white halves) likely needs to be rebuilt as SVG for animation.

Source material in this directory:
- `Proxy_Papers_Company_Overview.txt` — the company/offer/positioning narrative (the source of truth for *what Proxy Papers does* and the copy facts).
- `Proxy_Papers_Discovery_Questionnaire_FILLED.txt` — the client's design brief. **This is the most important document.** Read it before making any design or copy decision; it defines what to chase and what to avoid.
- `brandguide/*.png` — the finalized brand guideline deck (palette, typography, logo usage, brand-in-use, tone). These are screenshots from the Figma "PP Brand Guideline" file and override anything looser in the brief.
- `inpos.txt` — reference URLs (Naked City Films, Revolut, Vooban) for inspiration.

## The brand contract (do not violate without being told to)

This is a premium service for French high-net-worth individuals (founder-owners, €5–30M assets, advised by notaries/CPAs/wealth managers). The single strongest design instruction from the client: **do less, do it better, give it room. Restraint reads as confidence; over-design reads as compensation.**

**Palette** — three restrained colors, each with a fixed role:
- Proxy Blue `#5A90F4` (RGB 48/93/221 per the deck) — accent only; reserved for moments the brand is introduced at full presence. Used sparingly.
- Chinese Black `#161718` — structural ground; holds document surfaces and backgrounds.
- Bone White `#F7F4F0` — warm off-white; carries typography and breathing space.
- The brief asks for a deep dark palette with **subtle gradient** depth (Finary-like), **not flat pure black**.

**Typography** — **PP Neue Montreal** everywhere (headlines, body, UI). Weights: Thin, Book, Medium, Bold. Chosen partly because it handles French diacritics cleanly.

**Logo** — P-motif icon (opened at 45°, blue + bone-white halves) + "Proxy Papers" wordmark. Keep the P motif recognizable. The name, the tagline, "gestion privée des données", the five-step method (Lancement → Organisation → Suivi → Support → Gestion), "Papers Box", and the three profiles (Essentiel / Signature / Exception) are all locked.

**Voice** — French is the primary language (architect for an English version from day one, but ship French first). Always **vouvoiement**, but warm and direct: short sentences, real verbs, no jargon — closer to a well-written letter than a banking brochure.
- Approved vocabulary: gestion privée des données, conseiller dédié, technologie souveraine, pionnier, sur-mesure, tiers de confiance, discrétion, structurer, sécuriser.
- Banned: "administratif", "patrimoine" used alone, "solution", "numéro 1"/"le seul"/"leader" (use *pionnier*), "disruptif"/"révolutionnaire"/"game-changer", "coffre-fort numérique" as the lead term.
- Tagline **"Un conseiller dédié. Une technologie souveraine."** appears prominently on the homepage hero — not buried in the footer, not repeated on every page.

**Adjectives to hit:** Sovereign, Discreet, Meticulous, contemporary. **Failure adjectives:** Corporate, Stuffy, Generic.

**Hard avoids:** gold or cream+gold (the old "My Papers & Co" identity — deliberately abandoned); pure jet black; pastels; generic corporate/bank blue; SaaS illustration styles (Stripe/Linear/Notion pastel blobs); stock photos of suited men shaking hands. Anything that reads as a private bank, law firm, or fintech SaaS landing page (explicit anti-references: chevalblanc-patrimoine.fr, oddo-bhf.com) is a miss.

**Visual north stars:** Osmose (`osmose.co` — editorial warmth, restrained serif, breathing space) is the primary reference. Finary (dark gradient depth) and Revolut (motion craft) are secondary — **motion is seasoning, not the dish**: hero reveal, scroll transitions, one product-feel moment on the Papers Box section. Never motion for its own sake.

## Additional inspiration references (`inpos.txt`)

Three more sites the client flagged. Each is a *technique* reference, not a brand to copy — pull the listed quality, leave the rest. (All three are bot-blocked to plain fetch; render them in a browser to study.)

- **Naked City Films** (`nakedcityfilms.com`) — a full-bleed, near-black deep-navy ground with a single bold display logotype, motion-forward: an animated intro where the mark cycles accent color and shifts position. *Take:* the confidence of a very dark canvas carrying one strong element and letting motion do the reveal — directly supports the dark-palette-with-restraint direction. *Leave:* the loud neon accents (green/orange) — our accent is Proxy Blue, used sparingly.
- **Revolut** (`revolut.com/fr-FR`) — already named in the brief for **motion/3D craft**. Full-bleed photographic hero with oversized headline type overlapping the image, and floating UI cards (balance, a "Salaire" notification) layered with depth and animated on scroll. *Take:* the layered, product-feel motion for the Papers Box moment. *Leave:* the consumer-fintech brand, photography style, and density — too mass-market for our audience.
- **Vooban** (`vooban.com`) — a French AI/digital-transformation studio: full-bleed electric-blue hero with an **oversized white wordmark bleeding across the viewport** and a tilted, glassy product-UI card with subtle depth. *Take:* the idea of a dominant brand color at full presence plus a tilted glass product mockup — a model for introducing Proxy Blue "at full presence" and for showing the Papers Box interface. *Leave:* the flat saturated electric blue used everywhere (ours is an accent on a dark ground, not the field) and the busier agency layout.

## Homepage job (from the brief)

Traffic is overwhelmingly **referral** from trusted advisors, so the homepage **confirms a positive expectation rather than selling from zero**. Within the first screen it must make clear, by negation, what Proxy Papers is *not* (not a CGP, not a lawyer, not a bank, not a storage tool) as well as what it is. Success = quality of bookings + prescripteur (referrer) adoption + the site replacing the opening sales pitch — not traffic or SEO. Certifications that must appear credibly somewhere: RGPD, NF203 coffre-fort, EU AI Act, tiers de confiance fiscal, sovereign hosting (Infomaniak, France-only).

## Production build — `proxypapers-dev/` (Next.js port)

The production site is being built in `proxypapers-dev/` by porting `design-final/`
(the source of truth) section by section. The full rules and approach live in
`PROMPT.md`; the plan and dev notes live in `dev-docs/` (`PORT-PLAN.md`,
`DETAILS.md`, `ISSUES.md`) and `ANIMATIONS-HUB.md`. Key conventions:

- **`proxypapers-dev/` is NOT the Next.js you know.** It is Next.js 16 (App Router,
  React 19), which has breaking changes vs. older versions. **Read the relevant
  guide in `proxypapers-dev/node_modules/next/dist/docs/` before writing app code**
  (see `proxypapers-dev/AGENTS.md`). Leave `AGENTS.md` and `proxypapers-dev/CLAUDE.md`
  untouched.
- **No TailwindCSS.** Styling is CSS Modules per component + global tokens in
  `src/app/globals.css` (ported from `design-final/styles/theme.css`).
- **Animations** use `gsap` + `ScrollTrigger` + `lenis` via `@gsap/react` `useGSAP`
  and a root `LenisProvider`, and must match the source exactly. Every animation is
  catalogued in `ANIMATIONS-HUB.md`.
- **Content** is externalized as i18n-ready JSON in `proxypapers-dev/src/data/en/`
  (English first). `proxypapers-dev/` stays code-only; meta/dev docs live at the
  repo root.
- **Before each commit:** `npm run build` + `npm run lint` must pass. Commit locally
  per section; push only when asked. **No AI/Claude mention in commit messages.**

## Figma MCP integration

How to translate Figma inputs into code for this project. Follow these for **every
Figma-driven change**. (Note: these are always-on context — they govern behavior
only when you are actually doing Figma work.)

### Required flow (do not skip)

1. Run `get_design_context` first to fetch the structured representation for the
   exact node(s).
2. If the response is too large or truncated, run `get_metadata` for the high-level
   node map, then re-fetch only the required node(s) with `get_design_context`.
3. Run `get_screenshot` for a visual reference of the node variant being implemented.
4. Only once you have **both** `get_design_context` and `get_screenshot`, download any
   needed assets and start implementing.
5. Translate the output into **this project's** conventions — see below. Reuse the
   project's tokens, components, and typography wherever possible.
6. Validate against Figma for 1:1 look and behavior before marking complete.

### Implementation rules (adapted to this repo)

- The Figma MCP emits **React + Tailwind**. Treat it as a representation of design and
  behavior, **not** final code style. **This project has no Tailwind** — strip the
  utility classes and re-express styling as **CSS Modules per component + the global
  `--pp-*` tokens** in `proxypapers-dev/src/app/globals.css` (see the `proxypapers-dev`
  port rules above).
- **Reuse existing shared components** from `proxypapers-dev/src/components/shared/`
  (e.g. `PpMark`, `Navbar`, `Menu`) and existing typography/spacing rather than
  duplicating. Place new shared UI under `src/components/shared/`.
- Use the project's **color system, typography scale, and spacing tokens** (`--pp-*`)
  consistently; avoid hardcoded values where a token exists. Avoid inline styles
  unless truly necessary.
- Respect existing routing, state management, and data-fetch patterns (App Router,
  React 19, content in `src/data/en/`). Animations stay `gsap`/`ScrollTrigger`/`lenis`
  per `ANIMATIONS-HUB.md`.
- Strive for **1:1 visual parity** with the Figma design. On conflict, prefer
  design-system tokens and adjust spacing/sizes minimally to match visuals. Validate
  the final UI against the Figma screenshot for both look and behavior.
- Follow **WCAG** accessibility requirements; add brief component documentation.

### Assets

- The Figma MCP server has an assets endpoint that serves images and SVGs.
- If the server returns a **localhost source** for an image or SVG, **use that source
  directly** — do **not** create or substitute placeholders.
- **Do NOT add new icon packages** — all assets should come from the Figma payload.
