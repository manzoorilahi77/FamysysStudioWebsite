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
 * WHAT THIS MEANS FOR DEPLOYMENT. The host has to run Node — on cPanel that is "Setup
 * Node.js App" (Passenger) rather than dropping a folder into public_html — and the build
 * needs to reach the database, because that is where the content is read from. With
 * CONTENT_SOURCE=static the build reads the TypeScript files instead and needs no
 * database, which is the escape hatch if the two ever have to be separated.
 */
const nextConfig: NextConfig = {
  reactStrictMode: true,
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
