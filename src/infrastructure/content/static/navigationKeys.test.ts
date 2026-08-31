import { describe, expect, it } from "vitest";
import { navigationContent } from "./navigation.content";

/**
 * The header, the mega-menu panels, the mobile drawer and the footer all render the same
 * nav entries as lists, and every one of them needs a stable unique key per item.
 *
 * An href is NOT unique here, and that is deliberate rather than a content bug: the Ways
 * to Work panel is four engagement tiers that all live on one page, so all four items
 * carry `/ways-to-work-with-us`. Keying a list on `item.href` therefore hands React four
 * children with the same key. It shipped that way in `Footer`, which is rendered on all
 * seven pages, so the warning fired everywhere.
 *
 * `${href}-${label}` is the key every one of those components now uses. This asserts the
 * pair is actually unique, so the next panel that repeats a route fails here instead of in
 * the console.
 */
function itemKeys(): ReadonlyArray<{ panel: string; keys: ReadonlyArray<string> }> {
  return navigationContent.primaryLinks.map((entry) => ({
    panel: entry.link.label.value,
    keys: [
      ...entry.panel.columns.flatMap((column) =>
        column.items.map((item) => `${item.href.value}-${item.label.value}`),
      ),
      ...entry.panel.features.map((feature) => `${feature.href.value}-${feature.label.value}`),
    ],
  }));
}

describe("navigation list keys", () => {
  it("has at least one panel whose items share an href, which is why label is part of the key", () => {
    const hrefs = navigationContent.primaryLinks.flatMap((entry) =>
      entry.panel.columns.flatMap((column) => column.items.map((item) => item.href.value)),
    );

    expect(hrefs.length).toBeGreaterThan(new Set(hrefs).size);
  });

  it.each(itemKeys().map((panel) => [panel.panel, panel.keys] as const))(
    "the %s panel's href-and-label keys are unique",
    (_panel, keys) => {
      expect(new Set(keys).size).toBe(keys.length);
    },
  );

  it("the five primary entries have distinct hrefs, so keying the top level on href is safe", () => {
    const hrefs = navigationContent.primaryLinks.map((entry) => entry.link.href.value);

    expect(new Set(hrefs).size).toBe(hrefs.length);
  });
});
