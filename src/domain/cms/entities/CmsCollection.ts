/**
 * WHAT IS LEFT OF "COLLECTIONS".
 *
 * There is no `CmsCollection` entity any more and there are no collection screens. Every
 * set of repeated records — the six capabilities, the five stages, the four engagements,
 * the eight pieces, the FAQ's questions — is now a `CmsItemGroup` inside the section that
 * renders it, because that is where an editor looks for it.
 *
 * What survives is the one fact that is not about screens: which of those sets an editor
 * may add a record to, and what a single record of it is called. A store still keys them by
 * these ids, so they are still named here.
 */

/**
 * WHICH SETS ARE OPEN, AND WHAT ONE OF THEIR RECORDS IS CALLED.
 *
 * "Open" means an editor can add and remove records. Four sets are; the fifth is not, and
 * not by omission:
 *
 *   - Case Studies: a ninth piece needs two covers, a reference number and its capability
 *     links before it renders as anything, and none of those is a string typed into a
 *     form. It opens when media upload does.
 *   - Pages are not a set of records and never appear here: the routes under src/app
 *     decide which seven exist.
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
