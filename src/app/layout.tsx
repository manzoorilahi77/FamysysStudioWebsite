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
// or buttons.
//
// THE BUDGET IS FIVE ACCENT PHRASES PER PAGE, not five words — a phrase is one entry in an
// `accent` array, which is the unit README deviation 5 states and the unit this prop takes.
// An earlier version of this comment said "words" and put the homepage at 4, and both were
// wrong: measured, the homepage renders 5 phrases across 8 words and is exactly at the cap,
// while every other page renders 2 phrases (/contact renders 1). Anything added to a
// homepage heading now breaks it.
//
// RevealHeading renders one span per word, so the verification pass counts maximal runs of
// consecutive accented words inside a heading rather than counting spans. This is NOT
// enforced by a build-failing test — a unit test cannot count them, because the budget is a
// property of the rendered page rather than of any one module.
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
