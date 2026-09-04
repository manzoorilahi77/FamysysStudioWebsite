import type { CmsDashboard } from "../../../application/cms/GetCmsDashboard";
import { AdminPanel } from "../components/AdminPanel";
import { AdminRow, AdminRowList } from "../components/AdminRow";
import { AdminScreen } from "../components/AdminScreen";

const DESCRIPTION =
  "Everything the site renders, counted. This phase is read-only: the panel proves the content model before anything is wired to save.";

function count(total: number, singular: string): string {
  return `${total} ${singular}${total === 1 ? "" : "s"}`;
}

export function DashboardScreen({ dashboard }: { readonly dashboard: CmsDashboard }) {
  const totalSections = dashboard.pages.reduce((sum, page) => sum + page.count, 0);

  return (
    <AdminScreen
      breadcrumb={[{ label: "Dashboard" }]}
      heading="Dashboard"
      description={DESCRIPTION}
    >
      <div className="flex flex-col gap-6">
        <AdminPanel
          label="Pages"
          meta={`${dashboard.pages.length} · ${count(totalSections, "section")}`}
        >
          <AdminRowList>
            {dashboard.pages.map((entry) => (
              <AdminRow
                key={entry.id}
                title={entry.label}
                secondary={count(entry.count, "section")}
                status={entry.status}
                updatedAt={entry.updatedAt}
                href={entry.href}
              />
            ))}
          </AdminRowList>
        </AdminPanel>

        <AdminPanel label="Collections" meta={`${dashboard.collections.length}`}>
          <AdminRowList>
            {dashboard.collections.map((entry) => (
              <AdminRow
                key={entry.id}
                title={entry.label}
                secondary={count(entry.count, "record")}
                status={entry.status}
                updatedAt={entry.updatedAt}
                href={entry.href}
              />
            ))}
          </AdminRowList>
        </AdminPanel>

        <AdminPanel label="Media and inbox" meta="2">
          <AdminRowList>
            <AdminRow
              title={dashboard.media.label}
              secondary={count(dashboard.media.count, "file")}
              status={dashboard.media.status}
              updatedAt={dashboard.media.updatedAt}
              href={dashboard.media.href}
            />
            <AdminRow
              title={dashboard.inquiries.label}
              secondary={count(dashboard.inquiries.count, "submission")}
              status={dashboard.inquiries.status}
              updatedAt={dashboard.inquiries.updatedAt}
              href={dashboard.inquiries.href}
            />
          </AdminRowList>
        </AdminPanel>
      </div>
    </AdminScreen>
  );
}
