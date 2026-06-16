import { Navbar } from "@/components/shared/Navbar";
import { Hero } from "@/components/sections/Hero";
import { Problem } from "@/components/sections/Problem";

// Landing page. Sections are composed here as they are ported.
export default function Home() {
  return (
    <>
      <Navbar />
      <Hero />
      <div className="page-frame">
        <Problem />
      </div>
    </>
  );
}
