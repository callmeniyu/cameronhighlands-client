"use client";

import { useState } from "react";
import {
  useStripe,
  useElements,
  PaymentElement,
} from "@stripe/react-stripe-js";
import Image from "next/image";

interface CheckoutFormProps {
  onSuccess: (paymentIntent: any) => void;
  onError: (error: any) => void;
  isCartBooking: boolean;
}

export default function CheckoutForm({
  onSuccess,
  onError,
  isCartBooking,
}: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false); // Prevent double-click

  const handleSubmit = async (event?: React.FormEvent) => {
    // If invoked as a submit handler, prevent the default browser submit.
    if (event && typeof event.preventDefault === "function") {
      event.preventDefault();
    }

    if (!stripe || !elements) {
      console.error("[CHECKOUT] Stripe not loaded");
      return;
    }

    // Prevent double-click/double-submit
    if (isProcessing || loading) {
      console.warn(
        "[CHECKOUT] Payment already in progress, ignoring duplicate submission",
      );
      return;
    }

    setIsProcessing(true);
    setLoading(true);
    setErrorMessage("");

    try {
      console.log("[CHECKOUT] Validating form...");

      // First, validate the form elements
      const { error: submitError } = await elements.submit();
      if (submitError) {
        console.error("[CHECKOUT] Form validation error:", submitError);
        setErrorMessage(
          submitError.message || "Please fill in all required fields",
        );
        setLoading(false);
        return;
      }

      console.log("[CHECKOUT] Processing payment...");

      // Confirm the payment
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        redirect: "if_required",
        confirmParams: {
          return_url: window.location.href,
        },
      });

      if (error) {
        console.error("[CHECKOUT] Payment failed:", error);
        setErrorMessage(error.message || "Payment failed");
        onError(error);
      } else if (paymentIntent) {
        console.log(
          "[CHECKOUT] Payment successful:",
          paymentIntent.id,
          paymentIntent.status,
        );

        if (paymentIntent.status === "succeeded") {
          onSuccess(paymentIntent);
        } else {
          console.error(
            "[CHECKOUT] Payment not successful:",
            paymentIntent.status,
          );
          const statusError = {
            message: `Payment status: ${paymentIntent.status}`,
            type: "card_error",
          };
          setErrorMessage(statusError.message);
          onError(statusError);
        }
      }
    } catch (err: any) {
      console.error("[CHECKOUT] Unexpected error:", err);
      const unexpectedError = {
        message: err.message || "An unexpected error occurred",
        type: "validation_error",
      };
      setErrorMessage(unexpectedError.message);
      onError(unexpectedError);
    } finally {
      setLoading(false);
      setIsProcessing(false); // Reset processing flag
    }
  };

  return (
    // Prevent implicit form submission (Enter key / automatic submits) by
    // blocking the default onSubmit. Validation will run only when the
    // explicit Pay Now button is clicked which calls handleSubmit.
    <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
      {/* Payment Element */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Payment Details
        </label>
        <div className="border rounded-md p-3">
          <PaymentElement
            options={{
              layout: "tabs",
            }}
          />
        </div>
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="text-red-800 text-sm">
            <strong>Payment Error:</strong> {errorMessage}
          </div>
        </div>
      )}

      {/* Payment Information */}
      <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
        <div className="text-blue-800 text-sm">
          <div className="flex items-start">
            <div className="text-blue-500 mr-2">🔒</div>
            <div>
              <p className="font-medium mb-1">Secure Payment</p>
              <p>
                Your payment information is encrypted and secure. We use Stripe
                for payment processing.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <button
        disabled={!stripe || loading || isProcessing}
        type="button"
        onClick={(e) => handleSubmit(e)}
        disabled={loading || !stripe || !elements}
        className={`w-full py-3 px-4 rounded-md font-semibold text-white transition-colors ${
          loading || !stripe || !elements
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-primary_green hover:bg-primary_green/90"
        }`}
      >
        {loading ? (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
            Processing Payment...
          </div>
        ) : (
          `Pay Now - Complete ${isCartBooking ? "Cart " : ""}Booking`
        )}
      </button>

      {/* Payment Methods Info */}
      <div className="text-center text-sm text-gray-500">
        <p className="mb-3">We accept all major credit and debit cards</p>
        <div className="flex justify-center space-x-4">
          {/* Visa */}
          <Image
            src="/images/footer_payment1.png"
            alt="Visa"
            width={40}
            height={24}
            className="h-12 w-16"
          />

          {/* Mastercard */}
          <Image
            src="/images/mastercard.png"
            alt="Visa"
            width={40}
            height={24}
            className="h-12 w-16"
          />

          {/* American Express */}
          <Image
            src="/images/American Express Card.png"
            alt="Visa"
            width={40}
            height={24}
            className="h-12 w-16"
          />

          {/* Discover */}
          <Image
            src="/images/footer_payment2.png"
            alt="Visa"
            width={40}
            height={24}
            className="h-12 w-16"
          />
        </div>
      </div>
    </form>
  );
}
