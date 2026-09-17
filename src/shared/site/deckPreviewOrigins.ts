/**
 * THE SINGLE SOURCE FOR "WHICH LIVE SITES MAY BE FRAMED ON THE CAPABILITY DECK."
 *
 * `middleware.ts`'s deck CSP and the CMS's `AllowedWebsiteUrl` value object both read this
 * list rather than keeping their own copies. That is the fix for the exact failure mode
 * flagged during the CMS's design: a website-gallery entry that validates in the panel but
 * is not in the CSP's `frame-src` renders as a silent empty iframe on the live page. One
 * list, imported twice, makes that drift structurally impossible instead of merely
 * documented against.
 *
 * Adding a new origin here immediately does two things: the CMS accepts it as a
 * `previewUrl`/`liveUrl`/`embedUrl`, and the CSP allows it to be framed. Nothing else needs
 * to change. Removing one does the reverse — any content still pointing at it fails
 * validation on its next save, which is the intended way to notice.
 */
export const DECK_PREVIEW_ORIGINS: ReadonlyArray<string> = [
  // The Presentation category's embed — the parent company's own corporate deck.
  "https://famysys.com",
  // The Websites gallery, in the same order as `websiteProjects` in the deck's content.
  "https://www.bashafood.in",
  "https://ferrobid.aspirasys.in",
  "https://royal.aspirasys.in",
  "https://studiominiminds.com",
  "https://kkmkeychains.in",
  "https://tnhajsociety.org",
  "https://bvaglobal.ai",
];
