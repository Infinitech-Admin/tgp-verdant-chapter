// components/admin/merchandize/cart-section.tsx
"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ShoppingCart,
  Package,
  Plus,
  Minus,
  Trash2,
  ArrowLeft,
  CreditCard,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
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

export default function CartSection() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());

  const IMAGE_URL =
    process.env.NEXT_PUBLIC_IMAGE_URL || "http://localhost:8000";

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

  const fetchCartItems = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/users/cart", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        credentials: "include",
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          setError("Please log in to view your cart");
          return;
        }
        throw new Error(data.message || "Failed to fetch cart");
      }

      if (data.success) {
        const items = data.data || [];
        setCartItems(items);
        setSelectedItems(new Set(items.map((item: CartItem) => item.id)));
      } else {
        throw new Error(data.message || "Failed to load cart items");
      }
    } catch (err: any) {
      setError(err.message || "Failed to load cart");
      console.error("Error fetching cart:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCartItems();
  }, []);

  const toggleItemSelection = (itemId: number) => {
    setSelectedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  const toggleSelectAll = () => {
    if (selectedItems.size === cartItems.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(cartItems.map((item) => item.id)));
    }
  };

  const formatPrice = (price: number | string) => {
    const numericPrice = Number(price);
    if (isNaN(numericPrice)) {
      return "₱0.00";
    }
    return `₱${numericPrice.toFixed(2)}`;
  };

  const getTotalPrice = () => {
    return cartItems
      .filter((item) => selectedItems.has(item.id))
      .reduce((total, item) => total + item.subtotal, 0);
  };

  const handleContinueShopping = () => {
    router.push("/products");
  };

  const handleUpdateQuantity = async (
    productId: number,
    newQuantity: number,
  ) => {
    try {
      setError(null);
      setUpdating(true);

      const response = await fetch(`/api/users/cart/${productId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ quantity: newQuantity }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || "Failed to update cart");
      }

      await fetchCartItems();
    } catch (err: any) {
      setError(err.message || "Failed to update quantity");
      console.error("Error updating cart:", err);
    } finally {
      setUpdating(false);
    }
  };

  const handleRemoveItem = async (productId: number) => {
    try {
      setError(null);
      setUpdating(true);

      const response = await fetch(`/api/users/cart/${productId}`, {
        method: "DELETE",
        credentials: "include",
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || "Failed to remove item");
      }

      setSuccess("Item removed from cart");
      setTimeout(() => setSuccess(null), 3000);

      setSelectedItems((prev) => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });

      await fetchCartItems();
    } catch (err: any) {
      setError(err.message || "Failed to remove item");
      console.error("Error removing from cart:", err);
    } finally {
      setUpdating(false);
    }
  };

  const handleClearCart = async () => {
    if (!confirm("Are you sure you want to clear your cart?")) return;

    try {
      setError(null);
      setUpdating(true);

      const response = await fetch("/api/users/cart/clear", {
        method: "DELETE",
        credentials: "include",
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || "Failed to clear cart");
      }

      setSuccess("Cart cleared successfully");
      setTimeout(() => setSuccess(null), 3000);

      setSelectedItems(new Set());
      await fetchCartItems();
    } catch (err: any) {
      setError(err.message || "Failed to clear cart");
      console.error("Error clearing cart:", err);
    } finally {
      setUpdating(false);
    }
  };

  const handleCheckout = async () => {
    try {
      setError(null);

      if (selectedItems.size === 0) {
        setError("Please select at least one item to checkout");
        return;
      }

      const selectedCartItems = cartItems.filter((item) =>
        selectedItems.has(item.id),
      );

      for (const item of selectedCartItems) {
        if (item.quantity > item.stock) {
          setError(`Not enough stock for ${item.name}`);
          return;
        }
      }

      sessionStorage.setItem(
        "checkoutItems",
        JSON.stringify(Array.from(selectedItems)),
      );
      router.push("/products/checkout");
    } catch (err: any) {
      setError(err.message || "Failed to proceed to checkout");
      console.error("Error during checkout:", err);
    }
  };

  if (loading) {
    return (
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-[#f2faf2] min-h-screen relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#2d7a2d]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#d4a017]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-6xl mx-auto flex justify-center items-center py-20 relative z-10">
          <div className="relative w-16 h-16">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 border-4 border-transparent border-t-[#1a4d1a] border-r-[#2d7a2d] border-b-[#d4a017] rounded-full"
            />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 px-4 sm:px-6 lg:px-8 bg-[#f2faf2] min-h-screen relative overflow-hidden">
      {/* Decorative glows, matching announcements page */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#2d7a2d]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#d4a017]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={handleContinueShopping}
              className="p-2 bg-white border border-[#d0e8d0] hover:border-[#2d7a2d] hover:bg-[#e8f5e8] rounded-full transition-all"
            >
              <ArrowLeft className="w-5 h-5 text-[#1a4d1a]" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-[#1a2e1a]">
                Shopping Cart
              </h1>
              <p className="text-[#6b8f6b]">
                {cartItems.length} {cartItems.length === 1 ? "item" : "items"}{" "}
                in your cart
                {selectedItems.size > 0 &&
                  selectedItems.size < cartItems.length && (
                    <span className="ml-2 text-[#b8870c] font-medium">
                      ({selectedItems.size} selected)
                    </span>
                  )}
              </p>
            </div>
          </div>

          {/* Alert Messages */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#1a4d1a] border border-[#d4a017] rounded-2xl p-4 flex items-center gap-2 text-[#d4a017] mb-4"
            >
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span className="font-medium">{error}</span>
            </motion.div>
          )}

          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white border border-[#c8e6c8] rounded-2xl p-4 flex items-center gap-2 text-[#1a4d1a] mb-4 shadow-sm"
            >
              <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-[#2d7a2d]" />
              <span className="font-medium">{success}</span>
            </motion.div>
          )}
        </div>

        {/* Cart Content */}
        {cartItems.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl border border-[#d0e8d0] shadow-sm p-12 text-center"
          >
            <div className="w-24 h-24 bg-[#1a4d1a] border-2 border-[#d4a017] rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
              <ShoppingCart className="w-12 h-12 text-[#d4a017]" />
            </div>
            <h2 className="text-2xl font-bold text-[#1a2e1a] mb-2">
              Your cart is empty
            </h2>
            <p className="text-[#6b8f6b] mb-6">
              Add some products to get started
            </p>
            <button
              onClick={handleContinueShopping}
              className="px-8 py-4 bg-[#1a4d1a] hover:bg-[#2d7a2d] text-white rounded-full font-semibold transition-all hover:scale-105"
            >
              Continue Shopping
            </button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {/* Select All Checkbox */}
              <div className="bg-white rounded-2xl border border-[#d0e8d0] shadow-sm p-4 flex items-center gap-3">
                <input
                  type="checkbox"
                  id="select-all"
                  checked={
                    selectedItems.size === cartItems.length &&
                    cartItems.length > 0
                  }
                  onChange={toggleSelectAll}
                  className="w-5 h-5 text-[#1a4d1a] border-[#c8e6c8] rounded focus:ring-[#2d7a2d] focus:ring-2 cursor-pointer accent-[#1a4d1a]"
                />
                <label
                  htmlFor="select-all"
                  className="text-[#1a2e1a] font-medium cursor-pointer"
                >
                  Select All Items
                </label>
              </div>

              {cartItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white rounded-3xl border border-[#d0e8d0] shadow-sm p-4 hover:border-[#2d7a2d] hover:shadow-lg hover:shadow-[#1a4d1a]/10 transition-all"
                >
                  <div className="flex gap-4">
                    {/* Checkbox */}
                    <div className="flex items-start pt-2">
                      <input
                        type="checkbox"
                        id={`item-${item.id}`}
                        checked={selectedItems.has(item.id)}
                        onChange={() => toggleItemSelection(item.id)}
                        className="w-5 h-5 text-[#1a4d1a] border-[#c8e6c8] rounded focus:ring-[#2d7a2d] focus:ring-2 cursor-pointer accent-[#1a4d1a]"
                      />
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 flex-1">
                      {/* Product Image */}
                      <div className="w-full sm:w-32 h-32 flex-shrink-0 bg-[#f2faf2] border border-[#e8f5e8] rounded-2xl overflow-hidden">
                        {item.image_url ? (
                          <img
                            src={getImageUrl(item.image_url)}
                            alt={item.name}
                            width={128}
                            height={128}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="w-12 h-12 text-[#6b8f6b]" />
                          </div>
                        )}
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row items-start justify-between mb-3">
                          <div className="mb-2 sm:mb-0">
                            <h3 className="text-lg font-bold text-[#1a2e1a] mb-1">
                              {item.name}
                            </h3>
                            {item.category && (
                              <span className="inline-block px-3 py-1 bg-[#e8f5e8] text-[#1a4d1a] border border-[#c8e6c8] text-xs font-bold uppercase rounded-full">
                                {item.category}
                              </span>
                            )}
                          </div>
                          <button
                            onClick={() => handleRemoveItem(item.id)}
                            disabled={updating}
                            className="p-2 text-[#b8870c] hover:bg-[#d4a017]/10 rounded-full transition-colors disabled:opacity-50"
                            title="Remove item"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>

                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                          {/* Quantity Controls */}
                          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                            <span className="text-sm text-[#6b8f6b] font-medium">
                              Quantity:
                            </span>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() =>
                                  handleUpdateQuantity(
                                    item.id,
                                    item.quantity - 1,
                                  )
                                }
                                disabled={item.quantity <= 1 || updating}
                                className="p-2 border border-[#c8e6c8] rounded-full hover:bg-[#e8f5e8] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                              >
                                <Minus className="w-4 h-4 text-[#1a4d1a]" />
                              </button>
                              <input
                                type="number"
                                min="1"
                                max={item.stock}
                                value={item.quantity}
                                onChange={(e) => {
                                  const newQty = parseInt(e.target.value) || 1;
                                  if (newQty >= 1 && newQty <= item.stock) {
                                    handleUpdateQuantity(item.id, newQty);
                                  }
                                }}
                                disabled={updating}
                                className="w-16 text-center border border-[#c8e6c8] rounded-xl py-2 font-bold text-[#1a2e1a] disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-[#2d7a2d]/30 focus:border-[#2d7a2d]"
                              />
                              <button
                                onClick={() =>
                                  handleUpdateQuantity(
                                    item.id,
                                    item.quantity + 1,
                                  )
                                }
                                disabled={
                                  item.quantity >= item.stock || updating
                                }
                                className="p-2 border border-[#c8e6c8] rounded-full hover:bg-[#e8f5e8] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                              >
                                <Plus className="w-4 h-4 text-[#1a4d1a]" />
                              </button>
                            </div>
                            <span className="text-sm text-[#6b8f6b]">
                              ({item.stock} available)
                            </span>
                          </div>

                          {/* Price */}
                          <div className="text-left sm:text-right">
                            <p className="text-sm text-[#6b8f6b] mb-1">
                              {formatPrice(item.price)} each
                            </p>
                            <p className="text-xl font-bold text-[#1a4d1a]">
                              {formatPrice(item.subtotal)}
                            </p>
                          </div>
                        </div>

                        {/* Stock Warning */}
                        {item.stock < 10 && item.stock > 0 && (
                          <div className="mt-3 text-sm text-[#b8870c] flex items-center gap-1 font-medium">
                            <AlertCircle className="w-4 h-4" />
                            <span>Only {item.stock} left in stock</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
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

                <div className="space-y-3 mb-6">
                  {/* Items Count */}
                  <div className="flex items-center justify-between text-[#6b8f6b]">
                    <span>Items ({selectedItems.size})</span>
                    <span className="font-semibold text-[#1a2e1a]">
                      {formatPrice(getTotalPrice())}
                    </span>
                  </div>

                  {/* Shipping */}
                  <div className="flex items-center justify-between text-[#6b8f6b]">
                    <span>Shipping</span>
                    <span className="text-sm">Calculated at checkout</span>
                  </div>

                  {/* Tax */}
                  <div className="flex items-center justify-between text-[#6b8f6b]">
                    <span>Tax</span>
                    <span className="text-sm">Included</span>
                  </div>

                  <div className="border-t border-[#e8f5e8] pt-3">
                    <div className="flex items-center justify-between text-lg font-bold text-[#1a2e1a]">
                      <span>Total</span>
                      <span className="text-[#1a4d1a]">
                        {formatPrice(getTotalPrice())}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={handleCheckout}
                    disabled={updating || selectedItems.size === 0}
                    className="w-full py-3 bg-[#1a4d1a] text-white rounded-full hover:bg-[#2d7a2d] disabled:bg-gray-300 disabled:cursor-not-allowed transition-all font-semibold flex items-center justify-center gap-2 hover:scale-[1.02]"
                  >
                    {updating ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-5 h-5" />
                        <span>Proceed to Checkout</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleContinueShopping}
                    className="w-full py-3 border border-[#c8e6c8] text-[#1a4d1a] rounded-full hover:bg-[#e8f5e8] transition-colors font-medium"
                  >
                    Continue Shopping
                  </button>

                  {cartItems.length > 0 && (
                    <button
                      onClick={handleClearCart}
                      disabled={updating}
                      className="w-full mt-3 py-2 text-[#b8870c] hover:bg-[#d4a017]/10 rounded-full transition-colors text-sm font-medium disabled:opacity-50"
                    >
                      Clear Cart
                    </button>
                  )}
                </div>

                {/* Security Badge */}
                <div className="mt-6 pt-6 border-t border-[#e8f5e8]">
                  <div className="flex items-center gap-2 text-sm text-[#6b8f6b]">
                    <ShieldCheck className="w-5 h-5 text-[#2d7a2d]" />
                    <span>Secure checkout</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
