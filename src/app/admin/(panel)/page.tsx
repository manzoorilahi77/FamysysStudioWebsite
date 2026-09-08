import { redirect } from "next/navigation";

/**
 * There is no dashboard.
 *
 * There was one, and it counted things: seven pages, eight collections, fifty-five files. None of
 * those numbers was a question anyone had, and it was a screen between the editor and the work.
 * /admin goes to the homepage's editor, which is where someone opening this panel almost always
 * means to be.
 */
export default function AdminRoot() {
  redirect("/admin/pages/home");
}
