import { expect, test, type Page } from "@playwright/test";
import { clearDrafts } from "./support/content";
import { NOT_MEDIA, ONE_PIXEL_PNG, mediaSnapshot, removeUploadsSince } from "./support/media";
import { saveButton, status } from "./support/panel";

/**
 * THE TWO THINGS AN EDITOR SAID THEY COULD NOT SEE.
 *
 * "Preview shows the whole page" and "there is no way to change the picture" were both
 * real, and both had causes that a passing test suite would not have caught, because
 * nothing asserted either of them. So they are asserted here, from the panel, the way the
 * person using it would find out.
 *
 * WHAT MAKES THESE TESTS WORTH HAVING is that each one fails for the ORIGINAL bug. A frame
 * that falls back to the whole page still renders an iframe and still shows the site, so
 * "the preview opened" is not evidence of anything: what distinguishes the fixed panel is
 * that the frame is SIZED to the block and that the fallback line is absent. Likewise a
 * media block still renders a picture and an alt field without any way to replace the file,
 * so the assertion is on the control, not on the block.
 */

const previewButton = (page: Page) => page.getByRole("button", { name: "Preview", exact: true });
const previewFrame = (page: Page) => page.locator("iframe");
const wholePageToggle = (page: Page) => page.getByRole("button", { name: "Show whole page" });
const replaceButton = (page: Page) => page.getByRole("button", { name: "Replace file" });
const fileInput = (page: Page) => page.locator('input[type="file"]');

/** The panel's own line under the frame when it could not find the block. */
const FELL_BACK = /Showing the whole page/;

test.describe("the preview frames the section being edited", () => {
  test("a section with an anchor is framed, not shown as a whole page", async ({ page }) => {
    // Arrange: the Hero — the case that used to fail, because the panel calls this block
    // "Hero" and the homepage prints no such word for the old heading match to find.
    await page.goto("/admin/pages/home/hero");
    await expect(page.getByRole("heading", { name: "Hero", level: 1 })).toBeVisible();

    // Act
    await previewButton(page).click();

    // Assert: the frame is there, and it is NOT the whole-page fallback.
    const frame = previewFrame(page);
    await expect(frame).toBeVisible();
    await expect(page.getByText(FELL_BACK)).toHaveCount(0);

    // Framed means an inline height measured from the block. Whole-page means the class
    // does it, and there is no inline height at all — which is the difference the editor
    // sees and the only one worth asserting on.
    await expect(async () => {
      const style = await frame.getAttribute("style");
      expect(style ?? "", "the frame was never sized to the block").toMatch(/height:\s*\d+px/);
    }).toPass({ timeout: 30_000 });

    // And there is a deliberate way back to the whole page.
    await expect(wholePageToggle(page)).toBeVisible();
  });

  test("the frame is the height of the block, not of the page", async ({ page }) => {
    await page.goto("/admin/pages/home/hero");
    await previewButton(page).click();

    const frame = previewFrame(page);
    await expect(frame).toBeVisible();

    // Arrange: wait until the frame has been sized at all.
    await expect(async () => {
      expect(await frame.getAttribute("style")).toMatch(/height:\s*\d+px/);
    }).toPass({ timeout: 30_000 });

    // Act: measure the frame, and the block inside it.
    const framed = (await frame.boundingBox())?.height ?? 0;
    const block = await page
      .frameLocator("iframe")
      .locator('[data-cms-section="hero"]')
      .boundingBox()
      .catch(() => null);

    // Assert: the frame is close to the block rather than to a page several screens tall.
    // A tolerance, not an equality: the frame adds the sticky header's height and a little
    // air under the block, and is capped at a fraction of the viewport.
    expect(framed, "the frame collapsed to nothing").toBeGreaterThan(200);
    if (block) {
      expect(
        framed,
        "the frame is far taller than the block — it is showing the page, not the section",
      ).toBeLessThan(block.height + 400);
    }
  });

  test("a block the page does not render says so, instead of showing the top of the site", async ({
    page,
  }) => {
    // Arrange: the homepage no longer renders its FAQ block — the questions are printed
    // on /faq — so there is genuinely nothing on THIS page to frame. The panel still
    // lists it under Home, because that is where the shared answers are edited.
    await page.goto("/admin/pages/home/faq");

    // Act
    await previewButton(page).click();
    await expect(previewFrame(page)).toBeVisible();

    // Assert: the honest line, and no toggle to a block that is not there.
    await expect(page.getByText(/not in the rendered page/)).toBeVisible({ timeout: 30_000 });
    await expect(wholePageToggle(page)).toHaveCount(0);
  });

  test("the whole page is still reachable, deliberately", async ({ page }) => {
    await page.goto("/admin/pages/home/hero");
    await previewButton(page).click();
    await expect(wholePageToggle(page)).toBeVisible({ timeout: 30_000 });

    // Act
    await wholePageToggle(page).click();

    // Assert: the frame drops its measured height and says what it is showing.
    await expect(page.getByText(/Showing the whole page, in context/)).toBeVisible();
    await expect(page.getByRole("button", { name: "Show only this block" })).toBeVisible();
  });
});

test.describe("a media block can have its file replaced", () => {
  test.afterEach(() => {
    clearDrafts();
  });

  test("the panel offers to replace the file, and says the site has not changed", async ({
    page,
  }) => {
    // Arrange: /about's hero carries a picture the panel maps directly on the section.
    await page.goto("/admin/pages/about/hero");
    await expect(replaceButton(page)).toBeVisible();

    // The state before: nothing is pending, and the panel says an upload is not a change.
    await expect(page.getByText(/Uploading a file does not change the site/)).toBeVisible();
  });

  test("uploading a picture becomes an unsaved edit, and nothing goes live", async ({ page }) => {
    const before = mediaSnapshot();
    try {
      // Arrange
      await page.goto("/admin/pages/about/hero");
      await expect(replaceButton(page)).toBeVisible();
      await expect(saveButton(page)).toBeDisabled();

      // Act
      await fileInput(page).setInputFiles({
        name: "replacement.png",
        mimeType: "image/png",
        buffer: ONE_PIXEL_PNG,
      });

      // Assert: the field became an unsaved edit and the panel names what is still live.
      await expect(page.getByText(/Not saved, and not live/)).toBeVisible({ timeout: 30_000 });
      await expect(saveButton(page), "an upload did not become a savable edit").toBeEnabled();
      await expect(page.getByRole("button", { name: "Undo" })).toBeVisible();

      // And the file actually reached the server, under a name of its own.
      const added = removeUploadsSince(before);
      expect(added, "no file was written to public/media").toHaveLength(1);
      expect(added[0]).toMatch(/^[0-9a-f]{16}\.png$/);
    } finally {
      removeUploadsSince(before);
    }
  });

  test("undo puts the published file back and clears the edit", async ({ page }) => {
    const before = mediaSnapshot();
    try {
      await page.goto("/admin/pages/about/hero");
      await fileInput(page).setInputFiles({
        name: "replacement.png",
        mimeType: "image/png",
        buffer: ONE_PIXEL_PNG,
      });
      await expect(saveButton(page)).toBeEnabled({ timeout: 30_000 });

      // Act
      await page.getByRole("button", { name: "Undo" }).click();

      // Assert
      await expect(saveButton(page), "undo left the form dirty").toBeDisabled();
      await expect(page.getByText(/Not saved, and not live/)).toHaveCount(0);
    } finally {
      removeUploadsSince(before);
    }
  });

  test("a file that is not media is refused, and the field is left alone", async ({ page }) => {
    const before = mediaSnapshot();
    try {
      // Arrange: an HTML document wearing a .png name — the case where trusting the
      // extension would let a script be served from this site's own origin.
      await page.goto("/admin/pages/about/hero");
      await expect(replaceButton(page)).toBeVisible();

      // Act
      await fileInput(page).setInputFiles({
        name: "innocent.png",
        mimeType: "image/png",
        buffer: NOT_MEDIA,
      });

      // Assert: refused by its bytes, and nothing became an edit.
      await expect(page.getByText(/not one this site can serve/)).toBeVisible({ timeout: 30_000 });
      await expect(saveButton(page), "a refused upload still dirtied the form").toBeDisabled();
      expect(removeUploadsSince(before), "a refused file was written anyway").toHaveLength(0);
    } finally {
      removeUploadsSince(before);
    }
  });

  test("a replaced file saves as a draft", async ({ page }) => {
    const before = mediaSnapshot();
    try {
      await page.goto("/admin/pages/about/hero");
      await fileInput(page).setInputFiles({
        name: "replacement.png",
        mimeType: "image/png",
        buffer: ONE_PIXEL_PNG,
      });
      await expect(saveButton(page)).toBeEnabled({ timeout: 30_000 });

      // Act
      await saveButton(page).click();

      // Assert: the section's own status line reports the save, and the site is untouched
      // until Publish — which is the whole point of the three-step flow.
      await expect(status(page).first()).toContainText(/Saved|not live/i, { timeout: 30_000 });
    } finally {
      removeUploadsSince(before);
      clearDrafts();
    }
  });
});

test("a section whose pictures live elsewhere links to where they are", async ({ page }) => {
  // Arrange: the homepage's Ways to Work block renders the engagement tiles' photographs
  // but owns none of them. It used to show no image field and no explanation, which is
  // exactly what "I can't see the images for this section" was.
  await page.goto("/admin/pages/home/ways-to-work");

  // Assert
  // `.first()` because the explanation is the LIST's; each name under it carries only the
  // short line. Before that split the paragraph printed five times, once per tier.
  await expect(page.getByText(/PHOTOGRAPHS on these tiles/).first()).toBeVisible();
  await expect(
    page.getByText(/PHOTOGRAPHS on these tiles/),
    "the long explanation is repeated under every tier name",
  ).toHaveCount(1);
  const link = page.getByRole("link", { name: "Open that screen" }).first();
  await expect(link).toBeVisible();
  await expect(link).toHaveAttribute("href", "/admin/pages/ways-to-work-with-us/engagement-tiers");
});
