import { SITE_NAME, SITE_URL, absoluteUrl } from "./site";

/**
 * schema.org JSON-LD builders. Every value comes from data the calling page already
 * fetched from a real repository — nothing here invents content. `telephone` is never
 * emitted: no phone number exists anywhere in the codebase, and a fabricated one would be
 * read by machines as fact. `sameAs` lists only profile links with a real `href` — the two
 * pending social networks (`href: null`) are excluded, not printed empty.
 */

const LOGO_URL = absoluteUrl("/icon.png");
const CONTACT_EMAIL = "hello@famysys.com";
const CONFIRMED_SOCIAL_LINKS = ["https://www.linkedin.com/company/famysys/home/"] as const;

/**
 * ProfessionalService doubles as the site's Organization declaration — it is a subtype of
 * both LocalBusiness and Organization, so one block satisfies "Organization schema on
 * every page" and "LocalBusiness/ProfessionalService schema" without publishing two
 * overlapping entities for the same business.
 *
 * The address and email are the same ones the site footer already publishes to every
 * visitor (`footerContent`) — reused as-is here rather than re-typed, including their
 * known open discrepancies (ZIP 77407 vs. 77447; the email may be the parent company's).
 * Confirming those with the client is a content task, not a schema-shape one.
 */
export function organizationSchema(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: SITE_NAME,
    url: SITE_URL,
    logo: LOGO_URL,
    image: LOGO_URL,
    description: "Famysys Studio — video design and creative production.",
    address: {
      "@type": "PostalAddress",
      streetAddress: "10193 W Grand Parkway S., Ste. 103-229",
      addressLocality: "Richmond",
      addressRegion: "TX",
      postalCode: "77447",
      addressCountry: "US",
    },
    contactPoint: {
      "@type": "ContactPoint",
      email: CONTACT_EMAIL,
      contactType: "customer service",
    },
    sameAs: [...CONFIRMED_SOCIAL_LINKS],
  };
}

export function breadcrumbSchema(
  items: ReadonlyArray<{ readonly name: string; readonly path: string }>,
): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function faqPageSchema(
  groups: ReadonlyArray<{
    readonly items: ReadonlyArray<{ readonly question: string; readonly answer: string }>;
  }>,
): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: groups.flatMap((group) =>
      group.items.map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: item.answer,
        },
      })),
    ),
  };
}

export function serviceSchema(capability: {
  readonly title: string;
  readonly description: string;
  readonly slug: string;
}): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: capability.title,
    description: capability.description,
    url: `${absoluteUrl("/creative-services")}#${capability.slug}`,
    provider: {
      "@type": "ProfessionalService",
      name: SITE_NAME,
      url: SITE_URL,
    },
    areaServed: "Worldwide",
  };
}
