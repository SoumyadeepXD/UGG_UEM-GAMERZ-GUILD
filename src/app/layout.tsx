import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";
import { siteConfig } from "@/config/site";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://ugg.vercel.app";

export const viewport: Viewport = {
  themeColor: "#060709",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${siteConfig.name} - ${siteConfig.fullName} | Official Esports Guild`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: [
    "UGG",
    "UEMK Gamerz Guild",
    "UEM Kolkata Esports",
    "Collegiate Esports India",
    "Valorant Tournaments",
    "BGMI Campus Warfare",
    "EA FC 25 Collegiate",
    "College Gaming Guild",
  ],
  authors: [{ name: siteConfig.fullName, url: siteUrl }],
  creator: siteConfig.fullName,
  publisher: siteConfig.university,
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: [
      { url: siteConfig.assets.logo, type: "image/webp" },
      { url: siteConfig.assets.logoPng, type: "image/png" },
    ],
    apple: [
      { url: siteConfig.assets.logo, type: "image/webp" },
      { url: siteConfig.assets.logoPng, type: "image/png" },
    ],
  },
  manifest: "/manifest.webmanifest",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: siteUrl,
    title: `${siteConfig.name} - ${siteConfig.fullName} | Official Esports Guild`,
    description: siteConfig.tagline,
    siteName: siteConfig.fullName,
    images: [
      {
        url: siteConfig.assets.heroBg,
        width: 1200,
        height: 630,
        alt: `${siteConfig.name} Esports Arena`,
        type: "image/webp",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.name} - ${siteConfig.fullName}`,
    description: siteConfig.tagline,
    images: [siteConfig.assets.heroBg],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="min-h-screen bg-[#050506] text-white antialiased selection:bg-[#e11d2e] selection:text-white">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
