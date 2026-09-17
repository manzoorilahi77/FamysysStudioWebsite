import { DiscardDeckDrafts } from "../../../../../application/capability-deck/EditDeckSlide";
import { adminContainer } from "../../../../../infrastructure/di/adminContainer";
import { hasAdminSession, unauthorised } from "../../../session";
import { json, parseDeckTarget } from "../shared";

export const dynamic = "force-dynamic";

export async function POST(request: Request): Promise<Response> {
  if (!(await hasAdminSession())) return unauthorised();

  const body: unknown = await request.json().catch(() => null);
  const target = parseDeckTarget((body as Record<string, unknown> | null)?.target);
  if (!target) return json({ ok: false, message: "Malformed request." }, 400);

  const result = await new DiscardDeckDrafts(adminContainer.capabilityDeck).execute(target);
  return json(result, result.ok ? 200 : 422);
}
