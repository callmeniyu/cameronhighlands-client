"use client";

/**
 * CommercePay Payment Page
 * Direct integration checkout that displays channel selection and embeds the payment experience.
 */

import React, { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { commercePayApi } from "@/lib/commercepayApi";
import Toast from "@/components/ui/Toast";

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

interface CommercePayChannel {
  id: number;
  name?: string;
  type?: number;
  isProviderHostChannel?: boolean;
  acceptedCurrencyCode?: string;
  currencies?: Array<{ acceptedCurrencyCode?: string }>;
  imageUrl?: string;
  groupName?: string;
  [key: string]: any;
}

type PaymentStatus =
  | "idle"
  | "loading"
  | "embedded"
  | "iframe"
  | "processing"
  | "success"
  | "error";

export default function CommercePayPaymentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [status, setStatus] = useState<PaymentStatus>("idle");
  const [error, setError] = useState<string>("");
  const [bookingData, setBookingData] = useState<BookingData | null>(null);
  const [channels, setChannels] = useState<CommercePayChannel[]>([]);
  const [selectedChannelId, setSelectedChannelId] = useState<number | null>(
    null,
  );
  const [embeddedScript, setEmbeddedScript] = useState<string>("");
  const [iframeUrl, setIframeUrl] = useState<string>("");
  const [loadingChannels, setLoadingChannels] = useState<boolean>(true);
  const [channelError, setChannelError] = useState<string>("");
  const [toasts, setToasts] = useState<
    Array<{ id: string; message: string; type: "success" | "error" | "info" }>
  >([]);

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
    if (!bookingData) {
      return;
    }

    const loadChannels = async () => {
      setLoadingChannels(true);
      setChannelError("");

      try {
        const response = await commercePayApi.getChannels("MY");
        if (!response.success) {
          throw new Error(response.message || "Failed to load channels");
        }

        const channelList = Array.isArray(response.data)
          ? response.data
          : (response.data as any)?.result || [];

        setChannels(channelList);
        if (channelList.length === 1) {
          setSelectedChannelId(channelList[0].id);
        }
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "Unable to load payment channels";
        console.error("CommercePay channels error:", err);
        setChannelError(message);
        addToast(message, "error");
      } finally {
        setLoadingChannels(false);
      }
    };

    loadChannels();
  }, [bookingData]);

  useEffect(() => {
    if (!embeddedScript) {
      return;
    }

    const container = document.getElementById("commercepay-embed-container");
    if (!container) {
      return;
    }

    container.innerHTML = embeddedScript;

    const scripts = Array.from(container.querySelectorAll("script"));
    scripts.forEach((oldScript) => {
      const newScript = document.createElement("script");
      Array.from(oldScript.attributes).forEach((attr) =>
        newScript.setAttribute(attr.name, attr.value),
      );
      newScript.text = oldScript.textContent || "";
      oldScript.replaceWith(newScript);
    });
  }, [embeddedScript]);

  const addToast = useCallback(
    (message: string, type: "success" | "error" | "info" = "info") => {
      const id = Date.now().toString();
      setToasts((prev) => [...prev, { id, message, type }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
      }, 5000);
    },
    [],
  );

  const initiatePayment = useCallback(async () => {
    if (!bookingData) {
      setError("No booking data available");
      return;
    }

    if (channels.length > 0 && selectedChannelId === null) {
      setError("Please select a payment method before continuing.");
      return;
    }

    try {
      setStatus("loading");
      setError("");

      const response = await commercePayApi.createSession({
        ...bookingData,
        bookingId:
          bookingData.bookingId ||
          `TEMP-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
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
        ...(selectedChannelId !== null ? { channelId: selectedChannelId } : {}),
      });

      if (!response.success) {
        throw new Error(response.message || "Failed to create payment session");
      }

      const payload = response.data;
      if (!payload) {
        throw new Error("Invalid payment session response");
      }

      sessionStorage.setItem("paymentReferenceCode", payload.referenceCode);

      if (payload.clientScript) {
        setEmbeddedScript(payload.clientScript);
        setStatus("embedded");
        addToast("Payment checkout has loaded inside the page.", "info");
        return;
      }

      if (payload.redirectUrl) {
        const popup = window.open(payload.redirectUrl, "_blank");
        if (!popup) {
          throw new Error(
            "Unable to open payment page. Please allow popups and try again.",
          );
        }
        setStatus("processing");
        addToast(
          "Payment checkout opened in a new tab. Complete the payment there.",
          "info",
        );
        return;
      }

      throw new Error(
        "CommercePay did not return usable payment instructions.",
      );
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to initiate payment";
      console.error("Payment initiation error:", err);
      setError(errorMessage);
      addToast(errorMessage, "error");
      setStatus("error");
    }
  }, [bookingData, channels.length, selectedChannelId, addToast]);

  if (!bookingData && status !== "error") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 mb-4 bg-blue-100 rounded-full">
            <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
          </div>
          <p className="text-gray-600">Loading payment information...</p>
        </div>
      </div>
    );
  }

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

  if (status === "processing" || status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 mb-4 bg-blue-100 rounded-full">
            <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {status === "loading" ? "Preparing checkout" : "Processing payment"}
          </h2>
          <p className="text-gray-600">
            Please wait while we load the payment experience.
          </p>
        </div>
      </div>
    );
  }

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

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Complete Payment</h1>
          <p className="text-gray-600 mt-2">
            Secure checkout powered by CommercePay direct integration.
          </p>
        </div>

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
                RM {(bookingData.amount || 0).toFixed(2)}
              </p>
            </div>
          </div>
        )}

        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Choose Payment Method
              </h2>
              <p className="text-sm text-gray-600">
                Select a CommercePay channel and continue without leaving the
                site.
              </p>
            </div>
          </div>

          {channelError && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 text-yellow-700 rounded-lg">
              {channelError}
            </div>
          )}

          {loadingChannels ? (
            <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-6 text-center">
              <p className="text-gray-700">
                Loading available payment channels...
              </p>
            </div>
          ) : channels.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {channels.map((channel) => (
                <button
                  key={channel.id}
                  type="button"
                  onClick={() => setSelectedChannelId(channel.id)}
                  className={`rounded-xl border p-4 text-left transition hover:border-blue-500 ${
                    selectedChannelId === channel.id
                      ? "border-blue-600 bg-blue-50"
                      : "border-gray-200 bg-white"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-gray-900">
                      {channel.name || `Channel ${channel.id}`}
                    </span>
                    {selectedChannelId === channel.id && (
                      <span className="text-xs text-blue-600">Selected</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">
                    {channel.acceptedCurrencyCode ||
                      channel.currencies?.[0]?.acceptedCurrencyCode ||
                      "MYR"}
                    {channel.isProviderHostChannel
                      ? " · Provider-hosted channel"
                      : ""}
                  </p>
                </button>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-6 text-center">
              <p className="text-sm text-gray-700">
                No payment channels were returned by CommercePay. The checkout
                will continue with the default request flow.
              </p>
            </div>
          )}
        </div>

        {error && status !== "error" && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <div className="grid gap-3">
          <button
            onClick={initiatePayment}
            disabled={status === "loading" || status === "redirecting"}
            className={`w-full py-3 px-4 rounded-lg font-semibold transition ${
              status === "loading" || status === "redirecting"
                ? "bg-gray-400 text-white cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            {status === "loading" || status === "redirecting" ? (
              <span className="flex items-center justify-center">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Processing...
              </span>
            ) : (
              "Proceed to Payment"
            )}
          </button>
          <button
            onClick={() => router.back()}
            disabled={status === "loading" || status === "redirecting"}
            className="w-full py-3 px-4 rounded-lg font-semibold border border-gray-300 text-gray-700 hover:bg-gray-50 transition disabled:opacity-50"
          >
            Cancel
          </button>
        </div>

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
              Your payment flow is securely routed by CommercePay through our
              checkout interface.
            </p>
          </div>
        </div>

        {(status === "embedded" || status === "iframe") && (
          <div className="mt-8 p-4 bg-gray-50 rounded-xl border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Payment Checkout
            </h3>
            {status === "embedded" ? (
              <div id="commercepay-embed-container" className="min-h-[400px]" />
            ) : (
              <iframe
                title="CommercePay Checkout"
                src={iframeUrl}
                className="w-full min-h-[700px] rounded-xl border border-gray-200"
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-top-navigation allow-top-navigation-by-user-activation"
              />
            )}
            <p className="mt-3 text-sm text-gray-600">
              If the embedded checkout doesn’t appear, try refreshing or
              selecting a different channel.
            </p>
          </div>
        )}
      </div>

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
