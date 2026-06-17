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
  MessageSquare,
  X,
  Calendar,
  CheckCircle,
  Clock,
  XCircle,
  Lightbulb,
} from "lucide-react";
import MemberLayout from "@/components/memberLayout";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/components/ui/use-toast";
import React from "react";

interface Suggestion {
  id: number;
  title: string;
  category: string;
  description: string;
  status: "pending" | "approved" | "rejected" | "under_review";
  admin_response?: string;
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

const SUGGESTION_CATEGORIES = [
  { value: "system_improvement", label: "System Improvement" },
  { value: "feature_request", label: "Feature Request" },
  { value: "user_experience", label: "User Experience" },
  { value: "security", label: "Security" },
  { value: "performance", label: "Performance" },
  { value: "content", label: "Content" },
  { value: "general", label: "General Feedback" },
  { value: "other", label: "Other" },
];

const STATUS_CONFIG = {
  pending: {
    label: "Pending",
    color: "bg-yellow-50 text-yellow-700 border border-yellow-200",
    icon: Clock,
  },
  under_review: {
    label: "Under Review",
    color: "bg-blue-50 text-blue-700 border border-blue-200",
    icon: Eye,
  },
  approved: {
    label: "Approved",
    color: "bg-[#e8f5e8] text-[#1a4d1a] border border-[#d0e8d0]",
    icon: CheckCircle,
  },
  rejected: {
    label: "Rejected",
    color: "bg-red-50 text-red-700 border border-red-200",
    icon: XCircle,
  },
};

export default function MemberSuggestionsPage() {
  const { user, loading: authLoading } = useAuth(true);
  const { toast } = useToast();

  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSuggestion, setSelectedSuggestion] =
    useState<Suggestion | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"view" | "create" | "edit">(
    "view",
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterCategory, setFilterCategory] = useState<string>("all");

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
    category: "general",
    description: "",
  });

  useEffect(() => {
    if (!authLoading && user) fetchSuggestions();
  }, [
    authLoading,
    user,
    pagination.current_page,
    filterStatus,
    filterCategory,
  ]);

  const fetchSuggestions = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.current_page.toString(),
        per_page: pagination.per_page.toString(),
      });
      if (searchQuery) params.append("search", searchQuery);
      if (filterStatus !== "all") params.append("status", filterStatus);
      if (filterCategory !== "all") params.append("category", filterCategory);

      const response = await fetch(`/api/member/suggestions?${params}`, {
        credentials: "include",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      });
      if (response.ok) {
        const data = await response.json();
        setSuggestions(data.data || []);
        setPagination({
          current_page: data.current_page,
          last_page: data.last_page,
          per_page: data.per_page,
          total: data.total,
          from: data.from,
          to: data.to,
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch suggestions",
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to fetch suggestions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClick = () => {
    setFormData({ title: "", category: "general", description: "" });
    setModalMode("create");
    setIsModalOpen(true);
  };

  const handleEditClick = (s: Suggestion) => {
    if (s.status !== "pending") {
      toast({
        title: "Cannot Edit",
        description: "Only pending suggestions can be edited",
        variant: "destructive",
      });
      return;
    }
    setFormData({
      title: s.title,
      category: s.category,
      description: s.description,
    });
    setSelectedSuggestion(s);
    setModalMode("edit");
    setIsModalOpen(true);
  };

  const handleViewClick = (s: Suggestion) => {
    setSelectedSuggestion(s);
    setModalMode("view");
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const url =
        modalMode === "create"
          ? "/api/member/suggestions"
          : `/api/member/suggestions/${selectedSuggestion?.id}`;
      const response = await fetch(url, {
        method: modalMode === "create" ? "POST" : "PUT",
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
          description: `Suggestion ${modalMode === "create" ? "submitted" : "updated"} successfully`,
        });
        setIsModalOpen(false);
        setPagination((p) => ({ ...p, current_page: 1 }));
        fetchSuggestions();
      } else {
        const error = await response.json();
        toast({
          title: "Error",
          description: error.message || "Failed to save suggestion",
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to save suggestion",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    const s = suggestions.find((s) => s.id === id);
    if (s?.status !== "pending") {
      toast({
        title: "Cannot Delete",
        description: "Only pending suggestions can be deleted",
        variant: "destructive",
      });
      return;
    }
    if (!confirm("Are you sure you want to delete this suggestion?")) return;
    try {
      const response = await fetch(`/api/member/suggestions/${id}`, {
        method: "DELETE",
        credentials: "include",
        headers: { Accept: "application/json" },
      });
      if (response.ok) {
        toast({
          title: "Success",
          description: "Suggestion deleted successfully",
        });
        fetchSuggestions();
      } else
        toast({
          title: "Error",
          description: "Failed to delete suggestion",
          variant: "destructive",
        });
    } catch {
      toast({
        title: "Error",
        description: "Failed to delete suggestion",
        variant: "destructive",
      });
    }
  };

  const inputClass =
    "w-full px-3 py-2 border border-[#d0e8d0] rounded-lg text-sm text-[#1a2e1a] placeholder-[#6b8f6b] focus:outline-none focus:ring-2 focus:ring-[#1a4d1a] focus:border-transparent bg-white";

  return (
    <MemberLayout>
      <div className="min-h-screen bg-[#f2faf2] overflow-x-hidden">
        {/* Header */}
        <div className="bg-white border-b border-[#d0e8d0] sticky top-0 z-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <div className="p-2 bg-[#e8f5e8] rounded-lg shrink-0">
                <Lightbulb className="w-5 h-5 text-[#1a4d1a]" />
              </div>
              <div className="min-w-0">
                <h1 className="text-base sm:text-xl font-bold text-[#1a2e1a] truncate">
                  My Suggestions
                </h1>
                <p className="text-xs text-[#6b8f6b]">
                  Share your honest feedback and help us improve
                </p>
              </div>
            </div>
            <button
              onClick={handleCreateClick}
              className="flex items-center gap-2 bg-[#1a4d1a] hover:bg-[#163f16] text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              New Suggestion
            </button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-4">
          {/* Filters */}
          <div className="bg-white border border-[#d0e8d0] rounded-xl p-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6b8f6b] w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search suggestions..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setPagination((p) => ({ ...p, current_page: 1 }));
                  }}
                  onKeyDown={(e) => e.key === "Enter" && fetchSuggestions()}
                  className={`pl-9 ${inputClass}`}
                />
              </div>
              <select
                value={filterCategory}
                onChange={(e) => {
                  setFilterCategory(e.target.value);
                  setPagination((p) => ({ ...p, current_page: 1 }));
                }}
                className={inputClass}
                style={{ width: "auto" }}
              >
                <option value="all">All Categories</option>
                {SUGGESTION_CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
              <select
                value={filterStatus}
                onChange={(e) => {
                  setFilterStatus(e.target.value);
                  setPagination((p) => ({ ...p, current_page: 1 }));
                }}
                className={inputClass}
                style={{ width: "auto" }}
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="under_review">Under Review</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white border border-[#d0e8d0] rounded-xl overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <div className="w-10 h-10 border-4 border-[#1a4d1a] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : suggestions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-14 h-14 bg-[#e8f5e8] rounded-full flex items-center justify-center mb-4">
                  <MessageSquare className="w-7 h-7 text-[#6b8f6b]" />
                </div>
                <h3 className="text-sm font-semibold text-[#1a2e1a] mb-1">
                  No suggestions found
                </h3>
                <p className="text-xs text-[#6b8f6b]">
                  Be the first to share your feedback!
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-[#f2faf2] border-b border-[#d0e8d0]">
                    <tr>
                      {["Title", "Category", "Status", "Date", "Actions"].map(
                        (h) => (
                          <th
                            key={h}
                            className={`px-6 py-3 text-xs font-semibold text-[#3d5c3d] uppercase tracking-wide ${h === "Actions" ? "text-right" : "text-left"}`}
                          >
                            {h}
                          </th>
                        ),
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#d0e8d0]">
                    {suggestions.map((s) => {
                      const StatusIcon = STATUS_CONFIG[s.status]?.icon || Clock;
                      return (
                        <tr
                          key={s.id}
                          className="hover:bg-[#f2faf2] transition-colors"
                        >
                          <td className="px-6 py-4">
                            <p className="text-sm font-medium text-[#1a2e1a]">
                              {s.title}
                            </p>
                            <p className="text-xs text-[#6b8f6b] line-clamp-1 mt-0.5">
                              {s.description}
                            </p>
                          </td>
                          <td className="px-6 py-4 text-xs text-[#3d5c3d]">
                            {SUGGESTION_CATEGORIES.find(
                              (c) => c.value === s.category,
                            )?.label || s.category}
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${STATUS_CONFIG[s.status]?.color || "bg-gray-100 text-gray-700"}`}
                            >
                              <StatusIcon className="w-3 h-3" />
                              {STATUS_CONFIG[s.status]?.label || s.status}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-1.5 text-xs text-[#6b8f6b]">
                              <Calendar className="w-3.5 h-3.5" />
                              {new Date(s.created_at).toLocaleDateString()}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex justify-end gap-1">
                              <button
                                onClick={() => handleViewClick(s)}
                                className="p-1.5 rounded-lg text-[#1a4d1a] hover:bg-[#e8f5e8] transition-colors"
                                title="View details"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              {s.status === "pending" && (
                                <>
                                  <button
                                    onClick={() => handleEditClick(s)}
                                    className="p-1.5 rounded-lg text-[#3d5c3d] hover:bg-[#e8f5e8] transition-colors"
                                    title="Edit"
                                  >
                                    <Edit className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleDelete(s.id)}
                                    className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                                    title="Delete"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Pagination */}
          {pagination.last_page > 1 && (
            <div className="bg-white border border-[#d0e8d0] rounded-xl px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-xs text-[#6b8f6b]">
                Showing {pagination.from}–{pagination.to} of {pagination.total}{" "}
                entries
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    setPagination((p) => ({
                      ...p,
                      current_page: Math.max(1, p.current_page - 1),
                    }))
                  }
                  disabled={pagination.current_page === 1}
                  className="p-2 border border-[#d0e8d0] rounded-lg text-[#1a4d1a] hover:bg-[#e8f5e8] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <div className="flex items-center gap-1">
                  {Array.from(
                    { length: pagination.last_page },
                    (_, i) => i + 1,
                  ).map((page) => (
                    <button
                      key={page}
                      onClick={() =>
                        setPagination((p) => ({ ...p, current_page: page }))
                      }
                      className={`w-8 h-8 rounded-lg text-xs font-semibold transition-colors ${pagination.current_page === page ? "bg-[#1a4d1a] text-white" : "border border-[#d0e8d0] text-[#3d5c3d] hover:bg-[#e8f5e8]"}`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() =>
                    setPagination((p) => ({
                      ...p,
                      current_page: Math.min(p.last_page, p.current_page + 1),
                    }))
                  }
                  disabled={pagination.current_page === pagination.last_page}
                  className="p-2 border border-[#d0e8d0] rounded-lg text-[#1a4d1a] hover:bg-[#e8f5e8] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
            <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white border border-[#d0e8d0] shadow-xl">
              {/* Modal Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-[#d0e8d0] bg-[#f2faf2]">
                <h2 className="text-sm font-bold text-[#1a2e1a]">
                  {modalMode === "view"
                    ? "Suggestion Details"
                    : modalMode === "create"
                      ? "New Suggestion"
                      : "Edit Suggestion"}
                </h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-[#6b8f6b] hover:text-[#1a2e1a] transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {modalMode === "view" && selectedSuggestion ? (
                <div className="p-5 space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-[#f2faf2] border border-[#d0e8d0] rounded-lg p-3">
                      <p className="text-xs text-[#6b8f6b] mb-1">Category</p>
                      <p className="text-xs font-semibold text-[#1a2e1a]">
                        {SUGGESTION_CATEGORIES.find(
                          (c) => c.value === selectedSuggestion.category,
                        )?.label || selectedSuggestion.category}
                      </p>
                    </div>
                    <div className="bg-[#f2faf2] border border-[#d0e8d0] rounded-lg p-3">
                      <p className="text-xs text-[#6b8f6b] mb-1">Status</p>
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${STATUS_CONFIG[selectedSuggestion.status]?.color || "bg-gray-100 text-gray-700"}`}
                      >
                        {React.createElement(
                          STATUS_CONFIG[selectedSuggestion.status]?.icon ||
                            Clock,
                          { className: "w-3 h-3" },
                        )}
                        {STATUS_CONFIG[selectedSuggestion.status]?.label ||
                          selectedSuggestion.status}
                      </span>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-[#6b8f6b] mb-1">Title</p>
                    <p className="text-sm font-semibold text-[#1a2e1a]">
                      {selectedSuggestion.title}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-[#6b8f6b] mb-1">Description</p>
                    <p className="text-xs text-[#3d5c3d] whitespace-pre-wrap leading-relaxed">
                      {selectedSuggestion.description}
                    </p>
                  </div>

                  {selectedSuggestion.admin_response && (
                    <div className="bg-[#e8f5e8] border border-[#d0e8d0] rounded-lg p-4">
                      <h3 className="text-xs font-semibold text-[#1a4d1a] mb-2 flex items-center gap-2">
                        <MessageSquare className="w-3.5 h-3.5" />
                        Admin Response
                      </h3>
                      <p className="text-xs text-[#3d5c3d] whitespace-pre-wrap">
                        {selectedSuggestion.admin_response}
                      </p>
                    </div>
                  )}

                  <div className="text-xs text-[#6b8f6b] pt-1 border-t border-[#d0e8d0]">
                    <p>
                      Submitted on{" "}
                      {new Date(selectedSuggestion.created_at).toLocaleString()}
                    </p>
                    {selectedSuggestion.updated_at !==
                      selectedSuggestion.created_at && (
                      <p>
                        Last updated on{" "}
                        {new Date(
                          selectedSuggestion.updated_at,
                        ).toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="p-5 space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-[#3d5c3d] mb-1">
                      Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      maxLength={200}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                      placeholder="Brief title for your suggestion"
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#3d5c3d] mb-1">
                      Category *
                    </label>
                    <select
                      required
                      value={formData.category}
                      onChange={(e) =>
                        setFormData({ ...formData, category: e.target.value })
                      }
                      className={inputClass}
                    >
                      {SUGGESTION_CATEGORIES.map((cat) => (
                        <option key={cat.value} value={cat.value}>
                          {cat.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#3d5c3d] mb-1">
                      Description *
                    </label>
                    <textarea
                      required
                      value={formData.description}
                      rows={8}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      placeholder="Describe your suggestion in detail. How can we improve?"
                      className={inputClass}
                    />
                  </div>

                  <div className="bg-[#e8f5e8] border border-[#d0e8d0] rounded-lg p-3">
                    <p className="text-xs text-[#3d5c3d]">
                      <strong className="text-[#1a4d1a]">Note:</strong> Your
                      suggestion will be reviewed by the admin team. You can
                      only edit or delete suggestions that are still pending.
                    </p>
                  </div>

                  <div className="flex gap-2 justify-end pt-2">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="px-4 py-2 text-xs font-semibold border border-[#d0e8d0] text-[#3d5c3d] rounded-lg hover:bg-[#f2faf2] transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-4 py-2 text-xs font-semibold bg-[#1a4d1a] text-white rounded-lg hover:bg-[#163f16] disabled:opacity-50 transition-colors"
                    >
                      {isSubmitting
                        ? "Submitting..."
                        : modalMode === "create"
                          ? "Submit Suggestion"
                          : "Update Suggestion"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </MemberLayout>
  );
}
