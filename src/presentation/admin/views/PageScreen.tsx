import type { CmsPage } from "../../../domain/cms/entities/CmsPage";
import { AdminPanel } from "../components/AdminPanel";
import { AdminRow, AdminRowList } from "../components/AdminRow";
import { AdminScreen } from "../components/AdminScreen";

/**
 * ONE PAGE, AND THE BLOCKS IT RENDERS.
 *
 * The list is the page's own composition read top to bottom — the same list the sidebar
 * expands to — so it is also a map of the page: an editor who does not know where a sentence
 * lives can find it by remembering roughly how far down the page it is.
 *
 * WHAT CANNOT BE DONE HERE IS SAID HERE. Pages cannot be added or removed, and neither can
 * sections: both come from the code. Saying it on the screen is cheaper than someone looking
 * for the button for ten minutes.
 */
export function PageScreen({ page }: { readonly page: CmsPage }) {
  const drafted = page.sections.filter((section) => section.status === "draft").length;

  return (
    <AdminScreen
      breadcrumb={[{ label: "Pages" }, { label: page.title }]}
      heading={page.title}
      description={`${page.description} The blocks below are what this page renders, in the order it renders them. Pages cannot be added or removed here — the routes in the code decide which seven exist — and nor can blocks, for the same reason.`}
    >
      <AdminPanel
        label="Sections"
        meta={
          drafted > 0
            ? `${page.sections.length} · ${drafted} unpublished`
            : `${page.sections.length}`
        }
      >
        <AdminRowList>
          {page.sections.map((section) => (
            <AdminRow
              key={section.id}
              title={section.title}
              secondary={section.note ?? section.summary}
              status={section.status}
              updatedAt={section.updatedAt}
              href={`/admin/pages/${page.id}/${section.id}`}
            />
          ))}
        </AdminRowList>
      </AdminPanel>

      <p className="text-small mt-4 max-w-[70ch] text-ink-40">
        Live at {page.route} ·{" "}
        {page.sectionsAreDerived
          ? "This list is read from the page's own code, so a block added to the page appears here on its own."
          : "The page's source could not be read on this server, so this is the order the panel last declared rather than the order the page renders."}
      </p>
    </AdminScreen>
  );
}
