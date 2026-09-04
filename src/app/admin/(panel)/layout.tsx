import type { ReactNode } from "react";
import { AdminShell } from "../../../presentation/admin/components/AdminShell";
import { requireAdminSession } from "../session";

/**
 * THE GATE, IN ONE PLACE.
 *
 * Every screen in the panel is a child of this layout, so the session check happens once
 * and covers screens that do not exist yet. A per-page check would be a check someone can
 * forget to add, and the page it was forgotten on is the one that leaks.
 *
 * `force-dynamic` because a session-gated screen must never be served from a cache. The
 * panel also reads content that changes as it is edited, so a cached admin page would show
 * an editor their own change had not happened.
 */
export const dynamic = "force-dynamic";

export default async function AdminPanelLayout({ children }: { readonly children: ReactNode }) {
  await requireAdminSession();

  return <AdminShell>{children}</AdminShell>;
}
