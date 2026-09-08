import type { CmsPage } from "../../../domain/cms/entities/CmsPage";
import type { CmsRecord } from "../../../domain/cms/entities/CmsRecord";
import { AdminScreen } from "../components/AdminScreen";
import { SectionEditor } from "../components/SectionEditor";

interface SectionScreenProps {
  readonly page: CmsPage;
  readonly section: CmsRecord;
  readonly canPreviewDrafts: boolean;
  readonly canChangeBlocks: boolean;
}

export function SectionScreen({
  page,
  section,
  canPreviewDrafts,
  canChangeBlocks,
}: SectionScreenProps) {
  return (
    <AdminScreen
      breadcrumb={[
        { label: "Pages" },
        { label: page.title, href: `/admin/pages/${page.id}` },
        { label: section.title },
      ]}
      heading={section.title}
      description={`A block of ${page.title}, rendered at ${page.route}. Save writes a draft and changes nothing on the site; Preview shows the real page with the draft applied; Publish puts it live. Fields that cannot be written say why.`}
    >
      {/* Remounted when the stored content moves, so a save leaves the form showing what was
          written rather than what was typed. */}
      <SectionEditor
        key={String(section.updatedAt?.getTime() ?? 0)}
        section={section}
        target={{ pageId: page.id, sectionId: section.id }}
        route={page.route}
        canPreviewDrafts={canPreviewDrafts}
        canChangeBlocks={canChangeBlocks}
      />
    </AdminScreen>
  );
}
