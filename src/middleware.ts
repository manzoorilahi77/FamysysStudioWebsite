import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { DECK_PREVIEW_ORIGINS } from "./shared/site/deckPreviewOrigins";

/**
 * SECURITY HEADERS, ON EVERY RESPONSE.
 *
 * WHY `script-src` CARRIES `'unsafe-inline'` WHEN NOTHING ELSE HERE DOES, and why that is
 * a real, known gap rather than an oversight.
 *
 * A nonce-based `script-src` was tried first, generated per request in this file exactly
 * the way Next's own docs describe. It failed verification: the seven public pages are
 * prerendered to static HTML at BUILD time (see next.config.ts and docs/deployment.md —
 * this is deliberate, it is what makes the site buildable off-box and servable from a
 * two-core, 1.7 GB shared host), and Next's own hydration payload
 * (`self.__next_f.push(...)`) is baked into that HTML as a plain inline `<script>` with no
 * nonce on it. A PER-REQUEST nonce cannot retroactively attach to a script that was
 * written to disk at build time — there is no request yet. Loading a built page in a real
 * browser with a nonce-only CSP throws "Refused to execute inline script" on every static
 * route and the app never hydrates. Confirmed with a Playwright console check against the
 * production build before shipping this file; do not reintroduce a bare nonce here without
 * re-running that check.
 *
 * The two honest ways to close this the rest of the way are a build-time SHA-256 hash list
 * of every inline script Next emits (computed from `.next` output after the build, fed
 * back into this file, which then needs a second build pass to pick it up) or moving the
 * public pages to per-request dynamic rendering so the nonce channel actually reaches
 * them. Both are real changes to the build/deploy pipeline documented in
 * docs/deployment.md — not something to do silently inside a header fix — so this ships
 * with `'unsafe-inline'` on `script-src` only, and every other directive stays strict.
 * `GoogleAnalytics.tsx` has no inline script of its own (it calls gtag from a bundled,
 * same-origin chunk instead) specifically so this gap is scoped to the framework's own
 * hydration script and not widened by anything this app added. The one inline SCRIPT that
 * is genuinely this app's own — `JsonLd.tsx`'s `<script type="application/ld+json">` —
 * needs neither `'unsafe-inline'` nor a hash: CSP's `script-src` only governs elements
 * whose type is empty or a JavaScript MIME type, so a `ld+json` block is never subject to
 * it at all (confirmed: it renders and is present in the DOM with a strict `script-src` in
 * place, because the browser never attempts to execute it as script in the first place).
 *
 * WHY `style-src` ALSO CARRIES `'unsafe-inline'`, and why THIS one is not a build-pipeline
 * problem but a real architectural choice.
 *
 * Every scroll-linked and pointer-linked animation in the hero and the homepage's
 * scrollytelling sections is driven by directly assigning the DOM `style` CSSOM property
 * every frame — `element.style.transform = ...`, `.style.opacity = ...`,
 * `.style.setProperty("--near", ...)` — rather than by re-rendering React with new
 * `style={{}}` props or toggling a class. See `useHeroMotion.ts` (the magnet/hero
 * pointer effect), `WhyFamysys.tsx`, `SelectedWorkCovers.tsx`, `HowWeWorkFrames.tsx`, and
 * `Differentiator.tsx`. This is deliberate: it is the difference between a scroll handler
 * that re-renders a React tree on every scroll event and one that touches only the CSSOM,
 * which is what keeps these effects smooth. Every one of those computed values
 * (`translate3d(${x}px,${y}px,0)`) is different on every animation frame, so a hash
 * allowlist — CSP's other route to strict inline styles — cannot enumerate them; hashing
 * only works for a FIXED, known-in-advance string.
 *
 * This was not assumed — it was tested. Built with `style-src 'self'` (no
 * `'unsafe-inline'`) and driven through a real Chromium session with Playwright,
 * scrolling the full length of the homepage and moving the pointer across the hero:
 * 851 "Applying inline style violates ... style-src" violations, zero of any other kind
 * (script-src, font-src, img-src, connect-src all held strict with zero violations in the
 * same run). CSP's own error message names the reason directly: "hashes do not apply to
 * ... style attributes ... unless 'unsafe-hashes' is present" — and `'unsafe-hashes'`
 * still needs one hash per distinct value, which these are not. Rewriting these hooks onto
 * the Web Animations API (`Element.animate()`, which CSS's style-src does not govern at
 * all) is the real fix, and it is a rewrite of five animation hooks, not a header change —
 * flagged for a decision, not done silently here.
 */
const SCRIPT_SOURCES = ["'self'", "https://www.googletagmanager.com", "'unsafe-inline'"];
const CONNECT_SOURCES = [
  "'self'",
  "https://www.google-analytics.com",
  "https://*.google-analytics.com",
];

const IMG_SOURCES = ["'self'", "data:", "https://www.googletagmanager.com"];

const CSP = [
  `default-src 'self'`,
  `script-src ${SCRIPT_SOURCES.join(" ")}`,
  `style-src 'self' 'unsafe-inline'`,
  // GA4 falls back to an image-pixel beacon (`/td?...`) served from the SAME host as the
  // gtag.js loader, not from google-analytics.com — found by actually loading a page with
  // GA4 enabled and watching the console, not by reading GA's docs.
  `img-src ${IMG_SOURCES.join(" ")}`,
  `font-src 'self'`,
  `connect-src ${CONNECT_SOURCES.join(" ")}`,
  `frame-ancestors 'none'`,
  `base-uri 'self'`,
  `form-action 'self'`,
  `object-src 'none'`,
].join("; ");

/**
 * THE CAPABILITY DECK'S OWN POLICY, AND WHY IT IS A SECOND CSP RATHER THAN A WIDER FIRST
 * ONE.
 *
 * /capability-deck is a ported presentation deck (see src/app/capability-deck/page.tsx)
 * whose Selected Work slide is not screenshots — it is live third-party content. It frames
 * 23 Google Drive clips, streams some of them through a `<video>` off Drive's download
 * host, shows Drive's own thumbnails, frames seven client sites so a viewer can scroll the
 * real thing, and frames the parent company's corporate deck. Under the policy above,
 * where `default-src 'self'` covers `frame-src` and `media-src` by omission, every one of
 * those is refused and the slide renders as empty boxes.
 *
 * WHAT IS DELIBERATELY NOT DONE: adding these origins to the CSP above. That policy is
 * what /admin, the login endpoint and the contact form run under, and `frame-src` opened
 * site-wide would let any page on the site embed any of these origins — a clickjacking
 * surface on the panel in exchange for a feature on one marketing page. Nine origins that
 * one route needs are that route's business, so the route carries them.
 *
 * WHAT THIS DOES NOT WEAKEN. `frame-ancestors 'none'` and `X-Frame-Options: DENY` are
 * untouched and mean the opposite thing — they are about this site being framed BY others,
 * which stays forbidden everywhere including here. `script-src`, `connect-src`,
 * `form-action`, `base-uri` and `object-src` are identical to the site policy: none of
 * these origins may run script on the page, receive a fetch, or receive a form post. They
 * may be displayed, and nothing more.
 *
 * ADDING A PROJECT TO THE DECK WITH A NEW `previewUrl` NEEDS ITS ORIGIN ADDED HERE, or the
 * card silently shows an empty frame. That coupling is the cost of the narrow scope and is
 * the reason the list below names each origin against what uses it.
 */
const DECK_FRAME_SOURCES = [
  "'self'",
  // The 23 Selected Work clips, as Drive's own /preview player.
  "https://drive.google.com",
  // The parent company's corporate deck, the Websites gallery's live-framed sites, and any
  // other origin the Capability Deck CMS is allowed to display live — see
  // deckPreviewOrigins.ts for why this is imported rather than repeated here.
  ...DECK_PREVIEW_ORIGINS,
];

const DECK_CSP = [
  `default-src 'self'`,
  `script-src ${SCRIPT_SOURCES.join(" ")}`,
  `style-src 'self' 'unsafe-inline'`,
  // Drive serves a clip's poster from drive.google.com/thumbnail, which redirects to a
  // googleusercontent host — both are named because a redirect target is checked too.
  `img-src ${IMG_SOURCES.join(" ")} https://drive.google.com https://*.googleusercontent.com`,
  `font-src 'self'`,
  `connect-src ${CONNECT_SOURCES.join(" ")}`,
  // The desktop fast path plays a clip through a native <video> pointed at Drive's
  // download endpoint, falling back to the /preview iframe above when that fails. Both
  // hosts it tries are named — see driveStreamCandidates() in VideoGallery.tsx.
  `media-src 'self' https://drive.google.com https://docs.google.com`,
  `frame-src ${DECK_FRAME_SOURCES.join(" ")}`,
  `frame-ancestors 'none'`,
  `base-uri 'self'`,
  `form-action 'self'`,
  `object-src 'none'`,
].join("; ");

/** The deck route and the assets served beneath it. */
function isCapabilityDeck(pathname: string): boolean {
  return pathname === "/capability-deck" || pathname.startsWith("/capability-deck/");
}

export function middleware(request: NextRequest): NextResponse {
  const response = NextResponse.next();

  response.headers.set(
    "Content-Security-Policy",
    isCapabilityDeck(request.nextUrl.pathname) ? DECK_CSP : CSP,
  );
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  if (process.env.NODE_ENV === "production") {
    response.headers.set(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains; preload",
    );
  }

  return response;
}

export const config = {
  // Every page and API route. Static assets under /_next/static and already-served media
  // don't need a CSP.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|media/).*)"],
};
