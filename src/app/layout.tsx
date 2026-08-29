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
// as a display accent only — see docs spec §2.8.3 and README.md. It is scoped to the
// `Accent` component and must never reach body copy, card titles, eyebrows, nav or
// buttons; a test fails the build if it appears more than five times on the page.
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
