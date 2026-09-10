import { afterEach, describe, expect, it, vi } from "vitest";
import { BusinessEmail } from "../../domain/lead/value-objects/BusinessEmail";
import { CompanySize } from "../../domain/lead/value-objects/CompanySize";
import { DemoRequest } from "../../domain/lead/entities/DemoRequest";
import { FullName } from "../../domain/lead/value-objects/FullName";
import { ProjectBrief } from "../../domain/lead/value-objects/ProjectBrief";
import { HttpLeadRepository } from "./HttpLeadRepository";

function fixtureRequest(): DemoRequest {
  return DemoRequest.create({
    email: BusinessEmail.create("jane@acme.com"),
    fullName: FullName.create("Jane Doe"),
    companyName: "Acme Inc.",
    companySize: CompanySize.create("50–200"),
    brief: ProjectBrief.create("A launch film."),
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
          email: "jane@acme.com",
          fullName: "Jane Doe",
          companyName: "Acme Inc.",
          companySize: "50–200",
          brief: "A launch film.",
        }),
      }),
    );
  });

  /**
   * A question the sender skipped is left OUT of the body, not sent as null or "". The
   * route reads an absent key as unanswered and stores NULL; a key holding "" would be
   * recorded as an answer of nothing.
   */
  it("omits every unanswered field, posting the email alone", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);
    const repository = new HttpLeadRepository();

    await repository.submit(DemoRequest.create({ email: BusinessEmail.create("jane@acme.com") }));

    const [, init] = fetchMock.mock.calls[0] as [string, { body: string }];
    const body = JSON.parse(init.body) as Record<string, unknown>;
    expect(Object.keys(body)).toEqual(["email"]);
  });

  it("resolves to the id the route returns", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response(JSON.stringify({ ok: true, id: "42" }), { status: 201 })),
    );

    await expect(new HttpLeadRepository().submit(fixtureRequest())).resolves.toBe("42");
  });

  it("throws when the response is not ok", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(null, { status: 500 })));
    const repository = new HttpLeadRepository();

    await expect(repository.submit(fixtureRequest())).rejects.toThrow(
      "Demo request submission failed with status 500.",
    );
  });
});
