import "server-only";
import type { Dictionary, Locale } from "@/data/locales";

// Per-locale lazy loaders. Each dynamic import pulls a whole locale folder (via its
// index) on the server only — translation files never reach the client bundle.
const loaders: Record<Locale, () => Promise<Dictionary>> = {
  fr: () => import("@/data/fr").then((m) => m.default),
  en: () => import("@/data/en").then((m) => m.default),
};

// Loads the dictionary for a locale. Call from Server Components / layouts (e.g.
// the [locale] layout), then hand the result to <LocaleProvider> for the client
// tree to read via useContent().
export function getDictionary(locale: Locale): Promise<Dictionary> {
  return loaders[locale]();
}
