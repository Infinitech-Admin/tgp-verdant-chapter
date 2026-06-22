// components/admin/merchandize/checkout-section.tsx
"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  CreditCard,
  Package,
  User,
  Mail,
  Phone,
  MapPin,
  Upload,
  X,
  ArrowLeft,
  AlertCircle,
  CheckCircle,
  FileText,
  Hash,
  Banknote,
} from "lucide-react";
import { useRouter } from "next/navigation";

interface CartItem {
  id: number;
  name: string;
  description?: string;
  category?: string;
  price: number;
  stock: number;
  image_url?: string;
  quantity: number;
  subtotal: number;
}

interface UserInfo {
  id: number;
  name: string;
  email: string;
  phone_number?: string;
  address?: string;
  fraternity_number?: string;
  status: string;
  role: string;
  created_at: string;
  updated_at: string;
}

interface PaymentMethod {
  id: string;
  name: string;
  accountName?: string;
  accountNumber?: string;
  instructions: string;
  requiresProof: boolean;
}

export default function CheckoutSection() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [checkoutItems, setCheckoutItems] = useState<CartItem[]>([]);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("");
  const [proofOfPayment, setProofOfPayment] = useState<File | null>(null);
  const [proofPreview, setProofPreview] = useState("");
  const [notes, setNotes] = useState("");

  const IMAGE_URL =
    process.env.NEXT_PUBLIC_IMAGE_URL || "http://localhost:8000";

  const paymentMethods: PaymentMethod[] = [
    {
      id: "cod",
      name: "Cash on Delivery",
      instructions:
        "Pay with cash when your order is delivered. Please prepare the exact amount if possible.",
      requiresProof: false,
    },
    {
      id: "gcash",
      name: "GCash",
      accountName: "Justin De Castro",
      accountNumber: "09456754591",
      instructions:
        "Send payment to the GCash number above and upload proof of payment.",
      requiresProof: true,
    },
    {
      id: "paymaya",
      name: "PayMaya",
      accountName: "Justin De Castro",
      accountNumber: "09456754591",
      instructions:
        "Send payment to the PayMaya number above and upload proof of payment.",
      requiresProof: true,
    },
    {
      id: "bank_transfer",
      name: "Bank Transfer",
      accountName: "Juan Dela Cruz",
      accountNumber: "1234-5678-9012",
      instructions:
        "Transfer to Security Bank Account Number above and upload proof of payment.",
      requiresProof: true,
    },
  ];

  const fetchUserInfo = async () => {
    try {
      const response = await fetch("/api/auth/account", {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setUserInfo(data.data.user);
        return true;
      } else {
        if (response.status === 401) {
          setError("Please log in to continue");
          setTimeout(() => router.push("/login"), 2000);
        } else {
          setError("Failed to load user information");
        }
        return false;
      }
    } catch (err: any) {
      console.error("Error fetching user info:", err);
      setError("Failed to load user information");
      return false;
    }
  };

  const fetchCheckoutItems = async () => {
    try {
      const selectedItemsJson = sessionStorage.getItem("checkoutItems");
      if (!selectedItemsJson) {
        setError("No items selected for checkout");
        setTimeout(() => router.push("/products/cart"), 2000);
        return false;
      }

      const selectedItemIds: number[] = JSON.parse(selectedItemsJson);
      if (selectedItemIds.length === 0) {
        setError("No items selected for checkout");
        setTimeout(() => router.push("/products/cart"), 2000);
        return false;
      }

      const cartResponse = await fetch("/api/users/cart", {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      });

      const cartData = await cartResponse.json();

      if (!cartResponse.ok || !cartData.success) {
        throw new Error("Failed to fetch cart items");
      }

      const allCartItems: CartItem[] = cartData.data || [];
      const selectedCartItems = allCartItems.filter((item) =>
        selectedItemIds.includes(item.id),
      );

      if (selectedCartItems.length === 0) {
        setError("Selected items not found in cart");
        setTimeout(() => router.push("/cart"), 2000);
        return false;
      }

      setCheckoutItems(selectedCartItems);
      return true;
    } catch (err: any) {
      console.error("Error fetching checkout items:", err);
      setError(err.message || "Failed to load checkout items");
      return false;
    }
  };

  useEffect(() => {
    const initializeCheckout = async () => {
      try {
        setLoading(true);

        const [userSuccess, itemsSuccess] = await Promise.all([
          fetchUserInfo(),
          fetchCheckoutItems(),
        ]);

        if (!userSuccess || !itemsSuccess) {
          return;
        }
      } catch (err: any) {
        console.error("Error initializing checkout:", err);
        setError(err.message || "Failed to load checkout information");
      } finally {
        setLoading(false);
      }
    };

    initializeCheckout();
  }, [router]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("File size must be less than 5MB");
        return;
      }

      if (!file.type.startsWith("image/")) {
        setError("Please upload an image file");
        return;
      }

      setProofOfPayment(file);

      const reader = new FileReader();
      reader.onloadend = () => {
        setProofPreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      setError(null);
    }
  };

  const removeProofOfPayment = () => {
    setProofOfPayment(null);
    setProofPreview("");
  };

  const getTotalPrice = () => {
    return checkoutItems.reduce((total, item) => total + item.subtotal, 0);
  };

  const getSelectedPaymentMethod = () => {
    return paymentMethods.find((method) => method.id === selectedPaymentMethod);
  };

  const handleSubmitOrder = async () => {
    try {
      if (!selectedPaymentMethod) {
        setError("Please select a payment method");
        return;
      }

      const selectedMethod = getSelectedPaymentMethod();

      if (selectedMethod?.requiresProof && !proofOfPayment) {
        setError("Please upload proof of payment");
        return;
      }

      if (checkoutItems.length === 0) {
        setError("No items to checkout");
        return;
      }

      setSubmitting(true);
      setError(null);

      const formData = new FormData();
      formData.append("payment_method", selectedPaymentMethod);

      if (proofOfPayment) {
        formData.append("proof_of_payment", proofOfPayment);
      }

      formData.append("notes", notes);
      formData.append("total_amount", getTotalPrice().toString());
      formData.append("items", JSON.stringify(checkoutItems));

      const response = await fetch("/api/users/orders", {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccess(true);
        sessionStorage.removeItem("checkoutItems");
        setTimeout(() => {
          router.push(`/orders`);
        }, 2000);
      } else {
        setError(data.message || "Failed to submit order");
      }
    } catch (err: any) {
      console.error("Error submitting order:", err);
      setError(err.message || "Failed to submit order");
    } finally {
      setSubmitting(false);
    }
  };

  const formatPrice = (price: number) => {
    return `₱${price.toFixed(2)}`;
  };

  const getImageUrl = (imageUrl?: string) => {
    if (!imageUrl) return "";
    if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
      return imageUrl;
    }
    if (imageUrl.startsWith("/")) {
      return `${IMAGE_URL}${imageUrl}`;
    }
    return `${IMAGE_URL}/${imageUrl}`;
  };

  if (loading) {
    return (
      <section className="min-h-screen bg-[#f2faf2] flex items-center justify-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#2d7a2d]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#d4a017]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="text-center relative z-10">
          <div className="relative w-16 h-16 mx-auto mb-4">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 border-4 border-transparent border-t-[#1a4d1a] border-r-[#2d7a2d] border-b-[#d4a017] rounded-full"
            />
          </div>
          <p className="text-[#3d5c3d] font-medium">Loading checkout...</p>
        </div>
      </section>
    );
  }

  if (success) {
    return (
      <section className="min-h-screen bg-[#f2faf2] flex items-center justify-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#2d7a2d]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#d4a017]/10 rounded-full blur-3xl pointer-events-none" />
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl border border-[#d0e8d0] shadow-xl p-8 max-w-md w-full mx-4 text-center relative z-10"
        >
          <div className="w-20 h-20 bg-[#1a4d1a] border-2 border-[#d4a017] rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
            <CheckCircle className="w-10 h-10 text-[#d4a017]" />
          </div>
          <h2 className="text-2xl font-bold text-[#1a2e1a] mb-2">
            Order Placed Successfully!
          </h2>
          <p className="text-[#6b8f6b] mb-6">
            Thank you for your order. We'll review your payment and process your
            order soon.
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-[#6b8f6b]">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#1a4d1a]"></div>
            <span>Redirecting to order details...</span>
          </div>
        </motion.div>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-[#f2faf2] py-8 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#2d7a2d]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#d4a017]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push("/products/cart")}
            className="p-2 bg-white border border-[#d0e8d0] hover:border-[#2d7a2d] hover:bg-[#e8f5e8] rounded-full transition-all"
          >
            <ArrowLeft className="w-6 h-6 text-[#1a4d1a]" />
          </button>
          <h1 className="text-3xl font-bold text-[#1a2e1a] mt-4">Checkout</h1>
          <p className="text-[#6b8f6b] mt-1">Complete your order</p>
        </div>

        {/* Alert Messages */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-[#1a4d1a] border border-[#d4a017] rounded-2xl flex items-start gap-3"
          >
            <AlertCircle className="w-5 h-5 text-[#d4a017] flex-shrink-0 mt-0.5" />
            <p className="text-[#d4a017] text-sm font-medium">{error}</p>
          </motion.div>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Forms */}
          <div className="lg:col-span-2 space-y-6">
            {/* User Information */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-3xl border border-[#d0e8d0] shadow-sm p-6"
            >
              <h2 className="text-xl font-bold text-[#1a2e1a] mb-4 flex items-center gap-2">
                <div className="w-9 h-9 bg-[#1a4d1a] border-2 border-[#d4a017] rounded-full flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-4 h-4 text-[#d4a017]" />
                </div>
                Delivery Information
              </h2>

              {userInfo && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-[#6b8f6b] flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Full Name
                    </label>
                    <p className="mt-1 text-[#1a2e1a] font-medium">
                      {userInfo.name}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-[#6b8f6b] flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      Email
                    </label>
                    <p className="mt-1 text-[#1a2e1a] font-medium">
                      {userInfo.email}
                    </p>
                  </div>

                  {userInfo.phone_number && (
                    <div>
                      <label className="text-sm font-medium text-[#6b8f6b] flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        Phone Number
                      </label>
                      <p className="mt-1 text-[#1a2e1a] font-medium">
                        {userInfo.phone_number}
                      </p>
                    </div>
                  )}

                  {userInfo.address && (
                    <div className="md:col-span-2">
                      <label className="text-sm font-medium text-[#6b8f6b] flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        Address
                      </label>
                      <p className="mt-1 text-[#1a2e1a] font-medium">
                        {userInfo.address}
                      </p>
                    </div>
                  )}

                  {userInfo.fraternity_number && (
                    <div>
                      <label className="text-sm font-medium text-[#6b8f6b] flex items-center gap-2">
                        <Hash className="w-4 h-4" />
                        Fraternity Number
                      </label>
                      <p className="mt-1 text-[#1a2e1a] font-medium">
                        {userInfo.fraternity_number}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </motion.div>

            {/* Payment Method */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-3xl border border-[#d0e8d0] shadow-sm p-6"
            >
              <h2 className="text-xl font-bold text-[#1a2e1a] mb-4 flex items-center gap-2">
                <div className="w-9 h-9 bg-[#1a4d1a] border-2 border-[#d4a017] rounded-full flex items-center justify-center flex-shrink-0">
                  <CreditCard className="w-4 h-4 text-[#d4a017]" />
                </div>
                Payment Method
              </h2>

              <div className="space-y-3">
                {paymentMethods.map((method) => (
                  <div
                    key={method.id}
                    className={`border rounded-2xl p-4 cursor-pointer transition-all ${
                      selectedPaymentMethod === method.id
                        ? "border-[#2d7a2d] bg-[#e8f5e8]"
                        : "border-[#d0e8d0] hover:border-[#2d7a2d]/60"
                    }`}
                    onClick={() => setSelectedPaymentMethod(method.id)}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="radio"
                        name="payment_method"
                        value={method.id}
                        checked={selectedPaymentMethod === method.id}
                        onChange={(e) =>
                          setSelectedPaymentMethod(e.target.value)
                        }
                        className="mt-1 accent-[#1a4d1a]"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          {method.id === "cod" && (
                            <Banknote className="w-5 h-5 text-[#2d7a2d]" />
                          )}
                          {method.id === "gcash" && (
                            <CreditCard className="w-5 h-5 text-[#1a4d1a]" />
                          )}
                          {method.id === "paymaya" && (
                            <CreditCard className="w-5 h-5 text-[#2d7a2d]" />
                          )}
                          {method.id === "bank_transfer" && (
                            <CreditCard className="w-5 h-5 text-[#b8870c]" />
                          )}
                          <p className="font-semibold text-[#1a2e1a]">
                            {method.name}
                          </p>
                        </div>
                        {method.accountName && method.accountNumber && (
                          <p className="text-sm text-[#6b8f6b] mt-1">
                            {method.accountName} - {method.accountNumber}
                          </p>
                        )}
                      </div>
                    </div>

                    {selectedPaymentMethod === method.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="mt-3 pt-3 border-t border-[#c8e6c8]"
                      >
                        <p className="text-sm text-[#3d5c3d]">
                          {method.instructions}
                        </p>
                      </motion.div>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Proof of Payment */}
            {getSelectedPaymentMethod()?.requiresProof && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-3xl border border-[#d0e8d0] shadow-sm p-6"
              >
                <h2 className="text-xl font-bold text-[#1a2e1a] mb-4 flex items-center gap-2">
                  <div className="w-9 h-9 bg-[#1a4d1a] border-2 border-[#d4a017] rounded-full flex items-center justify-center flex-shrink-0">
                    <FileText className="w-4 h-4 text-[#d4a017]" />
                  </div>
                  Proof of Payment
                </h2>

                {proofPreview ? (
                  <div className="relative">
                    <img
                      src={proofPreview}
                      alt="Proof of payment"
                      className="w-full h-64 object-contain bg-[#f2faf2] border border-[#e8f5e8] rounded-2xl"
                    />
                    <button
                      onClick={removeProofOfPayment}
                      className="absolute top-2 right-2 p-2 bg-[#1a4d1a] text-[#d4a017] rounded-full hover:bg-[#2d7a2d] transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-[#c8e6c8] border-dashed rounded-2xl cursor-pointer bg-[#f2faf2] hover:bg-[#e8f5e8] transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-10 h-10 text-[#6b8f6b] mb-3" />
                      <p className="mb-2 text-sm text-[#3d5c3d]">
                        <span className="font-semibold text-[#1a4d1a]">
                          Click to upload
                        </span>{" "}
                        or drag and drop
                      </p>
                      <p className="text-xs text-[#6b8f6b]">
                        PNG, JPG, GIF (max 5MB)
                      </p>
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleFileChange}
                    />
                  </label>
                )}
              </motion.div>
            )}

            {/* Notes */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-3xl border border-[#d0e8d0] shadow-sm p-6"
            >
              <h2 className="text-xl font-bold text-[#1a2e1a] mb-4 flex items-center gap-2">
                <div className="w-9 h-9 bg-[#1a4d1a] border-2 border-[#d4a017] rounded-full flex items-center justify-center flex-shrink-0">
                  <FileText className="w-4 h-4 text-[#d4a017]" />
                </div>
                Order Notes (Optional)
              </h2>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 border border-[#c8e6c8] rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#2d7a2d]/30 focus:border-[#2d7a2d] resize-none text-[#1a2e1a] placeholder-[#6b8f6b]"
                placeholder="Any special instructions or notes for your order..."
              />
            </motion.div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-3xl border border-[#d0e8d0] shadow-sm p-6 sticky top-4"
            >
              <h2 className="text-xl font-bold text-[#1a2e1a] mb-4">
                Order Summary
              </h2>

              {/* Cart Items */}
              <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                {checkoutItems.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <div className="w-16 h-16 bg-[#f2faf2] border border-[#e8f5e8] rounded-xl overflow-hidden flex-shrink-0">
                      {item.image_url ? (
                        <img
                          src={getImageUrl(item.image_url)}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-6 h-6 text-[#6b8f6b]" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#1a2e1a] truncate">
                        {item.name}
                      </p>
                      <p className="text-xs text-[#6b8f6b]">
                        Qty: {item.quantity} × {formatPrice(item.price)}
                      </p>
                      <p className="text-sm font-semibold text-[#1a4d1a]">
                        {formatPrice(item.subtotal)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-[#e8f5e8] pt-4 space-y-2">
                <div className="flex items-center justify-between text-[#6b8f6b]">
                  <span>Subtotal ({checkoutItems.length} items)</span>
                  <span className="font-semibold text-[#1a2e1a]">
                    {formatPrice(getTotalPrice())}
                  </span>
                </div>
                {/* <div className="flex items-center justify-between text-[#6b8f6b]">
                  <span>Shipping</span>
                  <span className="text-sm">TBD</span>
                </div> */}
                <div className="border-t border-[#e8f5e8] pt-2">
                  <div className="flex items-center justify-between text-lg font-bold text-[#1a2e1a]">
                    <span>Total</span>
                    <span className="text-[#1a4d1a]">
                      {formatPrice(getTotalPrice())}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleSubmitOrder}
                disabled={
                  submitting ||
                  !selectedPaymentMethod ||
                  (getSelectedPaymentMethod()?.requiresProof && !proofOfPayment)
                }
                className="w-full mt-6 py-3 bg-[#1a4d1a] text-white rounded-full hover:bg-[#2d7a2d] disabled:bg-gray-300 disabled:cursor-not-allowed transition-all font-semibold flex items-center justify-center gap-2 hover:scale-[1.02]"
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Placing Order...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    <span>Place Order</span>
                  </>
                )}
              </button>

              <p className="text-xs text-[#6b8f6b] text-center mt-3">
                By placing this order, you agree to our terms and conditions
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
