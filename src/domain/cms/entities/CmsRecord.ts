import type { ContentAddress } from "./ContentAddress";
import type { ContentPointer } from "./ContentPointer";

/**
 * ONE EDITABLE THING: a page section, or one of the repeated cards inside a section.
 *
 * `CmsStatus` is the publish state and there are exactly two of it. PUBLISHED means every
 * string on the record is what the public site is serving. DRAFT means at least one has
 * been saved and not published — the site is unchanged, and somebody has work in progress.
 * It is deliberately not a property of a value: an editor thinks in blocks, and the
 * sidebar has to be able to say "this section has unpublished edits" at a glance.
 */
export type CmsStatus = "published" | "draft";

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
  /** What the public site is serving. Never the draft — see `draftValue`. */
  readonly value: string;
  readonly kind: CmsValueKind;
  /**
   * Whether the field is a paragraph rather than a line. Declared by the mapping rather
   * than guessed from the current length, so a body that happens to be short still gets a
   * box that grows, and a heading that happens to be long does not.
   */
  readonly multiline: boolean;
  readonly approval: CmsApproval;
  /** Absent means read-only; `readOnlyReason` then says why. */
  readonly pointer?: ContentPointer;
  readonly readOnlyReason?: string;
  /**
   * The saved-but-unpublished value, when there is one. The editor shows this in the box
   * and the published value beside it, so "what I changed it to" and "what the site says"
   * are never the same field.
   */
  readonly draftValue?: string;
  /**
   * Every OTHER place in the CMS the identical string appears, as "Page › Section ·
   * Field". Derived by indexing the whole read model, so it answers "what am I about to
   * change" without anyone maintaining a list.
   */
  readonly usedElsewhere: ReadonlyArray<string>;
  /**
   * The stored row's revision, when the content comes from the database. A save sends it
   * back and the write is conditional on it, so two people editing the same record do not
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
  /** Set when the whole list is assembled elsewhere and shown here for reference only. */
  readonly readOnlyReason?: string;
}

/** An image or a video a record carries, flattened from a `MediaRef`. */
export interface CmsMedia {
  readonly id: string;
  readonly label: string;
  /** Site-root path, so the panel can render the actual file rather than its name. */
  readonly path: string;
  readonly kind: "image" | "video";
  /** A video's still, when it has one. */
  readonly poster?: string;
  readonly aspectRatio: string;
  /** The alt text, as an editable value — the one part of a media reference that is copy. */
  readonly alt: CmsValue;
}

/**
 * FIELDS, GROUPED THE WAY THE PAGE READS.
 *
 * Not the way they are stored: the hero's headline, sub-head, two buttons and supporting
 * line come from four properties of two different objects, and an editor opening the hero
 * wants them in the order a visitor meets them. The group is what carries that order, and
 * it is why a section is a list of groups rather than a bag of fields.
 */
export interface CmsFieldGroup {
  readonly id: string;
  readonly label: string;
  /** One line under the group heading, when the grouping needs explaining. */
  readonly description?: string;
  readonly values: ReadonlyArray<CmsValue>;
  readonly lists: ReadonlyArray<CmsList>;
  readonly media: ReadonlyArray<CmsMedia>;
}

/**
 * THE REPEATED CARDS INSIDE A SECTION — the six capabilities, the five stages, the four
 * engagements, the eight pieces, the FAQ's questions.
 *
 * These used to be collection SCREENS of their own, listed in the sidebar beside the
 * pages. That was the drift: none of them is a page, and an editor looking for the wording
 * of a capability had no reason to expect it two screens away from the page it renders on.
 * They are the same records — the same slugs, the same rows — shown inside the section that
 * renders them.
 *
 * `collectionId` is still the store's own name for the set, because that is what a create
 * or a delete addresses. `addNoun` is what the button says: "Add a question" reads as an
 * instruction, "Add record" reads as a database.
 */
export interface CmsItemGroup {
  readonly id: string;
  readonly label: string;
  readonly collectionId: string;
  readonly addNoun: string;
  /**
   * Whether an editor may add a card here or remove one. False for a run the store cannot
   * grow, and false for a run of exactly one — the Custom Creative Partnership is a row in
   * the engagement tiers table and a block of its own on the page, and "Add an engagement"
   * on that block would add it to the wrong run.
   */
  readonly canChange?: boolean;
  readonly description?: string;
  readonly records: ReadonlyArray<CmsRecord>;
}

export interface CmsRecord {
  /** Unique within its parent. The content's own slug where it has one. */
  readonly id: string;
  readonly title: string;
  /** The secondary line under the title in a list row. */
  readonly summary: string;
  readonly status: CmsStatus;
  /**
   * When this record's content last changed. From the stored row where there is one, and
   * otherwise the mtime of the content file the record is read from — the TypeScript
   * modules carry no per-record timestamp, so every record in a file shares it.
   */
  readonly updatedAt: Date | null;
  /**
   * Where a write to this record goes. Absent only for a block the page renders that the
   * panel has nothing editable for, which is what a newly added section looks like before
   * anyone maps it.
   */
  readonly address?: ContentAddress;
  readonly groups: ReadonlyArray<CmsFieldGroup>;
  readonly items: ReadonlyArray<CmsItemGroup>;
  /** Shown in place of fields when there are none, and says why there are none. */
  readonly note?: string;
}

/** Whether an editor may add a card to this run or remove one. Absent means yes. */
export function canChangeItems(group: CmsItemGroup): boolean {
  return group.canChange !== false;
}

/** Every value this record owns, lists and media alt text included. Not nested cards. */
export function recordValues(record: CmsRecord): ReadonlyArray<CmsValue> {
  return record.groups.flatMap((group) => [
    ...group.values,
    ...group.lists.flatMap((list) => list.items),
    ...group.media.map((media) => media.alt),
  ]);
}

/** The record and every card nested under it, depth first, in the order they render. */
export function recordTree(record: CmsRecord): ReadonlyArray<CmsRecord> {
  return [
    record,
    ...record.items.flatMap((group) => group.records.flatMap((nested) => recordTree(nested))),
  ];
}

/** True when this record, or anything nested in it, has been saved and not published. */
export function hasUnpublishedEdits(record: CmsRecord): boolean {
  return recordTree(record).some((entry) =>
    recordValues(entry).some((value) => value.draftValue !== undefined),
  );
}

/** What the editor puts in the box: the draft where there is one, the live value otherwise. */
export function currentValue(value: CmsValue): string {
  return value.draftValue ?? value.value;
}
