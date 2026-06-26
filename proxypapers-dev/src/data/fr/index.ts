// French section dictionaries, aggregated to match the English shape exactly.
// `getDictionary("fr")` dynamic-imports this on the server. The `Dictionary`
// annotation makes a missing/renamed key a compile error rather than a runtime
// surprise. Copy is translated from PROXY_PAPERS_CONTENT_SITE.docx (the bilingual
// content book) and is the brand-primary language.
import type { Dictionary } from "@/data/en";
import approach from "./approach.json";
import closing from "./closing.json";
import contact from "./contact.json";
import footer from "./footer.json";
import hero from "./hero.json";
import howTo from "./how-to.json";
import markReveal from "./mark-reveal.json";
import method from "./method.json";
import nav from "./nav.json";
import problem from "./problem.json";
import profiles from "./profiles.json";
import referrals from "./referrals.json";
import referrers from "./referrers.json";
import servicesCards from "./services-cards.json";
import services from "./services.json";
import site from "./site.json";
import sliders from "./sliders.json";
import toomuch from "./toomuch.json";
import tracks from "./tracks.json";
import trustBand from "./trust-band.json";
import trust from "./trust.json";
import whiteLabel from "./white-label.json";
import workWith from "./work-with.json";

const fr: Dictionary = {
  approach,
  closing,
  contact,
  footer,
  hero,
  "how-to": howTo,
  "mark-reveal": markReveal,
  method,
  nav,
  problem,
  profiles,
  referrals,
  referrers,
  "services-cards": servicesCards,
  services,
  site,
  sliders,
  toomuch,
  tracks,
  "trust-band": trustBand,
  trust,
  "white-label": whiteLabel,
  "work-with": workWith,
};

export default fr;
