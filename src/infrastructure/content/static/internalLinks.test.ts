import { readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import * as about from "./about.content";
import * as contact from "./contact.content";
import * as creativeServices from "./creative-services.content";
import * as howWeWork from "./how-we-work.content";
import * as marketing from "./marketing.content";
import * as navigation from "./navigation.content";
import * as portfolio from "./portfolio.content";
import * as selectedWork from "./selected-work.content";
import * as services from "./services.content";
import * as waysToWork from "./ways-to-work.content";

/**
 * /contact was the seventh and last content page, and until it existed the site shipped
 * links that 404ed — the header's "Contact" and "Start a Conversation" buttons, and the
 * closing call to action on all six other pages, all pointed at it.
 *
 * This walks src/app for the routes that actually exist and checks every internal href
 * in every content module against them, so the next dead link is caught here rather than
 * by someone clicking it. Routes are READ FROM DISK, not listed: a hard-coded list would
 * keep passing after a page was deleted.
 */
function routesUnder(directory: string, prefix = ""): string[] {
  const routes: string[] = [];
  for (const entry of readdirSync(directory)) {
    // Route groups, private folders and the API tree are not navigable pages.
    if (entry.startsWith("_") || entry.startsWith("(") || entry === "api") {
      continue;
    }
    const path = join(directory, entry);
    if (!statSync(path).isDirectory()) {
      continue;
    }
    const segment = `${prefix}/${entry}`;
    if (readdirSync(path).some((file) => /^page\.(tsx|ts|jsx|js)$/.test(file))) {
      routes.push(segment);
    }
    routes.push(...routesUnder(path, segment));
  }
  return routes;
}

const APP_DIRECTORY = join(process.cwd(), "src", "app");
const ROUTES = new Set(["/", ...routesUnder(APP_DIRECTORY)]);

/** Every `Url`-shaped value in the tree whose value looks like an internal path. */
function collectHrefs(node: unknown, out: string[] = [], seen = new Set<unknown>()): string[] {
  if (!node || typeof node !== "object" || seen.has(node)) {
    return out;
  }
  seen.add(node);
  if ("value" in node && typeof (node as { value: unknown }).value === "string") {
    const value = (node as { value: string }).value;
    if (value.startsWith("/") && !value.startsWith("//")) {
      out.push(value);
    }
    return out;
  }
  for (const child of Object.values(node)) {
    collectHrefs(child, out, seen);
  }
  return out;
}

const CONTENT_MODULES: Record<string, unknown> = {
  "about.content": about,
  "contact.content": contact,
  "creative-services.content": creativeServices,
  "how-we-work.content": howWeWork,
  "marketing.content": marketing,
  "navigation.content": navigation,
  "portfolio.content": portfolio,
  "selected-work.content": selectedWork,
  "services.content": services,
  "ways-to-work.content": waysToWork,
};

describe("internal links", () => {
  it("finds the seven content routes on disk", () => {
    expect([...ROUTES].sort()).toEqual([
      "/",
      "/about",
      "/contact",
      "/creative-services",
      "/how-we-work",
      "/selected-work",
      "/ways-to-work-with-us",
    ]);
  });

  it.each(Object.keys(CONTENT_MODULES))("resolves every internal href in %s", (name) => {
    const hrefs = collectHrefs(CONTENT_MODULES[name]);
    // A fragment link is a route plus an anchor; the route half is what can 404. Media
    // paths (/media/..., /brand/...) are files, not routes, and are excluded — the
    // placeholder-media inventory in docs/content-todo.md is what tracks those.
    const unresolved = hrefs.filter((href) => {
      const route = href.split("#")[0] ?? href;
      return !/^\/(media|brand)\//.test(route) && !ROUTES.has(route);
    });

    expect(unresolved).toEqual([]);
  });

  it("links the Contact route the header and every closing call to action point at", () => {
    expect(ROUTES.has("/contact")).toBe(true);
    expect(navigation.navigationContent.signIn.href.value).toBe("/contact");
    expect(navigation.navigationContent.primaryCta.href.value).toBe("/contact");
    expect(marketing.closingCta.cta.href.value).toBe("/contact");
  });
});
