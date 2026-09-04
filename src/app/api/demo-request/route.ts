import { NextResponse } from "next/server";
import { SubmitDemoRequest } from "../../../application/lead/SubmitDemoRequest";
import { toDemoRequestFieldErrors } from "../../../application/lead/DemoRequestFieldErrors";
import { container } from "../../../infrastructure/di/container";

/**
 * THE CONTACT FORM'S DESTINATION, WHICH FOR THE FIRST TIME IS SOMEWHERE.
 *
 * `container.demoRequestIntake` used to be `StubLeadRepository`: this route validated a
 * request, resolved, and delivered it to nothing. Worse, the file lived in a private
 * `_api` folder and was never emitted at all, because a static export cannot serve a
 * request handler — so in production the form POSTed to a URL that did not exist and every
 * enquiry ended in a 404. Both are fixed: the site runs on Node, this is a real route, and
 * a validated enquiry becomes a row in `inquiries` that the panel's inbox lists.
 *
 * There is still no email. Forwarding is a later phase, and the table carries the columns
 * it will stamp — the row lands first and a forwarder marks it afterwards, so a mail
 * outage can never cost a lead.
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
    // Not a field the sender can fix — the database refused it, or is not reachable. Say
    // so rather than throwing: the sender has to know the message did not arrive, and the
    // details belong in the server log, not in a response.
    console.error("[contact] An enquiry could not be stored:", (error as Error)?.name);
    return NextResponse.json(
      { error: "We could not record that just now. Please try again in a moment." },
      { status: 503 },
    );
  }
}
