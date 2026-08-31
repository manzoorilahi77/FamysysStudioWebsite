import { describe, expect, it } from "vitest";
import { InvalidCompanySizeError } from "../errors/LeadErrors";
import { CompanySize } from "./CompanySize";

describe("CompanySize", () => {
  it.each(["1–50", "50–200", "200–1,000", "1,000+"])(
    "creates a CompanySize for the valid band %s",
    (band) => {
      const size = CompanySize.create(band);

      expect(size.band).toBe(band);
    },
  );

  it("exposes the valid bands via options()", () => {
    expect(CompanySize.options()).toEqual(["1–50", "50–200", "200–1,000", "1,000+"]);
  });

  it("no longer accepts the five-band set /contact replaced", () => {
    for (const retired of ["1-10", "11-50", "51-200", "201-500", "500+"]) {
      expect(() => CompanySize.create(retired)).toThrow(InvalidCompanySizeError);
    }
  });

  it.each(["0-10", "10000+", "", "large"])(
    "throws InvalidCompanySizeError for the unrecognized band %s",
    (value) => {
      expect(() => CompanySize.create(value)).toThrow(InvalidCompanySizeError);
    },
  );
});
