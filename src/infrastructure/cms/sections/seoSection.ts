import type { CmsRecord } from "../../../domain/cms/entities/CmsRecord";
import { MediaRef } from "../../../domain/shared/value-objects/MediaRef";
import { media, toRecord } from "../records";

/**
 * ONE SECTION PER PAGE, THE SAME SHAPE AS EVERY OTHER SECTION — built once here and appended
 * to each page's declared sections in `pages.ts`, rather than duplicated into all seven
 * section-builder modules.
 *
 * ITS THREE TEXT VALUES CARRY NO POINTER. Every other field in the CMS has one, because
 * every other field already lives somewhere in the TypeScript content modules for a
 * pointer to name. A page's `<title>` and meta description do not — they are literals
 * inline in each route's `pageMetadata()` call, not properties of a `MarketingContent`-
 * shaped object — so there is nothing for a pointer to point at yet. This is the same shape
 * `CmsMedia.src` has always had (see its own doc comment): no pointer, still a real
 * `content_strings` row, still fully editable in the database. `ValueField` treats "no
 * pointer" as locked only when a `readOnlyReason` is also given, which these fields never
 * are.
 *
 * THE OPEN GRAPH IMAGE DEFAULTS TO THE SITE'S GENERATED CARD (`/opengraph-image`, built by
 * `src/app/opengraph-image.tsx`) rather than to a file under `/media/`. It renders correctly
 * as-is; replacing it through this field uploads a real file the same way every other image
 * field does, which is the only way a saved edit to it can ever be published — see the note
 * on `mediaSrc` validation requiring a `/media/` path.
 */

const DEFAULT_OG_IMAGE_SRC = "/opengraph-image";
const DEFAULT_OG_IMAGE_ALT = "Famysys Studio";
const OG_IMAGE_ASPECT_RATIO = "16:9";

export interface SeoSectionInput {
  readonly pageId: string;
  readonly route: string;
  readonly title: string;
  readonly description: string;
  readonly updatedAt: Date | null;
}

export function seoSection(input: SeoSectionInput): CmsRecord {
  const ogImage = MediaRef.create({
    kind: "image",
    src: DEFAULT_OG_IMAGE_SRC,
    alt: DEFAULT_OG_IMAGE_ALT,
    aspectRatio: OG_IMAGE_ASPECT_RATIO,
  });

  return toRecord({
    id: "seo",
    title: "SEO",
    summary: `What search shows for ${input.route === "/" ? "the homepage" : input.route}.`,
    updatedAt: input.updatedAt,
    address: { kind: "page_section", key: `${input.pageId}:seo` },
    groups: [
      {
        label: "Search & sharing",
        description:
          "What appears in a search result and a link preview for this page. Saves and publishes the same way as every other section.",
        values: [
          { label: "Title", value: input.title, kind: "seoTitle" },
          {
            label: "Meta description",
            value: input.description,
            kind: "seoDescription",
            multiline: true,
          },
          { label: "Canonical URL", value: input.route, kind: "seoCanonical" },
        ],
        media: [media("Open Graph image", ogImage, undefined)],
      },
    ],
  });
}
