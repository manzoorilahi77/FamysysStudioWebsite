import { PublishCmsSection } from "../../../../application/cms/EditCmsSection";
import { adminContainer } from "../../../../infrastructure/di/adminContainer";
import { routesForOwners } from "../../../../infrastructure/cms/routes";
import { publishedTo } from "../../revalidate";
import { hasAdminSession, unauthorised } from "../../session";
import { json, parseTarget } from "../shared";

/**
 * PUBLISH PUTS A SECTION'S SAVED EDITS ON THE PUBLIC SITE.
 *
 * Two things have to happen and both have to happen here. The rows move from `content_drafts`
 * to `content_strings`, and every prerendered page that renders one of those strings is marked
 * stale — otherwise the write is correct and the site keeps serving yesterday's HTML until
 * something else happens to rebuild it.
 *
 * The route set comes from the use case, which got it from `routesForOwners`, which was given
 * the addresses that were ACTUALLY written rather than the ones that might have been. A publish
 * that wrote nothing revalidates nothing.
 */
export const dynamic = "force-dynamic";

export async function POST(request: Request): Promise<Response> {
  if (!(await hasAdminSession())) return unauthorised();

  const body: unknown = await request.json().catch(() => null);
  const target = parseTarget((body as Record<string, unknown> | null)?.target);
  if (!target) {
    return json({ ok: false, message: "Malformed request." }, 400);
  }

  const result = await new PublishCmsSection(adminContainer.cms, routesForOwners).execute(target);
  if (!result.ok) {
    return json(result, /changed after|no longer/.test(result.message) ? 409 : 422);
  }

  publishedTo(result.routes);
  return json(result, 200);
}
