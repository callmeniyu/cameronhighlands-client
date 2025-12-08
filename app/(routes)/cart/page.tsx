"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useToast } from "@/context/ToastContext";
import { useCart } from "@/context/CartContext";
import {
  slotValidationApi,
  SlotValidationResult,
} from "@/lib/slotValidationApi";
import Confirmation from "@/components/ui/Confirmation";
import Loader from "@/components/ui/Loader";
import {
  FiShoppingCart,
  FiClock,
  FiCalendar,
  FiUser,
  FiMapPin,
  FiAlertTriangle,
  FiCheckCircle,
  FiCreditCard,
  FiPackage,
  FiTrash2,
  FiX,
  FiRefreshCw,
} from "react-icons/fi";
import { FaRoute, FaCar } from "react-icons/fa";
import Image from "next/image";

// --- Types ---
type PackageDetails = {
  name?: string;
  images?: string[];
  image?: string;
  title?: string;
  price?: number;
  slug?: string;
  duration?: string;
  from?: string;
  to?: string;
};

type PickupLocation = string | { name?: string; address?: string };

type CartItem = {
  _id: string;
  packageId?: string;
  packageType: string;
  packageDetails?: PackageDetails;
  bookingDate?: string;
  selectedDate?: string;
  timeSlot?: string;
  guests?: number;
  pickupLocation?: PickupLocation;
  totalPrice: number;
};

type ItemValidation = SlotValidationResult;

export default function CartPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { showToast } = useToast();
  const { cart, loading, removeFromCart, clearCart } = useCart();

  const [processing, setProcessing] = useState(false);
  const [itemValidations, setItemValidations] = useState<
    Record<string, ItemValidation>
  >({});
  const [validatingItems, setValidatingItems] = useState(false);
  const [showRemoveConfirm, setShowRemoveConfirm] = useState<string | null>(
    null
  );

  // Utility function to strip HTML tags from text
  const stripHtmlTags = (html: string): string => {
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = html;
    return tempDiv.textContent || tempDiv.innerText || "";
  };

  useEffect(() => {
    if (status === "loading") return;

    if (status === "unauthenticated" || !session?.user?.email) {
      router.push("/auth");
      return;
    }
  }, [session, status, router]);

  // Validate cart items on load
  useEffect(() => {
    if (cart && cart.items.length > 0) {
      validateCartItems();
    }
  }, [cart]);

  const validateCartItems = async () => {
    if (!cart || cart.items.length === 0) return;

    setValidatingItems(true);

    try {
      // Use the real API to validate all cart items at once
      const validations = await slotValidationApi.validateCartItems(cart.items);
      setItemValidations(validations);
    } catch (error) {
      console.error("Error validating cart items:", error);
      showToast({
        type: "error",
        title: "Validation Error",
        message:
          "Failed to validate cart items. Some items may show as unavailable.",
      });
    } finally {
      setValidatingItems(false);
    }
  };

  const validateCartItem = async (item: CartItem): Promise<ItemValidation> => {
    // Try to get packageId from multiple possible sources
    const packageId = (item as any).packageId || item.packageDetails?.slug;
    const selectedDate =
      (item as any).selectedDate || (item as any).bookingDate;
    const time = (item as any).selectedTime || (item as any).timeSlot || "";
    const adults = (item as any).adults || 0;
    const children = (item as any).children || 0;
    const guests = adults + children;

    if (!packageId || !selectedDate || !time) {
      return {
        isValid: false,
        isExpired: false,
        isFull: false,
        message: "Missing booking information",
      };
    }

    // Ensure date is in correct format (YYYY-MM-DD)
    let formattedDate = selectedDate;
    if (selectedDate.includes("T")) {
      // If it's an ISO string, extract just the date part
      formattedDate = selectedDate.split("T")[0];
    }

    console.log("Cart validation debug:", {
      packageId,
      packageType: item.packageType,
      originalDate: selectedDate,
      formattedDate,
      time,
      guests,
    });

    // Only check slot availability, do not apply 10-hour cutoff here
    return await slotValidationApi.validateSlot(
      item.packageType as "tour" | "transfer",
      packageId,
      formattedDate,
      time,
      guests
    );
  };

  const checkSlotAvailability = async (item: CartItem): Promise<boolean> => {
    const validation = await validateCartItem(item);
    return validation.isValid;
  };

  const formatTime = (timeString: string): string => {
    if (!timeString) return "-";

    try {
      const [hours, minutes] = timeString.split(":");
      const date = new Date();
      date.setHours(parseInt(hours), parseInt(minutes), 0, 0);

      return date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    } catch {
      return timeString;
    }
  };

  const formatDate = (dateString: string): string => {
    if (!dateString) return "-";

    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    setShowRemoveConfirm(itemId);
  };

  const confirmRemoveItem = async (itemId: string) => {
    try {
      await removeFromCart(itemId);
      // Remove validation for this item
      setItemValidations((prev) => {
        const newValidations = { ...prev };
        delete newValidations[itemId];
        return newValidations;
      });
      setShowRemoveConfirm(null);
    } catch (error) {
      console.error("Error removing item:", error);
      showToast({
        type: "error",
        title: "Error",
        message: "Failed to remove item. Please try again.",
      });
    }
  };

  const handleProceedToBooking = async () => {
    try {
      setProcessing(true);

      if (!cart || cart.items.length === 0) {
        showToast({
          type: "error",
          title: "Error",
          message: "Your cart is empty",
        });
        return;
      }

      if (validItems.length === 0) {
        showToast({
          type: "error",
          title: "No Valid Items",
          message:
            "There are no valid items in your cart. Please remove expired or unavailable items and try again.",
        });
        return;
      }

      // Navigate to user-info page with cart booking context
      router.push("/user-info?from=cart");
    } catch (error: any) {
      console.error("Error proceeding to booking:", error);
      showToast({
        type: "error",
        title: "Error",
        message: error.message || "Failed to proceed to booking",
      });
    } finally {
      setProcessing(false);
    }
  };

  const isExpired = (item: CartItem) => {
    const selectedDate =
      (item as any).selectedDate || (item as any).bookingDate;
    if (!selectedDate) return false;

    const itemDate = new Date(selectedDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return itemDate < today;
  };

  const validItems: CartItem[] =
    cart?.items?.filter((item: CartItem) => {
      const validation = itemValidations[item._id];
      return validation?.isValid !== false;
    }) || [];

  const invalidItems: CartItem[] =
    cart?.items?.filter((item: CartItem) => {
      const validation = itemValidations[item._id];
      return validation?.isValid === false;
    }) || [];

  // Show all items, both valid and invalid
  const allItems = cart?.items || [];

  const subtotal = validItems.reduce(
    (total: number, item: CartItem) => total + (item.totalPrice || 0),
    0
  );
  const tax = Math.round(subtotal * 0.028 * 100) / 100;
  const total = Math.round((subtotal + tax) * 100) / 100;

  if (status === "loading" || loading) {
    return <Loader />;
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <FiShoppingCart className="mx-auto text-6xl text-desc_gray mb-4" />
            <h2 className="text-2xl font-semibold text-title_black mb-2">
              Your cart is empty
            </h2>
            <p className="text-desc_gray mb-6">
              Add tours or transfers to get started
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => router.push("/tours")}
                className="bg-primary_green text-white px-6 py-2 rounded-lg hover:bg-primary_green/90 transition-colors"
              >
                Browse Tours
              </button>
              <button
                onClick={() => router.push("/transfers")}
                className="border border-primary_green text-primary_green px-6 py-2 rounded-lg hover:bg-primary_green/5 transition-colors"
              >
                View Transfers
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            <FiShoppingCart className="text-primary_green" />
            Your Cart
          </h1>
          <p className="text-gray-600">
            Review your selected items and proceed to booking
          </p>
          {validatingItems && (
            <div className="mt-4 flex items-center gap-2 text-blue-600">
              <FiRefreshCw className="animate-spin" />
              <span className="text-sm">Validating cart items...</span>
            </div>
          )}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="space-y-6">
              {/* All Items (both valid and invalid) */}
              {allItems.map((item) => {
                const details = (item.packageDetails || {}) as PackageDetails;

                // Use the correct property names from the cart API
                const packageTitle =
                  (item as any).packageTitle ||
                  details.name ||
                  details.title ||
                  "Untitled";
                const packageImage =
                  (item as any).packageImage ||
                  details.image ||
                  (Array.isArray(details.images) && details.images.length > 0
                    ? details.images[0]
                    : "");
                const selectedTime =
                  (item as any).selectedTime || (item as any).timeSlot || "";
                const selectedDate =
                  (item as any).selectedDate || (item as any).bookingDate || "";
                const adults = (item as any).adults || 0;
                const children = (item as any).children || 0;
                const totalGuests = adults + children;

                const validation = itemValidations[item._id];
                const hasError = validation && !validation.isValid;

                return (
                  <div
                    key={item._id}
                    className={`bg-white rounded-xl shadow-sm border ${
                      hasError
                        ? "border-red-200 bg-red-50/20"
                        : "border-gray-200"
                    } overflow-hidden`}
                  >
                    <div className="p-6">
                      <div className="flex flex-col lg:flex-row gap-6">
                        {/* Item Image */}
                        <div className="lg:w-48 h-40 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                          {packageImage ? (
                            <Image
                              src={packageImage}
                              alt={packageTitle}
                              width={200}
                              height={160}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              {item.packageType === "tour" ? (
                                <FaRoute className="text-4xl text-gray-400" />
                              ) : (
                                <FaCar className="text-4xl text-gray-400" />
                              )}
                            </div>
                          )}
                        </div>

                        {/* Item Details */}
                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                {packageTitle}
                              </h3>
                              <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                                <FiPackage />
                                <span className="capitalize">
                                  {item.packageType}
                                </span>
                              </div>

                              {/* Validation Status - Show error directly on item */}
                              {hasError && (
                                <div className="flex items-center gap-2 text-sm text-red-600 bg-red-100 px-3 py-2 rounded-lg border border-red-200 mb-2">
                                  <FiAlertTriangle className="text-lg flex-shrink-0" />
                                  <span className="font-medium">
                                    {validation.message}
                                  </span>
                                </div>
                              )}
                            </div>

                            <button
                              onClick={() => handleRemoveItem(item._id)}
                              className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                              title="Remove item"
                            >
                              <FiTrash2 className="text-lg" />
                            </button>
                          </div>

                          <div className="grid lg:grid-cols-2 gap-6">
                            <div className="space-y-3">
                              <div className="flex items-center gap-3 text-gray-600">
                                <FiCalendar className="text-primary_green" />
                                <span className="font-medium">
                                  {formatDate(selectedDate)}
                                </span>
                              </div>
                              <div className="flex items-center gap-3 text-gray-600">
                                <FiClock className="text-primary_green" />
                                <span className="font-medium">
                                  {formatTime(selectedTime)}
                                </span>
                              </div>
                              <div className="flex items-center gap-3 text-gray-600">
                                <FiUser className="text-primary_green" />
                                <span className="font-medium">
                                  <span className="text-sm text-gray-400 ml-1">
                                    {adults > 0
                                      ? `${adults} adult${
                                          adults > 1 ? "s" : ""
                                        }`
                                      : ""}
                                    {adults > 0 && children > 0 ? ", " : ""}
                                    {children > 0
                                      ? `${children} child${
                                          children > 1 ? "ren" : ""
                                        }`
                                      : ""}
                                  </span>
                                </span>
                              </div>
                            </div>

                            <div className="space-y-3">
                              {item.pickupLocation && (
                                <div className="flex items-start gap-3 text-gray-600">
                                  <FiMapPin className="text-primary_green mt-0.5 flex-shrink-0" />
                                  <span className="text-sm leading-relaxed">
                                    {typeof item.pickupLocation === "string"
                                      ? stripHtmlTags(item.pickupLocation)
                                      : (
                                          item.pickupLocation as {
                                            name?: string;
                                            address?: string;
                                          }
                                        ).name ||
                                        (
                                          item.pickupLocation as {
                                            name?: string;
                                            address?: string;
                                          }
                                        ).address ||
                                        "Custom location"}
                                  </span>
                                </div>
                              )}

                              <div className="text-right">
                                <div
                                  className={`text-2xl font-bold ${
                                    hasError
                                      ? "text-gray-400 line-through"
                                      : "text-primary_green"
                                  }`}
                                >
                                  RM {item.totalPrice.toFixed(2)}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Booking Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <FiCreditCard className="text-primary_green" />
                Booking Summary
              </h3>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Items ({validItems.length})</span>
                  <span>RM {subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Processing Fee (2.8%)</span>
                  <span>RM {tax.toFixed(2)}</span>
                </div>
                <hr className="border-gray-200" />
                <div className="flex justify-between text-lg font-semibold text-gray-900">
                  <span>Total</span>
                  <span className="text-primary_green">
                    RM {total.toFixed(2)}
                  </span>
                </div>
              </div>

              <button
                onClick={handleProceedToBooking}
                disabled={
                  processing || validItems.length === 0 || validatingItems
                }
                className="w-full bg-primary_green text-white py-3 px-6 rounded-lg hover:bg-primary_green/90 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center gap-2 mb-4"
              >
                {processing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <FiCheckCircle />
                    Proceed to Booking
                  </>
                )}
              </button>

              {invalidItems.length > 0 && (
                <p className="text-sm text-red-600 text-center">
                  Remove invalid items to proceed
                </p>
              )}

              <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-start gap-2">
                  <FiAlertTriangle className="text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">Important Notes</p>
                    <ul className="text-xs space-y-1 list-disc list-inside">
                      <li>
                        Cart items are validated for availability and capacity
                      </li>
                      <li>
                        Final booking confirmation will check timing
                        requirements
                      </li>
                      <li>All times are in Malaysia timezone (MYT)</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Remove Item Confirmation */}
      <Confirmation
        isOpen={!!showRemoveConfirm}
        onClose={() => setShowRemoveConfirm(null)}
        onConfirm={() =>
          showRemoveConfirm && confirmRemoveItem(showRemoveConfirm)
        }
        title="Remove Item"
        message="Are you sure you want to remove this item from your cart?"
        confirmText="Remove"
        variant="danger"
      />
    </div>
  );
}
