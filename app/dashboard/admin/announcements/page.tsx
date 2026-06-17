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
  Bell,
  X,
  Calendar,
  ToggleLeft,
  ToggleRight,
  Upload,
} from "lucide-react";
import Image from "next/image";
import AdminLayout from "@/components/adminLayout";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/components/ui/use-toast";

interface Announcement {
  id: number;
  title: string;
  date: string;
  category: "Update" | "Event" | "Alert" | "Development" | "Health" | "Notice";
  description: string;
  content: string;
  is_active: boolean;
  priority: number;
  image_url?: string;
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

export default function AdminAnnouncementsPage() {
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

  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [selectedAnnouncement, setSelectedAnnouncement] =
    useState<Announcement | null>(null);
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
    title: "",
    date: new Date().toISOString().split("T")[0],
    category: "Update" as Announcement["category"],
    description: "",
    content: "",
    is_active: true,
    priority: 0,
  });

  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");

  useEffect(() => {
    if (!authLoading && user) fetchAnnouncements();
  }, [authLoading, user, pagination.current_page, categoryFilter]);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.current_page.toString(),
        per_page: pagination.per_page.toString(),
      });
      if (categoryFilter !== "all") params.append("category", categoryFilter);
      if (searchQuery) params.append("search", searchQuery);

      const response = await fetch(`/api/announcements?${params}`, {
        credentials: "include",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          setAnnouncements(data.data.data || []);
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
        const errorData = await response
          .json()
          .catch(() => ({ message: `HTTP ${response.status}` }));
        toast({
          variant: "destructive",
          title: "Error",
          description: errorData.message || "Failed to fetch announcements.",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to load announcements.",
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

  const handleViewAnnouncement = (a: Announcement) => {
    setSelectedAnnouncement(a);
    setModalMode("view");
    setIsModalOpen(true);
  };

  const handleCreateNew = () => {
    setFormData({
      title: "",
      date: new Date().toISOString().split("T")[0],
      category: "Update",
      description: "",
      content: "",
      is_active: true,
      priority: 0,
    });
    setImage(null);
    setPreview("");
    setSelectedAnnouncement(null);
    setModalMode("create");
    setIsModalOpen(true);
  };

  const handleEdit = (a: Announcement) => {
    setSelectedAnnouncement(a);
    setFormData({
      title: a.title,
      date: a.date,
      category: a.category,
      description: a.description,
      content: a.content,
      is_active: a.is_active,
      priority: a.priority,
    });
    setPreview(getImageUrl(a.image_url));
    setImage(null);
    setModalMode("edit");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedAnnouncement(null);
    setFormData({
      title: "",
      date: new Date().toISOString().split("T")[0],
      category: "Update",
      description: "",
      content: "",
      is_active: true,
      priority: 0,
    });
    setImage(null);
    setPreview("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("title", formData.title);
      fd.append("date", formData.date);
      fd.append("category", formData.category);
      fd.append("description", formData.description);
      fd.append("content", formData.content);
      fd.append("is_active", formData.is_active ? "1" : "0");
      fd.append("priority", String(formData.priority));
      if (image) fd.append("image", image);
      if (modalMode === "edit") fd.append("_method", "PATCH");

      const url =
        modalMode === "edit"
          ? `/api/announcements/${selectedAnnouncement!.id}`
          : `/api/announcements`;
      const res = await fetch(url, {
        method: "POST",
        body: fd,
        credentials: "include",
      });
      const text = await res.text();
      const data = text ? JSON.parse(text) : null;

      if (!res.ok) {
        toast({
          variant: "destructive",
          title: "Error",
          description: data?.message || "Failed to save announcement.",
        });
        return;
      }
      toast({
        title: "Success",
        description:
          modalMode === "create"
            ? "Announcement created successfully."
            : "Announcement updated successfully.",
      });
      closeModal();
      fetchAnnouncements();
    } catch {
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this announcement?")) return;
    try {
      const response = await fetch(`/api/announcements/${id}`, {
        method: "DELETE",
        credentials: "include",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();
      if (data.success) {
        toast({
          title: "Success",
          description: "Announcement deleted successfully.",
        });
        fetchAnnouncements();
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: data.message || "Failed to delete announcement.",
        });
      }
    } catch {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete announcement.",
      });
    }
  };

  const handleSearch = () => {
    setPagination((p) => ({ ...p, current_page: 1 }));
    fetchAnnouncements();
  };
  const handlePageChange = (page: number) =>
    setPagination((p) => ({ ...p, current_page: page }));
  const handleCategoryChange = (value: string) => {
    setCategoryFilter(value);
    setPagination((p) => ({ ...p, current_page: 1 }));
  };

  const getCategoryBadge = (category: string) => {
    const styles: Record<string, string> = {
      Alert: "bg-[#fdf3e7] text-[#7a5c0a]",
      Event: "bg-[#fef9ec] text-[#d4a017]",
      Update: "bg-[#e8f5e8] text-[#1a4d1a]",
      Development: "bg-[#f2faf2] text-[#2d7a2d]",
      Health: "bg-[#e8f5e8] text-[#1a4d1a]",
      Notice: "bg-[#fdf8e7] text-[#b8870c]",
    };
    return (
      <span
        className={`px-2 py-1 text-xs font-medium rounded-full ${styles[category] || styles.Update}`}
      >
        {category}
      </span>
    );
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-US", {
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
                  <Bell className="w-6 h-6 text-[#1a4d1a]" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-[#1a2e1a]">
                    Announcements
                  </h1>
                  <p className="text-sm text-[#6b8f6b]">
                    Manage public announcements and notices
                  </p>
                </div>
              </div>
              <button
                onClick={handleCreateNew}
                className="hidden sm:flex items-center gap-2 px-4 py-2 bg-[#1a4d1a] text-white rounded-lg hover:bg-[#2d7a2d] transition-all text-sm font-medium"
              >
                <Plus className="w-4 h-4" /> New Announcement
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6b8f6b] w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search announcements..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="w-full pl-9 pr-3 py-2 border border-[#c8e6c8] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a4d1a]"
                />
              </div>
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6b8f6b] w-4 h-4 pointer-events-none" />
                <select
                  value={categoryFilter}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-[#c8e6c8] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a4d1a] appearance-none bg-white"
                >
                  <option value="all">All Categories</option>
                  <option value="Update">Update</option>
                  <option value="Event">Event</option>
                  <option value="Alert">Alert</option>
                  <option value="Development">Development</option>
                  <option value="Health">Health</option>
                  <option value="Notice">Notice</option>
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
                label: "Active",
                value: announcements.filter((a) => a.is_active).length,
                color: "text-[#1a4d1a]",
              },
              {
                label: "Inactive",
                value: announcements.filter((a) => !a.is_active).length,
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
                  <p className="mt-4 text-[#6b8f6b]">
                    Loading announcements...
                  </p>
                </div>
              </div>
            ) : announcements.length === 0 ? (
              <div className="text-center py-12">
                <Bell className="w-12 h-12 text-[#a8d4a8] mx-auto mb-4" />
                <h3 className="text-lg font-medium text-[#1a2e1a] mb-2">
                  No announcements found
                </h3>
                <p className="text-[#6b8f6b] mb-4">
                  Create your first announcement
                </p>
                <button
                  onClick={handleCreateNew}
                  className="px-4 py-2 bg-[#1a4d1a] text-white rounded-lg hover:bg-[#2d7a2d] transition-colors text-sm"
                >
                  New Announcement
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
                          "Date",
                          "Status",
                          "Priority",
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
                      {announcements.map((a) => (
                        <tr
                          key={a.id}
                          className="hover:bg-[#f9fdf9] transition-colors"
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              {a.image_url && (
                                <div className="w-12 h-12 rounded-lg overflow-hidden bg-[#e8f5e8] flex-shrink-0 border border-[#c8e6c8]">
                                  <Image
                                    src={getImageUrl(a.image_url)}
                                    alt={a.title}
                                    width={48}
                                    height={48}
                                    className="w-full h-full object-cover"
                                    unoptimized
                                  />
                                </div>
                              )}
                              <span className="text-sm font-medium text-[#1a2e1a] max-w-xs truncate">
                                {a.title}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getCategoryBadge(a.category)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-[#6b8f6b]">
                            {formatDate(a.date)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              {a.is_active ? (
                                <ToggleRight className="w-5 h-5 text-[#1a4d1a]" />
                              ) : (
                                <ToggleLeft className="w-5 h-5 text-[#a8d4a8]" />
                              )}
                              <span
                                className={`text-sm font-medium ${a.is_active ? "text-[#1a4d1a]" : "text-[#a8d4a8]"}`}
                              >
                                {a.is_active ? "Active" : "Inactive"}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-[#6b8f6b]">
                            {a.priority}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleViewAnnouncement(a)}
                                className="p-1.5 text-[#1a4d1a] hover:bg-[#e8f5e8] rounded transition-colors"
                                title="View"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleEdit(a)}
                                className="p-1.5 text-[#d4a017] hover:bg-[#fdf8e7] rounded transition-colors"
                                title="Edit"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(a.id)}
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

                {!loading && announcements.length > 0 && (
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
                      ? "Create Announcement"
                      : modalMode === "edit"
                        ? "Edit Announcement"
                        : "Announcement Details"}
                  </h2>
                  {selectedAnnouncement && (
                    <p className="text-xs text-[#6b8f6b] mt-0.5">
                      ID #{selectedAnnouncement.id}
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
                {modalMode === "view" && selectedAnnouncement ? (
                  <div className="space-y-6">
                    {selectedAnnouncement.image_url && (
                      <div className="relative w-full h-64 rounded-lg overflow-hidden bg-[#e8f5e8]">
                        <Image
                          src={getImageUrl(selectedAnnouncement.image_url)}
                          alt={selectedAnnouncement.title}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                    )}

                    <div className="flex items-center justify-between p-4 bg-[#f2faf2] border border-[#d0e8d0] rounded-lg">
                      <span className="text-sm font-medium text-[#3d5c3d]">
                        Status
                      </span>
                      <div className="flex items-center gap-2">
                        {selectedAnnouncement.is_active ? (
                          <ToggleRight className="w-5 h-5 text-[#1a4d1a]" />
                        ) : (
                          <ToggleLeft className="w-5 h-5 text-[#a8d4a8]" />
                        )}
                        <span
                          className={`text-sm font-medium ${selectedAnnouncement.is_active ? "text-[#1a4d1a]" : "text-[#a8d4a8]"}`}
                        >
                          {selectedAnnouncement.is_active
                            ? "Active"
                            : "Inactive"}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-semibold text-[#6b8f6b] uppercase tracking-wide mb-1">
                          Title
                        </label>
                        <p className="text-base text-[#1a2e1a]">
                          {selectedAnnouncement.title}
                        </p>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-[#6b8f6b] uppercase tracking-wide mb-1">
                            Category
                          </label>
                          {getCategoryBadge(selectedAnnouncement.category)}
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-[#6b8f6b] uppercase tracking-wide mb-1">
                            Date
                          </label>
                          <p className="text-sm text-[#1a2e1a]">
                            {formatDate(selectedAnnouncement.date)}
                          </p>
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#6b8f6b] uppercase tracking-wide mb-1">
                          Description
                        </label>
                        <p className="text-sm text-[#1a2e1a]">
                          {selectedAnnouncement.description}
                        </p>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#6b8f6b] uppercase tracking-wide mb-1">
                          Content
                        </label>
                        <div className="p-4 bg-[#f2faf2] border border-[#d0e8d0] rounded-lg">
                          <p className="text-sm text-[#1a2e1a] whitespace-pre-wrap">
                            {selectedAnnouncement.content}
                          </p>
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#6b8f6b] uppercase tracking-wide mb-1">
                          Priority
                        </label>
                        <p className="text-sm text-[#1a2e1a]">
                          {selectedAnnouncement.priority}
                        </p>
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
                        placeholder="Enter announcement title"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-[#1a2e1a] mb-1">
                          Category <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={formData.category}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              category: e.target
                                .value as Announcement["category"],
                            })
                          }
                          className="w-full px-3 py-2 border border-[#c8e6c8] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a4d1a]"
                        >
                          <option value="Update">Update</option>
                          <option value="Event">Event</option>
                          <option value="Alert">Alert</option>
                          <option value="Notice">Notice</option>
                          <option value="Development">Development</option>
                          <option value="Health">Health</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[#1a2e1a] mb-1">
                          Date <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="date"
                          value={formData.date}
                          onChange={(e) =>
                            setFormData({ ...formData, date: e.target.value })
                          }
                          className="w-full px-3 py-2 border border-[#c8e6c8] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a4d1a]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#1a2e1a] mb-1">
                        Description <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        value={formData.description}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            description: e.target.value,
                          })
                        }
                        rows={3}
                        className="w-full px-3 py-2 border border-[#c8e6c8] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a4d1a] resize-none"
                        placeholder="Brief description (max 500 characters)"
                        maxLength={500}
                      />
                      <p className="text-xs text-[#6b8f6b] mt-1">
                        {formData.description.length}/500 characters
                      </p>
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
                        rows={8}
                        className="w-full px-3 py-2 border border-[#c8e6c8] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a4d1a] resize-none"
                        placeholder="Full announcement content"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#1a2e1a] mb-2">
                        Featured Image
                      </label>
                      {preview ? (
                        <div className="relative w-full h-48 rounded-lg overflow-hidden bg-[#e8f5e8]">
                          <img
                            src={preview}
                            alt="Preview"
                            className="w-full h-full object-cover"
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
                          Priority (0–100)
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={formData.priority}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              priority: parseInt(e.target.value) || 0,
                            })
                          }
                          className="w-full px-3 py-2 border border-[#c8e6c8] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a4d1a]"
                        />
                        <p className="text-xs text-[#6b8f6b] mt-1">
                          Higher priority appears first
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[#1a2e1a] mb-1">
                          Status
                        </label>
                        <div className="flex items-center gap-2 h-[42px]">
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
                            Active (visible to public)
                          </label>
                        </div>
                      </div>
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
                        onClick={() => handleEdit(selectedAnnouncement!)}
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
                          "Create Announcement"
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
