import type { Metadata } from "next";
import "./globals.css";
import MobileNavigation from "@/components/MobileNavigation";
import type { Viewport } from "next";
import { Inter } from "next/font/google";
import TimezoneInitializer from "@/components/TimezoneInitializer";

const inter = Inter({
  subsets: ["latin"],
  display: "swap"
});

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#121212" }
  ],
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover"
};

export const metadata: Metadata = {
  title: "Pecune",
  description: "A finance tracker.",
  manifest: "/manifest.json",
  icons: {
    icon: "/192x192.png",
    shortcut: "/192x192.png",
    apple: "/192x192.png"
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Pecune"
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-canvas text-ink min-h-screen flex flex-col font-sans antialiased`}>
        <TimezoneInitializer />
        {children}
        <MobileNavigation />
      </body>
    </html>
  );
}

