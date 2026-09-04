import type { CmsPage } from "../../../domain/cms/entities/CmsPage";
import type { CmsRecord } from "../../../domain/cms/entities/CmsRecord";
import { AdminScreen } from "../components/AdminScreen";
import { RecordEditor } from "../components/RecordEditor";

interface SectionScreenProps {
  readonly page: CmsPage;
  readonly section: CmsRecord;
}

export function SectionScreen({ page, section }: SectionScreenProps) {
  return (
    <AdminScreen
      breadcrumb={[
        { label: "Content" },
        { label: "Pages", href: "/admin/pages" },
        { label: page.title, href: `/admin/pages/${page.id}` },
        { label: section.title },
      ]}
      heading={section.title}
      description={`A section of ${page.title}, rendered at ${page.route}. Sections cannot be added or removed — the page's layout decides which exist. Fields that cannot be written say why.`}
    >
      <RecordEditor
        key={String(section.updatedAt?.getTime() ?? 0)}
        record={section}
        target={{ kind: "section", pageId: page.id, sectionId: section.id }}
      />
    </AdminScreen>
  );
}
