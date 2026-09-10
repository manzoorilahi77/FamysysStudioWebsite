/**
 * RUNS ONCE, WHEN THE SERVER STARTS, BEFORE IT ANSWERS A REQUEST.
 *
 * Its one job is outbound mail's configuration, checked at boot rather than discovered by
 * the first visitor who submits the form:
 *
 *   - MAIL_ENABLED=true with a value missing or an address malformed THROWS, and Next
 *     refuses to start. PM2's error log then says which variable, by name. The alternative
 *     is a server that looks healthy and silently emails nobody.
 *   - MAIL_ENABLED=false in production WARNS, once, and does not refuse. Refusing would take
 *     the whole form down over a notification; the enquiries are still stored and still in
 *     the admin inbox.
 *
 * Node runtime only: the edge runtime has no process environment worth checking and never
 * sends mail.
 */
export async function register(): Promise<void> {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  const { mailConfiguration } = await import("./infrastructure/db/env");
  const mail = mailConfiguration();

  if (!mail.enabled && process.env.NODE_ENV === "production") {
    console.warn(
      "[mail] MAIL_ENABLED is false. Contact form submissions are stored and visible in " +
        "/admin/inbox, but nobody is emailed about them.",
    );
  }
}
