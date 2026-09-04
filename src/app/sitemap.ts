import type { MetadataRoute } from "next";
import { SITE_ROUTES, absoluteUrl } from "../shared/site/site";

/**
 * The seven public pages, absolute, and nothing else.
 *
 * `force-static` because the list cannot change between requests — it changes when a page
 * is added to the source tree, which is a deploy. Generating it per request would cost a
 * render to produce a file that is identical every time.
 *
 * NO `lastModified`. The site has real per-string timestamps in the database, but none of
 * them is the date a PAGE changed: a page is dozens of strings plus a layout plus the
 * components that render it, and the newest string on it moves when someone fixes a typo
 * in a footer that appears on all seven. A date that says "this page changed" when it did
 * not is worse than no date, because a crawler that learns the dates are unreliable stops
 * reading them. Neither `changeFrequency` nor `priority` is here for the same reason —
 * both are ignored by every major crawler, and an ignored field is one that rots unseen.
 *
 * /admin is absent by construction: SITE_ROUTES holds public routes only. robots.ts
 * disallows it and the panel sends `noindex`; listing it here would undo both.
 */
export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  return SITE_ROUTES.map((route) => ({ url: absoluteUrl(route) }));
}
