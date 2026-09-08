/**
 * IS THIS REQUEST A PREVIEW?
 *
 * Next's draft mode is a signed cookie the framework sets and only the panel's own
 * session-gated endpoint can set it (see app/admin/api/preview). Two things follow from it:
 * the public routes render per request instead of serving their prerendered HTML, and the
 * content store lays `content_drafts` over `content_strings` on the way past. Between them
 * the iframe in the panel shows the REAL page — the same server components, the same CSS,
 * the same layout — with the unpublished words in it, and no page or component knows
 * anything about it.
 *
 * WHY THE IMPORT IS DYNAMIC AND WHY EVERYTHING IS WRAPPED. `next/headers` throws outside a
 * request: in `npm run db:seed`, in a unit test, in a build-time render of a static page.
 * All three are "not a preview", which is exactly what `false` means here, so the failure
 * is caught rather than propagated. Being wrong in the other direction would be the serious
 * one — unpublished words on the public site — and that cannot happen from a throw.
 */
export async function isPreviewRequest(): Promise<boolean> {
  try {
    const { draftMode } = await import("next/headers");
    return (await draftMode()).isEnabled;
  } catch {
    return false;
  }
}
