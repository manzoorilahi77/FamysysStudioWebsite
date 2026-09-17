"use client";

import dynamic from "next/dynamic";
import type { PublishedCapabilityDeck } from "../../infrastructure/capability-deck/getCapabilityDeckContent";

/**
 * MOUNTS THE DECK IN THE BROWSER ONLY, AND THIS IS THE ONE THING THE PORT COULD NOT
 * INHERIT FROM HIS BUILD — because his build never had a server.
 *
 * His deck is a Vite SPA: an empty `<div id="root">` and a bundle. Several of his hooks
 * are written to measure the browser and fall back when there is no `window` —
 * `useStageScale` returns `scale: 1` and a 1920x1080 stage, `usePrefersReducedMotion`
 * returns false. Those fallbacks were never reached in his repo. Prerendered by Next they
 * are reached on every build, and the result is worse than a wrong first frame:
 *
 *   React does not patch a hydration mismatch on an inline style. It adopts the server's
 *   DOM and records the CLIENT's first-render value as what it believes is on screen. The
 *   stage was written `transform: scale(1)` by the prerender; React's client render
 *   computed 0.8333 and recorded that. `useStageScale`'s effect then measured the viewport,
 *   got 0.8333 again, and React diffed 0.8333 against 0.8333, found no change, and wrote
 *   nothing. The deck rendered at scale 1 inside a 1440px window — cropped on all four
 *   sides — and no resize could ever fix it, because every recomputation produced the same
 *   value React already believed was applied.
 *
 * Rendering the deck client-side only removes the whole class of problem rather than the
 * one instance of it: there is no server pass to disagree with, exactly as in his repo.
 * The cost is that the deck's markup is not in the prerendered HTML, which is the right
 * trade for a page that is a presentation behind JavaScript and is `noindex` anyway (see
 * app/capability-deck/page.tsx).
 *
 * The `.capability-deck` wrapper stays in page.tsx and IS server-rendered, so the dark
 * ground and his token block are on the page from the first paint rather than flashing the
 * site's cream canvas while the bundle loads.
 */
const Deck = dynamic(() => import("./CapabilityDeck").then((m) => m.CapabilityDeck), {
  ssr: false,
});

export function CapabilityDeckMount({ deck }: { readonly deck: PublishedCapabilityDeck }) {
  return <Deck deck={deck} />;
}
