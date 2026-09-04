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

## What this host cannot do

- **No zero-downtime deploy.** One process, one port; the restart is a real gap. Two ports
  and a proxy switch would close it, and for a seven-page site it is not worth the second
  moving part.
- **No build on the server.** See above — it is a memory limit, not a policy.
- **No process supervision beyond PM2.** `pm2 startup` requires root on this account's
  host, so a reboot of the physical machine does not bring the app back on its own. The
  fifteen other apps on this account have the same exposure; `pm2 resurrect` restores all
  of them at once.
