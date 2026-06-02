"use client";

/**
 * CommercePay Payment Page
 * Handles payment initiation and callback
 */

import React, { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { commercePayApi } from "@/lib/commercepayApi";
import Toast from "@/components/ui/Toast";

interface ChannelItem {
  channelId?: string | number;
  id?: string | number;
  value?: string | number;
  providerChannelId?: string;
  providerChannelCode?: string;
  providerId?: string;
  displayName?: string;
  channelName?: string;
  name?: string;
  providerName?: string;
  providerChannelName?: string;
  [key: string]: any;
}

interface BookingData {
  bookingId?: string;
  packageId?: string;
  title?: string;
  packageName?: string;
  customerName?: string;
  customerEmail?: string;
  contactInfo?: {
    name: string;
    email: string;
    phone: string;
  };
  total?: number;
  totalPrice?: number;
  amount?: number;
  [key: string]: any;
}

type PaymentStatus =
  | "idle"
  | "loading"
  | "redirecting"
  | "processing"
  | "success"
  | "error";

export default function CommercePayPaymentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [status, setStatus] = useState<PaymentStatus>("idle");
  const [error, setError] = useState<string>("");
  const [bookingData, setBookingData] = useState<BookingData | null>(null);
  const [channels, setChannels] = useState<ChannelItem[]>([]);
  const [selectedChannelId, setSelectedChannelId] = useState<string>("");
  const [channelsLoading, setChannelsLoading] = useState<boolean>(false);
  const [channelsError, setChannelsError] = useState<string>("");
  const [toasts, setToasts] = useState<
    Array<{ id: string; message: string; type: "success" | "error" | "info" }>
  >([]);

  // Get booking data from URL params or session storage
  useEffect(() => {
    try {
      const bookingJson =
        searchParams?.get("booking") || sessionStorage.getItem("bookingData");

      if (!bookingJson) {
        setError("No booking data provided");
        setStatus("error");
        return;
      }

      const data = JSON.parse(bookingJson) as BookingData;

      const amountParam = searchParams?.get("amount");
      const parsedAmount = amountParam
        ? parseFloat(amountParam)
        : data.total || data.amount;

      // Validate booking data
      if (!parsedAmount || parsedAmount <= 0) {
        setError("Invalid booking data: Missing amount");
        setStatus("error");
        return;
      }

      data.amount = parsedAmount;
      setBookingData(data);
      sessionStorage.setItem("bookingData", bookingJson);
    } catch (err) {
      console.error("Error parsing booking data:", err);
      setError("Failed to load booking data");
      setStatus("error");
    }
  }, [searchParams]);

  useEffect(() => {
    const fetchChannels = async () => {
      if (!bookingData) return;

      setChannelsLoading(true);
      setChannelsError("");

      try {
        const response = await commercePayApi.getAvailableChannels("MY");

        if (!response.success) {
          throw new Error(
            response.message || "Failed to load payment channels",
          );
        }

        const list = Array.isArray(response.data) ? response.data : [];
        setChannels(list);

        if (list.length > 0) {
          const first = list[0];
          const firstId = String(
            first?.channelId ?? first?.id ?? first?.value ?? "",
          ).trim();
          setSelectedChannelId(firstId);
        }
      } catch (err) {
        const msg =
          err instanceof Error ? err.message : "Unable to load channels";
        setChannelsError(msg);
      } finally {
        setChannelsLoading(false);
      }
    };

    fetchChannels();
  }, [bookingData]);

  // Add toast notification
  const addToast = useCallback(
    (message: string, type: "success" | "error" | "info" = "info") => {
      const id = Date.now().toString();
      setToasts((prev) => [...prev, { id, message, type }]);

      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 5000);
    },
    [],
  );

  // Initiate payment
  const initiatePayment = useCallback(async () => {
    if (!bookingData) {
      setError("No booking data available");
      return;
    }

    try {
      setStatus("loading");
      setError("");

      // For CommercePay, DO NOT create the booking yet
      // The booking will be created only after successful payment via webhook/callback
      // Generate a temporary reference code for the payment session
      const tempReferenceCode = `TEMP-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      // Create payment session WITHOUT a bookingId first
      // The payment session itself acts as the reservation holder
      const activeChannel = channels.find((channel) => {
        const channelCandidate = String(
          channel?.channelId ?? channel?.id ?? channel?.value ?? "",
        ).trim();
        return channelCandidate === selectedChannelId;
      });

      const rawChannelIdToSend = String(
        activeChannel?.channelId ??
          activeChannel?.id ??
          activeChannel?.value ??
          selectedChannelId ??
          "",
      ).trim();

      const parsedChannelId = Number(rawChannelIdToSend);
      const channelIdToSend = Number.isNaN(parsedChannelId)
        ? rawChannelIdToSend
        : parsedChannelId;

      const providerChannelIdToSend = String(
        activeChannel?.providerChannelId ??
          activeChannel?.providerChannelCode ??
          activeChannel?.providerId ??
          "",
      ).trim();

      const effectiveBookingData = {
        ...bookingData,
        packageType: bookingData.packageType || bookingData.type,
        packageId: bookingData.packageId || bookingData.id,
      };

      if (
        !effectiveBookingData.packageType ||
        !effectiveBookingData.packageId
      ) {
        throw new Error(
          "Booking data is incomplete. Please restart checkout and try again.",
        );
      }

      const response = await commercePayApi.createSession({
        ...effectiveBookingData,
        bookingId: tempReferenceCode,
        packageName:
          bookingData.title || bookingData.packageName || "Tour Booking",
        customerName:
          bookingData.contactInfo?.name ||
          bookingData.customerName ||
          "Customer",
        customerEmail:
          bookingData.contactInfo?.email || bookingData.customerEmail || "",
        amount: bookingData.amount || 0,
        currency: "MYR",
        ...(String(channelIdToSend ?? "").trim()
          ? { channelId: channelIdToSend }
          : {}),
        ...(providerChannelIdToSend
          ? { providerChannelId: providerChannelIdToSend }
          : {}),
      });

      if (!response.success) {
        throw new Error(response.message || "Failed to create payment session");
      }

      if (!response.data?.redirectUrl) {
        throw new Error("No redirect URL received");
      }

      // Store reference code for callback
      sessionStorage.setItem(
        "paymentReferenceCode",
        response.data.referenceCode,
      );

      addToast("Redirecting to payment gateway...", "info");
      setStatus("redirecting");

      // Redirect to CommercePay
      setTimeout(() => {
        window.location.href = response.data!.redirectUrl;
      }, 500);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to initiate payment";
      console.error("Payment initiation error:", err);
      setError(errorMessage);
      addToast(errorMessage, "error");
      setStatus("error");
    }
  }, [bookingData, channels, selectedChannelId, addToast]);

  // Handle page load - if payment callback is detected, process it
  useEffect(() => {
    const processCallback = async () => {
      const reference = searchParams?.get("reference");
      const transactionNumber = searchParams?.get("transactionNumber");

      if (!reference) return;

      try {
        setStatus("processing");

        // Handle callback
        const callbackResponse = await commercePayApi.handleCallback(
          transactionNumber || "",
          reference,
        );

        // Poll for status to ensure it's processed
        const statusResponse = await commercePayApi.pollStatus(
          reference,
          10,
          2000,
        );

        if (statusResponse.data?.status === "succeeded") {
          setStatus("success");
          addToast("Payment successful! Your booking is confirmed.", "success");

          // Redirect to confirmation page
          setTimeout(() => {
            router.push(`/booking-confirmation?reference=${reference}`);
          }, 2000);
        } else if (statusResponse.data?.status === "failed") {
          setError(
            "Payment declined. Please try again or use a different payment method.",
          );
          addToast("Payment failed", "error");
          setStatus("error");
        } else {
          setError(
            "Payment status is pending. Please check your email for confirmation.",
          );
          setStatus("idle");
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to process payment";
        console.error("Payment processing error:", err);
        setError(errorMessage);
        addToast(errorMessage, "error");
        setStatus("error");
      }
    };

    processCallback();
  }, [searchParams, router, addToast]);

  // Render loading state
  if (!bookingData && status !== "error") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 mb-4 bg-blue-100 rounded-full">
            <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          </div>
          <p className="text-gray-600">Loading payment information...</p>
        </div>
      </div>
    );
  }

  // Render error state
  if (status === "error" && !bookingData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
          <div className="mb-4">
            <div className="flex items-center justify-center w-16 h-16 mx-auto bg-red-100 rounded-full">
              <svg
                className="w-8 h-8 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
          </div>
          <h2 className="text-xl font-semibold text-center text-gray-900 mb-2">
            Payment Error
          </h2>
          <p className="text-center text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => router.back()}
            className="w-full px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Render processing state
  if (status === "processing" || status === "redirecting") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 mb-4 bg-blue-100 rounded-full">
            <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {status === "redirecting"
              ? "Redirecting to Payment Gateway"
              : "Processing Payment"}
          </h2>
          <p className="text-gray-600">Please wait...</p>
        </div>
      </div>
    );
  }

  // Render success state
  if (status === "success") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
          <div className="mb-4">
            <div className="flex items-center justify-center w-16 h-16 mx-auto bg-green-100 rounded-full">
              <svg
                className="w-8 h-8 text-green-600"
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
          <h2 className="text-xl font-semibold text-center text-gray-900 mb-2">
            Payment Successful
          </h2>
          <p className="text-center text-gray-600 mb-4">
            Your booking has been confirmed. Redirecting...
          </p>
        </div>
      </div>
    );
  }

  // Render payment initiation form
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Complete Payment</h1>
          <p className="text-gray-600 mt-2">
            Secure payment powered by CommercePay
          </p>
        </div>

        {/* Booking Summary */}
        {bookingData && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="mb-2">
              <p className="text-sm text-gray-600">Package</p>
              <p className="text-lg font-semibold text-gray-900">
                {bookingData.title || bookingData.packageName}
              </p>
            </div>
            <div className="mb-2">
              <p className="text-sm text-gray-600">Customer</p>
              <p className="text-lg font-semibold text-gray-900">
                {bookingData.contactInfo?.name || bookingData.customerName}
              </p>
            </div>
            <div className="border-t border-gray-200 pt-2">
              <p className="text-sm text-gray-600">Total Amount</p>
              <p className="text-2xl font-bold text-blue-600">
                {commercePayApi.formatAmount(bookingData.amount || 0)}
              </p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Channel Selection */}
        <div className="mb-4 p-3 bg-white border border-gray-200 rounded-lg">
          <p className="text-sm font-semibold text-gray-900 mb-2">
            Payment Channel
          </p>

          {channelsLoading && (
            <p className="text-sm text-gray-500">
              Loading available channels...
            </p>
          )}

          {channelsError && (
            <p className="text-sm text-amber-700">{channelsError}</p>
          )}

          {!channelsLoading && channels.length > 0 && (
            <div className="space-y-2">
              {channels.map((channel) => {
                const rawId = String(
                  channel?.channelId ?? channel?.id ?? channel?.value ?? "",
                ).trim();
                const channelLabel =
                  channel?.displayName ||
                  channel?.channelName ||
                  channel?.name ||
                  `Channel ${rawId}`;

                return (
                  <label
                    key={rawId}
                    className="flex items-center p-2 rounded border border-gray-200 hover:border-blue-300 cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="commercepay-channel"
                      value={rawId}
                      checked={selectedChannelId === rawId}
                      onChange={() => setSelectedChannelId(rawId)}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-800">
                      {channelLabel}
                    </span>
                  </label>
                );
              })}
            </div>
          )}
        </div>

        {/* Payment Button */}
        <button
          onClick={initiatePayment}
          disabled={
            (["loading", "redirecting"] as PaymentStatus[]).includes(status) ||
            channelsLoading
          }
          className={`w-full py-3 px-4 rounded-lg font-semibold transition mb-3 ${
            (["loading", "redirecting"] as PaymentStatus[]).includes(status) ||
            channelsLoading
              ? "bg-gray-400 text-white cursor-not-allowed"
              : "bg-blue-600 text-white hover:bg-blue-700"
          }`}
        >
          {(["loading", "redirecting"] as PaymentStatus[]).includes(status) ||
          channelsLoading ? (
            <span className="flex items-center justify-center">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              {channelsLoading ? "Loading channels..." : "Processing..."}
            </span>
          ) : (
            "Proceed to Payment"
          )}
        </button>

        {/* Cancel Button */}
        <button
          onClick={() => router.back()}
          disabled={(["loading", "redirecting"] as PaymentStatus[]).includes(
            status,
          )}
          className="w-full py-2 px-4 rounded-lg font-semibold border border-gray-300 text-gray-700 hover:bg-gray-50 transition disabled:opacity-50"
        >
          Cancel
        </button>

        {/* Security Info */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="flex items-start">
            <svg
              className="w-5 h-5 text-green-600 mr-2 mt-0.5 flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 111.414 1.414L7.414 8l3.293 3.293a1 1 0 01-1.414 1.414l-4-4z"
                clipRule="evenodd"
              />
            </svg>
            <p className="text-xs text-gray-600">
              Your payment information is secure and encrypted by CommercePay.
            </p>
          </div>
        </div>
      </div>

      {/* Toasts */}
      <div className="fixed bottom-4 right-4 space-y-2">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            type={toast.type}
            title={
              toast.type === "success"
                ? "Success"
                : toast.type === "error"
                  ? "Error"
                  : "Info"
            }
            message={toast.message}
            onClose={() =>
              setToasts((prev) => prev.filter((t) => t.id !== toast.id))
            }
          />
        ))}
      </div>
    </div>
  );
}
