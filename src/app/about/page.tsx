import type { Metadata } from "next";
import { GetAboutPage } from "../../application/about/GetAboutPage";
import { GetHomepageContent } from "../../application/marketing/GetHomepageContent";
import { GetPrimaryNavigation } from "../../application/navigation/GetPrimaryNavigation";
import { container } from "../../infrastructure/di/container";
import { Footer } from "../../presentation/layout/Footer";
import { Header } from "../../presentation/layout/Header";
import { AboutApproach } from "../../presentation/sections/AboutApproach";
import { AboutBuilding } from "../../presentation/sections/AboutBuilding";
import { AboutHero } from "../../presentation/sections/AboutHero";
import { AboutInputs } from "../../presentation/sections/AboutInputs";
import { BeliefStatement } from "../../presentation/sections/BeliefStatement";
import { FinalCta } from "../../presentation/sections/FinalCta";
import { PartOfFamysys } from "../../presentation/sections/PartOfFamysys";
import { WhereWereGoing } from "../../presentation/sections/WhereWereGoing";
import {
  toAboutHeroView,
  toApproachBlockView,
  toDirectionBlockView,
  toEcosystemBlockView,
  toFooterContentView,
  toNavigationMenuView,
} from "../../presentation/lib/viewModels";

export const metadata: Metadata = {
  title: "About — Famysys Studio",
  description:
    "Famysys Studio combines creative talent, emerging AI technologies and structured production workflows. Part of the Famysys ecosystem, and starting deliberately.",
};

export default async function AboutRoute() {
  // The footer is built from the navigation and the homepage's footer content, so this
  // page loads both alongside its own — the same three sources every page needs.
  const [navigation, homepage, page] = await Promise.all([
    new GetPrimaryNavigation(container.navigation).execute(),
    new GetHomepageContent(container.marketingContent).execute(),
    new GetAboutPage(container.about).execute(),
  ]);

  const navigationView = toNavigationMenuView(navigation);
  // Four of the eight blocks carry a MediaRef or a Cta, and every section on this page
  // below the hero is a client component — a class instance cannot cross that boundary,
  // so they are flattened here. The inputs and build-order blocks are plain strings all
  // the way down and pass through as they are.

  return (
    <>
      <Header navigation={navigationView} />
      {/* Eight sections, each on its own layout, and the grounds alternate down the page
          without any section asking for a tone: the seam rules in globals.css count the
          dark sections (ink, alt, ink, alt) and the light run (canvas, then warm where two
          light sections meet). Hero ink → belief canvas → approach alt → inputs canvas →
          building ink → ecosystem canvas → direction warm → closing alt.

          Still no team grid, stats block, timeline, values grid, office photo or logo
          strip: the content supports none of them and each would have had to be
          invented. What was added instead is what a new studio can say honestly. */}
      <main id="main-content">
        <AboutHero hero={toAboutHeroView(page.hero)} />

        <BeliefStatement belief={page.belief} />

        <AboutApproach approach={toApproachBlockView(page.approach)} />

        <AboutInputs inputs={page.inputs} />

        <AboutBuilding building={page.building} />

        <PartOfFamysys ecosystem={toEcosystemBlockView(page.ecosystem)} />

        <WhereWereGoing direction={toDirectionBlockView(page.direction)} />

        <FinalCta closingCta={page.closingCta} accent={["to make."]} />
      </main>
      <Footer entries={navigationView.primaryLinks} footer={toFooterContentView(homepage.footer)} />
    </>
  );
}
