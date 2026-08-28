import { afterEach, describe, expect, it, vi } from "vitest";
import { BusinessEmail } from "../../domain/lead/value-objects/BusinessEmail";
import { CompanySize } from "../../domain/lead/value-objects/CompanySize";
import { DemoRequest } from "../../domain/lead/entities/DemoRequest";
import { FullName } from "../../domain/lead/value-objects/FullName";
import { HttpLeadRepository } from "./HttpLeadRepository";

function fixtureRequest(): DemoRequest {
  return DemoRequest.create({
    fullName: FullName.create("Jane Doe"),
    email: BusinessEmail.create("jane@acme.com"),
    companyName: "Acme Inc.",
    companySize: CompanySize.create("11-50"),
  });
}

describe("HttpLeadRepository", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("posts the request to /api/demo-request with the domain values", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);
    const repository = new HttpLeadRepository();

    await repository.submit(fixtureRequest());

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/demo-request",
      expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: "Jane Doe",
          email: "jane@acme.com",
          companyName: "Acme Inc.",
          companySize: "11-50",
        }),
      }),
    );
  });

  it("throws when the response is not ok", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(null, { status: 500 })));
    const repository = new HttpLeadRepository();

    await expect(repository.submit(fixtureRequest())).rejects.toThrow(
      "Demo request submission failed with status 500.",
    );
  });
});
