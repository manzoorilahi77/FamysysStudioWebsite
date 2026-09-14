import type { CmsPage } from "../../../domain/cms/entities/CmsPage";
import { AdminPanel } from "../components/AdminPanel";
import { AdminScreen } from "../components/AdminScreen";
import { SeoRecordEditor } from "../components/SeoRecordEditor";

const DESCRIPTION =
  "Title, meta description, canonical URL and social image for each of the seven pages — saved and published through the same content layer as every other section.";

const STATIC_MODE_NOTE =
  "Content is being read from the TypeScript files. Edits below save as drafts, but Publish will be refused: there is no static-file counterpart yet for a page's title or description to be written back into. Set CONTENT_SOURCE=database for these fields to publish.";

const SECTION_MISSING_NOTE =
  "This page's SEO section did not come back from the content layer. Reload the panel.";

export interface SeoSiteStatus {
  readonly sitemapRouteCount: number;
  readonly sitemapExcludesAdmin: boolean;
  readonly robotsDisallowsAdmin: boolean;
  readonly llmsTxtPresent: boolean;
  readonly structuredDataAvailable: boolean;
  readonly lighthouseRecorded: false;
}

function StatusRow({ label, ok, detail }: { readonly label: string; readonly ok: boolean | null; readonly detail: string }) {
  return (
    <li className="text-small flex items-center justify-between gap-4 px-5 py-3">
      <span className="text-ink">{label}</span>
      <span className={`text-right ${ok === false ? "text-accent" : "text-graphite-70"}`}>{detail}</span>
    </li>
  );
}

export function SeoScreen({
  pages,
  status,
  isStaticMode,
}: {
  readonly pages: ReadonlyArray<CmsPage>;
  readonly status: SeoSiteStatus;
  readonly isStaticMode: boolean;
}) {
  return (
    <AdminScreen breadcrumb={[{ label: "SEO" }]} heading="SEO" description={DESCRIPTION}>
      {isStaticMode ? (
        <p className="text-small mb-6 max-w-[70ch] rounded-sm border border-accent bg-accent-8 px-5 py-4 text-ink">
          {STATIC_MODE_NOTE}
        </p>
      ) : null}

      <AdminPanel label="Site-wide status">
        <ul className="divide-y divide-hairline">
          <StatusRow
            label="Sitemap"
            ok={status.sitemapExcludesAdmin}
            detail={`${status.sitemapRouteCount} routes${status.sitemapExcludesAdmin ? ", /admin excluded" : ", /admin is NOT excluded"}`}
          />
          <StatusRow
            label="robots.txt"
            ok={status.robotsDisallowsAdmin}
            detail={status.robotsDisallowsAdmin ? "Disallows /admin" : "Does not disallow /admin"}
          />
          <StatusRow
            label="llms.txt"
            ok={status.llmsTxtPresent}
            detail={status.llmsTxtPresent ? "Present" : "Not found in /public"}
          />
          <StatusRow
            label="Structured data"
            ok={status.structuredDataAvailable ? null : false}
            detail={status.structuredDataAvailable ? "Module present" : "Not yet available"}
          />
          <StatusRow label="Lighthouse scores" ok={null} detail="Not recorded" />
        </ul>
      </AdminPanel>

      <div className="mt-8 flex flex-col gap-6">
        {pages.map((page) => {
          const record = page.sections.find((section) => section.id === "seo");
          return (
            <AdminPanel key={page.id} label={page.title} meta={page.route}>
              {record ? (
                <SeoRecordEditor pageId={page.id} route={page.route} record={record} />
              ) : (
                <p className="text-small px-5 py-6 text-graphite-70">{SECTION_MISSING_NOTE}</p>
              )}
            </AdminPanel>
          );
        })}
      </div>
    </AdminScreen>
  );
}
