"use client";

import { useRef, useState } from "react";
import s from "./Contact.module.css";
import { useContent } from "@/lib/i18n/LocaleProvider";
import { SplitText, type SplitWord } from "@/components/shared/SplitText";
import { useContactIntro } from "@/lib/animations/useContactIntro";

// Inlined lucide icon paths (stroke=currentColor) — same hand-inline convention as
// CardIcon/Method, so no icon package is added. viewBox 0 0 24 24, 2px stroke.
const ICONS: Record<string, React.ReactNode> = {
  "chevron-down": <path d="m6 9 6 6 6-6" />,
  "at-sign": (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-4 8" />
    </>
  ),
  phone: (
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
  ),
};

function Icon({ name, className }: { name: string; className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {ICONS[name] ?? null}
    </svg>
  );
}

// Contact page — ported 1:1 from Figma (node 239:3, 1512×2479 artboard). On the
// Chinese-Black ground: a centred "Let's set a meeting." statement (the accent word
// turns Proxy Blue), then the discovery-meeting request form on a bone card (audience
// toggle, underlined fields, source select, consent, submit), and below it a form-footer
// band — the three meeting assurances (01/02/03) on the left, the direct-contact details
// on the right. Navbar + shared Footer wrap the page (see app/contact/page.tsx).
export function Contact() {
  const data = useContent("contact");
  const { header, form, assurances, alt } = data;
  const [audience, setAudience] = useState<"individual" | "advisor">("individual");
  const root = useRef<HTMLElement>(null);
  useContactIntro(root, s);

  // "Let's set a meeting." — the words reveal one-by-one (site reveal primitive);
  // "meeting." carries the blue accent.
  const titleWords: SplitWord[] = [
    ...header.title.lead.trim().split(" "),
    { text: header.title.accent, className: s.accent },
  ];

  return (
    <section className={s.contact} data-nav-theme="dark" aria-label="Contact" ref={root}>
      {/* Intro stage (motion only) — the header rests full-screen, then parts (title up,
          lead down) as the card rises into the centre. Static fallback: header above card. */}
      <div className={s.stage}>
        {/* Header (node 595:3) — the meeting statement + intro. */}
        <div className={s.header}>
          <SplitText as="h1" className={s.title} words={titleWords} />
          <p className={s.lead}>{header.lead}</p>
        </div>

        {/* Form card (node 239:81). */}
        <div className={s.card}>
          <form className={s.form} onSubmit={(e) => e.preventDefault()} noValidate>
            <div className={s.formHead}>
              <p className={s.eyebrow}>{form.eyebrow}</p>
              <p className={s.formTitle}>{form.title}</p>
            </div>

            {/* Audience toggle (node 242:408) — a segmented control whose blue pill
                glides between the two halves (.thumb) instead of each segment painting
                itself, so the selection feels like one connected element sliding over. */}
            <div className={s.toggle} role="radiogroup" aria-label="I am">
              <span className={s.thumb} data-pos={audience} aria-hidden="true" />
              <button
                type="button"
                role="radio"
                aria-checked={audience === "individual"}
                className={s.seg}
                data-active={audience === "individual"}
                onClick={() => setAudience("individual")}
              >
                {form.audience.individual}
              </button>
              <button
                type="button"
                role="radio"
                aria-checked={audience === "advisor"}
                className={s.seg}
                data-active={audience === "advisor"}
                onClick={() => setAudience("advisor")}
              >
                {form.audience.advisor}
              </button>
            </div>

            {/* Fields (node 242:460). */}
            <div className={s.fields}>
              <input
                className={s.field}
                type="text"
                name="name"
                autoComplete="name"
                placeholder={form.fields.name}
                aria-label={form.fields.name}
              />
              <input
                className={s.field}
                type="email"
                name="email"
                autoComplete="email"
                placeholder={form.fields.email}
                aria-label={form.fields.email}
              />
              <input
                className={s.field}
                type="tel"
                name="phone"
                autoComplete="tel"
                placeholder={form.fields.phone}
                aria-label={form.fields.phone}
              />
              <input
                className={s.field}
                type="text"
                name="situation"
                placeholder={form.fields.situation}
                aria-label={form.fields.situation}
              />

              {/* Source select (node 242:434) — underline row + chevron. */}
              <div className={s.selectRow}>
                <select
                  className={s.select}
                  name="source"
                  defaultValue=""
                  aria-label={form.fields.source}
                >
                  <option value="" disabled>
                    {form.fields.source}
                  </option>
                  {form.sources.map((src) => (
                    <option key={src} value={src}>
                      {src}
                    </option>
                  ))}
                </select>
                <Icon name="chevron-down" className={s.chevron} />
              </div>

              {/* Consent (node 242:448). */}
              <label className={s.consent}>
                <input className={s.check} type="checkbox" name="consent" required />
                <span className={s.consentText}>
                  {form.consent.lead}
                  <a className={s.consentLink} href={form.consent.href}>
                    {form.consent.link}
                  </a>
                </span>
              </label>

              {/* Submit (node 242:453) — shares the site CTA roll-swap (.pp-btn): the
                  pill fills bone on hover and the label rolls up to Proxy Blue. Stays a
                  real type="submit" button (PpButton is an <a>, can't submit), so it
                  carries the .pp-btn markup itself + .submit for the form-width sizing. */}
              <div className={s.submitRow}>
                <button type="submit" className={`pp-btn ${s.submit}`}>
                  <span className="pp-btn__roll">
                    <span className="pp-btn__main">{form.submit}</span>
                    <span className="pp-btn__clone" aria-hidden="true">
                      {form.submit}
                    </span>
                  </span>
                </button>
                <p className={s.note}>{form.note}</p>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Form-footer band (node 242:518) — flows below the intro stage. */}
      <div className={s.footerBand}>
          <ul className={s.assurances}>
            {assurances.map((a) => (
              <li key={a.n} className={s.assurance}>
                <span className={s.assuranceNum}>{a.n}</span>
                <span className={s.assuranceText}>{a.text}</span>
              </li>
            ))}
          </ul>

          <div className={s.alt}>
            <div className={s.altCopy}>
              <p className={s.altTitle}>{alt.title}</p>
              <p className={s.altBody}>{alt.body}</p>
            </div>
            <div className={s.altContacts}>
              <a className={s.contactItem} href={`mailto:${alt.email}`}>
                <span className={s.contactIcon}>
                  <Icon name="at-sign" className={s.contactGlyph} />
                </span>
                <span className={s.contactLabel}>{alt.email}</span>
              </a>
              <a
                className={s.contactItem}
                href={`tel:${alt.phone.replace(/[^+\d]/g, "")}`}
              >
                <span className={s.contactIcon}>
                  <Icon name="phone" className={s.contactGlyph} />
                </span>
                <span className={s.contactPhone}>
                  <span className={s.contactLabel}>{alt.phone}</span>
                  <span className={s.contactHours}>{alt.hours}</span>
                </span>
              </a>
            </div>
          </div>
      </div>
    </section>
  );
}
