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
 * the seven pages end on the same closing line, four share an FAQ block and the six
 * capabilities appear on two pages, so an editor changing one is often changing all of
 * them. Derived by indexing the assembled model, so it cannot go stale.
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

/** "Home › Hero · Heading", or "Creative Services › Capabilities › Motion · Descriptor". */
function locationOf(trail: ReadonlyArray<string>, value: CmsValue): string {
  return `${trail.join(" › ")} · ${value.label}`;
}

interface Located {
  readonly trail: ReadonlyArray<string>;
  readonly record: CmsRecord;
}

/** Every record in the model, with the path of titles that names it. */
function locate(pages: ReadonlyArray<CmsPage>): ReadonlyArray<Located> {
  const found: Located[] = [];
  const walk = (trail: ReadonlyArray<string>, record: CmsRecord): void => {
    const own = [...trail, record.title];
    found.push({ trail: own, record });
    for (const group of record.items) {
      for (const nested of group.records) {
        walk(own, nested);
      }
    }
  };
  for (const page of pages) {
    for (const section of page.sections) {
      walk([page.title], section);
    }
  }
  return found;
}

function valuesOf(record: CmsRecord): ReadonlyArray<CmsValue> {
  return record.groups.flatMap((group) => [
    ...group.values,
    ...group.lists.flatMap((entry) => entry.items),
    ...group.media.map((entry) => entry.alt),
  ]);
}

/**
 * Every location each distinct string occupies, keyed by the string.
 *
 * A record that appears under two sections — the capabilities, on the homepage and on
 * Creative Services — is genuinely two locations for the same string, and both are listed.
 * That is the truthful answer to "where else does this appear", even though the two are one
 * row: it is where an editor will see it change.
 */
function indexLocations(located: ReadonlyArray<Located>): ReadonlyMap<string, ReadonlyArray<string>> {
  return located.reduce((index, entry) => {
    for (const value of valuesOf(entry.record)) {
      const existing = index.get(value.value) ?? [];
      index.set(value.value, [...existing, locationOf(entry.trail, value)]);
    }
    return index;
  }, new Map<string, ReadonlyArray<string>>());
}

interface Annotator {
  (trail: ReadonlyArray<string>, value: CmsValue): CmsValue;
}

function makeAnnotator(
  approved: ReadonlySet<string>,
  locations: ReadonlyMap<string, ReadonlyArray<string>>,
): Annotator {
  return (trail, value) => {
    const own = locationOf(trail, value);
    return {
      ...value,
      approval: approved.has(value.value) ? "client" : "drafted",
      usedElsewhere: (locations.get(value.value) ?? []).filter((entry) => entry !== own),
    };
  };
}

function annotateRecord(
  trail: ReadonlyArray<string>,
  record: CmsRecord,
  annotate: Annotator,
): CmsRecord {
  const own = [...trail, record.title];
  return {
    ...record,
    groups: record.groups.map((group) => ({
      ...group,
      values: group.values.map((value) => annotate(own, value)),
      lists: group.lists.map((entry) => ({
        ...entry,
        items: entry.items.map((item) => annotate(own, item)),
      })),
      media: group.media.map((entry) => ({ ...entry, alt: annotate(own, entry.alt) })),
    })),
    items: record.items.map((group) => ({
      ...group,
      records: group.records.map((nested) => annotateRecord(own, nested, annotate)),
    })),
  };
}

export function annotatePages(
  pages: ReadonlyArray<CmsPage>,
  approvedSources: ReadonlyArray<unknown>,
): ReadonlyArray<CmsPage> {
  const approved = new Set(collectStrings(approvedSources));
  const annotate = makeAnnotator(approved, indexLocations(locate(pages)));

  return pages.map((page) => ({
    ...page,
    sections: page.sections.map((section) => annotateRecord([page.title], section, annotate)),
  }));
}
