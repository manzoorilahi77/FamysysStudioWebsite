import type { AboutPage } from "../../domain/about/entities/AboutPage";
import type { CmsMediaAsset } from "../../domain/cms/entities/CmsMediaAsset";
import type { WaysToWorkPage } from "../../domain/engagement/entities/WaysToWorkPage";
import type { SelectedWorkPage } from "../../domain/portfolio/entities/SelectedWorkPage";
import type { HowWeWorkPage } from "../../domain/process/entities/HowWeWorkPage";
import type { CreativeServicesPage } from "../../domain/services/entities/CreativeServicesPage";
import type { MediaRef } from "../../domain/shared/value-objects/MediaRef";
import type { MarketingContent } from "./marketingContent";
import { readMediaDirectory } from "./contentSources";

/**
 * THE LIBRARY IS THE DIRECTORY, NOT THE REFERENCES.
 *
 * `public/media` is listed from disk, so a file nobody points at still appears — an
 * orphan is exactly the thing a media screen exists to show, and a library assembled
 * only from the content's own `MediaRef`s could never contain one.
 *
 * Usage runs the other way: every `MediaRef` the content carries is collected and
 * matched back to a file by path, which is what fills the "used by" column and what makes
 * an unreferenced file visible as an empty one.
 */

const MEDIA_DIRECTORY = "public/media";
const MEDIA_ROUTE = "/media";

export interface MediaSources {
  readonly homepage: MarketingContent;
  readonly creativeServices: CreativeServicesPage;
  readonly howWeWork: HowWeWorkPage;
  readonly waysToWork: WaysToWorkPage;
  readonly selectedWork: SelectedWorkPage;
  readonly about: AboutPage;
}

interface MediaUse {
  readonly media: MediaRef;
  readonly owner: string;
}

function mediaUse(owner: string, media: MediaRef): MediaUse {
  return { owner, media };
}

/** Every `MediaRef` the site renders, with the record it belongs to. */
function collectUses(sources: MediaSources): ReadonlyArray<MediaUse> {
  const { homepage, creativeServices, howWeWork, waysToWork, selectedWork, about } = sources;

  return [
    ...homepage.hero.bands.map((band) => mediaUse("Home — Hero accordion", band.media)),
    ...homepage.differentiator.elements.map((element) => mediaUse(element.title, element.media)),
    ...homepage.whyFamysys.reasons.map((reason) => mediaUse(reason.title, reason.media)),
    mediaUse("Creative Services — Hero", creativeServices.hero.media),
    ...creativeServices.capabilities.map((capability) =>
      mediaUse(capability.title, capability.media),
    ),
    ...howWeWork.steps.map((step) => mediaUse(step.title, step.media)),
    ...waysToWork.tiers.map((tier) => mediaUse(tier.name, tier.media)),
    mediaUse(waysToWork.custom.name, waysToWork.custom.media),
    ...selectedWork.pieces.map((piece) => mediaUse(piece.title, piece.media)),
    mediaUse("About — Hero", about.hero.media),
    ...about.approach.claims.map((claim) => mediaUse(claim.title, claim.media)),
    mediaUse("About — Part of Famysys", about.ecosystem.media),
    mediaUse("About — Where we are going", about.direction.media),
  ];
}

/** Owners keyed by the path they point at, deduplicated and in first-seen order. */
function usageByPath(uses: ReadonlyArray<MediaUse>): ReadonlyMap<string, ReadonlyArray<string>> {
  return uses.reduce((byPath, entry) => {
    const path = entry.media.src.value;
    const owners = byPath.get(path) ?? [];
    if (!owners.includes(entry.owner)) {
      byPath.set(path, [...owners, entry.owner]);
    }
    return byPath;
  }, new Map<string, ReadonlyArray<string>>());
}

function extensionOf(fileName: string): string {
  const dot = fileName.lastIndexOf(".");
  return dot === -1 ? "" : fileName.slice(dot + 1).toLowerCase();
}

export function buildMediaLibrary(sources: MediaSources): ReadonlyArray<CmsMediaAsset> {
  const usage = usageByPath(collectUses(sources));

  return readMediaDirectory(MEDIA_DIRECTORY).map((file) => {
    const path = `${MEDIA_ROUTE}/${file.name}`;
    return {
      id: file.name,
      path,
      extension: extensionOf(file.name),
      byteSize: file.byteSize,
      updatedAt: file.modifiedAt,
      usedBy: usage.get(path) ?? [],
    };
  });
}
