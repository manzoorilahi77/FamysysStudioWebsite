import { describe, expect, it } from "vitest";
import { navigationContent } from "./navigation.content";

/**
 * The header, the mega-menu panels, the mobile drawer and the footer all render the same
 * nav entries as lists, and every one of them needs a stable unique key per item.
 *
 * An href is not reliably unique here. It shipped that way once: the Ways to Work panel
 * was four engagement tiers that all carried the bare `/ways-to-work-with-us`, so keying a
 * list on `item.href` handed React four children with the same key — in `Footer`, which is
 * rendered on all seven pages, so the warning fired everywhere.
 *
 * Those four now link to their own tier on that page and no two items currently share an
 * href, which means a plain href key would happen to work TODAY. That is exactly why the
 * composite key stays: the uniqueness it depends on is a property of the content, and the
 * content is edited by people adding a panel row that points at a page someone already
 * points at. `${href}-${label}` is the key every one of those components uses, and this
 * file asserts the pair is unique across the whole menu rather than asserting the
 * coincidence that today the href half is enough.
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
  // The mobile drawer and the footer flatten every panel into ONE list, so a key that is
  // unique within a panel is not enough on its own — it has to be unique across all of
  // them together. This is the assertion that covers those two components.
  it("keys every panel item uniquely across the whole menu, not just within one panel", () => {
    const keys = itemKeys().flatMap((panel) => panel.keys);

    expect(new Set(keys).size).toBe(keys.length);
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
