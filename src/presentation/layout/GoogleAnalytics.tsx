"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_ID;

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

  if (process.env.NODE_ENV !== "production" || isAdminRoute || !GA_MEASUREMENT_ID) {
    return null;
  }

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_MEASUREMENT_ID}');
        `}
      </Script>
    </>
  );
}
