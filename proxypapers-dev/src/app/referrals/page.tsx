import { Navbar } from "@/components/shared/Navbar";
import { Footer } from "@/components/shared/Footer";
import { ReferralsHero } from "@/components/sections/ReferralsHero";
import { TooMuch } from "@/components/sections/TooMuch";
import { Sliders } from "@/components/sections/Sliders";
import { Tracks } from "@/components/sections/Tracks";

// Referrals page. Hero ported from Figma (node 421:8); TooMuch (123:358), the
// Sliders benefits section (141:480) and the Tracks collaboration card (123:75)
// follow. Navbar + shared Footer are in place.
export default function ReferralsPage() {
  return (
    <>
      <Navbar />
      <ReferralsHero />
      <TooMuch />
      <Sliders />
      <Tracks />
      <Footer />
    </>
  );
}
