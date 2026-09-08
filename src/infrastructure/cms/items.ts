import type { CmsRecord } from "../../domain/cms/entities/CmsRecord";
import type { WaysToWorkPage } from "../../domain/engagement/entities/WaysToWorkPage";
import type { FaqBlock } from "../../domain/marketing/entities/FaqBlock";
import type { CaseStudy } from "../../domain/portfolio/entities/CaseStudy";
import type { SelectedWorkPage } from "../../domain/portfolio/entities/SelectedWorkPage";
import type { HowWeWorkPage } from "../../domain/process/entities/HowWeWorkPage";
import type { CreativeServicesPage } from "../../domain/services/entities/CreativeServicesPage";
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
import {
  ctaFields,
  derivedId,
  field,
  list,
  media,
  paragraph,
  readOnly,
  readOnlyList,
  toRecord,
} from "./records";

/**
 * THE REPEATED CARDS, BUILT WHERE THEY RENDER.
 *
 * Six capabilities, five stages, three engagements and a custom partnership, eight planned
 * pieces, and the FAQ's questions. Every one of them used to be a collection SCREEN in the
 * sidebar, listed beside the seven pages as though it were one. None is a page: each is a
 * run of blocks inside a section of a page, and this file builds them as such — the same
 * records, the same slugs, the same rows, nested under the section that renders them.
 *
 * A RECORD IS USUALLY TWO FILES. The client's approved words live in marketing, portfolio
 * or services; the expanded copy written to fill a page lives in that page's module, keyed
 * by the approved title. Both halves are edited on one card, and each value is written back
 * to wherever it actually is.
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

/** Every card is a record of one of the stores' open sets, addressed by set and slug. */
function at(collectionId: string, slug: string) {
  return { kind: "collection_record", key: `${collectionId}:${slug}` } as const;
}

export function capabilityCards(
  page: CreativeServicesPage,
  updatedAt: Date | null,
): ReadonlyArray<CmsRecord> {
  return page.capabilities.map((capability, index) =>
    toRecord({
      id: capability.slug.value,
      title: capability.title,
      summary: capability.description,
      updatedAt,
      address: at("capabilities", capability.slug.value),
      groups: [
        {
          label: "Copy",
          values: [
            readOnly("Title", capability.title, KEY_TITLE.capability),
            paragraph(
              "Descriptor",
              capability.description,
              capabilityCatalogue(index, "description"),
            ),
            paragraph(
              "Expanded copy",
              capability.expandedCopy,
              capabilityDrafts(capability.title, "expandedCopy"),
            ),
            // One CTA serves all six capabilities. Editing it here changes it on every
            // one, which is what the "also used" line under the field is there to say.
            ...ctaFields("CTA", capability.cta, capabilityCta),
          ],
          lists: [
            list(page.deliverablesLabel, capability.deliverables, (item) =>
              capabilityDrafts(capability.title, "deliverables", item),
            ),
          ],
        },
        {
          label: "Image",
          media: [
            media(
              "Capability image",
              capability.media,
              capabilityDrafts(capability.title, "imageAlt"),
            ),
          ],
        },
      ],
    }),
  );
}

export function processStepCards(
  page: HowWeWorkPage,
  updatedAt: Date | null,
): ReadonlyArray<CmsRecord> {
  return page.steps.map((step, index) =>
    toRecord({
      id: step.slug.value,
      title: `${String(index + 1).padStart(2, "0")} — ${step.title}`,
      summary: step.description,
      updatedAt,
      address: at("process-steps", step.slug.value),
      groups: [
        {
          label: "Copy",
          values: [
            readOnly("Title", step.title, KEY_TITLE.step),
            paragraph("Description", step.description, processHome("steps", index, "description")),
            paragraph("Expanded copy", step.expandedCopy, stepDrafts(step.title, "expandedCopy")),
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
        },
        {
          label: "Image",
          media: [media("Stage image", step.media, stepDrafts(step.title, "imageAlt"))],
        },
      ],
    }),
  );
}

/** The three named tiers. The custom partnership is its own block on the page — see below. */
export function engagementTierCards(
  page: WaysToWorkPage,
  updatedAt: Date | null,
): ReadonlyArray<CmsRecord> {
  const labels = page.comparison.rowLabels;

  return page.tiers.map((tier, index) =>
    toRecord({
      id: tier.slug.value,
      title: tier.name,
      summary: tier.descriptor,
      updatedAt,
      address: at("engagement-tiers", tier.slug.value),
      groups: [
        {
          label: "Copy",
          values: [
            readOnly("Name", tier.name, KEY_TITLE.tier),
            paragraph("Descriptor", tier.descriptor, waysToWorkHome("tiers", index, "descriptor")),
            paragraph("Summary", tier.summary, waysToWorkHome("tiers", index, "summary")),
            // The two comparison rows are stored as the brief's own sentences and split
            // into list items for rendering. The sentence is the editable thing; the split
            // is reversible and round-trip tested, so editing the pieces would fight the
            // test.
            paragraph(labels.idealFor, tier.idealFor, waysToWorkHome("tiers", index, "idealFor")),
            paragraph(
              labels.typicalWork,
              tier.typicalWork,
              waysToWorkHome("tiers", index, "typicalWork"),
            ),
            paragraph(labels.bestWhen, tier.bestWhen, tierDrafts(tier.name, "bestWhen")),
            paragraph(
              labels.engagementShape,
              tier.engagementShape,
              tierDrafts(tier.name, "engagementShape"),
            ),
            paragraph("Expanded copy", tier.expandedCopy, tierDrafts(tier.name, "expandedCopy")),
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
        },
        {
          label: "Image",
          media: [media("Engagement image", tier.media, tierDrafts(tier.name, "imageAlt"))],
        },
      ],
    }),
  );
}

/**
 * The Custom Creative Partnership. A tier in the store — same table, same slug — and its
 * own block on the page, because the brief gives it an invitation instead of a comparison
 * row and the page renders it as a separate section.
 */
export function customPartnershipCard(page: WaysToWorkPage, updatedAt: Date | null): CmsRecord {
  return toRecord({
    id: page.custom.slug.value,
    title: page.custom.name,
    summary: page.custom.descriptor,
    updatedAt,
    address: at("engagement-tiers", page.custom.slug.value),
    groups: [
      {
        label: "Copy",
        values: [
          readOnly("Name", page.custom.name, KEY_TITLE.tier),
          paragraph("Descriptor", page.custom.descriptor, waysToWorkHome("custom", "descriptor")),
          paragraph("Summary", page.custom.summary, waysToWorkHome("custom", "summary")),
          paragraph("Invitation", page.custom.invitation, waysToWorkHome("custom", "invitation")),
          paragraph("Expanded copy", page.custom.expandedCopy, customPartnership("expandedCopy")),
          field("Covers label", page.custom.coversLabel, customPartnership("coversLabel")),
          ...ctaFields("CTA", page.custom.cta, waysToWorkHome("custom", "cta")),
        ],
        lists: [
          list(page.custom.coversLabel, page.custom.covers, (index) =>
            customPartnership("covers", index),
          ),
        ],
      },
      {
        label: "Image",
        // `tierImage(file, alt, aspectRatio)` — the alt is argument 1.
        media: [media("Partnership image", page.custom.media, customPartnership("media", 1))],
      },
    ],
  });
}

export function caseStudyCards(
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
      address: at("case-studies", piece.slug.value),
      groups: [
        {
          label: "Copy",
          values: [
            readOnly("Title", piece.title, KEY_TITLE.piece),
            paragraph("Intent line", piece.description, plannedPieces(index, "description")),
            readOnly(
              "Reference",
              piece.reference,
              "Generated from the piece's position in the list, so the eight are numbered 01 to 08 without anyone maintaining it.",
            ),
            paragraph(
              "Demonstrates",
              piece.demonstrates,
              pieceDrafts(piece.title, "demonstrates"),
            ),
            paragraph(
              "Why this piece",
              piece.whyThisPiece,
              pieceDrafts(piece.title, "whyThisPiece"),
            ),
            // The homepage grid and the Selected Work page show DIFFERENT photographs of
            // the same planned piece, so there are two alt texts in two files. This one is
            // the homepage tile's; the page's own is on the image below.
            field(
              "Homepage cover alt text",
              homepageCovers[index]?.media.alt ?? "",
              plannedPieces(index, "coverAlt"),
              "mediaAlt",
            ),
          ],
          lists: [
            readOnlyList(
              "Capabilities",
              piece.capabilities.map((capability) => capability.title),
              `${READ_ONLY.spread} Which capabilities a piece exercises is structural, not copy.`,
            ),
          ],
        },
        {
          label: "Image",
          media: [media("Page cover", piece.media, pieceDrafts(piece.title, "imageAlt"))],
        },
      ],
    }),
  );
}

export function faqCards(block: FaqBlock, updatedAt: Date | null): ReadonlyArray<CmsRecord> {
  return block.items.map((item, index) =>
    toRecord({
      id: derivedId(item.question),
      title: item.question,
      summary: item.answer,
      updatedAt,
      address: at("faq", derivedId(item.question)),
      groups: [
        {
          label: "Question and answer",
          values: [
            readOnly("Question", item.question, KEY_TITLE.question),
            paragraph("Answer", item.answer, faq("items", index, "answer")),
            ...(item.cta ? ctaFields("CTA", item.cta, faq("items", index, "cta")) : []),
          ],
        },
      ],
    }),
  );
}
