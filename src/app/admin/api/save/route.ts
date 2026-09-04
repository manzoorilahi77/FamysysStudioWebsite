import type { CmsSaveTarget, CmsValueEdit } from "../../../../application/cms/SaveCmsRecord";
import { SaveCmsRecord } from "../../../../application/cms/SaveCmsRecord";
import { adminContainer } from "../../../../infrastructure/di/adminContainer";
import { contentChanged } from "../../revalidate";
import { hasAdminSession, unauthorised } from "../../session";

/**
 * THE ENDPOINT THAT WRITES A RECORD'S STRINGS.
 *
 * It checks the session itself. Every screen in the panel is covered by the (panel)
 * layout's gate, but a route handler has no layout above it — so the check that matters
 * most is the one that has to be written out by hand.
 *
 * WHAT THE BODY MAY CONTAIN: ids, and strings. No file path, no property path, no pointer,
 * no table name. The record is re-read server-side and both addresses — the source pointer
 * and the record address — come from the read model, so the worst a malformed body can do
 * is name a field that does not exist and be told so.
 */

export const dynamic = "force-dynamic";

interface SaveRequestBody {
  readonly target: CmsSaveTarget;
  readonly edits: ReadonlyArray<CmsValueEdit>;
}

function isTarget(value: unknown): value is CmsSaveTarget {
  if (!value || typeof value !== "object") {
    return false;
  }
  const candidate = value as Record<string, unknown>;
  if (candidate.kind === "section") {
    return typeof candidate.pageId === "string" && typeof candidate.sectionId === "string";
  }
  if (candidate.kind === "record") {
    return typeof candidate.collectionId === "string" && typeof candidate.recordId === "string";
  }
  return false;
}

function isEdits(value: unknown): value is ReadonlyArray<CmsValueEdit> {
  return (
    Array.isArray(value) &&
    value.every((entry) => {
      if (!entry || typeof entry !== "object") {
        return false;
      }
      const candidate = entry as Record<string, unknown>;
      if (typeof candidate.valueId !== "string" || typeof candidate.value !== "string") {
        return false;
      }
      // The revision, when the screen had one. A non-integer is refused rather than
      // coerced: a NaN in the WHERE clause would match nothing and read as a conflict.
      return (
        candidate.version === undefined ||
        (typeof candidate.version === "number" && Number.isInteger(candidate.version))
      );
    })
  );
}

function parseBody(body: unknown): SaveRequestBody | null {
  if (!body || typeof body !== "object") {
    return null;
  }
  const candidate = body as Record<string, unknown>;
  if (!isTarget(candidate.target) || !isEdits(candidate.edits)) {
    return null;
  }
  return { target: candidate.target, edits: candidate.edits };
}

function json(payload: unknown, status: number): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { "content-type": "application/json", "cache-control": "no-store" },
  });
}

export async function POST(request: Request): Promise<Response> {
  if (!(await hasAdminSession())) {
    return unauthorised();
  }

  const body = parseBody(await request.json().catch(() => null));
  if (!body) {
    return json({ ok: false, valueId: null, message: "Malformed request." }, 400);
  }

  const result = await new SaveCmsRecord(adminContainer.cms).execute(body.target, body.edits);

  // 422 rather than 400 for a rejected value: the request was well formed and the content
  // was not, and the interface tells those apart when it decides which field to mark.
  // 409 for a lost race, because that one is not the editor's mistake and the message
  // asks them to reload rather than to fix what they typed.
  // Only on success: a rejected save changed nothing, and regenerating seven pages for
  // a typo would be work nobody asked for.
  if (result.ok && result.written > 0) contentChanged();

  const status = result.ok ? 200 : /changed since/.test(result.message) ? 409 : 422;
  return json(result, status);
}
