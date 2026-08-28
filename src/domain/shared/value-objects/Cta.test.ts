import { describe, expect, it } from "vitest";
import { createCta } from "./Cta";

describe("createCta", () => {
  it("composes a validated CtaLabel and Url", () => {
    const cta = createCta("Book a call", "/contact");

    expect(cta.label.toString()).toBe("Book a call");
    expect(cta.href.toString()).toBe("/contact");
  });

  it("propagates label validation failures", () => {
    expect(() => createCta("   ", "/contact")).toThrow();
  });

  it("propagates href validation failures", () => {
    expect(() => createCta("Book a call", "not-a-url")).toThrow();
  });
});
