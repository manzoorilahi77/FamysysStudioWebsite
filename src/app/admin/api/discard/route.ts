import { DiscardCmsDrafts } from "../../../../application/cms/EditCmsSection";
import { adminContainer } from "../../../../infrastructure/di/adminContainer";
import { hasAdminSession, unauthorised } from "../../session";
import { json, parseTarget } from "../shared";

/**
 * THROWS AWAY A SECTION'S UNPUBLISHED EDITS.
 *
 * Nothing on the public site changes, because nothing on the public site had changed — that is
 * the whole point of a draft. The confirmation is in the panel, next to the button, where the
 * person is.
 */
export const dynamic = "force-dynamic";

export async function POST(request: Request): Promise<Response> {
  if (!(await hasAdminSession())) return unauthorised();

  const body: unknown = await request.json().catch(() => null);
  const target = parseTarget((body as Record<string, unknown> | null)?.target);
  if (!target) {
    return json({ ok: false, message: "Malformed request." }, 400);
  }

  const result = await new DiscardCmsDrafts(adminContainer.cms).execute(target);
  return json(result, result.ok ? 200 : 422);
}
