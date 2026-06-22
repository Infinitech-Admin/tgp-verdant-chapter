"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Package,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  AlertCircle,
  Eye,
  X,
  Calendar,
  CreditCard,
} from "lucide-react";
import { useRouter } from "next/navigation";

interface OrderItem {
  id: number;
  product_id: number;
  quantity: number;
  price: string;
  subtotal: string;
  product: {
    id: number;
    name: string;
    image_url?: string;
    category?: string;
  };
}

interface Order {
  id: number;
  order_code: string;
  user_id: number;
  total_price: string;
  status: string;
  payment_method: string;
  proof_of_payment?: string;
  proof_of_payment_url?: string;
  notes?: string;
  ordered_at: string;
  created_at: string;
  updated_at: string;
  order_items: OrderItem[];
}

const statusConfig = {
  pending: {
    label: "Pending",
    icon: Clock,
    bgClass: "bg-[#d4a017]/10",
    textClass: "text-[#b8870c]",
    borderClass: "border-[#d4a017]/30",
    canCancel: true,
  },
  confirmed: {
    label: "Confirmed",
    icon: CheckCircle,
    bgClass: "bg-[#e8f5e8]",
    textClass: "text-[#1a4d1a]",
    borderClass: "border-[#c8e6c8]",
    canCancel: false,
  },
  processing: {
    label: "Processing",
    icon: Package,
    bgClass: "bg-[#2d7a2d]/10",
    textClass: "text-[#2d7a2d]",
    borderClass: "border-[#2d7a2d]/30",
    canCancel: false,
  },
  shipped: {
    label: "Shipped",
    icon: Truck,
    bgClass: "bg-[#1a4d1a]/10",
    textClass: "text-[#1a4d1a]",
    borderClass: "border-[#1a4d1a]/30",
    canCancel: false,
  },
  completed: {
    label: "Completed",
    icon: CheckCircle,
    bgClass: "bg-[#1a4d1a]",
    textClass: "text-[#d4a017]",
    borderClass: "border-[#d4a017]",
    canCancel: false,
  },
  cancelled: {
    label: "Cancelled",
    icon: XCircle,
    bgClass: "bg-[#7a2020]/10",
    textClass: "text-[#7a2020]",
    borderClass: "border-[#7a2020]/30",
    canCancel: false,
  },
};

type StatusFilter =
  | "all"
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "completed"
  | "cancelled";

export default function OrdersHistoryPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [cancelling, setCancelling] = useState<string | null>(null);

  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  const IMAGE_URL =
    process.env.NEXT_PUBLIC_IMAGE_URL || "http://localhost:8000";

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/users/orders", {
        method: "GET",
        credentials: "include",
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setOrders(data.data || []);
      } else {
        setError(data.message || "Failed to load orders");
      }
    } catch (err: any) {
      console.error("Error fetching orders:", err);
      setError(err.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async (orderCode: string) => {
    if (!orderCode || orderCode === "null" || orderCode === "undefined") {
      setError("Invalid order code");
      console.error("Invalid order code:", orderCode);
      return;
    }

    if (
      !confirm(
        "Are you sure you want to cancel this order? This action cannot be undone.",
      )
    ) {
      return;
    }

    try {
      setCancelling(orderCode);
      setError(null);

      const url = `/api/users/orders/${orderCode}/cancel`;

      const response = await fetch(url, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        console.error("Non-JSON response:", text.substring(0, 500));
        throw new Error("Server returned an error page instead of JSON");
      }

      const data = await response.json();

      if (response.ok && data.success) {
        await fetchOrders();

        if (selectedOrder?.order_code === orderCode) {
          setSelectedOrder(null);
        }

        alert("Order cancelled successfully!");
      } else {
        setError(data.message || "Failed to cancel order");
      }
    } catch (err: any) {
      console.error("Error cancelling order:", err);
      setError(err.message || "Failed to cancel order");
      alert(`Error: ${err.message}`);
    } finally {
      setCancelling(null);
    }
  };

  const formatPrice = (price: string | number) => {
    const numPrice = typeof price === "string" ? parseFloat(price) : price;
    return `₱${numPrice.toFixed(2)}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
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

  const getTotalItems = (order: Order) => {
    return order.order_items.reduce((sum, item) => sum + item.quantity, 0);
  };

  const filteredOrders = orders.filter((order) => {
    if (statusFilter !== "all" && order.status !== statusFilter) {
      return false;
    }

    if (startDate || endDate) {
      const orderDate = new Date(order.ordered_at);

      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        if (orderDate < start) return false;
      }

      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        if (orderDate > end) return false;
      }
    }

    return true;
  });

  const statusCounts = {
    all: orders.length,
    pending: orders.filter((o) => o.status === "pending").length,
    confirmed: orders.filter((o) => o.status === "confirmed").length,
    processing: orders.filter((o) => o.status === "processing").length,
    shipped: orders.filter((o) => o.status === "shipped").length,
    completed: orders.filter((o) => o.status === "completed").length,
    cancelled: orders.filter((o) => o.status === "cancelled").length,
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
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#2d7a2d]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#d4a017]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#1a2e1a] mb-2">
            Order History
          </h1>
          <p className="text-[#6b8f6b]">View and manage your orders</p>
        </div>

        {/* Error Alert */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#1a4d1a] border border-[#d4a017] rounded-2xl p-4 flex items-center gap-2 text-[#d4a017] mb-6"
          >
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span className="font-medium">{error}</span>
          </motion.div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-3xl border border-[#d0e8d0] shadow-sm mb-6 overflow-hidden">
          {/* Status Tabs */}
          <div className="border-b border-[#e8f5e8] overflow-x-auto">
            <div className="flex min-w-max">
              {(
                [
                  ["all", "All Orders"],
                  ["pending", "Pending"],
                  ["confirmed", "Confirmed"],
                  ["processing", "Processing"],
                  ["shipped", "Shipped"],
                  ["completed", "Completed"],
                  ["cancelled", "Cancelled"],
                ] as [StatusFilter, string][]
              ).map(([value, label]) => (
                <button
                  key={value}
                  onClick={() => setStatusFilter(value)}
                  className={`px-6 py-4 text-sm font-medium whitespace-nowrap transition-colors ${
                    statusFilter === value
                      ? "text-[#1a4d1a] border-b-2 border-[#1a4d1a]"
                      : "text-[#6b8f6b] hover:text-[#1a2e1a]"
                  }`}
                >
                  {label} ({statusCounts[value]})
                </button>
              ))}
            </div>
          </div>

          {/* Date Range Filter */}
          <div className="p-4 flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#6b8f6b]" />
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-3 py-2 border border-[#c8e6c8] rounded-full text-sm text-[#1a2e1a] focus:outline-none focus:ring-2 focus:ring-[#2d7a2d]/40 focus:border-[#2d7a2d]"
                placeholder="Start date"
              />
              <span className="text-[#6b8f6b]">To</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-3 py-2 border border-[#c8e6c8] rounded-full text-sm text-[#1a2e1a] focus:outline-none focus:ring-2 focus:ring-[#2d7a2d]/40 focus:border-[#2d7a2d]"
                placeholder="End date"
              />
            </div>
            {(startDate || endDate) && (
              <button
                onClick={() => {
                  setStartDate("");
                  setEndDate("");
                }}
                className="px-4 py-2 text-sm text-[#1a4d1a] hover:text-[#2d7a2d] font-medium"
              >
                Clear dates
              </button>
            )}
            <div className="ml-auto text-sm text-[#6b8f6b]">
              Showing {filteredOrders.length} of {orders.length} orders
            </div>
          </div>
        </div>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-3xl border border-[#d0e8d0] shadow-sm p-12 text-center">
            <div className="w-24 h-24 bg-[#1a4d1a] border-2 border-[#d4a017] rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
              <Package className="w-12 h-12 text-[#d4a017]" />
            </div>
            <h3 className="text-xl font-bold text-[#1a2e1a] mb-2">
              {orders.length === 0 ? "No orders yet" : "No orders found"}
            </h3>
            <p className="text-[#6b8f6b] mb-6">
              {orders.length === 0
                ? "You haven't placed any orders yet."
                : "Try adjusting your filters to see more orders."}
            </p>
            {orders.length === 0 && (
              <button
                onClick={() => router.push("/products")}
                className="px-8 py-4 bg-[#1a4d1a] text-white rounded-full font-semibold hover:bg-[#2d7a2d] transition-all hover:scale-105"
              >
                Browse Products
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => {
              const status =
                statusConfig[order.status as keyof typeof statusConfig] ||
                statusConfig.pending;
              const StatusIcon = status.icon;

              return (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-3xl border border-[#d0e8d0] shadow-sm hover:border-[#2d7a2d] hover:shadow-lg hover:shadow-[#1a4d1a]/10 transition-all overflow-hidden"
                >
                  {/* Order Header */}
                  <div className="p-4 sm:p-6 border-b border-[#e8f5e8]">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-bold text-[#1a2e1a]">
                            Order #{order.order_code || `ID-${order.id}`}
                          </h3>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold uppercase border ${status.bgClass} ${status.textClass} ${status.borderClass} flex items-center gap-1`}
                          >
                            <StatusIcon className="w-3 h-3" />
                            {status.label}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-3 text-sm text-[#6b8f6b]">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {formatDate(order.ordered_at)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Package className="w-4 h-4" />
                            {getTotalItems(order)} items
                          </span>
                          <span className="flex items-center gap-1">
                            <CreditCard className="w-4 h-4" />
                            {order.payment_method}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col sm:items-end gap-2">
                        <div className="text-2xl font-bold text-[#1a4d1a]">
                          {formatPrice(order.total_price)}
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="px-4 py-2 bg-[#e8f5e8] text-[#1a4d1a] rounded-full hover:bg-[#d0e8d0] transition-colors text-sm font-medium flex items-center gap-2"
                          >
                            <Eye className="w-4 h-4" />
                            View Details
                          </button>

                          {status.canCancel && (
                            <button
                              onClick={() =>
                                handleCancelOrder(order.order_code)
                              }
                              disabled={cancelling === order.order_code}
                              className="px-4 py-2 bg-[#7a2020]/10 text-[#7a2020] rounded-full hover:bg-[#7a2020]/20 transition-colors text-sm font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {cancelling === order.order_code ? (
                                <>
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#7a2020]"></div>
                                  <span>Cancelling...</span>
                                </>
                              ) : (
                                <>
                                  <XCircle className="w-4 h-4" />
                                  <span>Cancel Order</span>
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Order Items Preview */}
                  <div className="p-4 sm:p-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      {order.order_items.slice(0, 4).map((item) => (
                        <div key={item.id} className="flex gap-3">
                          <div className="w-16 h-16 bg-[#f2faf2] border border-[#e8f5e8] rounded-xl overflow-hidden flex-shrink-0">
                            {item.product.image_url ? (
                              <img
                                src={getImageUrl(item.product.image_url)}
                                alt={item.product.name}
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
                              {item.product.name}
                            </p>
                            <p className="text-xs text-[#6b8f6b]">
                              Qty: {item.quantity}
                            </p>
                            <p className="text-sm font-semibold text-[#1a4d1a]">
                              {formatPrice(item.subtotal)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                    {order.order_items.length > 4 && (
                      <p className="text-sm text-[#6b8f6b] mt-4">
                        +{order.order_items.length - 4} more items
                      </p>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Order Details Modal */}
        <AnimatePresence>
          {selectedOrder && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setSelectedOrder(null)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white rounded-3xl border border-[#d0e8d0] shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Modal Header */}
                <div className="sticky top-0 bg-white border-b border-[#e8f5e8] p-6 flex items-center justify-between rounded-t-3xl">
                  <div>
                    <h2 className="text-2xl font-bold text-[#1a2e1a]">
                      Order Details #
                      {selectedOrder.order_code || `ID-${selectedOrder.id}`}
                    </h2>
                    <p className="text-sm text-[#6b8f6b] mt-1">
                      {formatDate(selectedOrder.ordered_at)}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="p-2 hover:bg-[#e8f5e8] rounded-full transition-colors"
                  >
                    <X className="w-6 h-6 text-[#1a4d1a]" />
                  </button>
                </div>

                <div className="p-6 space-y-6">
                  {/* Status */}
                  <div>
                    <h3 className="text-sm font-medium text-[#6b8f6b] mb-2">
                      Status
                    </h3>
                    {(() => {
                      const status =
                        statusConfig[
                          selectedOrder.status as keyof typeof statusConfig
                        ];
                      const StatusIcon = status.icon;
                      return (
                        <span
                          className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border ${status.bgClass} ${status.textClass} ${status.borderClass}`}
                        >
                          <StatusIcon className="w-5 h-5" />
                          <span className="font-semibold">{status.label}</span>
                        </span>
                      );
                    })()}
                  </div>

                  {/* Order Items */}
                  <div>
                    <h3 className="text-sm font-medium text-[#6b8f6b] mb-3">
                      Order Items
                    </h3>
                    <div className="space-y-3">
                      {selectedOrder.order_items.map((item) => (
                        <div
                          key={item.id}
                          className="flex gap-4 p-4 bg-[#f2faf2] border border-[#e8f5e8] rounded-2xl"
                        >
                          <div className="w-20 h-20 bg-white border border-[#e8f5e8] rounded-xl overflow-hidden flex-shrink-0">
                            {item.product.image_url ? (
                              <img
                                src={getImageUrl(item.product.image_url)}
                                alt={item.product.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Package className="w-8 h-8 text-[#6b8f6b]" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-[#1a2e1a]">
                              {item.product.name}
                            </p>
                            {item.product.category && (
                              <p className="text-sm text-[#6b8f6b]">
                                {item.product.category}
                              </p>
                            )}
                            <div className="flex items-center gap-4 mt-2">
                              <span className="text-sm text-[#6b8f6b]">
                                Qty: {item.quantity}
                              </span>
                              <span className="text-sm text-[#6b8f6b]">
                                {formatPrice(item.price)} each
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-[#1a4d1a]">
                              {formatPrice(item.subtotal)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Payment Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-sm font-medium text-[#6b8f6b] mb-2">
                        Payment Method
                      </h3>
                      <p className="text-[#1a2e1a] font-medium">
                        {selectedOrder.payment_method}
                      </p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-[#6b8f6b] mb-2">
                        Total Amount
                      </h3>
                      <p className="text-2xl font-bold text-[#1a4d1a]">
                        {formatPrice(selectedOrder.total_price)}
                      </p>
                    </div>
                  </div>

                  {/* Proof of Payment */}
                  {selectedOrder.proof_of_payment_url && (
                    <div>
                      <h3 className="text-sm font-medium text-[#6b8f6b] mb-2">
                        Proof of Payment
                      </h3>
                      <img
                        src={getImageUrl(
                          `${process.env.NEXT_PUBLIC_IMAGE_URL}/images/${selectedOrder.proof_of_payment}`,
                        )}
                        alt="Proof of Payment"
                        className="w-full h-[500px] object-contain bg-[#f2faf2] border border-[#e8f5e8] rounded-2xl"
                      />
                    </div>
                  )}

                  {/* Notes */}
                  {selectedOrder.notes && (
                    <div>
                      <h3 className="text-sm font-medium text-[#6b8f6b] mb-2">
                        Order Notes
                      </h3>
                      <p className="text-[#1a2e1a] bg-[#f2faf2] border border-[#e8f5e8] p-4 rounded-2xl">
                        {selectedOrder.notes}
                      </p>
                    </div>
                  )}

                  {/* Cancel Button in Modal */}
                  {statusConfig[
                    selectedOrder.status as keyof typeof statusConfig
                  ]?.canCancel && (
                    <div className="pt-4 border-t border-[#e8f5e8]">
                      <button
                        onClick={() =>
                          handleCancelOrder(selectedOrder.order_code)
                        }
                        disabled={cancelling === selectedOrder.order_code}
                        className="w-full py-3 bg-[#7a2020]/10 text-[#7a2020] rounded-full hover:bg-[#7a2020]/20 transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {cancelling === selectedOrder.order_code ? (
                          <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#7a2020]"></div>
                            <span>Cancelling Order...</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-5 h-5" />
                            <span>Cancel This Order</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
