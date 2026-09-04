import type { ContentPointer } from "./ContentPointer";

/**
 * One editable thing in the CMS — a case study, a capability, a process step, a page
 * section. Every record on the site is currently DRAFT: nothing in
 * `infrastructure/content/static/` has been through an approval step, and the CMS has no
 * publish action to move it on. `CmsStatus` is a union rather than a boolean so the
 * states that come with persistence have somewhere to go.
 */
export type CmsStatus = "draft";

/**
 * WHOSE WORDS THESE ARE.
 *
 * `client` — the string appears verbatim in one of the three modules that hold the
 * client's own briefs (marketing, portfolio, services). Editing it is editing approved
 * copy, and the interface says so before you do.
 *
 * `drafted` — written to fill a page, pending the client's approval, and listed in
 * docs/content-todo.md.
 *
 * The rule is DERIVED rather than declared, and it is the same rule
 * scripts/generate-content-todo.mjs uses to build that document — so the mark in the CMS
 * and the review list in the docs can never disagree.
 */
export type CmsApproval = "client" | "drafted";

/**
 * What a value has to satisfy before it can be written. Each maps to a domain value
 * object — `ctaLabel` to `CtaLabel`, `url` to `Url`, `mediaAlt` to `MediaRef` — so an
 * edit is rejected by the same rule the site itself is built on rather than by a second
 * copy of it written for the admin panel.
 */
export type CmsValueKind = "text" | "ctaLabel" | "url" | "mediaAlt";

/** One string an editor can see, and — when it has a pointer — change. */
export interface CmsValue {
  /** Unique within its record. Stable across reads, because saves address it by id. */
  readonly id: string;
  readonly label: string;
  readonly value: string;
  readonly kind: CmsValueKind;
  readonly approval: CmsApproval;
  /** Absent means read-only; `readOnlyReason` then says why. */
  readonly pointer?: ContentPointer;
  readonly readOnlyReason?: string;
  /**
   * Every OTHER place in the CMS the identical string appears, as "Page › Section ·
   * Field". Derived by indexing the whole read model, so it answers "what am I about to
   * change" without anyone maintaining a list.
   */
  readonly usedElsewhere: ReadonlyArray<string>;
  /**
   * The stored row’s revision, when the content comes from the database. A save sends it
   * back and the UPDATE is conditional on it, so two people editing the same record do not
   * silently overwrite each other. Absent when the content is read from the TypeScript
   * files, which have no per-string revision to read.
   */
  readonly version?: number;
}

/** A named list on a record. Deliverables, "What we need", "Ideal for". */
export interface CmsList {
  readonly id: string;
  readonly label: string;
  readonly items: ReadonlyArray<CmsValue>;
}

/** An image or video a record carries, flattened from a `MediaRef`. */
export interface CmsMediaSummary {
  readonly path: string;
  /** The alt text, as an editable value — the one part of a media reference that is copy. */
  readonly alt: CmsValue;
}

export interface CmsRecord {
  /** Unique within its collection. The content's own slug where it has one. */
  readonly id: string;
  readonly title: string;
  /** The secondary line under the title in a list row. */
  readonly summary: string;
  readonly status: CmsStatus;
  /**
   * When the content file this record is read from last changed on disk, or `null` when
   * that cannot be determined. There are no per-record timestamps to read — the content
   * is TypeScript, not rows — so every record in a collection shares its file's mtime.
   */
  readonly updatedAt: Date | null;
  readonly values: ReadonlyArray<CmsValue>;
  readonly lists: ReadonlyArray<CmsList>;
  readonly media?: CmsMediaSummary;
}

/** Every value on a record, lists and media alt included, in one flat sequence. */
export function recordValues(record: CmsRecord): ReadonlyArray<CmsValue> {
  return [
    ...record.values,
    ...record.lists.flatMap((list) => list.items),
    ...(record.media ? [record.media.alt] : []),
  ];
}
