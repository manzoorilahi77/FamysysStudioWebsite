import type { CmsCollection } from "../../domain/cms/entities/CmsCollection";
import type { CmsPage } from "../../domain/cms/entities/CmsPage";
import type { CmsRecord, CmsValue } from "../../domain/cms/entities/CmsRecord";

/**
 * THE TWO ANNOTATIONS THE READ MODEL CANNOT KNOW ONE VALUE AT A TIME.
 *
 * `approval` — whether this exact string is the client's own. The rule is the one
 * scripts/generate-content-todo.mjs already uses to build the review list in
 * docs/content-todo.md: a string is approved when it appears verbatim somewhere in the
 * three modules that hold the briefs, and drafted when it does not. Reusing the rule
 * rather than restating it is what keeps the mark in the CMS and the list in the docs
 * from disagreeing — and it means inlining an approved sentence into a page marks it
 * approved automatically, with nothing to remember.
 *
 * `usedElsewhere` — every OTHER place in the panel the identical string appears. Six of
 * the seven pages end on the same closing line and three share an FAQ block, so an editor
 * changing one is often changing all of them. Derived by indexing the assembled model,
 * so it cannot go stale.
 */

/** Keys holding a route, file path or enum rather than reviewable copy. */
const NON_COPY_KEYS = new Set(["href", "src", "poster", "kind", "aspectRatio", "slug"]);

/**
 * Every string reachable from a value. Value objects expose their primitive as `.value`;
 * everything else walks as a plain object. Mirrors `collectStrings` in
 * scripts/generate-content-todo.mjs and in StaticPortfolioRepository.test.ts, which is
 * the point — all three ask the same question of the same strings.
 */
export function collectStrings(node: unknown, out: string[] = []): string[] {
  if (node && typeof node === "object" && "value" in node) {
    const inner = (node as { value: unknown }).value;
    if (typeof inner === "string") {
      out.push(inner);
      return out;
    }
  }
  if (typeof node === "string") {
    out.push(node);
    return out;
  }
  if (Array.isArray(node)) {
    for (const element of node) {
      collectStrings(element, out);
    }
    return out;
  }
  if (node && typeof node === "object") {
    for (const [key, child] of Object.entries(node)) {
      if (NON_COPY_KEYS.has(key)) {
        continue;
      }
      collectStrings(child, out);
    }
  }
  return out;
}

function locationOf(owner: string, record: CmsRecord, value: CmsValue): string {
  return `${owner} › ${record.title} · ${value.label}`;
}

function valuesOf(record: CmsRecord): ReadonlyArray<CmsValue> {
  return [
    ...record.values,
    ...record.lists.flatMap((list) => list.items),
    ...(record.media ? [record.media.alt] : []),
  ];
}

interface Owned {
  readonly owner: string;
  readonly record: CmsRecord;
}

function ownedRecords(
  pages: ReadonlyArray<CmsPage>,
  collections: ReadonlyArray<CmsCollection>,
): ReadonlyArray<Owned> {
  return [
    ...pages.flatMap((page) => page.sections.map((record) => ({ owner: page.title, record }))),
    ...collections.flatMap((collection) =>
      collection.records.map((record) => ({ owner: collection.label, record })),
    ),
  ];
}

/** Every location each distinct string occupies, keyed by the string. */
function indexLocations(owned: ReadonlyArray<Owned>): ReadonlyMap<string, ReadonlyArray<string>> {
  return owned.reduce((index, entry) => {
    for (const value of valuesOf(entry.record)) {
      const existing = index.get(value.value) ?? [];
      index.set(value.value, [...existing, locationOf(entry.owner, entry.record, value)]);
    }
    return index;
  }, new Map<string, ReadonlyArray<string>>());
}

interface Annotator {
  (owner: string, record: CmsRecord, value: CmsValue): CmsValue;
}

function makeAnnotator(
  approved: ReadonlySet<string>,
  locations: ReadonlyMap<string, ReadonlyArray<string>>,
): Annotator {
  return (owner, record, value) => {
    const own = locationOf(owner, record, value);
    return {
      ...value,
      approval: approved.has(value.value) ? "client" : "drafted",
      usedElsewhere: (locations.get(value.value) ?? []).filter((entry) => entry !== own),
    };
  };
}

function annotateRecord(owner: string, record: CmsRecord, annotate: Annotator): CmsRecord {
  return {
    ...record,
    values: record.values.map((value) => annotate(owner, record, value)),
    lists: record.lists.map((entry) => ({
      ...entry,
      items: entry.items.map((item) => annotate(owner, record, item)),
    })),
    ...(record.media
      ? { media: { ...record.media, alt: annotate(owner, record, record.media.alt) } }
      : {}),
  };
}

export interface AnnotatedModel {
  readonly pages: ReadonlyArray<CmsPage>;
  readonly collections: ReadonlyArray<CmsCollection>;
}

export function annotateModel(
  pages: ReadonlyArray<CmsPage>,
  collections: ReadonlyArray<CmsCollection>,
  approvedSources: ReadonlyArray<unknown>,
): AnnotatedModel {
  const approved = new Set(collectStrings(approvedSources));
  const annotate = makeAnnotator(approved, indexLocations(ownedRecords(pages, collections)));

  return {
    pages: pages.map((page) => ({
      ...page,
      sections: page.sections.map((section) => annotateRecord(page.title, section, annotate)),
    })),
    collections: collections.map((collection) => ({
      ...collection,
      records: collection.records.map((record) =>
        annotateRecord(collection.label, record, annotate),
      ),
    })),
  };
}
