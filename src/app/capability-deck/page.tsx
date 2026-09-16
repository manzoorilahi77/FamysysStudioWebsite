import type { Metadata } from "next";
import { CapabilityDeckMount } from "../../presentation/capability-deck/CapabilityDeckMount";
import "./deck.css";

/**
 * THE CAPABILITY DECK — the footer's "Capability Deck" link.
 *
 * Ported from Imran Ifraz's standalone build (github.com/imranifraz/famysys-web-dec),
 * which was a separate Vite + React 18 single-page application rather than a branch
 * of this repository. It is his work: his slides, his copy, his motion system, his
 * layout. See src/presentation/capability-deck/ for the port and
 * docs/capability-deck-port.md for what was and was not changed.
 *
 * IT RENDERS NONE OF THE SITE'S CHROME, and that is deliberate rather than an
 * omission. The deck is a fixed 1920x1080 stage that scales to fill the viewport
 * and owns the arrow keys, the wheel and horizontal swipes; a header above it and a
 * footer below it would both shrink the stage and compete for the same gestures.
 * Every other route composes Header and Footer itself — there is no shared layout
 * that imposes them — so a page that wants neither simply does not import them.
 *
 * NOINDEX, AND WHY IT IS NOT IN sitemap.ts. The deck is a document the footer
 * offers, not a page competing for a query: it renders one slide at a time behind
 * JavaScript, so what a crawler would index is a single headline and some chrome.
 * `SITE_ROUTES` is the list of public PAGES and drives both the sitemap and the
 * footer columns, so adding the deck there would also have put it in the site's
 * navigation, which is not where the client asked for it. Flip both together if
 * this should become an indexed page.
 */
export const metadata: Metadata = {
  title: "Capability Deck",
  description: "Famysys Studio — Creative production, without the agency overhead.",
  robots: { index: false, follow: true },
};

/**
 * The wrapper is server-rendered and the deck inside it is not — see
 * CapabilityDeckMount for why. `capability-deck` is what carries his token block and
 * what `body:has()` in deck.css keys the page-level rules off, so it has to be in the
 * first HTML or the page flashes the site's cream canvas before the bundle arrives.
 */
export default function CapabilityDeckRoute() {
  return (
    <div className="capability-deck">
      <CapabilityDeckMount />
    </div>
  );
}
