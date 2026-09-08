import type { CmsSectionTarget, CmsValueEdit } from "../../../application/cms/EditCmsSection";

/**
 * The three things every admin endpoint does with a request body, in one place: read a section
 * target off it, read a list of edits off it, and answer in JSON that no cache may keep.
 *
 * Everything here is a type guard rather than a cast. A body arrives as `unknown` and stays
 * unknown until each field has been checked, which is what stops a malformed request becoming an
 * `undefined` three layers down.
 */

export function json(payload: unknown, status: number): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { "content-type": "application/json", "cache-control": "no-store" },
  });
}

export function parseTarget(value: unknown): CmsSectionTarget | null {
  if (!value || typeof value !== "object") return null;
  const candidate = value as Record<string, unknown>;
  return typeof candidate.pageId === "string" && typeof candidate.sectionId === "string"
    ? { pageId: candidate.pageId, sectionId: candidate.sectionId }
    : null;
}

export function parseEdits(value: unknown): ReadonlyArray<CmsValueEdit> | null {
  if (!Array.isArray(value)) return null;

  const parsed: CmsValueEdit[] = [];
  for (const entry of value) {
    if (!entry || typeof entry !== "object") return null;
    const candidate = entry as Record<string, unknown>;
    if (typeof candidate.valueId !== "string" || typeof candidate.value !== "string") return null;
    // Which record within the section the field is on — the section itself, or one of the
    // cards inside it. Optional, because a section field does not need to name one.
    if (candidate.recordId !== undefined && typeof candidate.recordId !== "string") return null;
    // The revision, when the screen had one. A non-integer is refused rather than coerced: a NaN
    // in the comparison would match nothing and read as a conflict.
    if (
      candidate.version !== undefined &&
      !(typeof candidate.version === "number" && Number.isInteger(candidate.version))
    ) {
      return null;
    }
    parsed.push({
      valueId: candidate.valueId,
      value: candidate.value,
      ...(candidate.recordId === undefined ? {} : { recordId: candidate.recordId as string }),
      ...(candidate.version === undefined ? {} : { version: candidate.version as number }),
    });
  }
  return parsed;
}
