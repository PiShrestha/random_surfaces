import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Random Surfaces — Monotonic Coupling Simulator",
  description:
    "Interactive visualisation of monotonic coupling on lattice paths, demonstrating mixing time upper bounds for Markov chains.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
