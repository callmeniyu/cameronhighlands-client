"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  FiCreditCard,
  FiShield,
  FiArrowLeft,
  FiArrowRight,
} from "react-icons/fi";

const SUMMARY = {
  title: "Mossy Forest Adventure",
  date: "12 Jan 2025",
  time: "7:00 AM",
  guests: "2 adults, 1 child",
  subtotal: 235,
  fees: 10,
};

const METHODS = ["Card", "FPX", "PayPal"];

export default function PaymentPage() {
  const router = useRouter();
  const params = useSearchParams();
  const tour = params.get("tour") || "mossy-forest-adventure";

  const total = SUMMARY.subtotal + SUMMARY.fees;

  const handlePay = () => {
    // Demo flow: generate a demo booking id and redirect to the canonical
    // server confirmation page so demo and prod behavior matches.
    // For cart-like demo support, use `from=cart` as a query param.
    const isCart = params.get("from") === "cart";
    const demoId = `demo-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    if (isCart) {
      // Demo single cart booking: redirect to cart confirmation with one ID
      router.push(`/booking/cart-confirmation?bookings=${demoId}`);
    } else {
      router.push(`/booking/confirmation/${demoId}`);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 pt-24 pb-16 px-4">
      <div className="max-w-5xl mx-auto grid lg:grid-cols-[1.1fr_0.9fr] gap-8">
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm text-text-secondary">
            <Link href="/tours" className="hover:text-primary">
              Home
            </Link>
            <span>/</span>
            <Link href={`/tours/${tour}`} className="hover:text-primary">
              Tour
            </Link>
            <span>/</span>
            <Link
              href={`/user-info?tour=${tour}`}
              className="hover:text-primary"
            >
              Guests
            </Link>
            <span>/</span>
            <span className="text-text-primary font-medium">Payment</span>
          </div>

          <div className="bg-white border border-neutral-200 shadow-soft rounded-2xl p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-text-light mb-2">
                  Step 3
                </p>
                <h1 className="text-2xl font-semibold">Payment</h1>
                <p className="text-sm text-text-secondary mt-1">
                  Secure checkout with instant confirmation.
                </p>
              </div>
              <div className="hidden sm:inline-flex items-center gap-2 px-3 py-2 rounded-full bg-neutral-100 text-xs text-text-secondary">
                <FiShield className="text-secondary" /> AES-256 encrypted
              </div>
            </div>

            <div className="flex gap-2 flex-wrap">
              {METHODS.map((method) => (
                <button
                  key={method}
                  className={`px-4 py-2 rounded-full border border-neutral-200 text-sm font-semibold transition-colors hover:border-primary ${
                    method === "Card"
                      ? "bg-primary text-white border-primary"
                      : "bg-white text-text-secondary"
                  }`}
                >
                  {method}
                </button>
              ))}
            </div>

            <div className="space-y-4">
              <label className="flex flex-col gap-2 text-sm font-medium text-text-primary">
                Cardholder name
                <input
                  type="text"
                  placeholder="Alex Tan"
                  className="w-full px-4 py-3 rounded-xl border border-neutral-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary"
                />
              </label>
              <div className="grid md:grid-cols-2 gap-4">
                <label className="flex flex-col gap-2 text-sm font-medium text-text-primary">
                  Card number
                  <div className="flex items-center gap-2 px-4 py-3 rounded-xl border border-neutral-200 bg-white focus-within:outline-none focus-within:ring-2 focus-within:ring-primary/10 focus-within:border-primary">
                    <FiCreditCard className="text-secondary" />
                    <input
                      type="text"
                      placeholder="4242 4242 4242 4242"
                      className="w-full bg-transparent outline-none"
                    />
                  </div>
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <label className="flex flex-col gap-2 text-sm font-medium text-text-primary">
                    Expiry
                    <input
                      type="text"
                      placeholder="MM/YY"
                      className="w-full px-4 py-3 rounded-xl border border-neutral-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary"
                    />
                  </label>
                  <label className="flex flex-col gap-2 text-sm font-medium text-text-primary">
                    CVC
                    <input
                      type="text"
                      placeholder="123"
                      className="w-full px-4 py-3 rounded-xl border border-neutral-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary"
                    />
                  </label>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 justify-between pt-2">
              <Link
                href={`/user-info?tour=${tour}`}
                className="inline-flex items-center gap-2 px-4 py-3 rounded-full border border-neutral-200 text-text-secondary hover:border-primary hover:text-primary transition-colors"
              >
                <FiArrowLeft /> Back to guest info
              </Link>
              <button
                onClick={handlePay}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-white font-semibold hover:bg-primary-dark transition-colors"
              >
                Pay RM {total} <FiArrowRight />
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
            <div className="pt-3 border-t border-neutral-200 space-y-2 text-sm text-text-secondary">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>RM {SUMMARY.subtotal}</span>
              </div>
              <div className="flex justify-between">
                <span>Fees & taxes</span>
                <span>RM {SUMMARY.fees}</span>
              </div>
            </div>
            <div className="pt-3 border-t border-neutral-200 flex justify-between items-center">
              <span className="text-text-secondary text-sm">Total</span>
              <span className="text-xl font-bold text-primary">RM {total}</span>
            </div>
          </div>

          <div className="bg-white border border-neutral-200 shadow-soft rounded-2xl p-5 space-y-3 text-sm text-text-secondary">
            <p className="text-text-primary font-semibold">Secure by default</p>
            <ul className="space-y-2 list-disc list-inside">
              <li>Bank-grade encryption</li>
              <li>Instant confirmation email</li>
              <li>Refund support within policy</li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
