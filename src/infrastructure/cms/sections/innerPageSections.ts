import type { CmsRecord } from "../../../domain/cms/entities/CmsRecord";
import type { WaysToWorkPage } from "../../../domain/engagement/entities/WaysToWorkPage";
import type { HowWeWorkPage } from "../../../domain/process/entities/HowWeWorkPage";
import type { CreativeServicesPage } from "../../../domain/services/entities/CreativeServicesPage";
import {
  ctaFields,
  field,
  list,
  media,
  paragraph,
  readOnly,
  readOnlyList,
  toRecord,
} from "../records";
import {
  READ_ONLY,
  creativeServices,
  engagementLines,
  exampleStages,
  howWeWork,
  processHome,
  tierFieldLabels,
  waysToWork,
  waysToWorkHome,
} from "../pointers";
import type { SectionCards } from "./cards";
import { closingCtaSection, faqSection, ownFaqEntries, sectionAddress } from "./sharedSections";

/**
 * The three pages built around a run of records: six capabilities, five stages, four
 * engagements. Each run is a section of its page rather than a screen of its own, because
 * that is what it is on the site.
 */

export function creativeServicesSections(
  page: CreativeServicesPage,
  cards: SectionCards,
  updatedAt: Date | null,
): ReadonlyArray<CmsRecord> {
  const at = (sectionId: string) => sectionAddress("creative-services", sectionId);

  return [
    toRecord({
      id: "hero",
      title: "Hero",
      summary: page.hero.heading,
      updatedAt,
      address: at("hero"),
      groups: [
        {
          label: "Copy",
          values: [
            field("Eyebrow", page.hero.eyebrow, creativeServices("hero", "eyebrow")),
            field("Heading", page.hero.heading, creativeServices("hero", "heading")),
            paragraph("Body", page.hero.body, creativeServices("hero", "body")),
            ...ctaFields("CTA", page.hero.cta, creativeServices("hero", "cta")),
          ],
        },
        {
          label: "Image",
          media: [
            // `servicesImage(file, alt, aspectRatio)` — the alt is argument 1.
            media("Hero image", page.hero.media, creativeServices("hero", "media", 1)),
          ],
        },
      ],
    }),
    toRecord({
      id: "capability-index",
      title: "Capability index",
      summary: page.indexLabel,
      updatedAt,
      address: at("capability-index"),
      groups: [
        {
          label: "Labels",
          values: [
            field("Index label", page.indexLabel, creativeServices("indexLabel")),
            field(
              "Deliverables label",
              page.deliverablesLabel,
              creativeServices("deliverablesLabel"),
            ),
          ],
          lists: [
            readOnlyList(
              "Capabilities listed",
              page.capabilities.map((item) => item.title),
              `${READ_ONLY.spread} The index is generated from the blocks below it.`,
            ),
          ],
        },
      ],
    }),
    toRecord({
      id: "capabilities",
      title: "Capabilities",
      summary: `The ${page.capabilities.length} capability blocks, in order.`,
      updatedAt,
      address: at("capabilities"),
      items: [
        {
          label: "Capabilities",
          collectionId: "capabilities",
          description:
            "Each one is a block on this page, a cell in the homepage grid and a column in the navigation panel — so an edit here moves all three.",
          records: cards.capabilities,
        },
      ],
    }),
    toRecord({
      id: "process-pointer",
      title: "Process pointer",
      summary: page.processPointer.process.heading,
      updatedAt,
      address: at("process-pointer"),
      groups: [
        {
          label: "Copy",
          values: [
            field(
              "Eyebrow",
              page.processPointer.eyebrow,
              creativeServices("processPointer", "eyebrow"),
            ),
            field(
              "Heading",
              page.processPointer.process.heading,
              creativeServices("processPointer", "process", "heading"),
            ),
            ...ctaFields("CTA", page.processPointer.cta, creativeServices("processPointer", "cta")),
          ],
          lists: [
            readOnlyList(
              "Steps",
              page.processPointer.process.steps.map((step) => step.title),
              `${READ_ONLY.spread} The stages are edited on the How We Work page, which renders them in full.`,
            ),
          ],
        },
      ],
    }),
    toRecord({
      id: "engagement-pointer",
      title: "Engagement pointer",
      summary: page.engagementPointer.heading,
      updatedAt,
      address: at("engagement-pointer"),
      groups: [
        {
          label: "Copy",
          values: [
            field(
              "Eyebrow",
              page.engagementPointer.eyebrow,
              creativeServices("engagementPointer", "eyebrow"),
            ),
            field(
              "Heading",
              page.engagementPointer.heading,
              creativeServices("engagementPointer", "heading"),
            ),
            paragraph(
              "Body",
              page.engagementPointer.body,
              creativeServices("engagementPointer", "body"),
            ),
            ...ctaFields(
              "CTA",
              page.engagementPointer.cta,
              creativeServices("engagementPointer", "cta"),
            ),
          ],
          lists: [
            // The names are read from the engagement tiers; only the lines are drafted
            // here, and they are keyed by the tier's own name.
            list(
              "Summary lines",
              page.engagementPointer.summaries.map((entry) => entry.line),
              (index) => engagementLines(page.engagementPointer.summaries[index]?.name ?? ""),
            ),
          ],
        },
      ],
    }),
    faqSection(
      "creative-services",
      page.faq.eyebrow,
      page.faq.heading,
      page.faq.block,
      updatedAt,
      (...path) => creativeServices("faq", ...path),
      // Three entries are spread in from the homepage block; the fourth is this page's
      // own and is element 1 of the array literal.
      ownFaqEntries(page.faq.block, [[3, 1]]),
    ),
    closingCtaSection("creative-services", page.closingCta, updatedAt, (...path) =>
      creativeServices("closingCta", ...path),
    ),
  ];
}

export function howWeWorkSections(
  page: HowWeWorkPage,
  cards: SectionCards,
  updatedAt: Date | null,
): ReadonlyArray<CmsRecord> {
  const at = (sectionId: string) => sectionAddress("how-we-work", sectionId);

  return [
    toRecord({
      id: "hero",
      title: "Hero",
      summary: page.hero.heading,
      updatedAt,
      address: at("hero"),
      groups: [
        {
          label: "Copy",
          values: [
            field("Eyebrow", page.hero.eyebrow, howWeWork("hero", "eyebrow")),
            // The heading IS the homepage's process heading, read from marketing.content.ts
            // rather than retyped — so it is edited there, and editing it moves both.
            field("Heading", page.hero.heading, processHome("heading")),
            paragraph("Body", page.hero.body, howWeWork("hero", "body")),
            ...ctaFields("CTA", page.hero.cta, howWeWork("hero", "cta")),
          ],
        },
      ],
    }),
    toRecord({
      id: "process-overview",
      title: "Process overview",
      summary: page.overviewLabel,
      updatedAt,
      address: at("process-overview"),
      groups: [
        {
          label: "Labels",
          values: [
            field("Overview label", page.overviewLabel, howWeWork("overviewLabel")),
            field("What we need label", page.whatWeNeedLabel, howWeWork("whatWeNeedLabel")),
            field("What you get label", page.whatYouGetLabel, howWeWork("whatYouGetLabel")),
          ],
          lists: [
            readOnlyList(
              "Stages listed",
              page.steps.map((step) => step.title),
              `${READ_ONLY.spread} The overview is generated from the stages below it.`,
            ),
          ],
        },
      ],
    }),
    toRecord({
      id: "process-steps",
      title: "The stages",
      summary: `The ${page.steps.length} stages of a project, in order.`,
      updatedAt,
      address: at("process-steps"),
      items: [
        {
          label: "Stages",
          collectionId: "process-steps",
          description:
            "They appear in full here, and as titles on the homepage and on Creative Services. The order and the count are structural; the copy is not.",
          records: cards.processSteps,
        },
      ],
    }),
    toRecord({
      id: "worked-example",
      title: "Worked example",
      summary: page.workedExample.heading,
      updatedAt,
      address: at("worked-example"),
      groups: [
        {
          label: "Copy",
          values: [
            field("Eyebrow", page.workedExample.eyebrow, howWeWork("workedExample", "eyebrow")),
            field("Heading", page.workedExample.heading, howWeWork("workedExample", "heading")),
            paragraph(
              "Illustrative note",
              page.workedExample.illustrativeNote,
              howWeWork("workedExample", "illustrativeNote"),
            ),
            readOnly(
              "Piece title",
              page.workedExample.pieceTitle,
              `${READ_ONLY.derived} It is the planned piece's own title, edited on the Selected Work page.`,
            ),
            readOnly(
              "Piece description",
              page.workedExample.pieceDescription,
              `${READ_ONLY.derived} It is the planned piece's own intent line, edited on the Selected Work page.`,
            ),
          ],
          lists: [
            {
              ...list(
                "Stage copy",
                page.workedExample.stages.map((stage) => stage.text),
                (index) => exampleStagePointer(page, index),
              ),
              multiline: true,
            },
          ],
        },
      ],
    }),
    toRecord({
      id: "scope-and-revisions",
      title: "Scope and revisions",
      summary: page.scope.heading,
      updatedAt,
      address: at("scope-and-revisions"),
      groups: [
        {
          label: "Copy",
          values: [
            field("Eyebrow", page.scope.eyebrow, howWeWork("scope", "eyebrow")),
            field("Heading", page.scope.heading, howWeWork("scope", "heading")),
            paragraph("Body", page.scope.body, howWeWork("scope", "body")),
          ],
        },
        {
          label: "Topics",
          lists: [
            list(
              "Topic titles",
              page.scope.topics.map((topic) => topic.title),
              (index) => howWeWork("scope", "topics", index, "title"),
            ),
            {
              ...list(
                "Topic bodies",
                page.scope.topics.map((topic) => topic.body),
                (index) => howWeWork("scope", "topics", index, "body"),
              ),
              multiline: true,
            },
          ],
        },
      ],
    }),
    faqSection(
      "how-we-work",
      page.faq.eyebrow,
      page.faq.heading,
      page.faq.block,
      updatedAt,
      (...path) => howWeWork("faq", ...path),
      // `[ own, ...reusedFaqItems, own ]` — elements 0 and 2 of the array literal.
      ownFaqEntries(page.faq.block, [
        [0, 0],
        [3, 2],
      ]),
    ),
    closingCtaSection("how-we-work", page.closingCta, updatedAt, (...path) =>
      howWeWork("closingCta", ...path),
    ),
  ];
}

/** The worked example's five stages are keyed by the process step's approved title. */
function exampleStagePointer(page: HowWeWorkPage, index: number) {
  return exampleStages(page.workedExample.stages[index]?.stepTitle ?? "");
}

export function waysToWorkSections(
  page: WaysToWorkPage,
  cards: SectionCards,
  updatedAt: Date | null,
): ReadonlyArray<CmsRecord> {
  const at = (sectionId: string) => sectionAddress("ways-to-work-with-us", sectionId);

  return [
    toRecord({
      id: "hero",
      title: "Hero",
      summary: page.hero.heading,
      updatedAt,
      address: at("hero"),
      groups: [
        {
          label: "Copy",
          values: [
            field("Eyebrow", page.hero.eyebrow, waysToWork("hero", "eyebrow")),
            // Heading and body are the client's own, read from marketing.content.ts.
            field("Heading", page.hero.heading, waysToWorkHome("heading")),
            paragraph("Body", page.hero.body, waysToWorkHome("body")),
            ...ctaFields("CTA", page.hero.cta, waysToWork("hero", "cta")),
          ],
        },
      ],
    }),
    toRecord({
      id: "tier-comparison",
      title: "Tier comparison",
      summary: page.comparison.heading,
      updatedAt,
      address: at("tier-comparison"),
      groups: [
        {
          label: "Copy",
          values: [
            field("Eyebrow", page.comparison.eyebrow, waysToWork("comparison", "eyebrow")),
            field("Heading", page.comparison.heading, waysToWork("comparison", "heading")),
            paragraph("Body", page.comparison.body, waysToWork("comparison", "body")),
            field("Caption", page.comparison.caption, waysToWork("comparison", "caption")),
          ],
        },
        {
          label: "Row labels",
          description:
            "The first two are the brief's own field names and are shared with the homepage; the other two were written for this table.",
          values: [
            field(
              "Row label — ideal for",
              page.comparison.rowLabels.idealFor,
              tierFieldLabels("idealFor"),
            ),
            field(
              "Row label — typical work",
              page.comparison.rowLabels.typicalWork,
              tierFieldLabels("typicalWork"),
            ),
            field(
              "Row label — best when",
              page.comparison.rowLabels.bestWhen,
              waysToWork("comparison", "rowLabels", "bestWhen"),
            ),
            field(
              "Row label — engagement shape",
              page.comparison.rowLabels.engagementShape,
              waysToWork("comparison", "rowLabels", "engagementShape"),
            ),
          ],
        },
      ],
    }),
    toRecord({
      id: "engagement-tiers",
      title: "The engagements",
      summary: `The ${page.tiers.length} named tiers, in order.`,
      updatedAt,
      address: at("engagement-tiers"),
      items: [
        {
          label: "Engagements",
          collectionId: "engagement-tiers",
          description:
            "They carry the comparison table above, the navigation cards, and the homepage's Ways to Work block.",
          records: cards.engagementTiers,
        },
      ],
    }),
    toRecord({
      id: "custom-partnership",
      title: page.custom.name,
      summary: page.custom.descriptor,
      updatedAt,
      address: at("custom-partnership"),
      items: [
        {
          label: "Custom partnership",
          collectionId: "engagement-tiers",
          // One record, and no Add button: it is stored with the three named tiers, so an
          // Add here would put a new engagement into the run above rather than beside this.
          canChange: false,
          description:
            "Stored with the three named tiers and rendered as a block of its own, because the brief gives it an invitation instead of a comparison row.",
          records: [cards.customPartnership],
        },
      ],
    }),
    toRecord({
      id: "how-to-choose",
      title: "How to choose",
      summary: page.howToChoose.heading,
      updatedAt,
      address: at("how-to-choose"),
      groups: [
        {
          label: "Copy",
          values: [
            field("Eyebrow", page.howToChoose.eyebrow, waysToWork("howToChoose", "eyebrow")),
            field("Heading", page.howToChoose.heading, waysToWork("howToChoose", "heading")),
            paragraph("Body", page.howToChoose.body, waysToWork("howToChoose", "body")),
          ],
        },
        {
          label: "Questions and answers",
          lists: [
            list(
              "Questions",
              page.howToChoose.questions.map((entry) => entry.question),
              (index) => waysToWork("howToChoose", "questions", index, "question"),
            ),
            {
              ...list(
                "Answers",
                page.howToChoose.questions.map((entry) => entry.answer),
                (index) => waysToWork("howToChoose", "questions", index, "answer"),
              ),
              multiline: true,
            },
          ],
        },
      ],
    }),
    toRecord({
      id: "scoping",
      title: "Scoping",
      summary: page.scoping.heading,
      updatedAt,
      address: at("scoping"),
      groups: [
        {
          label: "Copy",
          values: [
            field("Eyebrow", page.scoping.eyebrow, waysToWork("scoping", "eyebrow")),
            field("Heading", page.scoping.heading, waysToWork("scoping", "heading")),
            paragraph("Body", page.scoping.body, waysToWork("scoping", "body")),
          ],
        },
        {
          label: "Steps",
          lists: [
            list(
              "Step titles",
              page.scoping.steps.map((step) => step.title),
              (index) => waysToWork("scoping", "steps", index, "title"),
            ),
            {
              ...list(
                "Step bodies",
                page.scoping.steps.map((step) => step.body),
                (index) => waysToWork("scoping", "steps", index, "body"),
              ),
              multiline: true,
            },
          ],
        },
      ],
    }),
    faqSection(
      "ways-to-work-with-us",
      page.faq.eyebrow,
      page.faq.heading,
      page.faq.block,
      updatedAt,
      (...path) => waysToWork("faq", ...path),
      // `[ reusedFaq(), own, reusedFaq(), own ]` — elements 1 and 3, and here the array
      // literal and the rendered list happen to line up one for one.
      ownFaqEntries(page.faq.block, [
        [1, 1],
        [3, 3],
      ]),
    ),
    closingCtaSection("ways-to-work-with-us", page.closingCta, updatedAt, (...path) =>
      waysToWork("closingCta", ...path),
    ),
  ];
}
