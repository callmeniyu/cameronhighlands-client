"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { useToast } from "@/context/ToastContext";
import {
  FaRegCalendarAlt as Calendar,
  FaRegClock as Clock,
  FaUsers as Users,
  FaRegEnvelope as Mail,
  FaPhone as Phone,
  FaMapMarkerAlt as MapPin,
  FaStar as Star,
  FaCamera as Camera,
  FaTag as Tag,
  FaGift as Gift,
  FaMoneyBillWave as Money,
  FaHotel as Hotel,
  FaInstagram as Instagram,
} from "react-icons/fa";
import Image from "next/image";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

interface BookingDetails {
  _id: string;
  packageTitle: string;
  packageType: string;
  packageImage?: string;
  selectedDate: string;
  selectedTime: string;
  adults: number;
  children: number;
  totalPrice: number;
  pickupLocation: string;
  pickupGuidelines?: string;
  contactInfo: {
    name: string;
    email: string;
    phone: string;
  };
  createdAt: string;
  // Vehicle properties for private transfers
  isVehicleBooking?: boolean;
  vehicleSeatCapacity?: number;
}

export default function CartConfirmationPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { showToast } = useToast();
  const [bookings, setBookings] = useState<BookingDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const confirmationRef = useRef<HTMLDivElement>(null);

  const stripHtmlTags = (html: string): string => {
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = html;
    return tempDiv.textContent || tempDiv.innerText || "";
  };

  const downloadPDF = async () => {
    if (!confirmationRef.current || bookings.length === 0) return;

    try {
      setIsGeneratingPDF(true);

      // A4 size in mm
      const pdfWidthMm = 210;
      const pdfHeightMm = 297;

      // Baseline dpi
      const dpi = 96;
      const pxPerMm = dpi / 25.4;

      const pagePaddingMm = 12;
      const targetPxWidth = Math.round(
        (pdfWidthMm - pagePaddingMm * 2) * pxPerMm
      );

      const wrapper = document.createElement("div");
      wrapper.style.width = `${targetPxWidth}px`;
      wrapper.style.boxSizing = "border-box";
      wrapper.style.padding = "0";
      wrapper.style.background = "#ffffff";
      wrapper.style.fontFamily = "Poppins, Arial, Helvetica, sans-serif";
      wrapper.style.position = "fixed";
      wrapper.style.left = `0`;
      wrapper.style.top = `-99999px`;

      const clone = confirmationRef.current.cloneNode(true) as HTMLElement;
      clone.style.width = "100%";
      clone.style.boxSizing = "border-box";

      // Sanitize clone for html2canvas:
      const sanitizeNode = (node: HTMLElement) => {
        node
          .querySelectorAll(
            '[style*="backdrop-filter"], [style*="-webkit-backdrop-filter"], .pointer-events-none, .blur-lg, .blur-sm'
          )
          .forEach((el) => {
            try {
              (el as HTMLElement).style.backdropFilter = "none";
              try {
                (el as HTMLElement).style.setProperty(
                  "-webkit-backdrop-filter",
                  "none"
                );
              } catch (_) {}
              (el as HTMLElement).style.filter = "none";
              (el as HTMLElement).classList.remove("pointer-events-none");
            } catch (_) {}
          });

        node.querySelectorAll("*[style]").forEach((el) => {
          const s = (el as HTMLElement).style;
          if (s.transform && s.transform !== "none") s.transform = "none";
          if (s.transition) s.transition = "none";
        });

        node.querySelectorAll("*").forEach((el) => {
          const e = el as HTMLElement;
          try {
            e.style.background =
              e.style.background ||
              (e.tagName.toLowerCase() === "body" ? "#fff" : "transparent");
            e.style.color = e.style.color || getComputedStyle(e).color;
            e.style.boxShadow = "none";
          } catch (_) {}
        });
      };

      sanitizeNode(clone);

      wrapper.appendChild(clone);
      document.body.appendChild(wrapper);

      const scale = 2;
      const canvas = await html2canvas(wrapper, {
        scale,
        useCORS: true,
        allowTaint: false,
        backgroundColor: "#ffffff",
      });

      document.body.removeChild(wrapper);

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");

      const pxToMm = (px: number) => (px / (dpi * scale)) * 25.4;

      const imgWidthMm = pxToMm(canvas.width);
      const imgHeightMm = pxToMm(canvas.height);

      // Attempt single-page fit
      const maxImgWidthMm = pdfWidthMm - pagePaddingMm * 2;
      const fitScaleVert = pdfHeightMm / imgHeightMm;
      const fitScaleWidth = maxImgWidthMm / imgWidthMm;
      const fitScale = Math.min(fitScaleVert, fitScaleWidth, 1);
      const minAllowedScale = 0.6;

      if (fitScale >= 1 || fitScale >= minAllowedScale) {
        const scaleToUse = Math.min(fitScale, 1);
        const sCanvas = document.createElement("canvas");
        sCanvas.width = Math.round(canvas.width * scaleToUse);
        sCanvas.height = Math.round(canvas.height * scaleToUse);
        const sCtx = sCanvas.getContext("2d");
        if (!sCtx) throw new Error("Canvas context not available");
        sCtx.fillStyle = "#ffffff";
        sCtx.fillRect(0, 0, sCanvas.width, sCanvas.height);
        sCtx.drawImage(
          canvas,
          0,
          0,
          canvas.width,
          canvas.height,
          0,
          0,
          sCanvas.width,
          sCanvas.height
        );

        const pageImgData = sCanvas.toDataURL("image/png");
        const pageImgWidthMm = pxToMm(sCanvas.width);
        const pageImgHeightMm = pxToMm(sCanvas.height);
        const x = (pdfWidthMm - pageImgWidthMm) / 2;
        const y = (pdfHeightMm - pageImgHeightMm) / 2;
        pdf.addImage(pageImgData, "PNG", x, y, pageImgWidthMm, pageImgHeightMm);
        pdf.save(`cart-booking-confirmation.pdf`);
      } else {
        const pages = Math.ceil(imgHeightMm / pdfHeightMm);

        for (let i = 0; i < pages; i++) {
          const sY = (i * pdfHeightMm * (dpi * scale)) / 25.4;
          const pageCanvas = document.createElement("canvas");
          const pagePxWidth = canvas.width;
          const pagePxHeight = Math.min(
            canvas.height - sY,
            Math.round((pdfHeightMm * (dpi * scale)) / 25.4)
          );
          pageCanvas.width = pagePxWidth;
          pageCanvas.height = pagePxHeight;
          const ctx = pageCanvas.getContext("2d");
          if (!ctx) throw new Error("Canvas context not available");
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
          ctx.drawImage(
            canvas,
            0,
            sY,
            pageCanvas.width,
            pageCanvas.height,
            0,
            0,
            pageCanvas.width,
            pageCanvas.height
          );

          const pageImgData = pageCanvas.toDataURL("image/png");
          const pageImgHeightMm = pxToMm(pageCanvas.height);
          const pageImgWidthMm = pxToMm(pageCanvas.width);
          const x = (pdfWidthMm - pageImgWidthMm) / 2;
          const y = 0;

          pdf.addImage(
            pageImgData,
            "PNG",
            x,
            y,
            pageImgWidthMm,
            pageImgHeightMm
          );
          if (i < pages - 1) pdf.addPage();
        }

        pdf.save(`cart-booking-confirmation.pdf`);
      }

      showToast({
        type: "success",
        title: "PDF Downloaded",
        message: "Your booking confirmation has been downloaded successfully",
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
      showToast({
        type: "error",
        title: "Error",
        message: "Failed to generate PDF",
      });
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  useEffect(() => {
    const bookingIdsRaw = searchParams.get("bookings");

    if (!bookingIdsRaw) {
      router.push("/cart");
      return;
    }

    const bookingIds = bookingIdsRaw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (bookingIds.length === 0) {
      router.push("/cart");
      return;
    }

    fetchBookingDetails(bookingIds);
  }, [searchParams, router]);

  const fetchBookingDetails = async (bookingIds: string[]) => {
    try {
      setLoading(true);

      // Fetch details for each booking in parallel, but tolerate partial failures
      const bookingPromises = bookingIds.map(async (id) => {
        try {
          // Check if this is a demo booking
          if (id.startsWith("demo-")) {
            // Return mock booking data for demo purposes
            return {
              _id: id,
              packageTitle: "Mossy Forest Adventure",
              packageType: "tour",
              packageImage: "/images/tour1.jpg",
              selectedDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                .toISOString()
                .split("T")[0], // 7 days from now
              selectedTime: "7:00 AM",
              adults: 2,
              children: 1,
              totalPrice: 245,
              pickupLocation: "Tanah Rata Town Center",
              contactInfo: {
                name: "Demo User",
                email: "demo@example.com",
                phone: "+60 12-345 6789",
              },
              createdAt: new Date().toISOString(),
              pickupGuidelines:
                "Please arrive 15 minutes before your scheduled pickup time. Bring your booking confirmation and valid ID.",
            };
          }

          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/bookings/${id}`
          );
          const result = await response.json();
          if (!result.success) throw new Error(`Failed to fetch booking ${id}`);
          const data = result.data;
          return {
            _id: data._id,
            packageTitle:
              (data.packageDetails && data.packageDetails.title) ||
              data.packageTitle ||
              (data.packageId && data.packageId.title) ||
              "Package",
            packageType: data.packageType || "tour",
            packageImage:
              (data.packageDetails && data.packageDetails.image) ||
              data.packageImage,
            selectedDate: data.selectedDate
              ? data.selectedDate
              : data.date
              ? new Date(data.date).toISOString().split("T")[0]
              : "",
            selectedTime: data.selectedTime || data.time || "",
            adults: Number(data.adults) || 1,
            children: Number(data.children) || 0,
            totalPrice: Number(data.total) || Number(data.totalPrice) || 0,
            pickupLocation: data.pickupLocation || "",
            contactInfo: data.contactInfo || {
              name: "",
              email: "",
              phone: "",
            },
            createdAt: data.createdAt,
            // Extract pickup guidelines from packageId details
            pickupGuidelines:
              data.packageId?.details?.pickupGuidelines ||
              (data.packageType === "transfer"
                ? data.packageId?.details?.pickupDescription
                : "") ||
              "",
          };
        } catch (err) {
          console.warn(`Warning: booking ${id} failed to load`, err);
          return null;
        }
      });

      const settled = await Promise.all(bookingPromises);
      const bookingDetails = settled.filter(
        (b) => b !== null
      ) as BookingDetails[];
      setBookings(bookingDetails);
    } catch (error) {
      console.error("Error fetching booking details:", error);
      showToast({
        type: "error",
        title: "Error",
        message: "Failed to load booking details",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      if (!dateString) return "Invalid Date";
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Invalid Date";
      return date.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return "Invalid Date";
    }
  };

  const formatTime = (timeString: string) => {
    try {
      if (!timeString) return "Invalid Time";
      const [hours, minutes] = timeString.split(":");
      if (!hours || !minutes) return timeString;
      const date = new Date();
      date.setHours(parseInt(hours), parseInt(minutes));
      if (isNaN(date.getTime())) return timeString;
      return date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    } catch {
      return timeString;
    }
  };

  const getTotalAmount = () => {
    return bookings.reduce(
      (total, booking) => total + (Number(booking.totalPrice) || 0),
      0
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary_green mx-auto"></div>
          <p className="mt-4 text-desc_gray">Loading booking details...</p>
        </div>
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-600">No booking details found</p>
          <button
            onClick={() => router.push("/")}
            className="mt-4 px-6 py-2 bg-primary_green text-white rounded-lg hover:bg-primary_green/90"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div ref={confirmationRef}>
          {/* Success Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-accent"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Bookings Confirmed!
            </h1>
            <p className="text-gray-600">
              {bookings.length} booking{bookings.length > 1 ? "s have" : " has"}{" "}
              been successfully booked
            </p>
          </div>

          {/* Booking Summary */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Booking Summary
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-primary_green">
                  {bookings.length}
                </p>
                <p className="text-sm text-gray-600">Total Bookings</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-primary_green">
                  {bookings.reduce((total, b) => {
                    if (b.isVehicleBooking) {
                      return total + 1; // Count vehicles as 1 unit
                    }
                    return total + b.adults + b.children;
                  }, 0)}
                </p>
                <p className="text-sm text-gray-600">
                  {bookings.some((b) => b.isVehicleBooking)
                    ? "Guests/Vehicles"
                    : "Total Guests"}
                </p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-primary_green">
                  RM {getTotalAmount().toFixed(2)}
                </p>
                <p className="text-sm text-gray-600">Total Amount</p>
              </div>
            </div>
          </div>

          {/* Individual Bookings */}
          <div className="space-y-6">
            {bookings.map((booking, index) => (
              <div
                key={booking._id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
              >
                <div className="bg-primary_green text-white px-6 py-3">
                  <h3 className="font-semibold">
                    Booking #{index + 1} - {booking.packageTitle}
                  </h3>
                  <p className="text-sm opacity-90">
                    Booking ID: {booking._id}
                  </p>
                </div>

                <div className="p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Booking Details */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <Calendar className="text-primary_green" />
                        <span className="font-medium">
                          {formatDate(booking.selectedDate)}
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <Clock className="text-primary_green" />
                        <span className="font-medium">
                          {formatTime(booking.selectedTime)}
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <Users className="text-primary_green" />
                        <span className="font-medium">
                          {booking.isVehicleBooking ? (
                            `Vehicle - ${
                              booking.vehicleSeatCapacity || "N/A"
                            } seats`
                          ) : (
                            <>
                              {booking.adults} adult
                              {booking.adults > 1 ? "s" : ""}
                              {booking.children > 0 &&
                                `, ${booking.children} child${
                                  booking.children > 1 ? "ren" : ""
                                }`}
                            </>
                          )}
                        </span>
                      </div>

                      <div className="flex items-start gap-3">
                        <MapPin className="text-primary_green mt-0.5" />
                        <span className="font-medium">
                          {stripHtmlTags(booking.pickupLocation || "")}
                        </span>
                      </div>

                      {/* Pickup Guidelines */}
                      {booking.pickupGuidelines && (
                        <div className="bg-accent/10 border border-accent/40 rounded-lg p-4 mt-4">
                          <h5 className="font-semibold text-accent-dark mb-2 flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            Pickup Guidelines:
                          </h5>
                          <div
                            className="text-accent text-sm leading-relaxed"
                            dangerouslySetInnerHTML={{
                              __html: booking.pickupGuidelines,
                            }}
                          />
                        </div>
                      )}
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-4">
                      <h4 className="font-semibold text-gray-900">
                        Contact Information
                      </h4>

                      <div className="flex items-center gap-3">
                        <Users className="text-primary_green" />
                        <span>{booking.contactInfo.name}</span>
                      </div>

                      <div className="flex items-center gap-3">
                        <Mail className="text-primary_green" />
                        <span>{booking.contactInfo.email}</span>
                      </div>

                      <div className="flex items-center gap-3">
                        <Phone className="text-primary_green" />
                        <span>{booking.contactInfo.phone}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold">
                        Total Amount:
                      </span>
                      <span className="text-2xl font-bold text-primary_green">
                        RM {Number(booking.totalPrice || 0).toFixed(2)}
                      </span>
                      <p className="text-xs text-gray-600">Paid online</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Contact Information Notice */}
          <div className="mt-8 bg-yellow-50 border-l-4 border-yellow-400 rounded-lg p-6">
            <h3 className="font-semibold text-yellow-800 mb-2">
              Important Information
            </h3>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>
                • Be ready at your hotel’s main gate 5 minutes before pick-up.
              </li>
              <li>
                • No child seats are available. Children must always be with an
                adult.
              </li>
              <li>• Pick-up times and locations may vary for each booking.</li>
              <li>
                • Cancellation Policy:
                <ul className="list-disc list-inside ml-5 text-yellow-700 space-y-1 mt-1">
                  <li>
                    • Cancel at least 72 hours in advance for a full refund.
                  </li>
                  <li>
                    • No refund, cancellation, or date change within 72 hours.
                  </li>
                </ul>
              </li>
              <li>
                • Carry cash for entrance fees, as most entry points at the
                destination do not accept cards.
              </li>
              <li>
                • Luggage upto 20kg is allowed per person for transfers. But for
                tours luggage and large backpacks cannot be brought.
              </li>
              <li>• Views depend on the weather and cannot be guaranteed.</li>
            </ul>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 text-center">
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={downloadPDF}
              disabled={isGeneratingPDF}
              className="px-8 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGeneratingPDF ? "Generating PDF..." : "Download PDF"}
            </button>
            <button
              onClick={() => router.push("/recommendations")}
              className="px-8 py-3 bg-primary_green text-white rounded-lg hover:bg-primary_green/90 transition-colors"
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
