"use client";

import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import {
  FiClock,
  FiUsers,
  FiMapPin,
  FiChevronLeft,
  FiCheck,
  FiInfo,
  FiCalendar,
} from "react-icons/fi";
import { IoBookmarkOutline } from "react-icons/io5";

import { IoStar, IoLocationSharp, IoTimeOutline } from "react-icons/io5";
import { MdOutlineDirectionsCar } from "react-icons/md";
import { BsExclamationCircle } from "react-icons/bs";
import { DayPicker } from "react-day-picker";
import { format } from "date-fns";
import "react-day-picker/style.css";

// Static dummy tour data - same as home page for consistency
const DUMMY_TOURS: Record<string, any> = {
  "mossy-forest-adventure": {
    id: "1",
    slug: "mossy-forest-adventure",
    title: "Mossy Forest Adventure",
    description:
      "Explore the mystical Mossy Forest with its unique cloud forest ecosystem. Experience the ethereal beauty of moss-covered trees and rare flora.",
    longDescription:
      "Embark on an unforgettable journey through the ancient Mossy Forest, one of Cameron Highlands' most treasured natural wonders. This mystical cloud forest sits at an elevation of 2,032 meters and is home to some of the oldest trees in Malaysia, covered in a magical layer of moss and lichens.\n\nThe forest got its name from the thick layer of sphagnum moss that covers every surface - from tree trunks to rocks to the forest floor. The constant mist and high humidity create perfect conditions for this unique ecosystem to thrive.",
    image: "/images/tour1.jpg",
    duration: "4 Hours",
    price: 85,
    originalPrice: 120,
    rating: 4.9,
    reviewCount: 328,
    label: "Best Seller",
    category: "Nature",
    maxPeople: 15,
    minPeople: 2,
    childPrice: 60,
    startTimes: ["7:00 AM", "9:00 AM", "2:00 PM"],
    pickupLocations: [
      "Tanah Rata Town Center",
      "Brinchang Bus Terminal",
      "Golden Hills Hotel",
      "Century Pines Resort",
    ],
    includes: [
      "Professional English-speaking guide",
      "Round-trip Land Rover transportation",
      "Mossy Forest entrance fees",
      "Raincoats (if needed)",
      "Bottled water",
    ],
    itinerary: [
      { time: "7:00 AM", activity: "Pickup from your hotel/location" },
      { time: "7:30 AM", activity: "Arrive at Mossy Forest entrance" },
      { time: "7:45 AM", activity: "Begin guided forest walk" },
      { time: "9:30 AM", activity: "Tea break at Robinson Falls viewpoint" },
      { time: "10:30 AM", activity: "Return journey and drop-off" },
    ],
    notes: [
      "Wear comfortable walking shoes with good grip",
      "Bring a light jacket - it can be cold and misty",
      "Camera recommended for the unique scenery",
      "Not recommended for those with mobility issues",
    ],
  },
  "sunrise-viewpoint-tour": {
    id: "2",
    slug: "sunrise-viewpoint-tour",
    title: "Sunrise Viewpoint Tour",
    description:
      "Witness breathtaking sunrise views from the highest viewpoints in Cameron Highlands. A magical early morning experience you won't forget.",
    longDescription:
      "Wake up early and experience one of nature's most spectacular displays - a Cameron Highlands sunrise. This tour takes you to the best vantage points to watch the sun rise over the rolling tea plantations and misty valleys.\n\nAs the first rays of light paint the sky in brilliant oranges and pinks, you'll understand why this tour is a favorite among photographers and nature lovers alike.",
    image: "/images/tour2.jpg",
    duration: "3 Hours",
    price: 65,
    originalPrice: 90,
    rating: 4.8,
    reviewCount: 256,
    label: "Popular",
    category: "Scenic",
    maxPeople: 12,
    minPeople: 2,
    childPrice: 45,
    startTimes: ["5:30 AM"],
    pickupLocations: [
      "Tanah Rata Town Center",
      "Brinchang Bus Terminal",
      "Cameron Highlands Resort",
      "Strawberry Park Resort",
    ],
    includes: [
      "English-speaking guide",
      "4WD transportation",
      "Hot tea/coffee",
      "Light breakfast snack",
    ],
    itinerary: [
      { time: "5:30 AM", activity: "Pickup from your location" },
      { time: "6:00 AM", activity: "Arrive at sunrise viewpoint" },
      { time: "6:15 AM", activity: "Watch the sunrise with hot beverages" },
      { time: "7:30 AM", activity: "Photo session at tea plantation" },
      { time: "8:30 AM", activity: "Return to accommodation" },
    ],
    notes: [
      "Very early start - ensure you get enough rest the night before",
      "Dress warmly - mornings are cold at high altitude",
      "Weather dependent - may be rescheduled if heavy rain",
    ],
  },
  "tea-plantation-tour": {
    id: "3",
    slug: "tea-plantation-tour",
    title: "BOH Tea Plantation Tour",
    description:
      "Visit the famous BOH tea plantations, learn about tea processing, and enjoy fresh tea with stunning valley views.",
    longDescription:
      "Discover the heritage of Malaysian tea at the renowned BOH Tea Plantation, Southeast Asia's largest tea producer. This comprehensive tour takes you through the emerald green tea fields, into the processing factory, and culminates at a stunning hilltop café with panoramic views.\n\nLearn about the fascinating journey from tea leaf to teacup, and sample various premium teas while overlooking one of the most beautiful landscapes in Malaysia.",
    image: "/images/tour3.jpg",
    duration: "5 Hours",
    price: 75,
    originalPrice: 95,
    rating: 4.7,
    reviewCount: 412,
    label: "Recommended",
    category: "Cultural",
    maxPeople: 20,
    minPeople: 2,
    childPrice: 50,
    startTimes: ["9:00 AM", "2:00 PM"],
    pickupLocations: ["Tanah Rata Town Center", "Brinchang Town", "Kea Farm"],
    includes: [
      "Guided plantation walk",
      "Factory tour with explanation",
      "Tea tasting session",
      "Transportation",
      "Complimentary tea cake",
    ],
    itinerary: [
      { time: "9:00 AM", activity: "Pickup from your location" },
      { time: "9:30 AM", activity: "Arrive at BOH Tea Plantation" },
      { time: "9:45 AM", activity: "Guided walk through tea fields" },
      { time: "10:30 AM", activity: "Factory tour and processing explanation" },
      { time: "11:30 AM", activity: "Tea tasting at Sungei Palas café" },
      { time: "1:00 PM", activity: "Return journey" },
    ],
    notes: [
      "Wear comfortable walking shoes",
      "Factory closed on Mondays",
      "Great for families with children",
      "Tea products available for purchase",
    ],
  },
  "strawberry-farm-experience": {
    id: "4",
    slug: "strawberry-farm-experience",
    title: "Strawberry Farm Experience",
    description:
      "Pick fresh strawberries, taste local strawberry products, and explore beautiful flower gardens in this family-friendly tour.",
    longDescription:
      "A delightful experience perfect for families and food lovers! Visit Cameron Highlands' famous strawberry farms where you can pick your own fresh, juicy strawberries straight from the plant.\n\nThis fun-filled tour also includes visits to colorful flower gardens and the opportunity to taste various strawberry-based products - from jams and smoothies to chocolates and ice cream.",
    image: "/images/tour4.jpg",
    duration: "3 Hours",
    price: 55,
    originalPrice: 70,
    rating: 4.6,
    reviewCount: 189,
    label: null,
    category: "Family",
    maxPeople: 25,
    minPeople: 2,
    childPrice: 35,
    startTimes: ["9:00 AM", "11:00 AM", "2:00 PM", "4:00 PM"],
    pickupLocations: [
      "Tanah Rata Town Center",
      "Brinchang Bus Station",
      "Kea Farm Market",
    ],
    includes: [
      "Farm entrance fees",
      "Strawberry picking basket",
      "Flower garden access",
      "Strawberry smoothie",
      "Transportation",
    ],
    itinerary: [
      { time: "9:00 AM", activity: "Pickup from your location" },
      { time: "9:20 AM", activity: "Arrive at strawberry farm" },
      { time: "9:30 AM", activity: "Strawberry picking session" },
      { time: "10:15 AM", activity: "Visit flower gardens" },
      { time: "11:00 AM", activity: "Enjoy strawberry products" },
      { time: "11:45 AM", activity: "Return journey" },
    ],
    notes: [
      "Perfect for children of all ages",
      "You can bring home the strawberries you pick (additional cost by weight)",
      "Best to visit in the morning for freshest strawberries",
    ],
  },
};

export default function TourDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const tour = DUMMY_TOURS[slug];

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedTime, setSelectedTime] = useState("");
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [selectedRating, setSelectedRating] = useState(0);
  const calendarRef = useRef<HTMLDivElement>(null);

  // Close calendar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        calendarRef.current &&
        !calendarRef.current.contains(event.target as Node)
      ) {
        setShowCalendar(false);
      }
    };

    if (showCalendar) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showCalendar]);

  const handleBook = () => {
    router.push(`/user-info?tour=${slug}`);
  };

  // If tour not found
  if (!tour) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-text-primary mb-4">
            Tour Not Found
          </h1>
          <p className="text-text-secondary mb-6">
            The tour you're looking for doesn't exist.
          </p>
          <Link
            href="/"
            className="px-6 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary-dark transition-colors"
          >
            Back to Tours
          </Link>
        </div>
      </div>
    );
  }

  const discountPercent =
    tour.originalPrice > tour.price
      ? Math.round((1 - tour.price / tour.originalPrice) * 100)
      : 0;

  const totalPrice = adults * tour.price + children * tour.childPrice;

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Back Button Header */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-neutral-100">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-text-secondary hover:text-primary transition-colors"
          >
            <FiChevronLeft className="text-xl" />
            <span className="font-medium">Back</span>
          </button>
          <span className="text-sm text-text-light">Tour Details</span>
        </div>
      </div>

      {/* Hero Image Section */}
      <div className="relative h-72 sm:h-80 md:h-96 overflow-hidden">
        <Image
          src={tour.image}
          alt={tour.title}
          fill
          className="object-cover"
          priority
        />

        {/* Badges */}
        <div className="absolute top-6 left-4 flex gap-2">
          {tour.label && (
            <span className="px-4 py-2 bg-accent text-primary text-sm font-bold rounded-full shadow-md">
              {tour.label}
            </span>
          )}
          {discountPercent > 0 && (
            <span className="px-4 py-2 bg-white/90 text-text-primary text-sm font-bold rounded-full shadow-md">
              {discountPercent}% OFF
            </span>
          )}
        </div>

        {/* Rating Badge */}
        <div className="absolute bottom-4 right-4 flex items-center gap-2 px-4 py-2 bg-white/95 rounded-full shadow-md">
          <IoStar className="text-amber-400" />
          <span className="font-bold text-neutral-800">{tour.rating}</span>
          <span className="text-neutral-500 text-sm">
            ({tour.reviewCount} reviews)
          </span>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-4 sm:py-6">
        <div className="lg:grid lg:grid-cols-3 lg:gap-8">
          {/* Left Column - Tour Info */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            {/* Title & Basic Info */}
            <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-soft">
              <span className="inline-block px-2.5 sm:px-3 py-1 bg-primary-light text-primary text-xs font-semibold rounded-lg mb-2 sm:mb-3">
                {tour.category}
              </span>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-text-primary mb-3 sm:mb-4">
                {tour.title}
              </h1>

              <div className="flex flex-wrap gap-3 sm:gap-4 text-text-secondary text-xs sm:text-sm">
                <div className="flex items-center gap-2">
                  <FiClock className="text-primary text-lg" />
                  <span>{tour.duration}</span>
                </div>
                <div className="flex items-center gap-2">
                  <FiUsers className="text-primary text-lg" />
                  <span>
                    {tour.minPeople}-{tour.maxPeople} people
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <IoBookmarkOutline className="text-primary text-lg font-bold" />
                  <span>30k+ Booked</span>
                </div>
              </div>
            </div>

            {/* About */}
            <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-soft">
              <h2 className="text-base sm:text-lg font-bold text-text-primary mb-3 sm:mb-4 flex items-center gap-2">
                <FiInfo className="text-primary text-lg sm:text-xl" />
                About This Tour
              </h2>
              <p className="text-sm sm:text-base text-text-secondary leading-relaxed whitespace-pre-line">
                {tour.longDescription}
              </p>
            </div>

            {/* What's Included */}
            <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-soft">
              <h2 className="text-base sm:text-lg font-bold text-text-primary mb-3 sm:mb-4">
                What's Included
              </h2>
              <ul className="space-y-2 sm:space-y-3">
                {tour.includes.map((item: string, index: number) => (
                  <li key={index} className="flex items-start gap-2 sm:gap-3">
                    <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-accent/20 flex items-center justify-center mt-0.5 flex-shrink-0">
                      <FiCheck className="text-accent text-xs sm:text-sm" />
                    </div>
                    <span className="text-sm sm:text-base text-text-secondary">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Itinerary */}
            <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-soft">
              <h2 className="text-base sm:text-lg font-bold text-text-primary mb-3 sm:mb-4 flex items-center gap-2">
                <IoTimeOutline className="text-primary text-lg sm:text-xl" />
                Itinerary
              </h2>
              <div className="space-y-3 sm:space-y-4">
                {tour.itinerary.map((item: any, index: number) => (
                  <div key={index} className="flex gap-3 sm:gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 min-w-[10px] min-h-[10px] sm:min-w-[12px] sm:min-h-[12px] rounded-full bg-primary flex-shrink-0" />
                      {index < tour.itinerary.length - 1 && (
                        <div className="w-0.5 h-full bg-primary/20 mt-1" />
                      )}
                    </div>
                    <div className="pb-3 sm:pb-4 flex-1 min-w-0">
                      <p className="text-sm sm:text-base text-text-primary font-medium">
                        {item.activity}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Pickup Locations */}
            <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-soft">
              <h2 className="text-base sm:text-lg font-bold text-text-primary mb-3 sm:mb-4 flex items-center gap-2">
                <MdOutlineDirectionsCar className="text-primary text-lg sm:text-xl" />
                Pickup Locations
              </h2>
              <div className="flex flex-wrap gap-2">
                {tour.pickupLocations.map((location: string, index: number) => (
                  <span
                    key={index}
                    className="px-3 sm:px-4 py-1.5 sm:py-2 bg-neutral-100 text-text-secondary text-xs sm:text-sm rounded-lg sm:rounded-xl"
                  >
                    {location}
                  </span>
                ))}
              </div>
            </div>

            {/* Important Notes */}
            <div className="bg-amber-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-amber-200">
              <h2 className="text-base sm:text-lg font-bold text-amber-800 mb-3 sm:mb-4 flex items-center gap-2">
                <BsExclamationCircle className="text-amber-600 text-lg sm:text-xl" />
                Important Notes
              </h2>
              <ul className="space-y-2">
                {tour.notes.map((note: string, index: number) => (
                  <li
                    key={index}
                    className="flex items-start gap-2 sm:gap-3 text-sm sm:text-base text-amber-900"
                  >
                    <span className="text-amber-600 mt-0.5 sm:mt-1">•</span>
                    <span className="flex-1">{note}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Right Column - Booking Card */}
          <div className="lg:col-span-1 mt-4 sm:mt-6 lg:mt-0">
            <div className="sticky top-20 bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-medium border border-neutral-100">
              {/* Price */}
              <div className="mb-4 sm:mb-6">
                <div className="flex items-baseline gap-2 mb-1">
                  {tour.originalPrice > tour.price && (
                    <span className="text-text-light line-through text-base sm:text-lg">
                      RM {tour.originalPrice}
                    </span>
                  )}
                  <span className="text-2xl sm:text-3xl font-bold text-primary">
                    RM {tour.price}
                  </span>
                </div>
                <span className="text-text-secondary text-xs sm:text-sm">
                  per adult
                </span>
                <div className="text-text-light text-xs mt-1">
                  Child (3-11 years): RM {tour.childPrice}
                </div>
              </div>

              {/* Date Selection */}
              <div className="mb-4">
                <label className="block text-sm font-semibold text-text-primary mb-2">
                  Select Date
                </label>
                <div className="relative" ref={calendarRef}>
                  <button
                    type="button"
                    onClick={() => setShowCalendar(!showCalendar)}
                    className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary cursor-pointer text-left flex items-center justify-between bg-white hover:border-primary/50 transition-colors"
                  >
                    <span
                      className={
                        selectedDate ? "text-text-primary" : "text-text-light"
                      }
                    >
                      {selectedDate
                        ? format(selectedDate, "PPP")
                        : "Select a date"}
                    </span>
                    <FiCalendar className="text-primary" />
                  </button>

                  {showCalendar && (
                    <div className="absolute z-50 mt-2 bg-white rounded-2xl shadow-xl border border-neutral-100 p-4">
                      <style jsx global>{`
                        .rdp {
                          --rdp-accent-color: #059669;
                          --rdp-background-color: #d1fae5;
                          --rdp-accent-color-dark: #047857;
                          --rdp-background-color-dark: #a7f3d0;
                          --rdp-outline: 2px solid var(--rdp-accent-color);
                          --rdp-outline-selected: 2px solid
                            var(--rdp-accent-color);
                          margin: 0;
                        }
                        .rdp-months {
                          justify-content: center;
                        }
                        .rdp-month {
                          width: 100%;
                        }
                        .rdp-caption {
                          display: flex;
                          justify-content: center;
                          align-items: center;
                          padding: 0.5rem 0 1rem 0;
                          padding-right: 5rem; /* make room for clustered buttons */
                        }
                        .rdp-caption_label {
                          font-size: 1rem;
                          font-weight: 600;
                          color: #1f2937;
                        }
                        .rdp-nav {
                          position: absolute;
                          top: 0.5rem;
                          right: 0.5rem; /* cluster to the right */
                          left: auto;
                          display: flex;
                          justify-content: flex-end; /* keep them together */
                          gap: 0.35rem;
                          align-items: center;
                          width: auto; /* shrinkwrap the buttons */
                          z-index: 5;
                        }
                        .rdp-button_previous,
                        .rdp-button_next {
                          width: 2rem;
                          height: 2rem;
                          border-radius: 0.5rem;
                          display: flex;
                          align-items: center;
                          justify-content: center;
                          color: #059669;
                          background: transparent;
                          border: none;
                          cursor: pointer;
                          transition: all 0.2s;
                        }
                        .rdp-button_previous:hover,
                        .rdp-button_next:hover {
                          background: #d1fae5;
                        }
                        .rdp-button_previous svg,
                        .rdp-button_next svg {
                          color: #0f172a;
                          fill: currentColor;
                          width: 1rem;
                          height: 1rem;
                        }
                        .rdp-button_previous:focus,
                        .rdp-button_next:focus {
                          outline: 2px solid #059669;
                          outline-offset: 2px;
                        }
                        .rdp-head_cell {
                          font-size: 0.75rem;
                          font-weight: 500;
                          color: #6b7280;
                          text-transform: uppercase;
                          padding: 0.5rem 0;
                        }
                        .rdp-day {
                          width: 2.5rem;
                          height: 2.5rem;
                          border-radius: 0.5rem;
                          font-size: 0.875rem;
                          transition: all 0.2s;
                        }
                        .rdp-day_button {
                          width: 100%;
                          height: 100%;
                          border-radius: 0.5rem;
                          border: none;
                          background: transparent;
                          cursor: pointer;
                          font-weight: 500;
                          color: #1f2937;
                        }
                        .rdp-day_button:hover:not(
                            .rdp-day_selected .rdp-day_button
                          ) {
                          background: #f3f4f6;
                        }
                        .rdp-day_selected .rdp-day_button {
                          background: #059669;
                          color: white;
                          font-weight: 600;
                        }
                        .rdp-day_today
                          .rdp-day_button:not(
                            .rdp-day_selected .rdp-day_button
                          ) {
                          background: #d1fae5;
                          color: #047857;
                          font-weight: 600;
                        }
                        .rdp-day_disabled .rdp-day_button {
                          color: #d1d5db;
                          cursor: not-allowed;
                        }
                      `}</style>
                      <DayPicker
                        mode="single"
                        selected={selectedDate}
                        onSelect={(date) => {
                          setSelectedDate(date);
                          setShowCalendar(false);
                        }}
                        disabled={{ before: new Date() }}
                        showOutsideDays={false}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Time Selection */}
              <div className="mb-4">
                <label className="block text-xs sm:text-sm font-semibold text-text-primary mb-2">
                  Start Time
                </label>
                <div className="flex flex-wrap gap-2">
                  {tour.startTimes.map((time: string) => (
                    <button
                      key={time}
                      onClick={() => setSelectedTime(time)}
                      className={`px-3 sm:px-4 py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium transition-all ${
                        selectedTime === time
                          ? "bg-primary text-white"
                          : "bg-neutral-100 text-text-secondary hover:bg-neutral-200"
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>

              {/* Travelers */}
              <div className="mb-4 sm:mb-6 space-y-3 sm:space-y-4">
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-text-primary mb-2">
                    Adults
                  </label>
                  <div className="flex items-center gap-2 sm:gap-3">
                    <button
                      onClick={() => setAdults(Math.max(1, adults - 1))}
                      className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-neutral-100 text-text-primary hover:bg-neutral-200 active:scale-95 transition-all font-medium text-lg"
                    >
                      −
                    </button>
                    <span className="w-10 sm:w-12 text-center font-semibold text-base sm:text-lg">
                      {adults}
                    </span>
                    <button
                      onClick={() =>
                        setAdults(Math.min(tour.maxPeople, adults + 1))
                      }
                      className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-neutral-100 text-text-primary hover:bg-neutral-200 active:scale-95 transition-all font-medium text-lg"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-text-primary mb-2">
                    Children (3-11 years)
                  </label>
                  <div className="flex items-center gap-2 sm:gap-3">
                    <button
                      onClick={() => setChildren(Math.max(0, children - 1))}
                      className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-neutral-100 text-text-primary hover:bg-neutral-200 active:scale-95 transition-all font-medium text-lg"
                    >
                      −
                    </button>
                    <span className="w-10 sm:w-12 text-center font-semibold text-base sm:text-lg">
                      {children}
                    </span>
                    <button
                      onClick={() => setChildren(children + 1)}
                      className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-neutral-100 text-text-primary hover:bg-neutral-200 active:scale-95 transition-all font-medium text-lg"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* Total */}
              <div className="flex items-center justify-between py-3 sm:py-4 border-t border-neutral-100 mb-3 sm:mb-4">
                <span className="text-sm sm:text-base text-text-secondary font-medium">
                  Total
                </span>
                <span className="text-xl sm:text-2xl font-bold text-primary">
                  RM {totalPrice}
                </span>
              </div>

              {/* Book Now Button */}
              <button
                onClick={handleBook}
                className="w-full py-3 sm:py-4 text-sm sm:text-base bg-primary text-white font-bold rounded-lg sm:rounded-xl hover:shadow-lg transition-all active:scale-[0.98]"
              >
                Book Now
              </button>

              {/* Contact Info */}
              <div className="mt-3 sm:mt-4 text-center text-xs sm:text-sm text-text-light">
                Questions? Call us at{" "}
                <a
                  href="tel:+60123456789"
                  className="text-primary font-medium hover:underline"
                >
                  +60 12-345 6789
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Related Tours */}
      <div className="max-w-6xl mx-auto px-4 py-8 sm:py-12">
        <h2 className="text-xl sm:text-2xl font-bold text-text-primary mb-4 sm:mb-6">
          You Might Also Like
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {Object.values(DUMMY_TOURS)
            .filter((t: any) => t.slug !== slug)
            .slice(0, 3)
            .map((relatedTour: any) => (
              <Link
                key={relatedTour.id}
                href={`/tours/${relatedTour.slug}`}
                className="group bg-white rounded-xl sm:rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover transition-all"
              >
                <div className="relative h-36 sm:h-40 overflow-hidden">
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${
                      relatedTour.id === "1"
                        ? "from-emerald-400 to-teal-600"
                        : relatedTour.id === "2"
                        ? "from-orange-400 to-rose-500"
                        : relatedTour.id === "3"
                        ? "from-amber-400 to-orange-500"
                        : "from-pink-400 to-rose-500"
                    }`}
                  />
                </div>
                <div className="p-3 sm:p-4">
                  <h3 className="text-sm sm:text-base font-bold text-text-primary group-hover:text-primary transition-colors line-clamp-1">
                    {relatedTour.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-text-secondary line-clamp-1 mb-2">
                    {relatedTour.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-base sm:text-lg font-bold text-primary">
                      RM {relatedTour.price}
                    </span>
                    <span className="text-xs text-text-light">
                      {relatedTour.duration}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
        </div>
      </div>

      {/* Reviews & Comments Section - Isolated Container */}
      <div className="max-w-6xl mx-auto px-4 pb-12">
        <div className="bg-gradient-to-br from-gray-50 to-neutral-100 rounded-2xl md:rounded-3xl p-4 sm:p-6 md:p-8 shadow-lg border border-neutral-200">
          {/* Section Header */}
          <div className="mb-6 md:mb-8">
            <div className="flex items-center gap-2 sm:gap-3 mb-2">
              <div className="w-1 h-6 sm:h-8 bg-primary rounded-full"></div>
              <h2 className="text-xl sm:text-2xl font-bold text-text-primary">
                Reviews & Comments
              </h2>
            </div>
            <p className="text-sm sm:text-base text-text-secondary ml-4 sm:ml-7">
              Share your experience and help others discover this tour
            </p>
          </div>

          {/* Add Review Form */}
          <div className="bg-white rounded-xl md:rounded-2xl p-4 sm:p-6 shadow-md border border-neutral-100 mb-4 sm:mb-6">
            <div className="flex items-center gap-2 mb-3 sm:mb-4">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <IoStar className="text-primary text-sm sm:text-base" />
              </div>
              <h3 className="text-sm sm:text-base font-semibold text-text-primary">
                Share your experience
              </h3>
            </div>
            <div className="flex gap-3 sm:gap-4">
              <Image
                src="https://ui-avatars.com/api/?name=Current+User&background=059669&color=fff"
                alt="Your profile"
                width={48}
                height={48}
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-full shadow-sm flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <textarea
                  placeholder="Write your review here..."
                  rows={3}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none bg-gray-50 focus:bg-white transition-colors"
                />
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mt-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs sm:text-sm font-medium text-text-secondary">
                      Your Rating:
                    </span>
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setSelectedRating(i + 1)}
                          className="transition-all transform hover:scale-110 active:scale-95"
                        >
                          <IoStar
                            className={`w-4 h-4 sm:w-5 sm:h-5 ${
                              i < selectedRating
                                ? "text-amber-400"
                                : "text-gray-300"
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                    {selectedRating > 0 && (
                      <span className="text-xs text-text-light">
                        ({selectedRating}/5)
                      </span>
                    )}
                  </div>
                  <button className="w-full sm:w-auto px-6 py-2 text-sm sm:text-base bg-primary text-white rounded-full font-semibold hover:bg-primary-dark transition-all shadow-md hover:shadow-lg active:scale-95">
                    Post Review
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Reviews Count & Filter */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4 sm:mb-6">
            <p className="text-xs sm:text-sm font-medium text-text-secondary">
              <span className="text-primary font-semibold text-base sm:text-lg">
                {tour.reviewCount}
              </span>{" "}
              reviews
            </p>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs sm:text-sm text-text-light whitespace-nowrap">
                Sort by:
              </span>
              <select className="text-xs sm:text-sm border border-neutral-200 rounded-lg px-2 sm:px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 flex-1 sm:flex-none">
                <option>Most Recent</option>
                <option>Highest Rated</option>
                <option>Lowest Rated</option>
              </select>
            </div>
          </div>

          {/* Existing Reviews */}
          <div className="space-y-3 sm:space-y-4">
            {/* Review 1 */}
            <div className="bg-white rounded-xl md:rounded-2xl p-4 sm:p-6 shadow-sm border border-neutral-100 hover:shadow-md transition-shadow">
              <div className="flex gap-3 sm:gap-4">
                <Image
                  src="https://ui-avatars.com/api/?name=Sarah+Kim&background=3B82F6&color=fff"
                  alt="Sarah Kim"
                  width={48}
                  height={48}
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-full shadow-sm flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                    <div className="min-w-0">
                      <h4 className="text-sm sm:text-base font-semibold text-text-primary truncate">
                        Sarah Kim
                      </h4>
                      <div className="flex items-center gap-2 flex-wrap">
                        <div className="flex items-center gap-0.5 sm:gap-1">
                          {[...Array(5)].map((_, i) => (
                            <IoStar
                              key={i}
                              className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400"
                            />
                          ))}
                        </div>
                        <span className="text-xs text-text-light whitespace-nowrap">
                          2 days ago
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                    Absolutely stunning experience! The Mossy Forest was like
                    stepping into a fairy tale. Our guide was knowledgeable and
                    friendly. Highly recommend this tour!
                  </p>
                </div>
              </div>
            </div>

            {/* Review 2 */}
            <div className="bg-white rounded-xl md:rounded-2xl p-4 sm:p-6 shadow-sm border border-neutral-100 hover:shadow-md transition-shadow">
              <div className="flex gap-3 sm:gap-4">
                <Image
                  src="https://ui-avatars.com/api/?name=James+Lee&background=8B5CF6&color=fff"
                  alt="James Lee"
                  width={48}
                  height={48}
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-full shadow-sm flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                    <div className="min-w-0">
                      <h4 className="text-sm sm:text-base font-semibold text-text-primary truncate">
                        James Lee
                      </h4>
                      <div className="flex items-center gap-2 flex-wrap">
                        <div className="flex items-center gap-0.5 sm:gap-1">
                          {[...Array(5)].map((_, i) => (
                            <IoStar
                              key={i}
                              className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400"
                            />
                          ))}
                        </div>
                        <span className="text-xs text-text-light whitespace-nowrap">
                          5 days ago
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                    Perfect family trip! The kids loved picking strawberries and
                    the tea plantation visit was educational. Great value for
                    money and wonderful memories made.
                  </p>
                </div>
              </div>
            </div>

            {/* Review 3 */}
            <div className="bg-white rounded-xl md:rounded-2xl p-4 sm:p-6 shadow-sm border border-neutral-100 hover:shadow-md transition-shadow">
              <div className="flex gap-3 sm:gap-4">
                <Image
                  src="https://ui-avatars.com/api/?name=Aisha+Rahman&background=EC4899&color=fff"
                  alt="Aisha Rahman"
                  width={48}
                  height={48}
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-full shadow-sm flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                    <div className="min-w-0">
                      <h4 className="text-sm sm:text-base font-semibold text-text-primary truncate">
                        Aisha Rahman
                      </h4>
                      <div className="flex items-center gap-2 flex-wrap">
                        <div className="flex items-center gap-0.5 sm:gap-1">
                          {[...Array(4)].map((_, i) => (
                            <IoStar
                              key={i}
                              className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400"
                            />
                          ))}
                          <IoStar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-300" />
                        </div>
                        <span className="text-xs text-text-light whitespace-nowrap">
                          1 week ago
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                    Beautiful scenery and well-organized tour. The sunrise view
                    was breathtaking. Only minor issue was the early morning
                    start, but totally worth it!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
