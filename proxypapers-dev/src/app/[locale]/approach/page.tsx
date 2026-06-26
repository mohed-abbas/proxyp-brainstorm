import { Navbar } from "@/components/shared/Navbar";
import { Footer } from "@/components/shared/Footer";
import { ApproachHero } from "@/components/sections/ApproachHero";
import { FreedomSection } from "@/components/sections/FreedomSection";
import { StepSection } from "@/components/sections/StepSection";
import { LocalisationSection } from "@/components/sections/LocalisationSection";
import { TrustBand } from "@/components/sections/TrustBand";
import { MarkReveal } from "@/components/sections/MarkReveal";
import { Closing } from "@/components/sections/Closing";

// Our Approach page (/approach) — the destination for the homepage Method
// section's "See our full approach" link. Sections are ported 1:1 from Figma
// (links provided per section). The hero is being rebuilt; the remaining sections
// slot in between it and the shared Closing CTA. Navbar + shared Footer wrap the page.
export default function ApproachPage() {
  return (
    <>
      <Navbar />
      <ApproachHero />
      <FreedomSection />
      <StepSection />
      <LocalisationSection />
      <TrustBand />
      <MarkReveal />
      {/* Further Figma sections slot in here. */}
      <Closing />
      <Footer />
    </>
  );
}
