import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";
import { BookingProvider } from "@/context/BookingContext";
import { ToastProvider } from "@/context/ToastContext";
import { CurrencyProvider } from "@/context/CurrencyContext";
import AuthSessionProvider from "@/components/providers/SessionProvider";
import {
  SITE_CONFIG,
  generateOpenGraph,
  generateTwitterCard,
} from "@/lib/seoUtils";

// Use classic CDN import for Poppins to avoid turbopack/internal font handlers

export const metadata: Metadata = {
  title: {
    default: "Mossy Forest Tours - Discover Amazing Tours & Experiences",
    template: "%s - Mossy Forest Tours",
  },
  description:
    "Discover the magical Mossy Forest and explore Cameron Highlands with guided tours. Book Mossy Forest tours, tea plantation visits, sunrise tours, and Cameron Highlands experiences with Mossy Forest Tours.",
  keywords: [
    "Mossy Forest tours",
    "Cameron Highlands tours",
    "Mossy Forest tour Cameron Highlands",
    "Cameron Highlands Mossy Forest tour",
    "Half day Mossy Forest tour",
    "Full day Cameron Highlands tours",
    "Guided Mossy Forest tour",
    "Best Mossy Forest tours",
    "Affordable Cameron Highlands tours",
    "Private Cameron Highlands tours",
    "Small group Mossy Forest tour",
    "Cameron Highlands tour package",
    "Book Mossy Forest tour",
    "Mossy Forest boardwalk tour",
    "Mossy Forest nature tour",
    "Cameron Highlands nature tour",
    "Tea plantation and Mossy Forest tour",
    "Cameron Highlands eco tour",
    "Mossy Forest tour Brinchang",
    "Mossy Forest tour Tanah Rata",
  ].join(", "),
  authors: [{ name: "Mossy Forest Tours" }],
  creator: "Mossy Forest Tours",
  publisher: "Mossy Forest Tours",
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
  verification: {
    google: "your-google-verification-code",
  },
  category: "travel",
  icons: {
    icon: "/favicons/favicon.ico",
    shortcut: "/favicons/favicon.ico",
    apple: "/favicons/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin=""
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        {/* Google tag (gtag.js) */}
        <script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-WVE732NMTC"
        ></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-WVE732NMTC');
            `,
          }}
        />
        {/* Organization Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "TravelAgency",
              name: "Mossy Forest Tours",
              description:
                "Discover the best Cameron Highlands tours and experiences with our curated tour packages",
              url: "https://mossyforest.my",
              logo: "https://mossyforest.my/images/logo.png",
              address: {
                "@type": "PostalAddress",
                addressRegion: "Cameron Highlands",
                addressCountry: "MY",
              },
              contactPoint: {
                "@type": "ContactPoint",
                telephone: "+60123456789",
                contactType: "customer service",
                availableLanguage: "English",
              },
            }),
          }}
        />
      </head>
      <body className={`font-poppins`}>
        <AuthSessionProvider>
          <ToastProvider>
            <CurrencyProvider>
              <Navbar />
              <main>
                <BookingProvider>{children}</BookingProvider>
              </main>
              <Footer />
            </CurrencyProvider>
          </ToastProvider>
        </AuthSessionProvider>
      </body>
    </html>
  );
}
