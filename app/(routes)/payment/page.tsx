"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import CheckoutForm from "@/components/ui/CheckoutForm";
import { useToast } from "@/context/ToastContext";
import { paymentApi } from "@/lib/paymentApi";
import { FiShield, FiArrowLeft } from "react-icons/fi";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

export default function PaymentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [bookingData, setBookingData] = useState<any>(null);
  const [isCartBooking, setIsCartBooking] = useState(false);
  const [clientSecret, setClientSecret] = useState<string>("");
  const [paymentIntentId, setPaymentIntentId] = useState<string>("");
  const [paymentIntentCreated, setPaymentIntentCreated] = useState(false);

  useEffect(() => {
    const validatePaymentData = async () => {
      try {
        console.log("[PAYMENT_PAGE] Validating payment data...");

        // Get payment data from URL params
        const bookingDataParam = searchParams.get("bookingData");
        const cartDataParam = searchParams.get("cartData");
        const contactInfoParam = searchParams.get("contactInfo");
        const amountParam = searchParams.get("amount");

        if (!amountParam) {
          throw new Error("Payment amount is missing");
        }

        if (cartDataParam && contactInfoParam) {
          // Cart booking flow
          console.log("[PAYMENT_PAGE] Processing cart booking payment");
          setIsCartBooking(true);

          const cartData = JSON.parse(decodeURIComponent(cartDataParam));
          const contactInfo = JSON.parse(decodeURIComponent(contactInfoParam));

          setBookingData({ cartData, contactInfo });
        } else if (bookingDataParam) {
          // Single booking flow
          console.log("[PAYMENT_PAGE] Processing single booking payment");
          setIsCartBooking(false);

          const bookingData = JSON.parse(decodeURIComponent(bookingDataParam));
          setBookingData(bookingData);
        } else {
          throw new Error("No booking data found");
        }

        setLoading(false);
      } catch (error: any) {
        console.error("[PAYMENT_PAGE] Error validating payment data:", error);
        setError(error.message);
        setLoading(false);
        showToast({
          type: "error",
          title: "Payment Error",
          message: error.message || "Invalid payment data",
        });
      }
    };

    validatePaymentData();
  }, [searchParams, showToast]);

  // Create payment intent when data is ready
  useEffect(() => {
    const createPaymentIntent = async () => {
      if (paymentIntentCreated || !bookingData || loading) return;

      try {
        setLoading(true);
        console.log("[PAYMENT_PAGE] Creating payment intent...");

        const amountParam = searchParams.get("amount");
        if (!amountParam) {
          throw new Error("Payment amount is missing");
        }

        const amount = parseFloat(amountParam);

        if (isCartBooking) {
          const response = await paymentApi.createCartPaymentIntent({
            amount,
            cartData: bookingData.cartData,
            contactInfo: bookingData.contactInfo,
          });

          if (response.success && response.data) {
            setClientSecret(response.data.clientSecret);
            setPaymentIntentId(response.data.paymentIntentId);
            setPaymentIntentCreated(true);
            console.log(
              "[PAYMENT_PAGE] Cart payment intent created:",
              response.data.paymentIntentId
            );
          } else {
            throw new Error(
              response.error || "Failed to create payment intent"
            );
          }
        } else {
          const response = await paymentApi.createPaymentIntent({
            amount,
            bookingData,
          });

          if (response.success && response.data) {
            setClientSecret(response.data.clientSecret);
            setPaymentIntentId(response.data.paymentIntentId);
            setPaymentIntentCreated(true);
            console.log(
              "[PAYMENT_PAGE] Payment intent created:",
              response.data.paymentIntentId
            );
          } else {
            throw new Error(
              response.error || "Failed to create payment intent"
            );
          }
        }
      } catch (error: any) {
        console.error("[PAYMENT_PAGE] Error creating payment intent:", error);
        setError(error.message);
        showToast({
          type: "error",
          title: "Payment Error",
          message: error.message || "Failed to initialize payment",
        });
      } finally {
        setLoading(false);
      }
    };

    if (bookingData && !paymentIntentCreated) {
      createPaymentIntent();
    }
  }, [
    bookingData,
    paymentIntentCreated,
    loading,
    isCartBooking,
    searchParams,
    showToast,
  ]);

  const handlePaymentSuccess = async (paymentIntent: any) => {
    try {
      console.log(
        "[PAYMENT_PAGE] Payment successful, confirming...",
        paymentIntent.id
      );

      // Confirm payment on server and create booking
      const response = await paymentApi.confirmPayment({
        paymentIntentId: paymentIntent.id,
        bookingData: bookingData,
      });

      if (response.success && response.data) {
        console.log(
          "[PAYMENT_PAGE] Booking created successfully:",
          response.data.bookingIds
        );

        showToast({
          type: "success",
          title: "Payment Successful!",
          message: isCartBooking
            ? `${response.data.totalBookings} bookings created successfully`
            : "Your booking has been confirmed",
        });

        // Redirect to confirmation page
        if (isCartBooking) {
          router.push(
            `/booking/cart-confirmation?bookings=${response.data.bookingIds.join(
              ","
            )}`
          );
        } else {
          router.push(`/booking/confirmation/${response.data.bookingIds[0]}`);
        }
      } else {
        throw new Error(
          response.error || "Failed to create booking after payment"
        );
      }
    } catch (error: any) {
      console.error("[PAYMENT_PAGE] Error after payment success:", error);

      showToast({
        type: "error",
        title: "Booking Error",
        message:
          "Payment was successful but booking creation failed. Please contact support.",
      });
    }
  };

  const handlePaymentError = (error: any) => {
    console.error("[PAYMENT_PAGE] Payment failed:", error);

    showToast({
      type: "error",
      title: "Payment Failed",
      message: error.message || "Payment was not successful",
    });
  };

  if (error) {
    return (
      <div className="min-h-screen bg-neutral-50 pt-24 pb-16 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <h2 className="text-xl font-semibold text-red-800 mb-2">
              Payment Error
            </h2>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={() => router.back()}
              className="px-6 py-2 bg-primary_green text-white rounded-lg hover:bg-primary_green/90"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loading || !clientSecret) {
    return (
      <div className="min-h-screen bg-neutral-50 pt-24 pb-16 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary_green mx-auto mb-4"></div>
          <p className="text-gray-600">Initializing secure payment...</p>
        </div>
      </div>
    );
  }

  const amountParam = searchParams.get("amount");
  const amount = amountParam ? parseFloat(amountParam) : 0;

  return (
    <div className="min-h-screen bg-neutral-50 pt-24 pb-16 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white border border-neutral-200 shadow-lg rounded-2xl p-6 md:p-8">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Secure Payment
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  Complete your {isCartBooking ? "cart" : ""} booking
                </p>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 rounded-full bg-green-50 text-xs text-green-700 border border-green-200">
                <FiShield className="text-green-600" /> Secure Checkout
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-start">
                <div className="text-2xl mr-3">💳</div>
                <div className="flex-1">
                  <p className="font-semibold text-blue-900 mb-1">
                    Total Amount
                  </p>
                  <p className="text-2xl font-bold text-blue-900">
                    RM {amount.toFixed(2)}
                  </p>
                  <p className="text-xs text-blue-700 mt-1">
                    Includes 2.8% payment processing fee
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Stripe Elements */}
          <Elements
            stripe={stripePromise}
            options={{
              clientSecret,
              appearance: {
                theme: "stripe",
                variables: {
                  colorPrimary: "#16a34a",
                },
              },
            }}
          >
            <CheckoutForm
              onSuccess={handlePaymentSuccess}
              onError={handlePaymentError}
              isCartBooking={isCartBooking}
            />
          </Elements>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <button
              onClick={() => router.back()}
              className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-2"
            >
              <FiArrowLeft /> Go Back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
