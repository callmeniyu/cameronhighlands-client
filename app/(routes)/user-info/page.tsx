"use client";

import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import {
  FiUser,
  FiMail,
  FiPhone,
  FiMapPin,
  FiArrowRight,
  FiArrowLeft,
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

  const handleNext = () => {
    // Generate demo booking ID and navigate directly to confirmation
    const demoId = `demo-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    router.push(`/booking/confirmation/${demoId}`);
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
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-neutral-200 bg-white focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10">
                  <FiUser className="text-secondary" />
                  <input
                    type="text"
                    placeholder="Alex Tan"
                    className="w-full bg-transparent outline-none text-text-primary"
                  />
                </div>
              </label>

              <label className="flex flex-col gap-2 text-sm font-medium text-text-primary">
                Email
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-neutral-200 bg-white focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10">
                  <FiMail className="text-secondary" />
                  <input
                    type="email"
                    placeholder="you@example.com"
                    className="w-full bg-transparent outline-none text-text-primary"
                  />
                </div>
              </label>

              <label className="flex flex-col gap-2 text-sm font-medium text-text-primary">
                Phone number
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-neutral-200 bg-white focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10">
                  <FiPhone className="text-secondary" />
                  <input
                    type="tel"
                    placeholder="+60 12-345 6789"
                    className="w-full bg-transparent outline-none text-text-primary"
                  />
                </div>
              </label>

              <label className="flex flex-col gap-2 text-sm font-medium text-text-primary">
                Pickup location
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-neutral-200 bg-white focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10">
                  <FiMapPin className="text-secondary" />
                  <select className="w-full bg-transparent outline-none text-text-primary">
                    <option>Tanah Rata Town Center</option>
                    <option>Brinchang Bus Terminal</option>
                    <option>Golden Hills Hotel</option>
                    <option>Century Pines Resort</option>
                  </select>
                </div>
              </label>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 justify-between pt-2">
              <Link
                href={`/tours/${tour}`}
                className="inline-flex items-center gap-2 px-4 py-3 rounded-full border border-neutral-200 text-text-secondary hover:border-primary hover:text-primary transition-colors"
              >
                <FiArrowLeft /> Back to tour
              </Link>
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
            <div className="pt-3 border-t border-neutral-200 flex justify-between items-center">
              <span className="text-text-secondary text-sm">Total</span>
              <span className="text-xl font-bold text-primary">
                {SUMMARY.price}
              </span>
            </div>
          </div>

          <div className="bg-white border border-neutral-200 shadow-soft rounded-2xl p-5 space-y-3 text-sm text-text-secondary">
            <p className="text-text-primary font-semibold">Why we ask these</p>
            <ul className="space-y-2 list-disc list-inside">
              <li>Pickup coordination and emergency contact</li>
              <li>Instant confirmation to your email</li>
              <li>Guide knows any special requests</li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
