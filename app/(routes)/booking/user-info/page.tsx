"use client";

import { useBooking } from "@/context/BookingContext";
import { useCart } from "@/context/CartContext";
import { cartBookingApi } from "@/lib/cartBookingApi";
import BookingInfoPanel from "@/components/ui/BookingInfoPanel";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { useToast } from "@/context/ToastContext";
import SessionHook from "@/hooks/SessionHook";

type Country = { name: string; cca2: string; callingCode: string };

export default function BookingUserInfoPage() {
  const { booking } = useBooking();
  const { cart, clearCart } = useCart();
  const router = useRouter();
  const { showToast } = useToast();
  const { user, isAuthenticated } = SessionHook();
  const searchParams = useSearchParams();

  // Check if this is a cart booking
  const isCartBooking = searchParams.get("from") === "cart";

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    countryCode: "", // require user to select a country
    pickupLocation: "",
  });

  const [countries, setCountries] = useState<Country[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Used to temporarily suppress the auto-redirect to /cart when we
  // intentionally clear the cart after navigating to confirmation.
  const skipCartRedirectRef = useRef(false);

  // Form validation function
  const isFormValid = () => {
    const basicFieldsValid =
      form.name.trim() !== "" &&
      form.email.trim() !== "" &&
      form.phone.trim() !== "" &&
      form.countryCode.trim() !== "";

    if (isCartBooking) {
      // For cart bookings, pickup location is handled per item
      return basicFieldsValid;
    }

    // For single bookings, always require pickup location
    return basicFieldsValid && form.pickupLocation.trim() !== "";
  };

  useEffect(() => {
    if (isCartBooking) {
      // For cart bookings, check if cart exists and has items
      if (!cart || cart.items.length === 0) {
        // If we set the skip flag (we're navigating to confirmation), do not replace
        if (skipCartRedirectRef.current) return;
        router.replace("/cart");
      }
    } else {
      // For single bookings, check if booking exists
      if (!booking) {
        router.replace("/");
      }
    }
  }, [booking, cart, isCartBooking, router]);

  useEffect(() => {
    // Comprehensive country list with all major countries (sorted with Malaysia first)
    const allCountries: Country[] = [
      { name: "Malaysia", cca2: "MY", callingCode: "+60" },
      { name: "Afghanistan", cca2: "AF", callingCode: "+93" },
      { name: "Albania", cca2: "AL", callingCode: "+355" },
      { name: "Algeria", cca2: "DZ", callingCode: "+213" },
      { name: "Argentina", cca2: "AR", callingCode: "+54" },
      { name: "Australia", cca2: "AU", callingCode: "+61" },
      { name: "Austria", cca2: "AT", callingCode: "+43" },
      { name: "Bahrain", cca2: "BH", callingCode: "+973" },
      { name: "Bangladesh", cca2: "BD", callingCode: "+880" },
      { name: "Belgium", cca2: "BE", callingCode: "+32" },
      { name: "Brazil", cca2: "BR", callingCode: "+55" },
      { name: "Brunei", cca2: "BN", callingCode: "+673" },
      { name: "Cambodia", cca2: "KH", callingCode: "+855" },
      { name: "Canada", cca2: "CA", callingCode: "+1" },
      { name: "Chile", cca2: "CL", callingCode: "+56" },
      { name: "China", cca2: "CN", callingCode: "+86" },
      { name: "Colombia", cca2: "CO", callingCode: "+57" },
      { name: "Czech Republic", cca2: "CZ", callingCode: "+420" },
      { name: "Denmark", cca2: "DK", callingCode: "+45" },
      { name: "Egypt", cca2: "EG", callingCode: "+20" },
      { name: "Finland", cca2: "FI", callingCode: "+358" },
      { name: "France", cca2: "FR", callingCode: "+33" },
      { name: "Germany", cca2: "DE", callingCode: "+49" },
      { name: "Greece", cca2: "GR", callingCode: "+30" },
      { name: "Hong Kong", cca2: "HK", callingCode: "+852" },
      { name: "Hungary", cca2: "HU", callingCode: "+36" },
      { name: "Iceland", cca2: "IS", callingCode: "+354" },
      { name: "India", cca2: "IN", callingCode: "+91" },
      { name: "Indonesia", cca2: "ID", callingCode: "+62" },
      { name: "Iran", cca2: "IR", callingCode: "+98" },
      { name: "Iraq", cca2: "IQ", callingCode: "+964" },
      { name: "Ireland", cca2: "IE", callingCode: "+353" },
      { name: "Israel", cca2: "IL", callingCode: "+972" },
      { name: "Italy", cca2: "IT", callingCode: "+39" },
      { name: "Japan", cca2: "JP", callingCode: "+81" },
      { name: "Jordan", cca2: "JO", callingCode: "+962" },
      { name: "Kazakhstan", cca2: "KZ", callingCode: "+7" },
      { name: "Kenya", cca2: "KE", callingCode: "+254" },
      { name: "Kuwait", cca2: "KW", callingCode: "+965" },
      { name: "Laos", cca2: "LA", callingCode: "+856" },
      { name: "Lebanon", cca2: "LB", callingCode: "+961" },
      { name: "Libya", cca2: "LY", callingCode: "+218" },
      { name: "Luxembourg", cca2: "LU", callingCode: "+352" },
      { name: "Macao", cca2: "MO", callingCode: "+853" },
      { name: "Mexico", cca2: "MX", callingCode: "+52" },
      { name: "Morocco", cca2: "MA", callingCode: "+212" },
      { name: "Myanmar", cca2: "MM", callingCode: "+95" },
      { name: "Nepal", cca2: "NP", callingCode: "+977" },
      { name: "Netherlands", cca2: "NL", callingCode: "+31" },
      { name: "New Zealand", cca2: "NZ", callingCode: "+64" },
      { name: "Nigeria", cca2: "NG", callingCode: "+234" },
      { name: "Norway", cca2: "NO", callingCode: "+47" },
      { name: "Oman", cca2: "OM", callingCode: "+968" },
      { name: "Pakistan", cca2: "PK", callingCode: "+92" },
      { name: "Peru", cca2: "PE", callingCode: "+51" },
      { name: "Philippines", cca2: "PH", callingCode: "+63" },
      { name: "Poland", cca2: "PL", callingCode: "+48" },
      { name: "Portugal", cca2: "PT", callingCode: "+351" },
      { name: "Qatar", cca2: "QA", callingCode: "+974" },
      { name: "Romania", cca2: "RO", callingCode: "+40" },
      { name: "Russia", cca2: "RU", callingCode: "+7" },
      { name: "Saudi Arabia", cca2: "SA", callingCode: "+966" },
      { name: "Singapore", cca2: "SG", callingCode: "+65" },
      { name: "South Africa", cca2: "ZA", callingCode: "+27" },
      { name: "South Korea", cca2: "KR", callingCode: "+82" },
      { name: "Spain", cca2: "ES", callingCode: "+34" },
      { name: "Sri Lanka", cca2: "LK", callingCode: "+94" },
      { name: "Sweden", cca2: "SE", callingCode: "+46" },
      { name: "Switzerland", cca2: "CH", callingCode: "+41" },
      { name: "Taiwan", cca2: "TW", callingCode: "+886" },
      { name: "Tanzania", cca2: "TZ", callingCode: "+255" },
      { name: "Thailand", cca2: "TH", callingCode: "+66" },
      { name: "Turkey", cca2: "TR", callingCode: "+90" },
      { name: "Ukraine", cca2: "UA", callingCode: "+380" },
      { name: "United Arab Emirates", cca2: "AE", callingCode: "+971" },
      { name: "United Kingdom", cca2: "GB", callingCode: "+44" },
      { name: "United States", cca2: "US", callingCode: "+1" },
      { name: "Vietnam", cca2: "VN", callingCode: "+84" },
      { name: "Yemen", cca2: "YE", callingCode: "+967" },
    ];

    setCountries(allCountries);
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => {
      if (name === "countryCode") {
        // If country is cleared, also clear phone to avoid concatenation issues
        return { ...prev, countryCode: value, phone: value ? prev.phone : "" };
      }

      return { ...prev, [name]: value } as any;
    });
  };

  const handleConfirmBooking = async () => {
    // Validate form
    if (!form.name || !form.email || !form.phone) {
      showToast({
        type: "error",
        title: "Missing Information",
        message: "Please fill in all required fields",
      });
      return;
    }

    if (isCartBooking) {
      // Handle cart booking payment flow
      return handleCartBookingPayment();
    }

    // Handle single booking payment flow
    return handleSingleBookingPayment();
  };

  const handleCartBookingPayment = async () => {
    if (!cart || cart.items.length === 0) {
      showToast({
        type: "error",
        title: "Error",
        message: "No items in cart",
      });
      return;
    }

    if (!user?.email) {
      console.error("User email not found in session:", user);
      showToast({
        type: "error",
        title: "Authentication Error",
        message: "User email not found. Please try logging in again.",
      });
      return;
    }

    console.log("[CART_PAYMENT] Preparing cart payment flow...");

    try {
      setIsLoading(true);

      const contactInfo = {
        name: form.name,
        email: form.email,
        phone: `${form.countryCode}${form.phone}`,
        whatsapp: `${form.countryCode}${form.phone}`,
      };

      const cartData = {
        ...cart,
        userEmail: user.email,
      };

      // Calculate total with bank charges
      const subtotal = getCartTotal();
      const bankCharge = subtotal * 0.028;
      const totalAmount = subtotal + bankCharge;

      console.log("[CART_PAYMENT] Cart payment data:", {
        subtotal,
        bankCharge,
        totalAmount,
        itemCount: cart.items.length,
      });

      // Redirect to payment page with cart data
      const paymentUrl = `/payment?${new URLSearchParams({
        amount: totalAmount.toFixed(2),
        cartData: encodeURIComponent(JSON.stringify(cartData)),
        contactInfo: encodeURIComponent(JSON.stringify(contactInfo)),
      })}`;

      console.log("[CART_PAYMENT] Redirecting to payment:", paymentUrl);
      router.push(paymentUrl);
    } catch (error: any) {
      console.error("Cart payment preparation error:", error);
      showToast({
        type: "error",
        title: "Error",
        message: error.message || "An error occurred while preparing payment",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSingleBookingPayment = async () => {
    // Check pickup location - now required for all bookings
    if (!form.pickupLocation || form.pickupLocation.trim() === "") {
      showToast({
        type: "error",
        title: "Missing Information",
        message: "Please provide your pickup location address",
      });
      return;
    }

    if (!booking) {
      showToast({
        type: "error",
        title: "Error",
        message: "No booking information found",
      });
      return;
    }

    console.log("[SINGLE_PAYMENT] Preparing payment flow...");

    try {
      setIsLoading(true);

      // Calculate total with bank charges
      const subtotal = booking.totalPrice;
      const bankCharge = subtotal * 0.028;
      const totalAmount = subtotal + bankCharge;

      // Prepare booking data for payment
      const bookingData = {
        packageType: booking.packageType,
        packageId: booking.packageId,
        date: booking.date,
        time: booking.time,
        adults: booking.isVehicleBooking ? 1 : booking.adults,
        children: booking.children || 0,
        isVehicleBooking: booking.isVehicleBooking || false,
        pickupLocation: form.pickupLocation.trim(),
        contactInfo: {
          name: form.name,
          email: form.email,
          phone: `${form.countryCode}${form.phone}`,
          whatsapp: `${form.countryCode}${form.phone}`,
        },
        subtotal: booking.totalPrice,
        total: totalAmount,
      };

      console.log("[SINGLE_PAYMENT] Redirecting to payment page...");

      // Redirect to payment page with booking data
      const paymentUrl = `/payment?${new URLSearchParams({
        amount: totalAmount.toFixed(2),
        bookingData: encodeURIComponent(JSON.stringify(bookingData)),
      })}`;

      router.push(paymentUrl);
    } catch (error: any) {
      console.error("Payment preparation error:", error);
      showToast({
        type: "error",
        title: "Error",
        message: error.message || "An error occurred while preparing payment",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const goToCheckout = () => {
    handleConfirmBooking();
  };

  // Calculate total for cart bookings
  const getCartTotal = () => {
    if (!cart || !cart.items) return 0;
    return cart.items.reduce(
      (total, item) => total + (item.totalPrice || 0),
      0
    );
  };

  const getCartItemCount = () => {
    if (!cart || !cart.items) return 0;
    return cart.items.length;
  };

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-12 py-6 grid grid-cols-1 md:grid-cols-3 gap-8 font-poppins">
      {/* Form Section */}
      <div className="md:col-span-2 order-1 md:-order-1">
        <h2 className="text-primary_green text-2xl font-bold mb-6">
          {isCartBooking ? "Complete your cart booking" : "Fill your details"}
        </h2>

        {isCartBooking && cart && cart.items.length > 0 && (
          <div className="mb-6 p-4 bg-green-50 border border-primary_green/40 rounded-lg">
            <h3 className="font-semibold text-primary_green mb-2">
              Booking {getCartItemCount()} item(s) from your cart
            </h3>
            <p className="text-sm text-gray-700">
              Total Amount: RM {getCartTotal().toFixed(2)}
            </p>
          </div>
        )}

        <div className="space-y-4">
          {/* Name and Email */}
          {["name", "email"].map((field) => (
            <div key={field} className="w-full">
              <input
                name={field}
                value={(form as any)[field]}
                onChange={handleChange}
                placeholder={`Enter your ${
                  field === "email" ? "email" : field
                }`}
                className="w-full border border-primary_green/40 rounded px-4 py-2 placeholder:text-sm focus:outline-none focus:ring-2 focus:ring-primary_green"
              />
            </div>
          ))}

          {/* Pickup Location - Always show as text input for user to enter their pickup address */}
          {!isCartBooking && (
            <>
              <div className="w-full">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pickup Location:
                </label>
                <input
                  name="pickupLocation"
                  value={form.pickupLocation}
                  onChange={handleChange}
                  placeholder="Enter your Hostel/Hotel name and complete address"
                  className="w-full border border-primary_green/40 rounded px-4 py-2 placeholder:text-sm focus:outline-none focus:ring-2 focus:ring-primary_green"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Please provide your complete pickup address including
                  hotel/hostel name
                </p>
              </div>

              {/* Display pickup guidelines/locations */}
              {(() => {
                // For transfers: Show only pickup guidelines
                if (booking?.packageType === "transfer") {
                  const transferGuidelines =
                    booking?.pickupOption === "admin"
                      ? (booking as any)?.details?.pickupGuidelines
                      : booking?.pickupLocations;

                  if (transferGuidelines) {
                    return (
                      <div className="mt-3">
                        <div className="p-3 bg-green-50 border border-primary_green/40 rounded">
                          <h5 className="font-medium text-primary_green mb-2 text-sm">
                            Pickup Guidelines:
                          </h5>
                          <div
                            className="prose max-w-none text-sm text-gray-700 leading-relaxed"
                            dangerouslySetInnerHTML={{
                              __html: transferGuidelines,
                            }}
                          />
                        </div>
                      </div>
                    );
                  }
                }

                // For tours: Show both pickup locations and pickup guidelines
                if (booking?.packageType === "tour") {
                  const tourLocations = booking?.pickupLocations;
                  const tourGuidelines = (booking as any)?.details
                    ?.pickupGuidelines;

                  if (tourLocations || tourGuidelines) {
                    return (
                      <div className="mt-3">
                        <div className="p-3 bg-green-50 border border-primary_green/40 rounded">
                          {tourLocations && (
                            <div className="mb-3">
                              <h5 className="font-medium text-primary_green mb-2 text-sm">
                                Available Pickup Locations:
                              </h5>
                              <div
                                className="prose max-w-none text-sm text-gray-700"
                                dangerouslySetInnerHTML={{
                                  __html: tourLocations,
                                }}
                              />
                            </div>
                          )}
                          {tourGuidelines && (
                            <div>
                              <h5 className="font-medium text-primary_green mb-2 text-sm">
                                Pickup Guidelines:
                              </h5>
                              <div
                                className="prose max-w-none text-sm text-gray-700 leading-relaxed"
                                dangerouslySetInnerHTML={{
                                  __html: tourGuidelines,
                                }}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  }
                }

                return null;
              })()}
            </>
          )}

          {/* WhatsApp Number Section */}
          <div>
            <div className="flex flex-col sm:flex-row gap-3">
              <select
                name="countryCode"
                value={form.countryCode}
                onChange={handleChange}
                className="sm:w-52 border border-primary_green/40 rounded px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-primary_green"
              >
                <option value="">Select country...</option>
                {countries.map((c) => (
                  <option key={c.cca2} value={c.callingCode}>
                    {c.name} ({c.callingCode})
                  </option>
                ))}
              </select>
              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder={
                  form.countryCode
                    ? "Enter WhatsApp number"
                    : "Select country first"
                }
                disabled={form.countryCode === ""}
                className={`flex-1 border border-primary_green/40 rounded px-4 py-2 placeholder:text-sm focus:outline-none focus:ring-2 focus:ring-primary_green ${
                  form.countryCode === ""
                    ? "bg-gray-100 cursor-not-allowed"
                    : "bg-white"
                }`}
              />
            </div>
          </div>
        </div>

        <button
          onClick={goToCheckout}
          disabled={isLoading || !isFormValid()}
          className="mt-6 w-full sm:w-auto px-6 py-3 bg-primary_green text-white rounded-md hover:bg-primary_green/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading
            ? isCartBooking
              ? "Creating Bookings..."
              : "Creating Booking..."
            : isCartBooking
            ? "Confirm Cart Booking"
            : "Confirm Booking"}
        </button>
      </div>

      {/* Booking Summary Panel */}
      {isCartBooking && cart ? (
        <div className="w-full">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Cart Summary
            </h3>

            <div className="space-y-3 mb-4">
              {cart.items.map((item, index) => (
                <div key={item._id} className="flex justify-between text-sm">
                  <span className="flex-1 truncate">
                    {(item as any).packageTitle || `Item ${index + 1}`}
                  </span>
                  <span className="font-medium">
                    RM {item.totalPrice.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t pt-4">
              <div className="flex justify-between items-center">
                <span className="font-semibold">
                  Total ({getCartItemCount()} items)
                </span>
                <span className="font-bold text-primary_green text-lg">
                  RM {getCartTotal().toFixed(2)}
                </span>
              </div>
            </div>

            <button
              onClick={goToCheckout}
              disabled={isLoading || !isFormValid()}
              className="w-full mt-4 px-4 py-2 bg-primary_green text-white rounded-md hover:bg-primary_green/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Processing..." : "Confirm Booking"}
            </button>
          </div>
        </div>
      ) : (
        booking && (
          <div className="w-full">
            <BookingInfoPanel
              title={booking.title}
              date={new Date(booking.date)}
              time={booking.time}
              type={booking.type}
              duration={booking.duration}
              adults={booking.adults}
              children={booking.children}
              adultPrice={booking.adultPrice}
              childPrice={booking.childPrice}
              userInfo={true}
              totalPrice={booking.totalPrice}
              packageType={booking.packageType}
              onClick={goToCheckout}
              isVehicleBooking={booking.isVehicleBooking}
              vehicleSeatCapacity={booking.vehicleSeatCapacity}
              vehicleName={booking.vehicleName}
            />
          </div>
        )
      )}
    </div>
  );
}
