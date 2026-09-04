import { redirect } from "next/navigation";
import { LoginForm } from "../../../presentation/admin/components/LoginForm";
import { hasAdminSession } from "../session";

/**
 * The only screen under /admin that does not require a session, and it is deliberately
 * outside the panel's shell: a sidebar full of section names beside a login form would
 * tell someone who cannot get in what is behind it.
 *
 * Already signed in and this page redirects, so a bookmarked /admin/login does not become
 * a way to sign out by accident.
 *
 * `next` is carried through so signing in lands on the screen that was asked for. It is
 * validated in the form's action before it is used — an open redirect is exactly the kind
 * of thing a login page attracts.
 */
export const dynamic = "force-dynamic";

export default async function AdminLoginPage({
  searchParams,
}: {
  readonly searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { next } = await searchParams;
  const target = typeof next === "string" ? next : undefined;

  if (await hasAdminSession()) {
    redirect(target && target.startsWith("/admin") ? target : "/admin");
  }

  return <LoginForm next={target} />;
}
