import type { Metadata } from "next";
import { GetHomepageContent } from "../../application/marketing/GetHomepageContent";
import { GetPrimaryNavigation } from "../../application/navigation/GetPrimaryNavigation";
import { GetHowWeWorkPage } from "../../application/process/GetHowWeWorkPage";
import { container } from "../../infrastructure/di/container";
import { ProcessOverview } from "../../presentation/components/ProcessOverview";
import { Footer } from "../../presentation/layout/Footer";
import { Header } from "../../presentation/layout/Header";
import { FaqPointer } from "../../presentation/sections/shared/FaqPointer";
import { FinalCta } from "../../presentation/sections/shared/FinalCta";
import { ProcessHero } from "../../presentation/sections/process/ProcessHero";
import { ProcessStepBlock } from "../../presentation/sections/process/ProcessStepBlock";
import { ScopeAndRevisions } from "../../presentation/sections/process/ScopeAndRevisions";
import { WorkedExample } from "../../presentation/sections/process/WorkedExample";
import {
  toFooterContentView,
  toNavigationMenuView,
  toProcessStepDetailView,
} from "../../presentation/lib/viewModels";
import { pageMetadata } from "../../shared/site/metadata";

export const metadata: Metadata = pageMetadata({
  route: "/how-we-work",
  title: "How We Work",
  description:
    "The five steps every Famysys Studio project runs through, what each one produces, and what we need from you at each stage.",
});

export default async function HowWeWorkRoute() {
  // The footer is built from the navigation and the homepage's footer content, so this
  // page loads both alongside its own — the same three sources every page needs.
  const [navigation, homepage, page] = await Promise.all([
    new GetPrimaryNavigation(container.navigation).execute(),
    new GetHomepageContent(container.marketingContent).execute(),
    new GetHowWeWorkPage(container.process).execute(),
  ]);

  const navigationView = toNavigationMenuView(navigation);
  const steps = page.steps.map(toProcessStepDetailView);

  return (
    <>
      <Header navigation={navigationView} />
      <main id="main-content">
        <ProcessHero hero={page.hero} />

        <ProcessOverview
          label={page.overviewLabel}
          steps={steps.map(({ slug, title }) => ({ slug, title }))}
        />

        {/* Surface and image side both alternate with the index — see ProcessStepBlock. */}
        {steps.map((step, index) => (
          <ProcessStepBlock
            key={step.slug}
            step={step}
            index={index}
            whatWeNeedLabel={page.whatWeNeedLabel}
            whatYouGetLabel={page.whatYouGetLabel}
          />
        ))}

        <WorkedExample example={page.workedExample} />

        <ScopeAndRevisions scope={page.scope} />

        {/* Where this page's four questions were. They are on /faq now, in this page's
            own group, and this points there under the same eyebrow and heading. */}
        <FaqPointer eyebrow={page.faq.eyebrow} heading={page.faq.heading} group={page.faq.group} />

        <FinalCta closingCta={page.closingCta} accent={["step one?"]} />
      </main>
      <Footer entries={navigationView.primaryLinks} footer={toFooterContentView(homepage.footer)} />
    </>
  );
}
