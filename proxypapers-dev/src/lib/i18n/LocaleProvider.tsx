"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type ReactNode,
} from "react";
import type { Dictionary, Locale } from "@/data/locales";

type LocaleContextValue = { locale: Locale; dict: Dictionary };

const LocaleContext = createContext<LocaleContextValue | null>(null);

// Holds the active locale + its dictionary for the whole client tree. Rendered by
// the [locale] layout, which loads the dictionary on the server and passes it down
// (the dict is plain JSON, so it serializes across the server→client boundary).
export function LocaleProvider({
  locale,
  dict,
  children,
}: {
  locale: Locale;
  dict: Dictionary;
  children: ReactNode;
}) {
  const value = useMemo(() => ({ locale, dict }), [locale, dict]);
  return (
    <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
  );
}

function useLocaleContext(): LocaleContextValue {
  const ctx = useContext(LocaleContext);
  if (!ctx) {
    throw new Error("useLocale/useContent must be used within <LocaleProvider>");
  }
  return ctx;
}

// The active locale (e.g. "fr").
export function useLocale(): Locale {
  return useLocaleContext().locale;
}

// Returns one section of the active dictionary, e.g. `useContent("hero")`. The
// return type is the exact shape of that section in src/data/en, so components
// keep the same typed object access they had with a static JSON import.
export function useContent<K extends keyof Dictionary>(key: K): Dictionary[K] {
  return useLocaleContext().dict[key];
}

// Returns a helper that prefixes the active locale onto internal hrefs, leaving
// anchors / external / mailto / tel links untouched. `/` → `/fr`, `/contact` →
// `/fr/contact`, `#` and `mailto:` pass through. Already-prefixed paths are kept.
export function useLocalizedHref(): (href: string) => string {
  const { locale } = useLocaleContext();
  return useCallback(
    (href: string) => {
      if (!href || !href.startsWith("/")) return href;
      if (href === `/${locale}` || href.startsWith(`/${locale}/`)) return href;
      return href === "/" ? `/${locale}` : `/${locale}${href}`;
    },
    [locale],
  );
}
