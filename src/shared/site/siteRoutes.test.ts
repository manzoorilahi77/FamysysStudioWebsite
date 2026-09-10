import { readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { SITE_ROUTES } from "./site";

/**
 * SITE_ROUTES is a hard-coded list, and this is what makes that safe.
 *
 * The sitemap reads the list at runtime, where a standalone build has no source tree to
 * walk, so the list cannot derive itself from disk. The consequence is the usual one: a
 * page added or deleted without touching the list leaves a sitemap that either omits a
 * real page or advertises a 404. This walks src/app the way internalLinks.test.ts does
 * and asserts the two agree, so that drift fails here instead of in a crawler.
 */
function routesUnder(directory: string, prefix = ""): string[] {
  const routes: string[] = [];
  for (const entry of readdirSync(directory)) {
    // Route groups, private folders, the API tree and the password-protected panel are
    // not public pages — the same exclusions internalLinks.test.ts makes, for the same
    // reasons.
    if (entry.startsWith("_") || entry.startsWith("(") || entry === "api" || entry === "admin") {
      continue;
    }
    const path = join(directory, entry);
    if (!statSync(path).isDirectory()) continue;

    const segment = `${prefix}/${entry}`;
    if (readdirSync(path).some((file) => /^page\.(tsx|ts)$/.test(file))) {
      routes.push(segment);
    }
    routes.push(...routesUnder(path, segment));
  }
  return routes;
}

describe("SITE_ROUTES", () => {
  const onDisk = ["/", ...routesUnder(join(process.cwd(), "src", "app"))];

  it("names every public page that exists, and no page that does not", () => {
    expect([...SITE_ROUTES].sort()).toEqual([...onDisk].sort());
  });

  it("lists the seven navigation pages first, home first, then the three the footer alone links, then the legal index", () => {
    expect(SITE_ROUTES).toHaveLength(11);
    expect(SITE_ROUTES[0]).toBe("/");
    expect(SITE_ROUTES.slice(7)).toEqual(["/faq", "/terms", "/privacy", "/legal"]);
  });
});
