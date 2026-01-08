"use client";

import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  FiUser,
  FiMail,
  FiPhone,
  FiMapPin,
  FiArrowRight,
} from "react-icons/fi";
import { useBooking } from "@/context/BookingContext";
import { format } from "date-fns";
import { useToast } from "@/context/ToastContext";
import { useCurrency } from "@/context/CurrencyContext";

export default function UserInfoPage() {
  const router = useRouter();
  const params = useSearchParams();
  const { booking } = useBooking();
  const { showToast } = useToast();
  const { convertToUSD, convertToEUR } = useCurrency();

  // Form State
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [pickupLocation, setPickupLocation] = useState("");

  const [pickupOptions, setPickupOptions] = useState<string[]>([]);

  useEffect(() => {
    if (!booking) {
      // If no booking data, redirect back to tours or home
      // router.push("/tours");
      // Commented out to prevent infinite redirect loop during development if context is lost
      // In production, you might want to redirect
    }

    if (booking?.pickupLocations) {
      const locations = booking.pickupLocations
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      setPickupOptions(locations);
      // Don't set default pickup location - let user enter it
    }
  }, [booking, router]);

  if (!booking) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-text-secondary mb-4">No booking details found.</p>
          <Link
            href="/tours"
            className="px-6 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary-dark transition-colors"
          >
            Browse Tours
          </Link>
        </div>
      </div>
    );
  }

  const priceNum = booking.totalPrice ? booking.totalPrice : 0;
  const finalPrice = priceNum;

  const handleNext = () => {
    // Validation
    if (!fullName || !email || !phone) {
      showToast({
        type: "error",
        title: "Missing Information",
        message: "Please fill in all required fields.",
      });
      return;
    }

    if (!pickupLocation && pickupOptions.length > 0) {
      showToast({
        type: "error",
        title: "Missing Pickup Location",
        message: "Please select a pickup location.",
      });
      return;
    }

    // Construct Booking Data
    // We need to match what PaymentController expects
    const bookingData = {
      ...booking,
      subtotal: priceNum, // The base price before discount
      total: finalPrice, // Ensure final price is set as total
      contactInfo: {
        name: fullName,
        email: email,
        phone: phone,
      },
      pickupLocation: pickupLocation,
      // Ensure date/time/package info is preserved from context
    };

    const encodedBookingData = encodeURIComponent(JSON.stringify(bookingData));

    // Pass final amount (after discount)
    router.push(
      `/payment?bookingData=${encodedBookingData}&amount=${finalPrice}`
    );
  };

  // Format Date for Display
  const displayDate = booking.date
    ? format(new Date(booking.date), "d MMM yyyy")
    : "";

  return (
    <div className="min-h-screen bg-neutral-50 pt-24 pb-16 px-4">
      <style jsx>{`
        input:focus,
        select:focus {
          outline: none !important;
          box-shadow: none !important;
          border-color: #e5e7eb !important;
          -webkit-box-shadow: none !important;
          -moz-box-shadow: none !important;
        }
        input:focus-visible,
        select:focus-visible {
          outline: none !important;
          box-shadow: none !important;
          border-color: #e5e7eb !important;
          -webkit-box-shadow: none !important;
          -moz-box-shadow: none !important;
        }
        @keyframes confetti {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(360deg);
            opacity: 0;
          }
        }
        .animate-confetti {
          animation: confetti 3s ease-out forwards;
        }
      `}</style>
      <div className="max-w-5xl mx-auto grid lg:grid-cols-[1.1fr_0.9fr] gap-8">
        <div className="space-y-4 order-2 lg:order-1">
          <div className="flex items-center gap-2 text-sm text-text-secondary">
            <Link href="/tours" className="hover:text-primary">
              Home
            </Link>
            <span>/</span>
            <span className="text-text-primary font-medium">Guest details</span>
          </div>
          <div className="bg-white border border-neutral-200 shadow-soft rounded-2xl p-6 space-y-6">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-text-light mb-2">
                Step 2
              </p>
              <h1 className="text-2xl font-semibold">Guest information</h1>
              <p className="text-sm text-text-secondary mt-1">
                We only collect what we need for pickups and confirmations.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <label className="flex flex-col gap-2 text-sm font-medium text-text-primary">
                Full name
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-neutral-200 bg-white">
                  <FiUser className="text-secondary" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Alex Tan"
                    className="w-full bg-transparent outline-none focus:ring-0 focus:outline-none focus:shadow-none text-text-primary"
                  />
                </div>
              </label>

              <label className="flex flex-col gap-2 text-sm font-medium text-text-primary">
                Email
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-neutral-200 bg-white">
                  <FiMail className="text-secondary" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full bg-transparent focus:border-none outline-none focus:ring-0 focus:outline-none focus:shadow-none text-text-primary"
                  />
                </div>
              </label>

              <label className="flex flex-col gap-2 text-sm font-medium text-text-primary">
                Phone number
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-neutral-200 bg-white">
                  <FiPhone className="text-secondary" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+60 12-345 6789"
                    className="w-full bg-transparent outline-none focus:ring-0 focus:outline-none focus:shadow-none text-text-primary"
                  />
                </div>
              </label>

              <label className="flex flex-col gap-2 text-sm font-medium text-text-primary">
                Pickup location
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-neutral-200 bg-white ">
                  <FiMapPin className="text-secondary" />
                  <input
                    type="text"
                    value={pickupLocation}
                    onChange={(e) => setPickupLocation(e.target.value)}
                    placeholder="Enter your hotel name or pickup location"
                    className="w-full bg-transparent outline-none focus:ring-0 focus:outline-none focus:shadow-none text-text-primary"
                  />
                </div>
                {pickupOptions.length > 0 && (
                  <div className="text-xs text-gray-600 mt-1">
                    <span className="font-medium">Available locations:</span>{" "}
                    {pickupOptions.join(", ")}
                  </div>
                )}
              </label>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 justify-between pt-2">
              <button
                onClick={handleNext}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-white font-semibold hover:bg-primary-dark transition-colors"
                disabled={!booking}
              >
                Continue to payment <FiArrowRight />
              </button>
            </div>
          </div>

          {/* Why we ask these section - Mobile only */}
          <div className="bg-white border border-neutral-200 shadow-soft rounded-2xl p-5 space-y-3 text-sm text-text-secondary block lg:hidden">
            <p className="text-text-primary font-semibold">Why we ask these</p>
            <ul className="space-y-2 list-disc list-inside">
              <li>Pickup coordination and emergency contact</li>
              <li>Instant confirmation to your email</li>
              <li>Guide identifies you</li>
            </ul>
          </div>
        </div>

        <aside className="space-y-4 order-1 lg:order-2">
          <div className="bg-white border border-neutral-200 shadow-soft rounded-2xl p-6 space-y-4">
            <p className="text-xs uppercase tracking-[0.2em] text-text-light">
              Summary
            </p>
            <h3 className="text-lg font-semibold">{booking.title}</h3>
            <div className="space-y-2 text-sm text-text-secondary">
              <div className="flex justify-between">
                <span>Date</span>
                <span>{displayDate}</span>
              </div>
              <div className="flex justify-between">
                <span>Time</span>
                <span>{booking.time}</span>
              </div>
              <div className="flex justify-between">
                <span>Guests</span>
                <span>
                  {booking.adults > 0 ? `${booking.adults} Adults` : ""}
                  {booking.children > 0 ? `, ${booking.children} Children` : ""}
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-neutral-200">
              <div className="flex justify-between items-center">
                <span className="text-text-secondary text-sm">Total</span>
                <div className="text-right">
                  <div className="text-xl font-bold text-primary">
                    RM {finalPrice.toFixed(2)}
                  </div>
                  <div className="text-xs text-text-secondary">
                    ${convertToUSD(finalPrice)} / €{convertToEUR(finalPrice)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white border border-neutral-200 shadow-soft rounded-2xl p-5 space-y-3 text-sm text-text-secondary hidden lg:block">
            <p className="text-text-primary font-semibold">Why we ask these</p>
            <ul className="space-y-2 list-disc list-inside">
              <li>Pickup coordination and emergency contact</li>
              <li>Instant confirmation to your email</li>
              <li>Guide identifies you</li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
