import type { CmsMediaAsset } from "../../../domain/cms/entities/CmsMediaAsset";
import { AdminPanel, AdminPanelEmpty } from "../components/AdminPanel";
import { AdminRow, AdminRowList } from "../components/AdminRow";
import { AdminScreen } from "../components/AdminScreen";
import { fileSize } from "../lib/relativeTime";

const DESCRIPTION =
  "Every file in public/media, listed from disk rather than from the content — so a file nothing points at still appears here, which is the only way to see one.";

const UNREFERENCED = "Not referenced by any record.";

function secondaryLine(asset: CmsMediaAsset): string {
  if (asset.usedBy.length === 0) {
    return `${fileSize(asset.byteSize)} · ${UNREFERENCED}`;
  }
  return `${fileSize(asset.byteSize)} · ${asset.usedBy.join(", ")}`;
}

export function LibraryScreen({ assets }: { readonly assets: ReadonlyArray<CmsMediaAsset> }) {
  const unreferenced = assets.filter((asset) => asset.usedBy.length === 0).length;
  const total = assets.reduce((sum, asset) => sum + asset.byteSize, 0);

  return (
    <AdminScreen
      breadcrumb={[{ label: "Media" }, { label: "Library" }]}
      heading="Library"
      description={DESCRIPTION}
    >
      <AdminPanel label="All files" meta={`${assets.length} · ${fileSize(total)}`}>
        {assets.length === 0 ? (
          <AdminPanelEmpty message="No files in public/media." />
        ) : (
          <AdminRowList>
            {assets.map((asset) => (
              <AdminRow
                key={asset.id}
                title={asset.id}
                secondary={secondaryLine(asset)}
                status="draft"
                updatedAt={asset.updatedAt}
              />
            ))}
          </AdminRowList>
        )}
      </AdminPanel>

      <p className="text-small mt-4 text-ink-40">
        {unreferenced === 0
          ? "Every file is referenced."
          : `${unreferenced} unreferenced by any record.`}
      </p>
    </AdminScreen>
  );
}
