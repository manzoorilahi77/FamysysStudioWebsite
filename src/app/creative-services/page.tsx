import type { Metadata } from "next";
import { GetHomepageContent } from "../../application/marketing/GetHomepageContent";
import { GetPrimaryNavigation } from "../../application/navigation/GetPrimaryNavigation";
import { GetCreativeServicesPage } from "../../application/services/GetCreativeServicesPage";
import { container } from "../../infrastructure/di/container";
import { CapabilityIndex } from "../../presentation/components/CapabilityIndex";
import { Footer } from "../../presentation/layout/Footer";
import { Header } from "../../presentation/layout/Header";
import { CapabilityBlock } from "../../presentation/sections/services/CapabilityBlock";
import { EngagementPointer } from "../../presentation/sections/services/EngagementPointer";
import { FaqPointer } from "../../presentation/sections/shared/FaqPointer";
import { FinalCta } from "../../presentation/sections/shared/FinalCta";
import { ProcessPointerLink } from "../../presentation/sections/services/ProcessPointerLink";
import { ServicesHero } from "../../presentation/sections/services/ServicesHero";
import {
  toCapabilityDetailView,
  toCtaView,
  toFooterContentView,
  toNavigationMenuView,
  toServicesHeroView,
} from "../../presentation/lib/viewModels";
import { pageMetadata } from "../../shared/site/metadata";

export const metadata: Metadata = pageMetadata({
  route: "/creative-services",
  title: "Creative Services",
  description:
    "Design, video, AI-assisted production, motion and product visuals — what each service involves and what you receive.",
});

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

        <ProcessPointerLink
          eyebrow={page.processPointer.eyebrow}
          heading={page.processPointer.process.heading}
          cta={toCtaView(page.processPointer.cta)}
        />

        <EngagementPointer
          eyebrow={page.engagementPointer.eyebrow}
          heading={page.engagementPointer.heading}
          body={page.engagementPointer.body}
          summaries={page.engagementPointer.summaries}
          cta={toCtaView(page.engagementPointer.cta)}
        />

        {/* Where this page's four questions were. They are on /faq now, in this page's
            own group, and this points there under the same eyebrow and heading. */}
        <FaqPointer eyebrow={page.faq.eyebrow} heading={page.faq.heading} group={page.faq.group} />

        <FinalCta closingCta={page.closingCta} accent={["which service"]} />
      </main>
      <Footer entries={navigationView.primaryLinks} footer={toFooterContentView(homepage.footer)} />
    </>
  );
}
