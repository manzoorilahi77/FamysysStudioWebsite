import { SetInquiryStatus } from "../../../../application/cms/ManageCmsRecords";
import { adminContainer } from "../../../../infrastructure/di/adminContainer";
import { hasAdminSession, unauthorised } from "../../session";

/**
 * MARK AN ENQUIRY READ OR ARCHIVED.
 *
 * Three states and no fourth: an enquiry is new until someone opens it, read once they
 * have, and archived when it is dealt with. Archiving hides it from the inbox; it does not
 * delete it, because a lead is the one thing on this site that cannot be regenerated from
 * a content file.
 *
 * The status is checked against a literal list here rather than passed through to the
 * column — the column is an ENUM and would reject anything else, but a rejection from
 * MySQL arrives as a 500 with a driver message in it, and this arrives as a 400.
 */
export const dynamic = "force-dynamic";

const STATUSES = ["new", "read", "archived"] as const;
type Status = (typeof STATUSES)[number];

function isStatus(value: unknown): value is Status {
  return typeof value === "string" && (STATUSES as ReadonlyArray<string>).includes(value);
}

export async function POST(request: Request): Promise<Response> {
  if (!(await hasAdminSession())) return unauthorised();

  const body: unknown = await request.json().catch(() => null);
  const candidate = (body ?? {}) as Record<string, unknown>;
  if (typeof candidate.id !== "string" || !isStatus(candidate.status)) {
    return new Response(JSON.stringify({ ok: false, message: "Malformed request." }), {
      status: 400,
      headers: { "content-type": "application/json", "cache-control": "no-store" },
    });
  }

  const result = await new SetInquiryStatus(adminContainer.cms).execute(
    candidate.id,
    candidate.status,
  );
  return new Response(JSON.stringify(result), {
    status: result.ok ? 200 : 422,
    headers: { "content-type": "application/json", "cache-control": "no-store" },
  });
}
