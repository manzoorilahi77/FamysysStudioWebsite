import { NextResponse } from "next/server";

interface DemoRequestPayload {
  fullName?: unknown;
  email?: unknown;
  companyName?: unknown;
  companySize?: unknown;
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

export async function POST(request: Request): Promise<Response> {
  let payload: DemoRequestPayload;
  try {
    payload = (await request.json()) as DemoRequestPayload;
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  const { fullName, email, companyName, companySize } = payload;
  if (
    !isNonEmptyString(fullName) ||
    !isNonEmptyString(email) ||
    !isNonEmptyString(companyName) ||
    !isNonEmptyString(companySize)
  ) {
    return NextResponse.json(
      { error: "fullName, email, companyName, and companySize are all required." },
      { status: 400 },
    );
  }

  // Stub only: no email or CRM integration yet. Domain-level validation (the
  // BusinessEmail, FullName, and CompanySize invariants) runs through
  // SubmitDemoRequest, wired to this route from checkpoint 5 onward.
  return NextResponse.json({ status: "received" }, { status: 200 });
}
