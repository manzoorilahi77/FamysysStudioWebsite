import { existsSync } from "node:fs";
import { join } from "node:path";
import { adminContainer } from "../../../../infrastructure/di/adminContainer";
import { contentSource } from "../../../../infrastructure/db/env";
import { SeoScreen } from "../../../../presentation/admin/views/SeoScreen";
import type { SeoSiteStatus } from "../../../../presentation/admin/views/SeoScreen";
import robots from "../../../robots";
import sitemap from "../../../sitemap";

export const dynamic = "force-dynamic";

/**
 * Whether `src/shared/site/structured-data.ts` exists and loads at all — nothing more. That
 * file is being actively written by another session as of this feature's own build, so this
 * checks presence only rather than assuming any particular export shape; a status of "not
 * yet available" is the honest answer while that is true, not a bug to fix here.
 */
async function structuredDataAvailable(): Promise<boolean> {
  try {
    await import("../../../../shared/site/structured-data");
    return true;
  } catch {
    return false;
  }
}

async function loadStatus(): Promise<SeoSiteStatus> {
  const [sitemapEntries, robotsFile, hasStructuredData] = await Promise.all([
    Promise.resolve(sitemap()),
    Promise.resolve(robots()),
    structuredDataAvailable(),
  ]);

  const sitemapExcludesAdmin = !sitemapEntries.some((entry) => entry.url.includes("/admin"));
  const disallow = robotsFile.rules;
  const disallowsAdmin = Array.isArray(disallow)
    ? disallow.some((rule) =>
        Array.isArray(rule.disallow) ? rule.disallow.includes("/admin") : rule.disallow === "/admin",
      )
    : Array.isArray(disallow?.disallow)
      ? disallow.disallow.includes("/admin")
      : disallow?.disallow === "/admin";

  return {
    sitemapRouteCount: sitemapEntries.length,
    sitemapExcludesAdmin,
    robotsDisallowsAdmin: Boolean(disallowsAdmin),
    llmsTxtPresent: existsSync(join(process.cwd(), "public", "llms.txt")),
    structuredDataAvailable: hasStructuredData,
    lighthouseRecorded: false,
  };
}

export default async function AdminSeoRoute() {
  const [pages, status] = await Promise.all([adminContainer.cms.getPages(), loadStatus()]);

  return <SeoScreen pages={pages} status={status} isStaticMode={contentSource() !== "database"} />;
}
