import { NextResponse, after } from "next/server";
import { NotifyOfInquiry } from "../../../application/lead/NotifyOfInquiry";
import {
  SubmitDemoRequest,
  type SubmittedDemoRequest,
} from "../../../application/lead/SubmitDemoRequest";
import { toDemoRequestFieldErrors } from "../../../application/lead/DemoRequestFieldErrors";
import { container } from "../../../infrastructure/di/container";
import { clientAddress } from "../../../infrastructure/lead/SubmissionRateLimit";

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
 * A SUBMISSION IS NEVER LOST TO A MAIL FAILURE. The row is committed and `201` is the
 * response BEFORE anything mail-related runs: the two messages are scheduled with
 * `after()`, which Next runs once the response has gone — on this site's long-lived PM2
 * process, not a function that is frozen when it answers. An expired client secret or a
 * Microsoft outage then costs the studio a notification and costs the visitor nothing.
 * Awaiting the send here would turn a form that has worked for months into a 500 on the
 * day the secret expires, and somebody's brief into an error page.
 */
interface DemoRequestPayload {
  email?: unknown;
  fullName?: unknown;
  companyName?: unknown;
  companySize?: unknown;
  // No longer collected by either form. Still accepted, because this endpoint is public
  // and `inquiries` holds the columns — see `SubmitDemoRequestInput`.
  companyWebsite?: unknown;
  role?: unknown;
  brief?: unknown;
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

/**
 * An optional answer: passed through when the sender gave one, omitted when they did not.
 * A non-string is treated as absent rather than rejected — the field was optional, and
 * refusing the whole submission over the shape of something nobody had to send would lose
 * a lead to a detail that does not matter.
 */
function optionalString(value: unknown): string | undefined {
  return isNonEmptyString(value) ? value : undefined;
}

/**
 * A ceiling on the whole body, checked before anything is parsed.
 *
 * The per-field limits live in the value objects and say what a column can hold. This says
 * what the endpoint will read at all, and it is a different job: it is the guard against a
 * script posting megabytes at a public URL, and it has to apply before `request.json()`
 * builds a string out of them. 64KB is roughly sixteen times the longest brief the domain
 * will store and far past anything a person types into five fields.
 */
const MAX_BODY_BYTES = 64 * 1024;

export async function POST(request: Request): Promise<Response> {
  // Before anything is read: a flood should cost as little as possible. See
  // SubmissionRateLimit for the ceiling and why it lives in memory.
  const decision = container.submissionRateLimit.take(clientAddress(request.headers));
  if (!decision.allowed) {
    return NextResponse.json(
      { error: "Too many submissions from here. Please try again in a few minutes." },
      { status: 429, headers: { "Retry-After": String(decision.retryAfterSeconds) } },
    );
  }

  const declaredLength = Number(request.headers.get("content-length") ?? "0");
  if (Number.isFinite(declaredLength) && declaredLength > MAX_BODY_BYTES) {
    return NextResponse.json({ error: "That request is too large." }, { status: 413 });
  }

  let payload: DemoRequestPayload;
  try {
    const raw = await request.text();
    // Content-Length can be absent or wrong; this is the length actually read.
    if (raw.length > MAX_BODY_BYTES) {
      return NextResponse.json({ error: "That request is too large." }, { status: 413 });
    }
    payload = JSON.parse(raw) as DemoRequestPayload;
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  // THE EMAIL IS THE ONLY FIELD THIS INSISTS ON, matching both forms and `DemoRequest`.
  // A name, a company, a size and a brief are each stored when given and left NULL when
  // not; none of them can fail the submission by being absent.
  const { email } = payload;
  if (!isNonEmptyString(email)) {
    return NextResponse.json(
      { errors: { email: "Enter an email address so we can reply." } },
      { status: 422 },
    );
  }

  let submitted: SubmittedDemoRequest;
  try {
    const useCase = new SubmitDemoRequest(container.demoRequestIntake);
    submitted = await useCase.execute({
      email,
      fullName: optionalString(payload.fullName),
      companyName: optionalString(payload.companyName),
      companySize: optionalString(payload.companySize),
      companyWebsite: optionalString(payload.companyWebsite),
      role: optionalString(payload.role),
      brief: optionalString(payload.brief),
    });
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

  scheduleNotification(submitted);
  // `confirmationEmail` tells the page whether an acknowledgement was scheduled, so the
  // confirmation only tells the sender to look for an email when one is coming.
  return NextResponse.json(
    { ok: true, id: submitted.id, confirmationEmail: container.inquiryMailer !== undefined },
    { status: 201 },
  );
}

/**
 * Hands the two messages to `after()`. Nothing here may fail the response: the row is
 * already stored. `NotifyOfInquiry` logs its own failures and never throws; the `.catch`
 * is the last line of defence against an unhandled rejection taking the process down over
 * an email, and the outer `try` covers `after()` itself refusing to schedule.
 */
function scheduleNotification({ id, request }: SubmittedDemoRequest): void {
  const inquiry = { id, request, receivedAt: new Date() };
  try {
    after(() =>
      new NotifyOfInquiry(container.inquiryMailer, container.inquiryDeliveryLog)
        .execute(inquiry)
        .catch((error: unknown) => {
          console.error(`[mail] Inquiry ${id}: the notification task failed: ${(error as Error)?.name}`);
        }),
    );
  } catch (error: unknown) {
    console.error(`[mail] Inquiry ${id}: the notification could not be scheduled: ${(error as Error)?.name}`);
  }
}
