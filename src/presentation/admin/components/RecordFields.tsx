"use client";

import { useState } from "react";
import { canChangeItems, hasUnpublishedEdits } from "../../../domain/cms/entities/CmsRecord";
import type { CmsFieldGroup, CmsRecord } from "../../../domain/cms/entities/CmsRecord";
import { fieldPath } from "../lib/useSectionEditor";
import type { useSectionEditor } from "../lib/useSectionEditor";
import { MediaField } from "./MediaField";
import { ValueField } from "./ValueField";

/**
 * A RECORD'S FIELDS, IN THE ORDER THE PAGE READS THEM.
 *
 * Groups first — headings, then buttons, then whatever the block carries — with the lists
 * and the pictures inside the group they belong to rather than pushed to the bottom of the
 * form. Then the runs of cards, each one collapsed to its title until it is opened, because
 * a section with eight portfolio pieces on it is otherwise a page nobody can scan.
 *
 * The same component draws a card's own fields, so a capability inside a section looks like
 * a section: one shape to learn.
 */

type Editor = ReturnType<typeof useSectionEditor>;

function Group({
  recordId,
  group,
  editor,
}: {
  readonly recordId: string;
  readonly group: CmsFieldGroup;
  readonly editor: Editor;
}) {
  const field = (valueId: string) => fieldPath(recordId, valueId);

  return (
    <section className="border-t border-hairline pt-6">
      <h3 className="label text-ink">{group.label}</h3>
      {group.description ? (
        <p className="text-small mt-2 max-w-[70ch] text-graphite-70">{group.description}</p>
      ) : null}

      <div className="mt-5 flex flex-col gap-6">
        {group.values.map((value) => (
          <ValueField
            key={value.id}
            value={value}
            draft={editor.valueOf(field(value.id))}
            error={editor.errorOf(field(value.id))}
            isChanged={editor.isChanged(field(value.id))}
            onChange={(next) => editor.set(field(value.id), next)}
          />
        ))}

        {group.lists.map((list) => (
          <fieldset key={list.id} className="m-0 border-0 p-0">
            <legend className="label text-ink-60">{list.label}</legend>
            {list.readOnlyReason ? (
              <p className="text-small mt-2 max-w-[70ch] text-graphite-70">{list.readOnlyReason}</p>
            ) : null}
            {list.items.length === 0 ? (
              <p className="text-small mt-3 text-graphite-70">This list is empty.</p>
            ) : (
              <ol className="mt-3 flex flex-col gap-5">
                {list.items.map((item) => (
                  <li key={item.id}>
                    <ValueField
                      value={item}
                      draft={editor.valueOf(field(item.id))}
                      error={editor.errorOf(field(item.id))}
                      isChanged={editor.isChanged(field(item.id))}
                      onChange={(next) => editor.set(field(item.id), next)}
                    />
                  </li>
                ))}
              </ol>
            )}
          </fieldset>
        ))}

        {group.media.map((entry) => (
          <MediaField
            key={entry.id}
            media={entry}
            draft={editor.valueOf(field(entry.alt.id))}
            error={editor.errorOf(field(entry.alt.id))}
            isChanged={editor.isChanged(field(entry.alt.id))}
            onChange={(next) => editor.set(field(entry.alt.id), next)}
          />
        ))}
      </div>
    </section>
  );
}

function Card({
  record,
  editor,
  onRemove,
}: {
  readonly record: CmsRecord;
  readonly editor: Editor;
  readonly onRemove: (() => void) | null;
}) {
  const [open, setOpen] = useState(false);
  const panelId = `card-${record.id}`;
  const drafted = hasUnpublishedEdits(record);

  return (
    <li className="rounded-sm border border-ink-12 bg-card">
      <div className="flex items-center gap-4 px-4 py-3">
        <button
          type="button"
          onClick={() => setOpen((current) => !current)}
          aria-expanded={open}
          aria-controls={panelId}
          className="min-w-0 flex-1 text-left"
        >
          <span className="text-small flex items-center gap-2 text-ink">
            <span aria-hidden="true" className="text-ink-40">
              {open ? "−" : "+"}
            </span>
            {record.title}
            {drafted ? (
              <span className="label rounded-sm border border-accent px-2 py-0.5 text-accent">
                Unpublished
              </span>
            ) : null}
          </span>
          <span className="text-small mt-1 block truncate text-graphite-70">{record.summary}</span>
        </button>

        {onRemove ? (
          <button
            type="button"
            onClick={onRemove}
            className="text-small shrink-0 text-graphite-70 transition-colors duration-[180ms] hover:text-accent"
          >
            Remove
          </button>
        ) : null}
      </div>

      <div id={panelId} hidden={!open} className="px-4 pb-6">
        <RecordFields record={record} editor={editor} />
      </div>
    </li>
  );
}

export function RecordFields({
  record,
  editor,
  onAdd,
  onRemove,
}: {
  readonly record: CmsRecord;
  readonly editor: Editor;
  readonly onAdd?: (collectionId: string, noun: string) => void;
  readonly onRemove?: (collectionId: string, target: CmsRecord) => void;
}) {
  return (
    <div className="flex flex-col gap-8">
      {record.groups.map((group) => (
        <Group key={group.id} recordId={record.id} group={group} editor={editor} />
      ))}

      {record.items.map((group) => (
        <section key={group.id} className="border-t border-hairline pt-6">
          <div className="flex flex-wrap items-baseline justify-between gap-4">
            <h3 className="label text-ink">
              {group.label} <span className="text-ink-40">({group.records.length})</span>
            </h3>
            {onAdd && canChangeItems(group) ? (
              <button
                type="button"
                onClick={() => onAdd(group.collectionId, group.addNoun)}
                className="text-small text-graphite-70 transition-colors duration-[180ms] hover:text-ink"
              >
                Add {group.addNoun}
              </button>
            ) : null}
          </div>
          {group.description ? (
            <p className="text-small mt-2 max-w-[70ch] text-graphite-70">{group.description}</p>
          ) : null}

          {group.records.length === 0 ? (
            <p className="text-small mt-4 text-graphite-70">
              Nothing here yet. This block renders nothing until something is added to it.
            </p>
          ) : (
            <ul className="mt-4 flex flex-col gap-3">
              {group.records.map((nested) => (
                <Card
                  key={nested.id}
                  record={nested}
                  editor={editor}
                  onRemove={
                    onRemove && canChangeItems(group)
                      ? () => onRemove(group.collectionId, nested)
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
