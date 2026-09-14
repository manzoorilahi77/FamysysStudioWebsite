import type { Metadata } from "next";
import { GetLegalIndex } from "../../application/legal/GetLegalDocuments";
import { GetHomepageContent } from "../../application/marketing/GetHomepageContent";
import { GetPrimaryNavigation } from "../../application/navigation/GetPrimaryNavigation";
import { container } from "../../infrastructure/di/container";
import { Footer } from "../../presentation/layout/Footer";
import { Header } from "../../presentation/layout/Header";
import { LegalIndexPage } from "../../presentation/sections/legal/LegalIndexPage";
import { toFooterContentView, toNavigationMenuView } from "../../presentation/lib/viewModels";
import { JsonLd } from "../../presentation/seo/JsonLd";
import { pageMetadata } from "../../shared/site/metadata";
import { breadcrumbSchema } from "../../shared/site/structured-data";

export const metadata: Metadata = pageMetadata({
  route: "/legal",
  title: "Legal",
  description:
    "The documents that govern your use of this site and what happens to anything you send through it: the Terms & Conditions and the Privacy Policy.",
});

const BREADCRUMB = breadcrumbSchema([
  { name: "Famysys Studio", path: "/" },
  { name: "Legal", path: "/legal" },
]);

/**
 * The index the two documents' closing lines point at — famysys.com/legal/ on the parent
 * site, /legal here. Not in the footer, which links the documents directly; reached from
 * the foot of either document, as on the parent.
 */
export default async function LegalIndexRoute() {
  const [navigation, homepage, index] = await Promise.all([
    new GetPrimaryNavigation(container.navigation).execute(),
    new GetHomepageContent(container.marketingContent).execute(),
    new GetLegalIndex(container.legal).execute(),
  ]);

  const navigationView = toNavigationMenuView(navigation);

  return (
    <>
      <JsonLd data={BREADCRUMB} />
      <Header navigation={navigationView} solidAtTop />
      <main id="main-content">
        <LegalIndexPage index={index} />
      </main>
      <Footer entries={navigationView.primaryLinks} footer={toFooterContentView(homepage.footer)} />
    </>
  );
}
