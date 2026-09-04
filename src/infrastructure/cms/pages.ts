import type { AboutPage } from "../../domain/about/entities/AboutPage";
import type { CmsPage } from "../../domain/cms/entities/CmsPage";
import type { ContactPage } from "../../domain/contact/entities/ContactPage";
import type { WaysToWorkPage } from "../../domain/engagement/entities/WaysToWorkPage";
import type { SelectedWorkPage } from "../../domain/portfolio/entities/SelectedWorkPage";
import type { HowWeWorkPage } from "../../domain/process/entities/HowWeWorkPage";
import type { CreativeServicesPage } from "../../domain/services/entities/CreativeServicesPage";
import { CONTENT_FILE, contentModifiedAt } from "./contentSources";
import type { MarketingContent } from "./marketingContent";
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
 * than data: the admin panel cannot add a page or remove one, and says so on the Pages
 * screen. What is editable is the sections inside them.
 */

export interface PageSources {
  readonly homepage: MarketingContent;
  readonly creativeServices: CreativeServicesPage;
  readonly howWeWork: HowWeWorkPage;
  readonly waysToWork: WaysToWorkPage;
  readonly selectedWork: SelectedWorkPage;
  readonly about: AboutPage;
  readonly contact: ContactPage;
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

  return [
    {
      id: "home",
      title: "Home",
      route: "/",
      description: "The homepage, from the hero down to the closing call to action.",
      source: CONTENT_FILE.marketing,
      sections: homeSections(sources.homepage, at.marketing),
      updatedAt: at.marketing,
    },
    {
      id: "creative-services",
      title: "Creative Services",
      route: "/creative-services",
      description: "The capability page. Its six capabilities are edited as a collection.",
      source: CONTENT_FILE.creativeServices,
      sections: creativeServicesSections(sources.creativeServices, at.creativeServices),
      updatedAt: at.creativeServices,
    },
    {
      id: "how-we-work",
      title: "How We Work",
      route: "/how-we-work",
      description: "The process page. Its five stages are edited as a collection.",
      source: CONTENT_FILE.howWeWork,
      sections: howWeWorkSections(sources.howWeWork, at.howWeWork),
      updatedAt: at.howWeWork,
    },
    {
      id: "ways-to-work-with-us",
      title: "Ways to Work With Us",
      route: "/ways-to-work-with-us",
      description: "The engagement page. Its four tiers are edited as a collection.",
      source: CONTENT_FILE.waysToWork,
      sections: waysToWorkSections(sources.waysToWork, at.waysToWork),
      updatedAt: at.waysToWork,
    },
    {
      id: "selected-work",
      title: "Selected Work",
      route: "/selected-work",
      description: "The portfolio page. Its eight pieces are edited as a collection.",
      source: CONTENT_FILE.selectedWork,
      sections: selectedWorkSections(sources.selectedWork, at.selectedWork),
      updatedAt: at.selectedWork,
    },
    {
      id: "about",
      title: "About",
      route: "/about",
      description: "The studio page — belief, approach, inputs and where the work is going.",
      source: CONTENT_FILE.about,
      sections: aboutSections(sources.about, at.about),
      updatedAt: at.about,
    },
    {
      id: "contact",
      title: "Contact",
      route: "/contact",
      description: "The enquiry page and the labels its form is built from.",
      source: CONTENT_FILE.contact,
      sections: contactSections(sources.contact, at.contact),
      updatedAt: at.contact,
    },
  ];
}
