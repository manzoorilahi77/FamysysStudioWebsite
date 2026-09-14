import type { Metadata } from "next";
import { GetTerms } from "../../application/legal/GetLegalDocuments";
import { GetHomepageContent } from "../../application/marketing/GetHomepageContent";
import { GetPrimaryNavigation } from "../../application/navigation/GetPrimaryNavigation";
import { container } from "../../infrastructure/di/container";
import { Footer } from "../../presentation/layout/Footer";
import { Header } from "../../presentation/layout/Header";
import { LegalDocumentPage } from "../../presentation/sections/legal/LegalDocumentPage";
import { toFooterContentView, toNavigationMenuView } from "../../presentation/lib/viewModels";
import { JsonLd } from "../../presentation/seo/JsonLd";
import { pageMetadata } from "../../shared/site/metadata";
import { breadcrumbSchema } from "../../shared/site/structured-data";

export const metadata: Metadata = pageMetadata({
  route: "/terms",
  title: "Terms & Conditions",
  description:
    "The terms on which this website is published: what it is, how it may be used, how an enquiry is treated, and where the work itself is governed.",
});

const BREADCRUMB = breadcrumbSchema([
  { name: "Famysys Studio", path: "/" },
  { name: "Terms & Conditions", path: "/terms" },
]);

/**
 * One of the two documents the footer's LEGAL column has linked since it was rebuilt and
 * that 404ed until now. Drafted against famysys.com's own and marked for legal review —
 * see terms.content.ts. No closing call to action: nobody reads the terms to be sold to.
 */
export default async function TermsRoute() {
  const [navigation, homepage, document] = await Promise.all([
    new GetPrimaryNavigation(container.navigation).execute(),
    new GetHomepageContent(container.marketingContent).execute(),
    new GetTerms(container.legal).execute(),
  ]);

  const navigationView = toNavigationMenuView(navigation);

  return (
    <>
      <JsonLd data={BREADCRUMB} />
      <Header navigation={navigationView} solidAtTop />
      <main id="main-content">
        <LegalDocumentPage document={document} />
      </main>
      <Footer entries={navigationView.primaryLinks} footer={toFooterContentView(homepage.footer)} />
    </>
  );
}
