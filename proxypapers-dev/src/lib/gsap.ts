import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Register ScrollTrigger once, on the client. Import gsap/ScrollTrigger from
// here everywhere so the plugin is guaranteed registered before use.
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

// Coalesced ScrollTrigger.refresh(). Several sections each want a refresh after
// their (possibly late) layout settles; calling refresh() once per hook means N
// full-document recomputations at load. This batches every request fired in the
// same frame into a single refresh on the next rAF — same corrected trigger
// positions, a fraction of the work. refreshPriority ordering is preserved
// because it's still one real ScrollTrigger.refresh().
let refreshQueued = false;
export function scheduleRefresh() {
  if (refreshQueued || typeof window === "undefined") return;
  refreshQueued = true;
  requestAnimationFrame(() => {
    refreshQueued = false;
    ScrollTrigger.refresh();
  });
}

export { gsap, ScrollTrigger };
