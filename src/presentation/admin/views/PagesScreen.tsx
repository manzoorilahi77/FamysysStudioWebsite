import type { CmsPage } from "../../../domain/cms/entities/CmsPage";
import { AdminPanel } from "../components/AdminPanel";
import { AdminRow, AdminRowList } from "../components/AdminRow";
import { AdminScreen } from "../components/AdminScreen";

const DESCRIPTION =
  "Pages come from the site contract — the routes decide which exist, so none can be added here and none removed. What you edit is the sections inside them.";

export function PagesScreen({ pages }: { readonly pages: ReadonlyArray<CmsPage> }) {
  return (
    <AdminScreen
      breadcrumb={[{ label: "Content" }, { label: "Pages" }]}
      heading="Pages"
      description={DESCRIPTION}
    >
      <AdminPanel label="All pages" meta={`${pages.length}`}>
        <AdminRowList>
          {pages.map((page) => (
            <AdminRow
              key={page.id}
              title={page.title}
              secondary={`${page.route} · ${page.sections.length} sections`}
              status="draft"
              updatedAt={page.updatedAt}
              href={`/admin/pages/${page.id}`}
            />
          ))}
        </AdminRowList>
      </AdminPanel>
    </AdminScreen>
  );
}
