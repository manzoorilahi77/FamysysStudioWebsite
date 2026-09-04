import type { CmsCollection } from "../../domain/cms/entities/CmsCollection";
import type { CmsRecord } from "../../domain/cms/entities/CmsRecord";
import type { WaysToWorkPage } from "../../domain/engagement/entities/WaysToWorkPage";
import type { FaqBlock } from "../../domain/marketing/entities/FaqBlock";
import type { CaseStudy } from "../../domain/portfolio/entities/CaseStudy";
import type { SelectedWorkPage } from "../../domain/portfolio/entities/SelectedWorkPage";
import type { HowWeWorkPage } from "../../domain/process/entities/HowWeWorkPage";
import type { CreativeServicesPage } from "../../domain/services/entities/CreativeServicesPage";
import { CONTENT_FILE, contentModifiedAt } from "./contentSources";
import { buildLists } from "./lists";
import {
  READ_ONLY,
  capabilityCatalogue,
  capabilityCta,
  capabilityDrafts,
  customPartnership,
  faq,
  pieceDrafts,
  plannedPieces,
  processHome,
  stepDrafts,
  tierDrafts,
  waysToWorkHome,
} from "./pointers";
import { ctaFields, derivedId, field, list, readOnly, readOnlyList, toRecord } from "./records";

/**
 * A COLLECTION IS AN OPEN SET. Unlike the seven pages, its records can be added to and
 * removed from once persistence exists — which is the whole reason the two are separate
 * entities rather than one list with a flag on it. Adding and removing is NOT in this
 * phase; what a record's screen offers is editing the fields of one that already exists.
 *
 * Every collection below is read back out of the repositories the site itself renders
 * from, so a count here is the count the page shows: eight pieces, six capabilities,
 * five stages, four engagements.
 *
 * A RECORD IS USUALLY TWO FILES. The client's approved words live in marketing,
 * portfolio or services; the expanded copy written to fill a page lives in that page's
 * module, keyed by the approved title. Both halves are edited on one screen, and each
 * value is written back to wherever it actually is.
 */

/**
 * THE FOUR TITLES THAT ARE KEYS, NOT COPY.
 *
 * The content modules deliberately store approved copy once and look it up from the pages
 * that reuse it — `DRAFT_DETAILS[capability.title]`, `DRAFT_STEPS[step.title]`,
 * `reusedFaq("How much do your services cost?")`. That is what stops a page drifting from
 * the brief, and it is also what makes these particular strings structural: renaming one
 * here would write a valid string and leave every module that looks it up throwing on the
 * next reload.
 *
 * They are read-only for the same reason adding a page is: the change is a refactor across
 * several files, not an edit to one. Everything else on these records is editable, the
 * descriptor and the intent line included.
 */
/**
 * THE FIVE STRINGS THAT ARE ALSO KEYS.
 *
 * Each of these names its record everywhere else the record is referred to — the anchor it
 * links to, the lookup another page finds it by, the slug in its URL. Writing a new value
 * would be a perfectly valid string that leaves the pages pointing at something that is no
 * longer there.
 *
 * The reasons say WHAT the string keys rather than which file it sits in, because the
 * content moved to a database and the constraint did not. It is the same constraint in
 * both stores: rename the key and the references break. Doing it properly means renaming
 * the references too, which is a migration, not a text edit.
 */
const KEY_TITLE = {
  piece:
    "A piece's title is the key its expanded copy is stored under, and the key its slug and its URL are generated from. Renaming it would break every link that points at the piece — that is a redirect and a migration, not an edit.",
  capability:
    "A capability's title is the key its expanded copy, its deliverables and its image are stored under, the anchor the navigation panel links to, and the label /selected-work filters by. Renaming it would break all four.",
  step: "A stage's title is the key its expanded copy and its worked-example paragraph are stored under, and the key its slug is generated from. Renaming it would break the jump links on /how-we-work.",
  tier: "An engagement's name is the key its expanded copy and its summary line are stored under, and the key its slug is generated from. Renaming it would break the how-to-choose answers that link straight to it.",
  question:
    "A question is the key an entry is reused by — creative-services, how-we-work and ways-to-work each ask for it by its exact wording, and all four pages share the one answer. Rewording it here would leave those pages asking for a question that no longer exists. The answer below is editable, and editing it changes every page that asks.",
} as const;

export interface CollectionSources {
  readonly creativeServices: CreativeServicesPage;
  readonly howWeWork: HowWeWorkPage;
  readonly waysToWork: WaysToWorkPage;
  readonly selectedWork: SelectedWorkPage;
  /** The homepage's eight, which carry a different cover — and so a different alt — from the same pieces on /selected-work. */
  readonly caseStudies: ReadonlyArray<CaseStudy>;
  readonly faq: FaqBlock;
}

function caseStudyRecords(
  page: SelectedWorkPage,
  homepageCovers: ReadonlyArray<CaseStudy>,
  updatedAt: Date | null,
): ReadonlyArray<CmsRecord> {
  return page.pieces.map((piece, index) =>
    toRecord({
      id: piece.slug.value,
      title: piece.title,
      summary: piece.description,
      updatedAt,
      values: [
        readOnly("Title", piece.title, KEY_TITLE.piece),
        field("Intent line", piece.description, plannedPieces(index, "description")),
        readOnly(
          "Reference",
          piece.reference,
          "Generated from the piece's position in the list, so the eight are numbered 01 to 08 without anyone maintaining it.",
        ),
        field("Demonstrates", piece.demonstrates, pieceDrafts(piece.title, "demonstrates")),
        field("Why this piece", piece.whyThisPiece, pieceDrafts(piece.title, "whyThisPiece")),
        // The homepage grid and the Selected Work page show DIFFERENT photographs of the
        // same planned piece, so there are two alt texts and they live in two files.
        field(
          "Homepage cover alt text",
          homepageCovers[index]?.media.alt ?? "",
          plannedPieces(index, "coverAlt"),
        ),
      ],
      lists: [
        readOnlyList(
          "Capabilities",
          piece.capabilities.map((capability) => capability.title),
          `${READ_ONLY.spread} Which capabilities a piece exercises is structural, not copy.`,
        ),
      ],
      media: { media: piece.media, altPointer: pieceDrafts(piece.title, "imageAlt") },
    }),
  );
}

function capabilityRecords(
  page: CreativeServicesPage,
  updatedAt: Date | null,
): ReadonlyArray<CmsRecord> {
  return page.capabilities.map((capability, index) =>
    toRecord({
      id: capability.slug.value,
      title: capability.title,
      summary: capability.description,
      updatedAt,
      values: [
        readOnly("Title", capability.title, KEY_TITLE.capability),
        field("Descriptor", capability.description, capabilityCatalogue(index, "description")),
        field(
          "Expanded copy",
          capability.expandedCopy,
          capabilityDrafts(capability.title, "expandedCopy"),
        ),
        // One CTA serves all six capabilities. Editing it here changes it on every one,
        // which is what the "also used" line under the field is there to say.
        ...ctaFields("CTA", capability.cta, capabilityCta),
      ],
      lists: [
        list(page.deliverablesLabel, capability.deliverables, (item) =>
          capabilityDrafts(capability.title, "deliverables", item),
        ),
      ],
      media: {
        media: capability.media,
        altPointer: capabilityDrafts(capability.title, "imageAlt"),
      },
    }),
  );
}

function processStepRecords(page: HowWeWorkPage, updatedAt: Date | null): ReadonlyArray<CmsRecord> {
  return page.steps.map((step, index) =>
    toRecord({
      id: step.slug.value,
      title: `${String(index + 1).padStart(2, "0")} — ${step.title}`,
      summary: step.description,
      updatedAt,
      values: [
        readOnly("Title", step.title, KEY_TITLE.step),
        field("Description", step.description, processHome("steps", index, "description")),
        field("Expanded copy", step.expandedCopy, stepDrafts(step.title, "expandedCopy")),
        readOnly("Slug", step.slug.value, READ_ONLY.slug),
      ],
      lists: [
        list(page.whatWeNeedLabel, step.whatWeNeed, (item) =>
          stepDrafts(step.title, "whatWeNeed", item),
        ),
        list(page.whatYouGetLabel, step.whatYouGet, (item) =>
          stepDrafts(step.title, "whatYouGet", item),
        ),
      ],
      media: { media: step.media, altPointer: stepDrafts(step.title, "imageAlt") },
    }),
  );
}

/**
 * Three tiers and the custom partnership, in the order the page prints them. The custom
 * engagement is a different shape — no "ideal for" list, an invitation instead of a
 * comparison row — which is why it is appended rather than mapped with the other three.
 */
function engagementTierRecords(
  page: WaysToWorkPage,
  updatedAt: Date | null,
): ReadonlyArray<CmsRecord> {
  const labels = page.comparison.rowLabels;

  const tiers = page.tiers.map((tier, index) =>
    toRecord({
      id: tier.slug.value,
      title: tier.name,
      summary: tier.descriptor,
      updatedAt,
      values: [
        readOnly("Name", tier.name, KEY_TITLE.tier),
        field("Descriptor", tier.descriptor, waysToWorkHome("tiers", index, "descriptor")),
        field("Summary", tier.summary, waysToWorkHome("tiers", index, "summary")),
        // The two comparison rows are stored as the brief's own sentences and split into
        // list items for rendering. The sentence is the editable thing; the split is
        // reversible and round-trip tested, so editing the pieces would fight the test.
        field(labels.idealFor, tier.idealFor, waysToWorkHome("tiers", index, "idealFor")),
        field(labels.typicalWork, tier.typicalWork, waysToWorkHome("tiers", index, "typicalWork")),
        field(labels.bestWhen, tier.bestWhen, tierDrafts(tier.name, "bestWhen")),
        field(
          labels.engagementShape,
          tier.engagementShape,
          tierDrafts(tier.name, "engagementShape"),
        ),
        field("Expanded copy", tier.expandedCopy, tierDrafts(tier.name, "expandedCopy")),
        ...ctaFields("CTA", tier.cta, waysToWorkHome("tiers", index, "cta")),
      ],
      lists: [
        readOnlyList(
          `${labels.idealFor} — as rendered`,
          tier.idealForItems,
          `Split from the sentence above, and joined back by a round-trip test. Edit "${labels.idealFor}".`,
        ),
        readOnlyList(
          `${labels.typicalWork} — as rendered`,
          tier.typicalWorkItems,
          `Split from the sentence above, and joined back by a round-trip test. Edit "${labels.typicalWork}".`,
        ),
      ],
      media: { media: tier.media, altPointer: tierDrafts(tier.name, "imageAlt") },
    }),
  );

  return [
    ...tiers,
    toRecord({
      id: page.custom.slug.value,
      title: page.custom.name,
      summary: page.custom.descriptor,
      updatedAt,
      values: [
        readOnly("Name", page.custom.name, KEY_TITLE.tier),
        field("Descriptor", page.custom.descriptor, waysToWorkHome("custom", "descriptor")),
        field("Summary", page.custom.summary, waysToWorkHome("custom", "summary")),
        field("Invitation", page.custom.invitation, waysToWorkHome("custom", "invitation")),
        field("Expanded copy", page.custom.expandedCopy, customPartnership("expandedCopy")),
        field("Covers label", page.custom.coversLabel, customPartnership("coversLabel")),
        ...ctaFields("CTA", page.custom.cta, waysToWorkHome("custom", "cta")),
      ],
      lists: [
        list(page.custom.coversLabel, page.custom.covers, (index) =>
          customPartnership("covers", index),
        ),
      ],
      // `tierImage(file, alt, aspectRatio)` — the alt is argument 1.
      media: { media: page.custom.media, altPointer: customPartnership("media", 1) },
    }),
  ];
}

function faqRecords(block: FaqBlock, updatedAt: Date | null): ReadonlyArray<CmsRecord> {
  return block.items.map((item, index) =>
    toRecord({
      id: derivedId(item.question),
      title: item.question,
      summary: item.answer,
      updatedAt,
      values: [
        readOnly("Question", item.question, KEY_TITLE.question),
        field("Answer", item.answer, faq("items", index, "answer")),
        ...(item.cta ? ctaFields("CTA", item.cta, faq("items", index, "cta")) : []),
      ],
    }),
  );
}

export function buildCollections(sources: CollectionSources): ReadonlyArray<CmsCollection> {
  const selectedWorkAt = contentModifiedAt(CONTENT_FILE.selectedWork);
  const creativeServicesAt = contentModifiedAt(CONTENT_FILE.creativeServices);
  const howWeWorkAt = contentModifiedAt(CONTENT_FILE.howWeWork);
  const waysToWorkAt = contentModifiedAt(CONTENT_FILE.waysToWork);
  const marketingAt = contentModifiedAt(CONTENT_FILE.marketing);

  return [
    {
      id: "case-studies",
      label: "Case Studies",
      description:
        "The eight portfolio pieces. None has been produced yet — every title and description is the planned brief, and every cover is a placeholder. Pieces cannot be added or removed here; the eight are the client's own list.",
      panelLabel: "All pieces",
      source: `${CONTENT_FILE.portfolio} · ${CONTENT_FILE.selectedWork}`,
      emptyMessage: "No pieces.",
      records: caseStudyRecords(sources.selectedWork, sources.caseStudies, selectedWorkAt),
    },
    {
      id: "testimonials",
      label: "Testimonials",
      description:
        "Client quotes. The site has none — no engagement has finished — so nothing here is rendered anywhere yet. Adding the first one is a structural change, not an edit.",
      panelLabel: "All testimonials",
      source: "No content file yet.",
      emptyMessage: "No testimonials.",
      records: [],
    },
    {
      id: "capabilities",
      label: "Capabilities",
      description:
        "The six services. Each one is a block on Creative Services, a cell in the homepage grid and a column in the navigation panel — so a title edited here moves all three.",
      panelLabel: "All capabilities",
      source: `${CONTENT_FILE.services} · ${CONTENT_FILE.creativeServices}`,
      emptyMessage: "No capabilities.",
      records: capabilityRecords(sources.creativeServices, creativeServicesAt),
    },
    {
      id: "process-steps",
      label: "Process Steps",
      description:
        "The five stages of a project, in order. They appear in full on How We Work and as titles on the homepage and Creative Services. The order and the count are structural; the copy is not.",
      panelLabel: "All stages",
      source: `${CONTENT_FILE.marketing} · ${CONTENT_FILE.howWeWork}`,
      emptyMessage: "No stages.",
      records: processStepRecords(sources.howWeWork, howWeWorkAt),
    },
    {
      id: "faq",
      label: "FAQ",
      description:
        "One block of questions, shared. The homepage prints all of them; Creative Services, How We Work and Ways to Work each select the ones that fit, so an answer edited here is edited everywhere it appears.",
      panelLabel: "All questions",
      source: CONTENT_FILE.marketing,
      emptyMessage: "No questions.",
      records: faqRecords(sources.faq, marketingAt),
    },
    {
      id: "engagement-tiers",
      label: "Engagement Tiers",
      description:
        "Three tiers and the custom partnership. They carry the comparison table, the navigation cards and the homepage's Ways to Work block.",
      panelLabel: "All engagements",
      source: `${CONTENT_FILE.marketing} · ${CONTENT_FILE.waysToWork}`,
      emptyMessage: "No engagements.",
      records: engagementTierRecords(sources.waysToWork, waysToWorkAt),
    },
    {
      id: "lists",
      label: "Lists",
      description:
        "Every named list the content carries — deliverables, what a stage needs, what an engagement covers. They are edited with the record they belong to; this is where to see them together and read them against each other.",
      panelLabel: "All lists",
      source: `${CONTENT_FILE.creativeServices} · ${CONTENT_FILE.howWeWork} · ${CONTENT_FILE.waysToWork}`,
      emptyMessage: "No lists.",
      records: buildLists(sources),
    },
  ];
}
