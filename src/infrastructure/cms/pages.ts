import type { AboutPage } from "../../domain/about/entities/AboutPage";
import type { CmsPage } from "../../domain/cms/entities/CmsPage";
import type { CmsRecord } from "../../domain/cms/entities/CmsRecord";
import type { ContactPage } from "../../domain/contact/entities/ContactPage";
import type { WaysToWorkPage } from "../../domain/engagement/entities/WaysToWorkPage";
import type { CaseStudy } from "../../domain/portfolio/entities/CaseStudy";
import type { SelectedWorkPage } from "../../domain/portfolio/entities/SelectedWorkPage";
import type { HowWeWorkPage } from "../../domain/process/entities/HowWeWorkPage";
import type { CreativeServicesPage } from "../../domain/services/entities/CreativeServicesPage";
import { orderSections } from "./composition";
import { CONTENT_FILE, contentModifiedAt } from "./contentSources";
import { seoSection } from "./sections/seoSection";
import {
  capabilityCards,
  caseStudyCards,
  customPartnershipCard,
  engagementTierCards,
  faqCards,
  processStepCards,
} from "./items";
import type { MarketingContent } from "./marketingContent";
import type { SectionCards } from "./sections/cards";
import { homeSections } from "./sections/homeSections";
import {
  creativeServicesSections,
  howWeWorkSections,
  waysToWorkSections,
} from "./sections/innerPageSections";
import {
  aboutSections,
  contactSections,
  selectedWorkSections,
} from "./sections/studioPageSections";

/**
 * THE SEVEN PAGES THE PANEL EDITS ARE FIXED.
 *
 * `src/app` decides which routes the site has, so this list is the site contract rather
 * than data: the admin panel cannot add a page or remove one, and says so on every page
 * screen. What is editable is the sections inside them — and which sections those are, and
 * in what order, is read out of each route file rather than declared here. See
 * composition.ts.
 *
 * FOUR ROUTES ARE PUBLIC AND NOT HERE, on purpose. /terms and /privacy are legal
 * documents whose every clause is a fact or a commitment, and they change with a reviewer
 * rather than in a text box, and /legal is the index that lists them; /faq is a frame over questions that ARE edited here, under
 * the four owners that hold them (the homepage's shared block and the three inner pages'
 * own entries), so giving it a screen of its own would be a second door to the same
 * rows. All four still render the footer, which is why they are in `ALL_ROUTES` below.
 */

export interface PageSources {
  readonly homepage: MarketingContent;
  readonly creativeServices: CreativeServicesPage;
  readonly howWeWork: HowWeWorkPage;
  readonly waysToWork: WaysToWorkPage;
  readonly selectedWork: SelectedWorkPage;
  /** The homepage's eight covers, which differ from the same pieces' covers on /selected-work. */
  readonly caseStudies: ReadonlyArray<CaseStudy>;
  readonly about: AboutPage;
  readonly contact: ContactPage;
}

/**
 * SEEDED FROM THE LITERAL `title`/`description` EACH ROUTE'S `pageMetadata()` CALL CARRIES
 * TODAY. There is nowhere else to read them from — they are inline literals in each
 * `page.tsx`, not properties of any of the seven site repositories — so this is a one-time
 * starting point rather than a derived value: from here on, the SEO section in the admin
 * panel is what these say, and the literals in the route files are what changed them last.
 */
const SEO_DEFAULTS: Readonly<Record<string, { readonly title: string; readonly description: string }>> = {
  home: {
    title: "Famysys Studio",
    description:
      "Design, video, AI-powered content, motion and product visuals — produced by a flexible creative team that helps businesses create high-quality content efficiently and at better value.",
  },
  "creative-services": {
    title: "Creative Services",
    description:
      "Design, video, AI-assisted production, motion and product visuals — what each service involves and what you receive.",
  },
  "how-we-work": {
    title: "How We Work",
    description:
      "The five steps every Famysys Studio project runs through, what each one produces, and what we need from you at each stage.",
  },
  "ways-to-work-with-us": {
    title: "Ways to Work With Us",
    description:
      "Four ways to engage Famysys Studio — Launch, Grow, Scale and a Custom Creative Partnership — what each one suits, and how an engagement is scoped.",
  },
  "selected-work": {
    title: "Selected Work",
    description:
      "The eight pieces Famysys Studio is building, what each one is meant to demonstrate, and why these eight. None of them has been produced yet.",
  },
  about: {
    title: "About",
    description:
      "Famysys Studio combines creative talent, emerging AI technologies and structured production workflows. Part of the Famysys ecosystem, and starting deliberately.",
  },
  contact: {
    title: "Contact",
    description:
      "Tell Famysys Studio what you are trying to create, who it is for and when you need it. Send a brief and hear back from the person who would direct the work.",
  },
};

interface PageInput {
  readonly id: string;
  readonly title: string;
  readonly route: string;
  readonly description: string;
  readonly source: string;
  readonly declared: ReadonlyArray<CmsRecord>;
  readonly updatedAt: Date | null;
}

export function buildPages(sources: PageSources): ReadonlyArray<CmsPage> {
  const at = {
    marketing: contentModifiedAt(CONTENT_FILE.marketing),
    creativeServices: contentModifiedAt(CONTENT_FILE.creativeServices),
    howWeWork: contentModifiedAt(CONTENT_FILE.howWeWork),
    waysToWork: contentModifiedAt(CONTENT_FILE.waysToWork),
    selectedWork: contentModifiedAt(CONTENT_FILE.selectedWork),
    about: contentModifiedAt(CONTENT_FILE.about),
    contact: contentModifiedAt(CONTENT_FILE.contact),
  };

  // Built once and shared. The six capabilities on the homepage and the six on Creative
  // Services are the same records with the same addresses, so an edit made on either
  // screen is one write to one row — see sections/cards.ts.
  const cards: SectionCards = {
    capabilities: capabilityCards(sources.creativeServices, at.creativeServices),
    processSteps: processStepCards(sources.howWeWork, at.howWeWork),
    engagementTiers: engagementTierCards(sources.waysToWork, at.waysToWork),
    customPartnership: customPartnershipCard(sources.waysToWork, at.waysToWork),
    caseStudies: caseStudyCards(sources.selectedWork, sources.caseStudies, at.selectedWork),
    faq: faqCards(sources.homepage.faq, at.marketing),
  };

  const inputs: ReadonlyArray<PageInput> = [
    {
      id: "home",
      title: "Home",
      route: "/",
      description: "The homepage, from the hero down to the closing call to action.",
      source: CONTENT_FILE.marketing,
      declared: homeSections(sources.homepage, cards, at.marketing),
      updatedAt: at.marketing,
    },
    {
      id: "creative-services",
      title: "Creative Services",
      route: "/creative-services",
      description: "The capability page and the six capabilities it renders in full.",
      source: CONTENT_FILE.creativeServices,
      declared: creativeServicesSections(sources.creativeServices, cards, at.creativeServices),
      updatedAt: at.creativeServices,
    },
    {
      id: "how-we-work",
      title: "How We Work",
      route: "/how-we-work",
      description: "The process page and the five stages of a project.",
      source: CONTENT_FILE.howWeWork,
      declared: howWeWorkSections(sources.howWeWork, cards, at.howWeWork),
      updatedAt: at.howWeWork,
    },
    {
      id: "ways-to-work-with-us",
      title: "Ways to Work With Us",
      route: "/ways-to-work-with-us",
      description: "The engagement page: three named tiers and the custom partnership.",
      source: CONTENT_FILE.waysToWork,
      declared: waysToWorkSections(sources.waysToWork, cards, at.waysToWork),
      updatedAt: at.waysToWork,
    },
    {
      id: "selected-work",
      title: "Selected Work",
      route: "/selected-work",
      description: "The portfolio page and the eight planned pieces.",
      source: CONTENT_FILE.selectedWork,
      declared: selectedWorkSections(sources.selectedWork, cards, at.selectedWork),
      updatedAt: at.selectedWork,
    },
    {
      id: "about",
      title: "About",
      route: "/about",
      description: "The studio page — belief, approach, inputs and where the work is going.",
      source: CONTENT_FILE.about,
      declared: aboutSections(sources.about, at.about),
      updatedAt: at.about,
    },
    {
      id: "contact",
      title: "Contact",
      route: "/contact",
      description: "The enquiry page and the labels its form is built from.",
      source: CONTENT_FILE.contact,
      declared: contactSections(sources.contact, at.contact),
      updatedAt: at.contact,
    },
  ];

  return inputs.map((input) => {
    const defaults = SEO_DEFAULTS[input.id] ?? { title: input.title, description: input.description };
    const declared = [
      ...input.declared,
      seoSection({
        pageId: input.id,
        route: input.route,
        title: defaults.title,
        description: defaults.description,
        updatedAt: input.updatedAt,
      }),
    ];
    const ordered = orderSections(input.id, declared);
    return {
      id: input.id,
      title: input.title,
      route: input.route,
      description: input.description,
      source: input.source,
      sections: ordered.sections,
      sectionsAreDerived: ordered.derived,
      updatedAt: input.updatedAt,
    };
  });
}

/**
 * EVERY public route, in site order. Used for a whole-site regeneration, which is what a
 * footer publish triggers — and the footer is on all ten pages, not only the seven the
 * panel edits. /faq, /terms and /privacy have no panel screen (see the note on `buildPages`
 * and the container), but they render the footer, so a footer publish that skipped them
 * would leave the old footer standing on four pages.
 */
export const ALL_ROUTES: ReadonlyArray<string> = [
  "/",
  "/creative-services",
  "/how-we-work",
  "/ways-to-work-with-us",
  "/selected-work",
  "/about",
  "/contact",
  "/faq",
  "/terms",
  "/privacy",
  "/legal",
];
