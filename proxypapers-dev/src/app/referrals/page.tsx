import { Navbar } from "@/components/shared/Navbar";
import { Footer } from "@/components/shared/Footer";
import { ReferralsHero } from "@/components/sections/ReferralsHero";

// Referrals page. Hero ported from Figma (node 421:8); mid-page sections follow.
// Navbar + shared Footer are in place.
export default function ReferralsPage() {
  return (
    <>
      <Navbar />
      <ReferralsHero />
      <Footer />
    </>
  );
}
