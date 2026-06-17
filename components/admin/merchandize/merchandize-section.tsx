// components/merchandise-section.tsx
"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import {
  ShoppingCart,
  Search,
  ChevronLeft,
  ChevronRight,
  Package,
  Plus,
  Minus,
  CheckCircle,
} from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useRouter } from "next/navigation";

interface Product {
  id: number;
  name: string;
  description?: string;
  category?: string;
  price: number;
  stock: number;
  image_url?: string;
  is_active: boolean;
}

interface PaginationData {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
}

const categories = [
  { value: "all", label: "All Products" },
  { value: "Apparel", label: "Apparel" },
  { value: "Accessories", label: "Accessories" },
  { value: "Books", label: "Books" },
  { value: "Memorabilia", label: "Memorabilia" },
  { value: "Event Tickets", label: "Event Tickets" },
  { value: "Merchandise", label: "Merchandise" },
  { value: "Other", label: "Other" },
];

const priceRanges = [
  { value: "all", label: "All Prices" },
  { value: "0-500", label: "Under ₱500" },
  { value: "500-1000", label: "₱500 - ₱1,000" },
  { value: "1000-2000", label: "₱1,000 - ₱2,000" },
  { value: "2000-5000", label: "₱2,000 - ₱5,000" },
  { value: "5000+", label: "Over ₱5,000" },
];

const sortOptions = [
  { value: "newest", label: "Newest First" },
  { value: "price-low", label: "Price: Low to High" },
  { value: "price-high", label: "Price: High to Low" },
  { value: "name-asc", label: "Name: A to Z" },
  { value: "name-desc", label: "Name: Z to A" },
];

export default function MerchandiseSection() {
  const router = useRouter();
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

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [priceFilter, setPriceFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  const [pagination, setPagination] = useState<PaginationData>({
    current_page: 1,
    last_page: 1,
    per_page: 12,
    total: 0,
    from: 0,
    to: 0,
  });

  const { addToCart, getTotalItems, isInCart, getCartItem } = useCart();

  useEffect(() => {
    fetchProducts();
  }, [pagination.current_page, categoryFilter, priceFilter, sortBy]);

  const fetchProducts = async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams({
        page: pagination.current_page.toString(),
        per_page: pagination.per_page.toString(),
        status: "active",
      });

      if (categoryFilter !== "all") {
        params.append("category", categoryFilter);
      }

      if (searchQuery) {
        params.append("search", searchQuery);
      }

      if (sortBy === "price-low") {
        params.append("sort_by", "price");
        params.append("sort_order", "asc");
      } else if (sortBy === "price-high") {
        params.append("sort_by", "price");
        params.append("sort_order", "desc");
      } else if (sortBy === "name-asc") {
        params.append("sort_by", "name");
        params.append("sort_order", "asc");
      } else if (sortBy === "name-desc") {
        params.append("sort_by", "name");
        params.append("sort_order", "desc");
      } else {
        params.append("sort_by", "created_at");
        params.append("sort_order", "desc");
      }

      const response = await fetch(`/api/users/merchandize?${params}`);
      const data = await response.json();

      if (data.success && data.data) {
        let productsData = data.data.data || data.data;

        if (priceFilter !== "all") {
          productsData = productsData.filter((product: Product) => {
            const price = product.price;
            if (priceFilter === "0-500") return price < 500;
            if (priceFilter === "500-1000") return price >= 500 && price < 1000;
            if (priceFilter === "1000-2000")
              return price >= 1000 && price < 2000;
            if (priceFilter === "2000-5000")
              return price >= 2000 && price < 5000;
            if (priceFilter === "5000+") return price >= 5000;
            return true;
          });
        }

        setProducts(productsData);
        setPagination({
          current_page: data.data.current_page || 1,
          last_page: data.data.last_page || 1,
          per_page: data.data.per_page || 12,
          total: data.data.total || 0,
          from: data.data.from || 0,
          to: data.data.to || 0,
        });
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPagination((prev) => ({ ...prev, current_page: 1 }));
    fetchProducts();
  };

  const handlePageChange = (page: number) => {
    setPagination((prev) => ({ ...prev, current_page: page }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const formatPrice = (price: number | string) => {
    const numericPrice = Number(price);
    if (isNaN(numericPrice)) {
      return "₱0.00";
    }
    return `₱${numericPrice.toFixed(2)}`;
  };

  const handleViewCart = () => {
    router.push("/products/cart");
  };

  return (
    <section className="py-12 px-4 sm:px-6 lg:px-8 bg-[#f2faf2] min-h-screen relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#2d7a2d]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#d4a017]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header with Cart */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-[#1a2e1a] mb-2">
              Official Merchandise
            </h2>
            <p className="text-[#6b8f6b]">
              Browse our collection of alumni products
            </p>
          </div>

          {/* Cart Button */}
          {/* <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleViewCart}
            className="relative p-3 bg-[#1a4d1a] text-white rounded-full shadow-lg hover:bg-[#2d7a2d] transition-colors"
          >
            <ShoppingCart className="w-6 h-6" />
            {getTotalItems() > 0 && (
              <span className="absolute -top-2 -right-2 bg-[#d4a017] text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                {getTotalItems()}
              </span>
            )}
          </motion.button> */}
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6 border border-[#d0e8d0]">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            {/* Search */}
            <div className="md:col-span-5">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#6b8f6b] w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="w-full pl-10 pr-4 py-2 border border-[#c8e6c8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2d7a2d]/40 focus:border-[#2d7a2d]"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div className="md:col-span-3">
              <select
                value={categoryFilter}
                onChange={(e) => {
                  setCategoryFilter(e.target.value);
                  setPagination((prev) => ({ ...prev, current_page: 1 }));
                }}
                className="w-full px-4 py-2 border border-[#c8e6c8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2d7a2d]/40 focus:border-[#2d7a2d]"
              >
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Price Filter */}
            <div className="md:col-span-2">
              <select
                value={priceFilter}
                onChange={(e) => {
                  setPriceFilter(e.target.value);
                  setPagination((prev) => ({ ...prev, current_page: 1 }));
                }}
                className="w-full px-4 py-2 border border-[#c8e6c8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2d7a2d]/40 focus:border-[#2d7a2d]"
              >
                {priceRanges.map((range) => (
                  <option key={range.value} value={range.value}>
                    {range.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort */}
            <div className="md:col-span-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-4 py-2 border border-[#c8e6c8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2d7a2d]/40 focus:border-[#2d7a2d]"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1a4d1a]"></div>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <Package className="w-16 h-16 text-[#a8d4a8] mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-[#1a2e1a] mb-2">
              No products found
            </h3>
            <p className="text-[#6b8f6b]">
              Try adjusting your filters or search query
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
              {products.map((product, i) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  index={i}
                  getImageUrl={getImageUrl}
                  formatPrice={formatPrice}
                  addToCart={addToCart}
                  isInCart={isInCart}
                  getCartItem={getCartItem}
                />
              ))}
            </div>

            {/* Pagination */}
            {pagination.last_page > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white rounded-lg shadow-md p-4 border border-[#d0e8d0]">
                <div className="text-sm text-[#6b8f6b]">
                  Showing {pagination.from} to {pagination.to} of{" "}
                  {pagination.total} products
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      handlePageChange(pagination.current_page - 1)
                    }
                    disabled={pagination.current_page === 1}
                    className="p-2 border border-[#c8e6c8] rounded-lg hover:bg-[#f2faf2] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5 text-[#1a4d1a]" />
                  </button>

                  <div className="flex items-center gap-1">
                    {Array.from(
                      { length: Math.min(5, pagination.last_page) },
                      (_, i) => {
                        let pageNum;
                        if (pagination.last_page <= 5) {
                          pageNum = i + 1;
                        } else if (pagination.current_page <= 3) {
                          pageNum = i + 1;
                        } else if (
                          pagination.current_page >=
                          pagination.last_page - 2
                        ) {
                          pageNum = pagination.last_page - 4 + i;
                        } else {
                          pageNum = pagination.current_page - 2 + i;
                        }

                        return (
                          <button
                            key={pageNum}
                            onClick={() => handlePageChange(pageNum)}
                            className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
                              pagination.current_page === pageNum
                                ? "bg-[#1a4d1a] text-white"
                                : "border border-[#c8e6c8] hover:bg-[#f2faf2] text-[#1a2e1a]"
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      },
                    )}
                  </div>

                  <button
                    onClick={() =>
                      handlePageChange(pagination.current_page + 1)
                    }
                    disabled={pagination.current_page === pagination.last_page}
                    className="p-2 border border-[#c8e6c8] rounded-lg hover:bg-[#f2faf2] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight className="w-5 h-5 text-[#1a4d1a]" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}

// Product Card Component
function ProductCard({
  product,
  index,
  getImageUrl,
  formatPrice,
  addToCart,
  isInCart,
  getCartItem,
}: {
  product: Product;
  index: number;
  getImageUrl: (url?: string) => string;
  formatPrice: (price: number) => string;
  addToCart: any;
  isInCart: (id: number) => boolean;
  getCartItem: (id: number) => any;
}) {
  const [imageError, setImageError] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const inCart = isInCart(product.id);
  const cartItem = getCartItem(product.id);

  const handleAddToCart = async () => {
    try {
      setAdding(true);

      const response = await fetch("/api/users/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          product_id: product.id,
          quantity: quantity,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || "Failed to add to cart");
      }

      addToCart(product, quantity);

      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);

      setQuantity(1);
    } catch (error: any) {
      console.error("Error adding to cart:", error);
      alert(error.message || "Failed to add to cart");
    } finally {
      setAdding(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group relative border border-[#d0e8d0] hover:border-[#2d7a2d]"
    >
      {/* Success Indicator */}
      {showSuccess && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 bg-[#1a4d1a] text-white rounded-full p-4 shadow-lg"
        >
          <CheckCircle className="w-12 h-12" />
        </motion.div>
      )}

      {/* Image */}
      <div className="relative w-full h-48 bg-[#e8f5e8] overflow-hidden">
        {product.image_url && !imageError ? (
          <img
            src={getImageUrl(product.image_url)}
            alt={product.name}
            width={128}
            height={128}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-[#e8f5e8]">
            <Package className="w-16 h-16 text-[#6b8f6b]" />
          </div>
        )}

        {/* Stock Badge */}
        {product.stock === 0 && (
          <div className="h-[20px] absolute top-2 right-2 bg-[#7a2020] text-white text-xs font-bold px-2 py-1 rounded-lg">
            Out of Stock
          </div>
        )}
        {product.stock > 0 && product.stock < 10 && (
          <div className="absolute top-2 right-2 bg-[#d4a017] text-white text-xs font-bold px-2 py-1 rounded-lg">
            Low Stock
          </div>
        )}
        {inCart && (
          <div className="absolute top-2 left-2 bg-[#1a4d1a] text-white text-xs font-bold px-3 py-1 rounded-lg flex items-center gap-1">
            <ShoppingCart className="w-3 h-3" />
            In Cart ({cartItem?.quantity})
          </div>
        )}
        {/* Category */}
        {product.category && (
          <span className="absolute top-2 right-2 px-3 py-1 bg-[#2d7a2d] text-white text-xs font-medium rounded-lg mb-2">
            {product.category}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Name */}
        <h3 className="text-lg font-semibold text-[#1a2e1a] mb-1 line-clamp-2 group-hover:text-[#1a4d1a] transition-colors truncate">
          {product.name}
        </h3>

        {/* Description */}
        {product.description && (
          <p className="text-sm text-[#6b8f6b] mb-3 line-clamp-2">
            {product.description}
          </p>
        )}

        {/* Price */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-2xl font-bold text-[#1a4d1a]">
            {formatPrice(product.price)}
          </span>
          <span className="text-sm text-[#b8870c]">
            {product.stock} in stock
          </span>
        </div>

        {/* Add to Cart Section */}
        {product.stock > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={adding}
                className="p-1 border border-[#c8e6c8] rounded hover:bg-[#f2faf2] disabled:opacity-50"
              >
                <Minus className="w-5 h-5 text-[#1a4d1a]" />
              </button>
              <input
                type="number"
                min="1"
                max={product.stock}
                value={quantity}
                onChange={(e) =>
                  setQuantity(
                    Math.min(
                      product.stock,
                      Math.max(1, parseInt(e.target.value) || 1),
                    ),
                  )
                }
                disabled={adding}
                className="w-16 text-center border border-[#c8e6c8] rounded py-1 disabled:opacity-50"
              />
              <button
                onClick={() =>
                  setQuantity(Math.min(product.stock, quantity + 1))
                }
                disabled={adding}
                className="p-1 border border-[#c8e6c8] rounded hover:bg-[#f2faf2] disabled:opacity-50"
              >
                <Plus className="w-5 h-5 text-[#1a4d1a]" />
              </button>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={adding}
              className="w-full py-2 bg-[#1a4d1a] text-white rounded-lg hover:bg-[#2d7a2d] disabled:bg-gray-400 transition-colors font-medium flex items-center justify-center gap-2"
            >
              {adding ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Adding...</span>
                </>
              ) : (
                <>
                  <ShoppingCart className="w-5 h-5" />
                  <span>Add to Cart</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}
