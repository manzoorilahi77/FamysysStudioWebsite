# The database

MySQL 8.0, on the same host as the site. The content the seven pages render lives here;
the TypeScript modules under `src/infrastructure/content/static/` are the fallback and the
thing the database was seeded from.

## Setting it up

```bash
cp .env.example .env.local     # then fill it in — see the notes in that file
npm run db:migrate             # create the tables
npm run db:seed                # populate them from the content modules
```

Both are safe to run again. `db:migrate` applies only what has not been applied;
`db:seed` upserts on natural keys and, by default, **refreshes a string's metadata and
leaves its value alone** — so re-seeding after someone has edited content in the panel
does not revert their work. `npm run db:seed -- --force` is the explicit "the files are
right, the database is wrong" switch.

| Command                       | What it does                                                   |
| ----------------------------- | -------------------------------------------------------------- |
| `npm run db:migrate`          | Applies pending migrations, in numeric order, once each.       |
| `npm run db:migrate -- --dry` | Lists what would be applied. Changes nothing.                  |
| `npm run db:seed`             | Inserts what is missing. Leaves existing values alone.         |
| `npm run db:seed -- --dry`    | Reports what it would write, inside a rolled-back transaction. |
| `npm run db:seed -- --force`  | Resets every value to what the content modules say.            |

## Migrations

Numbered SQL files in `db/migrations/`, applied in order and recorded in
`schema_migrations` with a SHA-256 of their bytes. **A migration that has been applied is
history**: editing one is refused by the runner, because the database already has the old
version's effect and this cannot undo it. Fix a mistake with a new migration.

| File                        | What it adds                                                      |
| --------------------------- | ----------------------------------------------------------------- |
| `001_schema_migrations.sql` | The ledger the runner reads.                                      |
| `002_pages.sql`             | The seven fixed pages and the sections in them.                   |
| `003_content_strings.sql`   | Every editable string on the site, one row each.                  |
| `004_collections.sql`       | Case studies, capabilities, process steps, engagement tiers, FAQ. |
| `005_media_assets.sql`      | The library listing for `public/media`.                           |
| `006_inquiries.sql`         | Contact form submissions.                                         |
| `007_login_attempts.sql`    | The login rate limiter's counter.                                 |
| `008_content_drafts.sql`    | Saved-but-unpublished edits, kept out of what the site reads.     |

## How the schema is shaped, and why

**`content_strings` is the centre of it.** The unit is the string rather than the entity,
because that is the unit the panel edits and the unit approval is tracked on: one case
study carries an approved title from the client's brief next to a drafted "why this
piece", and a column-per-field table cannot say that. Each row carries `is_approved`
(whose words these are), `is_editable` with a `read_only_reason`, its `updated_at`, and a
`version` used for optimistic concurrency.

It is addressed by `(owner_kind, owner_key, field_key)` — `('page_section', 'home:hero',
'heading')` — which is exactly what the admin panel already addresses a field by. It also
keeps the `ContentPointer` it was seeded from (`source_file`, `source_symbol`,
`source_path`), not to look anything up but so a row can be traced back to the TypeScript
it came from.

**The five collection tables hold identity and structure, not copy.** A slug, an ordering,
the media file a record points at, the capabilities a piece of work exercises. Their
strings live in `content_strings` like everything else. That split is what lets a create
be one INSERT rather than a form with twenty fields, and what keeps one approval flag per
string.

**Slugs are keys and they are stable.** Every anchor, filter chip and cross-page link
resolves by slug, so the panel shows the string a slug is derived from as read-only with
the reason. Renaming one is a redirect and a migration, not an edit.

## What the seed does not move

Media **files** stay on disk in `public/media`; the table lists them and holds their alt
text. Page-section decorative images — the hero mosaic, the four differentiator cards, the
five reasons — keep their **paths and aspect ratios** in the content modules, because a
path is a file that has to exist in a particular shape rather than copy anyone edits.
Every word beside them, alt text included, comes from the database.

## Verifying a migration

`src/infrastructure/db/repositories/parity.test.ts` reads all twenty site-repository
methods from the database and from the content modules and asserts they are equal field
for field. It skips when there is no database to reach, so run it where there is one:

```bash
npm test -- parity
```

That is the check that says the migration is correct. A screenshot cannot tell a missing
alt attribute from a present one.
