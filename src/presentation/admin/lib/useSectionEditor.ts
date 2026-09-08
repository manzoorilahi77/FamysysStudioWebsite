"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { CmsSectionTarget, CmsValueEdit } from "../../../application/cms/EditCmsSection";
import { validateContentValue } from "../../../application/cms/ValidateContentValue";
import { currentValue, recordTree, recordValues } from "../../../domain/cms/entities/CmsRecord";
import type { CmsRecord, CmsValue } from "../../../domain/cms/entities/CmsRecord";

/**
 * THE EDITOR'S STATE, IN ONE PLACE.
 *
 * What it holds is the difference between what is in the boxes and what is SAVED — which is
 * a draft if there is one, and the published string otherwise. That distinction is the whole
 * of the three-step flow: a field is "unsaved" when the box differs from the draft, and the
 * section is "unpublished" when a draft exists at all, and the two are never conflated.
 *
 * NOTHING IS DISCARDED SILENTLY. A failed save leaves every box exactly as it was, so the
 * work is still on the screen to try again with. Navigating away with unsaved boxes asks
 * first — both for a real page unload and for a click on any link inside the panel, which
 * the App Router would otherwise follow without a word.
 *
 * VALIDATION RUNS BEFORE THE REQUEST, against the same domain value objects the server will
 * use — so a bad URL is marked against its own field the moment Save is pressed, without a
 * round trip. The server checks again regardless: this is for the editor, not for safety.
 */

/** A field is addressed by the record it is on and its id within that record. */
export function fieldPath(recordId: string, valueId: string): string {
  return `${recordId}/${valueId}`;
}

export interface EditorField {
  readonly recordId: string;
  readonly value: CmsValue;
  readonly path: string;
  /** The picture this alt text belongs to, when it is alt text. */
  readonly mediaPath?: string;
}

export type EditorStatus =
  | { readonly kind: "idle" }
  | { readonly kind: "busy"; readonly message: string }
  | { readonly kind: "done"; readonly message: string }
  | { readonly kind: "failed"; readonly message: string };

/** Every editable field on the section and on the cards inside it, flattened once. */
function fieldsOf(section: CmsRecord): ReadonlyArray<EditorField> {
  return recordTree(section).flatMap((record) => {
    const mediaByAlt = new Map(
      record.groups.flatMap((group) => group.media).map((entry) => [entry.alt.id, entry.path]),
    );
    return recordValues(record).map((value): EditorField => {
      const mediaPath = mediaByAlt.get(value.id);
      return {
        recordId: record.id,
        value,
        path: fieldPath(record.id, value.id),
        ...(mediaPath === undefined ? {} : { mediaPath }),
      };
    });
  });
}

interface ApiResult {
  readonly ok?: boolean;
  readonly message?: string;
  readonly valueId?: string | null;
}

export function useSectionEditor(section: CmsRecord, target: CmsSectionTarget) {
  const router = useRouter();
  const fields = useMemo(() => fieldsOf(section), [section]);
  const byPath = useMemo(() => new Map(fields.map((field) => [field.path, field])), [fields]);

  const [boxes, setBoxes] = useState<Readonly<Record<string, string>>>({});
  const [errors, setErrors] = useState<Readonly<Record<string, string>>>({});
  const [status, setStatus] = useState<EditorStatus>({ kind: "idle" });

  const valueOf = useCallback(
    (path: string) => boxes[path] ?? currentValue(byPath.get(path)?.value ?? BLANK),
    [boxes, byPath],
  );

  const changed = useMemo(
    () =>
      fields.filter(
        (field) =>
          boxes[field.path] !== undefined && boxes[field.path] !== currentValue(field.value),
      ),
    [boxes, fields],
  );
  const isDirty = changed.length > 0;

  const set = useCallback((path: string, next: string) => {
    setBoxes((current) => ({ ...current, [path]: next }));
    setErrors((current) =>
      current[path] === undefined
        ? current
        : Object.fromEntries(Object.entries(current).filter(([key]) => key !== path)),
    );
    setStatus({ kind: "idle" });
  }, []);

  // A real navigation away — closing the tab, typing another address. The browser shows
  // its own wording; the only thing a page can do is ask for the prompt.
  useEffect(() => {
    if (!isDirty) return;
    const warn = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [isDirty]);

  // A click on any link inside the panel. The App Router navigates without unloading the
  // document, so `beforeunload` never fires and the edits would go without a word. Caught
  // on the way down so it runs before the router's own handler.
  useEffect(() => {
    if (!isDirty) return;
    const intercept = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey) return;
      const anchor = (event.target as HTMLElement | null)?.closest?.("a");
      const href = anchor?.getAttribute("href");
      if (!anchor || !href || anchor.target === "_blank" || !href.startsWith("/")) return;
      if (
        !window.confirm(
          "This section has changes that have not been saved. Leave the page and lose them?",
        )
      ) {
        event.preventDefault();
        event.stopPropagation();
      }
    };
    document.addEventListener("click", intercept, true);
    return () => document.removeEventListener("click", intercept, true);
  }, [isDirty]);

  const post = useCallback(async (url: string, body: unknown): Promise<ApiResult> => {
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });
      const result = (await response.json()) as ApiResult;
      return { ...result, ok: result.ok ?? response.ok };
    } catch {
      return { ok: false, message: "The server did not answer. Check that it is running." };
    }
  }, []);

  const save = useCallback(async (): Promise<boolean> => {
    // Client-side first, so a rejected field is marked without a round trip.
    const found: Record<string, string> = {};
    for (const field of changed) {
      const rejection = validateContentValue(
        field.value,
        boxes[field.path] ?? "",
        field.mediaPath,
      );
      if (rejection) found[field.path] = rejection;
    }
    if (Object.keys(found).length > 0) {
      setErrors(found);
      setStatus({
        kind: "failed",
        message: `Nothing was saved. ${Object.keys(found).length === 1 ? "One field needs" : `${Object.keys(found).length} fields need`} fixing first.`,
      });
      return false;
    }

    setStatus({ kind: "busy", message: "Saving…" });
    const edits: ReadonlyArray<CmsValueEdit> = changed.map((field) => ({
      recordId: field.recordId,
      valueId: field.value.id,
      value: boxes[field.path] ?? "",
      ...(field.value.version === undefined ? {} : { version: field.value.version }),
    }));

    const result = await post("/admin/api/save", { target, edits });
    if (!result.ok) {
      // The boxes are left exactly as they are: a failed save must not cost the typing.
      if (result.valueId) {
        const field = changed.find((entry) => entry.value.id === result.valueId);
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
  }, [boxes, changed, post, router, target]);

  const run = useCallback(
    async (url: string, busy: string) => {
      setStatus({ kind: "busy", message: busy });
      const result = await post(url, { target });
      setStatus({
        kind: result.ok ? "done" : "failed",
        message: result.message ?? (result.ok ? "Done." : "That did not work."),
      });
      if (result.ok) {
        setBoxes({});
        router.refresh();
      }
    },
    [post, router, target],
  );

  return {
    fields,
    valueOf,
    errorOf: (path: string) => errors[path],
    isChanged: (path: string) => changed.some((field) => field.path === path),
    set,
    isDirty,
    changedCount: changed.length,
    status,
    save,
    publish: () => run("/admin/api/publish", "Publishing…"),
    discard: () => run("/admin/api/discard", "Discarding…"),
  };
}

/** Stands in for a field the model no longer has, so a stale box cannot throw. */
const BLANK: CmsValue = {
  id: "",
  label: "",
  value: "",
  kind: "text",
  multiline: false,
  approval: "drafted",
  usedElsewhere: [],
};
