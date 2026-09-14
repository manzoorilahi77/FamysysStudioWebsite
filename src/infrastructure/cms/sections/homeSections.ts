import type { CmsRecord } from "../../../domain/cms/entities/CmsRecord";
import type { MarketingContent } from "../marketingContent";
import { ctaFields, field, list, media, paragraph, readOnly, readOnlyList, toRecord } from "../records";
import {
  READ_ONLY,
  differentiator,
  footer,
  hero,
  homeClosingCta,
  heroBands,
  processHome,
  waysToWorkHome,
  whatWeDo,
  whyFamysys,
  workIntro,
} from "../pointers";
import type { SectionCards } from "./cards";

/**
 * THE HOMEPAGE, BLOCK BY BLOCK, IN THE ORDER IT READS.
 *
 * Fields are grouped the way a visitor meets them rather than the way they are stored: the
 * hero's two buttons sit between the sub-head and the supporting line here because that is
 * where they sit on the page, even though the supporting line is declared before them in
 * `heroContent`.
 *
 * Blocks that render a run of records carry those records, rather than naming them and
 * sending the editor somewhere else. The six capabilities under "What We Do" and the eight
 * pieces under "Selected Work" are the same records Creative Services and Selected Work
 * edit — one row each, one address each — so an edit here is that edit, wherever it is made.
 *
 * Every string on this page is the client's own, from the V1 Homepage Content Brief. The
 * interface marks each one approved and warns before an edit, which is the whole reason
 * that mark exists.
 */

/** Where a section says who owns it. `home:hero`, and so on. */
function at(sectionId: string) {
  return { kind: "page_section", key: `home:${sectionId}` } as const;
}

export function homeSections(
  homepage: MarketingContent,
  cards: SectionCards,
  updatedAt: Date | null,
): ReadonlyArray<CmsRecord> {
  return [
    toRecord({
      id: "hero",
      title: "Hero",
      summary: homepage.hero.heading,
      updatedAt,
      address: at("hero"),
      groups: [
        {
          label: "Headline",
          values: [
            field("Heading", homepage.hero.heading, hero("heading")),
            paragraph("Sub-head", homepage.hero.body, hero("body")),
          ],
        },
        {
          label: "Buttons",
          values: [
            ...ctaFields("Primary CTA", homepage.hero.primaryCta, hero("primaryCta")),
            ...ctaFields("Secondary CTA", homepage.hero.secondaryCta, hero("secondaryCta")),
          ],
        },
        {
          label: "Supporting line",
          description: "The line under the buttons.",
          values: [field("Supporting line", homepage.hero.supportingLine, hero("supportingLine"))],
        },
        {
          label: "Accordion bands",
          description:
            "The six bands beside the type. The numeral beside each label is the band's position, so that is not editable — the picture and its alt text are.",
          lists: [
            list(
              "Band labels",
              homepage.hero.bands.map((band) => band.label),
              (index) => heroBands(index, "label"),
            ),
          ],
          media: homepage.hero.bands.map((band, index) =>
            media(`Band ${index + 1} image`, band.media, heroBands(index, "alt")),
          ),
        },
      ],
    }),
    toRecord({
      id: "what-we-do",
      title: "What We Do",
      summary: homepage.whatWeDo.intro.heading,
      updatedAt,
      address: at("what-we-do"),
      groups: [
        {
          label: "Intro",
          values: [
            field("Eyebrow", homepage.whatWeDo.intro.eyebrow, whatWeDo("intro", "eyebrow")),
            field("Heading", homepage.whatWeDo.intro.heading, whatWeDo("intro", "heading")),
            paragraph("Body", homepage.whatWeDo.intro.body, whatWeDo("intro", "body")),
            ...ctaFields("CTA", homepage.whatWeDo.cta, whatWeDo("cta")),
          ],
        },
      ],
      items: [
        {
          label: "Capabilities",
          collectionId: "capabilities",
          description:
            "The grid under the intro. The same six records Creative Services renders in full — this page shows the title and descriptor of each, so an edit to either is one edit to one record.",
          records: cards.capabilities,
        },
      ],
    }),
    toRecord({
      id: "differentiator",
      title: "The Differentiator",
      summary: homepage.differentiator.heading,
      updatedAt,
      address: at("differentiator"),
      groups: [
        {
          label: "Copy",
          values: [
            field("Heading", homepage.differentiator.heading, differentiator("heading")),
            paragraph("Lead-in", homepage.differentiator.leadIn, differentiator("leadIn")),
            paragraph("Body", homepage.differentiator.body, differentiator("body")),
            paragraph(
              "Closing statement",
              homepage.differentiator.closingStatement,
              differentiator("closingStatement"),
            ),
          ],
        },
        {
          label: "Elements",
          description: "The three panels, in the order they appear.",
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
          ],
          // `differentiatorImage(file, alt)` — the alt is argument 1.
          media: homepage.differentiator.elements.map((item, index) =>
            media(`Element ${index + 1} image`, item.media, differentiator("elements", index, "media", 1)),
          ),
        },
      ],
    }),
    toRecord({
      id: "how-we-work",
      title: "How We Work",
      summary: homepage.process.heading,
      updatedAt,
      address: at("how-we-work"),
      groups: [
        {
          label: "Copy",
          values: [
            field("Heading", homepage.process.heading, processHome("heading")),
            field("Reveal button", homepage.process.revealLabel, processHome("revealLabel")),
          ],
          lists: [
            readOnlyList(
              "Steps",
              homepage.process.steps.map((step) => step.title),
              `${READ_ONLY.spread} The stages are edited on the How We Work page, which renders them in full — and so are the PHOTOGRAPHS this section shows beside them, which is why there is no image field on this screen.`,
              "/admin/pages/how-we-work/process-steps",
              "Edited on the How We Work page, with its photograph.",
            ),
          ],
        },
      ],
    }),
    toRecord({
      id: "ways-to-work",
      title: "Ways to Work With Us",
      summary: homepage.waysToWork.heading,
      updatedAt,
      address: at("ways-to-work"),
      groups: [
        {
          label: "Copy",
          values: [
            field("Heading", homepage.waysToWork.heading, waysToWorkHome("heading")),
            paragraph("Body", homepage.waysToWork.body, waysToWorkHome("body")),
            field("Open button", homepage.waysToWork.openLabel, waysToWorkHome("openLabel")),
            field("Close button", homepage.waysToWork.closeLabel, waysToWorkHome("closeLabel")),
          ],
          lists: [
            readOnlyList(
              "Tiers",
              [
                ...homepage.waysToWork.tiers.map((tier) => tier.name),
                homepage.waysToWork.custom.name,
              ],
              `${READ_ONLY.spread} The engagements are edited on the Ways to Work With Us page, which renders them in full — and so are the PHOTOGRAPHS on these tiles, which is why there is no image field on this screen.`,
              "/admin/pages/ways-to-work-with-us/engagement-tiers",
              "Edited on the Ways to Work With Us page, with its photograph.",
            ),
          ],
        },
      ],
    }),
    toRecord({
      id: "selected-work",
      title: "Selected Work",
      summary: homepage.workIntro.heading,
      updatedAt,
      address: at("selected-work"),
      groups: [
        {
          label: "Intro",
          values: [
            field("Eyebrow", homepage.workIntro.eyebrow, workIntro("eyebrow")),
            field("Heading", homepage.workIntro.heading, workIntro("heading")),
            paragraph("Body", homepage.workIntro.body, workIntro("body")),
          ],
        },
      ],
      items: [
        {
          label: "Pieces",
          collectionId: "case-studies",
          description:
            "The covers under the intro. The same eight records Selected Work renders — note that the homepage shows a different photograph of each, which is why every piece carries two alt texts.",
          records: cards.caseStudies,
        },
      ],
    }),
    toRecord({
      id: "why-famysys",
      title: "Why Famysys",
      summary: homepage.whyFamysys.heading,
      updatedAt,
      address: at("why-famysys"),
      groups: [
        {
          label: "Copy",
          values: [
            field("Heading", homepage.whyFamysys.heading, whyFamysys("heading")),
            paragraph("Body", homepage.whyFamysys.body, whyFamysys("body")),
          ],
        },
        {
          label: "Reasons",
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
          ],
          // `reasonImage(file, alt)` — the alt is argument 1.
          media: homepage.whyFamysys.reasons.map((reason, index) =>
            media(`Reason ${index + 1} image`, reason.media, whyFamysys("reasons", index, "media", 1)),
          ),
        },
      ],
    }),
    toRecord({
      id: "faq",
      title: "FAQ",
      summary: "The block that defines the shared questions.",
      updatedAt,
      address: at("faq"),
      items: [
        {
          label: "Questions",
          collectionId: "faq",
          description:
            "The shared questions. Every one is printed on /faq, grouped and open; Creative Services, How We Work and Ways to Work each add a question or two of their own there and point at the page from where their FAQ sections stood. An answer edited here is the answer /faq prints.",
          records: cards.faq,
        },
      ],
    }),
    toRecord({
      id: "closing-cta",
      title: "Final CTA",
      summary: homepage.closingCta.heading,
      updatedAt,
      address: at("closing-cta"),
      groups: [
        {
          label: "Copy",
          values: [
            field("Heading", homepage.closingCta.heading, homeClosingCta("heading")),
            paragraph("Body", homepage.closingCta.body, homeClosingCta("body")),
            field("Closing line", homepage.closingCta.closingLine, homeClosingCta("closingLine")),
            ...ctaFields("CTA", homepage.closingCta.cta, homeClosingCta("cta")),
          ],
        },
      ],
    }),
    toRecord({
      id: "footer",
      title: "Footer",
      // Site-wide, but its copy lives in the homepage's content file, so this is where an
      // editor would go looking for it. Listing it under Home is honest about that, and
      // publishing it regenerates all seven pages — see `SITE_WIDE` in routes.ts.
      summary: "Site-wide. Rendered on all seven pages.",
      updatedAt,
      address: at("footer"),
      groups: [
        {
          label: "Copy",
          values: [
            field("Tagline", homepage.footer.tagline, footer("tagline")),
            field("Contact email", homepage.footer.contactEmail, footer("contactEmail")),
          ],
        },
        {
          label: "Fixed for now",
          description:
            "What the footer prints or lists that is not editable here — each for a reason worth reading before asking for it to change.",
          values: [
            readOnly(
              "Postal address",
              homepage.footer.addressLines?.join(", ") ?? "Not shown",
              "Printed under the wordmark on all seven pages, as supplied. It is read-only here because an address is the one piece of footer content a reader may act on physically — post, couriers, a visit — so a typo is a wrong claim about where the business is rather than a wording change. One open question: famysys.com prints this address with ZIP 77407 and the wording supplied for the Studio reads 77447. Confirm which is right.",
            ),
            readOnly(
              "Legal links",
              String(homepage.footer.legalLinks.length),
              "Terms & Conditions, Privacy Policy and FAQ, and all three are pages now. The two legal documents are drafted against famysys.com's own and marked for legal review — they are not editable here, deliberately; see docs/content-todo.md. FAQ gathers every question on the site, whose answers ARE edited here, under the FAQ section above and the three inner pages' own.",
            ),
            readOnly(
              "Social links",
              String(homepage.footer.socialLinks.length),
              "LinkedIn opens the company page in a new tab. Instagram and YouTube have no account yet, so each opens a small 'coming soon' dialog naming the network instead of going nowhere. Supply a handle and that network becomes a link — a structural change, not an edit.",
            ),
            readOnly(
              "Capability deck",
              homepage.footer.capabilityDeck.label,
              "Printed beside the email on every page, on the footer's last line with the copyright. There is no file yet, so pressing it opens a dialog saying the deck is being prepared rather than downloading nothing. Supplying the URL makes it a link that opens in a new tab — a structural change, not an edit.",
            ),
            readOnly(
              "Coming-soon dialog",
              `${homepage.footer.socialPending.eyebrow} — ${homepage.footer.socialPending.body}`,
              "What the dialog behind Instagram and YouTube says. One copy serves both; the dialog prints the network's own name as its heading. Drafted, pending approval.",
            ),
          ],
        },
      ],
    }),
  ];
}
