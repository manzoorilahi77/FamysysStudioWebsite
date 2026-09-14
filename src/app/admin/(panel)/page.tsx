import { redirect } from "next/navigation";

/**
 * THERE IS A DASHBOARD AGAIN, AND IT SAYS SO ON PURPOSE.
 *
 * There was one before, and it counted things: seven pages, eight collections, fifty-five
 * files. None of those numbers was a question anyone had, and it was a screen between the
 * editor and the work. It was removed for that reason, and this comment used to explain why
 * /admin went straight to the homepage editor instead.
 *
 * This one is different in kind, not just in content: every number on it is derived from the
 * same read model the rest of the panel already trusts (see GetDashboardOverview), it
 * answers questions that actually recur — how much is unpublished and where, how many
 * enquiries came in, what just happened — and its draft list doubles as the quick links back
 * to unfinished work rather than existing to be counted. /admin goes here now because this is
 * where someone opening the panel is most often trying to find out where they left off.
 */
export default function AdminRoot() {
  redirect("/admin/dashboard");
}
