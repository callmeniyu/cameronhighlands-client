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
  FiArrowLeft,
  FiTag,
} from "react-icons/fi";

const SUMMARY = {
  title: "Mossy Forest Adventure",
  date: "12 Jan 2025",
  time: "7:00 AM",
  guests: "2 adults, 1 child",
  price: "RM 235",
};

export default function UserInfoPage() {
  const router = useRouter();
  const params = useSearchParams();
  const tour = params.get("tour") || "mossy-forest-adventure";
  const [couponApplied, setCouponApplied] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const priceNum = parseInt(SUMMARY.price.replace("RM ", ""));
  const availableCoupon = priceNum >= 200 ? 10 : priceNum >= 100 ? 5 : 0;
  const discount = couponApplied ? (priceNum * availableCoupon) / 100 : 0;
  const finalPrice = priceNum - discount;

  const handleApplyCoupon = () => {
    setCouponApplied(true);
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 3000);
  };

  const handleNext = () => {
    // Generate demo booking ID and navigate directly to confirmation
    const demoId = `demo-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    router.push(`/booking/confirmation/${demoId}`);
  };

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
        <div className="space-y-4">
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
                    placeholder="+60 12-345 6789"
                    className="w-full bg-transparent outline-none focus:ring-0 focus:outline-none focus:shadow-none text-text-primary"
                  />
                </div>
              </label>

              <label className="flex flex-col gap-2 text-sm font-medium text-text-primary">
                Pickup location
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-neutral-200 bg-white ">
                  <FiMapPin className="text-secondary" />
                  <select className="w-full bg-transparent outline-none focus:ring-0 focus:outline-none focus:shadow-none text-text-primary">
                    <option>Tanah Rata Town Center</option>
                    <option>Brinchang Bus Terminal</option>
                    <option>Golden Hills Hotel</option>
                    <option>Century Pines Resort</option>
                  </select>
                </div>
              </label>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 justify-between pt-2">
              <button
                onClick={handleNext}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-white font-semibold hover:bg-primary-dark transition-colors"
              >
                Continue to payment <FiArrowRight />
              </button>
            </div>
          </div>
        </div>

        <aside className="space-y-4">
          <div className="bg-white border border-neutral-200 shadow-soft rounded-2xl p-6 space-y-4">
            <p className="text-xs uppercase tracking-[0.2em] text-text-light">
              Summary
            </p>
            <h3 className="text-lg font-semibold">{SUMMARY.title}</h3>
            <div className="space-y-2 text-sm text-text-secondary">
              <div className="flex justify-between">
                <span>Date</span>
                <span>{SUMMARY.date}</span>
              </div>
              <div className="flex justify-between">
                <span>Time</span>
                <span>{SUMMARY.time}</span>
              </div>
              <div className="flex justify-between">
                <span>Guests</span>
                <span>{SUMMARY.guests}</span>
              </div>
            </div>

            {/* Confetti Effect */}
            {showConfetti && (
              <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
                {[...Array(50)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute animate-confetti"
                    style={{
                      left: `${Math.random() * 100}%`,
                      top: `${Math.random() * 100}%`,
                      animationDelay: `${Math.random() * 0.5}s`,
                      fontSize: `${Math.random() * 20 + 10}px`,
                    }}
                  >
                    {
                      ["🎉", "🎊", "✨", "💫", "⭐"][
                        Math.floor(Math.random() * 5)
                      ]
                    }
                  </div>
                ))}
              </div>
            )}

            {/* Coupon System */}
            {availableCoupon > 0 ? (
              couponApplied ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 relative overflow-hidden">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-green-600 font-semibold text-base">
                      🎉 {availableCoupon}% Coupon Applied!
                    </span>
                  </div>
                  <div className="text-sm text-green-700">
                    You saved RM {discount.toFixed(0)}!
                  </div>
                </div>
              ) : (
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-lg p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <FiTag className="text-purple-600" />
                        <span className="text-purple-800 font-bold text-base">
                          {availableCoupon}% OFF Coupon Available!
                        </span>
                      </div>
                      <p className="text-sm text-purple-700">
                        Save RM{" "}
                        {((priceNum * availableCoupon) / 100).toFixed(0)} on
                        your purchase
                      </p>
                    </div>
                    <button
                      onClick={handleApplyCoupon}
                      className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-full hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-105 shadow-lg"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              )
            ) : (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <FiTag className="text-blue-600" />
                  <span className="text-blue-800 font-semibold text-sm">
                    💡 Coupon Info
                  </span>
                </div>
                <div className="text-xs text-blue-700 space-y-1">
                  <div>• Spend RM 100+: Get 5% discount</div>
                  <div>• Spend RM 200+: Get 10% discount</div>
                </div>
              </div>
            )}

            <div className="pt-3 border-t border-neutral-200">
              {couponApplied && discount > 0 && (
                <div className="flex justify-between items-center mb-2 text-sm">
                  <span className="text-text-secondary">Subtotal</span>
                  <span className="text-text-secondary line-through">
                    {SUMMARY.price}
                  </span>
                </div>
              )}
              {couponApplied && discount > 0 && (
                <div className="flex justify-between items-center mb-2 text-sm">
                  <span className="text-green-600">
                    Discount ({availableCoupon}%)
                  </span>
                  <span className="text-green-600 font-semibold">
                    -RM {discount.toFixed(0)}
                  </span>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span className="text-text-secondary text-sm">Total</span>
                <div className="text-right">
                  <div className="text-xl font-bold text-primary">
                    RM {finalPrice.toFixed(0)}
                  </div>
                  <div className="text-xs text-text-secondary">
                    ${Math.round(finalPrice * 0.22)} / €
                    {Math.round(finalPrice * 0.21)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white border border-neutral-200 shadow-soft rounded-2xl p-5 space-y-3 text-sm text-text-secondary">
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
