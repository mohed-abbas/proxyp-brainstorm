// Locale registry — the single source of truth for which languages exist, the
// default, and the cookie used to remember a manual choice. Client-safe: contains
// only plain values + a type re-export (erased at build), so the provider, the
// language switcher, and proxy.ts can all import it.
export const locales = ["fr", "en"] as const;

export type Locale = (typeof locales)[number];

// French is the brand-primary language (ship French first).
export const defaultLocale: Locale = "fr";

// Cookie that persists a manual language choice; read by proxy.ts on prefix-less
// visits so the user's pick overrides their browser's Accept-Language.
export const LOCALE_COOKIE = "pp-locale";

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

// The content shape, defined by the English dictionary. Type-only re-export, so
// importing this in a Client Component does not pull the English JSON into the
// browser bundle.
export type { Dictionary } from "@/data/en";
