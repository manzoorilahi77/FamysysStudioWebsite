import type { CmsPage } from "../../../domain/cms/entities/CmsPage";
import { AdminPanel } from "../components/AdminPanel";
import { AdminRow, AdminRowList } from "../components/AdminRow";
import { AdminScreen } from "../components/AdminScreen";

export function PageScreen({ page }: { readonly page: CmsPage }) {
  return (
    <AdminScreen
      breadcrumb={[
        { label: "Content" },
        { label: "Pages", href: "/admin/pages" },
        { label: page.title },
      ]}
      heading={page.title}
      description={`${page.description} Sections render in the order below, top to bottom.`}
    >
      <AdminPanel label="Sections" meta={`${page.sections.length}`}>
        <AdminRowList>
          {page.sections.map((section) => (
            <AdminRow
              key={section.id}
              title={section.title}
              secondary={section.summary}
              status={section.status}
              updatedAt={section.updatedAt}
              href={`/admin/pages/${page.id}/${section.id}`}
            />
          ))}
        </AdminRowList>
      </AdminPanel>

      <p className="text-small mt-4 text-ink-40">
        Route: {page.route} · Source: {page.source}
      </p>
    </AdminScreen>
  );
}
