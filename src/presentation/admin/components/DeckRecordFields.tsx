"use client";

import { useState } from "react";
import { canChangeItems, hasUnpublishedEdits } from "../../../domain/cms/entities/CmsRecord";
import type { CmsFieldGroup, CmsRecord } from "../../../domain/cms/entities/CmsRecord";
import { fieldPath } from "../lib/useDeckSlideEditor";
import type { useDeckSlideEditor } from "../lib/useDeckSlideEditor";
import { MediaField } from "./MediaField";
import { ValueField } from "./ValueField";

type Editor = ReturnType<typeof useDeckSlideEditor>;

// `Group` is byte-for-byte the same rendering as RecordFields.tsx's own `Group` — copy it
// unchanged rather than importing it, since RecordFields.tsx does not export it.
function Group({ recordId, group, editor }: { readonly recordId: string; readonly group: CmsFieldGroup; readonly editor: Editor }) {
  const field = (valueId: string) => fieldPath(recordId, valueId);
  return (
    <section className="border-t border-hairline pt-6">
      <h3 className="label text-ink">{group.label}</h3>
      {group.description ? <p className="text-small mt-2 max-w-[70ch] text-graphite-70">{group.description}</p> : null}
      <div className="mt-5 flex flex-col gap-6">
        {group.values.map((value) => (
          <ValueField key={value.id} value={value} draft={editor.valueOf(field(value.id))} error={editor.errorOf(field(value.id))} isChanged={editor.isChanged(field(value.id))} onChange={(next) => editor.set(field(value.id), next)} />
        ))}
        {group.lists.map((list) => (
          <fieldset key={list.id} className="m-0 border-0 p-0">
            <legend className="label text-ink-60">{list.label}</legend>
            {list.items.length === 0 ? (
              <p className="text-small mt-3 text-graphite-70">This list is empty.</p>
            ) : (
              <ol className="mt-3 flex flex-col gap-5">
                {list.items.map((item) => (
                  <li key={item.id}>
                    <ValueField value={item} draft={editor.valueOf(field(item.id))} error={editor.errorOf(field(item.id))} isChanged={editor.isChanged(field(item.id))} onChange={(next) => editor.set(field(item.id), next)} />
                  </li>
                ))}
              </ol>
            )}
          </fieldset>
        ))}
        {group.media.map((entry) => {
          const src = entry.src?.id;
          const poster = entry.posterValue?.id;
          return (
            <MediaField key={entry.id} media={entry}
              altDraft={editor.valueOf(field(entry.alt.id))} altError={editor.errorOf(field(entry.alt.id))} isAltChanged={editor.isChanged(field(entry.alt.id))} onAltChange={(next) => editor.set(field(entry.alt.id), next)}
              srcDraft={src ? editor.valueOf(field(src)) : entry.path} srcError={src ? editor.errorOf(field(src)) : undefined} isSrcChanged={src ? editor.isChanged(field(src)) : false} onSrcChange={(next) => { if (src) editor.set(field(src), next); }}
              posterDraft={poster ? editor.valueOf(field(poster)) : (entry.poster ?? "")} posterError={poster ? editor.errorOf(field(poster)) : undefined} onPosterChange={(next) => { if (poster) editor.set(field(poster), next); }}
            />
          );
        })}
      </div>
    </section>
  );
}

function Card({
  record, editor, onRemove, onMoveUp, onMoveDown,
}: {
  readonly record: CmsRecord; readonly editor: Editor;
  readonly onRemove: (() => void) | null;
  readonly onMoveUp: (() => void) | null;
  readonly onMoveDown: (() => void) | null;
}) {
  const [open, setOpen] = useState(false);
  const panelId = `card-${record.id}`;
  const drafted = hasUnpublishedEdits(record);

  return (
    <li className="rounded-sm border border-ink-12 bg-card">
      <div className="flex items-center gap-2 px-4 py-3">
        <button type="button" onClick={() => setOpen((c) => !c)} aria-expanded={open} aria-controls={panelId} className="min-w-0 flex-1 text-left">
          <span className="text-small flex items-center gap-2 text-ink">
            <span aria-hidden="true" className="text-ink-40">{open ? "−" : "+"}</span>
            {record.title}
            {drafted ? <span className="label rounded-sm border border-accent px-2 py-0.5 text-accent">Unpublished</span> : null}
          </span>
          <span className="text-small mt-1 block truncate text-graphite-70">{record.summary}</span>
        </button>

        {onMoveUp ? (
          <button type="button" onClick={onMoveUp} aria-label={`Move ${record.title} earlier`} className="text-small shrink-0 px-1 text-graphite-70 hover:text-ink">↑</button>
        ) : null}
        {onMoveDown ? (
          <button type="button" onClick={onMoveDown} aria-label={`Move ${record.title} later`} className="text-small shrink-0 px-1 text-graphite-70 hover:text-ink">↓</button>
        ) : null}
        {onRemove ? (
          <button type="button" onClick={onRemove} className="text-small shrink-0 text-graphite-70 transition-colors duration-[180ms] hover:text-accent">Remove</button>
        ) : null}
      </div>
      <div id={panelId} hidden={!open} className="px-4 pb-6">
        <DeckRecordFields record={record} editor={editor} />
      </div>
    </li>
  );
}

export function DeckRecordFields({
  record, editor, onAdd, onRemove, onReorder,
}: {
  readonly record: CmsRecord; readonly editor: Editor;
  readonly onAdd?: (collectionId: string, noun: string) => void;
  readonly onRemove?: (collectionId: string, target: CmsRecord) => void;
  /** Present only for a group whose order the panel may change — every open item group. */
  readonly onReorder?: (collectionId: string, orderedIds: ReadonlyArray<string>) => void;
}) {
  return (
    <div className="flex flex-col gap-8">
      {record.groups.map((group) => <Group key={group.id} recordId={record.id} group={group} editor={editor} />)}

      {record.items.map((group) => (
        <section key={group.id} className="border-t border-hairline pt-6">
          <div className="flex flex-wrap items-baseline justify-between gap-4">
            <h3 className="label text-ink">{group.label} <span className="text-ink-40">({group.records.length})</span></h3>
            {onAdd && canChangeItems(group) ? (
              <button type="button" onClick={() => onAdd(group.collectionId, group.addNoun)} className="text-small text-graphite-70 transition-colors duration-[180ms] hover:text-ink">
                Add {group.addNoun}
              </button>
            ) : null}
          </div>
          {group.description ? <p className="text-small mt-2 max-w-[70ch] text-graphite-70">{group.description}</p> : null}

          {group.records.length === 0 ? (
            <p className="text-small mt-4 text-graphite-70">Nothing here yet. This block renders nothing until something is added to it.</p>
          ) : (
            <ul className="mt-4 flex flex-col gap-3">
              {group.records.map((nested, index) => (
                <Card
                  key={nested.id}
                  record={nested}
                  editor={editor}
                  onRemove={onRemove && canChangeItems(group) ? () => onRemove(group.collectionId, nested) : null}
                  onMoveUp={
                    onReorder && canChangeItems(group) && index > 0
                      ? () => {
                          const ids = group.records.map((r) => r.id);
                          [ids[index - 1], ids[index]] = [ids[index]!, ids[index - 1]!];
                          onReorder(group.collectionId, ids);
                        }
                      : null
                  }
                  onMoveDown={
                    onReorder && canChangeItems(group) && index < group.records.length - 1
                      ? () => {
                          const ids = group.records.map((r) => r.id);
                          [ids[index], ids[index + 1]] = [ids[index + 1]!, ids[index]!];
                          onReorder(group.collectionId, ids);
                        }
                      : null
                  }
                />
              ))}
            </ul>
          )}
        </section>
      ))}
    </div>
  );
}
