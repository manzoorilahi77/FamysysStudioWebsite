import type { Metadata } from "next";
import Link from "next/link";
import { GetHomepageContent } from "../application/marketing/GetHomepageContent";
import { GetPrimaryNavigation } from "../application/navigation/GetPrimaryNavigation";
import { container } from "../infrastructure/di/container";
import { Container } from "../presentation/components/Container";
import { Footer } from "../presentation/layout/Footer";
import { Header } from "../presentation/layout/Header";
import { toFooterContentView, toNavigationMenuView } from "../presentation/lib/viewModels";
import { SITE_ROUTES } from "../shared/site/site";

/**
 * A REAL PAGE, NOT A LINE OF TEXT.
 *
 * Until now an unmatched URL got Next's built-in 404: black Helvetica on white, no header,
 * no footer, no way out except the back button. Somebody who mistypes a URL or follows a
 * link that has moved is not a broken request to be reported — they are a visitor, and the
 * page they land on is a page of this site like any other.
 *
 * So it carries the navigation and the footer, which is most of the answer: every route on
 * the site is one click away from here. The list below is the other part, because the
 * header's panels open on hover and a keyboard visitor should not have to find that out.
 *
 * `noindex` is deliberate and it is not the default. Next serves this body with a 404
 * status, which most crawlers respect on its own, but a 404 page is reachable at unlimited
 * distinct URLs and any one of them could be linked; saying so explicitly costs one line.
 *
 * The route names are the routes themselves rather than prose labels. Someone who arrived
 * at a URL that does not exist is looking at URLs, and "/creative-services" tells them
 * exactly what they will get where "Our services" asks them to guess again.
 */
export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: true },
};

/** The routes, minus home — the wordmark in the header already goes there. */
const ELSEWHERE = SITE_ROUTES.filter((route) => route !== "/");

export default async function NotFound() {
  // The same three sources every page loads, minus its own content: there is no content
  // for a page that does not exist.
  const [navigation, homepage] = await Promise.all([
    new GetPrimaryNavigation(container.navigation).execute(),
    new GetHomepageContent(container.marketingContent).execute(),
  ]);

  const navigationView = toNavigationMenuView(navigation);

  return (
    <>
      {/* Solid at scroll 0, like /contact and for the same reason: this page opens on
          canvas, and a transparent bar would put canvas nav links on a canvas ground. */}
      <Header navigation={navigationView} solidAtTop />
      <main id="main-content">
        <section className="bg-canvas text-ink">
          <Container>
            <div className="pt-40 pb-24 lg:pt-48 lg:pb-32">
              <p className="label flex items-center gap-3 text-accent">
                <span
                  aria-hidden="true"
                  className="inline-block h-2 w-2 shrink-0"
                  style={{ backgroundColor: "var(--color-accent)" }}
                />
                404
              </p>
              <h1 className="text-heading mt-6 max-w-[20ch] font-medium text-ink">
                This page does not exist.
              </h1>
              <p className="text-body mt-8 text-ink-70" style={{ maxWidth: "52ch" }}>
                The address may have been mistyped, or the page may never have been here. Everything
                the site does have is below.
              </p>
              <ul className="mt-12 flex flex-col gap-3">
                {ELSEWHERE.map((route) => (
                  <li key={route}>
                    <Link
                      href={route}
                      className="text-body text-ink underline-offset-4 hover:underline"
                    >
                      {route}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </Container>
        </section>
      </main>
      <Footer entries={navigationView.primaryLinks} footer={toFooterContentView(homepage.footer)} />
    </>
  );
}
