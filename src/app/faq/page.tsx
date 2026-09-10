import type { Metadata } from "next";
import { GetFaqPage } from "../../application/faq/GetFaqPage";
import { GetHomepageContent } from "../../application/marketing/GetHomepageContent";
import { GetPrimaryNavigation } from "../../application/navigation/GetPrimaryNavigation";
import { container } from "../../infrastructure/di/container";
import { Footer } from "../../presentation/layout/Footer";
import { Header } from "../../presentation/layout/Header";
import { FaqHero } from "../../presentation/sections/faq/FaqHero";
import { FaqPageBody } from "../../presentation/sections/faq/FaqPageBody";
import { FinalCta } from "../../presentation/sections/shared/FinalCta";
import {
  toFaqPageView,
  toFooterContentView,
  toNavigationMenuView,
} from "../../presentation/lib/viewModels";
import { pageMetadata } from "../../shared/site/metadata";

export const metadata: Metadata = pageMetadata({
  route: "/faq",
  title: "Questions",
  description:
    "Every question asked across the site, in one place with the answers open — who the studio works with, what it makes, how the work runs, and what it costs.",
});

/**
 * EVERY QUESTION ON THE SITE, ON ONE PAGE.
 *
 * The questions used to be in four places, each behind an accordion, and then in none —
 * the section was switched off site-wide at the client's direction. They are here now,
 * all twelve, grouped and open. `GetFaqPage` gathers them from the four repositories that
 * still own them, so the panel edits the answers where it always did and this page prints
 * whatever it edited.
 *
 * Opens light, and the bar starts solid, for the reason /contact gives.
 */
export default async function FaqRoute() {
  const [navigation, homepage, page] = await Promise.all([
    new GetPrimaryNavigation(container.navigation).execute(),
    new GetHomepageContent(container.marketingContent).execute(),
    new GetFaqPage({
      faq: container.faq,
      marketingContent: container.marketingContent,
      serviceCatalog: container.serviceCatalog,
      process: container.process,
      engagement: container.engagement,
    }).execute(),
  ]);

  const navigationView = toNavigationMenuView(navigation);
  const pageView = toFaqPageView(page);

  return (
    <>
      <Header navigation={navigationView} solidAtTop />
      <main id="main-content">
        <FaqHero hero={pageView.hero} />
        <FaqPageBody page={pageView} />
        <FinalCta closingCta={page.closingCta} />
      </main>
      <Footer entries={navigationView.primaryLinks} footer={toFooterContentView(homepage.footer)} />
    </>
  );
}
