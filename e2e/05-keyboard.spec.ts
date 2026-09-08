import { expect, test, type Page } from "@playwright/test";
import { field, gotoSection, saveDraft, setField, status } from "./support/panel";
import { restoreContentSnapshot } from "./support/content";

/**
 * THE WHOLE EDITOR, FROM THE KEYBOARD.
 *
 * Not a spot check on one button. The claim in the brief is that the panel is keyboard
 * operable throughout, and the way that claim fails in practice is one control — a card's
 * expander, a remove button, a field inside a collapsed panel — that a mouse reaches and a
 * Tab key does not. So this walks the tab order and compares what it reached against every
 * enabled, visible control the screen has.
 *
 * `identify` builds a key per element rather than comparing element handles, because Next
 * re-renders parts of the tree between presses and a stale handle would compare unequal for
 * a reason that has nothing to do with focus.
 */

const IDENTIFY = `(element) => {
  const label = element.getAttribute("aria-label")
    ?? element.getAttribute("id")
    ?? (element.textContent ?? "").trim().slice(0, 40);
  return element.tagName + "|" + label;
}`;

const FOCUSABLE = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "textarea:not([disabled])",
  "select:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(", ");

async function visibleControls(page: Page, scope: string): Promise<ReadonlyArray<string>> {
  return page
    .locator(scope)
    .locator(FOCUSABLE)
    .evaluateAll((elements, identify: string) => {
      const key = new Function(`return ${identify}`)() as (element: Element) => string;
      return elements
        .filter((element) => (element as HTMLElement).offsetParent !== null)
        .map((element) => key(element));
    }, IDENTIFY);
}

/** Tab from wherever focus is, recording what it lands on, until it stops moving forward. */
async function walkTabOrder(page: Page, presses: number): Promise<ReadonlyArray<string>> {
  const reached: string[] = [];
  for (let index = 0; index < presses; index += 1) {
    await page.keyboard.press("Tab");
    const here = await page.evaluate((identify: string) => {
      const key = new Function(`return ${identify}`)() as (element: Element) => string;
      const active = document.activeElement;
      return active && active !== document.body ? key(active) : null;
    }, IDENTIFY);
    if (here) reached.push(here);
  }
  return reached;
}

test.afterEach(() => {
  restoreContentSnapshot();
});

/**
 * One sweep, always from the same place.
 *
 * Focus is put on the skip link — the first focusable thing in the document — rather than
 * on `body`, because `body` is not focusable: pressing Tab "on" it leaves focus wherever it
 * already was, so a sweep taken after typing would start in the middle of the form and wrap
 * round. The positions that came out of that were real, and meaningless.
 */
async function sweep(page: Page): Promise<ReadonlyArray<string>> {
  await page.getByRole("link", { name: "Skip to content" }).focus();
  return walkTabOrder(page, 90);
}

/** Where a control sits in a sweep, by its exact identity rather than by substring. */
function positionOf(walk: ReadonlyArray<string>, key: string): number {
  return walk.indexOf(key);
}

test("every control on a section editor is reachable by Tab, in both states", async ({ page }) => {
  await gotoSection(page, "about", "hero");

  // At rest. Save and Publish are disabled here and so are not tab stops, which is right —
  // a disabled control that takes focus is a stop that does nothing.
  const atRest = new Set(await sweep(page));
  const missedAtRest = (await visibleControls(page, "main")).filter(
    (control) => !atRest.has(control),
  );
  expect(missedAtRest, "controls the keyboard never reached, at rest").toEqual([]);

  // And with unsaved typing, which is the state that turns Save and Discard on. Sweeping
  // only the resting state would never check the buttons that do the work.
  await setField(page, "Heading", "A heading that makes the form dirty.");
  await saveDraft(page);
  await setField(page, "Heading", "And a second one that has not been saved.");

  const whenDirty = new Set(await sweep(page));
  const missedWhenDirty = (await visibleControls(page, "main")).filter(
    (control) => !whenDirty.has(control),
  );
  expect(missedWhenDirty, "controls the keyboard never reached, with unsaved edits").toEqual([]);
});

test("the action bar comes before the fields it acts on", async ({ page }) => {
  await gotoSection(page, "about", "hero");

  // SAVE AND PUBLISH ARE NEVER BOTH AVAILABLE, by design: Save needs unsaved changes and
  // Publish refuses to run while there are any. So the order is checked in the two states
  // separately rather than asserted as one row of three enabled buttons, which is a shape
  // this screen cannot be in.
  await setField(page, "Heading", "A heading that makes the form dirty.");

  const dirty = await sweep(page);
  const atDirty = (key: string) => positionOf(dirty, key);
  expect(atDirty("BUTTON|Save draft"), dirty.join(" > ")).toBeGreaterThanOrEqual(0);
  expect(atDirty("BUTTON|Preview"), dirty.join(" > ")).toBeGreaterThan(
    atDirty("BUTTON|Save draft"),
  );
  expect(atDirty("INPUT|value-heading-Heading"), dirty.join(" > ")).toBeGreaterThan(
    atDirty("BUTTON|Preview"),
  );

  await saveDraft(page);

  const saved = await sweep(page);
  const atSaved = (key: string) => positionOf(saved, key);
  expect(atSaved("BUTTON|Preview"), saved.join(" > ")).toBeGreaterThanOrEqual(0);
  expect(atSaved("BUTTON|Publish"), saved.join(" > ")).toBeGreaterThan(atSaved("BUTTON|Preview"));
  expect(atSaved("BUTTON|Discard drafts"), saved.join(" > ")).toBeGreaterThan(
    atSaved("BUTTON|Publish"),
  );
  expect(atSaved("INPUT|value-heading-Heading"), saved.join(" > ")).toBeGreaterThan(
    atSaved("BUTTON|Discard drafts"),
  );
});

test("a card opens and closes from the keyboard", async ({ page }) => {
  await gotoSection(page, "creative-services", "capabilities");

  const toggle = page.getByRole("button", { name: /Creative Design/ }).first();
  await toggle.focus();
  await expect(toggle).toHaveAttribute("aria-expanded", "false");

  await page.keyboard.press("Enter");
  await expect(toggle).toHaveAttribute("aria-expanded", "true");
  await expect(page.locator("#card-creative-design")).toBeVisible();

  await page.keyboard.press("Space");
  await expect(toggle).toHaveAttribute("aria-expanded", "false");
});

test("the sidebar's expanders work from the keyboard and say what they do", async ({ page }) => {
  await gotoSection(page, "about", "hero");

  const expander = page.getByRole("button", { name: "Expand Contact" });
  await expander.focus();
  await page.keyboard.press("Enter");

  await expect(page.getByRole("button", { name: "Collapse Contact" })).toBeFocused();
  await expect(page.locator("#admin-nav-contact")).toBeVisible();
});

test("the discard dialog can be escaped, and nothing is discarded", async ({ page }) => {
  await gotoSection(page, "about", "hero");
  await setField(page, "Heading", "A draft that must survive a cancelled discard.");
  await saveDraft(page);

  const discard = page.getByRole("button", { name: "Discard drafts" });
  await discard.focus();

  // Dismissing a native dialog is what Escape does to it; Playwright models it the same way.
  page.once("dialog", (dialog) => void dialog.dismiss());
  await page.keyboard.press("Enter");

  await expect(status(page)).not.toContainText("thrown away");
  await expect(discard).toBeFocused();
  await page.reload();
  await expect(field(page, "Heading")).toHaveValue(
    "A draft that must survive a cancelled discard.",
  );
});
