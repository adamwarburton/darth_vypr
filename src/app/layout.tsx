import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Vypr — AI-Native Insights Platform",
  description:
    "Create surveys, collect responses, and get AI-powered analysis of consumer insights.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
