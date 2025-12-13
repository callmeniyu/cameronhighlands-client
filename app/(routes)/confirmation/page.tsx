"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  FiCheckCircle,
  FiMail,
  FiDownload,
  FiArrowRight,
  FiArrowLeft,
} from "react-icons/fi";

const TICKET = {
  title: "Mossy Forest Adventure",
  date: "12 Jan 2025",
  time: "7:00 AM",
  guests: "2 adults, 1 child",
  code: "CH-4821",
  pickup: "Tanah Rata Town Center",
  amount: 245,
};

export default function ConfirmationPage() {
  const params = useSearchParams();
  const tour = params.get("tour") || "mossy-forest-adventure";

  return (
    <div className="min-h-screen bg-neutral-50 pb-16 px-4">
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
            <span className="text-text-primary font-medium">Confirmation</span>
          </div>

          <div className="bg-white border border-neutral-200 shadow-soft rounded-2xl p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-3 text-accent">
                <div className="p-3 rounded-full bg-accent/10 text-accent">
                  <FiCheckCircle size={22} />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-text-light">
                    Step 4
                  </p>
                  <h1 className="text-2xl font-semibold text-text-primary">
                    Payment successful
                  </h1>
                  <p className="text-sm text-text-secondary">
                    Your Cameron Highlands adventure is confirmed.
                  </p>
                </div>
              </div>
              <div className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-neutral-100 text-xs text-text-secondary">
                <FiMail className="text-secondary" /> Confirmation sent to your
                email
              </div>
            </div>

            <div className="bg-gradient-to-r from-primary/10 via-white to-amber-50 border border-neutral-200 rounded-2xl p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-text-light">
                    Booking code
                  </p>
                  <p className="text-3xl font-bold text-text-primary">
                    {TICKET.code}
                  </p>
                  <p className="text-sm text-text-secondary">
                    Show this to your guide on arrival.
                  </p>
                </div>
                <button className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-neutral-200 text-text-secondary hover:border-primary hover:text-primary transition-colors">
                  <FiDownload /> Download ticket
                </button>
              </div>
              <div className="grid md:grid-cols-3 gap-4 text-sm text-text-secondary">
                <div>
                  <p className="text-text-light uppercase tracking-[0.15em] text-[11px] mb-1">
                    Date
                  </p>
                  <p className="text-text-primary font-medium">{TICKET.date}</p>
                  <p className="text-text-secondary">{TICKET.time}</p>
                </div>
                <div>
                  <p className="text-text-light uppercase tracking-[0.15em] text-[11px] mb-1">
                    Guests
                  </p>
                  <p className="text-text-primary font-medium">
                    {TICKET.guests}
                  </p>
                  <p className="text-text-secondary">Pickup: {TICKET.pickup}</p>
                </div>
                <div>
                  <p className="text-text-light uppercase tracking-[0.15em] text-[11px] mb-1">
                    Amount paid
                  </p>
                  <p className="text-text-primary font-semibold text-lg">
                    RM {TICKET.amount}
                  </p>
                  <p className="text-text-secondary">Tax included</p>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-neutral-50 border border-dashed border-neutral-200 rounded-2xl p-4 space-y-2 text-sm text-text-secondary">
                <p className="text-text-primary font-semibold">
                  What to expect next
                </p>
                <ul className="space-y-2 list-disc list-inside">
                  <li>
                    Your guide will contact you a day before for pickup
                    coordination.
                  </li>
                  <li>Be ready 10 minutes before the scheduled time.</li>
                  <li>Bring a light jacket, water, and comfortable shoes.</li>
                </ul>
              </div>
              <div className="bg-neutral-50 border border-dashed border-neutral-200 rounded-2xl p-4 space-y-2 text-sm text-text-secondary">
                <p className="text-text-primary font-semibold">Need help?</p>
                <ul className="space-y-1">
                  <li>Email: hello@cameronhighlands.tours</li>
                  <li>WhatsApp: +60 12-345 6789</li>
                  <li>Response time: within the hour, 9am-9pm</li>
                </ul>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 justify-between pt-2">
              <Link
                href="/tours"
                className="inline-flex items-center gap-2 px-4 py-3 rounded-full border border-neutral-200 text-text-secondary hover:border-primary hover:text-primary transition-colors"
              >
                <FiArrowLeft /> Back to tours
              </Link>
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-white font-semibold hover:bg-primary-dark transition-colors"
              >
                View home highlights <FiArrowRight />
              </Link>
            </div>
          </div>
        </div>

        <aside className="space-y-4">
          <div className="bg-white border border-neutral-200 shadow-soft rounded-2xl p-6 space-y-4">
            <p className="text-xs uppercase tracking-[0.2em] text-text-light">
              Tour
            </p>
            <h3 className="text-lg font-semibold">{TICKET.title}</h3>
            <div className="space-y-2 text-sm text-text-secondary">
              <div className="flex justify-between">
                <span>Date</span>
                <span>{TICKET.date}</span>
              </div>
              <div className="flex justify-between">
                <span>Time</span>
                <span>{TICKET.time}</span>
              </div>
              <div className="flex justify-between">
                <span>Guests</span>
                <span>{TICKET.guests}</span>
              </div>
              <div className="flex justify-between">
                <span>Pickup</span>
                <span>{TICKET.pickup}</span>
              </div>
            </div>
            <div className="pt-3 border-t border-neutral-200 flex justify-between items-center">
              <span className="text-text-secondary text-sm">Paid</span>
              <span className="text-xl font-bold text-primary">
                RM {TICKET.amount}
              </span>
            </div>
          </div>

          <div className="bg-white border border-neutral-200 shadow-soft rounded-2xl p-5 space-y-3 text-sm text-text-secondary">
            <p className="text-text-primary font-semibold">Arrival tips</p>
            <ul className="space-y-2 list-disc list-inside">
              <li>Weather can shift quickly; pack a light shell.</li>
              <li>
                Mobile coverage is best near town; download tickets offline.
              </li>
              <li>Cashless accepted everywhere on the tour route.</li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
