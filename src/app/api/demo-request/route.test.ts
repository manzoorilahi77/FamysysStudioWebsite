import { describe, expect, it } from "vitest";
import { POST } from "./route";

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
        companySize: "11-50",
      }),
    );

    expect(response.status).toBe(200);
  });

  it("returns 400 when a required field is missing", async () => {
    const response = await POST(jsonRequest({ fullName: "Jane Doe" }));

    expect(response.status).toBe(400);
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
});
