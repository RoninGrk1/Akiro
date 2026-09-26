import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SessionProvider } from "@/components/auth/SessionProvider";
import { Web3Providers } from "@/components/web3/Web3Providers";
import { AppShell } from "@/components/shell/AppShell";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Akiro",
    template: "%s · Akiro",
  },
  description:
    "One website. Twenty tools. One expert AI. Zero unnecessary complexity. A lightweight Web3 development environment.",
  applicationName: "Akiro",
  icons: {
    icon: [{ url: "/akiro-logo.svg", type: "image/svg+xml" }],
    apple: [{ url: "/akiro-logo.svg" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#080B0D",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en-GB"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-background text-foreground">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-accent-blue focus:px-3 focus:py-2 focus:text-sm focus:text-white"
        >
          Skip to main content
        </a>
        <SessionProvider>
          <Web3Providers>
            <AppShell>{children}</AppShell>
          </Web3Providers>
        </SessionProvider>
      </body>
    </html>
  );
}
