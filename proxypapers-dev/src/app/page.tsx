import { Navbar } from "@/components/shared/Navbar";
import { Hero } from "@/components/sections/Hero";
import { Problem } from "@/components/sections/Problem";
import { Profiles } from "@/components/sections/Profiles";
import { Method } from "@/components/sections/Method";
import { Trust } from "@/components/shared/Trust";

// Landing page. Sections are composed here as they are ported. Profiles sits
// OUTSIDE .page-frame (full-bleed dark ground); the frame re-opens for Method
// (capped inside the 1512 column), matching the source.
export default function Home() {
  return (
    <>
      <Navbar />
      <Hero />
      <div className="page-frame">
        <Problem />
      </div>
      <Profiles />
      <div className="page-frame">
        <Method />
      </div>
      <Trust />
    </>
  );
}
