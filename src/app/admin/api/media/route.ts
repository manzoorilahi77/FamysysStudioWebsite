import { UploadMedia } from "../../../../application/cms/UploadMedia";
import { MAX_BYTES } from "../../../../application/cms/mediaTypes";
import { PublicMediaStore } from "../../../../infrastructure/media/PublicMediaStore";
import { hasAdminSession, unauthorised } from "../../session";

/**
 * UPLOADING A FILE.
 *
 * It checks the session itself: a route handler has no layout above it, so the gate that
 * covers every screen does not cover this one.
 *
 * WHAT THIS ENDPOINT DOES NOT DO is change any content. It writes a file and answers with
 * its path. Pointing a record at that path is a form edit like any other — unsaved until
 * Save, and not on the site until Publish. So a successful upload changes nothing a visitor
 * can see, which is what makes it safe for it to have no undo.
 *
 * THE CAP IS CHECKED TWICE, and the first check is the one that matters: `content-length` is
 * read before the body is, so an oversized upload is refused without being pulled into
 * memory. The header is a claim and can lie, so the real bytes are measured afterwards by
 * the use case — but a truthful client, which is the panel, never gets that far.
 */
export const dynamic = "force-dynamic";

/** The larger of the two per-kind caps, plus room for multipart framing. */
const REQUEST_LIMIT = Math.max(...Object.values(MAX_BYTES)) + 1024 * 1024;

function json(payload: unknown, status: number): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { "content-type": "application/json", "cache-control": "no-store" },
  });
}

export async function POST(request: Request): Promise<Response> {
  if (!(await hasAdminSession())) return unauthorised();

  const declared = Number(request.headers.get("content-length") ?? "0");
  if (Number.isFinite(declared) && declared > REQUEST_LIMIT) {
    return json({ ok: false, message: "That file is too large to upload." }, 413);
  }

  const form = await request.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) {
    return json({ ok: false, message: "No file was sent." }, 400);
  }

  const result = await new UploadMedia(new PublicMediaStore()).execute({
    bytes: new Uint8Array(await file.arrayBuffer()),
    clientName: file.name,
  });

  if (!result.ok) {
    return json({ ok: false, message: result.message }, 400);
  }

  return json(
    {
      ok: true,
      path: result.media.path,
      kind: result.media.kind,
      wasAlreadyStored: result.media.wasAlreadyStored,
    },
    200,
  );
}
