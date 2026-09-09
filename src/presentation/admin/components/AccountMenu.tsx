"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ADMIN_ACCOUNT_NAME } from "../adminNavigation";

/**
 * The account control in the top right, which until authentication existed was a disabled
 * button with a chevron on it. It now does the one thing there is to do: sign out.
 *
 * Deliberately not a menu. One account and one action is a button, and a dropdown holding
 * a single item is a dropdown that exists to look like other software.
 *
 * POST, not a link: a GET that signs someone out can be triggered by anything that
 * follows a URL, including a prefetch.
 */
export function AccountMenu() {
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);

  async function signOut() {
    setSigningOut(true);
    await fetch("/admin/api/logout", { method: "POST" }).catch(() => undefined);
    router.replace("/admin/login");
    router.refresh();
  }

  return (
    <div className="text-small flex shrink-0 items-center gap-3 text-graphite-70">
      <span>{ADMIN_ACCOUNT_NAME}</span>
      <button
        type="button"
        onClick={signOut}
        disabled={signingOut}
        className="inline-flex min-h-11 items-center transition-colors duration-[180ms] hover:text-ink disabled:cursor-default"
      >
        {signingOut ? "Signing out…" : "Sign out"}
      </button>
    </div>
  );
}
