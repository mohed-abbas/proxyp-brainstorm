import { Navbar } from "@/components/shared/Navbar";
import { Footer } from "@/components/shared/Footer";
import { ServicesHero } from "@/components/sections/ServicesHero";
import { ServiceCards } from "@/components/sections/ServiceCards";
import { HowTo } from "@/components/sections/HowTo";

// Services page. Hero ported 1:1 from Figma (node 158:349) — the Proxy-Blue
// "Three profiles…" statement with the live profiles orbit — followed by the profiles
// deck (Essentiel · Signature · Exception cards, nodes 160:411 / 160:605 / 160:675), then
// the "How to begin." onboarding path (node 160:1015). Navbar + shared Footer wrap the page.
export default function ServicesPage() {
  return (
    <>
      <Navbar />
      <ServicesHero />
      <ServiceCards />
      <HowTo />
      <Footer />
    </>
  );
}
