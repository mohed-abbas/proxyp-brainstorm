import { Navbar } from "@/components/shared/Navbar";
import { Footer } from "@/components/shared/Footer";
import { ReferralsHero } from "@/components/sections/ReferralsHero";
import { TooMuch } from "@/components/sections/TooMuch";

// Referrals page. Hero ported from Figma (node 421:8); TooMuch is the first
// mid-page statement (123:358). Navbar + shared Footer are in place.
export default function ReferralsPage() {
  return (
    <>
      <Navbar />
      <ReferralsHero />
      <TooMuch />
      <Footer />
    </>
  );
}
