import Link from "next/link";
import { GetDashboardOverview } from "../../../../application/cms/GetDashboardOverview";
import { adminContainer } from "../../../../infrastructure/di/adminContainer";
import { AdminPanel, AdminPanelEmpty } from "../../../../presentation/admin/components/AdminPanel";
import { AdminScreen } from "../../../../presentation/admin/components/AdminScreen";
import { relativeTime } from "../../../../presentation/admin/lib/relativeTime";

export const dynamic = "force-dynamic";

const DESCRIPTION =
  "What is unpublished, how many enquiries came in, and what the panel has just done — every number real, none of them decorative.";

const RANGES = [
  { key: "24h", label: "24 hours" },
  { key: "7d", label: "7 days" },
  { key: "30d", label: "30 days" },
] as const;

type RangeKey = (typeof RANGES)[number]["key"];

const ACTIVITY_LABEL: Record<"saved" | "published" | "previewed", string> = {
  saved: "Saved",
  published: "Published",
  previewed: "Previewed",
};

const NO_ACTIVITY_LOG =
  "There is nowhere to keep a log while content is read from the TypeScript files — an activity feed needs a database. Set CONTENT_SOURCE=database to see one.";

function activeRange(value: string | undefined): RangeKey {
  return value === "24h" || value === "7d" || value === "30d" ? value : "7d";
}

export default async function AdminDashboardRoute({
  searchParams,
}: {
  readonly searchParams: Promise<{ readonly range?: string }>;
}) {
  const params = await searchParams;
  const range = activeRange(params.range);
  const overview = await new GetDashboardOverview(adminContainer.cms).execute();
  const inquiryCountFor: Record<RangeKey, number> = {
    "24h": overview.inquiryCounts.last24h,
    "7d": overview.inquiryCounts.last7d,
    "30d": overview.inquiryCounts.last30d,
  };

  return (
    <AdminScreen breadcrumb={[{ label: "Dashboard" }]} heading="Dashboard" description={DESCRIPTION}>
      <div className="grid gap-6 lg:grid-cols-2">
        <AdminPanel
          label="Sections"
          meta={`${overview.draftSections} draft · ${overview.publishedSections} published`}
        >
          {overview.draftList.length === 0 ? (
            <AdminPanelEmpty message="Everything on every page is published. Nothing is waiting." />
          ) : (
            <ul className="divide-y divide-hairline">
              {overview.draftList.map((item) => (
                <li key={item.sectionHref}>
                  <Link
                    href={item.sectionHref}
                    className="text-small flex items-center justify-between gap-4 px-5 py-3 transition-colors duration-[180ms] hover:bg-ink-4"
                  >
                    <span className="min-w-0 truncate text-ink">
                      {item.pageLabel} <span aria-hidden="true">›</span> {item.sectionLabel}
                    </span>
                    <span className="label shrink-0 text-accent">Draft</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </AdminPanel>

        <AdminPanel label="Enquiries" meta={`${inquiryCountFor[range]} in the last ${range}`}>
          <div className="flex flex-wrap items-center gap-2 border-b border-hairline px-5 py-3">
            {RANGES.map((entry) => (
              <Link
                key={entry.key}
                href={`/admin/dashboard?range=${entry.key}`}
                aria-current={range === entry.key ? "true" : undefined}
                className={`label rounded-sm px-3 py-1.5 transition-colors duration-[180ms] ${
                  range === entry.key
                    ? "bg-ink text-canvas"
                    : "border border-ink-12 text-ink-60 hover:bg-ink-4"
                }`}
              >
                {entry.label}
              </Link>
            ))}
          </div>
          <p className="text-metric px-5 py-8 text-ink">{inquiryCountFor[range]}</p>
        </AdminPanel>
      </div>

      <div className="mt-6">
        <AdminPanel label="Recent activity">
          {!overview.supportsActivityLog ? (
            <AdminPanelEmpty message={NO_ACTIVITY_LOG} />
          ) : overview.recentActivity.length === 0 ? (
            <AdminPanelEmpty message="Nothing has been saved, published or previewed yet." />
          ) : (
            <ul className="divide-y divide-hairline">
              {overview.recentActivity.map((entry) => (
                <li
                  key={`${entry.action}-${entry.pageLabel}-${entry.sectionLabel ?? ""}-${entry.occurredAt.toISOString()}`}
                  className="text-small flex items-center justify-between gap-4 px-5 py-3"
                >
                  <span className="min-w-0 truncate text-ink">
                    <span className="text-graphite-70">{ACTIVITY_LABEL[entry.action]}</span>{" "}
                    {entry.pageLabel}
                    {entry.sectionLabel ? (
                      <>
                        {" "}
                        <span aria-hidden="true">›</span> {entry.sectionLabel}
                      </>
                    ) : null}
                  </span>
                  <span className="text-small tabular shrink-0 text-ink-40">
                    {relativeTime(entry.occurredAt)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </AdminPanel>
      </div>
    </AdminScreen>
  );
}
