import { Navbar } from "@/components/shared/Navbar";
import { Footer } from "@/components/shared/Footer";
import { ReferralsHero } from "@/components/sections/ReferralsHero";
import { TooMuch } from "@/components/sections/TooMuch";
import { Sliders } from "@/components/sections/Sliders";

// Referrals page. Hero ported from Figma (node 421:8); TooMuch (123:358) and the
// Sliders benefits section (141:480) follow. Navbar + shared Footer are in place.
export default function ReferralsPage() {
  return (
    <>
      <Navbar />
      <ReferralsHero />
      <TooMuch />
      <Sliders />
      <Footer />
    </>
  );
}
