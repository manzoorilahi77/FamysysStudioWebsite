import { PublishDeckSlide } from "../../../../../application/capability-deck/EditDeckSlide";
import { adminContainer } from "../../../../../infrastructure/di/adminContainer";
import { hasAdminSession, unauthorised } from "../../../session";
import { json, parseDeckTarget } from "../shared";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

export async function POST(request: Request): Promise<Response> {
  if (!(await hasAdminSession())) return unauthorised();

  const body: unknown = await request.json().catch(() => null);
  const target = parseDeckTarget((body as Record<string, unknown> | null)?.target);
  if (!target) return json({ ok: false, message: "Malformed request." }, 400);

  const result = await new PublishDeckSlide(adminContainer.capabilityDeck).execute(target);
  if (!result.ok) return json(result, result.conflict ? 409 : 422);

  // The deck is one route, unlike the seven pages' many-route fan-out — no routesFor needed.
  revalidatePath("/capability-deck");
  if (result.published > 0) {
    await adminContainer.capabilityDeck.logActivity({ action: "published", sectionLabel: target.slideId });
  }
  return json(result, 200);
}
