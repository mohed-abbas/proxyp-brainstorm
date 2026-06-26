import { NextResponse, type NextRequest } from "next/server";
import {
  locales,
  defaultLocale,
  isLocale,
  LOCALE_COOKIE,
  type Locale,
} from "@/data/locales";

// Next.js 16 renamed `middleware` → `proxy`. This runs on requests that don't
// already carry a locale prefix and redirects to the best locale, so every page
// is served under /fr/* or /en/*.

// Picks a locale for a prefix-less request. French is the brand default and is
// used for everyone by default — the browser's Accept-Language is intentionally
// NOT consulted. Only a previously remembered choice (the pp-locale cookie, set
// when the user uses the language switcher) overrides the French default.
function pickLocale(request: NextRequest): Locale {
  const cookie = request.cookies.get(LOCALE_COOKIE)?.value;
  if (cookie && isLocale(cookie)) return cookie;

  return defaultLocale;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const hasLocale = locales.some(
    (l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`),
  );
  if (hasLocale) return NextResponse.next();

  const locale = pickLocale(request);
  const url = request.nextUrl.clone();
  url.pathname = pathname === "/" ? `/${locale}` : `/${locale}${pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  // Run on everything except Next internals, the API, and files with an
  // extension (favicon, images, fonts, …).
  matcher: ["/((?!_next|api|.*\\..*).*)"],
};
