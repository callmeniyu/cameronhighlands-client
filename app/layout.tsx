import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";
import { BookingProvider } from "@/context/BookingContext";
import { ToastProvider } from "@/context/ToastContext";
import { CartProvider } from "@/context/CartContext";
import AuthSessionProvider from "@/components/providers/SessionProvider";
import {
  SITE_CONFIG,
  generateOpenGraph,
  generateTwitterCard,
} from "@/lib/seoUtils";

// Use classic CDN import for Poppins to avoid turbopack/internal font handlers

export const metadata: Metadata = {
  title: {
    default: "Cameron Highlands Tours - Discover Amazing Tours & Experiences",
    template: "%s - Cameron Highlands Tours",
  },
  description:
    "Discover the best Cameron Highlands tours and experiences. Book your perfect adventure with Cameron Highlands Tours - your gateway to unforgettable memories.",
  keywords: [
    "Cameron Highlands tours",
    "Cameron Highlands activities",
    "Cameron Highlands experiences",
    "tour booking Cameron Highlands",
    "Cameron Highlands packages",
    "Cameron Highlands adventures",
  ].join(", "),
  authors: [{ name: "Cameron Highlands Tours" }],
  creator: "Cameron Highlands Tours",
  publisher: "Cameron Highlands Tours",
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
              name: "Cameron Highlands Tours",
              description:
                "Discover the best Cameron Highlands tours and experiences with our curated tour packages",
              url: "https://cameronhighlandstours.com",
              logo: "https://cameronhighlandstours.com/images/logo.png",
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
            <CartProvider>
              <Navbar />
              <main>
                <BookingProvider>{children}</BookingProvider>
              </main>
              <Footer />
            </CartProvider>
          </ToastProvider>
        </AuthSessionProvider>
      </body>
    </html>
  );
}
