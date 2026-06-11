# Footer Animation — "The brand comes home"

> Reverse bookend of the onboarding curtain. During onboarding the P-mark flew
> **up** into the navbar and pinned there across every section. At the bottom of
> the page it flies **back down**, grows into the footer lockup, and the footer
> assembles itself around it. Scroll up and the whole thing reverses — the mark
> shrinks back into the navbar, the footer empties out.

This document is the **agreed choreography**, not the code. Implementation lives
in `setupFooter` (`scripts/hero.js`) + `styles/footer.css`.

---

## The vision, in the user's words

1. Scroll past the `.closing` section → the footer below is **blank** (the
   surface is there, but nav / wordmark / legal are all hidden).
2. When the footer has risen to **~60% of the viewport**, the navbar logo
   **unpins**, then **moves + scales up** toward its resting place in the footer
   lockup.
3. Once the logo has **landed in its final position**, the **text reveals**
   (wordmark "Proxy / Papers", then the nav row, rules, and legal line).

So the order is strictly: **blank → logo flies & grows → logo lands → text in.**
Logo first. Text second. Never overlapping.

---

## The three actors

```
  NAVBAR (fixed, top)                       FOOTER (bottom of page, dark band)
  ┌─────────────────────────────┐          ┌────────────────────────────────────┐
  │ [P] Proxy Papers   ◦ ◦ ◦ ◦  │          │        Approach  Referrers …  (nav) │
  └─────────────────────────────┘          │   ────────────────────────────────  │
        │                                   │   [ BIG P ]   Proxy                 │
        │ the pinned mark…                  │               Papers                │
        │                                   │   ────────────────────────────────  │
        └───── flies down & grows ─────────▶│   © 2026 …            Terms  Privacy│
                                            └────────────────────────────────────┘
   THE FLYING CLONE = a position:fixed SVG copy of the navbar's stem+blade.
   It travels between the live navbar rect and the live footer-mark rect.
   At the end it's swapped 1:1 for the real .footer__mark (pixel-coincident).
```

---

## Scroll timeline (top → bottom)

Read top-to-bottom = scrolling **down** the page. `▓` = on screen.

```
SCROLL                VIEWPORT (what the visitor sees)              STATE
══════   ┌──────────────────────────────────────────────┐   ═══════════════════

 ░░░░░   │                                                │   PHASE 0 · approach
 [.closing section fills screen]  ……………………………………………       footer not yet in view
         │   « Votre patrimoine est structuré. »          │   navbar: [P]Proxy… pinned
         │                                                │   footer: blank, below fold
         └──────────────────────────────────────────────┘

         ── footer top crosses bottom edge ──────────────────  trigger ARMS (0%)

 ▒▒▒▒▒   ┌──────────────────────────────────────────────┐   PHASE 0 (cont.)
         │            …closing tail…                      │   footer rising, still
         │  ┌────────────────────────────────────────┐   │   BLANK (no text, no mark)
         │  │            (empty dark band)            │   │   navbar mark still pinned
         └──┴────────────────────────────────────────┴───┘

         ── footer top reaches ~60% of viewport ─────────────  ★ UNPIN TRIGGER ★

 ▓▓▓▓▓   ┌──────────────────────────────────────────────┐   PHASE 1 · the flight
   ·     │   [P]Proxy Papers ◦◦◦◦   ← navbar fading      │   navbar mark detaches;
    ·    │              · ·                               │   CLONE flies down +
     ·   │                 ╲                              │   grows (scale 1 → ~20×),
      ·  │   ┌──────────────╲─────────────────────────┐  │   power2.inOut.
         │   │               ◣  clone descending       │  │   stem INK→BONE as it
         │   │                  + scaling up           │  │   crosses onto the dark
         │   │                                         │  │   footer. blade stays BLUE.
         └───┴─────────────────────────────────────────┴──┘   FOOTER STILL BLANK.

         ── clone box == real footer-mark box (coincident) ──  ★ LAND / SWAP ★

 ▓▓▓▓▓   ┌──────────────────────────────────────────────┐   PHASE 2 · text in
         │                          (navbar gone)         │   clone → swapped for the
         │   ┌─────────────────────────────────────────┐ │   real .footer__mark.
         │   │  Approach  Referrers  Services  Contact │ │   THEN, in order:
         │   │  ─────────────────────────────────────  │ │    1 nav words rise (mask)
         │   │  ┌─────┐                                 │ │    2 top rule draws in
         │   │  │ ███ │   Proxy                         │ │    3 wordmark lines rise
         │   │  │ ███ │   Papers                        │ │      "Proxy" then "Papers"
         │   │  │ ███ │                                 │ │    4 bottom rule draws in
         │   │  └─────┘  ─────────────────────────────  │ │    5 legal row fades up
         │   │  © 2026 Proxy Papers      Terms  Privacy │ │
         │   └─────────────────────────────────────────┘ │   navbar pill fully faded.
         └──────────────────────────────────────────────┘   BRAND HAS LANDED HOME.

         ── page bottom (maxScroll) ─────────────────────────  progress = 1, settled
```

---

## Progress map (single scrubbed ScrollTrigger, no pin)

The footer is **taller than the viewport**, so we can't pin — we scrub across
the footer's own scroll distance. `start: footer top hits viewport bottom`,
`end: page bottom`. One normalized progress `p ∈ [0,1]` drives everything.

```
 p   0.0        0.3        0.55       0.75        0.9         1.0
     │──────────│──────────│──────────│───────────│───────────│
     │  BLANK   │  BLANK   │  FLIGHT  │   TEXT     │   TEXT     │
     │          │          │  clone   │   nav +    │   word +   │
     │ footer   │ footer   │  flies & │   rules    │   legal    │
     │ rising   │ ~60% vp  │  grows   │   in       │   settle   │
     │          │  ★ARM★   │          │            │            │
     ▼          ▼          ▼          ▼            ▼            ▼
  nothing    nothing    mark        mark LANDED  wordmark     all
  visible    visible    detaches,   (swap), nav  lines rise,  settled,
  but the    (blank     descends,   words start  rule 2,      navbar
  empty      footer)    scales,     rising,      legal fades  fully
  band                  stem        rule 1 draws              gone
                        INK→BONE

  ── actor lanes (▓ = animating, ░ = idle/parked) ───────────────────────────
  navbar pill   ▓▓▓▓▓▓▓▓░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░   fades 0.45→0.6
  flying clone  ░░░░░░░░░░▓▓▓▓▓▓▓▓▓▓░░░░░░░░░░░░░░░░░░░░   p 0.55→0.78 visible
  real mark     ░░░░░░░░░░░░░░░░░░░░▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓   shown at land (swap)
  nav row       ░░░░░░░░░░░░░░░░░░░░▓▓▓▓▓░░░░░░░░░░░░░░░░   rises 0.78→0.88
  rules         ░░░░░░░░░░░░░░░░░░░░▓▓░░░░▓▓░░░░░░░░░░░░░   draw with their rows
  wordmark      ░░░░░░░░░░░░░░░░░░░░░░░░░░▓▓▓▓▓▓░░░░░░░░░   rises 0.84→0.94
  legal         ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░▓▓▓▓░░░░░   fades 0.9→0.98
```

> Numbers above are the **starting proposal** — the only hard rules are:
> (a) footer stays blank until the clone lands, (b) logo flight finishes before
> any text moves, (c) p=1 is pixel-exact on the real mark. Beat positions get
> tuned during verification.

---

## The "60% of viewport" trigger, precisely

"Footer reaches ~60% of the viewport" = the footer's top edge has risen to the
**60%-height line** of the screen (footer covering the bottom ~40%). In
ScrollTrigger terms that's roughly `start: "top 60%"` on `.footer`. Mapped onto
our `[0,1]` band it's the **★ARM★** point near `p ≈ 0.3` where the blank phase
ends and the flight begins.

```
            viewport
   0% ┌───────────────────┐
      │   .closing tail    │
      │                    │
  60% ├───────────────────┤  ◀── footer top crosses HERE → logo unpins
      │░░░░ blank footer ░░│
      │░░░░ (rising) ░░░░░░│
 100% └───────────────────┘
```

The flight itself then scrubs over the remaining scroll until the footer mark
reaches its natural resting spot (where the lockup actually sits in layout), at
which point the clone is swapped for the real mark.

---

## Geometry (measured live, never hardcoded)

Same FLIP shape as the onboarding `runCurtain`:

```
  navRect   = navbar .pp-nav__logo svg .getBoundingClientRect()   // fixed → stable
  markRect  = footer .footer__mark   .getBoundingClientRect()     // its on-screen spot
  scaleEnd  = markRect.height / navRect.height                    // ~20×
  the clone interpolates left/top/scale between navRect (p at ARM)
  and markRect (p at LAND); at LAND clone box == markRect → invisible 1:1 swap.
```

Recompute in `measure()` on init **and** on `ScrollTrigger refresh` (resize-safe).

---

## Edge cases / rules

- **Reduced motion / no-JS** — no clone, navbar untouched, footer just renders
  settled (mark + all text visible). The `.js` armed-hidden states only apply
  when JS is driving.
- **Reverse scroll** — fully reversible: text un-reveals, clone re-detaches from
  the real mark, shrinks back up into the navbar, navbar pill fades back in.
- **Theme** — footer is `data-nav-theme="dark"`; the clone's stem interpolates
  INK→BONE as it crosses onto the dark band, blade stays Proxy Blue.
- **Onboarding curtain owns the navbar logo opacity** until it has landed — the
  footer code must not touch `.pp-nav__logo` opacity before that (guarded so the
  initial ScrollTrigger refresh doesn't reveal it early).
- **Swap latch** fires only at the coincident point (`p` ≈ land), so the
  clone↔real-mark handoff is seamless in both directions.
