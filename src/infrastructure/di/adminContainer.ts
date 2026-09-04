import { StaticCmsRepository } from "../cms/StaticCmsRepository";
import type { CmsContentRepositories } from "../cms/StaticCmsRepository";
import { DbCmsRepository } from "../db/DbCmsRepository";
import { contentSource } from "../db/env";
import { container } from "./container";

/**
 * The admin panel's composition root, kept apart from the site's.
 *
 * It is handed the SAME repository instances the pages get — `container` is imported, not
 * rebuilt — so the CMS reads exactly what the site renders. What it does not do is put the
 * CMS repository on `container` itself: it reaches the filesystem for content-file
 * timestamps and the media directory listing, and every page of the site imports
 * `container`. Nothing on the public site should pull `node:fs` in behind it for a screen
 * it never shows.
 *
 * WHICH IMPLEMENTATION. The same switch the site uses. With `CONTENT_SOURCE=database` the
 * panel reads and writes rows; with `static` it reads and writes the TypeScript files, as
 * it did before there was a database. Both build the read model with the same code — see
 * DbCmsRepository, which extends the file-backed one rather than reimplementing it — so a
 * screen looks the same either way and only what a save does is different.
 *
 * Note the deliberate absence of a fallback here. The site falls back to the files when
 * the database is unreachable, because a visitor should still see the site. The panel does
 * not: writing to a file while the database is the source of truth would put the two out
 * of step, and an editor is better told the database is down.
 *
 * Only files under src/app/admin import this.
 */
const repositories: CmsContentRepositories = {
  marketingContent: container.marketingContent,
  serviceCatalog: container.serviceCatalog,
  process: container.process,
  engagement: container.engagement,
  portfolio: container.portfolio,
  about: container.about,
  contact: container.contact,
};

export const adminContainer = {
  cms:
    contentSource() === "database"
      ? new DbCmsRepository(repositories)
      : new StaticCmsRepository(repositories),
} as const;
