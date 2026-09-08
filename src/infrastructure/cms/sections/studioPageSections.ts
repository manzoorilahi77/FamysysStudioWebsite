import type { AboutPage } from "../../../domain/about/entities/AboutPage";
import type { CmsRecord } from "../../../domain/cms/entities/CmsRecord";
import type { ContactPage } from "../../../domain/contact/entities/ContactPage";
import type { SelectedWorkPage } from "../../../domain/portfolio/entities/SelectedWorkPage";
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
  about,
  aboutBlock,
  aboutMediaAlt,
  contact,
  footer,
  homeClosingCta,
  selectedWork,
  workIntro,
} from "../pointers";
import type { SectionCards } from "./cards";
import { closingCtaSection, sectionAddress } from "./sharedSections";

/** Selected Work, About and Contact — the three pages with no shared FAQ block. */

export function selectedWorkSections(
  page: SelectedWorkPage,
  cards: SectionCards,
  updatedAt: Date | null,
): ReadonlyArray<CmsRecord> {
  const at = (sectionId: string) => sectionAddress("selected-work", sectionId);

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
            field("Eyebrow", page.hero.eyebrow, selectedWork("hero", "eyebrow")),
            // Heading and body are the client's own Selected Work copy, read from
            // marketing.content.ts so this page and the homepage cannot say it differently.
            field("Heading", page.hero.heading, workIntro("heading")),
            paragraph("Body", page.hero.body, workIntro("body")),
            ...ctaFields("CTA", page.hero.cta, selectedWork("hero", "cta")),
          ],
        },
      ],
    }),
    toRecord({
      id: "framing",
      title: "Framing",
      summary: page.framing.heading,
      updatedAt,
      address: at("framing"),
      groups: [
        {
          label: "Copy",
          values: [
            field("Eyebrow", page.framing.eyebrow, selectedWork("framing", "eyebrow")),
            field("Heading", page.framing.heading, selectedWork("framing", "heading")),
            paragraph("Body", page.framing.body, selectedWork("framing", "body")),
          ],
        },
      ],
    }),
    toRecord({
      id: "filters",
      title: "Filters",
      summary: page.filter.label,
      updatedAt,
      address: at("filters"),
      groups: [
        {
          label: "Labels",
          values: [
            field("Label", page.filter.label, selectedWork("filter", "label")),
            field("All label", page.filter.allLabel, selectedWork("filter", "allLabel")),
          ],
          lists: [
            readOnlyList(
              "Categories",
              page.filter.categories.map((category) => `${category.title} (${category.count})`),
              "Derived: a capability becomes a filter because a piece exercises it, and the number is how many do.",
            ),
          ],
        },
      ],
    }),
    toRecord({
      id: "gallery",
      title: "Gallery",
      summary: page.gridLabel,
      updatedAt,
      address: at("gallery"),
      groups: [
        {
          label: "Labels",
          values: [
            field("Grid label", page.gridLabel, selectedWork("gridLabel")),
            field("Status label", page.statusLabel, selectedWork("statusLabel")),
            paragraph(
              "Status explanation",
              page.statusExplanation,
              selectedWork("statusExplanation"),
            ),
          ],
        },
      ],
      items: [
        {
          label: "Pieces",
          collectionId: "case-studies",
          description:
            "The eight planned pieces. None has been produced yet — every title and description is the planned brief and every cover is a placeholder, which is why a ninth cannot be added here: it needs two covers, a reference and its capability links before it renders as anything.",
          records: cards.caseStudies,
        },
      ],
    }),
    toRecord({
      id: "piece-detail",
      title: "Piece detail",
      summary: "Labels for the dialog a piece opens into.",
      updatedAt,
      address: at("piece-detail"),
      groups: [
        {
          label: "Labels",
          values: [
            field(
              "Demonstrates label",
              page.detail.demonstratesLabel,
              selectedWork("detail", "demonstratesLabel"),
            ),
            field("Why label", page.detail.whyLabel, selectedWork("detail", "whyLabel")),
            field(
              "Capabilities label",
              page.detail.capabilitiesLabel,
              selectedWork("detail", "capabilitiesLabel"),
            ),
            field(
              "Media slot label",
              page.detail.mediaSlotLabel,
              selectedWork("detail", "mediaSlotLabel"),
            ),
            field("Close label", page.detail.closeLabel, selectedWork("detail", "closeLabel")),
          ],
        },
      ],
    }),
    toRecord({
      id: "progression",
      title: "Progression",
      summary: page.progression.heading,
      updatedAt,
      address: at("progression"),
      groups: [
        {
          label: "Copy",
          values: [
            field("Eyebrow", page.progression.eyebrow, selectedWork("progression", "eyebrow")),
            field("Heading", page.progression.heading, selectedWork("progression", "heading")),
            paragraph("Body", page.progression.body, selectedWork("progression", "body")),
          ],
        },
        {
          label: "Stages",
          lists: [
            // Each stage is a `stage(title, body, slugs)` call — arguments 0 and 1.
            list(
              "Stage titles",
              page.progression.stages.map((stage) => stage.title),
              (index) => selectedWork("progression", "stages", index, 0),
            ),
            {
              ...list(
                "Stage bodies",
                page.progression.stages.map((stage) => stage.body),
                (index) => selectedWork("progression", "stages", index, 1),
              ),
              multiline: true,
            },
          ],
        },
      ],
    }),
    toRecord({
      id: "capability-links",
      title: "Capability links",
      summary: page.capabilityCrossLink.heading,
      updatedAt,
      address: at("capability-links"),
      groups: [
        {
          label: "Copy",
          values: [
            field(
              "Eyebrow",
              page.capabilityCrossLink.eyebrow,
              selectedWork("capabilityCrossLink", "eyebrow"),
            ),
            field(
              "Heading",
              page.capabilityCrossLink.heading,
              selectedWork("capabilityCrossLink", "heading"),
            ),
          ],
          lists: [
            readOnlyList(
              "Links",
              page.capabilityCrossLink.links.map((link) => link.title),
              `${READ_ONLY.spread} The capabilities are edited on the Creative Services page.`,
            ),
          ],
        },
      ],
    }),
    closingCtaSection("selected-work", page.closingCta, updatedAt, (...path) =>
      selectedWork("closingCta", ...path),
    ),
  ];
}

export function aboutSections(page: AboutPage, updatedAt: Date | null): ReadonlyArray<CmsRecord> {
  const at = (sectionId: string) => sectionAddress("about", sectionId);

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
            field("Eyebrow", page.hero.eyebrow, about("hero", "eyebrow")),
            // The About brief's own heading, kept in marketing.content.ts with the rest of
            // the client's words.
            field("Heading", page.hero.heading, aboutBlock("heading")),
            paragraph("Body", page.hero.body, about("hero", "body")),
          ],
        },
        {
          label: "Image",
          media: [media("Hero image", page.hero.media, aboutMediaAlt("heroMedia"))],
        },
      ],
    }),
    toRecord({
      id: "belief",
      title: "Belief",
      summary: page.belief.statement,
      updatedAt,
      address: at("belief"),
      groups: [
        {
          label: "Copy",
          values: [
            field("Label", page.belief.label, about("belief", "label")),
            // The studio's central statement, quoted verbatim from the brief.
            paragraph("Statement", page.belief.statement, aboutBlock("belief")),
          ],
        },
      ],
    }),
    toRecord({
      id: "approach",
      title: "Approach",
      summary: page.approach.heading,
      updatedAt,
      address: at("approach"),
      groups: [
        {
          label: "Copy",
          values: [
            field("Eyebrow", page.approach.eyebrow, about("approach", "eyebrow")),
            field("Heading", page.approach.heading, about("approach", "heading")),
            paragraph("Intro", page.approach.intro, aboutBlock("approach")),
            field("Practice label", page.approach.practiceLabel, about("approach", "practiceLabel")),
          ],
        },
        {
          label: "Claims",
          description: "Three panels, each a title, a claim, what it looks like in practice.",
          lists: [
            list(
              "Claim titles",
              page.approach.claims.map((claim) => claim.title),
              (index) => about("approach", "claims", index, "title"),
            ),
            {
              ...list(
                "Claims",
                page.approach.claims.map((claim) => claim.claim),
                (index) => about("approach", "claims", index, "claim"),
              ),
              multiline: true,
            },
            {
              ...list(
                "In practice",
                page.approach.claims.map((claim) => claim.practice),
                (index) => about("approach", "claims", index, "practice"),
              ),
              multiline: true,
            },
            // Each claim's image is its own top-level constant in about.content.ts, in the
            // order the claims are written.
            list(
              "Claim alt text",
              page.approach.claims.map((claim) => claim.media.alt),
              (index) => aboutMediaAlt(CLAIM_MEDIA_CONSTANTS[index] ?? ""),
            ),
          ],
        },
      ],
    }),
    toRecord({
      id: "inputs",
      title: "Inputs",
      summary: page.inputs.heading,
      updatedAt,
      address: at("inputs"),
      groups: [
        {
          label: "Copy",
          values: [
            field("Eyebrow", page.inputs.eyebrow, about("inputs", "eyebrow")),
            field("Heading", page.inputs.heading, about("inputs", "heading")),
            paragraph("Body", page.inputs.body, about("inputs", "body")),
          ],
        },
        {
          label: "Panels",
          lists: [
            list(
              "Panel names",
              page.inputs.inputs.map((input) => input.name),
              (index) => about("inputs", "inputs", index, "name"),
            ),
            {
              ...list(
                "Contributes",
                page.inputs.inputs.map((input) => input.contributes),
                (index) => about("inputs", "inputs", index, "contributes"),
              ),
              multiline: true,
            },
            {
              ...list(
                "Stops at",
                page.inputs.inputs.map((input) => input.stops),
                (index) => about("inputs", "inputs", index, "stops"),
              ),
              multiline: true,
            },
          ],
        },
      ],
    }),
    toRecord({
      id: "building",
      title: "Building",
      summary: page.building.heading,
      updatedAt,
      address: at("building"),
      groups: [
        {
          label: "Copy",
          values: [
            field("Eyebrow", page.building.eyebrow, about("building", "eyebrow")),
            field("Heading", page.building.heading, about("building", "heading")),
            paragraph("Body", page.building.body, about("building", "body")),
            paragraph("Caveat", page.building.caveat, about("building", "caveat")),
          ],
        },
        {
          label: "Stages",
          lists: [
            list(
              "Stage titles",
              page.building.stages.map((stage) => stage.title),
              (index) => about("building", "stages", index, "title"),
            ),
            list(
              "Stage statuses",
              page.building.stages.map((stage) => stage.status),
              (index) => about("building", "stages", index, "status"),
            ),
            {
              ...list(
                "Stage bodies",
                page.building.stages.map((stage) => stage.body),
                (index) => about("building", "stages", index, "body"),
              ),
              multiline: true,
            },
          ],
        },
      ],
    }),
    toRecord({
      id: "ecosystem",
      title: "Part of Famysys",
      summary: page.ecosystem.heading,
      updatedAt,
      address: at("ecosystem"),
      groups: [
        {
          label: "Copy",
          values: [
            field("Eyebrow", page.ecosystem.eyebrow, about("ecosystem", "eyebrow")),
            field("Heading", page.ecosystem.heading, about("ecosystem", "heading")),
            ...ctaFields("Link", page.ecosystem.link, about("ecosystem", "link")),
          ],
          lists: [
            // The first paragraph is the brief's own sentence, read from
            // marketing.content.ts; the rest were written for this page. Both are
            // addressed by position in the array.
            {
              ...list("Paragraphs", page.ecosystem.paragraphs, (index) =>
                index === 0 ? aboutBlock("ecosystem") : about("ecosystem", "paragraphs", index),
              ),
              multiline: true,
            },
          ],
        },
        {
          label: "Image",
          media: [media("Section image", page.ecosystem.media, aboutMediaAlt("ecosystemMedia"))],
        },
      ],
    }),
    toRecord({
      id: "direction",
      title: "Where we are going",
      summary: page.direction.heading,
      updatedAt,
      address: at("direction"),
      groups: [
        {
          label: "Copy",
          values: [
            field("Eyebrow", page.direction.eyebrow, about("direction", "eyebrow")),
            field("Heading", page.direction.heading, about("direction", "heading")),
            field(
              "Ambition label",
              page.direction.ambitionLabel,
              about("direction", "ambitionLabel"),
            ),
            paragraph("Ambition", page.direction.ambition, aboutBlock("ambition")),
            field("Present label", page.direction.presentLabel, about("direction", "presentLabel")),
            paragraph("Present", page.direction.present, aboutBlock("startingDeliberately")),
          ],
        },
        {
          label: "Image",
          media: [media("Section image", page.direction.media, aboutMediaAlt("directionMedia"))],
        },
      ],
    }),
    closingCtaSection("about", page.closingCta, updatedAt, (...path) =>
      about("closingCta", ...path),
    ),
  ];
}

/**
 * about.content.ts declares one `MediaRef` constant per approach claim, in the order the
 * claims are written. The list is stated rather than derived because nothing in the
 * rendered entity records which constant it came from — and a wrong name here would
 * rewrite the alt text of a different photograph.
 */
const CLAIM_MEDIA_CONSTANTS: ReadonlyArray<string> = ["creativeMedia", "workflowMedia", "aiMedia"];

export function contactSections(
  page: ContactPage,
  updatedAt: Date | null,
): ReadonlyArray<CmsRecord> {
  const at = (sectionId: string) => sectionAddress("contact", sectionId);

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
            field("Eyebrow", page.hero.eyebrow, contact("hero", "eyebrow")),
            field("Heading", page.hero.heading, contact("hero", "heading")),
            paragraph("Body", page.hero.body, contact("hero", "body")),
          ],
        },
      ],
    }),
    toRecord({
      id: "form",
      title: "Form",
      summary: page.form.heading,
      updatedAt,
      address: at("form"),
      groups: [
        {
          label: "Heading and buttons",
          values: [
            field("Heading", page.form.heading, contact("form", "heading")),
            field("Submit label", page.form.submitLabel, contact("form", "submitLabel")),
            field("Submitting label", page.form.submittingLabel, contact("form", "submittingLabel")),
          ],
        },
        {
          label: "Field labels",
          description: "The eight labels, in the order the form renders them.",
          values: [
            field(
              "Select placeholder",
              page.form.selectPlaceholder,
              contact("form", "selectPlaceholder"),
            ),
            field("Optional suffix", page.form.optionalSuffix, contact("form", "optionalSuffix")),
          ],
          lists: [
            // Keyed by name in the content file, so the pointer is the key rather than the
            // position.
            list("Field labels", Object.values(page.form.labels), (index) =>
              contact("form", "labels", FORM_LABEL_KEYS[index] ?? ""),
            ),
          ],
        },
        {
          label: "After sending",
          values: [
            field(
              "Confirmation heading",
              page.form.confirmationHeading,
              contact("form", "confirmationHeading"),
            ),
            paragraph(
              "Confirmation body",
              page.form.confirmationBody,
              contact("form", "confirmationBody"),
            ),
            paragraph(
              "Submit error",
              page.form.submitErrorMessage,
              contact("form", "submitErrorMessage"),
            ),
          ],
        },
      ],
    }),
    toRecord({
      id: "next-steps",
      title: "Next steps",
      summary: page.panel.heading,
      updatedAt,
      address: at("next-steps"),
      groups: [
        {
          label: "Copy",
          values: [
            field("Heading", page.panel.heading, contact("panel", "heading")),
            field("Direct eyebrow", page.panel.directEyebrow, contact("panel", "directEyebrow")),
            // Both are the client's own, reused from the homepage rather than restated here.
            field("Tagline", page.panel.tagline, footer("tagline")),
            field("Closing line", page.panel.closingLine, homeClosingCta("closingLine")),
            readOnly(
              "Direct contact",
              page.panel.direct.email ?? page.panel.direct.phone ?? "None supplied",
              "The studio's own email and phone are still to be supplied. Adding one is a structural change, not an edit — while both are absent the block does not render at all.",
            ),
          ],
        },
        {
          label: "Steps",
          lists: [
            list(
              "Step headings",
              page.panel.steps.map((step) => step.heading),
              (index) => contact("panel", "steps", index, "heading"),
            ),
            {
              ...list(
                "Step bodies",
                page.panel.steps.map((step) => step.body),
                (index) => contact("panel", "steps", index, "body"),
              ),
              multiline: true,
            },
          ],
        },
      ],
    }),
  ];
}

/** `ContactFormLabels`' keys, in declaration order — which is `Object.values`' order. */
const FORM_LABEL_KEYS: ReadonlyArray<string> = [
  "firstName",
  "lastName",
  "email",
  "companyName",
  "companyWebsite",
  "role",
  "companySize",
  "brief",
];
