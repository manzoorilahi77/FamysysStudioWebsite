/**
 * PM2 process definition for the Famysys Studio site.
 *
 * The host has no "Setup Node.js App" screen, so the site runs the way the fifteen other
 * Node apps on this cPanel account already do: one long-lived process under PM2, bound to
 * loopback, with the domain's docroot .htaccess reverse-proxying to it.
 *
 * `script` POINTS AT THE `current` SYMLINK, not at a release directory. A deploy unpacks a
 * new release beside the old one and moves the symlink; PM2 restarts and follows it. That
 * is also what makes a rollback a symlink move rather than a re-upload.
 *
 * `script` IS `start-server.mjs`, NOT `server.js` DIRECTLY. It used to be server.js, with
 * PM2's `interpreter_args`/`node_args` set to `--env-file=shared/.env` so Node would load
 * the credentials before any application code ran. That does not work: confirmed by
 * isolated testing (2026-09-16) that PM2 v7 does not reliably thread that flag through to
 * server.js's own process.env, on EITHER server this app has run on — the admin login has
 * been broken by exactly this since 2026-09-09, since before this server existed.
 * `start-server.mjs` (in `scripts/`, copied beside `server.js` by `deploy.mjs`) calls
 * `process.loadEnvFile()` — the same parser `--env-file` itself uses — directly, then
 * imports `server.js`, removing PM2's spawn construction from the loading path entirely.
 *
 * It reads values literally, with no variable expansion — so the bcrypt hash in that file
 * has its dollars INTACT, where .env.local needs them backslash-escaped for Next.
 * The two files look alike and are not interchangeable.
 *
 * ONE INSTANCE, FORK MODE. This box runs fifteen other Node processes and 218 sites on
 * 3.6 GB; a cluster would multiply this app's memory for a site whose seven public pages
 * are prerendered HTML and whose only dynamic work is one admin panel with one user.
 *
 * Start:   pm2 start ~/apps/fsstudios/ecosystem.config.js --env production
 * Reload:  pm2 restart fsstudios --update-env
 * Persist: pm2 save
 */
module.exports = {
  apps: [
    {
      name: "fsstudios",
      script: "/home/shafwan/apps/fsstudios/current/start-server.mjs",
      cwd: "/home/shafwan/apps/fsstudios/current",

      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      watch: false,

      /* Next holds the prerendered pages and the route manifest in memory and the
         database pool on top of that. 400 MB is roughly three times what it settles at,
         so this catches a leak without tripping on a normal day. */
      max_memory_restart: "400M",

      /* The process closes the MySQL pool on SIGTERM. Five seconds is room to finish an
         in-flight query rather than be killed mid-transaction. */
      kill_timeout: 5000,

      env_production: {
        NODE_ENV: "production",
      },

      error_file: "/home/shafwan/apps/fsstudios/logs/error.log",
      out_file: "/home/shafwan/apps/fsstudios/logs/out.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
    },
  ],
};
