import { defineConfig, devices } from "@playwright/test";

/**
 * THE CMS'S END-TO-END SUITE.
 *
 * `CONTENT_SOURCE=static` because the database is unreachable from a development machine —
 * cPanel refuses remote MySQL. Everything the file-backed store can prove is proved here;
 * what only the database path can exercise is listed in docs/deployment.md as a checklist
 * rather than left to be rediscovered.
 *
 * SERIAL, ONE WORKER, DELIBERATELY. Under this store a save writes `.cms-drafts.json` and a
 * publish rewrites a TypeScript module in the working tree. Two workers would be two
 * editors writing the same file, and every failure would be a race rather than a defect.
 *
 * THE GATE PROJECT RUNS FIRST and everything depends on it. A stale `.next`, a server that
 * started but never compiled, a bundle that does not hydrate — each of those turns every
 * later assertion into a false failure about the application. The gate fails the run
 * instead, with one message that says what is actually wrong.
 */

const PORT = Number(process.env.E2E_PORT ?? 4399);
const BASE_URL = `http://localhost:${PORT}`;

export default defineConfig({
  testDir: "./e2e",
  outputDir: ".playwright/results",
  globalSetup: "./e2e/global-setup.ts",
  globalTeardown: "./e2e/global-teardown.ts",

  fullyParallel: false,
  workers: 1,
  // A retry would hide the flakiness rather than fix it, and this suite's job is to say
  // whether the panel works, not to keep trying until it does.
  retries: 0,
  timeout: 120_000,
  expect: { timeout: 20_000 },

  reporter: process.env.CI ? [["list"], ["html", { open: "never" }]] : [["list"]],

  use: {
    baseURL: BASE_URL,
    storageState: ".playwright/admin-session.json",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "off",
    actionTimeout: 20_000,
    navigationTimeout: 90_000,
  },

  projects: [
    {
      name: "gate",
      testMatch: /gate\.setup\.ts/,
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "cms",
      testIgnore: /gate\.setup\.ts/,
      dependencies: ["gate"],
      use: { ...devices["Desktop Chrome"] },
    },
  ],

  webServer: {
    // `predev` clears a stale .next and regenerates the colour CSS, which is the other
    // half of "a stale build produces false failures".
    command: `npm run dev -- --port ${PORT} --hostname localhost`,
    url: `${BASE_URL}/admin/login`,
    // Never reuse: a server left running from an earlier session may be serving an older
    // bundle, and that is the exact failure this suite must not report as a defect.
    reuseExistingServer: false,
    timeout: 240_000,
    stdout: "pipe",
    stderr: "pipe",
    env: { CONTENT_SOURCE: "static" },
  },
});
