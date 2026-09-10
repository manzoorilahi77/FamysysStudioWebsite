import type { Metadata } from "next";
import { GetWaysToWorkPage } from "../../application/engagement/GetWaysToWorkPage";
import { GetHomepageContent } from "../../application/marketing/GetHomepageContent";
import { GetPrimaryNavigation } from "../../application/navigation/GetPrimaryNavigation";
import { container } from "../../infrastructure/di/container";
import { Footer } from "../../presentation/layout/Footer";
import { Header } from "../../presentation/layout/Header";
import { CustomPartnershipBlock } from "../../presentation/sections/engagement/CustomPartnershipBlock";
import { EngagementHero } from "../../presentation/sections/engagement/EngagementHero";
import { FaqPointer } from "../../presentation/sections/shared/FaqPointer";
import { FinalCta } from "../../presentation/sections/shared/FinalCta";
import { HowToChoose } from "../../presentation/sections/engagement/HowToChoose";
import { ScopingBlock } from "../../presentation/sections/engagement/ScopingBlock";
import { TierBlock } from "../../presentation/sections/engagement/TierBlock";
import { TierComparison } from "../../presentation/sections/engagement/TierComparison";
import {
  toCustomPartnershipDetailView,
  toEngagementTierDetailView,
  toFooterContentView,
  toNavigationMenuView,
} from "../../presentation/lib/viewModels";
import { pageMetadata } from "../../shared/site/metadata";

export const metadata: Metadata = pageMetadata({
  route: "/ways-to-work-with-us",
  title: "Ways to Work With Us",
  description:
    "Four ways to engage Famysys Studio — Launch, Grow, Scale and a Custom Creative Partnership — what each one suits, and how an engagement is scoped.",
});

export default async function WaysToWorkRoute() {
  // The footer is built from the navigation and the homepage's footer content, so this
  // page loads both alongside its own — the same three sources every page needs.
  const [navigation, homepage, page] = await Promise.all([
    new GetPrimaryNavigation(container.navigation).execute(),
    new GetHomepageContent(container.marketingContent).execute(),
    new GetWaysToWorkPage(container.engagement).execute(),
  ]);

  const navigationView = toNavigationMenuView(navigation);
  const tiers = page.tiers.map(toEngagementTierDetailView);
  const custom = toCustomPartnershipDetailView(page.custom);

  return (
    <>
      <Header navigation={navigationView} />
      <main id="main-content">
        <EngagementHero hero={page.hero} />

        <TierComparison comparison={page.comparison} tiers={tiers} />

        {/* Surface and image side both alternate with the index — see TierBlock. */}
        {tiers.map((tier, index) => (
          <TierBlock
            key={tier.slug}
            tier={tier}
            index={index}
            idealForLabel={page.comparison.rowLabels.idealFor}
            typicalWorkLabel={page.comparison.rowLabels.typicalWork}
          />
        ))}

        {/* Index 3 in the alternation, so it lands dark — and it is full width rather
            than a split, which is what stops it reading as a fourth tier. */}
        <CustomPartnershipBlock custom={custom} />

        <HowToChoose howToChoose={page.howToChoose} />

        <ScopingBlock scoping={page.scoping} />

        {/* Where this page's four questions were. They are on /faq now, in this page's
            own group, and this points there under the same eyebrow and heading. */}
        <FaqPointer eyebrow={page.faq.eyebrow} heading={page.faq.heading} group={page.faq.group} />

        <FinalCta closingCta={page.closingCta} accent={["which of these"]} />
      </main>
      <Footer entries={navigationView.primaryLinks} footer={toFooterContentView(homepage.footer)} />
    </>
  );
}
