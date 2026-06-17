"use client";
import { useState, useEffect } from "react";
import {
  Search,
  Filter,
  Eye,
  Plus,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Package,
  X,
  Upload,
  DollarSign,
} from "lucide-react";
import Image from "next/image";
import AdminLayout from "@/components/adminLayout";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/components/ui/use-toast";

interface Product {
  id: number;
  name: string;
  description?: string;
  category?: string;
  price: number;
  stock: number;
  image_url?: string;
  fraternity_id?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  formatted_price?: string;
  stock_status?: string;
}

interface PaginationData {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
}

export default function AdminProductsPage() {
  const { user, loading: authLoading } = useAuth(true);
  const { toast } = useToast();

  const IMAGE_URL =
    process.env.NEXT_PUBLIC_IMAGE_URL || "http://localhost:8000";

  const getImageUrl = (imageUrl?: string) => {
    if (!imageUrl) return "";
    if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://"))
      return imageUrl;
    if (imageUrl.startsWith("/")) return `${IMAGE_URL}${imageUrl}`;
    return `${IMAGE_URL}/${imageUrl}`;
  };

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [stockFilter, setStockFilter] = useState("all");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"view" | "create" | "edit">(
    "view",
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [pagination, setPagination] = useState<PaginationData>({
    current_page: 1,
    last_page: 1,
    per_page: 15,
    total: 0,
    from: 0,
    to: 0,
  });

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    price: "",
    stock: "",
    is_active: true,
  });

  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");

  const categories = [
    {
      value: "Apparel",
      label: "Apparel",
      color: "bg-[#e8f5e8] text-[#1a4d1a]",
    },
    {
      value: "Accessories",
      label: "Accessories",
      color: "bg-[#f2faf2] text-[#2d7a2d]",
    },
    { value: "Food", label: "Food", color: "bg-[#fdf8e7] text-[#b8870c]" },
    { value: "Cards", label: "Cards", color: "bg-[#fdf3e7] text-[#7a5c0a]" },
    {
      value: "Event Tickets",
      label: "Event Tickets",
      color: "bg-[#e8f5e8] text-[#3d5c3d]",
    },
    {
      value: "Merchandise",
      label: "Merchandise",
      color: "bg-[#f2faf2] text-[#1a4d1a]",
    },
    { value: "Other", label: "Other", color: "bg-[#e8f5e8] text-[#6b8f6b]" },
  ];

  useEffect(() => {
    if (!authLoading && user) fetchProducts();
  }, [authLoading, user]);

  useEffect(() => {
    if (!authLoading && user) fetchProducts();
  }, [pagination.current_page, categoryFilter, statusFilter, stockFilter]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.current_page.toString(),
        per_page: pagination.per_page.toString(),
      });
      if (categoryFilter !== "all") params.append("category", categoryFilter);
      if (statusFilter !== "all") params.append("status", statusFilter);
      if (stockFilter !== "all") params.append("stock_status", stockFilter);
      if (searchQuery) params.append("search", searchQuery);

      const response = await fetch(`/api/admin/products?${params}`, {
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          setProducts(data.data.data || []);
          setPagination({
            current_page: data.data.current_page || 1,
            last_page: data.data.last_page || 1,
            per_page: data.data.per_page || 15,
            total: data.data.total || 0,
            from: data.data.from || 0,
            to: data.data.to || 0,
          });
        }
      } else {
        const errorData = await response.json();
        toast({
          variant: "destructive",
          title: "Error",
          description: errorData.message || "Failed to fetch products.",
        });
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load products.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast({
          variant: "destructive",
          title: "File too large",
          description: "Image must be less than 10MB.",
        });
        return;
      }
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleViewProduct = (product: Product) => {
    setSelectedProduct(product);
    setModalMode("view");
    setIsModalOpen(true);
  };

  const handleCreateNew = () => {
    setFormData({
      name: "",
      description: "",
      category: "",
      price: "",
      stock: "",
      is_active: true,
    });
    setImage(null);
    setPreview("");
    setSelectedProduct(null);
    setModalMode("create");
    setIsModalOpen(true);
  };

  const handleEdit = (product: Product) => {
    setSelectedProduct(product);
    setFormData({
      name: product.name,
      description: product.description || "",
      category: product.category || "",
      price: product.price.toString(),
      stock: product.stock.toString(),
      is_active: product.is_active,
    });
    setPreview(getImageUrl(product.image_url));
    setImage(null);
    setModalMode("edit");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
    setFormData({
      name: "",
      description: "",
      category: "",
      price: "",
      stock: "",
      is_active: true,
    });
    setImage(null);
    setPreview("");
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.price || !formData.stock) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please fill in all required fields.",
      });
      return;
    }
    try {
      setIsSubmitting(true);
      const fd = new FormData();
      fd.append("name", formData.name);
      fd.append("description", formData.description);
      fd.append("category", formData.category);
      fd.append("price", formData.price);
      fd.append("stock", formData.stock);
      fd.append("is_active", formData.is_active ? "1" : "0");
      if (image) fd.append("image", image);

      const url =
        modalMode === "edit"
          ? `/api/admin/products/${selectedProduct?.id}`
          : "/api/admin/products";
      const response = await fetch(url, {
        method: "POST",
        credentials: "include",
        body: fd,
      });
      const data = await response.json();

      if (response.ok && data.success) {
        toast({
          title: "Success",
          description: `Product ${modalMode === "create" ? "created" : "updated"} successfully.`,
        });
        closeModal();
        fetchProducts();
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: data.message || "Failed to save product.",
        });
      }
    } catch (error) {
      console.error("Error saving product:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save product.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    try {
      const response = await fetch(`/api/admin/products/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await response.json();
      if (data.success) {
        toast({
          title: "Success",
          description: "Product deleted successfully.",
        });
        fetchProducts();
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: data.message || "Failed to delete product.",
        });
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete product.",
      });
    }
  };

  const handleSearch = () => {
    setPagination((prev) => ({ ...prev, current_page: 1 }));
    fetchProducts();
  };
  const handlePageChange = (page: number) =>
    setPagination((prev) => ({ ...prev, current_page: page }));

  const getCategoryBadge = (category?: string) => {
    if (!category) return null;
    const cat = categories.find((c) => c.value === category);
    return (
      <span
        className={`px-2 py-1 text-xs font-medium rounded-full ${cat?.color || "bg-[#e8f5e8] text-[#6b8f6b]"}`}
      >
        {category}
      </span>
    );
  };

  const getStatusBadge = (is_active: boolean) => (
    <span
      className={`px-2 py-1 text-xs font-medium rounded-full ${is_active ? "bg-[#e8f5e8] text-[#1a4d1a]" : "bg-[#f2faf2] text-[#6b8f6b]"}`}
    >
      {is_active ? "Active" : "Inactive"}
    </span>
  );

  const getStockBadge = (stock: number) => {
    if (stock === 0)
      return (
        <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-50 text-red-700">
          Out of Stock
        </span>
      );
    if (stock < 10)
      return (
        <span className="px-2 py-1 text-xs font-medium rounded-full bg-[#fdf8e7] text-[#b8870c]">
          Low Stock
        </span>
      );
    return (
      <span className="px-2 py-1 text-xs font-medium rounded-full bg-[#e8f5e8] text-[#1a4d1a]">
        In Stock
      </span>
    );
  };

  const formatPrice = (price: number) => {
    const n = Number(price);
    return isNaN(n) ? "₱0.00" : `₱${n.toFixed(2)}`;
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#f2faf2]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1a4d1a] mx-auto" />
          <p className="mt-4 text-[#6b8f6b]">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <AdminLayout>
      <div className="min-h-screen bg-[#f2faf2]">
        {/* Header */}
        <div className="bg-white border-b border-[#d0e8d0] sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#e8f5e8] rounded-lg">
                  <Package className="w-6 h-6 text-[#1a4d1a]" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-[#1a2e1a]">
                    Product Management
                  </h1>
                  <p className="text-sm text-[#6b8f6b]">
                    Manage products and inventory
                  </p>
                </div>
              </div>
              <button
                onClick={handleCreateNew}
                className="hidden sm:flex items-center gap-2 px-4 py-2 bg-[#1a4d1a] text-white rounded-lg hover:bg-[#2d7a2d] transition-all text-sm font-medium"
              >
                <Plus className="w-4 h-4" /> New Product
              </button>
              <button
                onClick={handleCreateNew}
                className="sm:hidden p-2 bg-[#1a4d1a] text-white rounded-lg hover:bg-[#2d7a2d] transition-all"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
          {/* Filters */}
          <div className="bg-white rounded-lg border border-[#d0e8d0] p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[
                {
                  icon: (
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6b8f6b] w-4 h-4" />
                  ),
                  content: (
                    <input
                      type="text"
                      placeholder="Search products..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                      className="w-full pl-9 pr-3 py-2 border border-[#c8e6c8] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a4d1a]"
                    />
                  ),
                },
              ].map((_, i) => null)}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6b8f6b] w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="w-full pl-9 pr-3 py-2 border border-[#c8e6c8] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a4d1a]"
                />
              </div>
              {[
                {
                  value: categoryFilter,
                  onChange: (v: string) => {
                    setCategoryFilter(v);
                    setPagination((p) => ({ ...p, current_page: 1 }));
                  },
                  options: [
                    { v: "all", l: "All Categories" },
                    ...categories.map((c) => ({ v: c.value, l: c.label })),
                  ],
                },
                {
                  value: statusFilter,
                  onChange: (v: string) => {
                    setStatusFilter(v);
                    setPagination((p) => ({ ...p, current_page: 1 }));
                  },
                  options: [
                    { v: "all", l: "All Status" },
                    { v: "active", l: "Active" },
                    { v: "inactive", l: "Inactive" },
                  ],
                },
                {
                  value: stockFilter,
                  onChange: (v: string) => {
                    setStockFilter(v);
                    setPagination((p) => ({ ...p, current_page: 1 }));
                  },
                  options: [
                    { v: "all", l: "All Stock" },
                    { v: "in_stock", l: "In Stock" },
                    { v: "low_stock", l: "Low Stock" },
                    { v: "out_of_stock", l: "Out of Stock" },
                  ],
                },
              ].map((sel, i) => (
                <div key={i} className="relative">
                  <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6b8f6b] w-4 h-4 pointer-events-none" />
                  <select
                    value={sel.value}
                    onChange={(e) => sel.onChange(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-[#c8e6c8] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a4d1a] appearance-none bg-white"
                  >
                    {sel.options.map((o) => (
                      <option key={o.v} value={o.v}>
                        {o.l}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
            <button
              onClick={handleSearch}
              className="mt-4 w-full sm:w-auto px-6 py-2 bg-[#1a4d1a] text-white rounded-lg hover:bg-[#2d7a2d] transition-colors text-sm font-medium"
            >
              Search
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              {
                label: "Total Products",
                value: pagination.total,
                color: "text-[#1a2e1a]",
              },
              {
                label: "Active",
                value: products.filter((p) => p.is_active).length,
                color: "text-[#1a4d1a]",
              },
              {
                label: "Out of Stock",
                value: products.filter((p) => p.stock === 0).length,
                color: "text-red-600",
              },
              {
                label: "Low Stock",
                value: products.filter((p) => p.stock > 0 && p.stock < 10)
                  .length,
                color: "text-[#b8870c]",
              },
            ].map((s) => (
              <div
                key={s.label}
                className="bg-white p-4 rounded-lg border border-[#d0e8d0]"
              >
                <p className="text-xs text-[#6b8f6b] mb-1">{s.label}</p>
                <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              </div>
            ))}
          </div>

          {/* Table */}
          <div className="bg-white rounded-lg border border-[#d0e8d0] overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1a4d1a] mx-auto" />
                  <p className="mt-4 text-[#6b8f6b]">Loading products...</p>
                </div>
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-12">
                <Package className="w-12 h-12 text-[#a8d4a8] mx-auto mb-4" />
                <h3 className="text-lg font-medium text-[#1a2e1a] mb-2">
                  No products found
                </h3>
                <p className="text-[#6b8f6b] mb-4">Create your first product</p>
                <button
                  onClick={handleCreateNew}
                  className="px-4 py-2 bg-[#1a4d1a] text-white rounded-lg hover:bg-[#2d7a2d] transition-colors text-sm"
                >
                  New Product
                </button>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-[#f2faf2] border-b border-[#d0e8d0]">
                      <tr>
                        {[
                          "Product",
                          "Category",
                          "Price",
                          "Stock",
                          "Status",
                          "Actions",
                        ].map((h) => (
                          <th
                            key={h}
                            className="px-6 py-3 text-left text-xs font-semibold text-[#6b8f6b] uppercase tracking-wider whitespace-nowrap"
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#e8f5e8]">
                      {products.map((product) => (
                        <tr
                          key={product.id}
                          className="hover:bg-[#f9fdf9] transition-colors"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              {product.image_url ? (
                                <div className="w-12 h-12 rounded-lg overflow-hidden bg-[#e8f5e8] flex-shrink-0 border border-[#c8e6c8]">
                                  <img
                                    src={getImageUrl(product.image_url)}
                                    alt={product.name}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              ) : (
                                <div className="w-12 h-12 rounded-lg bg-[#e8f5e8] flex items-center justify-center flex-shrink-0 border border-[#c8e6c8]">
                                  <Package className="w-6 h-6 text-[#a8d4a8]" />
                                </div>
                              )}
                              <span className="text-sm font-medium text-[#1a2e1a] max-w-xs truncate">
                                {product.name}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getCategoryBadge(product.category)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#1a2e1a]">
                            {formatPrice(product.price)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-[#1a2e1a]">
                                {product.stock}
                              </span>
                              {getStockBadge(product.stock)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getStatusBadge(product.is_active)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleViewProduct(product)}
                                className="p-1.5 text-[#1a4d1a] hover:bg-[#e8f5e8] rounded transition-colors"
                                title="View"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleEdit(product)}
                                className="p-1.5 text-[#d4a017] hover:bg-[#fdf8e7] rounded transition-colors"
                                title="Edit"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(product.id)}
                                className="p-1.5 text-red-500 hover:bg-red-50 rounded transition-colors"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {!loading && products.length > 0 && (
                  <div className="px-6 py-4 border-t border-[#d0e8d0] flex flex-col sm:flex-row items-center justify-between gap-4">
                    <span className="text-sm text-[#6b8f6b]">
                      Showing {pagination.from} to {pagination.to} of{" "}
                      {pagination.total} results
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          handlePageChange(pagination.current_page - 1)
                        }
                        disabled={pagination.current_page === 1}
                        className="p-2 border border-[#c8e6c8] rounded-lg hover:bg-[#f2faf2] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                      >
                        <ChevronLeft className="w-4 h-4 text-[#1a4d1a]" />
                      </button>
                      <div className="flex items-center gap-1">
                        {Array.from(
                          { length: Math.min(5, pagination.last_page) },
                          (_, i) => {
                            let pageNum = i + 1;
                            if (pagination.last_page > 5) {
                              if (pagination.current_page <= 3) pageNum = i + 1;
                              else if (
                                pagination.current_page >=
                                pagination.last_page - 2
                              )
                                pageNum = pagination.last_page - 4 + i;
                              else pageNum = pagination.current_page - 2 + i;
                            }
                            return (
                              <button
                                key={pageNum}
                                onClick={() => handlePageChange(pageNum)}
                                className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${pagination.current_page === pageNum ? "bg-[#1a4d1a] text-white" : "border border-[#c8e6c8] text-[#3d5c3d] hover:bg-[#f2faf2]"}`}
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
                        disabled={
                          pagination.current_page === pagination.last_page
                        }
                        className="p-2 border border-[#c8e6c8] rounded-lg hover:bg-[#f2faf2] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                      >
                        <ChevronRight className="w-4 h-4 text-[#1a4d1a]" />
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col border border-[#d0e8d0]">
              {/* Modal Header */}
              <div className="border-b border-[#d0e8d0] px-4 sm:px-6 py-4 flex items-center justify-between flex-shrink-0 bg-[#f2faf2] rounded-t-xl">
                <div>
                  <h2 className="text-xl font-bold text-[#1a2e1a]">
                    {modalMode === "create"
                      ? "Create Product"
                      : modalMode === "edit"
                        ? "Edit Product"
                        : "Product Details"}
                  </h2>
                  {selectedProduct && (
                    <p className="text-xs text-[#6b8f6b] mt-0.5">
                      ID #{selectedProduct.id}
                    </p>
                  )}
                </div>
                <button
                  onClick={closeModal}
                  className="p-2 hover:bg-[#d0e8d0] rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-[#6b8f6b]" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="px-4 sm:px-6 py-4 overflow-y-auto flex-1">
                {modalMode === "view" && selectedProduct ? (
                  <div className="space-y-6">
                    {selectedProduct.image_url && (
                      <div className="relative w-full h-64 rounded-lg overflow-hidden bg-[#e8f5e8]">
                        <img
                          src={getImageUrl(selectedProduct.image_url)}
                          alt={selectedProduct.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-semibold text-[#6b8f6b] uppercase tracking-wide mb-1">
                          Product Name
                        </label>
                        <p className="text-base text-[#1a2e1a]">
                          {selectedProduct.name}
                        </p>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-[#6b8f6b] uppercase tracking-wide mb-1">
                            Category
                          </label>
                          {getCategoryBadge(selectedProduct.category)}
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-[#6b8f6b] uppercase tracking-wide mb-1">
                            Status
                          </label>
                          {getStatusBadge(selectedProduct.is_active)}
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-[#6b8f6b] uppercase tracking-wide mb-1">
                            Price
                          </label>
                          <p className="text-base font-semibold text-[#1a2e1a]">
                            {formatPrice(selectedProduct.price)}
                          </p>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-[#6b8f6b] uppercase tracking-wide mb-1">
                            Stock
                          </label>
                          <div className="flex items-center gap-2">
                            <p className="text-base text-[#1a2e1a]">
                              {selectedProduct.stock} units
                            </p>
                            {getStockBadge(selectedProduct.stock)}
                          </div>
                        </div>
                      </div>
                      {selectedProduct.description && (
                        <div>
                          <label className="block text-xs font-semibold text-[#6b8f6b] uppercase tracking-wide mb-1">
                            Description
                          </label>
                          <div className="p-4 bg-[#f2faf2] border border-[#d0e8d0] rounded-lg">
                            <p className="text-sm text-[#1a2e1a] whitespace-pre-wrap">
                              {selectedProduct.description}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-[#1a2e1a] mb-1">
                        Product Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-[#c8e6c8] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a4d1a]"
                        placeholder="Enter product name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#1a2e1a] mb-2">
                        Category
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {categories.map((cat) => (
                          <button
                            key={cat.value}
                            type="button"
                            onClick={() =>
                              setFormData({ ...formData, category: cat.value })
                            }
                            className={`px-3 py-2 rounded-lg border-2 font-medium text-xs transition-all ${
                              formData.category === cat.value
                                ? `${cat.color} border-current`
                                : "border-[#c8e6c8] bg-white text-[#6b8f6b] hover:border-[#a8d4a8]"
                            }`}
                          >
                            {cat.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#1a2e1a] mb-1">
                        Description
                      </label>
                      <textarea
                        value={formData.description}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            description: e.target.value,
                          })
                        }
                        rows={4}
                        className="w-full px-3 py-2 border border-[#c8e6c8] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a4d1a] resize-none"
                        placeholder="Enter product description..."
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-[#1a2e1a] mb-1">
                          Price (₱) <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6b8f6b]" />
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={formData.price}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                price: e.target.value,
                              })
                            }
                            className="w-full pl-10 pr-3 py-2 border border-[#c8e6c8] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a4d1a]"
                            placeholder="0.00"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[#1a2e1a] mb-1">
                          Stock <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={formData.stock}
                          onChange={(e) =>
                            setFormData({ ...formData, stock: e.target.value })
                          }
                          className="w-full px-3 py-2 border border-[#c8e6c8] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a4d1a]"
                          placeholder="0"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#1a2e1a] mb-2">
                        Product Image
                      </label>
                      {preview ? (
                        <div className="relative w-full h-48 rounded-lg overflow-hidden bg-[#e8f5e8]">
                          <Image
                            src={preview}
                            alt="Preview"
                            fill
                            className="object-cover"
                            unoptimized
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setImage(null);
                              setPreview("");
                            }}
                            className="absolute top-2 right-2 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center text-sm hover:bg-red-600 transition-colors"
                          >
                            ×
                          </button>
                        </div>
                      ) : (
                        <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-[#a8d4a8] rounded-lg cursor-pointer hover:border-[#1a4d1a] hover:bg-[#f2faf2] transition-colors">
                          <Upload className="w-10 h-10 text-[#a8d4a8] mb-2" />
                          <p className="text-sm font-medium text-[#6b8f6b]">
                            Upload product image
                          </p>
                          <p className="text-xs text-[#a8d4a8] mt-1">
                            PNG, JPG, GIF (max 10MB)
                          </p>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="hidden"
                          />
                        </label>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="is_active"
                        checked={formData.is_active}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            is_active: e.target.checked,
                          })
                        }
                        className="w-4 h-4 accent-[#1a4d1a] border-[#c8e6c8] rounded"
                      />
                      <label
                        htmlFor="is_active"
                        className="text-sm text-[#3d5c3d]"
                      >
                        Active (Available for purchase)
                      </label>
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="border-t border-[#d0e8d0] px-4 sm:px-6 py-3 bg-white rounded-b-xl flex-shrink-0">
                <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3">
                  {modalMode === "view" ? (
                    <>
                      <button
                        onClick={closeModal}
                        className="w-full sm:w-auto px-4 py-2.5 border border-[#c8e6c8] rounded-lg text-[#3d5c3d] hover:bg-[#f2faf2] transition-colors text-sm font-medium"
                      >
                        Close
                      </button>
                      <button
                        onClick={() => handleEdit(selectedProduct!)}
                        className="w-full sm:w-auto px-4 py-2.5 bg-[#d4a017] text-white rounded-lg hover:bg-[#b8870c] transition-colors text-sm font-medium"
                      >
                        Edit
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={closeModal}
                        className="w-full sm:w-auto px-4 py-2.5 border border-[#c8e6c8] rounded-lg text-[#3d5c3d] hover:bg-[#f2faf2] transition-colors text-sm font-medium"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="w-full sm:w-auto px-4 py-2.5 bg-[#1a4d1a] text-white rounded-lg hover:bg-[#2d7a2d] transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {isSubmitting ? (
                          <>
                            <svg
                              className="animate-spin h-4 w-4 text-white"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              />
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              />
                            </svg>
                            {modalMode === "create"
                              ? "Creating..."
                              : "Saving..."}
                          </>
                        ) : modalMode === "create" ? (
                          "Create Product"
                        ) : (
                          "Save Changes"
                        )}
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
