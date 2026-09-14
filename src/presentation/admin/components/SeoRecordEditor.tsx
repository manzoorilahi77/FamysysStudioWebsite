"use client";

import type { CmsRecord } from "../../../domain/cms/entities/CmsRecord";
import { fieldPath, useSectionEditor } from "../lib/useSectionEditor";
import { MediaField } from "./MediaField";

/**
 * ONE PAGE'S TITLE, DESCRIPTION, CANONICAL URL AND OPEN GRAPH IMAGE — on `useSectionEditor`,
 * the exact hook every other section editor uses, so Save/Publish/Discard, dirty-tracking
 * and the navigation guard are the same behaviour as everywhere else in the panel. What is
 * bespoke here is only the FIELDS: a live character count against the real limit, rather
 * than the generic labelled box `ValueField` draws for an ordinary string.
 *
 * VALIDATION IS TWO LAYERS, ON PURPOSE. The counters below turn red past the limit as you
 * type — that is advice, and it is instant. `ValidateContentValue`'s `seoTitle`/
 * `seoDescription`/`seoCanonical` cases enforce the same limits server-side at Save, which
 * is what actually stops an over-length string from being written; a devtools console could
 * bypass the counter, and could not bypass that.
 */

const TITLE_MAX = 60;
const DESCRIPTION_MAX = 160;

const BUTTON =
  "text-small inline-flex min-h-11 items-center justify-center rounded-sm px-4 py-2 transition-colors duration-[180ms] disabled:cursor-default";
const PRIMARY = `${BUTTON} bg-ink text-canvas disabled:bg-ink-40`;
const SECONDARY = `${BUTTON} border border-ink-12 text-ink hover:bg-ink-4 disabled:text-ink-40`;
const QUIET =
  "text-small inline-flex min-h-11 items-center px-2 py-2 text-graphite-70 transition-colors duration-[180ms] hover:text-accent disabled:text-ink-40";

const CONTROL =
  "text-base min-h-11 w-full rounded-sm border border-ink-12 bg-card px-3 py-2 text-ink outline-none transition-colors duration-[180ms] focus:border-accent";

function Counter({ length, max }: { readonly length: number; readonly max: number }) {
  const over = length > max;
  return (
    <span className={`text-small tabular ${over ? "text-accent" : "text-ink-40"}`}>
      {length} / {max}
      {over ? " — over the limit" : ""}
    </span>
  );
}

export function SeoRecordEditor({
  pageId,
  route,
  record,
}: {
  readonly pageId: string;
  readonly route: string;
  readonly record: CmsRecord;
}) {
  const target = { pageId, sectionId: record.id };
  const editor = useSectionEditor(record, target);
  const group = record.groups[0];

  const titleValue = group?.values.find((value) => value.kind === "seoTitle");
  const descriptionValue = group?.values.find((value) => value.kind === "seoDescription");
  const canonicalValue = group?.values.find((value) => value.kind === "seoCanonical");
  const mediaEntry = group?.media[0];

  if (!titleValue || !descriptionValue || !canonicalValue) {
    return (
      <p className="text-small px-5 py-6 text-graphite-70">
        This page&apos;s SEO section is missing a field it should have. Reload the panel.
      </p>
    );
  }

  const titlePath = fieldPath(record.id, titleValue.id);
  const descriptionPath = fieldPath(record.id, descriptionValue.id);
  const canonicalPath = fieldPath(record.id, canonicalValue.id);

  const titleDraft = editor.valueOf(titlePath);
  const descriptionDraft = editor.valueOf(descriptionPath);
  const canonicalDraft = editor.valueOf(canonicalPath);

  const busy = editor.status.kind === "busy";
  const saving = editor.status.kind === "busy" && editor.status.message === "Saving…";
  const hasDrafts = record.status === "draft";
  const publishBlocked = editor.isDirty;

  return (
    <div>
      <div className="flex flex-col gap-6 px-5 py-6">
        <div>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <label htmlFor={`seo-${pageId}-title`} className="label text-ink-60">
              Title
            </label>
            <Counter length={titleDraft.length} max={TITLE_MAX} />
          </div>
          <input
            id={`seo-${pageId}-title`}
            type="text"
            className={`${CONTROL} mt-2`}
            value={titleDraft}
            onChange={(event) => editor.set(titlePath, event.target.value)}
            aria-invalid={editor.errorOf(titlePath) ? true : undefined}
          />
          {editor.errorOf(titlePath) ? (
            <p role="alert" className="text-small mt-2 text-accent">
              {editor.errorOf(titlePath)}
            </p>
          ) : null}
        </div>

        <div>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <label htmlFor={`seo-${pageId}-description`} className="label text-ink-60">
              Meta description
            </label>
            <Counter length={descriptionDraft.length} max={DESCRIPTION_MAX} />
          </div>
          <textarea
            id={`seo-${pageId}-description`}
            rows={3}
            className={`${CONTROL} mt-2`}
            value={descriptionDraft}
            onChange={(event) => editor.set(descriptionPath, event.target.value)}
            aria-invalid={editor.errorOf(descriptionPath) ? true : undefined}
          />
          {editor.errorOf(descriptionPath) ? (
            <p role="alert" className="text-small mt-2 text-accent">
              {editor.errorOf(descriptionPath)}
            </p>
          ) : null}
        </div>

        <div>
          <label htmlFor={`seo-${pageId}-canonical`} className="label text-ink-60">
            Canonical URL
          </label>
          <input
            id={`seo-${pageId}-canonical`}
            type="text"
            className={`${CONTROL} mt-2`}
            value={canonicalDraft}
            onChange={(event) => editor.set(canonicalPath, event.target.value)}
            aria-invalid={editor.errorOf(canonicalPath) ? true : undefined}
          />
          {editor.errorOf(canonicalPath) ? (
            <p role="alert" className="text-small mt-2 text-accent">
              {editor.errorOf(canonicalPath)}
            </p>
          ) : canonicalDraft !== route ? (
            <p className="text-small mt-2 text-graphite-70">
              This page&apos;s real address is <span className="text-ink">{route}</span>. A
              canonical URL pointing anywhere else can remove this page from search results —
              change it only if you mean to.
            </p>
          ) : null}
        </div>

        {mediaEntry ? (
          <div>
            <p className="label mb-2 text-ink-60">Open Graph image</p>
            <MediaField
              media={mediaEntry}
              altDraft={editor.valueOf(fieldPath(record.id, mediaEntry.alt.id))}
              altError={editor.errorOf(fieldPath(record.id, mediaEntry.alt.id))}
              isAltChanged={editor.isChanged(fieldPath(record.id, mediaEntry.alt.id))}
              onAltChange={(next) => editor.set(fieldPath(record.id, mediaEntry.alt.id), next)}
              srcDraft={
                mediaEntry.src
                  ? editor.valueOf(fieldPath(record.id, mediaEntry.src.id))
                  : mediaEntry.path
              }
              srcError={
                mediaEntry.src ? editor.errorOf(fieldPath(record.id, mediaEntry.src.id)) : undefined
              }
              isSrcChanged={
                mediaEntry.src ? editor.isChanged(fieldPath(record.id, mediaEntry.src.id)) : false
              }
              onSrcChange={(next) => {
                if (mediaEntry.src) editor.set(fieldPath(record.id, mediaEntry.src.id), next);
              }}
              posterDraft={
                mediaEntry.posterValue
                  ? editor.valueOf(fieldPath(record.id, mediaEntry.posterValue.id))
                  : (mediaEntry.poster ?? "")
              }
              posterError={
                mediaEntry.posterValue
                  ? editor.errorOf(fieldPath(record.id, mediaEntry.posterValue.id))
                  : undefined
              }
              onPosterChange={(next) => {
                if (mediaEntry.posterValue) {
                  editor.set(fieldPath(record.id, mediaEntry.posterValue.id), next);
                }
              }}
            />
          </div>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center gap-3 border-t border-hairline px-5 py-4">
        <button
          type="button"
          onClick={() => void editor.save()}
          disabled={busy || !editor.isDirty}
          className={PRIMARY}
        >
          {saving ? "Saving…" : "Save draft"}
        </button>
        <button
          type="button"
          onClick={() => void editor.publish()}
          disabled={busy || !hasDrafts || publishBlocked}
          className={SECONDARY}
        >
          Publish
        </button>
        {hasDrafts ? (
          <button type="button" onClick={() => void editor.discard()} disabled={busy} className={QUIET}>
            Discard drafts
          </button>
        ) : null}
        <p className="text-small ml-auto text-ink-40">
          {editor.isDirty
            ? `${editor.changedCount} unsaved ${editor.changedCount === 1 ? "change" : "changes"}`
            : hasDrafts
              ? "Saved, not published"
              : "Everything here is live"}
        </p>
      </div>

      <p role="status" aria-live="polite" className="text-small px-5 pb-4 text-graphite-70">
        {editor.status.kind === "idle" ? " " : editor.status.message}
      </p>
    </div>
  );
}
