"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { CmsRecord, CmsValue } from "../../../domain/cms/entities/CmsRecord";
import { recordValues } from "../../../domain/cms/entities/CmsRecord";
import type { CmsSaveTarget } from "../../../application/cms/SaveCmsRecord";
import { relativeTime } from "../lib/relativeTime";
import { AdminPanel } from "./AdminPanel";
import { StatusPill } from "./StatusPill";
import { ValueField } from "./ValueField";

/**
 * THE EDITOR. One record, every string on it, and one Save.
 *
 * SAVE IS PER RECORD, NOT PER FIELD. A record's strings are written together because they
 * are read together: a capability's title lives in one file and its expanded copy in
 * another, and saving them one at a time would leave the pair disagreeing between two
 * requests. It also means the disabled/enabled Save button is an honest summary — there
 * is exactly one thing to press and one thing it does.
 *
 * UNSAVED WORK IS DEFENDED TWICE. `beforeunload` covers a reload, a closed tab and a typed
 * URL; a capture-phase click handler covers an in-app link, which `beforeunload` never
 * sees because the App Router never unloads the document.
 *
 * The component is remounted (see the `key` its callers pass) whenever the content file's
 * mtime changes, so a successful save leaves it showing what is now on disk rather than
 * what was typed.
 */

interface RecordEditorProps {
  readonly record: CmsRecord;
  readonly target: CmsSaveTarget;
}

type SaveState =
  | { readonly kind: "idle" }
  | { readonly kind: "saving" }
  | { readonly kind: "saved"; readonly written: number }
  | { readonly kind: "failed"; readonly message: string };

interface SaveResponse {
  readonly ok: boolean;
  readonly written?: number;
  readonly valueId?: string | null;
  readonly message?: string;
}

function initialDraft(record: CmsRecord): Record<string, string> {
  return Object.fromEntries(recordValues(record).map((value) => [value.id, value.value]));
}

export function RecordEditor({ record, target }: RecordEditorProps) {
  const router = useRouter();
  const values = useMemo(() => recordValues(record), [record]);
  const [draft, setDraft] = useState<Record<string, string>>(() => initialDraft(record));
  /**
   * What is currently on disk, as far as this form knows. It starts as the record and
   * moves to whatever a save wrote — NOT re-derived from the record on every render.
   * `router.refresh()` re-runs the server component, but the content module it reads
   * through is cached by the dev server and can still be one revision behind for a moment
   * after a write. Comparing against the record directly made a just-saved field keep
   * showing "Unsaved" until that cache caught up.
   */
  const [baseline, setBaseline] = useState<Record<string, string>>(() => initialDraft(record));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [state, setState] = useState<SaveState>({ kind: "idle" });

  const dirtyIds = useMemo(
    () => values.filter((value) => draft[value.id] !== baseline[value.id]).map((value) => value.id),
    [values, draft, baseline],
  );
  const isDirty = dirtyIds.length > 0;

  const change = useCallback((id: string, next: string) => {
    setDraft((current) => ({ ...current, [id]: next }));
    setErrors((current) =>
      id in current
        ? Object.fromEntries(Object.entries(current).filter(([key]) => key !== id))
        : current,
    );
    setState({ kind: "idle" });
  }, []);

  // A reload, a closed tab, a typed URL. The browser shows its own wording; the string
  // here is required by the older API and displayed by nothing modern.
  useEffect(() => {
    if (!isDirty) {
      return;
    }
    const warn = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [isDirty]);

  // An in-app link. The App Router navigates without unloading, so `beforeunload` never
  // fires — this is the only thing standing between a half-typed paragraph and the back
  // button. Capture phase, so it runs before the router's own handler.
  useEffect(() => {
    if (!isDirty) {
      return;
    }
    const intercept = (event: MouseEvent) => {
      const link = (event.target as HTMLElement | null)?.closest?.("a[href]");
      if (!link || event.defaultPrevented || event.metaKey || event.ctrlKey) {
        return;
      }
      if (!window.confirm("You have unsaved changes on this record. Leave without saving?")) {
        event.preventDefault();
        event.stopPropagation();
      }
    };
    document.addEventListener("click", intercept, true);
    return () => document.removeEventListener("click", intercept, true);
  }, [isDirty]);

  async function save() {
    setState({ kind: "saving" });
    setErrors({});

    // The revision each field was showing when this screen was drawn. The server compares
    // it against the stored one, so a save from a screen that has gone stale is refused
    // rather than quietly undoing whoever saved in the meantime.
    const versionOf = new Map(values.map((value) => [value.id, value.version]));
    const edits = dirtyIds.map((id) => {
      const version = versionOf.get(id);
      return {
        valueId: id,
        value: draft[id] ?? "",
        ...(version === undefined ? {} : { version }),
      };
    });

    let payload: SaveResponse;
    try {
      const response = await fetch("/admin/api/save", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ target, edits }),
      });
      payload = (await response.json()) as SaveResponse;
    } catch {
      setState({ kind: "failed", message: "The dev server did not answer. Is it still running?" });
      return;
    }

    if (payload.ok) {
      setBaseline((current) => ({
        ...current,
        ...Object.fromEntries(edits.map((edit) => [edit.valueId, edit.value])),
      }));
      setState({ kind: "saved", written: payload.written ?? edits.length });
      // Re-read from disk. The file's mtime has moved, so the record comes back with a
      // new key and this component remounts on what was actually written.
      router.refresh();
      return;
    }

    const message = payload.message ?? "The save was rejected.";
    if (payload.valueId) {
      setErrors({ [payload.valueId]: message });
      setState({ kind: "failed", message: "One field was rejected. Nothing was written." });
      return;
    }
    setState({ kind: "failed", message });
  }

  const editable = values.filter((value) => value.pointer).length;

  return (
    <form
      className="flex flex-col gap-6"
      onSubmit={(event) => {
        event.preventDefault();
        void save();
      }}
    >
      <SaveBar
        isDirty={isDirty}
        count={dirtyIds.length}
        editable={editable}
        total={values.length}
        state={state}
      />

      <AdminPanel label="Record" meta={relativeTime(record.updatedAt)}>
        <div className="flex items-center justify-between gap-6 border-b border-hairline px-5 py-4">
          <p className="text-small text-graphite-70">{record.summary}</p>
          <StatusPill status={record.status} />
        </div>
        <div className="flex flex-col gap-6 px-5 py-5">
          {record.values.map((value) => (
            <Field
              key={value.id}
              value={value}
              draft={draft}
              baseline={baseline}
              errors={errors}
              onChange={change}
            />
          ))}
          {record.values.length === 0 ? (
            <p className="text-small text-graphite-70">No scalar fields on this record.</p>
          ) : null}
        </div>
      </AdminPanel>

      {record.lists.map((list) => (
        <AdminPanel key={list.id} label={list.label} meta={`${list.items.length}`}>
          <div className="flex flex-col gap-6 px-5 py-5">
            {list.items.map((item, index) => (
              <div key={item.id} className="flex gap-4">
                <span className="text-small tabular mt-2 w-6 shrink-0 text-ink-40">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div className="min-w-0 flex-1">
                  <Field
                    value={item}
                    draft={draft}
                    baseline={baseline}
                    errors={errors}
                    onChange={change}
                  />
                </div>
              </div>
            ))}
          </div>
        </AdminPanel>
      ))}

      {record.media ? (
        <AdminPanel label="Media" meta={record.media.path}>
          <div className="flex gap-5 px-5 py-5">
            {/* Unoptimised across the whole project (`images.unoptimized` in
                next.config.ts, for the static export), so the intrinsic size here is
                only an aspect hint for the layout. */}
            <Image
              src={record.media.path}
              alt={record.media.alt.value}
              width={160}
              height={120}
              className="h-24 w-32 shrink-0 rounded-sm border border-ink-12 object-cover"
            />
            <div className="min-w-0 flex-1">
              <Field
                value={record.media.alt}
                draft={draft}
                baseline={baseline}
                errors={errors}
                onChange={change}
              />
              <p className="text-small mt-3 text-ink-40">
                The file itself is not editable here — uploading and replacing media is a later
                phase. Alt text is the part of a media reference that is copy.
              </p>
            </div>
          </div>
        </AdminPanel>
      ) : null}
    </form>
  );
}

interface FieldProps {
  readonly value: CmsValue;
  readonly draft: Record<string, string>;
  readonly baseline: Record<string, string>;
  readonly errors: Record<string, string>;
  readonly onChange: (id: string, next: string) => void;
}

function Field({ value, draft, baseline, errors, onChange }: FieldProps) {
  const current = draft[value.id] ?? value.value;
  return (
    <ValueField
      value={value}
      draft={current}
      error={errors[value.id]}
      isDirty={current !== (baseline[value.id] ?? value.value)}
      onChange={(next) => onChange(value.id, next)}
    />
  );
}

interface SaveBarProps {
  readonly isDirty: boolean;
  readonly count: number;
  readonly editable: number;
  readonly total: number;
  readonly state: SaveState;
}

function message(state: SaveState, isDirty: boolean, count: number): string {
  if (state.kind === "saving") {
    return "Saving…";
  }
  if (state.kind === "failed") {
    return state.message;
  }
  if (isDirty) {
    return `${count} unsaved change${count === 1 ? "" : "s"}.`;
  }
  if (state.kind === "saved") {
    return state.written === 0
      ? "Nothing had changed."
      : `Saved. ${state.written} string${state.written === 1 ? "" : "s"} written to the content files — the dev server reloads and the site shows it.`;
  }
  return "No changes.";
}

/**
 * Sticky, because a record with three lists is taller than a screen and a Save button
 * that scrolls off is a Save button nobody presses.
 */
function SaveBar({ isDirty, count, editable, total, state }: SaveBarProps) {
  const tone = state.kind === "failed" ? "text-accent" : "text-graphite-70";

  return (
    <div className="sticky top-0 z-10 -mx-10 border-b border-hairline bg-canvas px-10 py-3">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="min-w-0">
          <p className={`text-small ${tone}`}>{message(state, isDirty, count)}</p>
          <p className="text-small mt-1 text-ink-40">
            {editable} of {total} fields on this record can be edited. The rest say why not.
          </p>
        </div>
        <button
          type="submit"
          disabled={!isDirty || state.kind === "saving"}
          className="text-small rounded-sm border border-ink-12 bg-ink px-4 py-2 text-canvas transition-colors duration-[180ms] hover:bg-header-ground disabled:cursor-default disabled:border-ink-12 disabled:bg-ink-4 disabled:text-ink-40"
        >
          Save
        </button>
      </div>
    </div>
  );
}
