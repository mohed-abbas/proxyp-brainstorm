import { Navbar } from "@/components/shared/Navbar";
import { Hero } from "@/components/sections/Hero";
import { Problem } from "@/components/sections/Problem";
import { Profiles } from "@/components/sections/Profiles";

// Landing page. Sections are composed here as they are ported. Profiles sits
// OUTSIDE .page-frame (full-bleed dark ground), matching the source.
export default function Home() {
  return (
    <>
      <Navbar />
      <Hero />
      <div className="page-frame">
        <Problem />
      </div>
      <Profiles />
    </>
  );
}
