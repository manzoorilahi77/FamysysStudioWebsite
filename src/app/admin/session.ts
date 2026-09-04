import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE, isValidSession } from "../../infrastructure/auth/session";

/**
 * THE GATE. Every admin screen and every admin endpoint goes through one of these two.
 *
 * `requireAdminSession` is for pages: no session, and the browser is sent to the login
 * screen with where it was trying to go, so signing in lands on the right page rather than
 * the dashboard.
 *
 * `hasAdminSession` is for endpoints: they answer 401 rather than redirecting, because a
 * fetch that follows a redirect to an HTML login page gets a confusing parse error instead
 * of a status it can act on.
 *
 * The layout calls the first, which covers every page under /admin including ones added
 * later — a screen cannot forget to check. Endpoints check themselves, because a route
 * handler has no layout above it.
 *
 * WHAT THIS REPLACED. Until authentication existed, the panel was blocked from production
 * by three layers: route files that were not compiled outside `next dev`, a NODE_ENV check
 * in every route, and a robots disallow. The first two are gone — they were standing in
 * for exactly this — and the third stays: the panel works in production now, and still
 * should not appear in a search result.
 */

export async function hasAdminSession(): Promise<boolean> {
  const store = await cookies();
  return isValidSession(store.get(SESSION_COOKIE)?.value);
}

export async function requireAdminSession(returnTo?: string): Promise<void> {
  if (await hasAdminSession()) return;
  const target = returnTo && returnTo.startsWith("/admin") ? returnTo : undefined;
  redirect(target ? `/admin/login?next=${encodeURIComponent(target)}` : "/admin/login");
}

/** 401 with a message the panel can show, for the endpoints. */
export function unauthorised(): Response {
  return new Response(
    JSON.stringify({
      ok: false,
      valueId: null,
      message: "Your session has expired. Sign in again.",
    }),
    { status: 401, headers: { "content-type": "application/json", "cache-control": "no-store" } },
  );
}
