import { NextResponse } from "next/server";
import { SubmitDemoRequest } from "../../../application/lead/SubmitDemoRequest";
import { toDemoRequestFieldErrors } from "../../../application/lead/DemoRequestFieldErrors";
import { container } from "../../../infrastructure/di/container";

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
    await useCase.execute({ fullName, email, companyName, companySize });
    return NextResponse.json({ status: "received" }, { status: 200 });
  } catch (error) {
    const fieldErrors = toDemoRequestFieldErrors(error);
    if (fieldErrors) {
      return NextResponse.json({ errors: fieldErrors }, { status: 422 });
    }
    throw error;
  }
}
