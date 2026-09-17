"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { DeckSlideTarget, CmsValueEdit } from "../../../application/capability-deck/EditDeckSlide";
import { validateContentValue } from "../../../application/cms/ValidateContentValue";
import { currentValue, recordTree, recordValues } from "../../../domain/cms/entities/CmsRecord";
import type { CmsRecord, CmsValue } from "../../../domain/cms/entities/CmsRecord";

export function fieldPath(recordId: string, valueId: string): string {
  return `${recordId}/${valueId}`;
}

interface EditorField {
  readonly recordId: string;
  readonly value: CmsValue;
  readonly path: string;
  readonly media?: { readonly path: string; readonly srcField?: string; readonly posterField?: string };
}

type EditorStatus =
  | { readonly kind: "idle" }
  | { readonly kind: "busy"; readonly message: string }
  | { readonly kind: "done"; readonly message: string }
  | { readonly kind: "failed"; readonly message: string };

function fieldsOf(slide: CmsRecord): ReadonlyArray<EditorField> {
  return recordTree(slide).flatMap((record) => {
    const blockOf = new Map<string, EditorField["media"]>();
    for (const entry of record.groups.flatMap((g) => g.media)) {
      const block = {
        path: entry.path,
        ...(entry.src ? { srcField: fieldPath(record.id, entry.src.id) } : {}),
        ...(entry.posterValue ? { posterField: fieldPath(record.id, entry.posterValue.id) } : {}),
      };
      for (const owned of [entry.alt, entry.src, entry.posterValue]) if (owned) blockOf.set(owned.id, block);
    }
    return recordValues(record).map((value): EditorField => {
      const media = blockOf.get(value.id);
      return {
        recordId: record.id,
        value,
        path: fieldPath(record.id, value.id),
        ...(media === undefined ? {} : { media }),
      };
    });
  });
}

interface ApiResult {
  readonly ok?: boolean;
  readonly message?: string;
  readonly valueId?: string | null;
}

export function useDeckSlideEditor(slide: CmsRecord, target: DeckSlideTarget) {
  const router = useRouter();
  const fields = useMemo(() => fieldsOf(slide), [slide]);
  const byPath = useMemo(() => new Map(fields.map((f) => [f.path, f])), [fields]);

  const [boxes, setBoxes] = useState<Readonly<Record<string, string>>>({});
  const [errors, setErrors] = useState<Readonly<Record<string, string>>>({});
  const [status, setStatus] = useState<EditorStatus>({ kind: "idle" });

  const valueOf = useCallback(
    (path: string) => boxes[path] ?? currentValue(byPath.get(path)?.value ?? BLANK),
    [boxes, byPath],
  );

  const changed = useMemo(
    () => fields.filter((f) => boxes[f.path] !== undefined && boxes[f.path] !== currentValue(f.value)),
    [boxes, fields],
  );
  const isDirty = changed.length > 0;

  const set = useCallback((path: string, next: string) => {
    setBoxes((current) => ({ ...current, [path]: next }));
    setErrors((current) => (current[path] === undefined ? current : Object.fromEntries(Object.entries(current).filter(([k]) => k !== path))));
    setStatus({ kind: "idle" });
  }, []);

  useEffect(() => {
    if (!isDirty) return;
    const warn = (e: BeforeUnloadEvent) => { e.preventDefault(); e.returnValue = ""; };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [isDirty]);

  useEffect(() => {
    if (!isDirty) return;
    const intercept = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey) return;
      const anchor = (event.target as HTMLElement | null)?.closest?.("a");
      const href = anchor?.getAttribute("href");
      if (!anchor || !href || anchor.target === "_blank" || !href.startsWith("/")) return;
      if (!window.confirm("This slide has changes that have not been saved. Leave the page and lose them?")) {
        event.preventDefault();
        event.stopPropagation();
      }
    };
    document.addEventListener("click", intercept, true);
    return () => document.removeEventListener("click", intercept, true);
  }, [isDirty]);

  const post = useCallback(async (url: string, body: unknown): Promise<ApiResult> => {
    try {
      const response = await fetch(url, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
      const result = (await response.json()) as ApiResult;
      return { ...result, ok: result.ok ?? response.ok };
    } catch {
      return { ok: false, message: "The server did not answer. Check that it is running." };
    }
  }, []);

  const save = useCallback(async (): Promise<boolean> => {
    const found: Record<string, string> = {};
    for (const field of changed) {
      const rejection = validateContentValue(field.value, boxes[field.path] ?? "", {
        ...(field.media ? { path: field.media.path } : {}),
        ...(field.media?.srcField ? { src: valueOf(field.media.srcField) } : {}),
        ...(field.media?.posterField ? { poster: valueOf(field.media.posterField) } : {}),
      });
      if (rejection) found[field.path] = rejection;
    }
    if (Object.keys(found).length > 0) {
      setErrors(found);
      setStatus({ kind: "failed", message: `Nothing was saved. ${Object.keys(found).length === 1 ? "One field needs" : `${Object.keys(found).length} fields need`} fixing first.` });
      return false;
    }

    setStatus({ kind: "busy", message: "Saving…" });
    const edits: ReadonlyArray<CmsValueEdit> = changed.map((f) => ({
      recordId: f.recordId,
      valueId: f.value.id,
      value: boxes[f.path] ?? "",
      ...(f.value.version === undefined ? {} : { version: f.value.version }),
    }));

    const result = await post("/admin/api/capability-deck/save", { target, edits });
    if (!result.ok) {
      if (result.valueId) {
        const field = changed.find((f) => f.value.id === result.valueId);
        if (field) setErrors({ [field.path]: result.message ?? "This value was rejected." });
      }
      setStatus({ kind: "failed", message: result.message ?? "Nothing was saved." });
      return false;
    }
    setBoxes({});
    setErrors({});
    setStatus({ kind: "done", message: result.message ?? "Saved as a draft." });
    router.refresh();
    return true;
  }, [boxes, changed, post, router, target, valueOf]);

  const run = useCallback(async (url: string, busy: string) => {
    setStatus({ kind: "busy", message: busy });
    const result = await post(url, { target });
    setStatus({ kind: result.ok ? "done" : "failed", message: result.message ?? (result.ok ? "Done." : "That did not work.") });
    if (result.ok) { setBoxes({}); router.refresh(); }
  }, [post, router, target]);

  return {
    fields,
    valueOf,
    errorOf: (path: string) => errors[path],
    isChanged: (path: string) => changed.some((f) => f.path === path),
    set,
    isDirty,
    changedCount: changed.length,
    status,
    save,
    publish: () => run("/admin/api/capability-deck/publish", "Publishing…"),
    discard: () => run("/admin/api/capability-deck/discard", "Discarding…"),
  };
}

const BLANK: CmsValue = { id: "", label: "", value: "", kind: "text", multiline: false, approval: "drafted", usedElsewhere: [] };
