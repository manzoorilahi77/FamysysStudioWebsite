import type { Metadata } from "next";
import { SITE_NAME, SITE_URL, absoluteUrl } from "./site";

/**
 * ONE PLACE THAT KNOWS WHAT A PAGE OF THIS SITE LOOKS LIKE TO A CRAWLER OR A LINK PREVIEW.
 *
 * Seven pages each need a title, a description, a canonical URL and an Open Graph card,
 * and six of the ten fields involved are the same on every one of them. Written out per
 * page, the six identical ones drift: someone adds a page, copies the block from a
 * neighbour, and the new page advertises the neighbour's canonical URL. So a page states
 * only what is its own — its route, its title, its description — and this fills in the
 * rest.
 *
 * THE CARD IMAGE HAS TO BE NAMED HERE, which is not obvious and was wrong first time.
 * src/app/opengraph-image.tsx attaches itself to routes that do not state an `openGraph`
 * of their own — and every page using this helper states one. Next replaces the inherited
 * object rather than merging into it, so the six inner pages shipped with a full set of
 * Open Graph tags and no picture at all, while the homepage looked right. The URL is
 * relative and resolves against `metadataBase`.
 */
/**
 * The one card every page shares, produced by src/app/opengraph-image.tsx at build time.
 *
 * The dimensions are stated rather than left to be discovered: several previews render
 * the card from the tag alone, before the image has been fetched, and one without a size
 * is laid out as a small square thumbnail instead of a wide banner.
 */
const OPEN_GRAPH_IMAGE = {
  url: "/opengraph-image",
  width: 1200,
  height: 630,
  alt: SITE_NAME,
} as const;

export function pageMetadata({
  route,
  title,
  description,
}: {
  /** The route this metadata belongs to, e.g. "/about". Used for the canonical URL. */
  readonly route: string;
  /**
   * The page's own name, WITHOUT the site name — the root layout's title template appends
   * that. "About", not "About — Famysys Studio", which would render as
   * "About — Famysys Studio — Famysys Studio".
   */
  readonly title: string;
  readonly description: string;
}): Metadata {
  return {
    title,
    description,
    alternates: { canonical: absoluteUrl(route) },
    openGraph: {
      // The title is spelled out with the site name because an Open Graph card is not
      // rendered inside a browser tab that already says which site it is — it is a card in
      // somebody's feed, with nothing around it.
      title: `${title} — ${SITE_NAME}`,
      description,
      url: absoluteUrl(route),
      siteName: SITE_NAME,
      locale: "en_US",
      type: "website",
      images: [OPEN_GRAPH_IMAGE],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} — ${SITE_NAME}`,
      description,
      images: [OPEN_GRAPH_IMAGE.url],
    },
  };
}

/**
 * The root layout's metadata: everything a page does not override, plus the two things
 * only the root can state.
 *
 * `metadataBase` is one of them. Without it, every relative URL Next resolves — the Open
 * Graph image above all — is emitted against localhost in development and against
 * whatever Next guesses in production, and a link preview that points at localhost shows
 * nothing at all.
 *
 * The title `template` is the other. Each page names itself and the site name is appended
 * here, so renaming the studio is one edit rather than seven.
 */
export const rootMetadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_NAME,
    template: `%s — ${SITE_NAME}`,
  },
  description: "Famysys Studio — video design and creative production.",
  applicationName: SITE_NAME,
  openGraph: {
    title: SITE_NAME,
    description: "Famysys Studio — video design and creative production.",
    url: SITE_URL,
    siteName: SITE_NAME,
    locale: "en_US",
    type: "website",
    images: [OPEN_GRAPH_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: "Famysys Studio — video design and creative production.",
    images: [OPEN_GRAPH_IMAGE.url],
  },
};

/**
 * The homepage, which is the one page whose title is not "<its name> — Famysys Studio".
 *
 * `absolute` suppresses the root template: at the site's front door the site's name IS
 * the title, and "Famysys Studio — Famysys Studio" is what the template would otherwise
 * produce. The description is the hero's own body copy rather than a summary written for
 * search — the words the client approved for the first thing a visitor reads are also the
 * right words for the first thing a searcher reads.
 */
export const homeMetadata: Metadata = {
  ...pageMetadata({
    route: "/",
    title: SITE_NAME,
    description:
      "Design, video, AI-powered content, motion and product visuals — produced by a flexible creative team that helps businesses create high-quality content efficiently and at better value.",
  }),
  title: { absolute: SITE_NAME },
};
