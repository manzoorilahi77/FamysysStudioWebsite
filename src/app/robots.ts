import type { MetadataRoute } from "next";

/**
 * /admin is a real, reachable route now — it is behind a password rather than behind not
 * existing — so this disallow does work it did not do before. A private tool has no
 * business in a search index: an indexed login page is an invitation to try it, and an
 * indexed panel URL is a map of what to try it on.
 *
 * It is not access control. That is admin/session.ts and the (panel) layout above it; this
 * only asks well-behaved crawlers to look away, and the panel's own `noindex, nofollow`
 * says the same thing to the ones that fetch a page before reading this file.
 */
export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: "/admin",
    },
  };
}
