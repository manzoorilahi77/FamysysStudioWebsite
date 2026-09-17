import { revalidatePath } from "next/cache";
import { CreateDeckItem, DeleteDeckItem, ReorderDeckItems } from "../../../../../application/capability-deck/ManageDeckRecords";
import { adminContainer } from "../../../../../infrastructure/di/adminContainer";
import { hasAdminSession, unauthorised } from "../../../session";
import { json, stringArray, text } from "../shared";

export const dynamic = "force-dynamic";

export async function POST(request: Request): Promise<Response> {
  if (!(await hasAdminSession())) return unauthorised();
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  const collectionId = text(body?.collectionId);
  const title = text(body?.title);
  const summary = text(body?.summary);
  if (collectionId === null || title === null || summary === null) {
    return json({ ok: false, message: "Malformed request." }, 400);
  }

  const result = await new CreateDeckItem(adminContainer.capabilityDeck).execute(collectionId, {
    slug: text(body?.slug) ?? "",
    title,
    summary,
  });
  if (result.ok) revalidatePath("/capability-deck");
  return json(result, result.ok ? 200 : 422);
}

export async function DELETE(request: Request): Promise<Response> {
  if (!(await hasAdminSession())) return unauthorised();
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  const collectionId = text(body?.collectionId);
  const itemId = text(body?.itemId);
  if (collectionId === null || itemId === null) return json({ ok: false, message: "Malformed request." }, 400);

  const result = await new DeleteDeckItem(adminContainer.capabilityDeck).execute(collectionId, itemId);
  if (result.ok) revalidatePath("/capability-deck");
  return json(result, result.ok ? 200 : 422);
}

export async function PATCH(request: Request): Promise<Response> {
  if (!(await hasAdminSession())) return unauthorised();
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  const collectionId = text(body?.collectionId);
  const orderedItemIds = stringArray(body?.orderedItemIds);
  if (collectionId === null || orderedItemIds === null) return json({ ok: false, message: "Malformed request." }, 400);

  const result = await new ReorderDeckItems(adminContainer.capabilityDeck).execute(collectionId, orderedItemIds);
  if (result.ok) revalidatePath("/capability-deck");
  return json(result, result.ok ? 200 : 422);
}
