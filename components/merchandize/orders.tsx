"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Package,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  ChevronDown,
  Truck,
  ChevronUp,
} from "lucide-react";

interface OrderItem {
  id: number;
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
  total_price: string;
  status: string;
  payment_method: string;
  ordered_at: string;
  notes?: string;
  order_items: OrderItem[];
}

const statusOptions = [
  {
    value: "pending",
    label: "Pending",
    icon: Clock,
    color: "text-[#b8870c]",
    bgColor: "bg-[#d4a017]/10",
  },
  {
    value: "confirmed",
    label: "Confirmed",
    icon: CheckCircle,
    color: "text-[#1a4d1a]",
    bgColor: "bg-[#e8f5e8]",
  },
  {
    value: "processing",
    label: "Processing",
    icon: Package,
    color: "text-[#2d7a2d]",
    bgColor: "bg-[#2d7a2d]/10",
  },
  {
    value: "shipped",
    label: "In Transit",
    icon: Truck,
    color: "text-[#1a4d1a]",
    bgColor: "bg-[#1a4d1a]/10",
  },
  {
    value: "completed",
    label: "Completed",
    icon: CheckCircle,
    color: "text-[#d4a017]",
    bgColor: "bg-[#1a4d1a]",
  },
  {
    value: "cancelled",
    label: "Cancelled",
    icon: XCircle,
    color: "text-[#7a2020]",
    bgColor: "bg-[#7a2020]/10",
  },
];

// Strict linear flow
const statusFlow = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "completed",
];

const getNextStatus = (
  currentStatus: string,
): { value: string; label: string } | null => {
  const currentIndex = statusFlow.indexOf(currentStatus);
  if (currentIndex === -1 || currentIndex >= statusFlow.length - 1) return null;
  const nextValue = statusFlow[currentIndex + 1];
  const next = statusOptions.find((s) => s.value === nextValue);
  return next ? { value: next.value, label: next.label } : null;
};

export default function OrdersList() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [expandedOrder, setExpandedOrder] = useState<number | null>(null);

  const IMAGE_URL =
    process.env.NEXT_PUBLIC_IMAGE_URL || "http://localhost:8000";

  const getImageUrl = (imageUrl?: string) => {
    if (!imageUrl) return "";
    if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://"))
      return imageUrl;
    if (imageUrl.startsWith("/")) return `${IMAGE_URL}${imageUrl}`;
    return `${IMAGE_URL}/${imageUrl}`;
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/users/orders", {
        credentials: "include",
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setOrders(data.data || []);
      } else {
        setError(data.message || "Failed to load orders");
      }
    } catch (err: any) {
      setError(err.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId: number, newStatus: string) => {
    try {
      setUpdating(orderId);
      setError(null);

      const response = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setOrders(
          orders.map((order) =>
            order.id === orderId ? { ...order, status: newStatus } : order,
          ),
        );
        alert("Order status updated successfully!");
      } else {
        setError(data.message || "Failed to update order status");
        alert(data.message || "Failed to update order status");
      }
    } catch (err: any) {
      setError(err.message || "Failed to update order status");
      alert(err.message || "Failed to update order status");
    } finally {
      setUpdating(null);
    }
  };

  const formatPrice = (price: string | number) => {
    const amount = typeof price === "string" ? parseFloat(price) : price;
    return `Rs. ${amount.toFixed(0)}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const getStatusConfig = (status: string) => {
    return (
      statusOptions.find((opt) => opt.value === status) || statusOptions[0]
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="relative w-12 h-12">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 border-4 border-transparent border-t-[#1a4d1a] border-r-[#2d7a2d] border-b-[#d4a017] rounded-full"
          />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[#1a4d1a] border border-[#d4a017] rounded-2xl p-4 flex items-center gap-2 text-[#d4a017]">
        <AlertCircle className="w-5 h-5" />
        <span className="font-medium">{error}</span>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-24 h-24 bg-[#1a4d1a] border-2 border-[#d4a017] rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
          <Package className="w-12 h-12 text-[#d4a017]" />
        </div>
        <h3 className="text-lg font-bold text-[#1a2e1a] mb-2">No orders yet</h3>
        <p className="text-[#6b8f6b]">Your order history will appear here</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {orders.map((order) => {
        const nextStatus = getNextStatus(order.status);
        const isTerminal =
          order.status === "completed" || order.status === "cancelled";
        const statusConfig = getStatusConfig(order.status);
        const StatusIcon = statusConfig.icon;
        const isExpanded = expandedOrder === order.id;

        return (
          <motion.div
            key={order.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl shadow-sm border border-[#d0e8d0] hover:border-[#2d7a2d] hover:shadow-lg hover:shadow-[#1a4d1a]/10 transition-all overflow-hidden"
          >
            {/* Header */}
            <div className="bg-[#f2faf2] px-6 py-4 border-b border-[#e8f5e8]">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center gap-4">
                  <div>
                    <p className="text-sm text-[#6b8f6b]">Order</p>
                    <p className="text-lg font-bold text-[#1a2e1a]">
                      #{order.order_code || order.id}
                    </p>
                  </div>
                  <div className="hidden sm:block h-8 w-px bg-[#c8e6c8]"></div>
                  <div className="hidden sm:block">
                    <p className="text-sm text-[#6b8f6b]">Order Placed</p>
                    <p className="text-sm font-medium text-[#1a2e1a]">
                      {formatDate(order.ordered_at)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {!isTerminal && nextStatus && (
                    <button
                      onClick={() => {
                        if (
                          confirm(`Advance order to "${nextStatus.label}"?`)
                        ) {
                          handleStatusChange(order.id, nextStatus.value);
                        }
                      }}
                      disabled={updating === order.id}
                      className="px-4 py-2 bg-[#1a4d1a] text-white rounded-full text-sm font-medium hover:bg-[#2d7a2d] transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02]"
                    >
                      {updating === order.id
                        ? "Updating..."
                        : `Move to ${nextStatus.label}`}
                    </button>
                  )}
                  <button
                    onClick={() =>
                      setExpandedOrder(isExpanded ? null : order.id)
                    }
                    className="p-2 hover:bg-[#e8f5e8] rounded-full transition-colors"
                  >
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-[#1a4d1a]" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-[#1a4d1a]" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="p-6">
              <div className="space-y-4">
                {order.order_items.map((item, index) => (
                  <div
                    key={item.id}
                    className={`flex gap-4 ${
                      index !== order.order_items.length - 1
                        ? "pb-4 border-b border-[#e8f5e8]"
                        : ""
                    }`}
                  >
                    {/* Product Image */}
                    <div className="w-20 h-20 bg-[#f2faf2] border border-[#e8f5e8] rounded-2xl overflow-hidden flex-shrink-0">
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

                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-[#1a2e1a] truncate">
                        {item.product.name}
                      </h4>
                      {item.product.category && (
                        <p className="text-sm text-[#6b8f6b]">
                          By {item.product.category}
                        </p>
                      )}
                      <div className="mt-2 flex items-center gap-4 text-sm text-[#6b8f6b]">
                        <span>Size: S</span>
                        <span>Qty: {item.quantity}</span>
                      </div>
                    </div>

                    {/* Price & Status */}
                    <div className="text-right space-y-2">
                      <p className="font-bold text-[#1a4d1a]">
                        {formatPrice(item.price)}
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-[#6b8f6b]">Status</span>
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold uppercase ${statusConfig.bgColor} ${statusConfig.color}`}
                        >
                          <StatusIcon className="w-3 h-3" />
                          {statusConfig.label}
                        </span>
                      </div>
                      <p className="text-sm text-[#6b8f6b]">
                        {formatDate(order.ordered_at)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Expanded Details */}
              {isExpanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-6 pt-6 border-t border-[#e8f5e8] space-y-4"
                >
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-[#6b8f6b]">Payment Method</p>
                      <p className="font-medium text-[#1a2e1a]">
                        {order.payment_method}
                      </p>
                    </div>
                    <div>
                      <p className="text-[#6b8f6b]">Total Items</p>
                      <p className="font-medium text-[#1a2e1a]">
                        {order.order_items.length}
                      </p>
                    </div>
                  </div>
                  {order.notes && (
                    <div>
                      <p className="text-sm text-[#6b8f6b] mb-1">Order Notes</p>
                      <p className="text-sm text-[#1a2e1a] bg-[#f2faf2] border border-[#e8f5e8] p-3 rounded-2xl">
                        {order.notes}
                      </p>
                    </div>
                  )}
                </motion.div>
              )}
            </div>

            {/* Footer */}
            <div className="bg-[#f2faf2] px-6 py-4 border-t border-[#e8f5e8]">
              <div className="flex items-center justify-between">
                <div className="text-sm text-[#6b8f6b]">
                  Paid using credit card ending with 7314
                </div>
                <div className="text-right">
                  <p className="text-sm text-[#6b8f6b] mb-1">Total Amount</p>
                  <p className="text-2xl font-bold text-[#1a4d1a]">
                    {formatPrice(order.total_price)}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
