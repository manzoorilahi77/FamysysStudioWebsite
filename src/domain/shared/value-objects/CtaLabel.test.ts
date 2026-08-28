import { describe, expect, it } from "vitest";
import { InvalidCtaLabelError } from "../errors/ValueObjectErrors";
import { CtaLabel } from "./CtaLabel";

describe("CtaLabel", () => {
  it("creates a CtaLabel from a short label and trims whitespace", () => {
    const label = CtaLabel.create("  Book a call  ");

    expect(label.value).toBe("Book a call");
    expect(label.toString()).toBe("Book a call");
  });

  it("throws InvalidCtaLabelError for an empty label", () => {
    expect(() => CtaLabel.create("   ")).toThrow(InvalidCtaLabelError);
  });

  it("throws InvalidCtaLabelError for a label over 40 characters", () => {
    const tooLong = "a".repeat(41);

    expect(() => CtaLabel.create(tooLong)).toThrow(InvalidCtaLabelError);
  });

  it("accepts a label at exactly 40 characters", () => {
    const exact = "a".repeat(40);

    expect(() => CtaLabel.create(exact)).not.toThrow();
  });
});
