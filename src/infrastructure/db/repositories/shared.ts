import type { FaqItem } from "../../../domain/marketing/entities/FaqBlock";
import type {
  CustomPartnership,
  EngagementTier,
} from "../../../domain/marketing/entities/EngagementTier";
import { Slug } from "../../../domain/shared/value-objects/Slug";
import type { MediaRef } from "../../../domain/shared/value-objects/MediaRef";
import { derivedId } from "../../cms/records";
import { splitListSentence } from "../../content/static/ways-to-work.content";
import { ContentStore, mediaFrom } from "../content/ContentStore";
import { placeholders } from "../pool";
import { cachedRows } from "../content/cache";
import type { RowDataPacket } from "mysql2/promise";
import type {
  CapabilityRow,
  CaseStudyCapabilityRow,
  CaseStudyRow,
  EngagementTierRow,
  FaqItemRow,
  ProcessStepRow,
} from "../content/rows";

/**
 * THE FIVE COLLECTIONS, READ ONCE AND SHARED BY EVERY PAGE THAT SHOWS THEM.
 *
 * A capability appears on the homepage grid, in the nav panel and expanded on
 * /creative-services; a process step appears in three places; a tier in two. Each of
 * those is the SAME record, and the reason the content files spread one entry into
 * several entities rather than retyping it is that a second copy drifts. The database has
 * the same requirement, so the read lives here and every page assembler goes through it.
 *
 * Each loader returns the structural row and a `ContentStore` covering the collection, so
 * a caller takes the slug and the media file from the row and every word from the store.
 */

type Structural = { readonly slug: string; readonly ownerKey: string };

export interface CollectionRead<Row> {
  readonly store: ContentStore;
  readonly records: ReadonlyArray<Row & Structural>;
}

async function load<Row extends RowDataPacket & { slug: string }>(
  collectionId: string,
  sql: string,
): Promise<CollectionRead<Row>> {
  const found = await cachedRows<Row>(sql);
  const records = found.map((entry) => ({
    ...entry,
    ownerKey: `${collectionId}:${entry.slug}`,
  }));
  const store = await ContentStore.load(
    "collection_record",
    records.map((record) => record.ownerKey),
  );
  return { store, records: records as ReadonlyArray<Row & Structural> };
}

export function capabilities(): Promise<CollectionRead<CapabilityRow>> {
  return load<CapabilityRow>("capabilities", "SELECT * FROM capabilities ORDER BY sort_order, id");
}

export function caseStudies(): Promise<CollectionRead<CaseStudyRow>> {
  return load<CaseStudyRow>("case-studies", "SELECT * FROM case_studies ORDER BY sort_order, id");
}

export function processSteps(): Promise<CollectionRead<ProcessStepRow>> {
  return load<ProcessStepRow>(
    "process-steps",
    "SELECT * FROM process_steps ORDER BY sort_order, id",
  );
}

export function engagementTiers(): Promise<CollectionRead<EngagementTierRow>> {
  return load<EngagementTierRow>(
    "engagement-tiers",
    "SELECT * FROM engagement_tiers ORDER BY sort_order, id",
  );
}

/** Kept for the marketing repository, whose process block reads the steps by name only. */
export async function collectionRecordStore(
  collectionId: "process-steps",
): Promise<CollectionRead<ProcessStepRow>> {
  if (collectionId !== "process-steps") throw new Error(`Unknown collection ${collectionId}.`);
  return processSteps();
}

// ---------------------------------------------------------------------------
// The FAQ.
// ---------------------------------------------------------------------------

/**
 * The questions one page asks, in the order it asks them.
 *
 * `faq_placements` is the arrangement and `faq_items` the questions, so a question asked
 * on three pages is one row with one answer. Editing it once changes all three, which is
 * what the content files do today by calling reusedFaq() rather than retyping.
 */
export async function faqItems(pageKey: string): Promise<ReadonlyArray<FaqItem>> {
  const placements = await cachedRows<FaqItemRow>(
    `SELECT items.*
       FROM faq_placements AS placements
       JOIN faq_items AS items ON items.id = placements.faq_id
      WHERE placements.page_key = ?
      ORDER BY placements.sort_order, items.id`,
    [pageKey],
  );
  if (placements.length === 0) return [];

  const store = await ContentStore.load(
    "collection_record",
    placements.map((item) => `faq:${item.faq_key}`),
  );

  return placements.map((item) => {
    const owner = `faq:${item.faq_key}`;
    const cta = store.ctaIfPresent(owner, "cta");
    return {
      question: store.text(owner, "question"),
      answer: store.text(owner, "answer"),
      ...(cta ? { cta } : {}),
    };
  });
}

/** Every FAQ row, keyed by its stable key — for the pages that mix reused and own entries. */
export async function faqByKey(keys: ReadonlyArray<string>): Promise<ReadonlyMap<string, FaqItem>> {
  if (keys.length === 0) return new Map();
  const found = await cachedRows<FaqItemRow>(
    `SELECT * FROM faq_items WHERE faq_key IN (${placeholders(keys.length)})`,
    [...keys],
  );
  const store = await ContentStore.load(
    "collection_record",
    found.map((item) => `faq:${item.faq_key}`),
  );
  const byKey = new Map<string, FaqItem>();
  for (const item of found) {
    const owner = `faq:${item.faq_key}`;
    const cta = store.ctaIfPresent(owner, "cta");
    byKey.set(item.faq_key, {
      question: store.text(owner, "question"),
      answer: store.text(owner, "answer"),
      ...(cta ? { cta } : {}),
    });
  }
  return byKey;
}

/**
 * An inner page's FAQ: some questions reused from the shared set, some written for that
 * page, in the order the page asks them.
 *
 * The ORDER and the mix come from the page's own module, because that is where they are
 * decided — a page chooses which questions to ask and where its own one goes. What comes
 * from the database is every word: a reused question is looked up by its stable key, so
 * an answer edited once in the FAQ collection changes on all four pages; a question
 * written for this page is read from that page's section, which is where the panel edits
 * it. Neither is stored twice, so neither can drift.
 */
export async function pageFaqItems(
  shape: ReadonlyArray<FaqItem>,
  store: ContentStore,
  ownerKey: string,
): Promise<ReadonlyArray<FaqItem>> {
  const keys = shape.map((item) => derivedId(item.question));
  const shared = await faqByKey(keys);

  const ownQuestions = store.list(ownerKey, "questions-written-for-this-page");
  const ownAnswers = store.list(ownerKey, "answers-written-for-this-page");
  let ownIndex = 0;

  return shape.map((item, position) => {
    const reused = shared.get(keys[position] ?? "");
    if (reused) return reused;
    const question = ownQuestions[ownIndex] ?? item.question;
    const answer = ownAnswers[ownIndex] ?? item.answer;
    ownIndex += 1;
    return { question, answer, ...(item.cta ? { cta: item.cta } : {}) };
  });
}

// ---------------------------------------------------------------------------
// Engagement tiers, in the two shapes the site needs them.
// ---------------------------------------------------------------------------

export interface TierRead {
  readonly tiers: ReadonlyArray<EngagementTier>;
  readonly custom: CustomPartnership;
}

/** The homepage's four: name, descriptor and the two list sentences, no expanded copy. */
export async function homeTiers(): Promise<TierRead> {
  const { store, records } = await engagementTiers();
  const named = records.filter((record) => record.is_custom === 0);
  const customRow = records.find((record) => record.is_custom === 1);
  if (!customRow) {
    throw new Error("No custom engagement tier in the database. Run `npm run db:seed`.");
  }

  return {
    tiers: named.map((record) => ({
      name: store.text(record.ownerKey, "name"),
      descriptor: store.text(record.ownerKey, "descriptor"),
      summary: store.text(record.ownerKey, "summary"),
      idealFor: store.text(record.ownerKey, "ideal-for"),
      typicalWork: store.text(record.ownerKey, "typical-work-includes"),
      cta: store.cta(record.ownerKey, "cta"),
    })),
    custom: {
      name: store.text(customRow.ownerKey, "name"),
      descriptor: store.text(customRow.ownerKey, "descriptor"),
      summary: store.text(customRow.ownerKey, "summary"),
      invitation: store.text(customRow.ownerKey, "invitation"),
      cta: store.cta(customRow.ownerKey, "cta"),
    },
  };
}

/**
 * The rendered lists beside a tier are the SAME approved sentence, split for display —
 * not a second copy. Splitting here rather than storing the items keeps that true: there
 * is one string in the database, and no way for a list item to say something the sentence
 * does not. The split function is the content module's own, so both paths agree.
 */
export function tierListItems(sentence: string): ReadonlyArray<string> {
  return splitListSentence(sentence);
}

// ---------------------------------------------------------------------------

/** Which capabilities each piece of work exercises, as slugs, in order. */
export async function caseStudyCapabilitySlugs(): Promise<ReadonlyMap<string, string[]>> {
  const found = await cachedRows<CaseStudyCapabilityRow>(
    `SELECT work.slug AS case_study_slug, capability.slug AS capability_slug, link.sort_order
       FROM case_study_capabilities AS link
       JOIN case_studies AS work ON work.id = link.case_study_id
       JOIN capabilities AS capability ON capability.id = link.capability_id
      ORDER BY link.sort_order`,
  );
  const bySlug = new Map<string, string[]>();
  for (const entry of found) {
    const list = bySlug.get(entry.case_study_slug) ?? [];
    list.push(entry.capability_slug);
    bySlug.set(entry.case_study_slug, list);
  }
  return bySlug;
}

export function slug(value: string): Slug {
  return Slug.create(value);
}

export function media(
  row: { readonly media_path: string; readonly media_kind: string; readonly media_ratio: string },
  alt: string,
): MediaRef {
  return mediaFrom(row.media_path, row.media_kind, row.media_ratio, alt);
}
