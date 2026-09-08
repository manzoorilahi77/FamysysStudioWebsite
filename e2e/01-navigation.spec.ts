import { expect, test, type Page } from "@playwright/test";
import { expectHydrated } from "./support/panel";

/**
 * PART 1 AND PART 2 OF THE BRIEF: the sidebar is the site and nothing else, and a page
 * opens to the blocks it actually renders.
 *
 * The expected block lists below are written out in full ON PURPOSE. They are the one place
 * in this suite that does not derive its expectation from the code under test — if the
 * composition reader silently stopped reading a page's route file and fell back to a
 * declared order, a test that asked the panel what it thought the order was would agree with
 * it. So the order is stated here, taken from the seven route files, and a change to a page
 * has to be reflected here deliberately.
 */

const PAGES = [
  { id: "home", label: "Home", route: "/" },
  { id: "creative-services", label: "Creative Services", route: "/creative-services" },
  { id: "how-we-work", label: "How We Work", route: "/how-we-work" },
  { id: "ways-to-work-with-us", label: "Ways to Work With Us", route: "/ways-to-work-with-us" },
  { id: "selected-work", label: "Selected Work", route: "/selected-work" },
  { id: "about", label: "About", route: "/about" },
  { id: "contact", label: "Contact", route: "/contact" },
] as const;

const SECTIONS: Record<string, ReadonlyArray<string>> = {
  home: [
    "Hero",
    "What We Do",
    "The Differentiator",
    "How We Work",
    "Ways to Work With Us",
    "Selected Work",
    "FAQ",
    "Final CTA",
    "Footer",
    // Declared but no longer rendered — it appears last, with a note, rather than vanishing.
    "Why Famysys",
  ],
  "creative-services": [
    "Hero",
    "Capability index",
    "Capabilities",
    "Process pointer",
    "Engagement pointer",
    "FAQ",
    "Final CTA",
  ],
  "how-we-work": [
    "Hero",
    "Process overview",
    "The stages",
    "Worked example",
    "Scope and revisions",
    "FAQ",
    "Final CTA",
  ],
  "ways-to-work-with-us": [
    "Hero",
    "Tier comparison",
    "The engagements",
    "Custom Creative Partnership",
    "How to choose",
    "Scoping",
    "FAQ",
    "Final CTA",
  ],
  "selected-work": [
    "Hero",
    "Framing",
    "Filters",
    "Gallery",
    "Piece detail",
    "Progression",
    "Capability links",
    "Final CTA",
  ],
  about: [
    "Hero",
    "Belief",
    "Approach",
    "Inputs",
    "Building",
    "Part of Famysys",
    "Where we are going",
    "Final CTA",
  ],
  contact: ["Hero", "Form", "Next steps"],
};

function sidebar(page: Page) {
  return page.getByRole("navigation", { name: "Admin sections" });
}

test.beforeEach(async ({ page }) => {
  await page.goto("/admin/pages/home/hero");
  await expectHydrated(page);
});

test("the sidebar lists the seven pages in site order, then the inbox", async ({ page }) => {
  // By destination, not by position in the list. The page you are on is expanded, and its
  // blocks are links nested inside its own row — so "the first seven links" is not "the
  // seven pages", and a test that assumed it was would be asserting the wrong thing.
  const hrefs = await sidebar(page)
    .getByRole("link")
    .evaluateAll((links) => links.map((link) => link.getAttribute("href") ?? ""));

  const pageHrefs = hrefs.filter((href) => /^\/admin\/pages\/[a-z-]+$/.test(href));
  expect(pageHrefs).toEqual(PAGES.map((entry) => `/admin/pages/${entry.id}`));

  for (const entry of PAGES) {
    await expect(sidebar(page).locator(`a[href="/admin/pages/${entry.id}"]`)).toHaveText(
      entry.label,
    );
  }

  // The inbox is one item, and it comes after the pages rather than among them.
  expect(hrefs.filter((href) => href === "/admin/inbox")).toHaveLength(1);
  expect(hrefs.indexOf("/admin/inbox")).toBeGreaterThan(hrefs.indexOf(pageHrefs.at(-1) ?? ""));
});

test("nothing but the seven pages and the inbox is reachable from the panel", async ({ page }) => {
  // Every destination in the sidebar, whatever it is called. Naming the removed screens
  // would only catch the ones that came back under their old names; this catches any
  // screen at all that is not a page or the inbox.
  const hrefs = await sidebar(page)
    .getByRole("link")
    .evaluateAll((links) => links.map((link) => link.getAttribute("href") ?? ""));

  const allowed = /^\/admin$|^\/admin\/inbox$|^\/admin\/pages\/[a-z-]+(\/[a-z-]+)?$/;
  expect(hrefs.filter((href) => !allowed.test(href))).toEqual([]);

  const pageHrefs = hrefs.filter((href) => /^\/admin\/pages\/[a-z-]+$/.test(href));
  expect(pageHrefs).toEqual(PAGES.map((entry) => `/admin/pages/${entry.id}`));

  // And the screens the rebuild removed are gone rather than merely unlinked.
  for (const route of ["/admin/collections", "/admin/media", "/admin/lists", "/admin/inquiries"]) {
    const response = await page.request.get(route, { maxRedirects: 0 });
    expect(response.status(), `${route} still resolves`).toBeGreaterThanOrEqual(400);
  }
});

for (const entry of PAGES) {
  test(`${entry.label} expands to its blocks, in the order the page renders them`, async ({
    page,
  }) => {
    const expand = page.getByRole("button", { name: `Expand ${entry.label}` });
    // The page you are on is already open; the others need a press.
    if (await expand.isVisible().catch(() => false)) {
      await expand.click();
    }

    const list = sidebar(page).locator(`#admin-nav-${entry.id}`);
    await expect(list).toBeVisible();
    const labels = (await list.getByRole("link").allInnerTexts()).map((text) => text.trim());

    expect(labels).toEqual(SECTIONS[entry.id]);
  });
}

test("a page screen lists the same blocks and says what cannot be added", async ({ page }) => {
  await page.goto("/admin/pages/how-we-work");
  await expect(page.getByRole("heading", { name: "How We Work", level: 1 })).toBeVisible();

  for (const label of SECTIONS["how-we-work"] ?? []) {
    await expect(page.getByRole("link", { name: new RegExp(`^${label}`) }).first()).toBeVisible();
  }

  await expect(page.getByText("Pages cannot be added or removed here")).toBeVisible();
  await expect(page.getByText("read from the page's own code")).toBeVisible();
});

test("selecting a block opens its editor in the main panel", async ({ page }) => {
  await sidebar(page).getByRole("link", { name: "What We Do", exact: true }).first().click();

  await expect(page).toHaveURL(/\/admin\/pages\/home\/what-we-do$/);
  await expect(page.getByRole("heading", { name: "What We Do", level: 1 })).toBeVisible();
  await expect(page.getByRole("button", { name: "Save draft" })).toBeVisible();
});
