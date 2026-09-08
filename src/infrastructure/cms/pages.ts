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
 * THE SEVEN PAGES ARE FIXED.
 *
 * `src/app` decides which routes the site has, so this list is the site contract rather
 * than data: the admin panel cannot add a page or remove one, and says so on every page
 * screen. What is editable is the sections inside them — and which sections those are, and
 * in what order, is read out of each route file rather than declared here. See
 * composition.ts.
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
    const ordered = orderSections(input.id, input.declared);
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

/** The seven public routes, in site order. Used for a whole-site regeneration. */
export const ALL_ROUTES: ReadonlyArray<string> = [
  "/",
  "/creative-services",
  "/how-we-work",
  "/ways-to-work-with-us",
  "/selected-work",
  "/about",
  "/contact",
];
