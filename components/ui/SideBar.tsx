"use client";
import { X, ChevronDown, ChevronUp, MapPin } from "lucide-react";
import { useEffect, useState } from "react";
import Link from "next/link";

type SidebarProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const [expandedSections, setExpandedSections] = useState<
    Record<string, boolean>
  >({
    support: false,
    explore: true,
  });

  // Disable scroll on open
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  return (
    <>
      {/* Backdrop/Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-80 bg-white shadow-xl z-50 transform transition-all duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <Link
            href="/"
            className="text-xl font-bold text-primary font-poppins hover:text-primary-dark transition-colors"
          >
            Cameron Highlands Tours
          </Link>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Close menu"
          >
            <X size={24} className="text-primary" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="h-[calc(100%-120px)] overflow-y-auto scrollbar-hide py-4">
          <div className="space-y-1 px-4">
            <div className="px-3 py-2 mb-2 rounded-xl bg-neutral-100 text-sm text-text-secondary flex items-center gap-2">
              <MapPin size={16} className="text-secondary" /> Cameron Highlands,
              MY
            </div>

            {/* Explore */}
            <div className="mb-2">
              <button
                onClick={() => toggleSection("explore")}
                className="flex items-center justify-between w-full px-3 py-3 rounded-lg hover:bg-neutral-100 transition-colors"
              >
                <span className="font-medium text-title_black">Explore</span>
                {expandedSections.explore ? (
                  <ChevronUp size={20} className="text-primary" />
                ) : (
                  <ChevronDown size={20} className="text-primary" />
                )}
              </button>
              <div
                className={`pl-4 space-y-1 overflow-hidden transition-all duration-300 ${
                  expandedSections.explore ? "max-h-48 mt-2" : "max-h-0"
                }`}
              >
                {[
                  { href: "/", label: "Home" },
                  { href: "/blogs", label: "Stories" },
                  { href: "/faqs", label: "FAQ" },
                ].map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={onClose}
                    className="block px-3 py-2 text-desc_gray rounded-lg hover:bg-neutral-100 hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Support Section */}
            <div className="mb-2">
              <button
                onClick={() => toggleSection("support")}
                className="flex items-center justify-between w-full px-3 py-3 rounded-lg hover:bg-neutral-100 transition-colors"
              >
                <span className="font-medium text-title_black">
                  Help & Support
                </span>
                {expandedSections.support ? (
                  <ChevronUp size={20} className="text-primary" />
                ) : (
                  <ChevronDown size={20} className="text-primary" />
                )}
              </button>
              <div
                className={`pl-4 space-y-1 overflow-hidden transition-all duration-300 ${
                  expandedSections.support ? "max-h-40 mt-2" : "max-h-0"
                }`}
              >
                <Link
                  href="/contact-us"
                  onClick={onClose}
                  className="block px-3 py-2 text-desc_gray rounded-lg hover:bg-neutral-100 hover:text-primary transition-colors"
                >
                  Contact Us
                </Link>
                <Link
                  href="/contact-us#feedback"
                  onClick={onClose}
                  className="block px-3 py-2 text-desc_gray rounded-lg hover:bg-neutral-100 hover:text-primary transition-colors"
                >
                  Feedback
                </Link>
                <Link
                  href="/faqs"
                  onClick={onClose}
                  className="block px-3 py-2 text-desc_gray rounded-lg hover:bg-neutral-100 hover:text-primary transition-colors"
                >
                  FAQ
                </Link>
              </div>
            </div>

            <Link
              href="/privacy-policy"
              onClick={onClose}
              className="block px-3 py-3 rounded-lg hover:bg-neutral-100 text-title_black font-medium transition-colors"
            >
              Terms & Conditions
            </Link>
          </div>
        </nav>

        {/* Footer */}
        <div className="absolute bottom-0 w-full px-6 py-4 border-t border-gray-100">
          <p className="text-xs text-desc_gray text-center">
            © 2025 Cameron Highlands Tours
          </p>
        </div>
      </aside>
    </>
  );
}
