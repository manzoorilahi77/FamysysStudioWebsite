import type { Metadata } from "next";
import { GetAboutPage } from "../../application/about/GetAboutPage";
import { GetHomepageContent } from "../../application/marketing/GetHomepageContent";
import { GetPrimaryNavigation } from "../../application/navigation/GetPrimaryNavigation";
import { container } from "../../infrastructure/di/container";
import { Footer } from "../../presentation/layout/Footer";
import { Header } from "../../presentation/layout/Header";
import { AboutApproach } from "../../presentation/sections/AboutApproach";
import { AboutHero } from "../../presentation/sections/AboutHero";
import { BeliefStatement } from "../../presentation/sections/BeliefStatement";
import { FinalCta } from "../../presentation/sections/FinalCta";
import { PartOfFamysys } from "../../presentation/sections/PartOfFamysys";
import { WhereWereGoing } from "../../presentation/sections/WhereWereGoing";
import { toFooterContentView, toNavigationMenuView } from "../../presentation/lib/viewModels";

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

  return (
    <>
      <Header navigation={navigationView} />
      {/* Six sections, where the other inner pages have eight or ten. The brief asks for
          About to stay short initially, so the page is short on purpose — not thin by
          accident. There is no team grid, stats block, timeline, values grid, office
          photo or logo strip, because the content supports none of them and each would
          have had to be invented. */}
      <main id="main-content">
        <AboutHero hero={page.hero} />

        <BeliefStatement belief={page.belief} />

        <AboutApproach approach={page.approach} />

        <PartOfFamysys ecosystem={page.ecosystem} />

        <WhereWereGoing direction={page.direction} />

        <FinalCta closingCta={page.closingCta} accent={["to make."]} />
      </main>
      <Footer entries={navigationView.primaryLinks} footer={toFooterContentView(homepage.footer)} />
    </>
  );
}
