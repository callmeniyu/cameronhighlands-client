"use client";

import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import {
  FiClock,
  FiUsers,
  FiMapPin,
  FiChevronLeft,
  FiCheck,
  FiInfo,
  FiCalendar,
} from "react-icons/fi";
import { IoStar, IoLocationSharp, IoTimeOutline } from "react-icons/io5";
import { MdOutlineDirectionsCar } from "react-icons/md";
import { BsExclamationCircle } from "react-icons/bs";

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

  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);

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
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="lg:grid lg:grid-cols-3 lg:gap-8">
          {/* Left Column - Tour Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title & Basic Info */}
            <div className="bg-white rounded-2xl p-6 shadow-soft">
              <span className="inline-block px-3 py-1 bg-primary-light text-primary text-xs font-semibold rounded-lg mb-3">
                {tour.category}
              </span>
              <h1 className="text-2xl md:text-3xl font-bold text-text-primary mb-4">
                {tour.title}
              </h1>

              <div className="flex flex-wrap gap-4 text-text-secondary text-sm">
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
                  <FiMapPin className="text-primary text-lg" />
                  <span>Cameron Highlands</span>
                </div>
              </div>
            </div>

            {/* About */}
            <div className="bg-white rounded-2xl p-6 shadow-soft">
              <h2 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
                <FiInfo className="text-primary" />
                About This Tour
              </h2>
              <p className="text-text-secondary leading-relaxed whitespace-pre-line">
                {tour.longDescription}
              </p>
            </div>

            {/* What's Included */}
            <div className="bg-white rounded-2xl p-6 shadow-soft">
              <h2 className="text-lg font-bold text-text-primary mb-4">
                What's Included
              </h2>
              <ul className="space-y-3">
                {tour.includes.map((item: string, index: number) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-accent/20 flex items-center justify-center mt-0.5">
                      <FiCheck className="text-accent text-sm" />
                    </div>
                    <span className="text-text-secondary">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Itinerary */}
            <div className="bg-white rounded-2xl p-6 shadow-soft">
              <h2 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
                <IoTimeOutline className="text-primary" />
                Itinerary
              </h2>
              <div className="space-y-4">
                {tour.itinerary.map((item: any, index: number) => (
                  <div key={index} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-3 h-3 rounded-full bg-primary" />
                      {index < tour.itinerary.length - 1 && (
                        <div className="w-0.5 h-full bg-primary/20 mt-1" />
                      )}
                    </div>
                    <div className="pb-4">
                      <span className="text-xs font-semibold text-primary">
                        {item.time}
                      </span>
                      <p className="text-text-primary font-medium">
                        {item.activity}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Pickup Locations */}
            <div className="bg-white rounded-2xl p-6 shadow-soft">
              <h2 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
                <MdOutlineDirectionsCar className="text-primary" />
                Pickup Locations
              </h2>
              <div className="flex flex-wrap gap-2">
                {tour.pickupLocations.map((location: string, index: number) => (
                  <span
                    key={index}
                    className="px-4 py-2 bg-neutral-100 text-text-secondary text-sm rounded-xl"
                  >
                    {location}
                  </span>
                ))}
              </div>
            </div>

            {/* Important Notes */}
            <div className="bg-amber-50 rounded-2xl p-6 border border-amber-200">
              <h2 className="text-lg font-bold text-amber-800 mb-4 flex items-center gap-2">
                <BsExclamationCircle className="text-amber-600" />
                Important Notes
              </h2>
              <ul className="space-y-2">
                {tour.notes.map((note: string, index: number) => (
                  <li
                    key={index}
                    className="flex items-start gap-3 text-amber-900"
                  >
                    <span className="text-amber-600 mt-1">•</span>
                    <span>{note}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Right Column - Booking Card */}
          <div className="lg:col-span-1 mt-6 lg:mt-0">
            <div className="sticky top-20 bg-white rounded-2xl p-6 shadow-medium border border-neutral-100">
              {/* Price */}
              <div className="mb-6">
                <div className="flex items-baseline gap-2 mb-1">
                  {tour.originalPrice > tour.price && (
                    <span className="text-text-light line-through text-lg">
                      RM {tour.originalPrice}
                    </span>
                  )}
                  <span className="text-3xl font-bold text-primary">
                    RM {tour.price}
                  </span>
                </div>
                <span className="text-text-secondary text-sm">per adult</span>
                <div className="text-text-light text-xs mt-1">
                  Child (3-11 years): RM {tour.childPrice}
                </div>
              </div>

              {/* Date Selection */}
              <div className="mb-4">
                <label className="block text-sm font-semibold text-text-primary mb-2">
                  Select Date
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              {/* Time Selection */}
              <div className="mb-4">
                <label className="block text-sm font-semibold text-text-primary mb-2">
                  Start Time
                </label>
                <div className="flex flex-wrap gap-2">
                  {tour.startTimes.map((time: string) => (
                    <button
                      key={time}
                      onClick={() => setSelectedTime(time)}
                      className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
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
              <div className="mb-6 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-text-primary mb-2">
                    Adults
                  </label>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setAdults(Math.max(1, adults - 1))}
                      className="w-10 h-10 rounded-xl bg-neutral-100 text-text-primary hover:bg-neutral-200 transition-colors font-medium"
                    >
                      −
                    </button>
                    <span className="w-12 text-center font-semibold text-lg">
                      {adults}
                    </span>
                    <button
                      onClick={() =>
                        setAdults(Math.min(tour.maxPeople, adults + 1))
                      }
                      className="w-10 h-10 rounded-xl bg-neutral-100 text-text-primary hover:bg-neutral-200 transition-colors font-medium"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-text-primary mb-2">
                    Children (3-11 years)
                  </label>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setChildren(Math.max(0, children - 1))}
                      className="w-10 h-10 rounded-xl bg-neutral-100 text-text-primary hover:bg-neutral-200 transition-colors font-medium"
                    >
                      −
                    </button>
                    <span className="w-12 text-center font-semibold text-lg">
                      {children}
                    </span>
                    <button
                      onClick={() => setChildren(children + 1)}
                      className="w-10 h-10 rounded-xl bg-neutral-100 text-text-primary hover:bg-neutral-200 transition-colors font-medium"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* Total */}
              <div className="flex items-center justify-between py-4 border-t border-neutral-100 mb-4">
                <span className="text-text-secondary font-medium">Total</span>
                <span className="text-2xl font-bold text-primary">
                  RM {totalPrice}
                </span>
              </div>

              {/* Book Now Button */}
              <button
                onClick={handleBook}
                className="w-full py-4 bg-primary text-white font-bold rounded-xl hover:shadow-lg transition-all active:scale-[0.98]"
              >
                Book Now
              </button>

              {/* Contact Info */}
              <div className="mt-4 text-center text-sm text-text-light">
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
      <div className="max-w-6xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold text-text-primary mb-6">
          You Might Also Like
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.values(DUMMY_TOURS)
            .filter((t: any) => t.slug !== slug)
            .slice(0, 3)
            .map((relatedTour: any) => (
              <Link
                key={relatedTour.id}
                href={`/tours/${relatedTour.slug}`}
                className="group bg-white rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover transition-all"
              >
                <div className="relative h-40 overflow-hidden">
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
                <div className="p-4">
                  <h3 className="font-bold text-text-primary group-hover:text-primary transition-colors line-clamp-1">
                    {relatedTour.title}
                  </h3>
                  <p className="text-sm text-text-secondary line-clamp-1 mb-2">
                    {relatedTour.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-primary">
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
    </div>
  );
}
