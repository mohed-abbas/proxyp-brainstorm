import { Navbar } from "@/components/shared/Navbar";
import { Footer } from "@/components/shared/Footer";
import { ServicesHero } from "@/components/sections/ServicesHero";
import { ServiceCards } from "@/components/sections/ServiceCards";

// Services page. Hero ported 1:1 from Figma (node 158:349) — the Proxy-Blue
// "Three profiles…" statement with the live profiles orbit — followed by the profiles
// deck (Essentiel · Signature · Exception cards, nodes 160:411 / 160:605 / 160:675).
// Navbar + shared Footer are in place; further sections will stack before the footer.
export default function ServicesPage() {
  return (
    <>
      <Navbar />
      <ServicesHero />
      <ServiceCards />
      <Footer />
    </>
  );
}
