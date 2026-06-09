# design-final

The **client-approved** redesign, built in plain HTML + CSS + GSAP + Lenis (no
build step — open or serve directly). This supersedes the look of
`design-perfect/`; the underlying logic and flow (welcome intro → persistent
lockup → scroll handoff) are carried over, only the layout and palette changed.

It is structured so it ports cleanly to React/Next later: global theme as
`globals.css`, per-screen layout as a CSS module, each screen as a component,
and the intro JS as a mount effect.

## Layout

```
design-final/
├── onboarding.html        # The branded entry moment (Proxy Blue, full presence) — its own page
├── hero.html              # The landing page: hero + problem sections, one scroll
├── styles/
│   ├── theme.css          # GLOBAL foundation — shared by every screen.
│   │                      #   palette tokens, @font-face, reset, Lenis base,
│   │                      #   theme contexts (.pp-theme-blue/-dark/-light),
│   │                      #   the shared .pp-lockup, the .r-word reveal primitive.
│   ├── navbar.css          # SHARED navbar (glass pill, .pp-nav); reads theme tokens.
│   ├── onboarding.css      # Onboarding layout only; reads theme tokens.
│   ├── hero.css            # Hero-section layout only; reads theme tokens.
│   └── problem.css         # Problem-section layout only; reads theme tokens.
├── scripts/
│   ├── onboarding.js       # Onboarding intro choreography + Lenis init.
│   └── hero.js             # Landing-page controller: hero intro + conveyor, the
│   │                       #   problem section's scroll-in reveal + zigzag hover,
│   │                       #   and the single shared Lenis + ScrollTrigger.
└── assets/
    ├── pp-lockup.svg        # Brand lockup (theme-coloured) — single source of truth.
    ├── pp-mark.svg          # P-mark icon only (theme-coloured).
    ├── pp-watermark.svg     # Giant P-mark watermark (currentColor).
    ├── hero-lens.webp       # Blue "horizon lens" bowtie band (also masks the clouds).
    ├── hero-arc.svg         # Gradient hairline arc tracing the lens edges (used twice).
    ├── problem-accent-underline.svg  # Hand-drawn blue underline under the PROBLEM eyebrow.
    ├── clouds.webp          # Soft cloud overlay (shared by both screens).
    ├── grain.webp           # Noise tile, used at 10% for depth.
    └── fonts/               # PP Neue Montreal (Book 400 / Bold 700).
```

### Screens

- **onboarding.html** — `.pp-theme-blue`. Its own page: the branded entry moment
  *before* the landing page. Proxy Blue at full presence: grain depth, corner
  clouds, watermark P, centred all-white lockup over a hairline loader. The brand
  resolves in; the welcome→hero scroll handoff composes later.

- **hero.html** — `.pp-theme-dark`. The **landing page**: one continuous scroll
  holding the hero section and the problem section under a single fixed navbar
  and one shared Lenis + ScrollTrigger. `hero.js` is the page controller. (When
  ported to Next, this is one route composed of `<Hero/>`, `<Problem/>`, … each a
  component + CSS module + mount effect.)

  - **Hero section** — a Chinese-Black canvas split by a Proxy-Blue *horizon lens*
    (a band pinched at the centre). Clouds bleed into the lens; a slow conveyor of
    document rows drifts through the waist; the brand P-mark sits in a glass card
    on the vertical axis. Headline above, positioning statement below. The
    conveyor data lives in `DOCS` in `hero.js`. Laid out inside a 1512×789
    `.hero__frame` scaled to viewport width (Figma `58:5` maps 1:1 internally),
    top-anchored and **dropped below the fixed navbar** (`padding-top` on `.hero`).
    The source frame layers the nav *over* the headline (fine as barely-there
    glass, but it slices the headline in a browser), so we give the nav its own
    clear band instead — preserving the hero's internal relationships.
  - **Problem section** (Figma `17:2`) — a left editorial column (`PROBLEM`
    eyebrow + hand-drawn blue underline, headline, body) and three hairline data
    cards on the right — VOLUME (tall, carrying the blue zigzag), FRICTION, RISK.
    Reveals on **scroll into view** (ScrollTrigger, `top 72%`, once) with the
    house per-word stagger; each card traces its zigzag on hover (`pathLength=100`
    normalises the draw across the three sizes). The cards are a natural `.map()`
    over a CARDS array when porting.

  *Onboarding is still a separate page; the welcome→hero lockup flight that joins
  it to the landing page is wired later. `hero.html` now effectively holds the
  whole landing page — consider renaming it `index.html` at the Framer/Next stage.*

### Shared components

- **Navbar** (`styles/navbar.css`, markup inlined per page) — a fixed glass pill
  pinned at the top (Figma 58:289): link pair left (Approach · Services), the
  centred P-mark, link pair right (Referrers · Contact). Bone-white Book 16px on
  a faint warm gradient with a hairline border + 3.7px backdrop blur. Geometry is
  vw-fractions of the 1512 frame, so it scales 1:1 with the design. The mark is
  inlined SVG so its parts recolor from the theme tokens; links have a pure-CSS
  hover "roll" (label up, duplicate in). Drop it on any screen by including
  `navbar.css` and the `<nav class="pp-nav">` block (ports to a `<Navbar />`).
  It is **`position: fixed`** so it persists across the sections below the hero
  and is the landing target for the welcome→nav lockup flight. Because it's
  fixed, the screens it sits on are top-anchored so the two share one origin.

## Conventions

- **Theme contexts** set the ground + lockup tone per surface. Onboarding uses
  `.pp-theme-blue` (brand at full presence → all-white lockup). Future dark/light
  screens use `.pp-theme-dark` / `.pp-theme-light` (blade flips to Proxy Blue).
- **Tokens, never hard-coded values.** Colours come from `--pp-blue / --pp-ink /
  --pp-bone`; layout lengths are fractions of the 1512×982 Figma frame (vw/vh).
- **Armed states** (`html.js …`) hold the intro's start; with no JS or reduced
  motion the page renders the settled state. The lockup reveal is a per-glyph
  clip-wipe; the same mechanic is proven in the prototypes.
- **The lockup markup is inlined** in the HTML so glyphs can be animated
  individually; it is byte-identical to `assets/pp-lockup.svg`.

## Run

From the repo root: `python3 -m http.server 8000`, then open
`http://localhost:8000/design-final/onboarding.html`. Targets Chrome.
