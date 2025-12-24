import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import DynamicHead from "@/components/layout/DynamicHead";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://webinarpro.com'

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "WebinarPro - Transform Your Career with Expert Webinars",
    template: "%s | WebinarPro"
  },
  description: "Learn from industry experts through live, interactive webinars. Master digital marketing, AI, finance, and more. Join 10,000+ students who transformed their careers.",
  keywords: ["webinar", "online learning", "digital marketing", "AI training", "professional development", "career growth", "live webinars", "expert training"],
  authors: [{ name: "WebinarPro" }],
  creator: "WebinarPro",
  publisher: "WebinarPro",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: baseUrl,
    siteName: "WebinarPro",
    title: "WebinarPro - Transform Your Career with Expert Webinars",
    description: "Learn from industry experts through live, interactive webinars. Master digital marketing, AI, finance, and more.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "WebinarPro - Expert Webinars",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "WebinarPro - Transform Your Career",
    description: "Learn from industry experts through live, interactive webinars.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    // google: 'your-google-verification-code',
    // yandex: 'your-yandex-verification-code',
  },
  alternates: {
    canonical: baseUrl,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#667eea' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0f' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className={`${inter.variable} antialiased`}>
        <AuthProvider>
          <DynamicHead />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
