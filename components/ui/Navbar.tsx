"use client";
import { useState, useEffect, useRef } from "react";
import { Menu, User, MapPin, ShoppingCart } from "lucide-react";
import Sidebar from "./SideBar";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import UseSession from "@/hooks/SessionHook";
import { signOut } from "next-auth/react";
import { useToast } from "@/context/ToastContext";
import { Avatar, AvatarImage, AvatarFallback } from "@radix-ui/react-avatar";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [imageError, setImageError] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { user, isLoading, isAuthenticated } = UseSession();
  const { showToast } = useToast();

  // Generate initials for text avatar
  const getInitials = (name: string) => {
    if (!name) return "U";
    const parts = name.trim().split(" ");
    if (parts.length === 1) {
      return parts[0].charAt(0).toUpperCase();
    }
    return (
      parts[0].charAt(0) + parts[parts.length - 1].charAt(0)
    ).toUpperCase();
  };

  // Close dropdown when pathname changes
  useEffect(() => {
    setShowProfile(false);
  }, [pathname]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowProfile(false);
      }
    };

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setShowProfile(false);
      }
    };

    if (showProfile) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscapeKey);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
        document.removeEventListener("keydown", handleEscapeKey);
      };
    }
  }, [showProfile]);

  // Handle scroll detection for subtle shadow
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsScrolled(scrollTop > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSignOut = () => {
    signOut({
      callbackUrl: "/auth",
    });
    showToast({
      type: "success",
      title: "Signed Out",
      message: "You have successfully signed out.",
    });
    setShowProfile(false);
    setIsOpen(false);
  };

  const closeDropdown = () => {
    setShowProfile(false);
  };

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/tours", label: "Tours" },
    { href: "/blogs", label: "Stories" },
    { href: "/faqs", label: "FAQ" },
  ];

  return (
    <>
      <nav
        className={`flex items-center justify-between px-3 sm:px-6 py-3 transition-all duration-300 fixed top-0 left-0 right-0 z-40 bg-white border-b border-neutral-200 mb-10 ${
          isScrolled ? "shadow-md" : "shadow-sm"
        }`}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsOpen(true)}
            aria-label="Open menu"
            className="rounded-full p-2 hover:bg-neutral-100 transition-colors"
          >
            <Menu size={24} className="text-primary" />
          </button>
          <Link
            href="/"
            className="text-lg sm:text-xl font-bold font-poppins text-primary tracking-tight"
          >
            Cameron Highlands Tours
          </Link>
        </div>

        <div className="hidden md:flex items-center gap-2">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`px-3 py-2 rounded-full text-sm font-medium transition-colors hover:bg-neutral-100 ${
                pathname === link.href
                  ? "text-primary bg-neutral-100"
                  : "text-text-secondary"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2" ref={dropdownRef}>
          <div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-full bg-neutral-100 text-xs text-text-secondary">
            <MapPin size={14} className="text-secondary" />
            Cameron Highlands
          </div>

          {isAuthenticated && (
            <Link
              href="/cart"
              className="p-2 rounded-full transition-all duration-300 text-primary hover:bg-neutral-100"
              title="View Cart"
            >
              <ShoppingCart size={20} />
            </Link>
          )}

          <button
            className="flex items-center gap-2 rounded-full sm:pr-3 xs:pr-0 transition-all duration-300 bg-primary text-white hover:bg-primary-dark"
            onClick={() => {
              if (isAuthenticated) {
                setShowProfile((prev) => !prev);
              } else {
                router.push("/auth");
              }
            }}
            aria-expanded={showProfile}
            aria-haspopup="true"
          >
            <div className="rounded-full p-2 border-r-[1.5px] border-white">
              <User size={20} />
            </div>
            <span className="text-sm font-medium font-poppins xs:hidden sm:flex">
              {isAuthenticated ? user?.name?.slice(0, 12) : "Sign In"}
            </span>
          </button>

          {/* Dropdown */}
          <div
            className={`absolute right-0 mt-2 w-48 bg-white border rounded-md shadow-lg transform transition-all duration-200 origin-top z-50 ${
              showProfile
                ? "scale-y-100 opacity-100"
                : "scale-y-0 opacity-0 pointer-events-none"
            }`}
          >
            <div className="px-4 py-2 border-b flex flex-col items-center gap-1">
              <div className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center bg-gray-200">
                {user?.image && !imageError ? (
                  <Image
                    src={user.image}
                    alt={user?.name ?? "User"}
                    width={40}
                    height={40}
                    className="w-10 h-10 object-cover"
                    onError={() => setImageError(true)}
                    unoptimized={user.image.includes("googleusercontent.com")}
                  />
                ) : (
                  <div className="w-10 h-10 flex items-center justify-center bg-gradient-to-br from-primary to-primary-dark text-white font-bold text-sm">
                    {getInitials(user?.name || "")}
                  </div>
                )}
              </div>
              <h6 className="text-sm font-medium">{user?.name || "Guest"}</h6>
            </div>
            <ul className="py-2 text-sm font-medium text-gray-700">
              <li>
                <Link
                  href="/profile"
                  onClick={closeDropdown}
                  className="block px-4 py-2 hover:bg-gray-100"
                >
                  Profile
                </Link>
              </li>
              <li>
                <Link
                  href="/profile#mybookings"
                  onClick={closeDropdown}
                  className="block px-4 py-2 hover:bg-gray-100"
                >
                  Bookings
                </Link>
              </li>
              <li>
                <Link
                  href="/cart"
                  onClick={closeDropdown}
                  className="block px-4 py-2 hover:bg-gray-100"
                >
                  Cart
                </Link>
              </li>
              <li>
                <button
                  className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                  onClick={handleSignOut}
                >
                  Sign Out
                </button>
              </li>
            </ul>
          </div>
        </div>
      </nav>
      <Sidebar isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
