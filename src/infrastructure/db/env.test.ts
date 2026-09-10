import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MissingConfigurationError, isMailEnabled, mailConfiguration } from "./env";

/**
 * MAIL'S CONFIGURATION: OFF BY DEFAULT, AND ALL-OR-NOTHING WHEN ON.
 *
 * An empty string is how an unset variable arrives from a .env file, so "" stands for
 * "not set" throughout — the same reading `read()` takes.
 */

const MAIL_VARIABLES = [
  "MAIL_ENABLED",
  "MAIL_SENDER",
  "MAIL_FROM_NAME",
  "MAIL_NOTIFY_TO",
  "GRAPH_TENANT_ID",
  "GRAPH_CLIENT_ID",
  "GRAPH_CLIENT_SECRET",
] as const;

function configure(values: Partial<Record<(typeof MAIL_VARIABLES)[number], string>>): void {
  for (const name of MAIL_VARIABLES) vi.stubEnv(name, values[name] ?? "");
}

const COMPLETE = {
  MAIL_ENABLED: "true",
  MAIL_SENDER: "hello@famysys.com",
  MAIL_NOTIFY_TO: "studio@famysys.com",
  GRAPH_TENANT_ID: "tenant",
  GRAPH_CLIENT_ID: "client",
  GRAPH_CLIENT_SECRET: "a-secret-value",
} as const;

beforeEach(() => configure({}));
afterEach(() => vi.unstubAllEnvs());

describe("mailConfiguration", () => {
  it("is off when MAIL_ENABLED is unset, and asks for nothing else", () => {
    expect(mailConfiguration()).toEqual({ enabled: false });
    expect(isMailEnabled()).toBe(false);
  });

  it("is off when MAIL_ENABLED is false, even with credentials missing", () => {
    configure({ MAIL_ENABLED: "false" });

    expect(mailConfiguration().enabled).toBe(false);
  });

  it("refuses a MAIL_ENABLED that is neither true nor false", () => {
    configure({ MAIL_ENABLED: "sometimes" });

    expect(() => mailConfiguration()).toThrow(/MAIL_ENABLED must be/);
  });

  it("names every missing variable when mail is on, and no value", () => {
    configure({ MAIL_ENABLED: "true", MAIL_SENDER: "hello@famysys.com" });

    const error = (() => {
      try {
        mailConfiguration();
        return undefined;
      } catch (caught: unknown) {
        return caught;
      }
    })();

    expect(error).toBeInstanceOf(MissingConfigurationError);
    expect((error as MissingConfigurationError).names).toEqual([
      "MAIL_NOTIFY_TO",
      "GRAPH_TENANT_ID",
      "GRAPH_CLIENT_ID",
      "GRAPH_CLIENT_SECRET",
    ]);
    expect((error as Error).message).not.toContain("hello@famysys.com");
  });

  it.each(["MAIL_SENDER", "MAIL_NOTIFY_TO"] as const)(
    "refuses a %s that is not an email address, naming the variable and not the value",
    (name) => {
      configure({ ...COMPLETE, [name]: "not-an-address" });

      expect(() => mailConfiguration()).toThrow(`${name} does not look like an email address.`);
    },
  );

  it("defaults the From name to the brand, not the mailbox's Entra display name", () => {
    configure(COMPLETE);

    expect(mailConfiguration()).toEqual({
      enabled: true,
      sender: "hello@famysys.com",
      notifyTo: "studio@famysys.com",
      fromName: "Famysys Studio",
      graph: { tenantId: "tenant", clientId: "client", clientSecret: "a-secret-value" },
    });
  });

  it("uses MAIL_FROM_NAME when it is set", () => {
    configure({ ...COMPLETE, MAIL_FROM_NAME: "Famysys Studio Team" });

    const config = mailConfiguration();
    expect(config.enabled && config.fromName).toBe("Famysys Studio Team");
  });
});
