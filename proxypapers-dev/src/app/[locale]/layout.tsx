import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { notFound } from "next/navigation";
import { ppNeueMontreal } from "@/lib/fonts";
import { LenisProvider } from "@/lib/lenis/LenisProvider";
import { IntroProvider } from "@/lib/intro/IntroProvider";
import { PageTransitionProvider } from "@/components/shared/PageTransition";
import { LocaleProvider } from "@/lib/i18n/LocaleProvider";
import { getDictionary } from "@/data/dictionaries";
import { locales, isLocale } from "@/data/locales";
import "../globals.css";

// Mark JS as present before first paint (matches the source's inline head
// script): drives the onboarding overlay + scroll lock so the hero never flashes
// before the welcome covers it. The intro controller removes it under reduced
// motion to land on the settled hero.
const JS_FLAG = 'document.documentElement.classList.add("js")';

// Pre-render both locale trees at build time so /fr/* and /en/* stay static.
export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const dict = await getDictionary(locale);
  return {
    title: dict.site.title,
    description: dict.site.description,
    // hreflang alternates so each language URL is discoverable.
    alternates: {
      languages: Object.fromEntries(locales.map((l) => [l, `/${l}`])),
    },
  };
}

// Explicit viewport so mobile renders at device width and the dark ground
// extends under notches/safe areas (viewport-fit: cover). themeColor matches the
// Chinese-Black ground so mobile browser chrome stays on-brand.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#161718",
};

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  // Unknown locale → 404 rather than a runtime error (mirrors the Next i18n guide).
  if (!isLocale(locale)) notFound();
  const dict = await getDictionary(locale);

  return (
    <html
      lang={locale}
      className={ppNeueMontreal.variable}
      suppressHydrationWarning
    >
      <body className="pp-theme-dark">
        {/* Runs before hydration (injected into the initial HTML) so the `js`
            class is set ahead of paint — same anti-flash purpose as the source's
            inline head script, without React's "script in a component" warning. */}
        <Script id="pp-js-flag" strategy="beforeInteractive">
          {JS_FLAG}
        </Script>
        <LocaleProvider locale={locale} dict={dict}>
          <LenisProvider>
            <IntroProvider>
              <PageTransitionProvider>{children}</PageTransitionProvider>
            </IntroProvider>
          </LenisProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}
