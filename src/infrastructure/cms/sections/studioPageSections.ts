import type { AboutPage } from "../../../domain/about/entities/AboutPage";
import type { CmsRecord } from "../../../domain/cms/entities/CmsRecord";
import type { ContactPage } from "../../../domain/contact/entities/ContactPage";
import type { SelectedWorkPage } from "../../../domain/portfolio/entities/SelectedWorkPage";
import { ctaFields, field, list, readOnly, readOnlyList, toRecord } from "../records";
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
import { closingCtaSection } from "./sharedSections";

/** Selected Work, About and Contact — the three pages with no shared FAQ block. */

export function selectedWorkSections(
  page: SelectedWorkPage,
  updatedAt: Date | null,
): ReadonlyArray<CmsRecord> {
  return [
    toRecord({
      id: "hero",
      title: "Hero",
      summary: page.hero.heading,
      updatedAt,
      values: [
        field("Eyebrow", page.hero.eyebrow, selectedWork("hero", "eyebrow")),
        // Heading and body are the client's own Selected Work copy, read from
        // marketing.content.ts so this page and the homepage cannot say it differently.
        field("Heading", page.hero.heading, workIntro("heading")),
        field("Body", page.hero.body, workIntro("body")),
        ...ctaFields("CTA", page.hero.cta, selectedWork("hero", "cta")),
      ],
    }),
    toRecord({
      id: "framing",
      title: "Framing",
      summary: page.framing.heading,
      updatedAt,
      values: [
        field("Eyebrow", page.framing.eyebrow, selectedWork("framing", "eyebrow")),
        field("Heading", page.framing.heading, selectedWork("framing", "heading")),
        field("Body", page.framing.body, selectedWork("framing", "body")),
      ],
    }),
    toRecord({
      id: "filters",
      title: "Filters",
      summary: page.filter.label,
      updatedAt,
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
    }),
    toRecord({
      id: "gallery",
      title: "Gallery",
      summary: page.gridLabel,
      updatedAt,
      values: [
        field("Grid label", page.gridLabel, selectedWork("gridLabel")),
        field("Status label", page.statusLabel, selectedWork("statusLabel")),
        field("Status explanation", page.statusExplanation, selectedWork("statusExplanation")),
      ],
    }),
    toRecord({
      id: "piece-detail",
      title: "Piece detail",
      summary: "Labels for the dialog a piece opens into.",
      updatedAt,
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
    }),
    toRecord({
      id: "progression",
      title: "Progression",
      summary: page.progression.heading,
      updatedAt,
      values: [
        field("Eyebrow", page.progression.eyebrow, selectedWork("progression", "eyebrow")),
        field("Heading", page.progression.heading, selectedWork("progression", "heading")),
        field("Body", page.progression.body, selectedWork("progression", "body")),
      ],
      lists: [
        // Each stage is a `stage(title, body, slugs)` call — arguments 0 and 1.
        list(
          "Stage titles",
          page.progression.stages.map((stage) => stage.title),
          (index) => selectedWork("progression", "stages", index, 0),
        ),
        list(
          "Stage bodies",
          page.progression.stages.map((stage) => stage.body),
          (index) => selectedWork("progression", "stages", index, 1),
        ),
      ],
    }),
    toRecord({
      id: "capability-links",
      title: "Capability links",
      summary: page.capabilityCrossLink.heading,
      updatedAt,
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
          `${READ_ONLY.spread} Capabilities are edited under Capabilities.`,
        ),
      ],
    }),
    closingCtaSection(page.closingCta, updatedAt, (...path) => selectedWork("closingCta", ...path)),
  ];
}

export function aboutSections(page: AboutPage, updatedAt: Date | null): ReadonlyArray<CmsRecord> {
  return [
    toRecord({
      id: "hero",
      title: "Hero",
      summary: page.hero.heading,
      updatedAt,
      values: [
        field("Eyebrow", page.hero.eyebrow, about("hero", "eyebrow")),
        // The About brief's own heading, kept in marketing.content.ts with the rest of
        // the client's words.
        field("Heading", page.hero.heading, aboutBlock("heading")),
        field("Body", page.hero.body, about("hero", "body")),
      ],
      media: { media: page.hero.media, altPointer: aboutMediaAlt("heroMedia") },
    }),
    toRecord({
      id: "belief",
      title: "Belief",
      summary: page.belief.statement,
      updatedAt,
      values: [
        field("Label", page.belief.label, about("belief", "label")),
        // The studio's central statement, quoted verbatim from the brief.
        field("Statement", page.belief.statement, aboutBlock("belief")),
      ],
    }),
    toRecord({
      id: "approach",
      title: "Approach",
      summary: page.approach.heading,
      updatedAt,
      values: [
        field("Eyebrow", page.approach.eyebrow, about("approach", "eyebrow")),
        field("Heading", page.approach.heading, about("approach", "heading")),
        field("Intro", page.approach.intro, aboutBlock("approach")),
        field("Practice label", page.approach.practiceLabel, about("approach", "practiceLabel")),
      ],
      lists: [
        list(
          "Claim titles",
          page.approach.claims.map((claim) => claim.title),
          (index) => about("approach", "claims", index, "title"),
        ),
        list(
          "Claims",
          page.approach.claims.map((claim) => claim.claim),
          (index) => about("approach", "claims", index, "claim"),
        ),
        list(
          "In practice",
          page.approach.claims.map((claim) => claim.practice),
          (index) => about("approach", "claims", index, "practice"),
        ),
        // Each claim's image is its own top-level constant in about.content.ts, in the
        // order the claims are written.
        list(
          "Claim alt text",
          page.approach.claims.map((claim) => claim.media.alt),
          (index) => aboutMediaAlt(CLAIM_MEDIA_CONSTANTS[index] ?? ""),
        ),
      ],
    }),
    toRecord({
      id: "inputs",
      title: "Inputs",
      summary: page.inputs.heading,
      updatedAt,
      values: [
        field("Eyebrow", page.inputs.eyebrow, about("inputs", "eyebrow")),
        field("Heading", page.inputs.heading, about("inputs", "heading")),
        field("Body", page.inputs.body, about("inputs", "body")),
      ],
      lists: [
        list(
          "Panel names",
          page.inputs.inputs.map((input) => input.name),
          (index) => about("inputs", "inputs", index, "name"),
        ),
        list(
          "Contributes",
          page.inputs.inputs.map((input) => input.contributes),
          (index) => about("inputs", "inputs", index, "contributes"),
        ),
        list(
          "Stops at",
          page.inputs.inputs.map((input) => input.stops),
          (index) => about("inputs", "inputs", index, "stops"),
        ),
      ],
    }),
    toRecord({
      id: "building",
      title: "Building",
      summary: page.building.heading,
      updatedAt,
      values: [
        field("Eyebrow", page.building.eyebrow, about("building", "eyebrow")),
        field("Heading", page.building.heading, about("building", "heading")),
        field("Body", page.building.body, about("building", "body")),
        field("Caveat", page.building.caveat, about("building", "caveat")),
      ],
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
        list(
          "Stage bodies",
          page.building.stages.map((stage) => stage.body),
          (index) => about("building", "stages", index, "body"),
        ),
      ],
    }),
    toRecord({
      id: "ecosystem",
      title: "Part of Famysys",
      summary: page.ecosystem.heading,
      updatedAt,
      values: [
        field("Eyebrow", page.ecosystem.eyebrow, about("ecosystem", "eyebrow")),
        field("Heading", page.ecosystem.heading, about("ecosystem", "heading")),
        ...ctaFields("Link", page.ecosystem.link, about("ecosystem", "link")),
      ],
      lists: [
        // The first paragraph is the brief's own sentence, read from marketing.content.ts;
        // the rest were written for this page. Both are addressed by position in the array.
        list("Paragraphs", page.ecosystem.paragraphs, (index) =>
          index === 0 ? aboutBlock("ecosystem") : about("ecosystem", "paragraphs", index),
        ),
      ],
      media: { media: page.ecosystem.media, altPointer: aboutMediaAlt("ecosystemMedia") },
    }),
    toRecord({
      id: "direction",
      title: "Where we are going",
      summary: page.direction.heading,
      updatedAt,
      values: [
        field("Eyebrow", page.direction.eyebrow, about("direction", "eyebrow")),
        field("Heading", page.direction.heading, about("direction", "heading")),
        field("Ambition label", page.direction.ambitionLabel, about("direction", "ambitionLabel")),
        field("Ambition", page.direction.ambition, aboutBlock("ambition")),
        field("Present label", page.direction.presentLabel, about("direction", "presentLabel")),
        field("Present", page.direction.present, aboutBlock("startingDeliberately")),
      ],
      media: { media: page.direction.media, altPointer: aboutMediaAlt("directionMedia") },
    }),
    closingCtaSection(page.closingCta, updatedAt, (...path) => about("closingCta", ...path)),
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
  return [
    toRecord({
      id: "hero",
      title: "Hero",
      summary: page.hero.heading,
      updatedAt,
      values: [
        field("Eyebrow", page.hero.eyebrow, contact("hero", "eyebrow")),
        field("Heading", page.hero.heading, contact("hero", "heading")),
        field("Body", page.hero.body, contact("hero", "body")),
      ],
    }),
    toRecord({
      id: "form",
      title: "Form",
      summary: page.form.heading,
      updatedAt,
      values: [
        field("Heading", page.form.heading, contact("form", "heading")),
        field("Submit label", page.form.submitLabel, contact("form", "submitLabel")),
        field("Submitting label", page.form.submittingLabel, contact("form", "submittingLabel")),
        field(
          "Select placeholder",
          page.form.selectPlaceholder,
          contact("form", "selectPlaceholder"),
        ),
        field("Optional suffix", page.form.optionalSuffix, contact("form", "optionalSuffix")),
        field(
          "Confirmation heading",
          page.form.confirmationHeading,
          contact("form", "confirmationHeading"),
        ),
        field("Confirmation body", page.form.confirmationBody, contact("form", "confirmationBody")),
        field("Submit error", page.form.submitErrorMessage, contact("form", "submitErrorMessage")),
      ],
      lists: [
        // The eight field labels, in the order the form renders them. Keyed by name in the
        // content file, so the pointer is the key rather than the position.
        list("Field labels", Object.values(page.form.labels), (index) =>
          contact("form", "labels", FORM_LABEL_KEYS[index] ?? ""),
        ),
      ],
    }),
    toRecord({
      id: "next-steps",
      title: "Next steps",
      summary: page.panel.heading,
      updatedAt,
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
      lists: [
        list(
          "Step headings",
          page.panel.steps.map((step) => step.heading),
          (index) => contact("panel", "steps", index, "heading"),
        ),
        list(
          "Step bodies",
          page.panel.steps.map((step) => step.body),
          (index) => contact("panel", "steps", index, "body"),
        ),
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
