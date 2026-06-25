import { Navbar } from "@/components/shared/Navbar";
import { Footer } from "@/components/shared/Footer";
import { ApproachHero } from "@/components/sections/ApproachHero";
import { FreedomSection } from "@/components/sections/FreedomSection";
import { StepSection } from "@/components/sections/StepSection";
import { LocalisationSection } from "@/components/sections/LocalisationSection";
import { Closing } from "@/components/sections/Closing";

// Our Approach page (/approach) — the destination for the homepage Method
// section's "See our full approach" link. Sections are ported 1:1 from Figma
// (links provided per section). So far: the hero (node 601:4). The remaining
// sections will slot in between ApproachHero and the shared Closing CTA. Navbar +
// shared Footer wrap the page.
export default function ApproachPage() {
  return (
    <>
      <Navbar />
      <ApproachHero />
      <FreedomSection />
      <StepSection />
      <LocalisationSection />
      {/* Further Figma sections slot in here. */}
      <Closing />
      <Footer />
    </>
  );
}
