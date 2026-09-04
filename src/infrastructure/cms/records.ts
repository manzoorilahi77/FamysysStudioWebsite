import type {
  CmsList,
  CmsMediaSummary,
  CmsRecord,
  CmsValue,
  CmsValueKind,
} from "../../domain/cms/entities/CmsRecord";
import type { ContentPointer } from "../../domain/cms/entities/ContentPointer";
import type { Cta } from "../../domain/shared/value-objects/Cta";
import type { MediaRef } from "../../domain/shared/value-objects/MediaRef";

/**
 * The builders every mapping in this folder goes through. They exist so that "what a CMS
 * row looks like" is decided once: an id, a title, the secondary line under it, and then
 * whatever values, lists and media the underlying entity happens to carry.
 *
 * TWO FIELDS ARE LEFT BLANK HERE ON PURPOSE. `approval` and `usedElsewhere` are properties
 * of the whole read model rather than of any one value — the first asks whether this exact
 * string also appears in the client's own briefs, the second where else it appears at all —
 * so both are filled by `annotateValues` once every page and collection has been built.
 * Deriving them means neither can be forgotten on a new field or go stale on an edited one.
 */

/** Everything is DRAFT in this phase — see `CmsStatus`. */
const DRAFT = "draft" as const;

/** A pointer builder bound to one file and one top-level binding inside it. */
export function pointerFactory(file: string, symbol: string) {
  return (...path: ReadonlyArray<string | number>): ContentPointer => ({ file, symbol, path });
}

export interface ValueInput {
  readonly label: string;
  readonly value: string;
  readonly kind?: CmsValueKind;
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
    // Placeholders — see the note at the top of this file.
    approval: "drafted",
    usedElsewhere: [],
    ...(input.pointer ? { pointer: input.pointer } : {}),
    ...(input.readOnlyReason ? { readOnlyReason: input.readOnlyReason } : {}),
  };
}

/** An editable string. */
export function field(
  label: string,
  value: string,
  pointer: ContentPointer,
  kind: CmsValueKind = "text",
): ValueInput {
  return { label, value, pointer, kind };
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
      pointer: { ...pointer, path: [...pointer.path, 0] },
    },
    {
      label: `${label} link`,
      value: cta.href.value,
      kind: "url",
      pointer: { ...pointer, path: [...pointer.path, 1] },
    },
  ];
}

export interface ListInput {
  readonly label: string;
  readonly items: ReadonlyArray<string>;
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
  readonly media: MediaRef;
  /** The alt text's home. Omit when the alt is computed and cannot be written. */
  readonly altPointer?: ContentPointer;
  readonly readOnlyReason?: string;
}

export interface RecordInput {
  readonly id: string;
  readonly title: string;
  readonly summary: string;
  readonly updatedAt: Date | null;
  readonly values?: ReadonlyArray<ValueInput>;
  readonly lists?: ReadonlyArray<ListInput>;
  readonly media?: MediaInput;
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
 * Ids have to be unique within a record, because a save addresses a value by one. Labels
 * are mostly unique already, but a few are read from the content itself — About's
 * "Ambition" and "Present" labels are strings in the file — so a collision is possible
 * and is resolved by suffixing rather than by silently overwriting.
 */
function uniqueId(base: string, taken: Set<string>): string {
  if (!taken.has(base)) {
    taken.add(base);
    return base;
  }
  const next = Array.from({ length: 99 }, (_unused, index) => `${base}-${index + 2}`).find(
    (candidate) => !taken.has(candidate),
  );
  const resolved = next ?? `${base}-${taken.size}`;
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
        ...(input.pointerAt ? { pointer: input.pointerAt(index) } : {}),
        ...(input.readOnlyReason ? { readOnlyReason: input.readOnlyReason } : {}),
      }),
    ),
  };
}

function toMedia(input: MediaInput): CmsMediaSummary {
  return {
    path: input.media.src.value,
    alt: toValue("media-alt", {
      label: "Alt text",
      value: input.media.alt,
      kind: "mediaAlt",
      ...(input.altPointer ? { pointer: input.altPointer } : {}),
      ...(input.readOnlyReason ? { readOnlyReason: input.readOnlyReason } : {}),
    }),
  };
}

export function toRecord(input: RecordInput): CmsRecord {
  const taken = new Set<string>();
  return {
    id: input.id,
    title: input.title,
    summary: input.summary,
    status: DRAFT,
    updatedAt: input.updatedAt,
    values: (input.values ?? []).map((value) =>
      toValue(uniqueId(derivedId(value.label), taken), value),
    ),
    lists: (input.lists ?? []).map((entry) => toList(entry, taken)),
    ...(input.media ? { media: toMedia(input.media) } : {}),
  };
}
