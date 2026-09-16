import { cookies, headers } from "next/headers";
import {
  MAX_ATTEMPTS,
  WINDOW_MINUTES,
  attemptLogin,
  clearFailures,
  clientKey,
} from "../../../../infrastructure/auth/adminAuth";
import {
  SESSION_COOKIE,
  SESSION_MAX_AGE_SECONDS,
  issueSession,
  sessionCookieOptions,
} from "../../../../infrastructure/auth/session";

/**
 * SIGN IN.
 *
 * The response says one of three things and nothing more: it worked, the password was
 * wrong, or too many attempts have been made from here. There is no "no such user" — there
 * is one account — and no hint about which character was wrong.
 *
 * THE CLIENT ADDRESS IS TAKEN FROM A HEADER, WHICH IS SPOOFABLE IN GENERAL, but not from
 * this specific position. Apache's `mod_proxy` sits directly in front of this one Node
 * process (see docs/deployment.md) and APPENDS the connecting socket's address as the
 * LAST entry of `x-forwarded-for` — creating the header if the client sent none, or adding
 * to it if the client tried to prepend its own fake entries. The last entry is therefore
 * the one hop we run and is not attacker-controlled; everything before it is and is
 * ignored. A caller can still get a fresh bucket by changing their real source address
 * (a new IP, a VPN hop), which no header trick closes — that is a genuine, documented
 * limit of IP-keyed rate limiting, not a parsing bug. What actually makes guessing
 * impractical is bcrypt at cost 12 and a password with real entropy, and both of those are
 * in place.
 */
export const dynamic = "force-dynamic";

function json(payload: unknown, status: number): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { "content-type": "application/json", "cache-control": "no-store" },
  });
}

export async function POST(request: Request): Promise<Response> {
  const body: unknown = await request.json().catch(() => null);
  const password =
    body &&
    typeof body === "object" &&
    typeof (body as { password?: unknown }).password === "string"
      ? (body as { password: string }).password
      : null;

  if (password === null) {
    return json({ ok: false, message: "Enter the password." }, 400);
  }

  const headerList = await headers();
  const forwardedChain = headerList.get("x-forwarded-for")?.split(",") ?? [];
  const forwarded = forwardedChain[forwardedChain.length - 1]?.trim();
  const key = clientKey(forwarded || headerList.get("x-real-ip"));

  let outcome;
  try {
    outcome = await attemptLogin(password, key);
  } catch (error: unknown) {
    // Configuration and connection failures both land here. Neither should put its
    // message in front of a browser: one names environment variables, the other carries
    // the connection config. The SERVER log is the other side of that trade — the reply
    // tells the operator to read it, so it has to be worth reading. Logging only the name
    // printed "Error" for both causes, which is every cause this catch has, and left the
    // one thing that distinguishes them out of the only place it was safe to put it.
    const cause = error as NodeJS.ErrnoException;
    console.error(
      `[admin] Login could not be checked: ${cause?.name}: ${cause?.message}` +
        (cause?.code ? ` (code ${cause.code})` : ""),
    );
    return json({ ok: false, message: "Sign-in is unavailable. Check the server logs." }, 503);
  }

  if (!outcome.ok && outcome.reason === "locked") {
    return json(
      {
        ok: false,
        message: `Too many attempts. Try again in ${outcome.retryAfterMinutes} ${
          outcome.retryAfterMinutes === 1 ? "minute" : "minutes"
        }.`,
      },
      429,
    );
  }

  if (!outcome.ok) {
    return json(
      {
        ok: false,
        message: `That password is not right. ${MAX_ATTEMPTS} wrong attempts locks sign-in for ${WINDOW_MINUTES} minutes.`,
      },
      401,
    );
  }

  await clearFailures(key);
  const store = await cookies();
  store.set(SESSION_COOKIE, issueSession(), sessionCookieOptions(SESSION_MAX_AGE_SECONDS));
  return json({ ok: true }, 200);
}
