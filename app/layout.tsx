import type { Metadata } from "next";
import type { ReactNode } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import "katex/dist/katex.min.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "Paul IA",
  description: "L'IA qui choisit la meilleure IA pour tes études.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="fr">
      <body>
        <SiteHeader />
        {children}
      </body>
    </html>
  );
}
