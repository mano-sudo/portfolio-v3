import { ThemeProvider } from "./components/theme-provider";

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AppNavbar from "./components/navbar/app-navbar";
import SmoothScroll from "./components/smooth-scroll";
import PageTransition from "./components/page-transition";
import FloatingShootToggleHost from "./components/floating-shoot-toggle-host";
import CollaborativeCursors from "./components/collaborative-cursors";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://romancaseres.cloud";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Roman Caseres | Software Developer",
  description: "Roman Caseres is a software developer with a passion for building web applications.",
  icons: {
    icon: "/DevByRoman.png",
  },
  openGraph: {
    title: "Roman Caseres | Software Developer",
    description: "Roman Caseres is a software developer with a passion for building web applications.",
    images: "/DevByRoman.png",
  },
  twitter: {
    card: "summary_large_image",
    title: "Roman Caseres | Software Developer",
    description: "Roman Caseres is a software developer with a passion for building web applications.",
    images: ["/DevByRoman.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <AppNavbar />
          <CollaborativeCursors />
          <FloatingShootToggleHost />
          <SmoothScroll>
            <PageTransition>{children}</PageTransition>
          </SmoothScroll>
        </ThemeProvider>
      </body>
    </html>
  );
}
