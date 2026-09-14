"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { RevealHeading } from "../../components/RevealHeading";
import { Wordmark } from "../../components/Wordmark";

/** The brand panel's one line, and the phrase inside it set in the display accent face —
 *  the same move the homepage headline makes with its own turn of phrase. */
const BRAND_HEADING = "One password. Every page this studio shows.";
const BRAND_ACCENT_PHRASES = ["One password."] as const;

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
  const [revealed, setRevealed] = useState(false);

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
    <div className="flex min-h-screen flex-col bg-canvas lg:flex-row">
      {/* THE BRAND HALF. Ink, the same two-glow depth the service grid's hovered cell
          paints (see .login-brand-panel / .service-wash) — held static, since there is
          nothing here to hover. Stacks above the form on a phone; stands beside it as
          its own column from `lg` up, which is also where the rest of the site starts
          treating width as room for a second thing rather than more of the first. */}
      <div className="login-brand-panel surface-dark flex items-center justify-center px-8 py-14 text-canvas lg:w-[42%] lg:px-14 lg:py-0">
        <span aria-hidden="true" className="login-brand-monogram hidden lg:block">
          F
        </span>
        <div className="relative w-full max-w-sm">
          <div className="enter-fade">
            <Wordmark dark alt="Famysys Studio" className="h-8" priority />
          </div>
          <span
            className="label enter-fade mt-8 inline-flex items-center gap-2 rounded-sm border border-accent-on-dark px-2 py-0.5 text-accent-on-dark"
            style={{ ["--enter-delay" as string]: "120ms" }}
          >
            <b className="tabular">01</b> Content panel
          </span>
          <RevealHeading
            as="p"
            accent={[...BRAND_ACCENT_PHRASES]}
            className="mt-6 text-[clamp(1.5rem,3.1vw,2.75rem)] leading-[1.08] tracking-[-0.02em] font-normal text-canvas"
          >
            {BRAND_HEADING}
          </RevealHeading>
          <div className="auth-rule-draw mt-8 h-px w-10 bg-accent-on-dark" />
        </div>
      </div>

      {/* THE FORM HALF. */}
      <div className="flex flex-1 items-center justify-center px-6 py-14">
        <div
          className="enter-fade auth-card w-full max-w-[22rem] p-8 sm:p-10"
          style={{ ["--enter-delay" as string]: "160ms" }}
        >
          <span className="label inline-flex items-center gap-2 rounded-sm border border-accent px-2 py-0.5 text-accent">
            <b className="tabular">02</b> Sign in
          </span>

          <RevealHeading
            as="h1"
            className="mt-4 text-[clamp(1.75rem,3.2vw,2.5rem)] leading-[1.05] tracking-[-0.02em] font-normal text-ink"
          >
            Sign in
          </RevealHeading>
          <div className="auth-rule-draw mt-4 h-px w-10 bg-accent" style={{ animationDelay: "700ms" }} />
          <p className="text-small mt-4 text-graphite-70">
            Enter the shared password to continue. Ask whoever set the site up if you do not
            have it.
          </p>

          <form onSubmit={submit} className="mt-8">
            <label htmlFor="admin-password" className="label block pb-2 text-ink-60">
              Password
            </label>
            <div className="relative">
              <svg
                aria-hidden="true"
                viewBox="0 0 20 20"
                fill="none"
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-40"
              >
                <rect x="4" y="8.5" width="12" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
                <path
                  d="M6.5 8.5V6a3.5 3.5 0 0 1 7 0v2.5"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                />
              </svg>
              <input
                id="admin-password"
                type={revealed ? "text" : "password"}
                name="password"
                autoComplete="current-password"
                autoFocus
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                aria-invalid={error !== null}
                aria-describedby={error ? "admin-password-error" : undefined}
                className="text-small w-full rounded-sm border border-ink-12 bg-card py-2.5 pl-9 pr-11 text-ink outline-none transition-colors duration-[180ms] focus:border-accent"
              />
              <button
                type="button"
                onClick={() => setRevealed((value) => !value)}
                aria-label={revealed ? "Hide password" : "Show password"}
                aria-pressed={revealed}
                className="absolute right-1 top-1/2 -translate-y-1/2 rounded-sm p-2 text-ink-40 transition-colors duration-[180ms] hover:text-ink"
              >
                {revealed ? (
                  <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4" aria-hidden="true">
                    <path
                      d="M2.5 10.5s2.9-5.5 7.5-5.5 7.5 5.5 7.5 5.5-2.9 5.5-7.5 5.5-7.5-5.5-7.5-5.5Z"
                      stroke="currentColor"
                      strokeWidth="1.4"
                    />
                    <circle cx="10" cy="10.5" r="2.25" stroke="currentColor" strokeWidth="1.4" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4" aria-hidden="true">
                    <path
                      d="M2.5 10.5s2.9-5.5 7.5-5.5 7.5 5.5 7.5 5.5-2.9 5.5-7.5 5.5-7.5-5.5-7.5-5.5Z"
                      stroke="currentColor"
                      strokeWidth="1.4"
                    />
                    <circle cx="10" cy="10.5" r="2.25" stroke="currentColor" strokeWidth="1.4" />
                    <path d="M3.5 3.5l13 13" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                  </svg>
                )}
              </button>
            </div>

            {error ? (
              <p
                id="admin-password-error"
                role="alert"
                className="text-small mt-3 rounded-sm border border-accent bg-canvas px-3 py-2 text-accent"
              >
                {error}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={signingIn || password === ""}
              className="text-small mt-6 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-sm bg-ink px-4 py-2 text-canvas transition-colors duration-[180ms] hover:bg-ink-90 disabled:cursor-default disabled:bg-ink-40 disabled:hover:bg-ink-40"
            >
              {signingIn ? (
                <svg
                  className="h-4 w-4 animate-spin"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden="true"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-90"
                    fill="currentColor"
                    d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4Z"
                  />
                </svg>
              ) : null}
              {signingIn ? "Signing in…" : "Sign in"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
