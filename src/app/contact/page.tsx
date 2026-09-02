import type { Metadata } from "next";
import { GetContactPage } from "../../application/contact/GetContactPage";
import { GetHomepageContent } from "../../application/marketing/GetHomepageContent";
import { GetPrimaryNavigation } from "../../application/navigation/GetPrimaryNavigation";
import { container } from "../../infrastructure/di/container";
import { Footer } from "../../presentation/layout/Footer";
import { Header } from "../../presentation/layout/Header";
import { ContactFormSection } from "../../presentation/sections/ContactFormSection";
import { ContactHero } from "../../presentation/sections/ContactHero";
import { toFooterContentView, toNavigationMenuView } from "../../presentation/lib/viewModels";

export const metadata: Metadata = {
  title: "Contact — Famysys Studio",
  description:
    "Tell Famysys Studio what you are trying to create, who it is for and when you need it. Send a brief and hear back from the person who would direct the work.",
};

/**
 * The seventh and last page, and the destination of nearly every call to action on the
 * other six.
 *
 * TWO SECTIONS, where the other inner pages have six to ten. Someone arriving here has
 * already decided to get in touch; a page that made them read four more blocks before
 * reaching the form would be arguing a case that has already been won.
 *
 * It is also the only page that opens LIGHT — see ContactHero — which is why it is the one
 * route passing `solidAtTop` to the header. The bar is transparent at scroll 0 everywhere
 * else; over a canvas hero that would render canvas nav links on a canvas ground.
 *
 * There is no FinalCta here, for the obvious reason: the closing call to action on every
 * other page points at this one, and the form below IS the ask.
 */
export default async function ContactRoute() {
  const [navigation, homepage, page] = await Promise.all([
    new GetPrimaryNavigation(container.navigation).execute(),
    new GetHomepageContent(container.marketingContent).execute(),
    new GetContactPage(container.contact).execute(),
  ]);

  const navigationView = toNavigationMenuView(navigation);

  return (
    <>
      {/* The only route that passes this. The bar is transparent at scroll 0 everywhere
          else because everywhere else opens on ink; ContactHero opens on canvas, and a
          transparent bar would put canvas nav links on a canvas ground at 1:1. */}
      <Header navigation={navigationView} solidAtTop />
      <main id="main-content">
        <ContactHero hero={page.hero} />
        <ContactFormSection form={page.form} panel={page.panel} />
      </main>
      <Footer entries={navigationView.primaryLinks} footer={toFooterContentView(homepage.footer)} />
    </>
  );
}
