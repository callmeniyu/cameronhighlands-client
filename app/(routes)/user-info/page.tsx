"use client";

import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import {
  FiUser,
  FiMail,
  FiPhone,
  FiMapPin,
  FiArrowRight,
  FiGlobe,
} from "react-icons/fi";
import { useBooking } from "@/context/BookingContext";
import { format } from "date-fns";
import { useToast } from "@/context/ToastContext";
import { useCurrency } from "@/context/CurrencyContext";

interface Country {
  name: string;
  cca2: string;
  callingCode: string;
}

export default function UserInfoPage() {
  const router = useRouter();
  const params = useSearchParams();
  const { booking } = useBooking();
  const { showToast } = useToast();
  const { convertToUSD, convertToEUR } = useCurrency();

  // Form State
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [countryCode, setCountryCode] = useState("");
  const [phone, setPhone] = useState("");
  const [pickupLocation, setPickupLocation] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"stripe" | "commercepay">(
    "stripe",
  );

  const [pickupOptions, setPickupOptions] = useState<string[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [loadingCountries, setLoadingCountries] = useState(true);

  // Fetch countries from API or use fallback
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        // Try to fetch from REST Countries API
        const response = await fetch(
          "https://restcountries.com/v3.1/all?fields=name,cca2,idd",
        );
        if (response.ok) {
          const data = await response.json();
          const formattedCountries: Country[] = data
            .map((country: any) => ({
              name: country.name.common,
              cca2: country.cca2,
              callingCode: country.idd?.root
                ? `${country.idd.root}${country.idd.suffixes?.[0] || ""}`
                : "",
            }))
            .filter((c: Country) => c.callingCode)
            .sort((a: Country, b: Country) => a.name.localeCompare(b.name));

          // Put Malaysia first
          const malaysia = formattedCountries.find((c) => c.cca2 === "MY");
          const others = formattedCountries.filter((c) => c.cca2 !== "MY");
          setCountries(malaysia ? [malaysia, ...others] : formattedCountries);
        } else {
          throw new Error("API failed");
        }
      } catch (error) {
        console.warn(
          "Failed to fetch countries from API, using fallback list:",
          error,
        );
        // Fallback to hardcoded list
        const allCountries: Country[] = [
          { name: "Malaysia", cca2: "MY", callingCode: "+60" },
          { name: "Afghanistan", cca2: "AF", callingCode: "+93" },
          { name: "Albania", cca2: "AL", callingCode: "+355" },
          { name: "Algeria", cca2: "DZ", callingCode: "+213" },
          { name: "Argentina", cca2: "AR", callingCode: "+54" },
          { name: "Australia", cca2: "AU", callingCode: "+61" },
          { name: "Austria", cca2: "AT", callingCode: "+43" },
          { name: "Bahrain", cca2: "BH", callingCode: "+973" },
          { name: "Bangladesh", cca2: "BD", callingCode: "+880" },
          { name: "Belgium", cca2: "BE", callingCode: "+32" },
          { name: "Brazil", cca2: "BR", callingCode: "+55" },
          { name: "Brunei", cca2: "BN", callingCode: "+673" },
          { name: "Cambodia", cca2: "KH", callingCode: "+855" },
          { name: "Canada", cca2: "CA", callingCode: "+1" },
          { name: "Chile", cca2: "CL", callingCode: "+56" },
          { name: "China", cca2: "CN", callingCode: "+86" },
          { name: "Colombia", cca2: "CO", callingCode: "+57" },
          { name: "Czech Republic", cca2: "CZ", callingCode: "+420" },
          { name: "Denmark", cca2: "DK", callingCode: "+45" },
          { name: "Egypt", cca2: "EG", callingCode: "+20" },
          { name: "Finland", cca2: "FI", callingCode: "+358" },
          { name: "France", cca2: "FR", callingCode: "+33" },
          { name: "Germany", cca2: "DE", callingCode: "+49" },
          { name: "Greece", cca2: "GR", callingCode: "+30" },
          { name: "Hong Kong", cca2: "HK", callingCode: "+852" },
          { name: "Hungary", cca2: "HU", callingCode: "+36" },
          { name: "Iceland", cca2: "IS", callingCode: "+354" },
          { name: "India", cca2: "IN", callingCode: "+91" },
          { name: "Indonesia", cca2: "ID", callingCode: "+62" },
          { name: "Iran", cca2: "IR", callingCode: "+98" },
          { name: "Iraq", cca2: "IQ", callingCode: "+964" },
          { name: "Ireland", cca2: "IE", callingCode: "+353" },
          { name: "Israel", cca2: "IL", callingCode: "+972" },
          { name: "Italy", cca2: "IT", callingCode: "+39" },
          { name: "Japan", cca2: "JP", callingCode: "+81" },
          { name: "Jordan", cca2: "JO", callingCode: "+962" },
          { name: "Kazakhstan", cca2: "KZ", callingCode: "+7" },
          { name: "Kenya", cca2: "KE", callingCode: "+254" },
          { name: "Kuwait", cca2: "KW", callingCode: "+965" },
          { name: "Laos", cca2: "LA", callingCode: "+856" },
          { name: "Lebanon", cca2: "LB", callingCode: "+961" },
          { name: "Libya", cca2: "LY", callingCode: "+218" },
          { name: "Luxembourg", cca2: "LU", callingCode: "+352" },
          { name: "Macao", cca2: "MO", callingCode: "+853" },
          { name: "Mexico", cca2: "MX", callingCode: "+52" },
          { name: "Morocco", cca2: "MA", callingCode: "+212" },
          { name: "Myanmar", cca2: "MM", callingCode: "+95" },
          { name: "Nepal", cca2: "NP", callingCode: "+977" },
          { name: "Netherlands", cca2: "NL", callingCode: "+31" },
          { name: "New Zealand", cca2: "NZ", callingCode: "+64" },
          { name: "Nigeria", cca2: "NG", callingCode: "+234" },
          { name: "Norway", cca2: "NO", callingCode: "+47" },
          { name: "Oman", cca2: "OM", callingCode: "+968" },
          { name: "Pakistan", cca2: "PK", callingCode: "+92" },
          { name: "Peru", cca2: "PE", callingCode: "+51" },
          { name: "Philippines", cca2: "PH", callingCode: "+63" },
          { name: "Poland", cca2: "PL", callingCode: "+48" },
          { name: "Portugal", cca2: "PT", callingCode: "+351" },
          { name: "Qatar", cca2: "QA", callingCode: "+974" },
          { name: "Romania", cca2: "RO", callingCode: "+40" },
          { name: "Russia", cca2: "RU", callingCode: "+7" },
          { name: "Saudi Arabia", cca2: "SA", callingCode: "+966" },
          { name: "Singapore", cca2: "SG", callingCode: "+65" },
          { name: "South Africa", cca2: "ZA", callingCode: "+27" },
          { name: "South Korea", cca2: "KR", callingCode: "+82" },
          { name: "Spain", cca2: "ES", callingCode: "+34" },
          { name: "Sri Lanka", cca2: "LK", callingCode: "+94" },
          { name: "Sweden", cca2: "SE", callingCode: "+46" },
          { name: "Switzerland", cca2: "CH", callingCode: "+41" },
          { name: "Taiwan", cca2: "TW", callingCode: "+886" },
          { name: "Tanzania", cca2: "TZ", callingCode: "+255" },
          { name: "Thailand", cca2: "TH", callingCode: "+66" },
          { name: "Turkey", cca2: "TR", callingCode: "+90" },
          { name: "Ukraine", cca2: "UA", callingCode: "+380" },
          { name: "United Arab Emirates", cca2: "AE", callingCode: "+971" },
          { name: "United Kingdom", cca2: "GB", callingCode: "+44" },
          { name: "United States", cca2: "US", callingCode: "+1" },
          { name: "Vietnam", cca2: "VN", callingCode: "+84" },
          { name: "Yemen", cca2: "YE", callingCode: "+967" },
        ];
        setCountries(allCountries);
      } finally {
        setLoadingCountries(false);
      }
    };

    fetchCountries();
  }, []);

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

  const handleNext = useCallback(() => {
    // Validation
    if (!fullName || !email || !countryCode || !phone) {
      showToast({
        type: "error",
        title: "Missing Information",
        message: "Please fill in all required fields including country code.",
      });
      return;
    }

    // Name validation - minimum 5 characters
    if (fullName.trim().length < 5) {
      showToast({
        type: "error",
        title: "Invalid Name",
        message: "Name must be at least 5 characters long.",
      });
      return;
    }

    // Email validation - proper format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      showToast({
        type: "error",
        title: "Invalid Email",
        message: "Please enter a valid email address.",
      });
      return;
    }

    // Phone validation - minimum 5 digits (excluding country code)
    const phoneDigits = phone.replace(/\D/g, ""); // Remove non-digits
    if (phoneDigits.length < 5) {
      showToast({
        type: "error",
        title: "Invalid Phone Number",
        message: "Phone number must contain at least 5 digits.",
      });
      return;
    }

    // Pickup location validation - minimum 10 characters
    if (!pickupLocation || pickupLocation.trim().length < 10) {
      showToast({
        type: "error",
        title: "Invalid Pickup Location",
        message: "Pickup location must be at least 10 characters long.",
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
        phone: `${countryCode} ${phone}`,
      },
      pickupLocation: pickupLocation,
      // Ensure date/time/package info is preserved from context
    };

    const encodedBookingData = encodeURIComponent(JSON.stringify(bookingData));

    // Route to selected payment gateway
    if (paymentMethod === "commercepay") {
      router.push(
        `/payment-commercepay?booking=${encodedBookingData}&amount=${finalPrice}`,
      );
    } else {
      // Default to Stripe
      router.push(
        `/payment?bookingData=${encodedBookingData}&amount=${finalPrice}`,
      );
    }
  }, [
    fullName,
    email,
    countryCode,
    phone,
    pickupLocation,
    pickupOptions,
    booking,
    priceNum,
    finalPrice,
    paymentMethod,
    router,
    showToast,
  ]);

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

              <label className="flex flex-col gap-2 text-sm font-medium text-text-primary md:col-span-2">
                Phone number
                <div className="grid grid-cols-[140px_1fr] gap-2">
                  <div className="flex items-center gap-2 px-3 py-3 rounded-xl border border-neutral-200 bg-white">
                    <FiGlobe className="text-secondary flex-shrink-0" />
                    <select
                      value={countryCode}
                      onChange={(e) => setCountryCode(e.target.value)}
                      className="w-full bg-transparent outline-none focus:ring-0 focus:outline-none focus:shadow-none text-text-primary text-sm"
                      disabled={loadingCountries}
                    >
                      <option value="">
                        {loadingCountries ? "Loading..." : "Country"}
                      </option>
                      {countries.map((country) => (
                        <option key={country.cca2} value={country.callingCode}>
                          {country.name} {country.callingCode}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl border border-neutral-200 ${
                      !countryCode
                        ? "bg-neutral-100 cursor-not-allowed"
                        : "bg-white"
                    }`}
                  >
                    <FiPhone className="text-secondary" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder={
                        countryCode ? "12-345 6789" : "Select country first"
                      }
                      disabled={!countryCode}
                      className={`w-full bg-transparent outline-none focus:ring-0 focus:outline-none focus:shadow-none text-text-primary ${
                        !countryCode
                          ? "cursor-not-allowed text-neutral-400"
                          : ""
                      }`}
                    />
                  </div>
                </div>
                {!countryCode && (
                  <p className="text-xs text-amber-600 mt-1">
                    Please select a country before entering your phone number
                  </p>
                )}
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

            {/* Payment Method Selection */}
            <div className="mt-6 pt-6 border-t border-neutral-200 space-y-3">
              <label className="block text-sm font-semibold text-gray-900">
                Payment Method
              </label>

              <div className="grid grid-cols-2 gap-3">
                <label
                  className={`relative flex items-center p-3 border-2 rounded-lg cursor-pointer transition-all border-blue-600 bg-blue-50`}
                >
                  <input
                    type="radio"
                    name="payment-method"
                    value="stripe"
                    checked
                    readOnly
                    className="mr-2 cursor-pointer"
                  />
                  <span className="text-sm font-medium">Stripe</span>
                </label>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 justify-between pt-4">
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
