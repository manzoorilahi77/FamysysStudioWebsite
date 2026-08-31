/**
 * The one definition of how a capability title becomes a URL fragment.
 *
 * Three places need it and they must agree exactly, because they are two ends of the same
 * link: the navigation builds `/creative-services#<slug>`, Creative Services renders the
 * section with that id, and Selected Work links each piece's capabilities back to the
 * same fragments. Three private copies of the same four lines is three chances for one of
 * them to drift and turn every cross-link into a scroll to nowhere.
 *
 * The ampersand is dropped rather than transliterated, so "Motion Graphics & Advanced
 * Creative" becomes `motion-graphics-advanced-creative` and not `-and-`.
 */
export function slugifyTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/&/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
