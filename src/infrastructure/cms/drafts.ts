import type { CmsPage } from "../../domain/cms/entities/CmsPage";
import { hasUnpublishedEdits } from "../../domain/cms/entities/CmsRecord";
import type { CmsRecord, CmsValue } from "../../domain/cms/entities/CmsRecord";
import { addressKey } from "../../domain/cms/entities/ContentAddress";

/**
 * LAYING THE UNPUBLISHED EDITS OVER THE PUBLISHED MODEL.
 *
 * The read model is built from the site's own repositories, so it always holds what the
 * public site is serving. That is the point of it, and it must stay true: a panel that
 * showed drafts as though they were live would have nothing left to distinguish "saved"
 * from "published".
 *
 * So drafts are a layer on top. A value keeps its published `value` and gains a
 * `draftValue`; the record it sits on turns from PUBLISHED to DRAFT, and so does every
 * ancestor of it — a capability with an unpublished edit makes the section it renders in
 * show as drafted, which is what the sidebar needs in order to say at a glance where the
 * unfinished work is.
 *
 * Both stores use this. The database keys its drafts by row; the TypeScript files keep
 * theirs in a sidecar. Neither difference reaches this far.
 */

/** field address ("page_section:home:hero:heading") to the saved, unpublished string. */
export type DraftIndex = ReadonlyMap<string, string>;

/** field address to the stored row's revision, for the stores that have one. */
export type VersionIndex = ReadonlyMap<string, number>;

function stamp(
  value: CmsValue,
  prefix: string,
  drafts: DraftIndex,
  versions: VersionIndex,
): CmsValue {
  const key = `${prefix}:${value.id}`;
  const draft = drafts.get(key);
  const version = versions.get(key);
  if (draft === undefined && version === undefined) return value;
  return {
    ...value,
    ...(draft === undefined ? {} : { draftValue: draft }),
    ...(version === undefined ? {} : { version }),
  };
}

function applyToRecord(record: CmsRecord, drafts: DraftIndex, versions: VersionIndex): CmsRecord {
  const prefix = record.address ? addressKey(record.address) : null;

  const groups = prefix
    ? record.groups.map((group) => ({
        ...group,
        values: group.values.map((value) => stamp(value, prefix, drafts, versions)),
        lists: group.lists.map((list) => ({
          ...list,
          items: list.items.map((item) => stamp(item, prefix, drafts, versions)),
        })),
        media: group.media.map((entry) => ({
          ...entry,
          alt: stamp(entry.alt, prefix, drafts, versions),
        })),
      }))
    : record.groups;

  const items = record.items.map((group) => ({
    ...group,
    records: group.records.map((nested) => applyToRecord(nested, drafts, versions)),
  }));

  const withLayer: CmsRecord = { ...record, groups, items };
  return { ...withLayer, status: hasUnpublishedEdits(withLayer) ? "draft" : "published" };
}

export function withDrafts(
  pages: ReadonlyArray<CmsPage>,
  drafts: DraftIndex,
  versions: VersionIndex = new Map(),
): ReadonlyArray<CmsPage> {
  if (drafts.size === 0 && versions.size === 0) return pages;
  return pages.map((page) => ({
    ...page,
    sections: page.sections.map((section) => applyToRecord(section, drafts, versions)),
  }));
}
