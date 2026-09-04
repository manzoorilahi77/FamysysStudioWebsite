import type { Metadata } from "next";
import type { ReactNode } from "react";

/**
 * Everything under /admin, INCLUDING the login screen — which is why this layout holds no
 * shell and no session check. Both live one level down, in the (panel) group, so the login
 * page renders on its own: a sidebar listing every section of the CMS beside a login form
 * would tell someone who cannot get in exactly what is behind it.
 *
 * `noindex, nofollow` is here rather than there because it should cover the login page
 * too. app/robots.ts disallows /admin for the same reason. Neither is access control —
 * see (panel)/layout.tsx and admin/session.ts for that — they keep a private tool out of
 * search results, which is a different job.
 */
export const metadata: Metadata = {
  title: "Admin — Famysys Studio",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { readonly children: ReactNode }) {
  return children;
}
