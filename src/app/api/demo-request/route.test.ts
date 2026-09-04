import { describe, expect, it, vi } from "vitest";

/**
 * THE INTAKE IS REPLACED, AND THAT IS THE POINT OF THE MOCK.
 *
 * This route now writes an enquiry to MySQL. A test that let it do so would need
 * credentials, would fail on a machine without them, and — worse — would put rows in the
 * real inbox every time the suite ran. What is under test here is the route's contract:
 * which payloads it accepts, which it rejects, and with what. Where an accepted one ends
 * up is the repository's business, and has its own tests.
 *
 * The mock must be declared before the route is imported, which is why the import below
 * is not at the top of the file.
 */
const submit = vi.fn(async () => undefined);

vi.mock("../../../infrastructure/di/container", () => ({
  container: { demoRequestIntake: { submit } },
}));

const { POST } = await import("./route");

function jsonRequest(body: unknown): Request {
  return new Request("http://localhost/api/demo-request", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/demo-request", () => {
  it("returns 200 for a well-formed payload", async () => {
    const response = await POST(
      jsonRequest({
        fullName: "Jane Doe",
        email: "jane@acme.com",
        companyName: "Acme Inc.",
        companySize: "50–200",
      }),
    );

    expect(response.status).toBe(200);
  });

  it("returns 422 with a field error for each missing required field", async () => {
    const response = await POST(jsonRequest({ fullName: "Jane Doe" }));
    const body = (await response.json()) as {
      errors?: { email?: string; companyName?: string; companySize?: string };
    };

    expect(response.status).toBe(422);
    expect(body.errors?.email).toBeDefined();
    expect(body.errors?.companyName).toBeDefined();
    expect(body.errors?.companySize).toBeDefined();
  });

  it("returns 400 for malformed JSON", async () => {
    const request = new Request("http://localhost/api/demo-request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "not json",
    });

    const response = await POST(request);

    expect(response.status).toBe(400);
  });

  it("returns 422 with an actionable field error for a free-mail address", async () => {
    const response = await POST(
      jsonRequest({
        fullName: "Jane Doe",
        email: "jane@gmail.com",
        companyName: "Acme Inc.",
        companySize: "50–200",
      }),
    );
    const body = (await response.json()) as { errors?: { email?: string } };

    expect(response.status).toBe(422);
    expect(body.errors?.email).toMatch(/work email/i);
  });

  it("returns 422 with a field error when the full name has no last name", async () => {
    const response = await POST(
      jsonRequest({
        fullName: "Jane",
        email: "jane@acme.com",
        companyName: "Acme Inc.",
        companySize: "50–200",
      }),
    );
    const body = (await response.json()) as { errors?: { fullName?: string } };

    expect(response.status).toBe(422);
    expect(body.errors?.fullName).toBeDefined();
  });

  it("returns 422 with a field error for an unrecognized company size", async () => {
    const response = await POST(
      jsonRequest({
        fullName: "Jane Doe",
        email: "jane@acme.com",
        companyName: "Acme Inc.",
        companySize: "not-a-band",
      }),
    );
    const body = (await response.json()) as { errors?: { companySize?: string } };

    expect(response.status).toBe(422);
    expect(body.errors?.companySize).toBeDefined();
  });
});
