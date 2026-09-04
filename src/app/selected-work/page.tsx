import type { Metadata } from "next";
import { GetHomepageContent } from "../../application/marketing/GetHomepageContent";
import { GetPrimaryNavigation } from "../../application/navigation/GetPrimaryNavigation";
import { GetSelectedWorkPage } from "../../application/portfolio/GetSelectedWorkPage";
import { container } from "../../infrastructure/di/container";
import { Footer } from "../../presentation/layout/Footer";
import { Header } from "../../presentation/layout/Header";
import { FinalCta } from "../../presentation/sections/FinalCta";
import { WorkCapabilityLinks } from "../../presentation/sections/WorkCapabilityLinks";
import { WorkFraming } from "../../presentation/sections/WorkFraming";
import { WorkGallery } from "../../presentation/sections/WorkGallery";
import { WorkHero } from "../../presentation/sections/WorkHero";
import { WorkProgression } from "../../presentation/sections/WorkProgression";
import {
  toCaseStudyDetailView,
  toFooterContentView,
  toNavigationMenuView,
} from "../../presentation/lib/viewModels";
import { pageMetadata } from "../../shared/site/metadata";

export const metadata: Metadata = pageMetadata({
  route: "/selected-work",
  // The description says the same thing the page's framing block says, because a search
  // result is the first place someone could mistake this for a portfolio of finished work.
  title: "Selected Work",
  description:
    "The eight pieces Famysys Studio is building, what each one is meant to demonstrate, and why these eight. None of them has been produced yet.",
});

export default async function SelectedWorkRoute() {
  // The footer is built from the navigation and the homepage's footer content, so this
  // page loads both alongside its own — the same three sources every page needs.
  const [navigation, homepage, page] = await Promise.all([
    new GetPrimaryNavigation(container.navigation).execute(),
    new GetHomepageContent(container.marketingContent).execute(),
    new GetSelectedWorkPage(container.portfolio).execute(),
  ]);

  const navigationView = toNavigationMenuView(navigation);
  const pieces = page.pieces.map(toCaseStudyDetailView);

  return (
    <>
      <Header navigation={navigationView} />
      <main id="main-content">
        <WorkHero hero={page.hero} />

        {/* Immediately after the hero, before a single cover. Do not move it down. */}
        <WorkFraming framing={page.framing} />

        <WorkGallery
          gridLabel={page.gridLabel}
          filter={page.filter}
          pieces={pieces}
          statusLabel={page.statusLabel}
          statusExplanation={page.statusExplanation}
          detail={page.detail}
        />

        <WorkProgression progression={page.progression} pieces={pieces} />

        <WorkCapabilityLinks crossLink={page.capabilityCrossLink} />

        <FinalCta closingCta={page.closingCta} accent={["actually need."]} />
      </main>
      <Footer entries={navigationView.primaryLinks} footer={toFooterContentView(homepage.footer)} />
    </>
  );
}
