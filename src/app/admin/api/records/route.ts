import { CreateCmsRecord, DeleteCmsRecord } from "../../../../application/cms/ManageCmsRecords";
import { adminContainer } from "../../../../infrastructure/di/adminContainer";
import { structureChanged } from "../../revalidate";
import { hasAdminSession, unauthorised } from "../../session";

/**
 * ADDING AND REMOVING COLLECTION RECORDS.
 *
 * POST creates, DELETE removes. Both check the session themselves: a route handler has no
 * layout above it, so the gate that covers every screen does not cover this.
 *
 * WHAT THE BODY MAY CONTAIN: a collection id, and for a create the three strings a list
 * row needs. The use case then asks the repository which collections exist and refuses
 * anything else, and the repository holds a closed list of the tables a record can be
 * added to — so a collection id from a request is matched against literals in the code and
 * never reaches a query as a name.
 *
 * A delete is not reversible and there is no bin. The confirmation — typing the record's
 * title back — is in the interface, where the person is; what is here is the refusal to
 * delete something that is no longer there, which is what a double-submitted form does.
 */
export const dynamic = "force-dynamic";

function json(payload: unknown, status: number): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { "content-type": "application/json", "cache-control": "no-store" },
  });
}

function text(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

export async function POST(request: Request): Promise<Response> {
  if (!(await hasAdminSession())) return unauthorised();

  const body: unknown = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return json({ ok: false, message: "Malformed request." }, 400);
  }
  const candidate = body as Record<string, unknown>;
  const collectionId = text(candidate.collectionId);
  const title = text(candidate.title);
  const summary = text(candidate.summary);
  if (collectionId === null || title === null || summary === null) {
    return json({ ok: false, message: "Malformed request." }, 400);
  }

  const result = await new CreateCmsRecord(adminContainer.cms).execute(collectionId, {
    slug: text(candidate.slug) ?? "",
    title,
    summary,
  });
  if (result.ok) structureChanged();
  return json(result, result.ok ? 200 : 422);
}

export async function DELETE(request: Request): Promise<Response> {
  if (!(await hasAdminSession())) return unauthorised();

  const body: unknown = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return json({ ok: false, message: "Malformed request." }, 400);
  }
  const candidate = body as Record<string, unknown>;
  const collectionId = text(candidate.collectionId);
  const recordId = text(candidate.recordId);
  if (collectionId === null || recordId === null) {
    return json({ ok: false, message: "Malformed request." }, 400);
  }

  const result = await new DeleteCmsRecord(adminContainer.cms).execute(collectionId, recordId);
  if (result.ok) structureChanged();
  return json(result, result.ok ? 200 : 422);
}
