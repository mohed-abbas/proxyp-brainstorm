"use client";

import { usePathname } from "next/navigation";
import {
  locales,
  LOCALE_COOKIE,
  type Locale,
} from "@/data/locales";
import { useLocale } from "./LocaleProvider";

// Short display labels per locale (the menu shows e.g. "FR | EN").
const LABELS: Record<Locale, string> = { fr: "FR", en: "EN" };

// Persists the manual language choice so future prefix-less visits remember it.
// Module-scoped so the cookie write isn't a mutation inside the component body.
function rememberLocale(next: Locale) {
  document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`;
}

// Swaps the leading locale segment of the current path for `next`, preserving the
// rest of the route so switching keeps you on the same page.
function swapLocale(pathname: string, current: Locale, next: Locale): string {
  if (pathname === `/${current}`) return `/${next}`;
  if (pathname.startsWith(`/${current}/`)) {
    return `/${next}${pathname.slice(`/${current}`.length)}`;
  }
  return `/${next}${pathname}`;
}

// Live language control. Renders the current locale plus a link to each other
// locale; clicking persists the choice in the pp-locale cookie (so future
// prefix-less visits remember it) and navigates to the matching page.
export function LocaleSwitcher({
  className,
  currentClassName,
  altClassName,
}: {
  className?: string;
  currentClassName?: string;
  altClassName?: string;
}) {
  const locale = useLocale();
  const pathname = usePathname();
  const others = locales.filter((l) => l !== locale);

  return (
    <p className={className}>
      <span className={currentClassName}>
        {LABELS[locale]}
        {" | "}
      </span>
      {others.map((next) => (
        <a
          key={next}
          className={altClassName}
          href={swapLocale(pathname, locale, next)}
          onClick={() => rememberLocale(next)}
          hrefLang={next}
        >
          {LABELS[next]}
        </a>
      ))}
    </p>
  );
}
