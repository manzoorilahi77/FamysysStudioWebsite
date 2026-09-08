import { isOpenCollection, recordNoun } from "../../domain/cms/entities/CmsCollection";
import type { ContentAddress } from "../../domain/cms/entities/ContentAddress";
import type {
  CmsFieldGroup,
  CmsItemGroup,
  CmsList,
  CmsMedia,
  CmsRecord,
  CmsValue,
  CmsValueKind,
} from "../../domain/cms/entities/CmsRecord";
import type { ContentPointer } from "../../domain/cms/entities/ContentPointer";
import type { Cta } from "../../domain/shared/value-objects/Cta";
import type { MediaRef } from "../../domain/shared/value-objects/MediaRef";

/**
 * The builders every mapping in this folder goes through. They exist so that "what a
 * section looks like in the panel" is decided once: an id, a title, the line under it, and
 * then GROUPS of fields in the order a reader meets them on the page.
 *
 * WHY GROUPS AND NOT A FLAT LIST. The hero's headline, sub-head, two buttons and supporting
 * line arrive from four properties of two objects, and the order they are stored in is not
 * the order they are read in. A group is where the page's own order is stated.
 *
 * THREE PROPERTIES ARE LEFT BLANK HERE ON PURPOSE. `approval`, `usedElsewhere` and
 * `draftValue` are properties of the whole model rather than of any one value — the first
 * asks whether this exact string also appears in the client's own briefs, the second where
 * else it appears at all, the third what is saved and unpublished — so all three are filled
 * in afterwards, by `annotateValues` and by the repository. Deriving them means neither can
 * be forgotten on a new field or go stale on an edited one.
 */

/** Above this many characters a value with no declared shape gets a growing box. */
const MULTILINE_THRESHOLD = 80;

/** A pointer builder bound to one file and one top-level binding inside it. */
export function pointerFactory(file: string, symbol: string) {
  return (...path: ReadonlyArray<string | number>): ContentPointer => ({ file, symbol, path });
}

export interface ValueInput {
  readonly label: string;
  readonly value: string;
  readonly kind?: CmsValueKind;
  /** Force a growing box. Omitted means "decide from the length", which is usually right. */
  readonly multiline?: boolean;
  /** Omit to make the value read-only, and give `readOnlyReason` instead. */
  readonly pointer?: ContentPointer;
  readonly readOnlyReason?: string;
}

function toValue(id: string, input: ValueInput): CmsValue {
  return {
    id,
    label: input.label,
    value: input.value,
    kind: input.kind ?? "text",
    multiline: input.multiline ?? input.value.length > MULTILINE_THRESHOLD,
    // Placeholders — see the note at the top of this file.
    approval: "drafted",
    usedElsewhere: [],
    ...(input.pointer ? { pointer: input.pointer } : {}),
    ...(input.readOnlyReason ? { readOnlyReason: input.readOnlyReason } : {}),
  };
}

/** An editable string on one line — a heading, an eyebrow, a label. */
export function field(
  label: string,
  value: string,
  pointer: ContentPointer,
  kind: CmsValueKind = "text",
): ValueInput {
  return { label, value, pointer, kind, multiline: false };
}

/** An editable paragraph. Always a box that grows, however short today's copy happens to be. */
export function paragraph(label: string, value: string, pointer: ContentPointer): ValueInput {
  return { label, value, pointer, kind: "text", multiline: true };
}

/** A string the CMS shows but cannot write, and the reason it cannot. */
export function readOnly(label: string, value: string, reason: string): ValueInput {
  return { label, value, readOnlyReason: reason };
}

/**
 * A call to `createCta(label, href)` becomes two values, because they are two different
 * kinds of string: one is copy a reader sees and the other is a route that has to resolve.
 * `Url` and `CtaLabel` reject different things, and a single combined field could only be
 * validated by whichever of them was guessed at.
 */
export function ctaFields(
  label: string,
  cta: Cta,
  pointer: ContentPointer,
): ReadonlyArray<ValueInput> {
  return [
    {
      label: `${label} label`,
      value: cta.label.value,
      kind: "ctaLabel",
      multiline: false,
      pointer: { ...pointer, path: [...pointer.path, 0] },
    },
    {
      label: `${label} link`,
      value: cta.href.value,
      kind: "url",
      multiline: false,
      pointer: { ...pointer, path: [...pointer.path, 1] },
    },
  ];
}

export interface ListInput {
  readonly label: string;
  readonly items: ReadonlyArray<string>;
  readonly multiline?: boolean;
  /** Builds the pointer for item `index`. Omit for a derived list, which is read-only. */
  readonly pointerAt?: (index: number) => ContentPointer;
  readonly readOnlyReason?: string;
}

export function list(
  label: string,
  items: ReadonlyArray<string>,
  pointerAt: (index: number) => ContentPointer,
): ListInput {
  return { label, items, pointerAt };
}

/** A list assembled at build time from somewhere else — shown, never written here. */
export function readOnlyList(
  label: string,
  items: ReadonlyArray<string>,
  reason: string,
): ListInput {
  return { label, items, readOnlyReason: reason };
}

export interface MediaInput {
  readonly label?: string;
  readonly media: MediaRef;
  /** The alt text's home. Omit when the alt is computed and cannot be written. */
  readonly altPointer?: ContentPointer;
  readonly readOnlyReason?: string;
}

/** A picture or a video, with its alt text. */
export function media(
  label: string,
  ref: MediaRef,
  altPointer: ContentPointer | undefined,
  readOnlyReason?: string,
): MediaInput {
  return {
    label,
    media: ref,
    ...(altPointer ? { altPointer } : {}),
    ...(readOnlyReason ? { readOnlyReason } : {}),
  };
}

export interface GroupInput {
  readonly label: string;
  readonly description?: string;
  readonly values?: ReadonlyArray<ValueInput>;
  readonly lists?: ReadonlyArray<ListInput>;
  readonly media?: ReadonlyArray<MediaInput>;
}

export interface ItemGroupInput {
  readonly label: string;
  readonly collectionId: string;
  /** Defaults to whether the store keeps this set open. See `isOpenCollection`. */
  readonly canChange?: boolean;
  readonly description?: string;
  readonly records: ReadonlyArray<CmsRecord>;
}

export interface RecordInput {
  readonly id: string;
  readonly title: string;
  readonly summary: string;
  readonly updatedAt: Date | null;
  readonly address?: ContentAddress;
  readonly groups?: ReadonlyArray<GroupInput>;
  readonly items?: ReadonlyArray<ItemGroupInput>;
  readonly note?: string;
}

/**
 * A stable id for content that has no slug of its own — page sections, list items, and
 * the FAQ, whose entries are identified by their question. Lowercased, non-alphanumerics
 * collapsed to single hyphens, so it survives being a route segment.
 *
 * Deliberately not `Slug.create`: that value object throws on anything it does not like,
 * and these ids are derived from prose that was never written to be a slug.
 */
export function derivedId(source: string): string {
  return source
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Ids have to be unique within a record, because a save addresses a value by one and a row
 * is keyed by one. Labels are mostly unique already, but a few are read from the content
 * itself — About's "Ambition" and "Present" labels are strings in the file — so a collision
 * is possible, and is resolved by suffixing rather than by silently overwriting.
 */
function uniqueId(base: string, taken: Set<string>): string {
  const seed = base || "field";
  if (!taken.has(seed)) {
    taken.add(seed);
    return seed;
  }
  const next = Array.from({ length: 99 }, (_unused, index) => `${seed}-${index + 2}`).find(
    (candidate) => !taken.has(candidate),
  );
  const resolved = next ?? `${seed}-${taken.size}`;
  taken.add(resolved);
  return resolved;
}

function toList(input: ListInput, taken: Set<string>): CmsList {
  const id = uniqueId(derivedId(input.label), taken);
  return {
    id,
    label: input.label,
    items: input.items.map((item, index) =>
      toValue(`${id}-${index}`, {
        label: `${input.label} ${index + 1}`,
        value: item,
        ...(input.multiline === undefined ? {} : { multiline: input.multiline }),
        ...(input.pointerAt ? { pointer: input.pointerAt(index) } : {}),
        ...(input.readOnlyReason ? { readOnlyReason: input.readOnlyReason } : {}),
      }),
    ),
    ...(input.readOnlyReason ? { readOnlyReason: input.readOnlyReason } : {}),
  };
}

function toMedia(input: MediaInput, taken: Set<string>): CmsMedia {
  const id = uniqueId("media-alt", taken);
  return {
    id,
    label: input.label ?? "Image",
    path: input.media.src.value,
    kind: input.media.kind === "video" ? "video" : "image",
    ...(input.media.poster ? { poster: input.media.poster.value } : {}),
    aspectRatio: input.media.aspectRatio,
    alt: toValue(id, {
      label: "Alt text",
      value: input.media.alt,
      kind: "mediaAlt",
      multiline: false,
      ...(input.altPointer ? { pointer: input.altPointer } : {}),
      ...(input.readOnlyReason ? { readOnlyReason: input.readOnlyReason } : {}),
    }),
  };
}

/**
 * THE ORDER IDS ARE ALLOCATED IN IS PART OF THE STORED SCHEMA, and has to stay what it is.
 *
 * Every value's id becomes a `field_key` in `content_strings`, and the seed walks a record
 * in exactly this order: all the plain values across every group, then every list across
 * every group, then the media alt text. Reordering the three passes here would rename rows
 * and orphan every draft and every approval flag hanging off them.
 */
export function toRecord(input: RecordInput): CmsRecord {
  const taken = new Set<string>();
  const groups = input.groups ?? [];

  const values = groups.map((group) =>
    (group.values ?? []).map((value) => toValue(uniqueId(derivedId(value.label), taken), value)),
  );
  const lists = groups.map((group) => (group.lists ?? []).map((entry) => toList(entry, taken)));
  const mediaEntries = groups.map((group) =>
    (group.media ?? []).map((entry) => toMedia(entry, taken)),
  );

  const built: ReadonlyArray<CmsFieldGroup> = groups.map((group, index) => ({
    id: derivedId(group.label) || `group-${index}`,
    label: group.label,
    ...(group.description ? { description: group.description } : {}),
    values: values[index] ?? [],
    lists: lists[index] ?? [],
    media: mediaEntries[index] ?? [],
  }));

  return {
    id: input.id,
    title: input.title,
    summary: input.summary,
    // Every record reads as published until a draft is laid over it: nothing is
    // unpublished until somebody saves something. See `withDrafts`.
    status: "published",
    updatedAt: input.updatedAt,
    ...(input.address ? { address: input.address } : {}),
    groups: built,
    items: (input.items ?? []).map(
      (group): CmsItemGroup => ({
        id: `items-${derivedId(group.label)}`,
        label: group.label,
        collectionId: group.collectionId,
        addNoun: recordNoun(group.collectionId),
        canChange: group.canChange ?? isOpenCollection(group.collectionId),
        ...(group.description ? { description: group.description } : {}),
        records: group.records,
      }),
    ),
    ...(input.note ? { note: input.note } : {}),
  };
}
