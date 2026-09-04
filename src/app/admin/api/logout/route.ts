import { cookies } from "next/headers";
import { SESSION_COOKIE, sessionCookieOptions } from "../../../../infrastructure/auth/session";

/**
 * SIGN OUT.
 *
 * POST rather than GET, so a link on another page — or a prefetch — cannot sign someone
 * out by being followed.
 *
 * The cookie is overwritten with an empty value and a zero lifetime rather than merely
 * deleted, because a browser that ignores the delete still ends up with a cookie that
 * fails signature verification. The same attributes are used as when it was set: a cookie
 * cleared with a different path or sameSite is a cookie that is still there.
 */
export const dynamic = "force-dynamic";

export async function POST(): Promise<Response> {
  const store = await cookies();
  store.set(SESSION_COOKIE, "", sessionCookieOptions(0));
  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { "content-type": "application/json", "cache-control": "no-store" },
  });
}
