import type { DeckSlideTarget, CmsValueEdit } from "../../../../application/capability-deck/EditDeckSlide";

export function json(payload: unknown, status: number): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { "content-type": "application/json", "cache-control": "no-store" },
  });
}

export function parseDeckTarget(value: unknown): DeckSlideTarget | null {
  if (!value || typeof value !== "object") return null;
  const candidate = value as Record<string, unknown>;
  return typeof candidate.slideId === "string" ? { slideId: candidate.slideId } : null;
}

export function parseDeckEdits(value: unknown): ReadonlyArray<CmsValueEdit> | null {
  if (!Array.isArray(value)) return null;
  const parsed: CmsValueEdit[] = [];
  for (const entry of value) {
    if (!entry || typeof entry !== "object") return null;
    const candidate = entry as Record<string, unknown>;
    if (typeof candidate.valueId !== "string" || typeof candidate.value !== "string") return null;
    if (candidate.recordId !== undefined && typeof candidate.recordId !== "string") return null;
    if (candidate.version !== undefined && !(typeof candidate.version === "number" && Number.isInteger(candidate.version))) {
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

export function text(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

export function stringArray(value: unknown): ReadonlyArray<string> | null {
  return Array.isArray(value) && value.every((v) => typeof v === "string") ? value : null;
}
