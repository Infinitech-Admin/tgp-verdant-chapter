"use client";
import { useState, useEffect } from "react";
import {
  Search,
  Eye,
  Plus,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  X,
  Calendar,
} from "lucide-react";
import AdminLayout from "@/components/adminLayout";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/components/ui/use-toast";

interface ChapterHistory {
  id: number;
  year: string;
  title: string;
  content: string;
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

export default function AdminChapterHistoryPage() {
  const { user, loading: authLoading } = useAuth(true);
  const { toast } = useToast();

  const [histories, setHistories] = useState<ChapterHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedHistory, setSelectedHistory] = useState<ChapterHistory | null>(
    null,
  );
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
    year: new Date().getFullYear().toString(),
    title: "",
    content: "",
  });

  useEffect(() => {
    if (!authLoading && user) {
      fetchHistories();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, user, pagination.current_page]);

  const fetchHistories = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.current_page.toString(),
        per_page: pagination.per_page.toString(),
      });
      if (searchQuery) params.append("search", searchQuery);

      const response = await fetch(`/api/admin/chapter-history?${params}`, {
        credentials: "include",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setHistories(data.data || []);
        setPagination({
          current_page: data.current_page,
          last_page: data.last_page,
          per_page: data.per_page,
          total: data.total,
          from: data.from,
          to: data.to,
        });
      } else if (response.status === 401) {
        toast({
          title: "Unauthorized",
          description: "Please log in again",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch chapter history",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching chapter history:", error);
      toast({
        title: "Error",
        description: "Failed to fetch chapter history",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClick = () => {
    setFormData({
      year: new Date().getFullYear().toString(),
      title: "",
      content: "",
    });
    setModalMode("create");
    setIsModalOpen(true);
  };

  const handleEditClick = (history: ChapterHistory) => {
    setFormData({
      year: history.year,
      title: history.title,
      content: history.content,
    });
    setSelectedHistory(history);
    setModalMode("edit");
    setIsModalOpen(true);
  };

  const handleViewClick = (history: ChapterHistory) => {
    setSelectedHistory(history);
    setModalMode("view");
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const url =
        modalMode === "create"
          ? "/api/admin/chapter-history"
          : `/api/admin/chapter-history/${selectedHistory?.id}`;
      const method = modalMode === "create" ? "POST" : "PUT";

      const response = await fetch(url, {
        method,
        credentials: "include",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: `Chapter history ${modalMode === "create" ? "created" : "updated"} successfully`,
        });
        setIsModalOpen(false);
        setPagination({ ...pagination, current_page: 1 });
        fetchHistories();
      } else {
        const error = await response.json();
        toast({
          title: "Error",
          description: error.message || "Failed to save chapter history",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error saving chapter history:", error);
      toast({
        title: "Error",
        description: "Failed to save chapter history",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (historyId: number) => {
    if (!confirm("Are you sure you want to delete this chapter history?"))
      return;
    try {
      const response = await fetch(`/api/admin/chapter-history/${historyId}`, {
        method: "DELETE",
        credentials: "include",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      });
      if (response.ok) {
        toast({
          title: "Success",
          description: "Chapter history deleted successfully",
        });
        fetchHistories();
      } else {
        toast({
          title: "Error",
          description: "Failed to delete chapter history",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error deleting chapter history:", error);
      toast({
        title: "Error",
        description: "Failed to delete chapter history",
        variant: "destructive",
      });
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setPagination({ ...pagination, current_page: 1 });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPagination({ ...pagination, current_page: 1 });
    fetchHistories();
  };

  if (authLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-screen bg-[#f2faf2]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1a4d1a]" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="min-h-screen bg-[#f2faf2]">
        {/* ── Header ── */}
        <div className="bg-white border-b border-[#d0e8d0] sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#e8f5e8] rounded-lg">
                <BookOpen className="w-6 h-6 text-[#1a4d1a]" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-[#1a2e1a]">
                  Chapter History
                </h1>
                <p className="text-xs sm:text-sm text-[#6b8f6b] mt-0.5">
                  Manage fraternity chapter history entries
                </p>
              </div>
            </div>
            <button
              onClick={handleCreateClick}
              className="flex items-center gap-2 px-4 py-2 bg-[#1a4d1a] text-white rounded-lg text-sm font-medium hover:bg-[#2d7a2d] transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add History</span>
            </button>
          </div>
        </div>

        {/* ── Main ── */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5">
          {/* Search */}
          <form
            onSubmit={handleSearchSubmit}
            className="bg-white rounded-xl border border-[#d0e8d0] p-4"
          >
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6b8f6b]" />
                <input
                  type="text"
                  placeholder="Search by year, title, or content..."
                  value={searchQuery}
                  onChange={handleSearch}
                  className="w-full pl-9 pr-3 py-2 border border-[#c8e6c8] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a4d1a] focus:border-transparent"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-[#1a4d1a] text-white rounded-lg text-sm font-medium hover:bg-[#2d7a2d] transition-colors"
              >
                Search
              </button>
            </div>
          </form>

          {/* Table card */}
          <div className="bg-white rounded-xl border border-[#d0e8d0] overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center py-14">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#1a4d1a] mx-auto mb-3" />
                  <p className="text-[#6b8f6b] text-sm">
                    Loading chapter history...
                  </p>
                </div>
              </div>
            ) : histories.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-14">
                <BookOpen className="w-12 h-12 text-[#a8d4a8] mb-3" />
                <p className="text-[#1a2e1a] font-medium">
                  No chapter history found
                </p>
                <p className="text-[#6b8f6b] text-sm mt-1">
                  Add your first entry using the button above
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-[#f2faf2] border-b border-[#d0e8d0]">
                    <tr>
                      {["Year", "Title", "Content Preview", "Actions"].map(
                        (h) => (
                          <th
                            key={h}
                            className={`px-6 py-3 text-xs font-semibold text-[#6b8f6b] uppercase tracking-wider whitespace-nowrap ${h === "Actions" ? "text-right" : "text-left"}`}
                          >
                            {h}
                          </th>
                        ),
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e8f5e8] bg-white">
                    {histories.map((history) => (
                      <tr
                        key={history.id}
                        className="hover:bg-[#f9fdf9] transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-[#6b8f6b]" />
                            <span className="font-medium text-[#1a2e1a]">
                              {history.year}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-medium text-[#1a2e1a]">
                            {history.title}
                          </p>
                        </td>
                        <td className="px-6 py-4 max-w-xs">
                          <p className="text-sm text-[#6b8f6b] line-clamp-2">
                            {history.content}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex justify-end gap-1">
                            <button
                              onClick={() => handleViewClick(history)}
                              className="p-1.5 text-[#1a4d1a] hover:bg-[#e8f5e8] rounded-lg transition-colors"
                              title="View details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleEditClick(history)}
                              className="p-1.5 text-[#3d5c3d] hover:bg-[#e8f5e8] rounded-lg transition-colors"
                              title="Edit history"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(history.id)}
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete history"
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
            )}

            {/* Pagination */}
            {pagination.last_page > 1 && !loading && (
              <div className="px-6 py-4 border-t border-[#d0e8d0] flex flex-col sm:flex-row items-center justify-between gap-3">
                <p className="text-sm text-[#6b8f6b]">
                  Showing {pagination.from} to {pagination.to} of{" "}
                  {pagination.total} entries
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      setPagination({
                        ...pagination,
                        current_page: Math.max(1, pagination.current_page - 1),
                      })
                    }
                    disabled={pagination.current_page === 1}
                    className="p-2 border border-[#c8e6c8] rounded-lg hover:bg-[#f2faf2] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4 text-[#1a4d1a]" />
                  </button>
                  <div className="flex items-center gap-1">
                    {Array.from(
                      { length: pagination.last_page },
                      (_, i) => i + 1,
                    ).map((page) => (
                      <button
                        key={page}
                        onClick={() =>
                          setPagination({ ...pagination, current_page: page })
                        }
                        className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                          pagination.current_page === page
                            ? "bg-[#1a4d1a] text-white"
                            : "border border-[#c8e6c8] text-[#3d5c3d] hover:bg-[#f2faf2]"
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() =>
                      setPagination({
                        ...pagination,
                        current_page: Math.min(
                          pagination.last_page,
                          pagination.current_page + 1,
                        ),
                      })
                    }
                    disabled={pagination.current_page === pagination.last_page}
                    className="p-2 border border-[#c8e6c8] rounded-lg hover:bg-[#f2faf2] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight className="w-4 h-4 text-[#1a4d1a]" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Modal ── */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col bg-white rounded-xl border border-[#d0e8d0] shadow-2xl">
              {/* Modal header */}
              <div className="bg-[#f2faf2] border-b border-[#d0e8d0] px-6 py-4 flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#e8f5e8] rounded-lg">
                    <BookOpen className="w-5 h-5 text-[#1a4d1a]" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-[#1a2e1a]">
                      {modalMode === "view"
                        ? "Chapter History Details"
                        : modalMode === "create"
                          ? "Add Chapter History"
                          : "Edit Chapter History"}
                    </h2>
                    <p className="text-xs text-[#6b8f6b] mt-0.5">
                      {modalMode === "view"
                        ? "Full entry details"
                        : "Fill in the fields below"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 hover:bg-[#d0e8d0] rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-[#6b8f6b]" />
                </button>
              </div>

              {/* Modal body */}
              <div className="flex-1 overflow-y-auto p-6">
                {modalMode === "view" && selectedHistory ? (
                  <div className="space-y-5">
                    {/* Year + Created */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="bg-[#f2faf2] border border-[#d0e8d0] rounded-lg p-4">
                        <p className="text-xs font-medium text-[#6b8f6b] uppercase tracking-wide mb-2">
                          Year
                        </p>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-[#6b8f6b]" />
                          <span className="text-lg font-semibold text-[#1a2e1a]">
                            {selectedHistory.year}
                          </span>
                        </div>
                      </div>
                      <div className="bg-[#f2faf2] border border-[#d0e8d0] rounded-lg p-4">
                        <p className="text-xs font-medium text-[#6b8f6b] uppercase tracking-wide mb-2">
                          Created
                        </p>
                        <p className="text-sm text-[#1a2e1a]">
                          {new Date(
                            selectedHistory.created_at,
                          ).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </p>
                      </div>
                    </div>

                    {/* Title */}
                    <div className="bg-[#f2faf2] border border-[#d0e8d0] rounded-lg p-4">
                      <p className="text-xs font-medium text-[#6b8f6b] uppercase tracking-wide mb-2">
                        Title
                      </p>
                      <p className="text-base font-semibold text-[#1a2e1a]">
                        {selectedHistory.title}
                      </p>
                    </div>

                    {/* Content */}
                    <div className="bg-[#f2faf2] border border-[#d0e8d0] rounded-lg p-4">
                      <p className="text-xs font-medium text-[#6b8f6b] uppercase tracking-wide mb-3">
                        Content
                      </p>
                      <p className="text-sm text-[#1a2e1a] whitespace-pre-wrap leading-relaxed">
                        {selectedHistory.content}
                      </p>
                    </div>
                  </div>
                ) : (
                  <form
                    onSubmit={handleSubmit}
                    className="space-y-4"
                    id="history-form"
                  >
                    <div>
                      <label className="block text-sm font-medium text-[#1a2e1a] mb-1.5">
                        Year <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.year}
                        onChange={(e) =>
                          setFormData({ ...formData, year: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-[#c8e6c8] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a4d1a] focus:border-transparent"
                        placeholder="e.g., 2024"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#1a2e1a] mb-1.5">
                        Title <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.title}
                        onChange={(e) =>
                          setFormData({ ...formData, title: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-[#c8e6c8] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a4d1a] focus:border-transparent"
                        placeholder="e.g., Foundation Year"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#1a2e1a] mb-1.5">
                        Content <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        required
                        value={formData.content}
                        onChange={(e) =>
                          setFormData({ ...formData, content: e.target.value })
                        }
                        rows={12}
                        className="w-full px-3 py-2 border border-[#c8e6c8] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a4d1a] focus:border-transparent resize-none"
                        placeholder="Describe the chapter history for this year..."
                      />
                    </div>
                  </form>
                )}
              </div>

              {/* Modal footer */}
              <div className="border-t border-[#d0e8d0] px-6 py-4 bg-white flex-shrink-0 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 border border-[#c8e6c8] text-[#3d5c3d] rounded-lg hover:bg-[#f2faf2] transition-colors text-sm font-medium"
                >
                  {modalMode === "view" ? "Close" : "Cancel"}
                </button>
                {modalMode !== "view" && (
                  <button
                    type="submit"
                    form="history-form"
                    disabled={isSubmitting}
                    className="px-4 py-2.5 bg-[#1a4d1a] text-white rounded-lg hover:bg-[#2d7a2d] transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                        Saving...
                      </>
                    ) : modalMode === "create" ? (
                      <>
                        <Plus className="w-4 h-4" />
                        Add History
                      </>
                    ) : (
                      <>
                        <Edit className="w-4 h-4" />
                        Update History
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
