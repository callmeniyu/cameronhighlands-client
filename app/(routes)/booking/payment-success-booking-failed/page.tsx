"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function PaymentSuccessBookingFailedPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [paymentId, setPaymentId] = useState("");

  useEffect(() => {
    const id = searchParams.get("paymentId");
    if (id) {
      setPaymentId(id);
    }
  }, [searchParams]);

  const handleContactSupport = () => {
    window.location.href =
      "mailto:support@oastel.com?subject=Booking Issue - Payment Processed&body=Payment ID: " +
      paymentId;
  };

  const handleGoHome = () => {
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          {/* Warning Icon */}
          <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-yellow-100 mb-6">
            <svg
              className="h-8 w-8 text-yellow-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>

          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Payment Successful, Booking Issue
          </h2>

          <p className="text-gray-600 mb-6">
            Your payment was processed successfully, but there was an issue
            creating your booking.
          </p>

          <div className="space-y-4">
            <div className="text-left bg-accent/10 border border-accent/40 rounded-md p-4">
              <h3 className="font-medium text-accent-dark mb-2">
                ✅ Payment Status
              </h3>
              <ul className="text-sm text-accent space-y-1">
                <li>• Your payment was successfully processed</li>
                <li>• Your card has been charged</li>
                {paymentId && <li>• Payment ID: {paymentId}</li>}
              </ul>
            </div>

            <div className="text-left bg-red-50 border border-red-200 rounded-md p-4">
              <h3 className="font-medium text-red-800 mb-2">
                ❌ Booking Status
              </h3>
              <ul className="text-sm text-red-700 space-y-1">
                <li>• Your booking could not be created automatically</li>
                <li>• This is a technical issue on our end</li>
                <li>• We will resolve this immediately</li>
              </ul>
            </div>

            <div className="text-left bg-blue-50 border border-blue-200 rounded-md p-4">
              <h3 className="font-medium text-blue-800 mb-2">🚀 Next Steps</h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Our support team has been automatically notified</li>
                <li>• We will create your booking manually within 1 hour</li>
                <li>• You will receive a confirmation email shortly</li>
                <li>• Contact us if you don't hear back within 2 hours</li>
              </ul>
            </div>
          </div>

          <div className="space-y-3 pt-6">
            <button
              onClick={handleContactSupport}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary_green hover:bg-primary_green/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary_green transition-colors"
            >
              Contact Support Now
            </button>

            <button
              onClick={handleGoHome}
              className="w-full flex justify-center py-3 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary_green transition-colors"
            >
              Return to Home
            </button>
          </div>

          <div className="pt-6 border-t border-gray-200">
            <div className="bg-gray-100 rounded-md p-4">
              <p className="text-xs text-gray-600 mb-2">
                <strong>Important:</strong> Please keep this information for
                your records:
              </p>
              {paymentId && (
                <p className="text-xs text-gray-600 font-mono bg-white p-2 rounded border">
                  Payment ID: {paymentId}
                </p>
              )}
            </div>
          </div>

          <div className="pt-4">
            <p className="text-xs text-gray-500">
              Questions? Email us at{" "}
              <a
                href="mailto:support@oastel.com"
                className="text-primary_green hover:underline"
              >
                support@oastel.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
