"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Wordmark } from "../../components/Wordmark";

/**
 * ONE FIELD, AND NOTHING THAT HELPS SOMEONE GUESS.
 *
 * No username — there is one account. No "forgot password" — there is nowhere to send a
 * reset, and a link that pretends otherwise is worse than none. No indication of how many
 * attempts are left until the server says so, and then only because a person locked out
 * for fifteen minutes deserves to know why rather than think the panel is broken.
 *
 * The password is never held anywhere but this component's state and the request body. It
 * is not put in the URL, not stored, and the field is `autoComplete="current-password"` so
 * a password manager fills it rather than the person typing it into the wrong window.
 *
 * `next` is where to go afterwards. It is checked against a "/admin" prefix before it is
 * used: a login form that redirects wherever a query string says is an open redirect, and
 * a login form is exactly where one gets used.
 */
export function LoginForm({ next }: { readonly next?: string | undefined }) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [signingIn, setSigningIn] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (signingIn || password === "") return;

    setSigningIn(true);
    setError(null);
    try {
      const response = await fetch("/admin/api/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const result = (await response.json()) as { ok: boolean; message?: string };

      if (!result.ok) {
        setError(result.message ?? "That password is not right.");
        setPassword("");
        setSigningIn(false);
        return;
      }

      // Cleared before navigating, so it is not sitting in memory behind the next screen.
      setPassword("");
      router.replace(next && next.startsWith("/admin") ? next : "/admin");
      router.refresh();
    } catch {
      setError("The server did not answer. Check that it is running.");
      setSigningIn(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas px-6">
      <div className="w-full max-w-[22rem]">
        <Wordmark alt="Famysys Studio" className="h-7" />

        <h1 className="text-display-s mt-10 text-ink">Sign in</h1>
        <p className="text-small mt-3 text-graphite-70">
          The content panel for Famysys Studio. One shared password — ask whoever set the site up if
          you do not have it.
        </p>

        <form onSubmit={submit} className="mt-8">
          <label htmlFor="admin-password" className="label block pb-2 text-ink-60">
            Password
          </label>
          <input
            id="admin-password"
            type="password"
            name="password"
            autoComplete="current-password"
            autoFocus
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            aria-invalid={error !== null}
            aria-describedby={error ? "admin-password-error" : undefined}
            className="text-small w-full rounded-sm border border-hairline bg-card px-3 py-2 text-ink outline-none focus:border-ink-40"
          />

          {error ? (
            <p id="admin-password-error" role="alert" className="text-small mt-3 text-graphite-70">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={signingIn || password === ""}
            className="text-small mt-6 w-full rounded-sm bg-ink px-4 py-2 text-canvas transition-colors duration-[180ms] disabled:cursor-default disabled:bg-ink-40"
          >
            {signingIn ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
