import type { CmsRecord } from "../../../domain/cms/entities/CmsRecord";
import type { MarketingContent } from "../marketingContent";
import { ctaFields, field, list, readOnly, readOnlyList, toRecord } from "../records";
import {
  READ_ONLY,
  differentiator,
  footer,
  hero,
  homeClosingCta,
  mosaicTiles,
  processHome,
  waysToWorkHome,
  whatWeDo,
  whyFamysys,
  workIntro,
} from "../pointers";

/**
 * A SECTION IS A BLOCK OF A PAGE'S OWN COPY.
 *
 * Blocks that render a COLLECTION are not repeated here — the six capabilities under
 * "What We Do" and the eight pieces under "Selected Work" have their own screens, and
 * listing them twice would give an editor two places to change one thing. What the
 * section carries instead is the copy around them: the heading, the body, the CTA.
 *
 * Every string on this page is the client's own, from the V1 Homepage Content Brief. The
 * interface marks each one approved and warns before an edit, which is the whole reason
 * that mark exists.
 */
export function homeSections(
  homepage: MarketingContent,
  updatedAt: Date | null,
): ReadonlyArray<CmsRecord> {
  return [
    toRecord({
      id: "hero",
      title: "Hero",
      summary: homepage.hero.heading,
      updatedAt,
      values: [
        field("Heading", homepage.hero.heading, hero("heading")),
        field("Body", homepage.hero.body, hero("body")),
        field("Supporting line", homepage.hero.supportingLine, hero("supportingLine")),
        ...ctaFields("Primary CTA", homepage.hero.primaryCta, hero("primaryCta")),
        ...ctaFields("Secondary CTA", homepage.hero.secondaryCta, hero("secondaryCta")),
      ],
      lists: [
        // The mosaic's alt text, which is the only copy in it — the eight file names are
        // built from `MOSAIC_TILES[i].file` and are not strings a reader ever meets.
        list(
          "Mosaic alt text",
          homepage.hero.mosaicTiles.map((tile) => tile.alt),
          (index) => mosaicTiles(index, "alt"),
        ),
      ],
    }),
    toRecord({
      id: "what-we-do",
      title: "What We Do",
      summary: homepage.whatWeDo.intro.heading,
      updatedAt,
      values: [
        field("Eyebrow", homepage.whatWeDo.intro.eyebrow, whatWeDo("intro", "eyebrow")),
        field("Heading", homepage.whatWeDo.intro.heading, whatWeDo("intro", "heading")),
        field("Body", homepage.whatWeDo.intro.body, whatWeDo("intro", "body")),
        ...ctaFields("CTA", homepage.whatWeDo.cta, whatWeDo("cta")),
      ],
    }),
    toRecord({
      id: "differentiator",
      title: "Differentiator",
      summary: homepage.differentiator.heading,
      updatedAt,
      values: [
        field("Heading", homepage.differentiator.heading, differentiator("heading")),
        field("Lead-in", homepage.differentiator.leadIn, differentiator("leadIn")),
        field("Body", homepage.differentiator.body, differentiator("body")),
        field(
          "Closing statement",
          homepage.differentiator.closingStatement,
          differentiator("closingStatement"),
        ),
      ],
      lists: [
        list(
          "Element titles",
          homepage.differentiator.elements.map((item) => item.title),
          (index) => differentiator("elements", index, "title"),
        ),
        list(
          "Element descriptions",
          homepage.differentiator.elements.map((item) => item.description),
          (index) => differentiator("elements", index, "description"),
        ),
        list(
          "Element alt text",
          homepage.differentiator.elements.map((item) => item.media.alt),
          // `differentiatorImage(file, alt)` — the alt is argument 1.
          (index) => differentiator("elements", index, "media", 1),
        ),
      ],
    }),
    toRecord({
      id: "how-we-work",
      title: "How We Work",
      summary: homepage.process.heading,
      updatedAt,
      values: [field("Heading", homepage.process.heading, processHome("heading"))],
      lists: [
        readOnlyList(
          "Steps",
          homepage.process.steps.map((step) => step.title),
          `${READ_ONLY.spread} Steps are edited under Process Steps.`,
        ),
      ],
    }),
    toRecord({
      id: "ways-to-work",
      title: "Ways to Work",
      summary: homepage.waysToWork.heading,
      updatedAt,
      values: [
        field("Heading", homepage.waysToWork.heading, waysToWorkHome("heading")),
        field("Body", homepage.waysToWork.body, waysToWorkHome("body")),
      ],
      lists: [
        readOnlyList(
          "Tiers",
          [...homepage.waysToWork.tiers.map((tier) => tier.name), homepage.waysToWork.custom.name],
          `${READ_ONLY.spread} Engagements are edited under Engagement Tiers.`,
        ),
      ],
    }),
    toRecord({
      id: "selected-work",
      title: "Selected Work",
      summary: homepage.workIntro.heading,
      updatedAt,
      values: [
        field("Eyebrow", homepage.workIntro.eyebrow, workIntro("eyebrow")),
        field("Heading", homepage.workIntro.heading, workIntro("heading")),
        field("Body", homepage.workIntro.body, workIntro("body")),
      ],
    }),
    toRecord({
      id: "why-famysys",
      title: "Why Famysys",
      summary: homepage.whyFamysys.heading,
      updatedAt,
      values: [
        field("Heading", homepage.whyFamysys.heading, whyFamysys("heading")),
        field("Body", homepage.whyFamysys.body, whyFamysys("body")),
      ],
      lists: [
        list(
          "Reason titles",
          homepage.whyFamysys.reasons.map((reason) => reason.title),
          (index) => whyFamysys("reasons", index, "title"),
        ),
        list(
          "Reason descriptions",
          homepage.whyFamysys.reasons.map((reason) => reason.description),
          (index) => whyFamysys("reasons", index, "description"),
        ),
        list(
          "Reason alt text",
          homepage.whyFamysys.reasons.map((reason) => reason.media.alt),
          // `reasonImage(file, alt)` — the alt is argument 1.
          (index) => whyFamysys("reasons", index, "media", 1),
        ),
      ],
    }),
    toRecord({
      id: "faq",
      title: "FAQ",
      summary: "The one FAQ block, shared with three inner pages.",
      updatedAt,
      lists: [
        // Read-only here even though marketing.content.ts is where the block lives: a
        // question is one record with an answer attached, and splitting it across two
        // screens would let the two halves be edited apart from each other.
        readOnlyList(
          "Questions",
          homepage.faq.items.map((item) => item.question),
          "Questions and answers are edited together under FAQ.",
        ),
      ],
    }),
    toRecord({
      id: "closing-cta",
      title: "Closing CTA",
      summary: homepage.closingCta.heading,
      updatedAt,
      values: [
        field("Heading", homepage.closingCta.heading, homeClosingCta("heading")),
        field("Body", homepage.closingCta.body, homeClosingCta("body")),
        field("Closing line", homepage.closingCta.closingLine, homeClosingCta("closingLine")),
        ...ctaFields("CTA", homepage.closingCta.cta, homeClosingCta("cta")),
      ],
    }),
    toRecord({
      id: "footer",
      title: "Footer",
      // Site-wide, but its copy lives in the homepage's content file, so this is where an
      // editor would go looking for it. Listing it under Home is honest about that.
      summary: "Site-wide. Rendered on all seven pages.",
      updatedAt,
      values: [
        field("Tagline", homepage.footer.tagline, footer("tagline")),
        field("Contact email", homepage.footer.contactEmail, footer("contactEmail")),
        readOnly(
          "Legal links",
          String(homepage.footer.legalLinks.length),
          "Deliberately empty: no privacy policy or terms document exists yet, and a link to a document that does not exist is worse than no link. Adding one is a structural change, not an edit.",
        ),
        readOnly(
          "Social links",
          String(homepage.footer.socialLinks.length),
          "Deliberately empty: the brief supplies no social handles. Adding one is a structural change, not an edit.",
        ),
      ],
    }),
  ];
}
