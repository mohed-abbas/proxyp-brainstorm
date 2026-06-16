import type { Metadata } from "next";
import { ppNeueMontreal } from "@/lib/fonts";
import { LenisProvider } from "@/lib/lenis/LenisProvider";
import site from "@/data/en/site.json";
import "./globals.css";

export const metadata: Metadata = {
  title: site.title,
  description: site.description,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={ppNeueMontreal.variable}>
      <body className="pp-theme-dark">
        <LenisProvider>{children}</LenisProvider>
      </body>
    </html>
  );
}
