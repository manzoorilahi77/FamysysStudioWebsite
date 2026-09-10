/**
 * WHERE THE SITE LIVES, AND WHAT IT IS MADE OF.
 *
 * Two facts that several unrelated files need and none of them owns: the site's own
 * origin, and the list of its public routes. Both were previously implied — the origin by
 * whatever host happened to serve the page, the route list by which directories under
 * src/app contain a page.tsx — and neither can stay implied once there is a sitemap, a
 * canonical URL and an Open Graph card, because all three have to name an absolute URL
 * and a page cannot know its own.
 */

/**
 * The absolute origin, no trailing slash.
 *
 * NEXT_PUBLIC_ because `metadataBase` is read while rendering, and a canonical tag that
 * says localhost on the live site is worse than no canonical tag at all — it tells a
 * crawler the real page is a duplicate of one it cannot reach. The default is the
 * production host rather than localhost for the same reason: if the variable is ever
 * missing from the deploy environment, the failure is a correct URL from a machine that
 * was not told, not a broken one from a machine that was.
 *
 * A local build that wants its own origin sets NEXT_PUBLIC_SITE_URL=http://localhost:3000.
 */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://studio.famysys.com").replace(
  /\/+$/,
  "",
);

export const SITE_NAME = "Famysys Studio";

/**
 * THE TEN PUBLIC ROUTES: the seven the primary navigation lists, in its order, then the
 * three the footer alone links — the questions page and the two legal documents. They
 * are not in the bar and they are not in the mega menu; they are reached from the
 * footer on every page, which is where a reader looks for them.
 *
 * THIS LIST IS ASSERTED AGAINST THE FILESYSTEM. `siteRoutes.test.ts` walks src/app and
 * fails if a page exists that is not named here or a route is named here that has no
 * page — which is what makes a hard-coded list safe to depend on. The sitemap needs the
 * list at runtime, where the source tree is not present in a standalone build, so it
 * cannot walk the directory itself; the test walks it instead, once, at the only moment
 * the two could disagree.
 *
 * /admin is deliberately absent. It is not public, robots.ts disallows it and the panel
 * sends `noindex`; listing it in a sitemap would undo all three.
 *
 * `changeFrequency` is omitted throughout. Google has said for years that it ignores it,
 * and a field that is ignored is a field that goes stale without anyone noticing.
 * `priority` is omitted for the same reason — it only ever expressed a preference between
 * one site's own pages, and this site has seven.
 */
export const SITE_ROUTES = [
  "/",
  "/creative-services",
  "/how-we-work",
  "/ways-to-work-with-us",
  "/selected-work",
  "/about",
  "/contact",
  "/faq",
  "/terms",
  "/privacy",
  "/legal",
] as const;

export type SiteRoute = (typeof SITE_ROUTES)[number];

/** Absolute URL for a route. `/` gives the bare origin rather than a trailing slash. */
export function absoluteUrl(route: string): string {
  return route === "/" ? SITE_URL : `${SITE_URL}${route}`;
}
