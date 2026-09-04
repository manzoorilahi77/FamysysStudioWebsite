import type { NextConfig } from "next";

/**
 * THE SITE RUNS ON A NODE SERVER, AND WHY IT HAD TO STOP BEING A STATIC EXPORT.
 *
 * It shipped as `output: "export"` — plain HTML to a host with no runtime — which was
 * right while every page was content and nothing had to happen on a request. Three things
 * now do:
 *
 *   - the admin panel signs someone in, which needs a request, a cookie and a secret;
 *   - the panel writes content, which needs an endpoint;
 *   - the contact form stores an enquiry, which needs both. Under the export it POSTed to
 *     /api/demo-request, and that route was never emitted — the form validated and the
 *     request 404ed.
 *
 * A static export cannot do any of them, so the site is a Node application now. What did
 * NOT change is how the public pages are produced: they carry no dynamic segments and read
 * their content at build time, so they are still prerendered to HTML once per build and
 * served as files. Only /admin and the two endpoints render per request.
 *
 * WHAT THIS MEANS FOR DEPLOYMENT. The host has to run Node. On the cPanel box this site
 * lives on there is no "Setup Node.js App" screen — no CloudLinux Node selector is
 * installed — so the app runs the way the nine other Node apps on that account already do:
 * a long-lived process under pm2, listening on loopback, with the domain's docroot
 * .htaccess reverse-proxying to it through mod_proxy. See docs/deployment.md.
 *
 * The build also needs to reach the database, because that is where the content is read
 * from. With CONTENT_SOURCE=static the build reads the TypeScript files instead and needs
 * no database, which is the escape hatch if the two ever have to be separated.
 */
const nextConfig: NextConfig = {
  // Everything the server needs in one folder: .next/standalone carries a server.js and
  // only the node_modules actually reached at runtime, which is what makes deploying to a
  // shared host an upload rather than an `npm install` on a box with two cores and 1.7 GB
  // free.
  output: "standalone",
  reactStrictMode: true,
  // Drop the image optimiser from the traced bundle. `images.unoptimized` switches it off,
  // but sharp and its 19 MB of platform binaries are still reachable from the server entry
  // and are still copied without this.
  //
  // THIS OPTION IS NARROWER THAN IT LOOKS, and it is worth knowing why before reaching for
  // it again. It filters files the tracer FOUND by following imports, which is why the two
  // entries below work. It does nothing about the rest of the working tree — the docs, the
  // git directory, .env.local — because those are not traced files: the content writer
  // reads its own TypeScript sources back at runtime through a path the tracer cannot
  // resolve statically, so nft widens to the enclosing directories and the standalone copy
  // takes the working tree with it. Excluding them here silently does nothing.
  //
  // What the server actually receives is decided by scripts/deploy.mjs, which packs an
  // explicit list and refuses to upload an archive containing a credentials file. That is
  // the check that matters; this is a size optimisation.
  outputFileTracingExcludes: {
    "*": ["node_modules/@img/**", "node_modules/sharp/**"],
  },
  // No image optimiser: it needs sharp and a writable cache, neither of which is a safe
  // assumption on shared hosting. The images are pre-sized in public/media.
  images: { unoptimized: true },
  // The content writer loads the TypeScript compiler and Prettier at runtime to parse and
  // reformat a content file — the CONTENT_SOURCE=static write path. Both are Node
  // libraries that must not be bundled.
  serverExternalPackages: ["typescript", "prettier", "mysql2"],
  // The site is TypeScript-only, so the default list's `jsx`/`js` are dropped rather than
  // carried.
  pageExtensions: ["tsx", "ts"],
};

export default nextConfig;
