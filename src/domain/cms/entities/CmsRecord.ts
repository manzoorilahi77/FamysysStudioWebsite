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
 * object — `ctaLabel` to `CtaLabel`, `url` to `Url`, `mediaAlt` and `mediaSrc` to
 * `MediaRef` — so an edit is rejected by the same rule the site itself is built on rather
 * than by a second copy of it written for the admin panel.
 *
 * `mediaSrc` is the FILE a media slot points at, and it is the one kind whose value is not
 * copy. It is a value rather than a control of its own because being a value is what earns
 * it the rails: a draft row, a revision, a preview, a publish, a discard. A bespoke
 * "change the picture" path would have had to grow all five, and would have grown them
 * differently.
 *
 * `seoTitle`/`seoDescription`/`seoCanonical` are the SEO section's three text fields — a
 * page's `<title>`, its meta description, and its canonical path. Each has a rule a plain
 * `text` field does not: a length ceiling for the first two, real-route membership for the
 * third — so they earn their own kinds the same way `ctaLabel` and `url` did, rather than
 * being validated by a special case bolted onto `text`.
 */
export type CmsValueKind =
  | "text"
  | "ctaLabel"
  | "url"
  | "mediaAlt"
  | "mediaSrc"
  | "mediaPoster"
  | "seoTitle"
  | "seoDescription"
  | "seoCanonical";

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
  /**
   * WHERE "EDITED SOMEWHERE ELSE" ACTUALLY IS, as a link rather than as a sentence.
   *
   * A reason that names another screen is only half an answer: the reader still has to find
   * it in the sidebar, and if what they came looking for was a PICTURE rather than a word
   * they may not believe the sentence applies to them at all. That is the exact failure this
   * exists for — a section whose tiles carry photographs, whose panel shows no image field,
   * and whose only clue is a line about where the "engagements" are edited.
   */
  readonly readOnlyHref?: string;
}

/** An image or a video a record carries, flattened from a `MediaRef`. */
export interface CmsMedia {
  readonly id: string;
  readonly label: string;
  /**
   * Site-root path to what the site is CURRENTLY SERVING, so the panel can render the actual
   * file rather than its name. Never the draft — that is `src.draftValue`, and the two are
   * shown together for the same reason every other field shows both.
   */
  readonly path: string;
  readonly kind: "image" | "video";
  /** A video's still, when it has one. */
  readonly poster?: string;
  readonly aspectRatio: string;
  /** The alt text, as an editable value — the one part of a media reference that is copy. */
  readonly alt: CmsValue;
  /**
   * The file, as an editable value. Absent where the slot's file cannot be changed at all.
   *
   * It carries no `pointer`, and that is deliberate rather than an omission: a pointer says
   * where a string lives in the TYPESCRIPT modules, and a media path does not live there in
   * any form a write could use — those files hold a bare stem and build `/media/${stem}.jpg`
   * around it inside a helper, with the extension and the kind baked in. So the file-backed
   * store accepts the draft and refuses the publish with the message it already uses for
   * everything it cannot write, and the database store, where the path is a row like any
   * other, publishes it.
   */
  readonly src?: CmsValue;
  /**
   * A VIDEO'S STILL, as an editable value — and the reason a slot can hold a video at all.
   *
   * `MediaRef` refuses to build a video reference without a poster, and it is right to: a
   * video with no still is a black rectangle for as long as the first frame takes to arrive,
   * in a slot the design fills with a photograph. So the poster is not optional decoration
   * that can be added later; it is part of what makes the file valid, and the two are
   * written together or not at all.
   *
   * Empty while the slot holds an image, because an image needs no still and a required
   * field nobody can fill is a form that cannot be saved.
   */
  readonly posterValue?: CmsValue;
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
    // After the alt text, never before it. `recordValues` is the order the seed walks a
    // record in, and the ids it allocates become `field_key`s that drafts and approval
    // flags hang off. A new kind goes on the end so nothing already stored is renamed.
    ...group.media.flatMap((media) => (media.src ? [media.src] : [])),
    ...group.media.flatMap((media) => (media.posterValue ? [media.posterValue] : [])),
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
