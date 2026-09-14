import type { CmsActivityEntry } from "../../domain/cms/entities/CmsActivityEntry";
import type { CmsRepository } from "../../domain/cms/repositories/CmsRepository";
import { GetAdminNavigation } from "./GetAdminNavigation";

/**
 * THE PANEL'S LANDING SCREEN, AND WHY IT IS ALLOWED TO EXIST THIS TIME.
 *
 * `src/app/admin/(panel)/page.tsx` used to redirect straight to the homepage editor, with a
 * note explaining a prior dashboard was removed for counting things nobody had asked about.
 * Every number here answers a real, standing question instead: how much work is sitting
 * unpublished and where, how many enquiries came in and when, what actually just happened.
 * Nothing here is decorative — see `draftList`, which both answers "how much is unfinished"
 * and IS the "quick links to unfinished work" the screen offers, rather than a second list
 * built to satisfy that separately.
 *
 * Every count is derived from the same read model the rest of the panel already trusts —
 * `GetAdminNavigation`'s `.draftedSections` and `.pages`, and `getInquiries()` — so there is
 * no second source of truth for "how many sections are drafted" that could drift from what
 * the sidebar itself says.
 */

const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;
const RECENT_ACTIVITY_LIMIT = 15;

export interface DashboardDraftItem {
  readonly pageLabel: string;
  readonly pageHref: string;
  readonly sectionLabel: string;
  readonly sectionHref: string;
}

export interface DashboardOverview {
  readonly totalSections: number;
  readonly draftSections: number;
  readonly publishedSections: number;
  /** Every drafted section, page first — the quick-links list. */
  readonly draftList: ReadonlyArray<DashboardDraftItem>;
  readonly inquiryCounts: {
    readonly last24h: number;
    readonly last7d: number;
    readonly last30d: number;
  };
  readonly recentActivity: ReadonlyArray<CmsActivityEntry>;
  readonly supportsActivityLog: boolean;
}

export class GetDashboardOverview {
  constructor(private readonly repository: CmsRepository) {}

  async execute(): Promise<DashboardOverview> {
    const [navigation, inquiries, recentActivity] = await Promise.all([
      new GetAdminNavigation(this.repository).execute(),
      this.repository.getInquiries().catch(() => []),
      this.repository.supportsActivityLog
        ? this.repository.getRecentActivity(RECENT_ACTIVITY_LIMIT)
        : Promise.resolve([]),
    ]);

    const totalSections = navigation.pages.reduce((total, page) => total + page.sections.length, 0);
    const draftSections = navigation.draftedSections;

    const draftList: ReadonlyArray<DashboardDraftItem> = navigation.pages.flatMap((page) =>
      page.sections
        .filter((section) => section.status === "draft")
        .map((section) => ({
          pageLabel: page.label,
          pageHref: page.href,
          sectionLabel: section.label,
          sectionHref: section.href,
        })),
    );

    const now = Date.now();
    const within = (ms: number) =>
      inquiries.filter((inquiry) => now - inquiry.receivedAt.getTime() <= ms).length;

    return {
      totalSections,
      draftSections,
      publishedSections: totalSections - draftSections,
      draftList,
      inquiryCounts: {
        last24h: within(DAY_MS),
        last7d: within(7 * DAY_MS),
        last30d: within(30 * DAY_MS),
      },
      recentActivity,
      supportsActivityLog: this.repository.supportsActivityLog,
    };
  }
}
