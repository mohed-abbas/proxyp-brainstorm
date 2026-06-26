import { Navbar } from "@/components/shared/Navbar";
import { Footer } from "@/components/shared/Footer";
import { ReferralsHero } from "@/components/sections/ReferralsHero";
import { TooMuch } from "@/components/sections/TooMuch";
import { Sliders } from "@/components/sections/Sliders";
import { WorkWith } from "@/components/sections/WorkWith";
import { Tracks } from "@/components/sections/Tracks";
import { WhiteLabel } from "@/components/sections/WhiteLabel";
import { Closing } from "@/components/sections/Closing";

// Referrals page. Hero ported from Figma (node 421:8); TooMuch (123:358), the Sliders
// benefits section (141:480), the Tracks collaboration card (123:75), the WhiteLabel
// reveal band (compact 144:2 → expanded 123:58) and the WorkWith profiles band (162:3)
// follow, closing on the shared Closing CTA. Navbar + shared Footer are in place.
export default function ReferralsPage() {
  return (
    <>
      <Navbar />
      <ReferralsHero />
      <TooMuch />
      <Sliders />
      <Tracks />
      <WhiteLabel />
      <WorkWith />
      <Closing />
      <Footer />
    </>
  );
}
