import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";
import type { RefObject } from "react";

// Nav handoff — ported from setupNavHandoff() in design-final/scripts/hero.js. As
// the full-height footer scrolls in, the fixed navbar pill fades out (scrubbed to
// the scroll) so by the time the footer fills the screen only the footer's own nav
// remains; it fades back in on scroll-up. Opacity only — never touches the bar's
// theme or the logo state. Scroll-position driven, so it runs under reduced motion
// too (matches the source, which does not gate it).
export function useNavHandoff(navRef: RefObject<HTMLElement | null>) {
  useGSAP(() => {
    const nav = navRef.current;
    const footer = document.querySelector("footer");
    if (!nav || !footer) return;

    gsap.to(nav, {
      autoAlpha: 0,
      ease: "none",
      scrollTrigger: {
        trigger: footer,
        start: "top 75%",
        end: "top 15%",
        scrub: true,
        // The navbar mounts before the pinned sections (Profiles/Trust), so this
        // trigger is created before their pin-spacing exists. A negative priority
        // makes it refresh LAST — after every pin has applied its spacing — so its
        // start/end resolve against the full document height, not a stale shorter
        // one. Without it the fade fires ~2400px early (around the Trust pin).
        refreshPriority: -1,
        invalidateOnRefresh: true,
      },
    });
  });
}
