import { expect, test } from "@playwright/test";
import { restoreContentSnapshot } from "./support/content";
import {
  expectPublicPage,
  field,
  gotoSection,
  publishButton,
  publishSection,
  saveButton,
  saveDraft,
  setField,
  status,
} from "./support/panel";

/**
 * SAVE, PREVIEW, PUBLISH — three steps, and the point of the suite is that they stay three.
 *
 * The publishing tests rewrite a content module and then wait for the dev server to
 * recompile it, so they are slow and they clean up after themselves. Anything that ends
 * with a string on the public site puts the file back before the next test starts, because
 * a suite that leaves the site changed is a suite whose next run starts somewhere else.
 */

test.describe.configure({ mode: "serial" });

test.afterEach(() => {
  restoreContentSnapshot();
});

test("a saved draft does not reach the public site", async ({ page }) => {
  await gotoSection(page, "about", "hero");
  const draft = "A heading that must not appear on the site.";

  await setField(page, "Heading", draft);
  await saveDraft(page);

  // Given time to be wrong: the same poll the publish test uses, asked to prove absence.
  await expectPublicPage(page, "/about", draft, false);
  await expect(page.getByText("Saved, not published").first()).toBeVisible();
});

test("the draft mark appears in the sidebar and clears when it is published", async ({ page }) => {
  test.setTimeout(240_000);
  await gotoSection(page, "about", "hero");

  const mark = page.getByRole("img", { name: "Hero has unpublished edits" });
  const pageMark = page.getByRole("img", { name: "About has unpublished edits" });
  await expect(mark).toHaveCount(0);

  await setField(page, "Heading", "A heading on its way to the site.");
  await saveDraft(page);

  await expect(mark.first()).toBeVisible();
  await expect(pageMark.first()).toBeVisible();

  await publishSection(page);

  await expect(mark).toHaveCount(0);
  await expect(pageMark).toHaveCount(0);
  await expect(page.getByText("Everything here is live")).toBeVisible();
});

test("publish is unavailable while the form has unsaved changes", async ({ page }) => {
  await gotoSection(page, "about", "hero");

  // With a draft saved, Publish is available…
  await setField(page, "Heading", "A saved heading.");
  await saveDraft(page);
  await expect(publishButton(page)).toBeEnabled();

  // …and the moment there is unsaved typing on top of it, it is not, with the reason on
  // screen. This is the failure the panel must never have: publishing the previous draft
  // while newer words sit in the box, and reporting success.
  await setField(page, "Heading", "A newer heading that has not been saved.");
  await expect(publishButton(page)).toBeDisabled();
  await expect(page.locator("#publish-blocked")).toContainText(
    "Publish is unavailable while there are unsaved changes",
  );
  await expect(publishButton(page)).toHaveAttribute("aria-describedby", "publish-blocked");

  // Saving unblocks it again.
  await saveDraft(page);
  await expect(page.locator("#publish-blocked")).toHaveCount(0);
  await expect(publishButton(page)).toBeEnabled();
});

test("publish with nothing saved is unavailable rather than a silent no-op", async ({ page }) => {
  await gotoSection(page, "home", "hero");
  await expect(publishButton(page)).toBeDisabled();
  await expect(page.getByText("Everything here is live")).toBeVisible();
});

test("publishing puts the string on the public page", async ({ page }) => {
  test.setTimeout(300_000);
  await gotoSection(page, "about", "hero");

  const heading = "Building the next generation, published by the panel.";
  const alt = "An empty photographic studio, alt text published by the panel.";

  await setField(page, "Heading", heading);
  await setField(page, "Alt text", alt);
  await saveDraft(page);
  await expectPublicPage(page, "/about", heading, false);

  await publishSection(page);
  await expect(status(page)).toContainText(/Published\. 2 changes are now live on \d+ page/);

  await expectPublicPage(page, "/about", heading);
  await expectPublicPage(page, "/about", alt);

  // And the panel now agrees that this is what the site is serving.
  await page.reload();
  await expect(field(page, "Heading")).toHaveValue(heading);
  await expect(page.getByText("Everything here is live")).toBeVisible();
  await expect(page.getByText("Saved, not published")).toHaveCount(0);
});

test("a string used on more than one page is published to all of them", async ({ page }) => {
  test.setTimeout(300_000);
  // A capability's DESCRIPTOR, specifically. It is the one string on the card that both
  // pages print — the homepage's service grid renders the title and the descriptor and
  // nothing else, while /creative-services renders the whole card. So it is the field that
  // can prove the claim: edited once, published once, changed on two pages.
  //
  // The route set is worked out per OWNER rather than per field, so publishing any field on
  // this card regenerates both routes. That is correct — regenerating a page that did not
  // need it costs nothing, and the alternative is a page that needed it and did not get it.
  const descriptor =
    "Social creatives, collateral and decks, produced as one matched set for every placement.";

  await gotoSection(page, "creative-services", "capabilities");
  await page
    .getByRole("button", { name: /Creative Design/ })
    .first()
    .click();

  const box = page.locator("#card-creative-design").getByLabel("Descriptor", { exact: true });
  await expect(box).toBeEnabled();
  await expect(async () => {
    await box.fill(descriptor);
    await expect(saveButton(page)).toBeEnabled({ timeout: 1_000 });
  }).toPass({ timeout: 45_000 });

  await saveDraft(page);
  await publishSection(page);

  // Two pages, said in the message and true on both of them.
  await expect(status(page)).toContainText(/now live on 2 pages/);
  await expectPublicPage(page, "/creative-services", descriptor);
  await expectPublicPage(page, "/", descriptor);
});

test("preview opens the real page at its real route, and says what it is showing", async ({
  page,
}) => {
  await gotoSection(page, "about", "hero");
  await setField(page, "Heading", "A heading only the panel has seen.");
  await saveDraft(page);

  await page.getByRole("button", { name: "Preview", exact: true }).click();

  const frame = page.locator('iframe[title="Preview of /about"]');
  await expect(frame).toBeVisible();

  // It is the page, not a re-rendering of the block: the site's own header and footer are
  // in the frame.
  const inside = page.frameLocator('iframe[title="Preview of /about"]');
  await expect(inside.locator("main")).toBeVisible();
  await expect(inside.getByRole("contentinfo")).toBeAttached();

  // With CONTENT_SOURCE=static there is nowhere to read an unpublished string from, and
  // the panel says exactly that rather than showing the live page as if it were the draft.
  // The draft overlay is the database path's; see docs/deployment.md.
  await expect(page.getByText("Live content only")).toBeVisible();
  await expect(page.getByText("Publish to see the edit in it.")).toBeVisible();
  await expect(inside.getByText("A heading only the panel has seen.")).toHaveCount(0);
});

test("preview closes on Escape and gives focus back to the button that opened it", async ({
  page,
}) => {
  await gotoSection(page, "about", "hero");

  // The bar's button RENAMES itself to "Close preview" while the preview is open, and the
  // preview panel has a "Close preview" of its own — so no single name addresses the bar
  // button in both states. Each state gets the name that is true in it, exactly.
  await page.getByRole("button", { name: "Preview", exact: true }).click();
  await expect(page.locator('iframe[title="Preview of /about"]')).toBeVisible();

  const barButton = page.getByRole("button", { name: "Close preview", exact: true }).first();
  await expect(barButton).toHaveAttribute("aria-expanded", "true");

  await page.keyboard.press("Escape");
  await expect(page.locator('iframe[title="Preview of /about"]')).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Preview", exact: true })).toBeFocused();
});
