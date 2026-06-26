// Tracks whether the user has navigated client-side at least once in this document
// session. The onboarding welcome is a document-ENTRY moment, so it must only run
// on a fresh load / refresh of the home page — never when the user returns to home
// from another page (that swap is the page transition's job, and running both at
// once is the glitchy overlap). A real refresh starts a new JS context, resetting
// this flag, so the welcome still plays on a genuine reload.
//
// PageTransition flips this on every client navigation; useOnboarding reads it.
let clientNavigated = false;

export const markClientNavigated = () => {
  clientNavigated = true;
};

export const hasClientNavigated = () => clientNavigated;
