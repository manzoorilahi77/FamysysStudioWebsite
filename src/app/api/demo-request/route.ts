import { NextResponse } from "next/server";
import { SubmitDemoRequest } from "../../../application/lead/SubmitDemoRequest";
import { toDemoRequestFieldErrors } from "../../../application/lead/DemoRequestFieldErrors";
import { container } from "../../../infrastructure/di/container";

/**
 * SUBMISSIONS CURRENTLY GO NOWHERE. `container.demoRequestIntake` is `StubLeadRepository`:
 * this route validates a request, resolves, and delivers it to nothing — no email, no CRM,
 * no queue, no file. Wiring it to a real destination is a launch blocker, not a nice to
 * have. See the README and the top of docs/content-todo.md.
 */
interface DemoRequestPayload {
  fullName?: unknown;
  email?: unknown;
  companyName?: unknown;
  companySize?: unknown;
  // /contact's three extra fields. Absent when the homepage's closing form is the sender,
  // which is why they are optional here rather than defaulted to "".
  companyWebsite?: unknown;
  role?: unknown;
  brief?: unknown;
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

/** A field only the contact form sends: passed through when present, omitted when not. */
function optionalString(value: unknown): string | undefined {
  return isNonEmptyString(value) ? value : undefined;
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
    const missingFieldErrors: Record<string, string> = {};
    if (!isNonEmptyString(fullName)) {
      missingFieldErrors.fullName = "Enter your full name.";
    }
    if (!isNonEmptyString(email)) {
      missingFieldErrors.email = "Enter your business email.";
    }
    if (!isNonEmptyString(companyName)) {
      missingFieldErrors.companyName = "Enter your company name.";
    }
    if (!isNonEmptyString(companySize)) {
      missingFieldErrors.companySize = "Choose a company size from the list.";
    }
    return NextResponse.json({ errors: missingFieldErrors }, { status: 422 });
  }

  try {
    const useCase = new SubmitDemoRequest(container.demoRequestIntake);
    await useCase.execute({
      fullName,
      email,
      companyName,
      companySize,
      companyWebsite: optionalString(payload.companyWebsite),
      role: optionalString(payload.role),
      brief: optionalString(payload.brief),
    });
    return NextResponse.json({ status: "received" }, { status: 200 });
  } catch (error) {
    const fieldErrors = toDemoRequestFieldErrors(error);
    if (fieldErrors) {
      return NextResponse.json({ errors: fieldErrors }, { status: 422 });
    }
    throw error;
  }
}
