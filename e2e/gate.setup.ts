import { expect, test } from "@playwright/test";
import { expectHydrated } from "./support/panel";

/**
 * THE HYDRATION GATE.
 *
 * A dead or half-built server does not fail loudly. It serves HTML that looks right, so
 * every locator resolves and every assertion about text passes — and then nothing responds
 * to a click, and twenty tests report that saving is broken, that validation is broken,
 * that the sidebar does not expand. All of it false, all of it plausible, and the real
 * cause is a `.next` directory from a build that no longer matches the source.
 *
 * So the run starts here, and everything else depends on it. Four things are checked, in
 * the order in which they can fail:
 *
 *   1. The public site renders at all.
 *   2. The admin gate lets a valid session through — if it does not, every admin test would
 *      fail on a redirect to the login screen and none of them would say why.
 *   3. A section editor renders its controls.
 *   4. React is actually running: a client-only control changes state when clicked.
 *
 * If this fails, nothing else runs and the report has one failure in it rather than thirty.
 */

test("the server is up, the session is accepted, and the panel hydrates", async ({ page }) => {
  const home = await page.request.get("/");
  expect(home.ok(), "the public site did not answer — the dev server never finished building").toBe(
    true,
  );

  await page.goto("/admin/pages/home/hero");
  await expect(
    page,
    "the admin session was refused; the panel redirected to the login screen",
  ).not.toHaveURL(/\/admin\/login/);

  await expect(page.getByRole("button", { name: "Save draft" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Hero", level: 1 })).toBeVisible();

  await expectHydrated(page);
});
