import { revalidatePath } from "next/cache";
import { AddDeckSlide, RemoveDeckSlide, ReorderDeckSlides } from "../../../../../application/capability-deck/ManageDeckRecords";
import { adminContainer } from "../../../../../infrastructure/di/adminContainer";
import { hasAdminSession, unauthorised } from "../../../session";
import { json, stringArray, text } from "../shared";

export const dynamic = "force-dynamic";

export async function POST(request: Request): Promise<Response> {
  if (!(await hasAdminSession())) return unauthorised();
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  const slideKey = text(body?.slideKey);
  if (slideKey === null) return json({ ok: false, message: "Malformed request." }, 400);
  const afterSlideId = body?.afterSlideId === null ? null : text(body?.afterSlideId);

  const result = await new AddDeckSlide(adminContainer.capabilityDeck).execute(slideKey, afterSlideId);
  if (result.ok) revalidatePath("/capability-deck");
  return json(result, result.ok ? 200 : 422);
}

export async function DELETE(request: Request): Promise<Response> {
  if (!(await hasAdminSession())) return unauthorised();
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  const slideId = text(body?.slideId);
  if (slideId === null) return json({ ok: false, message: "Malformed request." }, 400);

  const result = await new RemoveDeckSlide(adminContainer.capabilityDeck).execute(slideId);
  if (result.ok) revalidatePath("/capability-deck");
  return json(result, result.ok ? 200 : 422);
}

export async function PATCH(request: Request): Promise<Response> {
  if (!(await hasAdminSession())) return unauthorised();
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  const orderedSlideIds = stringArray(body?.orderedSlideIds);
  if (orderedSlideIds === null) return json({ ok: false, message: "Malformed request." }, 400);

  const result = await new ReorderDeckSlides(adminContainer.capabilityDeck).execute(orderedSlideIds);
  if (result.ok) revalidatePath("/capability-deck");
  return json(result, result.ok ? 200 : 422);
}
