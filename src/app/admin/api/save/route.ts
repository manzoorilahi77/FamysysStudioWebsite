import type { CmsSectionTarget, CmsValueEdit } from "../../../../application/cms/EditCmsSection";
import { SaveCmsSection } from "../../../../application/cms/EditCmsSection";
import { adminContainer } from "../../../../infrastructure/di/adminContainer";
import { hasAdminSession, unauthorised } from "../../session";
import { json, parseEdits, parseTarget } from "../shared";

/**
 * SAVE WRITES A DRAFT AND CHANGES NOTHING ON THE PUBLIC SITE.
 *
 * It checks the session itself. Every screen in the panel is covered by the (panel) layout's
 * gate, but a route handler has no layout above it — so the check that matters most is the one
 * that has to be written out by hand.
 *
 * WHAT THE BODY MAY CONTAIN: ids, and strings. No file path, no property path, no pointer, no
 * table name. The section is re-read server-side and every address comes from the read model, so
 * the worst a malformed body can do is name a field that does not exist and be told so.
 *
 * Nothing is revalidated here, deliberately. A draft is not on the site, so there is nothing
 * stale about the pages that render it.
 */
export const dynamic = "force-dynamic";

export async function POST(request: Request): Promise<Response> {
  if (!(await hasAdminSession())) {
    return unauthorised();
  }

  const body: unknown = await request.json().catch(() => null);
  const candidate = (body ?? {}) as Record<string, unknown>;
  const target: CmsSectionTarget | null = parseTarget(candidate.target);
  const edits: ReadonlyArray<CmsValueEdit> | null = parseEdits(candidate.edits);
  if (!target || !edits) {
    return json({ ok: false, valueId: null, message: "Malformed request." }, 400);
  }

  const result = await new SaveCmsSection(adminContainer.cms).execute(target, edits);

  // 422 rather than 400 for a rejected value: the request was well formed and the content was
  // not, and the interface tells those apart when it decides which field to mark. 409 for a lost
  // race, because that one is not the editor's mistake and the message asks them to reload
  // rather than to fix what they typed.
  return json(result, result.ok ? 200 : result.conflict ? 409 : 422);
}
