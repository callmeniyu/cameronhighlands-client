"use client";

/**
 * CommercePay Payment Callback Page
 * Handles return from CommercePay payment gateway
 */

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { commercePayApi } from "@/lib/commercepayApi";

type CallbackStatus = "loading" | "success" | "failed" | "pending" | "error";

export default function CommercePayCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [status, setStatus] = useState<CallbackStatus>("loading");
  const [message, setMessage] = useState("Processing your payment...");
  const [details, setDetails] = useState<Record<string, any>>({});
  const [error, setError] = useState("");

  // Process payment callback
  useEffect(() => {
    const processCallback = async () => {
      try {
        const reference =
          searchParams?.get("reference") ||
          searchParams?.get("referenceCode") ||
          searchParams?.get("reference_code") ||
          "";
        const transactionNumber =
          searchParams?.get("transactionNumber") ||
          searchParams?.get("transactionNo") ||
          searchParams?.get("transaction_number") ||
          searchParams?.get("txnNumber") ||
          searchParams?.get("txnRef") ||
          "";

        if (!reference) {
          setStatus("error");
          setError("No payment reference provided");
          return;
        }

        let callbackResponse = { success: true, message: "" } as any;

        if (transactionNumber) {
          // First, handle the callback with backend if transaction number is available
          callbackResponse = await commercePayApi.handleCallback(
            transactionNumber,
            reference,
          );

          if (!callbackResponse.success) {
            setStatus("error");
            setError(callbackResponse.message || "Failed to process callback");
            return;
          }
        } else {
          console.warn(
            "CommercePay callback returned no transactionNumber, falling back to status polling",
          );
        }

        // Poll for final status
        let finalStatus: CallbackStatus = "pending";
        let attempts = 0;
        const maxAttempts = 15; // 30 seconds with 2 second intervals

        while (attempts < maxAttempts) {
          const statusResponse = await commercePayApi.checkStatus(reference);

          if (statusResponse.success && statusResponse.data) {
            const paymentStatus = statusResponse.data.status;

            if (paymentStatus === "succeeded") {
              // ONLY NOW create the booking - after payment is confirmed succeeded
              const bookingData = sessionStorage.getItem("bookingData");
              if (bookingData) {
                try {
                  const bookingInfo = JSON.parse(bookingData);
                  const apiUrl =
                    process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
                  const bookingResponse = await fetch(
                    `${apiUrl}/api/bookings`,
                    {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        ...bookingInfo,
                        paymentInfo: {
                          amount:
                            bookingInfo.amount ||
                            bookingInfo.totalPrice ||
                            bookingInfo.total ||
                            0,
                          bankCharge: 0,
                          currency: "MYR",
                          paymentStatus: "succeeded", // Mark as succeeded after payment
                          paymentGateway: "commercepay",
                          commercePayReferenceCode: reference,
                          commercePayTransactionNumber: transactionNumber,
                        },
                      }),
                    },
                  );

                  const bookingResult = await bookingResponse.json();
                  if (!bookingResult.success) {
                    console.warn(
                      "Failed to create confirmed booking:",
                      bookingResult.error,
                    );
                    // Continue anyway since payment was successful
                  } else {
                    // Update reference context if booking provides it
                    console.log("Booking created successfully:", bookingResult);
                    if (bookingResult.data && bookingResult.data._id) {
                      sessionStorage.setItem(
                        "lastBookingId",
                        bookingResult.data._id,
                      );
                    }
                  }
                } catch (err) {
                  console.error("Error creating booking after payment:", err);
                  // Continue anyway since payment was successful
                }
              }

              finalStatus = "success";
              setDetails(statusResponse.data);
              break;
            } else if (paymentStatus === "failed") {
              finalStatus = "failed";
              setDetails(statusResponse.data);
              break;
            }
          }

          attempts++;
          if (attempts < maxAttempts) {
            await new Promise((resolve) => setTimeout(resolve, 2000));
          }
        }

        setStatus(finalStatus);

        switch (finalStatus) {
          case "success":
            setMessage("Payment Successful!");
            // Redirect to booking confirmation after 2 seconds
            setTimeout(() => {
              const lastBookingId = sessionStorage.getItem("lastBookingId");
              if (lastBookingId) {
                router.push(`/booking/confirmation/${lastBookingId}`);
              } else {
                // fallback if id wasn't captured but payment was successful
                router.push(`/bookings`);
              }
            }, 2000);
            break;

          case "failed":
            setMessage("Payment Failed");
            setError(
              "Your payment was declined or cancelled. Please try again.",
            );
            break;

          case "pending":
            setMessage("Payment Pending");
            setError(
              "Your payment is being processed. Please check your email for confirmation.",
            );
            break;

          default:
            setStatus("error");
            setMessage("Payment Status Unknown");
            setError(
              "We could not determine the payment status. Please contact support.",
            );
        }
      } catch (err) {
        console.error("Callback processing error:", err);
        setStatus("error");
        setMessage("Error Processing Payment");
        setError(
          err instanceof Error
            ? err.message
            : "An error occurred while processing your payment",
        );
      }
    };

    processCallback();
  }, [searchParams, router]);

  // Render loading state
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 mb-4 bg-blue-100 rounded-full">
            <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Processing Payment
          </h2>
          <p className="text-gray-600">
            Please wait while we confirm your payment...
          </p>
        </div>
      </div>
    );
  }

  // Render success state
  if (status === "success") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-50 py-12 px-4">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 mb-4 bg-green-100 rounded-full">
            <svg
              className="w-8 h-8 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-3">
            Payment Successful!
          </h2>
          <div className="flex items-center justify-center space-x-2 text-gray-600 mb-2">
            <div className="w-5 h-5 border-2 border-green-200 border-t-green-600 rounded-full animate-spin"></div>
            <span>Generating your confirmation ticket...</span>
          </div>
          <p className="text-sm text-gray-500">
            Please wait while we redirect you.
          </p>
        </div>
      </div>
    );
  }

  // Render failed state
  if (status === "failed") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50 py-12 px-4">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
          {/* Error Icon */}
          <div className="flex justify-center mb-6">
            <div className="flex items-center justify-center w-20 h-20 bg-red-100 rounded-full">
              <svg
                className="w-10 h-10 text-red-600"
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

          {/* Message */}
          <h1 className="text-2xl font-bold text-center text-gray-900 mb-2">
            Payment Failed
          </h1>
          <p className="text-center text-gray-600 mb-4">{error}</p>

          {/* Suggestions */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-yellow-900 mb-2">
              What you can do:
            </h3>
            <ul className="text-sm text-yellow-800 space-y-1">
              <li>• Check your card/account for sufficient funds</li>
              <li>• Try a different payment method</li>
              <li>• Contact your bank if the problem persists</li>
            </ul>
          </div>

          {/* Buttons */}
          <div className="space-y-3">
            <button
              onClick={() => router.back()}
              className="w-full py-3 px-4 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition"
            >
              Try Again
            </button>
            <button
              onClick={() => router.push("/bookings")}
              className="w-full py-3 px-4 bg-gray-100 text-gray-900 rounded-lg font-semibold hover:bg-gray-200 transition"
            >
              Go to Bookings
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Render pending state
  if (status === "pending") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-50 to-orange-50 py-12 px-4">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
          {/* Pending Icon */}
          <div className="flex justify-center mb-6">
            <div className="flex items-center justify-center w-20 h-20 bg-yellow-100 rounded-full">
              <svg
                className="w-10 h-10 text-yellow-600 animate-spin"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
          </div>

          {/* Message */}
          <h1 className="text-2xl font-bold text-center text-gray-900 mb-2">
            Payment Pending
          </h1>
          <p className="text-center text-gray-600 mb-4">{error}</p>

          {/* Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-700 mb-3">
              We're still processing your payment. You can:
            </p>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Check your email for updates</li>
              <li>• Wait for confirmation (may take a few minutes)</li>
              <li>• Contact support if you have concerns</li>
            </ul>
          </div>

          {/* Buttons */}
          <div className="space-y-3">
            <button
              onClick={() => router.push("/bookings")}
              className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              Go to Bookings
            </button>
            <button
              onClick={() => router.push("/contact")}
              className="w-full py-3 px-4 bg-gray-100 text-gray-900 rounded-lg font-semibold hover:bg-gray-200 transition"
            >
              Contact Support
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Render error state
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-pink-50 py-12 px-4">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
        {/* Error Icon */}
        <div className="flex justify-center mb-6">
          <div className="flex items-center justify-center w-20 h-20 bg-red-100 rounded-full">
            <svg
              className="w-10 h-10 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4v2m0-6a4 4 0 00-4 4v2a2 2 0 01-2 2H6a4 4 0 004-4v-2a2 2 0 012-2h.01a2 2 0 012 2v2a4 4 0 004-4z"
              />
            </svg>
          </div>
        </div>

        {/* Message */}
        <h1 className="text-2xl font-bold text-center text-gray-900 mb-2">
          Error
        </h1>
        <p className="text-center text-gray-600 mb-4">{error || message}</p>

        {/* Support Info */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-gray-700">
            If you need help, please contact our support team with your booking
            reference.
          </p>
        </div>

        {/* Buttons */}
        <div className="space-y-3">
          <button
            onClick={() => router.back()}
            className="w-full py-3 px-4 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition"
          >
            Try Again
          </button>
          <button
            onClick={() => router.push("/")}
            className="w-full py-3 px-4 bg-gray-100 text-gray-900 rounded-lg font-semibold hover:bg-gray-200 transition"
          >
            Go Home
          </button>
        </div>
      </div>
    </div>
  );
}
