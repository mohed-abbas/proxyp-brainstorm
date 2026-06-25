import { Navbar } from "@/components/shared/Navbar";
import { Footer } from "@/components/shared/Footer";
import { Contact } from "@/components/sections/Contact";

// Contact page. Ported 1:1 from Figma (node 239:3) — the "Let's set a meeting."
// discovery-meeting request: a centred statement, the request form on a bone card
// (audience toggle, underlined fields, source select, consent, submit), and a
// form-footer band pairing the three meeting assurances with the direct-contact
// details. Navbar + shared Footer wrap the page.
export default function ContactPage() {
  return (
    <>
      <Navbar />
      <Contact />
      <Footer />
    </>
  );
}
