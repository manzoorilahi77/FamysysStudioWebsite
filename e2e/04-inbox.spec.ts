import { expect, test } from "@playwright/test";
import { expectHydrated } from "./support/panel";

/**
 * PART 5: the inbox.
 *
 * WHAT THIS FILE CAN AND CANNOT PROVE. Enquiries live in the `inquiries` table. With
 * `CONTENT_SOURCE=static` there is no table, so `StaticCmsRepository.getInquiries()`
 * returns nothing and `setInquiryStatus` refuses — deliberately, and with a message that
 * says why. So the browser can prove the screen, the honest empty state, the gap notice and
 * the unread badge's absence; it cannot prove listing, mark-as-read or archive, because
 * there is nothing on this machine for them to act on.
 *
 * Those three are covered instead by InboxScreen.test.tsx, which renders the same screen
 * against enquiries and drives the same controls, and by the database checklist in
 * docs/deployment.md. Asserting them here against an empty list would be a test that passes
 * without testing anything.
 */

test("the inbox says plainly that nothing is emailed anywhere", async ({ page }) => {
  await page.goto("/admin/inbox");
  await expect(page.getByRole("heading", { name: "Inbox", level: 1 })).toBeVisible();

  const notice = page.getByText("Nothing is emailed anywhere.");
  await expect(notice).toBeVisible();
  await expect(notice).toContainText("this list is the only place a submission appears");
});

test("an empty inbox says it is empty rather than looking broken", async ({ page }) => {
  await page.goto("/admin/inbox");

  await expect(page.getByText("No submissions yet.")).toBeVisible();
  await expect(page.getByText("Archived")).toHaveCount(0);
});

test("the sidebar shows no unread badge when there is nothing unread", async ({ page }) => {
  await page.goto("/admin/inbox");
  await expectHydrated(page);

  const inbox = page
    .getByRole("navigation", { name: "Admin sections" })
    .getByRole("link", { name: /^Inbox/ });
  await expect(inbox).toBeVisible();
  await expect(inbox).toHaveAttribute("aria-current", "page");
  await expect(page.getByText("unread enquiries")).toHaveCount(0);
});
