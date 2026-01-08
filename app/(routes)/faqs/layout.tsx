import { Metadata } from "next";
import { generatePageMetadata } from "@/lib/seoUtils";

export const metadata: Metadata = generatePageMetadata(
  "Frequently Asked Questions",
  "Find answers to common questions about Mossy Forest Tours. Learn about booking Cameron Highlands tours, Mossy Forest tour policies, pricing, and what to expect on your adventure.",
  "/faqs",
  [
    "mossy forest entry fees",
    "Mossy Forest tour info",
    "Cameron Highlands tour",
    "mossy forest tour FAQ",
    "Cameron Highlands tour questions",
    "transfer booking FAQ",
  ]
);

export default function FAQsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
