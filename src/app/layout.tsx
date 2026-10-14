import type { Metadata } from "next";
import "./globals.css";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  metadataBase: new URL("https://ugg-uemk.vercel.app"),
  title: `${siteConfig.name} - ${siteConfig.fullName} | Official Esports Guild`,
  description: siteConfig.description,
  icons: {
    icon: siteConfig.assets.logo,
    apple: siteConfig.assets.logo,
  },
  openGraph: {
    title: `${siteConfig.name} - ${siteConfig.fullName}`,
    description: siteConfig.tagline,
    images: [
      {
        url: siteConfig.assets.heroBg,
        width: 1200,
        height: 630,
        alt: "UGG Arena",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <body className="min-h-screen bg-[#060709] text-gray-100 antialiased selection:bg-[#ff1e38] selection:text-white font-sans">
        {children}
      </body>
    </html>
  );
}
