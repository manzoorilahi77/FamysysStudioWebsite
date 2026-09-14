import type { CmsSectionTarget } from "../../../application/cms/EditCmsSection";
import { GetCmsPage } from "../../../application/cms/GetCmsPage";
import type { CmsActivityAction } from "../../../domain/cms/entities/CmsActivityEntry";
import { adminContainer } from "../../../infrastructure/di/adminContainer";

/**
 * THE ONE PLACE EVERY WRITE ROUTE RECORDS WHAT IT DID.
 *
 * Save, publish and preview-with-drafts each call this after their own action already
 * succeeded — never before, and never in a way that could make a successful save or
 * publish look like it failed. `logActivity` itself never throws (see DbCmsRepository), and
 * this wrapper adds the capability check so a route never has to remember it: static mode
 * has nowhere to log to, the same reasoning `supportsDraftPreview` already gets checked for
 * in `preview/route.ts`.
 *
 * The page/section NAMES are looked up here, after the action, rather than carried from the
 * request — the request only ever named ids, and a label is something only the read model
 * can answer.
 */
export async function logActivityFor(
  target: CmsSectionTarget,
  action: CmsActivityAction,
): Promise<void> {
  if (!adminContainer.cms.supportsActivityLog) return;

  const page = await new GetCmsPage(adminContainer.cms).execute(target.pageId);
  const section = page?.sections.find((candidate) => candidate.id === target.sectionId);

  await adminContainer.cms.logActivity({
    action,
    pageLabel: page?.title ?? target.pageId,
    ...(section ? { sectionLabel: section.title } : {}),
  });
}
