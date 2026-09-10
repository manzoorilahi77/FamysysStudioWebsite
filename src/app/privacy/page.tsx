import type { Metadata } from "next";
import { GetPrivacyPolicy } from "../../application/legal/GetLegalDocuments";
import { GetHomepageContent } from "../../application/marketing/GetHomepageContent";
import { GetPrimaryNavigation } from "../../application/navigation/GetPrimaryNavigation";
import { container } from "../../infrastructure/di/container";
import { Footer } from "../../presentation/layout/Footer";
import { Header } from "../../presentation/layout/Header";
import { LegalDocumentPage } from "../../presentation/sections/legal/LegalDocumentPage";
import { toFooterContentView, toNavigationMenuView } from "../../presentation/lib/viewModels";
import { pageMetadata } from "../../shared/site/metadata";

export const metadata: Metadata = pageMetadata({
  route: "/privacy",
  title: "Privacy Policy",
  description:
    "What this website collects when you send an enquiry, what it does not, who can see it, how long it is kept, and what you can ask us to do with it.",
});

/**
 * The second of the two legal documents. Every clause was checked against what this site
 * actually does before it was written — see privacy.content.ts for the list — and the
 * clauses that only the client can settle are marked there for legal review.
 */
export default async function PrivacyRoute() {
  const [navigation, homepage, document] = await Promise.all([
    new GetPrimaryNavigation(container.navigation).execute(),
    new GetHomepageContent(container.marketingContent).execute(),
    new GetPrivacyPolicy(container.legal).execute(),
  ]);

  const navigationView = toNavigationMenuView(navigation);

  return (
    <>
      <Header navigation={navigationView} solidAtTop />
      <main id="main-content">
        <LegalDocumentPage document={document} />
      </main>
      <Footer entries={navigationView.primaryLinks} footer={toFooterContentView(homepage.footer)} />
    </>
  );
}
