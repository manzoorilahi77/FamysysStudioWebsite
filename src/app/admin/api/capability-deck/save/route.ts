import { SaveDeckSlide } from "../../../../../application/capability-deck/EditDeckSlide";
import { adminContainer } from "../../../../../infrastructure/di/adminContainer";
import { hasAdminSession, unauthorised } from "../../../session";
import { json, parseDeckEdits, parseDeckTarget } from "../shared";

export const dynamic = "force-dynamic";

export async function POST(request: Request): Promise<Response> {
  if (!(await hasAdminSession())) return unauthorised();

  const body: unknown = await request.json().catch(() => null);
  const candidate = (body ?? {}) as Record<string, unknown>;
  const target = parseDeckTarget(candidate.target);
  const edits = parseDeckEdits(candidate.edits);
  if (!target || !edits) return json({ ok: false, valueId: null, message: "Malformed request." }, 400);

  const result = await new SaveDeckSlide(adminContainer.capabilityDeck).execute(target, edits);
  if (result.ok && result.saved > 0) {
    await adminContainer.capabilityDeck.logActivity({ action: "saved", sectionLabel: target.slideId });
  }
  return json(result, result.ok ? 200 : result.conflict ? 409 : 422);
}
