import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Darth Vypr — Consumer Intelligence Platform",
  description:
    "Better decisions, winning products. Rapid, predictive consumer insight that reduces guesswork and increases product success rates.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
