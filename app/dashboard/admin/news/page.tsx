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
  Newspaper,
  X,
  Calendar,
  Upload,
} from "lucide-react";
import Image from "next/image";
import AdminLayout from "@/components/adminLayout";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/components/ui/use-toast";

interface News {
  id: number;
  title: string;
  content: string;
  category: string;
  status: "draft" | "published" | "archived";
  image_url?: string;
  published_at?: string;
  created_at: string;
  updated_at: string;
}

interface PaginationData {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
}

export default function AdminNewsPage() {
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

  const [news, setNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedNews, setSelectedNews] = useState<News | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"view" | "create" | "edit">(
    "view",
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [pagination, setPagination] = useState<PaginationData>({
    current_page: 1,
    last_page: 1,
    per_page: 15,
    total: 0,
    from: 0,
    to: 0,
  });

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    category: "",
    status: "draft" as News["status"],
    published_at: "",
  });

  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");

  const categories = [
    {
      value: "Development",
      label: "Development",
      color: "bg-[#e8f5e8] text-[#1a4d1a]",
    },
    {
      value: "Business",
      label: "Business",
      color: "bg-[#e8f0e8] text-[#2d5a2d]",
    },
    { value: "Health", label: "Health", color: "bg-[#fdf3e7] text-[#7a5c0a]" },
    {
      value: "Education",
      label: "Education",
      color: "bg-[#f2faf2] text-[#1a4d1a]",
    },
    {
      value: "Environment",
      label: "Environment",
      color: "bg-[#e8f5e8] text-[#2d7a2d]",
    },
    {
      value: "Community",
      label: "Community",
      color: "bg-[#fdf8e7] text-[#b8870c]",
    },
    {
      value: "Infrastructure",
      label: "Infrastructure",
      color: "bg-[#f0f4f0] text-[#3d5c3d]",
    },
    { value: "Events", label: "Events", color: "bg-[#fef9ec] text-[#d4a017]" },
  ];

  useEffect(() => {
    if (!authLoading && user) fetchNews();
  }, [authLoading, user]);
  useEffect(() => {
    if (!authLoading && user) fetchNews();
  }, [pagination.current_page, categoryFilter, statusFilter]);

  const fetchNews = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.current_page.toString(),
        per_page: pagination.per_page.toString(),
      });
      if (categoryFilter !== "all") params.append("category", categoryFilter);
      if (statusFilter !== "all") params.append("status", statusFilter);
      if (searchQuery) params.append("search", searchQuery);

      const response = await fetch(`/api/admin/news?${params}`, {
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          setNews(data.data.data || []);
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
          description: errorData.message || "Failed to fetch news.",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load news.",
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

  const handleViewNews = (newsItem: News) => {
    setSelectedNews(newsItem);
    setModalMode("view");
    setIsModalOpen(true);
  };

  const handleCreateNew = () => {
    setFormData({
      title: "",
      content: "",
      category: "",
      status: "draft",
      published_at: "",
    });
    setImage(null);
    setPreview("");
    setSelectedNews(null);
    setModalMode("create");
    setIsModalOpen(true);
  };

  const handleEdit = (newsItem: News) => {
    setSelectedNews(newsItem);
    setEditingId(newsItem.id);
    setFormData({
      title: newsItem.title,
      content: newsItem.content,
      category: newsItem.category,
      status: newsItem.status,
      published_at: newsItem.published_at || "",
    });
    setPreview(getImageUrl(newsItem.image_url));
    setImage(null);
    setModalMode("edit");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedNews(null);
    setFormData({
      title: "",
      content: "",
      category: "",
      status: "draft",
      published_at: "",
    });
    setImage(null);
    setPreview("");
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.content || !formData.category) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please fill in all required fields.",
      });
      return;
    }
    try {
      setIsSubmitting(true);
      const formDataToSend = new FormData();
      formDataToSend.append("title", formData.title);
      formDataToSend.append("content", formData.content);
      formDataToSend.append("category", formData.category);
      formDataToSend.append("status", formData.status);
      if (formData.published_at)
        formDataToSend.append("published_at", formData.published_at);
      if (image) formDataToSend.append("image", image);

      const url =
        modalMode === "edit"
          ? `/api/admin/news/${selectedNews?.id}`
          : "/api/admin/news";
      const response = await fetch(url, {
        method: "POST",
        credentials: "include",
        body: formDataToSend,
      });
      const data = await response.json();

      if (response.ok && data.success) {
        toast({
          title: "Success",
          description: `News ${modalMode === "create" ? "created" : "updated"} successfully.`,
        });
        closeModal();
        fetchNews();
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: data.message || "Failed to save news.",
        });
      }
    } catch {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save news.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this news article?")) return;
    try {
      const response = await fetch(`/api/admin/news/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await response.json();
      if (data.success) {
        toast({ title: "Success", description: "News deleted successfully." });
        fetchNews();
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: data.message || "Failed to delete news.",
        });
      }
    } catch {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete news.",
      });
    }
  };

  const handleSearch = () => {
    setPagination((prev) => ({ ...prev, current_page: 1 }));
    fetchNews();
  };
  const handlePageChange = (page: number) =>
    setPagination((prev) => ({ ...prev, current_page: page }));

  const getCategoryBadge = (category: string) => {
    const cat = categories.find((c) => c.value === category);
    return (
      <span
        className={`px-2 py-1 text-xs font-medium rounded-full ${cat?.color || "bg-[#f2faf2] text-[#3d5c3d]"}`}
      >
        {category}
      </span>
    );
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      draft: "bg-[#f0f4f0] text-[#3d5c3d]",
      published: "bg-[#e8f5e8] text-[#1a4d1a]",
      archived: "bg-[#fdf8e7] text-[#b8870c]",
    };
    return (
      <span
        className={`px-2 py-1 text-xs font-medium rounded-full ${styles[status] || styles.draft}`}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

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
                  <Newspaper className="w-6 h-6 text-[#1a4d1a]" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-[#1a2e1a]">
                    News Management
                  </h1>
                  <p className="text-sm text-[#6b8f6b]">
                    Manage news articles and updates
                  </p>
                </div>
              </div>
              <button
                onClick={handleCreateNew}
                className="hidden sm:flex items-center gap-2 px-4 py-2 bg-[#1a4d1a] text-white rounded-lg hover:bg-[#2d7a2d] transition-all text-sm font-medium"
              >
                <Plus className="w-4 h-4" />
                New Article
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6b8f6b] w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search news..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="w-full pl-9 pr-3 py-2 border border-[#c8e6c8] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a4d1a] focus:border-transparent"
                />
              </div>
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6b8f6b] w-4 h-4 pointer-events-none" />
                <select
                  value={categoryFilter}
                  onChange={(e) => {
                    setCategoryFilter(e.target.value);
                    setPagination((prev) => ({ ...prev, current_page: 1 }));
                  }}
                  className="w-full pl-9 pr-3 py-2 border border-[#c8e6c8] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a4d1a] appearance-none bg-white"
                >
                  <option value="all">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6b8f6b] w-4 h-4 pointer-events-none" />
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setPagination((prev) => ({ ...prev, current_page: 1 }));
                  }}
                  className="w-full pl-9 pr-3 py-2 border border-[#c8e6c8] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a4d1a] appearance-none bg-white"
                >
                  <option value="all">All Status</option>
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
            </div>
            <button
              onClick={handleSearch}
              className="mt-4 w-full sm:w-auto px-6 py-2 bg-[#1a4d1a] text-white rounded-lg hover:bg-[#2d7a2d] transition-colors text-sm font-medium"
            >
              Search
            </button>
          </div>

          {/* Mobile stats */}
          <div className="grid grid-cols-3 gap-4 sm:hidden">
            {[
              {
                label: "Total",
                value: pagination.total,
                color: "text-[#1a2e1a]",
              },
              {
                label: "Published",
                value: news.filter((n) => n.status === "published").length,
                color: "text-[#1a4d1a]",
              },
              {
                label: "Draft",
                value: news.filter((n) => n.status === "draft").length,
                color: "text-[#6b8f6b]",
              },
            ].map((s) => (
              <div
                key={s.label}
                className="bg-white p-4 rounded-lg border border-[#d0e8d0] text-center"
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
                  <p className="mt-4 text-[#6b8f6b]">Loading news...</p>
                </div>
              </div>
            ) : news.length === 0 ? (
              <div className="text-center py-12">
                <Newspaper className="w-12 h-12 text-[#a8d4a8] mx-auto mb-4" />
                <h3 className="text-lg font-medium text-[#1a2e1a] mb-2">
                  No news found
                </h3>
                <p className="text-[#6b8f6b] mb-4">
                  Create your first news article
                </p>
                <button
                  onClick={handleCreateNew}
                  className="px-4 py-2 bg-[#1a4d1a] text-white rounded-lg hover:bg-[#2d7a2d] transition-colors text-sm"
                >
                  New Article
                </button>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-[#f2faf2] border-b border-[#d0e8d0]">
                      <tr>
                        {[
                          "Title",
                          "Category",
                          "Status",
                          "Published",
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
                      {news.map((newsItem) => (
                        <tr
                          key={newsItem.id}
                          className="hover:bg-[#f9fdf9] transition-colors"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              {newsItem.image_url && (
                                <div className="w-12 h-12 rounded-lg overflow-hidden bg-[#e8f5e8] flex-shrink-0 border border-[#c8e6c8]">
                                  <Image
                                    src={getImageUrl(newsItem.image_url)}
                                    alt={newsItem.title}
                                    width={48}
                                    height={48}
                                    className="w-full h-full object-cover"
                                    unoptimized
                                  />
                                </div>
                              )}
                              <span className="text-sm font-medium text-[#1a2e1a] max-w-xs truncate">
                                {newsItem.title}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getCategoryBadge(newsItem.category)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getStatusBadge(newsItem.status)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-[#6b8f6b]">
                            {newsItem.published_at
                              ? formatDate(newsItem.published_at)
                              : "—"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleViewNews(newsItem)}
                                className="p-1.5 text-[#1a4d1a] hover:bg-[#e8f5e8] rounded transition-colors"
                                title="View"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleEdit(newsItem)}
                                className="p-1.5 text-[#d4a017] hover:bg-[#fdf8e7] rounded transition-colors"
                                title="Edit"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(newsItem.id)}
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

                {!loading && news.length > 0 && (
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
                                className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                                  pagination.current_page === pageNum
                                    ? "bg-[#1a4d1a] text-white"
                                    : "border border-[#c8e6c8] text-[#3d5c3d] hover:bg-[#f2faf2]"
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
                      ? "Create News Article"
                      : modalMode === "edit"
                        ? "Edit News Article"
                        : "News Details"}
                  </h2>
                  {selectedNews && (
                    <p className="text-xs text-[#6b8f6b] mt-0.5">
                      ID #{selectedNews.id}
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
                {modalMode === "view" && selectedNews ? (
                  <div className="space-y-6">
                    {selectedNews.image_url && (
                      <div className="relative w-full h-64 rounded-lg overflow-hidden bg-[#e8f5e8]">
                        <Image
                          src={getImageUrl(selectedNews.image_url)}
                          alt={selectedNews.title}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                    )}
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-semibold text-[#6b8f6b] uppercase tracking-wide mb-1">
                          Title
                        </label>
                        <p className="text-base text-[#1a2e1a]">
                          {selectedNews.title}
                        </p>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-[#6b8f6b] uppercase tracking-wide mb-1">
                            Category
                          </label>
                          {getCategoryBadge(selectedNews.category)}
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-[#6b8f6b] uppercase tracking-wide mb-1">
                            Status
                          </label>
                          {getStatusBadge(selectedNews.status)}
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-[#6b8f6b] uppercase tracking-wide mb-1">
                            Published
                          </label>
                          <p className="text-sm text-[#1a2e1a]">
                            {selectedNews.published_at
                              ? formatDate(selectedNews.published_at)
                              : "—"}
                          </p>
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#6b8f6b] uppercase tracking-wide mb-1">
                          Content
                        </label>
                        <div className="p-4 bg-[#f2faf2] border border-[#d0e8d0] rounded-lg">
                          <p className="text-sm text-[#1a2e1a] whitespace-pre-wrap">
                            {selectedNews.content}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-[#1a2e1a] mb-1">
                        Title <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.title}
                        onChange={(e) =>
                          setFormData({ ...formData, title: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-[#c8e6c8] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a4d1a]"
                        placeholder="Enter news title"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#1a2e1a] mb-2">
                        Category <span className="text-red-500">*</span>
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
                                ? `${cat.color} border-[#1a4d1a]`
                                : "border-[#d0e8d0] bg-white text-[#6b8f6b] hover:border-[#a8d4a8]"
                            }`}
                          >
                            {cat.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#1a2e1a] mb-1">
                        Content <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        value={formData.content}
                        onChange={(e) =>
                          setFormData({ ...formData, content: e.target.value })
                        }
                        rows={6}
                        className="w-full px-3 py-2 border border-[#c8e6c8] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a4d1a] resize-none"
                        placeholder="Write your article content here..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#1a2e1a] mb-2">
                        Featured Image
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
                            Upload featured image
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

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-[#1a2e1a] mb-1">
                          Status <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={formData.status}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              status: e.target.value as News["status"],
                            })
                          }
                          className="w-full px-3 py-2 border border-[#c8e6c8] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a4d1a]"
                        >
                          <option value="draft">Draft</option>
                          <option value="published">Published</option>
                          <option value="archived">Archived</option>
                        </select>
                      </div>
                      {formData.status === "published" && (
                        <div>
                          <label className="block text-sm font-medium text-[#1a2e1a] mb-1">
                            Publish Date & Time
                          </label>
                          <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6b8f6b]" />
                            <input
                              type="datetime-local"
                              value={formData.published_at}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  published_at: e.target.value,
                                })
                              }
                              className="w-full pl-10 pr-3 py-2 border border-[#c8e6c8] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a4d1a]"
                            />
                          </div>
                          <p className="text-xs text-[#6b8f6b] mt-1">
                            Leave empty to publish now
                          </p>
                        </div>
                      )}
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
                        onClick={() => handleEdit(selectedNews!)}
                        className="w-full sm:w-auto px-4 py-2.5 bg-[#d4a017] text-white rounded-lg hover:bg-[#b8870c] transition-colors text-sm font-medium"
                      >
                        Edit Article
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
                          "Create Article"
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
