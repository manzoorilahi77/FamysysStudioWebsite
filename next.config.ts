import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Static export: the site ships as plain HTML/CSS/JS to a host with no Node runtime.
  // Everything under src/app is a static page; the one API route lives in src/app/_api,
  // a private folder, because `output: "export"` cannot serve request handlers.
  output: "export",
  images: { unoptimized: true },
};

export default nextConfig;
