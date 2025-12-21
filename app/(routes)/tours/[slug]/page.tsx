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
import { tourApi } from "@/lib/tourApi";
import { TourType } from "@/lib/types";
import { useBooking } from "@/context/BookingContext";

export default function TourDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const { setBooking } = useBooking();

  const [tour, setTour] = useState<TourType | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedTime, setSelectedTime] = useState("");
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [selectedRating, setSelectedRating] = useState(0);
  const calendarRef = useRef<HTMLDivElement>(null);

  // Time slots state
  const [timeSlots, setTimeSlots] = useState<
    Array<{
      time: string;
      isAvailable: boolean;
      bookedCount: number;
      capacity: number;
      minimumPerson: number;
      currentMinimum: number;
    }>
  >([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [validationError, setValidationError] = useState<string>("");

  // Fetch tour data from API
  useEffect(() => {
    const fetchTour = async () => {
      try {
        setIsLoading(true);
        const response = await tourApi.getTourBySlug(slug);
        if (response.success) {
          setTour(response.data);
        }
      } catch (error) {
        console.error("Error fetching tour:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (slug) {
      fetchTour();
    }
  }, [slug]);

  // Fetch time slots when date is selected
  useEffect(() => {
    const fetchTimeSlots = async () => {
      if (!selectedDate || !tour?._id) {
        setTimeSlots([]);
        return;
      }

      setLoadingSlots(true);
      setValidationError("");
      setSelectedTime(""); // Reset selected time when date changes

      try {
        const dateString =
          selectedDate.getFullYear() +
          "-" +
          String(selectedDate.getMonth() + 1).padStart(2, "0") +
          "-" +
          String(selectedDate.getDate()).padStart(2, "0");

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/timeslots/available?packageType=tour&packageId=${tour._id}&date=${dateString}`
        );
        const data = await response.json();

        if (data.success) {
          const slots = Array.isArray(data.data) ? data.data : [];
          setTimeSlots(slots);

          // Log slot information for debugging
          console.log(`📅 Loaded ${slots.length} time slots for ${dateString}`);
          slots.forEach((slot: any) => {
            console.log(
              `⏰ ${slot.time}: Available=${slot.isAvailable}, Booked=${slot.bookedCount}/${slot.capacity}, MinPerson=${slot.currentMinimum}`
            );
          });
        } else {
          setTimeSlots([]);
          console.error("Failed to fetch time slots:", data.message);
        }
      } catch (error) {
        console.error("Error fetching time slots:", error);
        setTimeSlots([]);
      } finally {
        setLoadingSlots(false);
      }
    };

    fetchTimeSlots();
  }, [selectedDate, tour?._id]);

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

  // Validate booking before proceeding
  const validateBooking = (): boolean => {
    setValidationError("");

    if (!selectedDate) {
      setValidationError("Please select a date");
      return false;
    }

    if (!selectedTime) {
      setValidationError("Please select a time slot");
      return false;
    }

    // Find the selected slot
    const selectedSlot = timeSlots.find((slot) => slot.time === selectedTime);
    if (!selectedSlot) {
      setValidationError("Invalid time slot selected");
      return false;
    }

    // Check if slot is available
    if (!selectedSlot.isAvailable) {
      setValidationError("This time slot is no longer available");
      return false;
    }

    const totalGuests = adults + children;

    // Validate minimum person requirement
    if (totalGuests < selectedSlot.currentMinimum) {
      if (selectedSlot.bookedCount === 0) {
        setValidationError(
          `First booking requires at least ${selectedSlot.currentMinimum} guests for this tour`
        );
      } else {
        setValidationError(
          `Minimum ${selectedSlot.currentMinimum} guests required for this slot`
        );
      }
      return false;
    }

    // Check available capacity
    const availableCapacity = selectedSlot.capacity - selectedSlot.bookedCount;
    if (totalGuests > availableCapacity) {
      setValidationError(
        `Only ${availableCapacity} spots available for this time slot`
      );
      return false;
    }

    return true;
  };

  const handleBook = () => {
    if (!validateBooking() || !tour || !selectedDate) {
      return;
    }

    // Calculate total price
    const totalPrice = adults * tour.newPrice + children * tour.childPrice;

    // Fix date handling to prevent offset issues
    const bookingDate = new Date(selectedDate);
    // Ensure the date is set to noon to avoid timezone issues
    bookingDate.setHours(12, 0, 0, 0);

    // Set booking data in context
    setBooking({
      packageId: tour._id,
      title: tour.title,
      slug: slug,
      date: bookingDate.toISOString(), // Use full ISO string to preserve date
      time: selectedTime,
      type: tour.type || "Private Tour",
      duration: tour.duration || "4-6 hours",
      adults: tour.type === "private" ? 1 : adults, // Set to 1 for private tours for booking system compatibility
      children: tour.type === "private" ? 0 : children,
      adultPrice: tour.type === "private" ? tour.newPrice : tour.newPrice,
      childPrice: tour.childPrice || 0,
      totalPrice: totalPrice,
      total: totalPrice,
      packageType: "tour",
      image: tour.image || "",
      transport: tour.type === "private" ? "Private" : undefined,
      // Set pickup locations (HTML content from pickupLocations field - join array with commas)
      pickupLocations: tour.details.pickupLocations?.join(", ") || "",
      // Set pickup guidelines/description (from pickupGuidelines or notes field - join notes array)
      pickupDescription:
        tour.details.pickupGuidelines || tour.details.notes?.join("\n") || "",
    });

    // Navigate directly to user-info page
    router.push(`/user-info?tour=${slug}`);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-text-secondary">Loading tour details...</p>
        </div>
      </div>
    );
  }

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
    tour.oldPrice > tour.newPrice
      ? Math.round((1 - tour.newPrice / tour.oldPrice) * 100)
      : 0;

  const totalPrice = adults * tour.newPrice + children * tour.childPrice;

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
          <span className="font-bold text-neutral-800">4.8</span>
          <span className="text-neutral-500 text-sm">(120+ reviews)</span>
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
                {tour.type}
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
                    {tour.minimumPerson}-{tour.maximumPerson || 50} people
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
                {tour.details.about}
              </p>
            </div>

            {/* What's Included */}
            <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-soft">
              <h2 className="text-base sm:text-lg font-bold text-text-primary mb-3 sm:mb-4">
                What's Included
              </h2>
              <ul className="space-y-2 sm:space-y-3">
                {tour.details.includes?.map((item: string, index: number) => (
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
                {tour.details.itinerary?.map((item: any, index: number) => (
                  <div key={index} className="flex gap-3 sm:gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 min-w-[10px] min-h-[10px] sm:min-w-[12px] sm:min-h-[12px] rounded-full bg-primary flex-shrink-0" />
                      {index < (tour.details.itinerary?.length || 0) - 1 && (
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
                {tour.details.pickupLocations?.map(
                  (location: string, index: number) => (
                    <span
                      key={index}
                      className="px-3 sm:px-4 py-1.5 sm:py-2 bg-neutral-100 text-text-secondary text-xs sm:text-sm rounded-lg sm:rounded-xl"
                    >
                      {location}
                    </span>
                  )
                )}
              </div>
            </div>

            {/* Important Notes */}
            <div className="bg-amber-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-amber-200">
              <h2 className="text-base sm:text-lg font-bold text-amber-800 mb-3 sm:mb-4 flex items-center gap-2">
                <BsExclamationCircle className="text-amber-600 text-lg sm:text-xl" />
                Important Notes
              </h2>
              <ul className="space-y-2">
                {tour.details.notes?.map((note: string, index: number) => (
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
                  {tour.oldPrice > tour.newPrice && (
                    <span className="text-text-light line-through text-base sm:text-lg">
                      RM {tour.oldPrice}
                    </span>
                  )}
                  <span className="text-2xl sm:text-3xl font-bold text-primary">
                    RM {tour.newPrice}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs sm:text-sm text-text-secondary mb-1">
                  <span>
                    ${Math.round(tour.newPrice * 0.22)} / €
                    {Math.round(tour.newPrice * 0.21)} per adult
                  </span>
                </div>
                <div className="text-text-light text-xs mt-1">
                  Child (3-11 years): RM {tour.childPrice} ($
                  {Math.round(tour.childPrice * 0.22)} / €
                  {Math.round(tour.childPrice * 0.21)})
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
                          font-weight: 700;
                          color: #059669;
                        }
                        .rdp-day_disabled .rdp-day_button {
                          color: #d1d5db;
                          cursor: not-allowed;
                        }
                        .rdp-day_disabled .rdp-day_button:hover {
                          background: transparent;
                        }
                      `}</style>
                      <DayPicker
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        disabled={{ before: new Date() }}
                        modifiersClassNames={{
                          selected: "selected-day",
                          today: "today-day",
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Time Slots - Show only when date is selected */}
              {selectedDate && (
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-text-primary mb-2">
                    Select Time Slot
                  </label>

                  {loadingSlots ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  ) : timeSlots.length === 0 ? (
                    <div className="text-center py-6 px-4 bg-amber-50 border border-amber-200 rounded-xl">
                      <p className="text-sm text-amber-800">
                        No time slots available for this date
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      {timeSlots.map((slot) => {
                        const availableSpots = slot.capacity - slot.bookedCount;
                        const isDisabled =
                          !slot.isAvailable || availableSpots === 0;
                        const isSelected = selectedTime === slot.time;

                        return (
                          <button
                            key={slot.time}
                            onClick={() =>
                              !isDisabled && setSelectedTime(slot.time)
                            }
                            disabled={isDisabled}
                            className={`
                              px-3 py-3 rounded-xl text-sm font-medium transition-all relative
                              ${
                                isSelected
                                  ? "bg-primary text-white ring-2 ring-primary ring-offset-2"
                                  : isDisabled
                                  ? "bg-neutral-100 text-neutral-400 cursor-not-allowed"
                                  : "bg-white border-2 border-neutral-200 text-text-primary hover:border-primary hover:bg-primary/5"
                              }
                            `}
                          >
                            <div className="font-semibold">{slot.time}</div>
                            {!isDisabled && (
                              <div
                                className={`text-xs mt-1 ${
                                  isSelected
                                    ? "text-white/80"
                                    : "text-text-light"
                                }`}
                              >
                                {availableSpots} spot
                                {availableSpots !== 1 ? "s" : ""} left
                              </div>
                            )}
                            {isDisabled && (
                              <div className="text-xs mt-1">
                                {slot.isAvailable ? "Full" : "Closed"}
                              </div>
                            )}
                            {slot.bookedCount === 0 && !isDisabled && (
                              <div
                                className={`absolute -top-1 -right-1 w-3 h-3 rounded-full ${
                                  isSelected ? "bg-yellow-300" : "bg-accent"
                                }`}
                              />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* Show minimum person info if a slot is selected */}
                  {selectedTime &&
                    timeSlots.find((s) => s.time === selectedTime) && (
                      <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-xs text-blue-800">
                          <strong>Note:</strong> This time slot requires a
                          minimum of{" "}
                          <strong>
                            {
                              timeSlots.find((s) => s.time === selectedTime)
                                ?.currentMinimum
                            }
                          </strong>{" "}
                          guest
                          {timeSlots.find((s) => s.time === selectedTime)
                            ?.currentMinimum !== 1
                            ? "s"
                            : ""}
                          .
                        </p>
                      </div>
                    )}
                </div>
              )}

              {/* Guests */}
              <div className="mb-4 sm:mb-6">
                <label className="block text-sm font-semibold text-text-primary mb-3">
                  Guests
                </label>
                <div className="flex flex-col gap-3">
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
                        setAdults(
                          Math.min(tour.maximumPerson || 50, adults + 1)
                        )
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
                  Total ({adults + children} guest
                  {adults + children !== 1 ? "s" : ""})
                </span>
                <span className="text-xl sm:text-2xl font-bold text-primary">
                  RM {totalPrice}
                </span>
              </div>

              {/* Validation Error Display */}
              {validationError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-800 flex items-center gap-2">
                    <BsExclamationCircle className="flex-shrink-0" />
                    <span>{validationError}</span>
                  </p>
                </div>
              )}

              {/* Book Now Button */}
              <button
                onClick={handleBook}
                disabled={!selectedDate || !selectedTime}
                className={`
                  w-full py-3 sm:py-4 text-sm sm:text-base font-bold rounded-lg sm:rounded-xl 
                  transition-all active:scale-[0.98] flex items-center justify-center gap-2
                  ${
                    !selectedDate || !selectedTime
                      ? "bg-neutral-300 text-neutral-500 cursor-not-allowed"
                      : "bg-primary text-white hover:shadow-lg hover:bg-primary-dark"
                  }
                `}
              >
                {!selectedDate ? (
                  <>Select Date to Continue</>
                ) : !selectedTime ? (
                  <>Select Time Slot to Continue</>
                ) : (
                  <>Book Now</>
                )}
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

          {/* Reviews Content Placeholder */}
          <div className="text-center text-text-secondary py-8">
            <p>Reviews section coming soon...</p>
          </div>
        </div>
      </div>
    </div>
  );
}
