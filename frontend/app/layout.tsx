import type { Metadata } from "next";

import "./globals.css";
import { QueryProvider } from "@/providers/QueryProvider";

export const metadata: Metadata = {
  title: "DevScout AI",
  description:
    "AI-powered software engineering opportunity intelligence",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-gray-950 text-white">
        <QueryProvider>
          {children}
        </QueryProvider>
      </body>
    </html>
  );
}