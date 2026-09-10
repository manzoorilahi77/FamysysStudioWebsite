import { expect, test } from "@playwright/test";
import { restoreContentSnapshot } from "./support/content";
import {
  discardDrafts,
  field,
  gotoSection,
  reloadSection,
  saveButton,
  saveDraft,
  setField,
  status,
} from "./support/panel";

/**
 * PART 3 AND PART 4: what a field does, and what a save does.
 *
 * Every field type the brief names is edited here — a heading, a body paragraph, a list
 * item, an image's alt text, a CTA's label and a CTA's destination — and each is checked to
 * have survived a reload, because "it looked saved" and "it was saved" are different
 * claims and only the second one matters.
 *
 * Nothing here publishes. The public site must not move, and 03-publish.spec.ts checks that
 * separately.
 */

test.afterEach(() => {
  restoreContentSnapshot();
});

test("a heading, a body paragraph and an image's alt text save and survive a reload", async ({
  page,
}) => {
  await gotoSection(page, "about", "hero");

  const heading = "About the studio, edited by the panel.";
  const body = "A creative production studio, edited by the panel to prove the body field saves.";
  const alt = "An empty photographic studio, described by the panel.";

  await setField(page, "Heading", heading);
  await setField(page, "Body", body);
  await setField(page, "Alt text", alt);

  await expect(status(page)).not.toContainText("Saved");
  await expect(page.getByText("3 unsaved changes")).toBeVisible();

  await saveDraft(page);
  await expect(status(page)).toContainText("3 changes are not on the site yet");

  await page.reload();
  await expect(field(page, "Heading")).toHaveValue(heading);
  await expect(field(page, "Body")).toHaveValue(body);
  await expect(field(page, "Alt text")).toHaveValue(alt);

  // And the panel says these are saved rather than live, which is the distinction the
  // whole three-step flow exists to keep.
  await expect(page.getByText("Saved, not published").first()).toBeVisible();
  await expect(page.getByText("Everything here is live")).toHaveCount(0);
});

test("a body field is a growing multi-line box, and a heading is not", async ({ page }) => {
  await gotoSection(page, "about", "hero");

  expect(await field(page, "Body").evaluate((node) => node.tagName)).toBe("TEXTAREA");
  expect(await field(page, "Heading").evaluate((node) => node.tagName)).toBe("INPUT");
});

test("a CTA's label and destination are separate fields, and a list item is editable in place", async ({
  page,
}) => {
  await gotoSection(page, "home", "hero");

  await setField(page, "Primary CTA label", "Start a Project");
  await setField(page, "Primary CTA link", "/contact?from=panel");
  await setField(page, "Band labels 1", "Graphic design");

  await saveDraft(page);
  await reloadSection(page);

  await expect(field(page, "Primary CTA label")).toHaveValue("Start a Project");
  await expect(field(page, "Primary CTA link")).toHaveValue("/contact?from=panel");
  await expect(field(page, "Band labels 1")).toHaveValue("Graphic design");

  // Discarding puts every one of them back to what the site is serving.
  await discardDrafts(page);
  await expect(field(page, "Primary CTA label")).toHaveValue("Start a Conversation");
  await expect(field(page, "Primary CTA link")).toHaveValue("/contact");
  await expect(field(page, "Band labels 1")).toHaveValue("Graphic Design");
  await expect(page.getByText("Everything here is live")).toBeVisible();
});

test("an invalid destination is rejected against its own field, and nothing is written", async ({
  page,
}) => {
  await gotoSection(page, "home", "hero");

  await setField(page, "Primary CTA label", "Start a Project");
  await setField(page, "Primary CTA link", "contact page");
  await saveButton(page).click();

  // Scoped to the screen. Next's own route announcer is a `role="alert"` node in the
  // document, so an unscoped alert query matches two things and neither is wrong.
  const error = page.locator("main").getByRole("alert");
  await expect(error).toContainText("is not a valid URL");
  await expect(status(page)).toContainText("Nothing was saved");

  // The error is under the field that caused it, not under the other one.
  const describedBy = await field(page, "Primary CTA link").getAttribute("aria-describedby");
  expect(describedBy).toContain("-error");
  expect(await field(page, "Primary CTA label").getAttribute("aria-describedby")).not.toContain(
    "-error",
  );

  // The good field's typing is still on screen — a rejected save must not cost the work.
  await expect(field(page, "Primary CTA label")).toHaveValue("Start a Project");

  // And nothing reached the store: a reload shows the published strings.
  await page.reload();
  await expect(field(page, "Primary CTA label")).toHaveValue("Start a Conversation");
  await expect(page.getByText("Everything here is live")).toBeVisible();
});

test("an empty field is refused before anything is sent", async ({ page }) => {
  await gotoSection(page, "about", "hero");

  await setField(page, "Heading", " ");
  await saveButton(page).click();

  await expect(page.locator("main").getByRole("alert")).toContainText("cannot be empty");
  await expect(status(page)).toContainText("One field needs fixing first");
});

test("a field that cannot be edited is disabled and says why", async ({ page }) => {
  await gotoSection(page, "home", "footer");

  const locked = field(page, "Postal address");
  await expect(locked).toBeDisabled();
  await expect(page.getByText("No address is printed")).toBeVisible();

  // A key on a card is locked for a different reason, and gives that reason.
  await gotoSection(page, "creative-services", "capabilities");
  await page
    .getByRole("button", { name: /Creative Design/ })
    .first()
    .click();
  const card = page.locator("#card-creative-design");
  await expect(card.getByLabel("Title", { exact: true })).toBeDisabled();
  await expect(card.getByText(/title is the key/)).toBeVisible();
});

test("editing the client's own copy warns that it came from the brief", async ({ page }) => {
  await gotoSection(page, "home", "hero");

  // The chip is there before anything is typed: whose words these are is not a warning
  // that arrives after the fact.
  await expect(page.getByText("Client copy").first()).toBeVisible();

  const warning = page.getByText(/taken verbatim from their brief/);
  await expect(warning).toHaveCount(0);

  await setField(page, "Heading", "Creative production, without the overhead.");
  await expect(warning.first()).toBeVisible();

  // A drafted string does not get the warning — otherwise it would mean nothing.
  await gotoSection(page, "about", "hero");
  await setField(page, "Heading", "Building something else.");
  await expect(page.getByText("Drafted copy").first()).toBeVisible();
  await expect(page.getByText(/taken verbatim from their brief/)).toHaveCount(0);
});

test("leaving the section with unsaved edits asks first", async ({ page }) => {
  await gotoSection(page, "about", "hero");
  await setField(page, "Heading", "An edit nobody meant to abandon.");

  // Dismissed: the navigation is cancelled and the typing is still there.
  let asked = "";
  page.once("dialog", (dialog) => {
    asked = dialog.message();
    void dialog.dismiss();
  });
  await page.getByRole("link", { name: "Belief", exact: true }).first().click();

  expect(asked).toContain("not been saved");
  await expect(page).toHaveURL(/\/admin\/pages\/about\/hero$/);
  await expect(field(page, "Heading")).toHaveValue("An edit nobody meant to abandon.");

  // Accepted: it goes.
  page.once("dialog", (dialog) => void dialog.accept());
  await page.getByRole("link", { name: "Belief", exact: true }).first().click();
  await expect(page).toHaveURL(/\/admin\/pages\/about\/belief$/);
});
