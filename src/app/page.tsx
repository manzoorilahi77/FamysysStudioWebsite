import { GetPrimaryNavigation } from "../application/navigation/GetPrimaryNavigation";
import { GetHomepageContent } from "../application/marketing/GetHomepageContent";
import { GetFeaturedWork } from "../application/portfolio/GetFeaturedWork";
import { GetImpactMetrics } from "../application/social-proof/GetImpactMetrics";
import { GetClientLogos } from "../application/social-proof/GetClientLogos";
import { GetServiceCatalog } from "../application/services/GetServiceCatalog";
import { GetComparisonMatrix } from "../application/comparison/GetComparisonMatrix";
import { GetTestimonialWall } from "../application/social-proof/GetTestimonialWall";
import { container } from "../infrastructure/di/container";
import { Header } from "../presentation/layout/Header";
import { Footer } from "../presentation/layout/Footer";
import { Hero } from "../presentation/sections/Hero";
import { ClientMarquee } from "../presentation/sections/ClientMarquee";
import { Manifesto } from "../presentation/sections/Manifesto";
import { Positioning } from "../presentation/sections/Positioning";
import { Pillars } from "../presentation/sections/Pillars";
import { ImpactMetrics } from "../presentation/sections/ImpactMetrics";
import { FeaturedStories } from "../presentation/sections/FeaturedStories";
import { ServicesGrid } from "../presentation/sections/ServicesGrid";
import { SelectedWork } from "../presentation/sections/SelectedWork";
import { ComparisonMatrix } from "../presentation/sections/ComparisonMatrix";
import { TestimonialWall } from "../presentation/sections/TestimonialWall";
import { Process } from "../presentation/sections/Process";
import { Differentiators } from "../presentation/sections/Differentiators";
import { Talent } from "../presentation/sections/Talent";
import { ClosingCta } from "../presentation/sections/ClosingCta";
import {
  toCaseStudyView,
  toComparisonCriterionView,
  toFooterContentView,
  toHeroContentView,
  toManifestoBlockView,
  toNavigationMenuView,
  toPositioningBlockView,
  toShowreelClipView,
  toTalentBlockView,
  toWorkSectionView,
} from "../presentation/lib/viewModels";

export default async function HomePage() {
  const [navigation, homepage, featuredWork, metrics, clientLogos, serviceCatalog, comparison, testimonialWall] =
    await Promise.all([
      new GetPrimaryNavigation(container.navigation).execute(),
      new GetHomepageContent(container.marketingContent).execute(),
      new GetFeaturedWork(container.portfolio).execute(),
      new GetImpactMetrics(container.socialProof).execute(),
      new GetClientLogos(container.socialProof).execute(),
      new GetServiceCatalog(container.serviceCatalog).execute(),
      new GetComparisonMatrix(container.comparison).execute(),
      new GetTestimonialWall(container.socialProof).execute(),
    ]);

  const navigationView = toNavigationMenuView(navigation);

  return (
    <>
      <Header navigation={navigationView} />
      <main id="main-content">
        <Hero hero={toHeroContentView(homepage.hero)} />
        <ClientMarquee eyebrow={homepage.marqueeEyebrow} logos={clientLogos} />
        <Manifesto manifesto={toManifestoBlockView(homepage.manifesto)} />
        <Positioning positioning={toPositioningBlockView(homepage.positioning)} />
        <Pillars intro={homepage.pillarsIntro} pillars={homepage.pillars} />
        <ImpactMetrics intro={homepage.metricsIntro} metrics={metrics} />
        <FeaturedStories stories={featuredWork.stories.map(toShowreelClipView)} />
        <ServicesGrid intro={homepage.servicesIntro} categories={serviceCatalog} />
        <SelectedWork
          work={toWorkSectionView(homepage.workSection)}
          caseStudies={featuredWork.caseStudies.map(toCaseStudyView)}
        />
        <ComparisonMatrix
          intro={homepage.comparisonIntro}
          columns={comparison.columns}
          criteria={comparison.criteria.map(toComparisonCriterionView)}
        />
        <TestimonialWall intro={homepage.testimonialsIntro} testimonials={testimonialWall} />
        <Process process={homepage.process} />
        <Differentiators intro={homepage.differentiators.intro} items={homepage.differentiators.items} />
        <Talent talent={toTalentBlockView(homepage.talent)} />
        <ClosingCta closingCta={homepage.closingCta} />
      </main>
      <Footer megaMenu={navigationView.megaMenu} footer={toFooterContentView(homepage.footer)} />
    </>
  );
}
