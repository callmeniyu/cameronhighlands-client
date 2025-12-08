import { FaFacebookF } from "react-icons/fa";
import { FaYoutube } from "react-icons/fa";
import { FaInstagram } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { FaTiktok } from "react-icons/fa";
import { FaTelegramPlane } from "react-icons/fa";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-white border-t border-neutral-200 px-4 pt-10 pb-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10">
        <div className="space-y-3">
          <div className="text-2xl font-bold text-primary leading-tight">
            Cameron Highlands
            <div className="text-lg font-medium text-text-secondary">Tours</div>
          </div>
          <p className="text-sm text-text-secondary leading-relaxed">
            Calm, well-paced itineraries crafted for modern travelers.
          </p>
        </div>

        <div>
          <h4 className="font-semibold text-text-primary mb-3">Explore</h4>
          <ul className="space-y-2 text-sm text-text-secondary">
            <li>
              <a href="/tours">Tours</a>
            </li>
            <li>
              <a href="/blogs">Blogs</a>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-text-primary mb-3">Support</h4>
          <ul className="space-y-2 text-sm text-text-secondary">
            <li>
              <a href="/contact-us">Contact Us</a>
            </li>
            <li>
              <a href="/faqs">FAQs</a>
            </li>
            <li>
              <a href="/privacy-policy">Terms & Conditions</a>
            </li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4 text-xs text-text-secondary">
        <div>© 2025 Cameron Highlands Tours. All rights reserved.</div>
        <div className="flex items-center gap-3 text-sm">
          <a
            href="mailto:hello@cameronhighlandstours.com"
            className="hover:text-primary transition-colors"
          >
            hello@cameronhighlandstours.com
          </a>
          <span className="hidden md:inline text-neutral-300">|</span>
          <a
            href="tel:+60123456789"
            className="hover:text-primary transition-colors"
          >
            +60 12-345 6789
          </a>
        </div>
      </div>
    </footer>
  );
}
