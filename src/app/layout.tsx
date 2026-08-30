import type { Metadata, Viewport } from "next";
import { Instrument_Serif, Jost } from "next/font/google";
import "./globals.css";

const jost = Jost({
  subsets: ["latin"],
  variable: "--font-jost",
  display: "swap",
});

// DEVIATION (brand deviation 5, PENDING MANAGER APPROVAL): the brand rules specify
// Jost with a fallback stack and no second typeface. Instrument Serif Italic is added
// as a display accent only — see docs spec §2.8.3 and README.md. It is scoped to
// RevealHeading's `accent` prop and must never reach body copy, card titles, eyebrows, nav
// or buttons. The budget is at most five accented words per page: the homepage renders 4
// and /creative-services renders 4. NOTE: this is checked by counting rendered
// `.text-display-accent` spans during the verification pass, NOT by a build-failing test —
// an earlier version of this comment claimed a test enforced it, and none does. A unit test
// cannot count them, because the budget is a property of the rendered page rather than of
// any one module.
const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: "italic",
  variable: "--font-instrument-serif",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Famysys Studio",
  description: "Famysys Studio — video design and creative production.",
};

// Deviation from famysys.com: the live site's theme-color matches its canvas
// background. This page opens on a dark hero, so mobile browser chrome is set to
// match ink instead — see README.md. Kept as a literal because Next reads this at
// build time from a static export, so it cannot import the token module.
export const viewport: Viewport = {
  themeColor: "#0B2C4D",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${jost.variable} ${instrumentSerif.variable}`}>
      <body>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-sm focus:bg-ink focus:px-4 focus:py-2 focus:text-canvas"
        >
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
