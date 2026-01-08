import { Metadata } from "next";
import { generatePageMetadata } from "@/lib/seoUtils";

export const metadata: Metadata = generatePageMetadata(
  "Contact Us",
  "Get in touch with Mossy Forest Tours for Cameron Highlands tours and transfers. WhatsApp, Instagram, or email us for Mossy Forest tours, tea plantation visits, and more.",
  "/contact-us",
  [
    "contact Mossy Forest Tours",
    "mossy forest",
    "Cameron Highlands tour booking",
    "WhatsApp booking",
    "tour inquiry Cameron Highlands",
  ]
);

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
