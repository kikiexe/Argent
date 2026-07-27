import type { Metadata } from "next";
import "./globals.css";
import MobileNavigation from "@/components/MobileNavigation";

import type { Viewport } from "next";

export const viewport: Viewport = {
  themeColor: "#4f46e5",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover"
};

export const metadata: Metadata = {
  title: "Argent",
  description: "A finance tracker.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Argent"
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-canvas text-ink min-h-screen flex flex-col font-sans antialiased">
        {children}
        <MobileNavigation />
      </body>
    </html>
  );
}
