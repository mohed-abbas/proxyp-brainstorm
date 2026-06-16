import localFont from "next/font/local";

// PP Neue Montreal (commercial, Pangram Pangram). Book -> 400, Bold -> 700.
// Medium (500) is not bundled, so any 500 weight resolves to Book.
export const ppNeueMontreal = localFont({
  src: [
    {
      path: "../assets/fonts/ppneuemontreal-book.woff",
      weight: "400",
      style: "normal",
    },
    {
      path: "../assets/fonts/ppneuemontreal-bold.woff",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-pp-neue-montreal",
  display: "swap",
});
