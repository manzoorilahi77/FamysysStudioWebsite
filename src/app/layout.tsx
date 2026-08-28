import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Famysys Studio",
  description: "Famysys Studio — video design and creative production.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
