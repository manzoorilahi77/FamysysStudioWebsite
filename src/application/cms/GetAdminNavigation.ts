import type { CmsStatus } from "../../domain/cms/entities/CmsRecord";
import type { CmsRepository } from "../../domain/cms/repositories/CmsRepository";

/**
 * THE SIDEBAR, DERIVED.
 *
 * It used to be a constant: a list of groups and hrefs, one per screen the panel happened
 * to have. That is how it came to offer Blog, Team Members and Testimonials — a screen
 * existed because a route existed, not because the site had the thing it claimed to edit.
 *
 * So nothing about it is written down any more. The pages are the seven routes the site
 * ships; each page's sections are the blocks that route actually renders, read from the
 * route file; and the draft marks are the sections that have something saved and not
 * published. Add a section to a page and it appears here. Delete one and it goes.
 *
 * Below the pages there is one more item and only one: the inbox, with a count of the
 * enquiries nobody has opened.
 */

export interface AdminNavSection {
  readonly id: string;
  readonly label: string;
  readonly href: string;
  readonly status: CmsStatus;
}

export interface AdminNavPage {
  readonly id: string;
  readonly label: string;
  readonly href: string;
  /** The public route, shown under the page name so the two are never confused. */
  readonly route: string;
  /** DRAFT when any section on the page has unpublished edits. */
  readonly status: CmsStatus;
  readonly sections: ReadonlyArray<AdminNavSection>;
}

export interface AdminNavInbox {
  readonly href: string;
  readonly unread: number;
}

export interface AdminNavigation {
  readonly pages: ReadonlyArray<AdminNavPage>;
  readonly inbox: AdminNavInbox;
  /** How many sections across the whole panel are waiting to be published. */
  readonly draftedSections: number;
}

export class GetAdminNavigation {
  constructor(private readonly repository: CmsRepository) {}

  async execute(): Promise<AdminNavigation> {
    const [pages, inquiries] = await Promise.all([
      this.repository.getPages(),
      // An inbox that cannot be read is an inbox with no badge on it, not a panel that
      // will not render. The screen itself reports the failure with the detail.
      this.repository.getInquiries().catch(() => []),
    ]);

    const navigation = pages.map((page): AdminNavPage => {
      const sections = page.sections.map(
        (section): AdminNavSection => ({
          id: section.id,
          label: section.title,
          href: `/admin/pages/${page.id}/${section.id}`,
          status: section.status,
        }),
      );
      return {
        id: page.id,
        label: page.title,
        href: `/admin/pages/${page.id}`,
        route: page.route,
        status: sections.some((section) => section.status === "draft") ? "draft" : "published",
        sections,
      };
    });

    return {
      pages: navigation,
      inbox: {
        href: "/admin/inbox",
        unread: inquiries.filter((inquiry) => inquiry.status === "new").length,
      },
      draftedSections: navigation.reduce(
        (total, page) => total + page.sections.filter((s) => s.status === "draft").length,
        0,
      ),
    };
  }
}
