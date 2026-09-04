import type { CmsRecord } from "./CmsRecord";

/**
 * A set of records of one shape. Unlike `CmsPage`, a collection is open — items can be
 * added and removed once persistence exists, which is why the two are separate entities
 * rather than one list with a flag on it.
 */
export interface CmsCollection {
  /** Matches the route segment under /admin. */
  readonly id: string;
  readonly label: string;
  /** The explanatory paragraph under the heading. */
  readonly description: string;
  /** The label on the panel's header row, left of the count. */
  readonly panelLabel: string;
  /** The content file the records are read from, shown as provenance. */
  readonly source: string;
  /** Shown in a row where a record has no summary of its own. */
  readonly emptyMessage: string;
  readonly records: ReadonlyArray<CmsRecord>;
}

/**
 * WHICH COLLECTIONS ARE OPEN, AND WHAT ONE OF THEIR RECORDS IS CALLED.
 *
 * "Open" means an editor can add and remove records. Four of the eight are; the other four
 * are not, and each for its own reason rather than by omission:
 *
 *   - Case Studies: a ninth piece needs two covers, a reference number and its capability
 *     links before it renders as anything, and none of those is a string typed into a
 *     form. It opens when media upload does.
 *   - Testimonials: there is no content behind it at all yet.
 *   - Lists: a cross-cut VIEW of strings that belong to capabilities, stages and tiers.
 *     Adding a row here would mean adding it to one of those, which is where it is done.
 *   - Pages are not a collection and never appear here: the routes under src/app decide
 *     which seven exist.
 *
 * The noun is what the Add button says. "Add a question" reads as an instruction; "Add
 * record" reads as a database.
 */
export const OPEN_COLLECTIONS: Readonly<Record<string, string>> = {
  capabilities: "a capability",
  "process-steps": "a stage",
  "engagement-tiers": "an engagement",
  faq: "a question",
};

export function isOpenCollection(collectionId: string): boolean {
  return Object.hasOwn(OPEN_COLLECTIONS, collectionId);
}

export function recordNoun(collectionId: string): string {
  return OPEN_COLLECTIONS[collectionId] ?? "a record";
}
