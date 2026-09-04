import type { CmsRecord } from "../../../domain/cms/entities/CmsRecord";
import type { WaysToWorkPage } from "../../../domain/engagement/entities/WaysToWorkPage";
import type { HowWeWorkPage } from "../../../domain/process/entities/HowWeWorkPage";
import type { CreativeServicesPage } from "../../../domain/services/entities/CreativeServicesPage";
import { ctaFields, field, list, readOnly, readOnlyList, toRecord } from "../records";
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
import { closingCtaSection, faqSection, ownFaqEntries } from "./sharedSections";

/** The three pages whose repeating content is edited as a collection elsewhere. */

export function creativeServicesSections(
  page: CreativeServicesPage,
  updatedAt: Date | null,
): ReadonlyArray<CmsRecord> {
  return [
    toRecord({
      id: "hero",
      title: "Hero",
      summary: page.hero.heading,
      updatedAt,
      values: [
        field("Eyebrow", page.hero.eyebrow, creativeServices("hero", "eyebrow")),
        field("Heading", page.hero.heading, creativeServices("hero", "heading")),
        field("Body", page.hero.body, creativeServices("hero", "body")),
        ...ctaFields("CTA", page.hero.cta, creativeServices("hero", "cta")),
      ],
      media: {
        media: page.hero.media,
        // `servicesImage(file, alt, aspectRatio)` — the alt is argument 1.
        altPointer: creativeServices("hero", "media", 1),
      },
    }),
    toRecord({
      id: "capability-index",
      title: "Capability index",
      summary: page.indexLabel,
      updatedAt,
      values: [
        field("Index label", page.indexLabel, creativeServices("indexLabel")),
        field("Deliverables label", page.deliverablesLabel, creativeServices("deliverablesLabel")),
      ],
      lists: [
        readOnlyList(
          "Capabilities listed",
          page.capabilities.map((item) => item.title),
          `${READ_ONLY.spread} Capabilities are edited under Capabilities.`,
        ),
      ],
    }),
    toRecord({
      id: "process-pointer",
      title: "Process pointer",
      summary: page.processPointer.process.heading,
      updatedAt,
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
          `${READ_ONLY.spread} Steps are edited under Process Steps.`,
        ),
      ],
    }),
    toRecord({
      id: "engagement-pointer",
      title: "Engagement pointer",
      summary: page.engagementPointer.heading,
      updatedAt,
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
        field("Body", page.engagementPointer.body, creativeServices("engagementPointer", "body")),
        ...ctaFields(
          "CTA",
          page.engagementPointer.cta,
          creativeServices("engagementPointer", "cta"),
        ),
      ],
      lists: [
        // The names are read from the engagement tiers; only the lines are drafted here,
        // and they are keyed by the tier's own name.
        list(
          "Summary lines",
          page.engagementPointer.summaries.map((entry) => entry.line),
          (index) => engagementLines(page.engagementPointer.summaries[index]?.name ?? ""),
        ),
      ],
    }),
    faqSection(
      page.faq.eyebrow,
      page.faq.heading,
      page.faq.block,
      updatedAt,
      (...path) => creativeServices("faq", ...path),
      // Three entries are spread in from the homepage block; the fourth is this page's
      // own and is element 1 of the array literal.
      ownFaqEntries(page.faq.block, [[3, 1]]),
    ),
    closingCtaSection(page.closingCta, updatedAt, (...path) =>
      creativeServices("closingCta", ...path),
    ),
  ];
}

export function howWeWorkSections(
  page: HowWeWorkPage,
  updatedAt: Date | null,
): ReadonlyArray<CmsRecord> {
  return [
    toRecord({
      id: "hero",
      title: "Hero",
      summary: page.hero.heading,
      updatedAt,
      values: [
        field("Eyebrow", page.hero.eyebrow, howWeWork("hero", "eyebrow")),
        // The heading IS the homepage's process heading, read from marketing.content.ts
        // rather than retyped — so it is edited there, and editing it moves both.
        field("Heading", page.hero.heading, processHome("heading")),
        field("Body", page.hero.body, howWeWork("hero", "body")),
        ...ctaFields("CTA", page.hero.cta, howWeWork("hero", "cta")),
      ],
    }),
    toRecord({
      id: "process-overview",
      title: "Process overview",
      summary: page.overviewLabel,
      updatedAt,
      values: [
        field("Overview label", page.overviewLabel, howWeWork("overviewLabel")),
        field("What we need label", page.whatWeNeedLabel, howWeWork("whatWeNeedLabel")),
        field("What you get label", page.whatYouGetLabel, howWeWork("whatYouGetLabel")),
      ],
      lists: [
        readOnlyList(
          "Stages listed",
          page.steps.map((step) => step.title),
          `${READ_ONLY.spread} Stages are edited under Process Steps.`,
        ),
      ],
    }),
    toRecord({
      id: "worked-example",
      title: "Worked example",
      summary: page.workedExample.heading,
      updatedAt,
      values: [
        field("Eyebrow", page.workedExample.eyebrow, howWeWork("workedExample", "eyebrow")),
        field("Heading", page.workedExample.heading, howWeWork("workedExample", "heading")),
        field(
          "Illustrative note",
          page.workedExample.illustrativeNote,
          howWeWork("workedExample", "illustrativeNote"),
        ),
        readOnly(
          "Piece title",
          page.workedExample.pieceTitle,
          `${READ_ONLY.derived} It is the planned piece's own title, from Case Studies.`,
        ),
        readOnly(
          "Piece description",
          page.workedExample.pieceDescription,
          `${READ_ONLY.derived} It is the planned piece's own intent line, from Case Studies.`,
        ),
      ],
      lists: [
        list(
          "Stage copy",
          page.workedExample.stages.map((stage) => stage.text),
          (index) => exampleStagePointer(page, index),
        ),
      ],
    }),
    toRecord({
      id: "scope-and-revisions",
      title: "Scope and revisions",
      summary: page.scope.heading,
      updatedAt,
      values: [
        field("Eyebrow", page.scope.eyebrow, howWeWork("scope", "eyebrow")),
        field("Heading", page.scope.heading, howWeWork("scope", "heading")),
        field("Body", page.scope.body, howWeWork("scope", "body")),
      ],
      lists: [
        list(
          "Topic titles",
          page.scope.topics.map((topic) => topic.title),
          (index) => howWeWork("scope", "topics", index, "title"),
        ),
        list(
          "Topic bodies",
          page.scope.topics.map((topic) => topic.body),
          (index) => howWeWork("scope", "topics", index, "body"),
        ),
      ],
    }),
    faqSection(
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
    closingCtaSection(page.closingCta, updatedAt, (...path) => howWeWork("closingCta", ...path)),
  ];
}

/** The worked example's five stages are keyed by the process step's approved title. */
function exampleStagePointer(page: HowWeWorkPage, index: number) {
  return exampleStages(page.workedExample.stages[index]?.stepTitle ?? "");
}

export function waysToWorkSections(
  page: WaysToWorkPage,
  updatedAt: Date | null,
): ReadonlyArray<CmsRecord> {
  return [
    toRecord({
      id: "hero",
      title: "Hero",
      summary: page.hero.heading,
      updatedAt,
      values: [
        field("Eyebrow", page.hero.eyebrow, waysToWork("hero", "eyebrow")),
        // Heading and body are the client's own, read from marketing.content.ts.
        field("Heading", page.hero.heading, waysToWorkHome("heading")),
        field("Body", page.hero.body, waysToWorkHome("body")),
        ...ctaFields("CTA", page.hero.cta, waysToWork("hero", "cta")),
      ],
    }),
    toRecord({
      id: "tier-comparison",
      title: "Tier comparison",
      summary: page.comparison.heading,
      updatedAt,
      values: [
        field("Eyebrow", page.comparison.eyebrow, waysToWork("comparison", "eyebrow")),
        field("Heading", page.comparison.heading, waysToWork("comparison", "heading")),
        field("Body", page.comparison.body, waysToWork("comparison", "body")),
        field("Caption", page.comparison.caption, waysToWork("comparison", "caption")),
        // The first two row labels are the brief's own field names and live in
        // marketing.content.ts; the other two were written for this table.
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
    }),
    toRecord({
      id: "how-to-choose",
      title: "How to choose",
      summary: page.howToChoose.heading,
      updatedAt,
      values: [
        field("Eyebrow", page.howToChoose.eyebrow, waysToWork("howToChoose", "eyebrow")),
        field("Heading", page.howToChoose.heading, waysToWork("howToChoose", "heading")),
        field("Body", page.howToChoose.body, waysToWork("howToChoose", "body")),
      ],
      lists: [
        list(
          "Questions",
          page.howToChoose.questions.map((entry) => entry.question),
          (index) => waysToWork("howToChoose", "questions", index, "question"),
        ),
        list(
          "Answers",
          page.howToChoose.questions.map((entry) => entry.answer),
          (index) => waysToWork("howToChoose", "questions", index, "answer"),
        ),
      ],
    }),
    toRecord({
      id: "scoping",
      title: "Scoping",
      summary: page.scoping.heading,
      updatedAt,
      values: [
        field("Eyebrow", page.scoping.eyebrow, waysToWork("scoping", "eyebrow")),
        field("Heading", page.scoping.heading, waysToWork("scoping", "heading")),
        field("Body", page.scoping.body, waysToWork("scoping", "body")),
      ],
      lists: [
        list(
          "Step titles",
          page.scoping.steps.map((step) => step.title),
          (index) => waysToWork("scoping", "steps", index, "title"),
        ),
        list(
          "Step bodies",
          page.scoping.steps.map((step) => step.body),
          (index) => waysToWork("scoping", "steps", index, "body"),
        ),
      ],
    }),
    faqSection(
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
    closingCtaSection(page.closingCta, updatedAt, (...path) => waysToWork("closingCta", ...path)),
  ];
}
