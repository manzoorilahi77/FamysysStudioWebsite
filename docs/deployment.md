# Deploying the site

The site is a Next.js application on a Node runtime. It is not a folder of HTML any more,
and it cannot be deployed by uploading one — see the header comment in `next.config.ts`
for why that changed.

**Where it runs.** `studio.famysys.com`, on the cPanel account `aspirfxc` at
66.116.197.244 (webhostbox). That account has no "Setup Node.js App" screen — no
CloudLinux Node selector is installed — so the site runs the way the fifteen other Node
apps on the same account already do: one long-lived process under PM2, bound to loopback,
with the domain's docroot `.htaccess` reverse-proxying to it through `mod_proxy`.

**Where it is built.** On a developer machine, not on the server. The box has two cores
and about 1.7 GB of free memory shared with fifteen other Node processes and 218 sites; a
Next build there would be slow at best and would take the neighbours down with it at
worst. `output: "standalone"` is what makes this practical — the build produces a folder
containing a `server.js` and only the modules the server actually reaches, so a deploy is
an upload rather than an install.

**The build reads the database.** The seven public pages are prerendered from MySQL at
build time, so whichever machine runs `npm run build` needs network access to
`studio.famysys.com:3306` and the credentials in `.env.local`. If it cannot connect the
build does not fail — it falls back to the TypeScript content modules and ships a site
that looks almost right and contains none of the client's edits. **Run `npm run db:status`
before every build.** That is what it is for.

## Layout on the server

```
~/apps/fsstudios/
  releases/2026-09-04T2015/   one deploy, self-contained
  releases/2026-09-04T1840/   the one before it — this is the rollback
  current -> releases/...     the symlink PM2 runs from
  shared/.env                 credentials, chmod 600, never in git
  logs/                       out.log and error.log
  ecosystem.config.js         the PM2 process definition
~/public_html/studio.famysys.com/
  .htaccess                   the only file left in the docroot
```

Nothing else is in the docroot. Apache terminates TLS, answers AutoSSL's challenges from
disk, and hands every other request to Node on `127.0.0.1:6570`.

## Environment

`shared/.env` is symlinked into each release as `.env`, and the Next server reads it from
the directory PM2 starts it in. It holds:

| Variable | What it is |
| --- | --- |
| `DB_HOST` `DB_PORT` `DB_NAME` `DB_USER` `DB_PASSWORD` | MySQL. Same database the build reads. |
| `ADMIN_PASSWORD_HASH` | bcrypt, cost 12. **Every `$` backslash-escaped** — see below. |
| `SESSION_SECRET` | Signs the session cookie. Rotating it signs everybody out, which is also how a stolen cookie is revoked. |
| `CONTENT_SOURCE` | `database`. `static` makes the site read the TypeScript modules instead. |
| `NEXT_PUBLIC_SITE_URL` | `https://studio.famysys.com`. Canonical URLs and the Open Graph card are absolute. |
| `HOSTNAME` | `127.0.0.1`. **Loopback only** — a server bound to `0.0.0.0` on a shared host is reachable by every other account on the box. |
| `PORT` | `6570`. Must match the port in the docroot `.htaccess`. |
| `MAIL_ENABLED` | `true` here and nowhere else. `false` (the default) stores enquiries and emails nobody. |
| `MAIL_SENDER` `MAIL_FROM_NAME` `MAIL_NOTIFY_TO` | The mailbox Graph sends as, the name beside it, and where notifications land. See [Outbound mail](#outbound-mail). |
| `GRAPH_TENANT_ID` `GRAPH_CLIENT_ID` `GRAPH_CLIENT_SECRET` | The Entra app registration. The secret **expires** — diarise the date. |

> **The `$` in the bcrypt hash must be backslash-escaped.** Next runs variable expansion
> over `.env` values, so an unescaped hash arrives as a fragment of itself and every
> sign-in fails with a message that says nothing about why:
>
> <!-- allow-secret: the shape of a bcrypt hash, not one. -->
> `ADMIN_PASSWORD_HASH=\$2b\$12\$…`

The file is `chmod 600`, outside the web root and outside git. It is a file rather than
process environment because PM2 persists whatever it is given into `~/.pm2/dump.pm2`
anyway — there is no way to hold these values on this host that does not end up on disk,
so they are held in one file with known permissions rather than two with unknown ones.

## Deploying an update

From the repository root, with `.env.local` filled in:

```bash
npm run db:status          # will the build read the database, or fall back?
npm run typecheck && npm run lint && npm test
npm run build              # produces .next/standalone
node scripts/deploy.mjs    # packs, uploads, switches the symlink, restarts PM2
```

`scripts/deploy.mjs` does what the three manual steps below do, in that order, and stops
at the first one that fails. What it is doing:

1. **Pack.** `.next/standalone` plus `.next/static` and `public/`, which the standalone
   output deliberately does not copy — Next expects a CDN to serve them and here Node
   serves them itself.
2. **Upload** into `releases/<timestamp>/`, a directory the running process is not using.
   Nothing about the live site changes during the upload.
3. **Switch and restart.** Symlink `current` at the new release and `pm2 restart
   fsstudios`. This is the only moment the site is unavailable, and it is about two
   seconds.

## Outbound mail

Each contact form submission sends two emails through Microsoft Graph: a notification to
`MAIL_NOTIFY_TO` (Reply-To set to the sender, so Reply answers them) and an acknowledgement
to the sender. Both go out **after** the enquiry is stored and the form has been told it
succeeded, so a mail failure never costs an enquiry. `inquiries.notified_at` and
`inquiries.ack_sent_at` are stamped only when Graph accepts each message, so
`SELECT id FROM inquiries WHERE notified_at IS NULL` lists every enquiry nobody was told about.

**The Entra app registration** (single tenant, no redirect URI):

1. API permissions → Microsoft Graph → **Application** permissions → `Mail.Send` → **Grant
   admin consent**. A Delegated `Mail.Send` does not work with client credentials.
2. Scope it. An application `Mail.Send` grant can send as *any* mailbox in the tenant. In
   Exchange Online PowerShell:
   ```powershell
   New-ApplicationAccessPolicy -AppId <GRAPH_CLIENT_ID> -PolicyScopeGroupId <MAIL_SENDER> `
     -AccessRight RestrictAccess -Description "Famysys Studio: contact form mail only"
   Test-ApplicationAccessPolicy -AppId <GRAPH_CLIENT_ID> -Identity <MAIL_SENDER>
   ```
3. Certificates & secrets → New client secret. Copy the **Value**, not the Secret ID.
   **Diarise the expiry**: sending stops that day, and it shows up as a logged error rather
   than an outage, so it is noticed late unless someone is expecting it.

**Turning it on.** Migration `011_inquiries_mail_stamps.sql` must be applied first
(`npm run db:migrate`) — without it the enquiries still store, but the stamps fail and are
logged. Then add the seven `MAIL_*`/`GRAPH_*` values to `shared/.env` and
`pm2 restart fsstudios --update-env`. A missing value with `MAIL_ENABLED=true` stops the
server starting, and `error.log` names the variable.

**Then check it, in this order:**

```bash
cd ~/apps/fsstudios/current
node --env-file=../shared/.env scripts/mail-check.mjs          # token + permission
node --env-file=../shared/.env scripts/mail-check.mjs --send   # one real message
```

Then submit the real form once and confirm both messages arrive, and that **Reply** on the
notification addresses the person who wrote in, not the shared inbox.

## Rolling back

The previous release is still on disk. Point the symlink back and restart:

```bash
ssh aspirfxc@studio.famysys.com
ls -t ~/apps/fsstudios/releases | head -3          # newest first
ln -sfn ~/apps/fsstudios/releases/<previous> ~/apps/fsstudios/current
pm2 restart fsstudios
```

Two seconds, no build, no upload. That is the whole reason releases are timestamped
directories rather than one directory that gets overwritten.

**What a rollback does not undo:** content. The pages are prerendered from the database at
build time, so an old release serves the content that was in the database when it was
built — but the admin panel writes to the same database either way, and a content mistake
is fixed in the panel, not by rolling back code. Migrations are not reverted either; a
release that needs a schema change needs a forward migration to undo it.

## Checking it is alive

```bash
pm2 describe fsstudios                    # status, uptime, restarts, memory
pm2 logs fsstudios --lines 50             # or ~/apps/fsstudios/logs/error.log
curl -sI https://studio.famysys.com/      # 200, and x-nextjs-* headers on a page
curl -s https://studio.famysys.com/robots.txt
```

- **503 on every page** — Node is down, or listening on a port the `.htaccess` does not
  name. `pm2 describe fsstudios`.
- **Every sign-in fails, and the site itself is fine** — the bcrypt hash lost its escaping.
- **The pages render but the content is stale or wrong** — the build could not reach the
  database and fell back to the content modules. `npm run db:status` on the build machine.

## Verifying the CMS on a machine that can reach the database

`npm run test:e2e` drives the whole panel in a browser, but it runs against
`CONTENT_SOURCE=static` because a development machine cannot reach `studio.famysys.com:3306`
— cPanel refuses remote MySQL. Under that store a save writes `.cms-drafts.json` and a
publish rewrites a TypeScript module, which is enough to prove save, validation, discard,
draft state, publish-through and the whole of the editor's behaviour.

**Seven things it cannot prove**, listed here so they are checked once rather than
rediscovered. Run these on a machine with database access, after a real deploy, in order.

- [ ] **1 · Migration 008 is applied.** `db/migrations/008_content_drafts.sql` creates
      `content_drafts` and is written but NOT applied. Nothing in the panel saves without
      it. `npm run db:migrate`, then `npm run db:status` to confirm.

- [ ] **2 · `revalidatePath` actually regenerates the prerendered pages.**
      *This is the one that has failed silently before.* The route SET is covered by
      `src/infrastructure/cms/routes.test.ts` — it fails if any owner in the model resolves
      to no route — but nothing on a development machine can prove the regeneration itself,
      because in `next dev` there is no prerendered HTML to invalidate.
      Edit a **capability's expanded copy** in the panel, publish, and then, **without a
      cache-busting query string and without a reload**:
      ```bash
      curl -s https://studio.famysys.com/ | grep -c "<the new sentence>"
      curl -s https://studio.famysys.com/creative-services | grep -c "<the new sentence>"
      ```
      Both must be non-zero on the FIRST request after the publish. A capability is used
      deliberately: it is rendered by two pages, so a revalidation that only regenerates
      the page being edited passes on `/creative-services` and fails on `/`.
      Then repeat with the **footer's tagline**, which is site-wide, and check all seven
      routes. If a page is stale, the publish wrote the row and lied about the rest.

- [ ] **3 · The draft preview overlay.** `DbCmsRepository.supportsDraftPreview` is `true`
      and `ContentStore.load()` lays `content_drafts` over `content_strings` when
      `draftMode()` is on. Save a draft, press **Preview**, and check three things: the chip
      reads *"With unpublished edits"* rather than *"Live content only"*, the iframe shows
      the draft, and the same route in an ordinary tab still shows the published string.
      Close the preview and reload the public page — the draft cookie must be gone, or the
      editor's own view of the live site is quietly showing drafts.

- [ ] **4 · Optimistic concurrency, per row.** Open the same section in two browsers. Save
      in A. Save in B. B must be refused with **409** and the message about the content
      having changed, and B's typing must still be on screen. Repeat for publish. The file
      store proves the same idea against a whole file; the database proves it against the
      `version` column, which is the mechanism that actually ships.

- [ ] **5 · Adding and removing a block.** `supportsRecordChanges` is `false` on the file
      store, so the Add and Remove controls do not render at all under `static`. On the
      database path, add a capability, confirm it appears on `/` and `/creative-services`,
      then remove it and confirm both pages lose it — a structural change calls
      `structureChanged()` and regenerates all seven routes.

- [ ] **6 · The contact forms reach the inbox.** Submit the homepage's closing form and
      `/contact`'s eight-field form. Both must appear in the inbox, newest first, with
      `sourceForm` right and — this is the part worth looking at — the three fields the
      homepage never asks for **absent**, not shown as empty. Then mark one read, archive
      it, and put it back. `InboxScreen.test.tsx` covers the screen and the two controls
      against fixtures; what it cannot cover is the endpoint writing the row.

- [ ] **7 · The login form.** `attemptLogin` counts rows in `login_attempts`, so sign-in
      answers 503 with no database and the browser suite mints its session cookie directly
      instead. Confirm a correct password signs in, that five wrong ones lock the client
      out for fifteen minutes, and that the lockout message does not distinguish "wrong
      password" from "locked" before the lockout is real.

Nothing above is optional after a schema change or a change to `routes.ts`.

## Running the browser suite

```bash
npm run test:e2e
```

It stops anything on port 4399, stops every Next dev server, deletes `.next`, installs the
Chromium build if it is missing, then starts its own dev server with `CONTENT_SOURCE=static`
and runs `e2e/`. **It kills other Next dev servers on the machine** — that is deliberate,
because a server left from another session is the single most reliable source of false
failures in this project, but it means the suite should not be started while somebody else
is working on the same box.

The run begins with `e2e/gate.setup.ts`. Every other test depends on it, so a dead server
or a bundle that does not hydrate produces one failure that says so rather than thirty that
blame the panel. It writes to the working tree — a publish rewrites a content module — and
restores the modules from a snapshot afterwards, whether the run passed or failed.

## What this host cannot do

- **No zero-downtime deploy.** One process, one port; the restart is a real gap. Two ports
  and a proxy switch would close it, and for a seven-page site it is not worth the second
  moving part.
- **No build on the server.** See above — it is a memory limit, not a policy.
- **No process supervision beyond PM2.** `pm2 startup` requires root on this account's
  host, so a reboot of the physical machine does not bring the app back on its own. The
  fifteen other apps on this account have the same exposure; `pm2 resurrect` restores all
  of them at once.
