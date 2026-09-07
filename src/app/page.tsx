import type { Metadata } from "next";
import { GetWaysToWorkPage } from "../application/engagement/GetWaysToWorkPage";
import { GetPrimaryNavigation } from "../application/navigation/GetPrimaryNavigation";
import { GetHowWeWorkPage } from "../application/process/GetHowWeWorkPage";
import { GetHomepageContent } from "../application/marketing/GetHomepageContent";
import { GetFeaturedWork } from "../application/portfolio/GetFeaturedWork";
import { GetServiceCatalog } from "../application/services/GetServiceCatalog";
import { container } from "../infrastructure/di/container";
import { Header } from "../presentation/layout/Header";
import { Footer } from "../presentation/layout/Footer";
import { Hero } from "../presentation/sections/home/Hero";
import { WhatWeDo } from "../presentation/sections/home/WhatWeDo";
import { Differentiator } from "../presentation/sections/home/Differentiator";
import { HowWeWorkFrames } from "../presentation/sections/home/HowWeWorkFrames";
import { WaysToWorkTiles } from "../presentation/sections/home/WaysToWorkTiles";
import { SelectedWorkCovers } from "../presentation/sections/home/SelectedWorkCovers";
import { WhyFamysys } from "../presentation/sections/home/WhyFamysys";
import { Faq } from "../presentation/sections/shared/Faq";
import { FinalCta } from "../presentation/sections/shared/FinalCta";
import {
  toCaseStudyView,
  toCustomPartnershipDetailView,
  toEngagementTierDetailView,
  toProcessStepDetailView,
  toCtaView,
  toDifferentiatorBlockView,
  toFaqBlockView,
  toFooterContentView,
  toHeroContentView,
  toNavigationMenuView,
  toWhyFamysysBlockView,
} from "../presentation/lib/viewModels";
import { homeMetadata } from "../shared/site/metadata";

export const metadata: Metadata = homeMetadata;

export default async function HomePage() {
  // The three imagery-led sections need a picture per step and per tier, and the
  // homepage's own `ProcessBlock` and `WaysToWorkBlock` carry none. Rather than
  // duplicating the media onto them, the details are read from the two page use cases
  // that already hold it: `ProcessStepDetail extends ProcessStep` and
  // `EngagementTierDetail extends EngagementTier`, both built by spreading the
  // homepage's approved copy, so the words on this page are still the words in
  // marketing.content.ts and cannot drift from /how-we-work or /ways-to-work-with-us.
  const [navigation, homepage, caseStudies, capabilities, process, engagement] =
    await Promise.all([
      new GetPrimaryNavigation(container.navigation).execute(),
      new GetHomepageContent(container.marketingContent).execute(),
      new GetFeaturedWork(container.portfolio).execute(),
      new GetServiceCatalog(container.serviceCatalog).execute(),
      new GetHowWeWorkPage(container.process).execute(),
      new GetWaysToWorkPage(container.engagement).execute(),
    ]);

  const navigationView = toNavigationMenuView(navigation);

  return (
    <>
      <Header navigation={navigationView} />
      <main id="main-content">
        <Hero hero={toHeroContentView(homepage.hero)} />
        <WhatWeDo
          intro={homepage.whatWeDo.intro}
          cta={toCtaView(homepage.whatWeDo.cta)}
          capabilities={capabilities}
        />
        <Differentiator differentiator={toDifferentiatorBlockView(homepage.differentiator)} />
        <HowWeWorkFrames
          eyebrow={process.hero.eyebrow}
          heading={homepage.process.heading}
          revealLabel={homepage.process.revealLabel}
          steps={process.steps.map(toProcessStepDetailView)}
        />
        <WaysToWorkTiles
          eyebrow={engagement.hero.eyebrow}
          heading={homepage.waysToWork.heading}
          body={homepage.waysToWork.body}
          openLabel={homepage.waysToWork.openLabel}
          closeLabel={homepage.waysToWork.closeLabel}
          idealForLabel={engagement.comparison.rowLabels.idealFor}
          typicalWorkLabel={engagement.comparison.rowLabels.typicalWork}
          tiers={engagement.tiers.map(toEngagementTierDetailView)}
          custom={toCustomPartnershipDetailView(engagement.custom)}
        />
        <SelectedWorkCovers
          intro={homepage.workIntro}
          caseStudies={caseStudies.map(toCaseStudyView)}
        />
        <WhyFamysys whyFamysys={toWhyFamysysBlockView(homepage.whyFamysys)} />
        <Faq faq={toFaqBlockView(homepage.faq)} />
        <FinalCta closingCta={homepage.closingCta} />
      </main>
      <Footer entries={navigationView.primaryLinks} footer={toFooterContentView(homepage.footer)} />
    </>
  );
}
