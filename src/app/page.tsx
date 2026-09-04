import type { Metadata } from "next";
import { GetPrimaryNavigation } from "../application/navigation/GetPrimaryNavigation";
import { GetHomepageContent } from "../application/marketing/GetHomepageContent";
import { GetFeaturedWork } from "../application/portfolio/GetFeaturedWork";
import { GetServiceCatalog } from "../application/services/GetServiceCatalog";
import { container } from "../infrastructure/di/container";
import { Header } from "../presentation/layout/Header";
import { Footer } from "../presentation/layout/Footer";
import { Hero } from "../presentation/sections/Hero";
import { WhatWeDo } from "../presentation/sections/WhatWeDo";
import { Differentiator } from "../presentation/sections/Differentiator";
import { HowWeWork } from "../presentation/sections/HowWeWork";
import { WaysToWork } from "../presentation/sections/WaysToWork";
import { SelectedWork } from "../presentation/sections/SelectedWork";
import { WhyFamysys } from "../presentation/sections/WhyFamysys";
import { Faq } from "../presentation/sections/Faq";
import { FinalCta } from "../presentation/sections/FinalCta";
import {
  toCaseStudyView,
  toCtaView,
  toDifferentiatorBlockView,
  toFaqBlockView,
  toFooterContentView,
  toHeroContentView,
  toNavigationMenuView,
  toWaysToWorkBlockView,
  toWhyFamysysBlockView,
} from "../presentation/lib/viewModels";
import { homeMetadata } from "../shared/site/metadata";

export const metadata: Metadata = homeMetadata;

export default async function HomePage() {
  const [navigation, homepage, caseStudies, capabilities] = await Promise.all([
    new GetPrimaryNavigation(container.navigation).execute(),
    new GetHomepageContent(container.marketingContent).execute(),
    new GetFeaturedWork(container.portfolio).execute(),
    new GetServiceCatalog(container.serviceCatalog).execute(),
  ]);

  const navigationView = toNavigationMenuView(navigation);

  return (
    <>
      <Header navigation={navigationView} heroLogo />
      <main id="main-content">
        <Hero hero={toHeroContentView(homepage.hero)} />
        <WhatWeDo
          intro={homepage.whatWeDo.intro}
          cta={toCtaView(homepage.whatWeDo.cta)}
          capabilities={capabilities}
        />
        <Differentiator differentiator={toDifferentiatorBlockView(homepage.differentiator)} />
        <HowWeWork process={homepage.process} />
        <WaysToWork waysToWork={toWaysToWorkBlockView(homepage.waysToWork)} />
        <SelectedWork intro={homepage.workIntro} caseStudies={caseStudies.map(toCaseStudyView)} />
        <WhyFamysys whyFamysys={toWhyFamysysBlockView(homepage.whyFamysys)} />
        <Faq faq={toFaqBlockView(homepage.faq)} />
        <FinalCta closingCta={homepage.closingCta} />
      </main>
      <Footer entries={navigationView.primaryLinks} footer={toFooterContentView(homepage.footer)} />
    </>
  );
}
