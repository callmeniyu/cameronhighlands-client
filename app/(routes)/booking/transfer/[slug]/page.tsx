"use client";
import { useState, useEffect } from "react";
import BookingCalendar from "@/components/ui/BookingCalendar";
import BookingInfoPanel from "@/components/ui/BookingInfoPanel";
import { transferApi } from "@/lib/transferApi";
import { TransferType } from "@/lib/types";
import { useParams } from "next/navigation";
import { useBooking } from "@/context/BookingContext";
import { useRouter } from "next/navigation";
import { useToast } from "@/context/ToastContext";

interface TimeSlot {
  time: string;
  capacity: number;
  bookedCount: number;
  isAvailable: boolean;
  minimumPerson: number;
}

export default function BookingInfoPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { setBooking } = useBooking();
  const router = useRouter();
  const { showToast } = useToast();
  const [transferDetails, setTransferDetails] = useState<TransferType>();
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [initialDateSet, setInitialDateSet] = useState(false);
  const [selectedTime, setSelectedTime] = useState("");
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const [adults, setAdults] = useState(0);
  const [children, setChildren] = useState(0);
  const [totalGuests, setTotalGuests] = useState(0);

  const [serverDateTime, setServerDateTime] = useState<{
    date: string;
    time: string;
    longDate: string;
    fullDateTime: Date;
  } | null>(null);

  // Function to get minimum booking date (tomorrow)
  const getMinimumBookingDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    return tomorrow;
  };

  // Function to find next available date with time slots
  const findNextAvailableDate = async (transferId: string, startDate: Date) => {
    const maxDaysToCheck = 30; // Check up to 30 days ahead
    const currentDate = new Date(startDate);

    for (let i = 0; i < maxDaysToCheck; i++) {
      const dateString =
        currentDate.getFullYear() +
        "-" +
        String(currentDate.getMonth() + 1).padStart(2, "0") +
        "-" +
        String(currentDate.getDate()).padStart(2, "0");

      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/timeslots/available?packageType=transfer&packageId=${transferId}&date=${dateString}`
        );
        const data = await response.json();

        if (data.success && Array.isArray(data.data) && data.data.length > 0) {
          // Check if any slots are available
          const hasAvailableSlots = data.data.some(
            (slot: TimeSlot) =>
              slot.isAvailable && slot.capacity - slot.bookedCount > 0
          );

          if (hasAvailableSlots) {
            return new Date(currentDate);
          }
        }
      } catch (error) {
        console.error(`Error checking date ${dateString}:`, error);
      }

      // Move to next day
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // If no available date found, return the start date
    return startDate;
  };

  useEffect(() => {
    const getTransferDetails = async () => {
      try {
        const response = await transferApi.getTransferBySlug(slug);

        if (response.success && response.data) {
          setTransferDetails(response.data);
          // IMPORTANT: Always start with 0 guests - let users increment to meet minimum requirements
          console.log(`🎯 Setting initial guest counts to 0 for transfer`);
          setAdults(0);
          setTotalGuests(0);
          setChildren(0);

          // Do NOT auto-set initial date - let user select date manually
          console.log(`📅 Transfer loaded - waiting for user to select date`);
        } else {
          showToast({
            type: "error",
            title: "Error",
            message: "Failed to load transfer details",
          });
        }
      } catch (error) {
        console.error("Error fetching transfer:", error);
        showToast({
          type: "error",
          title: "Error",
          message: "Failed to load transfer details",
        });
      }
    };
    if (slug) {
      getTransferDetails();
    }
  }, [slug, showToast, initialDateSet]);

  const fetchTimeSlots = async () => {
    if (!transferDetails?._id || !selectedDate) return;

    try {
      setIsLoading(true);
      // Format date to ensure consistent timezone handling
      const dateString =
        selectedDate.getFullYear() +
        "-" +
        String(selectedDate.getMonth() + 1).padStart(2, "0") +
        "-" +
        String(selectedDate.getDate()).padStart(2, "0");

      const url = `${process.env.NEXT_PUBLIC_API_URL}/api/timeslots/available?packageType=transfer&packageId=${transferDetails._id}&date=${dateString}`;
      console.debug(
        "[fetchTimeSlots] requesting slots for date:",
        dateString,
        "url:",
        url
      );
      const response = await fetch(url);
      const data = await response.json();
      console.debug("[fetchTimeSlots] response for date:", dateString, data);

      if (data.success) {
        const slots = Array.isArray(data.data) ? data.data : [];
        setTimeSlots(slots);

        // Auto-select first available time slot when date is selected
        if (slots.length > 0 && !selectedTime) {
          const firstAvailableSlot = slots.find(
            (slot: TimeSlot) =>
              slot.isAvailable && slot.capacity - slot.bookedCount > 0
          );

          if (firstAvailableSlot) {
            console.log(
              `🎯 Auto-selecting first available time slot: ${firstAvailableSlot.time}`
            );
            setSelectedTime(firstAvailableSlot.time);
          }
        }

        console.log(
          `📋 Loaded ${slots.length} time slots. Current selectedTime: "${selectedTime}"`
        );

        // Clear selected time if it's no longer available
        if (selectedTime) {
          const currentSlot = slots.find(
            (slot: any) => slot.time === selectedTime
          );
          if (
            !currentSlot ||
            !currentSlot.isAvailable ||
            currentSlot.capacity - currentSlot.bookedCount <= 0
          ) {
            setSelectedTime("");
          }
        }
      } else {
        setTimeSlots([]);
        setSelectedTime(""); // Clear selection when no slots available
        console.error("Failed to fetch time slots:", data.message);
        // Don't show any toast errors - just silently handle no slots
      }
    } catch (error) {
      console.error("Error fetching time slots:", error);
      setTimeSlots([]);
      setSelectedTime(""); // Clear selection on error
      // Don't show any toast errors - just silently handle errors
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTimeSlots();

    const interval = setInterval(() => {
      if (transferDetails?._id) fetchTimeSlots();
    }, 60000); // 60 seconds

    return () => clearInterval(interval);
  }, [selectedDate, transferDetails?._id]);

  const updateAdults = (newCount: number) => {
    if (!transferDetails) return;

    // Get available capacity from selected time slot
    const availableCapacity = getAvailableCapacity();

    // Get minimum person requirement for selected time slot
    const selectedSlot = timeSlots.find((slot) => slot.time === selectedTime);
    const minimumRequired = selectedSlot
      ? selectedSlot.minimumPerson // Use slot's minimumPerson directly
      : transferDetails.minimumPerson || 1;

    const newTotal = newCount + children;
    if (
      newCount >= 0 && // Allow starting from 0
      newTotal <= (transferDetails.maximumPerson || Infinity) &&
      newTotal <= availableCapacity
    ) {
      setAdults(newCount);
      setTotalGuests(newTotal);
    }
  };

  const updateChildren = (newCount: number) => {
    if (!transferDetails) return;

    // Get available capacity from selected time slot
    const availableCapacity = getAvailableCapacity();

    // Get minimum person requirement for selected time slot
    const selectedSlot = timeSlots.find((slot) => slot.time === selectedTime);
    const minimumRequired = selectedSlot
      ? selectedSlot.minimumPerson // Use slot's minimumPerson directly
      : transferDetails.minimumPerson || 1;

    const newTotal = adults + newCount;

    if (
      newCount >= 0 && // Allow starting from 0
      newTotal <= (transferDetails.maximumPerson || Infinity) &&
      newTotal <= availableCapacity
    ) {
      setChildren(newCount);
      setTotalGuests(newTotal);
    }
  };

  useEffect(() => {
    if (totalGuests >= (transferDetails?.maximumPerson || Infinity)) {
      showToast({
        type: "error",
        title: "You have reached the maximum number of guests.",
        message: "Please try contacting us for if more tickets.",
      });
    }
  }, [adults, children]);

  // Get available capacity for selected time slot
  const getAvailableCapacity = () => {
    if (!selectedTime || !selectedDate) return 0;

    const selectedSlot = timeSlots.find((slot) => slot.time === selectedTime);
    if (!selectedSlot) return 0;

    return selectedSlot.capacity - selectedSlot.bookedCount;
  };

  // Remove the auto-reset behavior - let users manage guest counts manually
  // useEffect(() => {
  //   if (selectedTime && timeSlots.length > 0 && transferDetails) {
  //     const selectedSlot = timeSlots.find((slot) => slot.time === selectedTime);
  //     if (selectedSlot) {
  //       const slotMinimum = selectedSlot.minimumPerson || 1;
  //       const currentTotal = adults + children;
  //
  //       console.log(
  //         `🔍 Slot selected: ${selectedTime}, SlotMinimum: ${slotMinimum}, CurrentAdults: ${adults}, CurrentChildren: ${children}, CurrentTotal: ${currentTotal}`
  //       );
  //
  //       // Always reset adults to slot minimum when slot changes (unless user has manually set more)
  //       // This ensures adults start at the correct value for each slot
  //       if (adults !== slotMinimum) {
  //         const newAdults = Math.max(slotMinimum, 1);
  //         console.log(
  //           `🔄 Resetting adults from ${adults} to ${newAdults} for slot minimum (${slotMinimum})`
  //         );
  //         setAdults(newAdults);
  //         setTotalGuests(newAdults + children);
  //       }
  //     }
  //   }
  // }, [selectedTime, timeSlots, transferDetails]); // Removed children dependency to reset properly

  const handleContinue = () => {
    if (!transferDetails) return;

    // Check if date and time are selected
    if (!selectedDate) {
      showToast({
        type: "error",
        title: "Date Required",
        message: "Please select a date for your booking",
      });
      return;
    }

    if (!selectedTime) {
      showToast({
        type: "error",
        title: "Time Required",
        message: "Please select a time slot for your booking",
      });
      return;
    }

    const selectedSlot = timeSlots.find((slot) => slot.time === selectedTime);
    if (!selectedSlot) {
      showToast({
        type: "error",
        title: "Invalid time slot",
        message: "Please select a valid time slot",
      });
      return;
    }

    const totalGuests = adults + children;

    // Skip minimum person validation for Private transfers (vehicle booking)
    if (transferDetails?.type !== "Private") {
      // Check minimum adults requirement (children don't count toward minimum)
      if (adults < selectedSlot.minimumPerson) {
        showToast({
          type: "error",
          title: "Minimum adults required",
          message: `Please select at least ${selectedSlot.minimumPerson} adult${
            selectedSlot.minimumPerson > 1 ? "s" : ""
          } for this time slot. Current adults: ${adults}`,
        });
        return;
      }
    }

    // Check capacity
    const availableSlots = selectedSlot.capacity - selectedSlot.bookedCount;
    if (totalGuests > availableSlots) {
      showToast({
        type: "error",
        title: "Not enough capacity",
        message: `Only ${availableSlots} ${
          transferDetails?.type === "Private" ? "units" : "seats"
        } available for this time.`,
      });
      return;
    }

    const totalPrice = calculateTotalPrice();

    // Format selected date as YYYY-MM-DD to send as a date-only string
    const dateString =
      selectedDate.getFullYear() +
      "-" +
      String(selectedDate.getMonth() + 1).padStart(2, "0") +
      "-" +
      String(selectedDate.getDate()).padStart(2, "0");

    setBooking({
      packageId: transferDetails._id || "",
      title: transferDetails.title,
      slug: slug,
      // send date as YYYY-MM-DD so server treats it as local date (no timezone shift)
      date: dateString,
      time: selectedTime,
      type: transferDetails.type || "Private transfer",
      duration: transferDetails.duration || "4-6 hours",
      // For private transfers, booking is per-vehicle. Still store adults/children for reference but set seatsRequested to seatCapacity.
      adults: transferDetails.type === "Private" ? 0 : adults,
      children: transferDetails.type === "Private" ? 0 : children,
      adultPrice: transferDetails.newPrice || 0,
      childPrice: transferDetails.childPrice || 0,
      totalPrice: totalPrice,
      total: totalPrice,
      pickupLocations: transferDetails.details.pickupLocations || "",
      pickupDescription: transferDetails.details.note || "", // Add pickup description
      pickupOption: transferDetails.details.pickupOption || "user", // Include pickup option
      packageType: "transfer",
      isVehicleBooking: transferDetails.type === "Private",
      vehicleSeatCapacity:
        transferDetails?.seatCapacity ||
        transferDetails?.maximumPerson ||
        undefined,
      vehicleName: transferDetails?.vehicle || "",
      // Include transfer details for pickup guidelines
      details: {
        pickupGuidelines: transferDetails.details.pickupGuidelines || "",
        note: transferDetails.details.note || "",
      },
    });
    router.push(`/user-info?transfer=${slug}`);
  };

  // Calculate total price based on ticket type
  const calculateTotalPrice = () => {
    if (!transferDetails) return 0;

    if (transferDetails.type === "Private") {
      // For private transfers, price is per vehicle
      return transferDetails.newPrice || 0;
    } else {
      // For shared transfers, calculate based on adults and children
      return (
        adults * (transferDetails.newPrice || 0) +
        children * (transferDetails.childPrice || 0)
      );
    }
  };

  useEffect(() => {
    const fetchServerDateTime = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/timeslots/server-datetime`
        );
        const data = await response.json();
        if (data.success) {
          setServerDateTime(data.data);
        }
      } catch (error) {
        console.error("Error fetching server date/time:", error);
      }
    };
    fetchServerDateTime();
  }, []);

  return (
    <div className="max-w-7xl mx-auto p-4 md:px-12 grid grid-cols-1 md:grid-cols-3 gap-6 font-poppins">
      {/* Server Date/Time Display - green themed, at top */}
      {serverDateTime && (
        <div className="col-span-1 md:col-span-3 bg-primary_green/10 border border-primary_green rounded-lg p-3 mb-2">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-sm">
            <span className="text-primary_green font-medium">
              🕒 Time (Malaysia): {serverDateTime?.time || "-"}
            </span>
            <span className="text-primary_green">
              📅 Current Date: {serverDateTime?.longDate || "-"}
            </span>
          </div>
        </div>
      )}
      <div className="space-y-6 md:col-span-2">
        <div className="flex flex-col md:flex-row gap-6">
          <BookingCalendar
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
            serverDateTime={serverDateTime}
          />
          <div className="w-full flex flex-col rounded-lg shadow-md p-4 bg-white">
            <h3 className="text-primary_green text-xl font-bold mb-2">
              Select your time
            </h3>
            {isLoading ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin h-6 w-6 border-2 border-primary_green border-t-transparent rounded-full"></div>
              </div>
            ) : timeSlots.length === 0 ? (
              !selectedDate ? (
                <div className="text-center py-8 text-gray-500">
                  <p>Please select a date to show available time slots.</p>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>No available time slots for this date.</p>
                  <p className="text-sm mt-1">
                    Please select a different date.
                  </p>
                </div>
              )
            ) : (
              <div className="flex flex-col gap-2">
                {timeSlots.map((slot) => {
                  const availableSeats = slot.capacity - slot.bookedCount;
                  const isSlotAvailable =
                    slot.isAvailable && availableSeats > 0;
                  // Format time to 12-hour
                  const slotTime = new Date(`1970-01-01T${slot.time}`);
                  const formattedTime = slotTime.toLocaleTimeString("en-US", {
                    hour: "numeric",
                    minute: "2-digit",
                    hour12: true,
                  });
                  return (
                    <button
                      key={slot.time}
                      className={`px-4 py-3 rounded border text-left transition-colors ${
                        selectedTime === slot.time
                          ? "bg-primary_green text-white border-primary_green"
                          : isSlotAvailable
                          ? "bg-white border-gray-200 hover:border-primary_green"
                          : "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed"
                      }`}
                      onClick={() =>
                        isSlotAvailable && setSelectedTime(slot.time)
                      }
                      disabled={!isSlotAvailable}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{formattedTime}</span>
                        <span className="text-sm">
                          {isSlotAvailable
                            ? availableSeats <= 6
                              ? "Only a few left"
                              : "Available"
                            : "Sold out"}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
            {timeSlots.length > 0 && (
              <div className="mt-3 space-y-1">
                <p className="text-desc_gray text-sm">
                  Times shown are in Malaysia timezone (GMT+8)
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Show guest selection only when a time slot is selected */}
        {selectedTime && (
          <div className="rounded-lg shadow-md p-4 bg-white">
            <h3 className="text-primary_green text-xl font-bold mb-2">
              {transferDetails?.type === "Private"
                ? "Private Vehicle"
                : "No. of Guests"}
            </h3>

            {/* Show minimum requirement for selected slot (hidden for Private transfers) */}
            {(() => {
              // Do not show the slot-minimum/availability panel for Private (vehicle) transfers
              if (transferDetails?.type === "Private") return null;

              const selectedSlot = timeSlots.find(
                (slot) => slot.time === selectedTime
              );
              if (selectedSlot) {
                const isFirstBooking = selectedSlot.bookedCount === 0;
                return (
                  <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-700">
                      <span className="font-medium">Selected Time:</span>{" "}
                      {selectedTime} |
                      <span className="font-medium">
                        {" "}
                        Minimum Adults Required:
                      </span>{" "}
                      {selectedSlot.minimumPerson} adult
                      {selectedSlot.minimumPerson > 1 ? "s" : ""} |
                    </p>
                    <p className="text-xs text-green-600 mt-1">
                      Children don't count toward the minimum requirement - you
                      need at least {selectedSlot.minimumPerson} adult
                      {selectedSlot.minimumPerson > 1 ? "s" : ""}
                    </p>
                  </div>
                );
              }
              return null;
            })()}

            <div className="space-y-6 border p-3 rounded-lg my-4">
              {transferDetails?.type === "Private" ? (
                <div className="flex flex-col gap-2">
                  <p className="font-semibold">Vehicle Seats</p>
                  <p className="text-sm text-desc_gray">
                    {transferDetails?.seatCapacity ||
                      transferDetails?.maximumPerson ||
                      "N/A"}{" "}
                    seats
                  </p>
                  <p className="text-sm text-desc_gray">
                    Price shown is for the whole vehicle (per vehicle).
                  </p>
                </div>
              ) : (
                [
                  {
                    label: "Adults",
                    desc: ["Select the number of adults for your transfer"],
                    value: adults,
                    onIncrement: () => updateAdults(adults + 1),
                    onDecrement: () => updateAdults(adults - 1),
                    disableDecrement: adults <= 0,
                    disableIncrement:
                      totalGuests >=
                      (transferDetails?.maximumPerson || Infinity),
                    price: transferDetails?.newPrice || 0,
                  },
                  ...(transferDetails &&
                  String(transferDetails.type) !== "Private"
                    ? [
                        {
                          label: "Children",
                          desc: "Age between 3 to 7 years. Child seats are not provided",
                          value: children,
                          onIncrement: () => updateChildren(children + 1),
                          onDecrement: () => updateChildren(children - 1),
                          disableDecrement: children <= 0,
                          disableIncrement:
                            totalGuests >=
                            (transferDetails?.maximumPerson || Infinity),
                          price: transferDetails?.childPrice || 0,
                        },
                      ]
                    : []),
                ].map(
                  ({
                    label,
                    value,
                    price,
                    desc,
                    onIncrement,
                    onDecrement,
                    disableIncrement,
                    disableDecrement,
                  }) => (
                    <div
                      key={label}
                      className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
                    >
                      <div className="flex-1">
                        <p className="font-semibold">
                          {label}{" "}
                          <span className="text-sm text-desc_gray">
                            (RM {price}{" "}
                            {transferDetails?.type === "Private"
                              ? "/vehicle"
                              : "/person"}
                            )
                          </span>
                        </p>
                        <div className="space-y-1 mt-1">
                          {Array.isArray(desc) ? (
                            desc.map((line, index) => (
                              <p
                                key={index}
                                className="text-xs text-desc_gray font-light"
                              >
                                {line}
                              </p>
                            ))
                          ) : (
                            <p className="text-xs text-desc_gray font-light">
                              {desc}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between md:justify-normal gap-6 w-full md:w-auto">
                        <div className="flex items-center gap-2 border rounded-full">
                          <button
                            onClick={onDecrement}
                            disabled={disableDecrement}
                            className={`px-3 py-1.5 rounded-l-xl text-lg ${
                              disableDecrement
                                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                                : "hover:bg-primary_green hover:text-white"
                            }`}
                          >
                            -
                          </button>
                          <span className="min-w-[24px] text-center">
                            {value}
                          </span>
                          <button
                            onClick={onIncrement}
                            disabled={disableIncrement}
                            className={`px-3 py-1.5 rounded-r-xl text-lg ${
                              disableIncrement
                                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                                : "hover:bg-primary_green hover:text-white"
                            }`}
                          >
                            +
                          </button>
                        </div>

                        <span className="font-semibold text-primary_green min-w-[80px] text-right">
                          RM {value * price}
                        </span>
                      </div>
                    </div>
                  )
                )
              )}
            </div>
          </div>
        )}

        {/* Show message when no slot is selected */}
        {!selectedTime && (
          <div className="rounded-lg shadow-md p-4 bg-gray-50 border-2 border-dashed border-gray-300">
            <h3 className="text-gray-500 text-xl font-bold mb-2">
              {transferDetails?.type === "Private"
                ? "Private Vehicle"
                : "No. of Guests"}
            </h3>
            <div className="text-center py-8">
              <p className="text-gray-500 text-lg">
                👆 Please select a time slot first
              </p>
              <p className="text-gray-400 text-sm mt-2">
                {transferDetails?.type === "Private"
                  ? "Vehicle booking details will appear after choosing your preferred time"
                  : "Guest selection will appear after choosing your preferred time"}
              </p>
            </div>
          </div>
        )}
      </div>

      <BookingInfoPanel
        title={transferDetails?.title || "Transfer Title"}
        date={selectedDate || new Date()}
        time={selectedTime}
        type={transferDetails?.type || "Private transfer"}
        duration={transferDetails?.duration || "4-6 hours"}
        adults={adults}
        children={children}
        adultPrice={transferDetails?.newPrice || 0}
        childPrice={transferDetails?.childPrice || 0}
        totalPrice={calculateTotalPrice()}
        onClick={handleContinue}
        packageType="transfer"
        packageId={transferDetails?._id}
        disabled={false}
        transferDetails={
          transferDetails
            ? {
                pickupOption: transferDetails.details.pickupOption || "user",
                pickupLocations: transferDetails.details.pickupLocations || "",
              }
            : undefined
        }
        isVehicleBooking={transferDetails?.type === "Private"}
        vehicleSeatCapacity={
          transferDetails?.seatCapacity || transferDetails?.maximumPerson
        }
        vehicleName={transferDetails?.vehicle}
      />
    </div>
  );
}
