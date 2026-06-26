// Aggregates every English section dictionary into one object keyed by the JSON
// filename (minus extension). `getDictionary("en")` dynamic-imports this module on
// the server; the resulting object is the canonical shape for the `Dictionary`
// type consumed by `useContent()`. Keep keys in sync with src/data/fr/index.ts.
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

const en = {
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

// The English dictionary is the source of truth for the content shape. Every
// locale must satisfy this type (see src/data/fr/index.ts).
export type Dictionary = typeof en;

export default en;
