import type { CmsRepository } from "../../domain/cms/repositories/CmsRepository";
import type { CmsStatus } from "../../domain/cms/entities/CmsRecord";

/** One line on the dashboard: a content type, how much of it there is, and where it lives. */
export interface CmsDashboardEntry {
  readonly id: string;
  readonly label: string;
  readonly description: string;
  readonly count: number;
  readonly href: string;
  readonly status: CmsStatus;
  readonly updatedAt: Date | null;
}

export interface CmsDashboard {
  readonly pages: ReadonlyArray<CmsDashboardEntry>;
  readonly collections: ReadonlyArray<CmsDashboardEntry>;
  readonly media: CmsDashboardEntry;
  readonly inquiries: CmsDashboardEntry;
}

const DRAFT: CmsStatus = "draft";

/** The most recent timestamp in a set, or `null` when none of them has one. */
function latest(dates: ReadonlyArray<Date | null>): Date | null {
  const known = dates.filter((date): date is Date => date !== null);
  if (known.length === 0) {
    return null;
  }
  return known.reduce((newest, date) => (date > newest ? date : newest));
}

/**
 * The dashboard is a count of everything else, so it reads the same four methods the
 * section views read rather than a fifth summary method on the repository — a summary
 * that could be computed differently from the lists it summarises is a summary that will
 * eventually disagree with them.
 */
export class GetCmsDashboard {
  constructor(private readonly repository: CmsRepository) {}

  async execute(): Promise<CmsDashboard> {
    const [pages, collections, media, inquiries] = await Promise.all([
      this.repository.getPages(),
      this.repository.getCollections(),
      this.repository.getMediaLibrary(),
      this.repository.getInquiries(),
    ]);

    return {
      pages: pages.map((page) => ({
        id: page.id,
        label: page.title,
        description: page.description,
        count: page.sections.length,
        href: `/admin/pages/${page.id}`,
        status: DRAFT,
        updatedAt: page.updatedAt,
      })),
      collections: collections.map((collection) => ({
        id: collection.id,
        label: collection.label,
        description: collection.description,
        count: collection.records.length,
        href: `/admin/${collection.id}`,
        status: DRAFT,
        updatedAt: latest(collection.records.map((record) => record.updatedAt)),
      })),
      media: {
        id: "library",
        label: "Library",
        description: "Every image and video file the content refers to.",
        count: media.length,
        href: "/admin/library",
        status: DRAFT,
        updatedAt: latest(media.map((asset) => asset.updatedAt)),
      },
      inquiries: {
        id: "inquiries",
        label: "Inquiries",
        description: "Contact form submissions.",
        count: inquiries.length,
        href: "/admin/inquiries",
        status: DRAFT,
        updatedAt: latest(inquiries.map((inquiry) => inquiry.receivedAt)),
      },
    };
  }
}
