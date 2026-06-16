import { Onboarding } from "@/components/shared/Onboarding";
import { Navbar } from "@/components/shared/Navbar";
import { Hero } from "@/components/sections/Hero";
import { Problem } from "@/components/sections/Problem";
import { Profiles } from "@/components/sections/Profiles";
import { Method } from "@/components/sections/Method";
import { Trust } from "@/components/shared/Trust";
import { Referrers } from "@/components/sections/Referrers";
import { Closing } from "@/components/sections/Closing";
import { Footer } from "@/components/shared/Footer";

// Landing page. Sections are composed here as they are ported. Problem sits inside
// .page-frame (capped 1512 column); Profiles and Method are full-bleed exceptions
// (their bands fill the viewport while content stays capped at 1512 internally).
export default function Home() {
  return (
    <>
      <Onboarding />
      <Navbar />
      <Hero />
      <div className="page-frame">
        <Problem />
      </div>
      <Profiles />
      <Method />
      <Trust />
      <Referrers />
      <Closing />
      <Footer />
    </>
  );
}
