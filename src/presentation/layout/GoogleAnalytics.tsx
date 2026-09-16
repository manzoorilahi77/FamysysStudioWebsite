"use client";

import { useEffect } from "react";
import Script from "next/script";
import { usePathname } from "next/navigation";

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_ID;

declare global {
  interface Window {
    dataLayer?: unknown[];
  }
}

/**
 * gtag is called from a bundled, same-origin script chunk (this file, compiled) rather
 * than from a literal inline `<script>` tag, so the page's Content-Security-Policy
 * (middleware.ts) never needs `'unsafe-inline'` or a nonce threaded down to this
 * component just to let analytics boot.
 */
function initializeGtag(measurementId: string): void {
  window.dataLayer = window.dataLayer || [];
  function gtag(...args: unknown[]): void {
    window.dataLayer?.push(args);
  }
  gtag("js", new Date());
  gtag("config", measurementId);
}

/**
 * Off in every environment but production, and off under /admin even there: an internal
 * editing tool generates no signal worth measuring, and every `npm run dev` / `npm run
 * build` session on this project would otherwise show up as a fake visitor in the client's
 * real GA4 property. usePathname (not a route group split) is what lets one component in
 * the root layout cover every public route without also covering /admin, which shares that
 * same root layout.
 */
export function GoogleAnalytics() {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith("/admin") ?? false;
  const enabled = process.env.NODE_ENV === "production" && !isAdminRoute && !!GA_MEASUREMENT_ID;

  useEffect(() => {
    if (enabled && GA_MEASUREMENT_ID) initializeGtag(GA_MEASUREMENT_ID);
  }, [enabled]);

  if (!enabled) return null;

  return (
    <Script
      src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
      strategy="afterInteractive"
    />
  );
}
