import type { Metadata } from "next";
import { GetHomepageContent } from "../../application/marketing/GetHomepageContent";
import { GetPrimaryNavigation } from "../../application/navigation/GetPrimaryNavigation";
import { GetCreativeServicesPage } from "../../application/services/GetCreativeServicesPage";
import { container } from "../../infrastructure/di/container";
import { CapabilityIndex } from "../../presentation/components/CapabilityIndex";
import { Footer } from "../../presentation/layout/Footer";
import { Header } from "../../presentation/layout/Header";
import { CapabilityBlock } from "../../presentation/sections/CapabilityBlock";
import { EngagementPointer } from "../../presentation/sections/EngagementPointer";
import { Faq } from "../../presentation/sections/Faq";
import { FinalCta } from "../../presentation/sections/FinalCta";
import { HowWeWork } from "../../presentation/sections/HowWeWork";
import { ServicesHero } from "../../presentation/sections/ServicesHero";
import {
  toCapabilityDetailView,
  toCtaView,
  toFaqBlockView,
  toFooterContentView,
  toNavigationMenuView,
  toServicesHeroView,
} from "../../presentation/lib/viewModels";

export const metadata: Metadata = {
  title: "Creative Services — Famysys Studio",
  description:
    "Design, video, AI-assisted production, motion and product visuals — what each service involves and what you receive.",
};

export default async function CreativeServicesRoute() {
  // The footer is built from the navigation and the homepage's footer content, so this
  // page loads both alongside its own — the same three sources every page will need.
  const [navigation, homepage, page] = await Promise.all([
    new GetPrimaryNavigation(container.navigation).execute(),
    new GetHomepageContent(container.marketingContent).execute(),
    new GetCreativeServicesPage(container.serviceCatalog).execute(),
  ]);

  const navigationView = toNavigationMenuView(navigation);
  const capabilities = page.capabilities.map(toCapabilityDetailView);

  return (
    <>
      <Header navigation={navigationView} />
      <main id="main-content">
        <ServicesHero hero={toServicesHeroView(page.hero)} />

        <CapabilityIndex
          label={page.indexLabel}
          items={capabilities.map(({ slug, title }) => ({ slug, title }))}
        />

        {/* Surface and image side both alternate with the index — see CapabilityBlock. */}
        {capabilities.map((capability, index) => (
          <CapabilityBlock
            key={capability.slug}
            capability={capability}
            index={index}
            deliverablesLabel={page.deliverablesLabel}
          />
        ))}

        {/* The five steps are the homepage's, verbatim; only the heading is this page's,
            so the sequence cannot drift from the one How We Work will describe in full. */}
        <HowWeWork
          process={page.processPointer.process}
          eyebrow={page.processPointer.eyebrow}
          cta={toCtaView(page.processPointer.cta)}
        />

        <EngagementPointer
          eyebrow={page.engagementPointer.eyebrow}
          heading={page.engagementPointer.heading}
          body={page.engagementPointer.body}
          summaries={page.engagementPointer.summaries}
          cta={toCtaView(page.engagementPointer.cta)}
        />

        <Faq
          faq={toFaqBlockView(page.faq.block)}
          eyebrow={page.faq.eyebrow}
          heading={page.faq.heading}
          ariaLabel={page.faq.heading}
        />

        <FinalCta closingCta={page.closingCta} accent={["which service"]} />
      </main>
      <Footer entries={navigationView.primaryLinks} footer={toFooterContentView(homepage.footer)} />
    </>
  );
}
