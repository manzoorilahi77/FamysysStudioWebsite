import { draftMode } from "next/headers";
import { adminContainer } from "../../../../infrastructure/di/adminContainer";
import { hasAdminSession, unauthorised } from "../../session";
import { logActivityFor } from "../activity";
import { json, parseTarget } from "../shared";

/**
 * TURNS THE PREVIEW ON AND OFF.
 *
 * Next's draft mode is a signed cookie the framework sets. Two things follow from it: the public
 * routes render per request instead of serving their prerendered HTML, and the content store
 * lays `content_drafts` over `content_strings` on the way past — see
 * infrastructure/db/content/preview.ts. Between them, the iframe in the panel shows the real
 * page with the unpublished edits in it, and no page or component knows anything about it.
 *
 * SESSION-GATED, because that cookie is the site showing unpublished words to whoever holds it.
 * A stranger who could call this could read every draft on the site.
 *
 * It is turned OFF as well as on, and the panel calls that on the way out. The cookie belongs to
 * the browser rather than to the frame, so leaving it set would show the editor drafts on their
 * own view of the live site with nothing on screen to say why.
 */
export const dynamic = "force-dynamic";

export async function POST(request: Request): Promise<Response> {
  if (!(await hasAdminSession())) return unauthorised();

  const body: unknown = await request.json().catch(() => null);
  const candidate = body as Record<string, unknown> | null;
  const enable = candidate?.enable === true;
  // Which section is being previewed — for the activity log only. Its absence never blocks
  // the preview itself: a caller that omits it simply goes unlogged.
  const target = parseTarget(candidate?.target);

  const draft = await draftMode();
  if (!enable) {
    draft.disable();
    return json({ ok: true, previewing: false }, 200);
  }

  if (!adminContainer.cms.supportsDraftPreview) {
    // Still answers ok: the preview opens and shows the live page, and the panel says on screen
    // that unpublished edits are not in it. A refusal here would leave the editor with a broken
    // button and no explanation.
    return json({ ok: true, previewing: false, drafts: false }, 200);
  }

  draft.enable();
  if (target) {
    await logActivityFor(target, "previewed");
  }
  return json({ ok: true, previewing: true, drafts: true }, 200);
}
