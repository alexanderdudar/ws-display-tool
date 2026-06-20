import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "WS Display — Portfolio Dashboard",
  description: "Visualize your Wealthsimple holdings with charts, treemaps, and detailed analytics.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geist.variable} antialiased`}>
      <body className="font-[family-name:var(--font-geist)]">{children}</body>
    </html>
  );
}
