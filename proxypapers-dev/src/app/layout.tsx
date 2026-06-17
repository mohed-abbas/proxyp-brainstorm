import type { Metadata, Viewport } from "next";
import { ppNeueMontreal } from "@/lib/fonts";
import { LenisProvider } from "@/lib/lenis/LenisProvider";
import { IntroProvider } from "@/lib/intro/IntroProvider";
import site from "@/data/en/site.json";
import "./globals.css";

// Mark JS as present before first paint (matches the source's inline head
// script): drives the onboarding overlay + scroll lock so the hero never flashes
// before the welcome covers it. The intro controller removes it under reduced
// motion to land on the settled hero.
const JS_FLAG = 'document.documentElement.classList.add("js")';

export const metadata: Metadata = {
  title: site.title,
  description: site.description,
};

// Explicit viewport so mobile renders at device width and the dark ground
// extends under notches/safe areas (viewport-fit: cover). themeColor matches the
// Chinese-Black ground so mobile browser chrome stays on-brand.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#161718",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={ppNeueMontreal.variable} suppressHydrationWarning>
      <body className="pp-theme-dark">
        <script dangerouslySetInnerHTML={{ __html: JS_FLAG }} />
        <LenisProvider>
          <IntroProvider>{children}</IntroProvider>
        </LenisProvider>
      </body>
    </html>
  );
}
