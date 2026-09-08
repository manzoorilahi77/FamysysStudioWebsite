import { expect, type Locator, type Page } from "@playwright/test";

/**
 * THE THINGS EVERY SPEC DOES, WRITTEN ONCE.
 *
 * The one that matters is `setField`. The panel's editor is a client component, and until
 * React has hydrated it a `fill()` sets the DOM value and nothing else: no state changes,
 * Save stays disabled, and the assertion that follows fails with a message about the
 * application when the truth is that the test typed too early. That has produced pages of
 * plausible-looking false failures in this project before. So a fill is retried until the
 * editor visibly reacts to it, and only a fill the editor never reacts to is a failure.
 */

export const SAVE = "Save draft";
export const PUBLISH = "Publish";
export const PREVIEW = "Preview";
export const DISCARD = "Discard drafts";

export function saveButton(page: Page): Locator {
  return page.getByRole("button", { name: SAVE });
}

export function publishButton(page: Page): Locator {
  return page.getByRole("button", { name: PUBLISH, exact: true });
}

/** The editor's one status line — every action reports here. */
export function status(page: Page): Locator {
  return page.locator('[role="status"][aria-live="polite"]');
}

export function field(page: Page, label: string): Locator {
  return page.getByLabel(label, { exact: true });
}

/**
 * React is running on this page.
 *
 * Probed through a sidebar expander, whose `aria-expanded` is pure client state: it changes
 * nothing on the server, so the probe cannot alter what a test then measures.
 *
 * It has to be a COLLAPSED page's expander. The page you are on is held open by the panel
 * — `expanded = onThisPage || opened.includes(id)` — so its toggle is pinned to `true` and
 * pressing it changes nothing that can be seen. That is correct behaviour (arriving at a
 * section must not leave its own page collapsed) and it makes the current page useless as
 * a hydration probe. Addressed by `aria-controls` rather than by name, because the name
 * changes from "Expand X" to "Collapse X" the moment the probe works.
 */
export async function expectHydrated(page: Page): Promise<void> {
  const collapsed = page.getByRole("button", { name: /^Expand / }).first();
  await expect(collapsed).toBeVisible();
  const controls = await collapsed.getAttribute("aria-controls");
  const toggle = page.locator(`button[aria-controls="${controls}"]`);

  await expect(async () => {
    await toggle.click();
    await expect(toggle).toHaveAttribute("aria-expanded", "true", { timeout: 1_000 });
  }).toPass({ timeout: 45_000 });

  // Put it back, so a spec that reads the sidebar reads it as the panel would show it.
  await toggle.click();
  await expect(toggle).toHaveAttribute("aria-expanded", "false");
}

export async function gotoSection(page: Page, pageId: string, sectionId: string): Promise<void> {
  await page.goto(`/admin/pages/${pageId}/${sectionId}`);
  await expect(page.getByRole("button", { name: PREVIEW, exact: true })).toBeVisible();
  await expectHydrated(page);
}

/**
 * Reload and wait for React again. A plain `page.reload()` followed by a click is the same
 * mistake `setField` guards against: the markup is there, the handler is not, and the
 * assertion after it blames the panel.
 */
export async function reloadSection(page: Page): Promise<void> {
  await page.reload();
  await expect(page.getByRole("button", { name: PREVIEW, exact: true })).toBeVisible();
  await expectHydrated(page);
}

/** Type into a field and wait until the editor has registered it. */
export async function setField(page: Page, label: string, value: string): Promise<void> {
  const box = field(page, label);
  await expect(box).toBeEnabled();

  await expect(async () => {
    await box.fill(value);
    await expect(box).toHaveValue(value, { timeout: 1_000 });
    await expect(saveButton(page)).toBeEnabled({ timeout: 1_000 });
  }).toPass({ timeout: 45_000 });
}

export async function saveDraft(page: Page): Promise<void> {
  await saveButton(page).click();
  await expect(status(page)).toContainText("Saved as a draft", { timeout: 30_000 });
}

export async function publishSection(page: Page): Promise<void> {
  await expect(publishButton(page)).toBeEnabled();
  await publishButton(page).click();
  await expect(status(page)).toContainText("Published.", { timeout: 60_000 });
}

export async function discardDrafts(page: Page): Promise<void> {
  page.once("dialog", (dialog) => void dialog.accept());
  await page.getByRole("button", { name: DISCARD }).click();
  await expect(status(page)).toContainText("thrown away", { timeout: 30_000 });
}

/**
 * The PUBLIC page, fetched rather than navigated to — the editor's own tab keeps its
 * unsaved-changes guard, and a navigation would have to argue with it.
 *
 * Polled because publishing under `CONTENT_SOURCE=static` rewrites a TypeScript module and
 * the dev server has to recompile it before the route can serve the new string. That is a
 * property of this store, not a flake: on the database path the row is written and
 * `revalidatePath` regenerates the page.
 */
export async function expectPublicPage(
  page: Page,
  route: string,
  text: string,
  present = true,
): Promise<void> {
  await expect
    .poll(
      async () => {
        // A request that never answers is a poll that has not finished yet, not a failure:
        // the first request after a publish is the one that waits for the recompile, and it
        // can outlast any per-request timeout worth setting. Swallowing it here is what
        // makes this a poll rather than one attempt with a long fuse.
        const response = await page.request
          .get(`${route}?cache-bust=${Date.now()}`, { timeout: 60_000 })
          .catch(() => null);
        if (!response) return !present;
        return (await response.text()).includes(text);
      },
      { timeout: 180_000, intervals: [1_000, 2_000, 3_000, 5_000] },
    )
    .toBe(present);
}
