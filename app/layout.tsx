import type { Metadata } from "next";
import "katex/dist/katex.min.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "Random Surfaces — Monotonic Coupling Simulator",
  description:
    "Interactive visualisation of monotonic coupling on lattice paths. " +
    "Math Experimental Lab: Random Surfaces and Random Permutations — UVA, Spring 2026.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
