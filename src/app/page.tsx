import { GetPrimaryNavigation } from "../application/navigation/GetPrimaryNavigation";
import { GetHomepageContent } from "../application/marketing/GetHomepageContent";
import { GetFeaturedWork } from "../application/portfolio/GetFeaturedWork";
import { GetImpactMetrics } from "../application/social-proof/GetImpactMetrics";
import { GetClientLogos } from "../application/social-proof/GetClientLogos";
import { container } from "../infrastructure/di/container";
import { Header } from "../presentation/layout/Header";
import { Hero } from "../presentation/sections/Hero";
import { ClientMarquee } from "../presentation/sections/ClientMarquee";
import { Manifesto } from "../presentation/sections/Manifesto";
import { Positioning } from "../presentation/sections/Positioning";
import { Pillars } from "../presentation/sections/Pillars";
import { ImpactMetrics } from "../presentation/sections/ImpactMetrics";
import { FeaturedStories } from "../presentation/sections/FeaturedStories";
import {
  toHeroContentView,
  toManifestoBlockView,
  toNavigationMenuView,
  toPositioningBlockView,
  toShowreelClipView,
} from "../presentation/lib/viewModels";

export default async function HomePage() {
  const [navigation, homepage, featuredWork, metrics, clientLogos] = await Promise.all([
    new GetPrimaryNavigation(container.navigation).execute(),
    new GetHomepageContent(container.marketingContent).execute(),
    new GetFeaturedWork(container.portfolio).execute(),
    new GetImpactMetrics(container.socialProof).execute(),
    new GetClientLogos(container.socialProof).execute(),
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
      </main>
    </>
  );
}
