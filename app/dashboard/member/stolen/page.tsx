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
  AlertTriangle,
  X,
  Calendar,
  CheckCircle,
  Clock,
  XCircle,
  Shield,
  CreditCard,
} from "lucide-react";
import MemberLayout from "@/components/memberLayout";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/components/ui/use-toast";
import React from "react";

interface LostStolenReport {
  id: number;
  report_type: "lost" | "stolen";
  incident_date: string;
  incident_location?: string;
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

const REPORT_TYPES = [
  { value: "lost", label: "Lost Card" },
  { value: "stolen", label: "Stolen Card" },
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
    label: "Card Deactivated",
    color: "bg-[#e8f5e8] text-[#1a4d1a] border border-[#d0e8d0]",
    icon: CheckCircle,
  },
  rejected: {
    label: "Rejected",
    color: "bg-red-50 text-red-700 border border-red-200",
    icon: XCircle,
  },
};

export default function MemberLostStolenPage() {
  const { user, loading: authLoading } = useAuth(true);
  const { toast } = useToast();

  const [reports, setReports] = useState<LostStolenReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedReport, setSelectedReport] = useState<LostStolenReport | null>(
    null,
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"view" | "create" | "edit">(
    "view",
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterType, setFilterType] = useState("all");

  const [pagination, setPagination] = useState<PaginationData>({
    current_page: 1,
    last_page: 1,
    per_page: 15,
    total: 0,
    from: 0,
    to: 0,
  });

  const [formData, setFormData] = useState({
    report_type: "lost" as "lost" | "stolen",
    incident_date: "",
    incident_location: "",
    description: "",
  });

  useEffect(() => {
    if (!authLoading && user) fetchReports();
  }, [authLoading, user, pagination.current_page, filterStatus, filterType]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.current_page.toString(),
        per_page: pagination.per_page.toString(),
      });
      if (searchQuery) params.append("search", searchQuery);
      if (filterStatus !== "all") params.append("status", filterStatus);
      if (filterType !== "all") params.append("report_type", filterType);

      const response = await fetch(`/api/member/lost-stolen?${params}`, {
        credentials: "include",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      });
      if (response.ok) {
        const data = await response.json();
        setReports(data.data || []);
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
          description: "Failed to fetch reports",
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to fetch reports",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClick = () => {
    setFormData({
      report_type: "lost",
      incident_date: "",
      incident_location: "",
      description: "",
    });
    setModalMode("create");
    setIsModalOpen(true);
  };

  const handleEditClick = (r: LostStolenReport) => {
    if (r.status !== "pending") {
      toast({
        title: "Cannot Edit",
        description: "Only pending reports can be edited",
        variant: "destructive",
      });
      return;
    }
    setFormData({
      report_type: r.report_type,
      incident_date: r.incident_date,
      incident_location: r.incident_location || "",
      description: r.description,
    });
    setSelectedReport(r);
    setModalMode("edit");
    setIsModalOpen(true);
  };

  const handleViewClick = (r: LostStolenReport) => {
    setSelectedReport(r);
    setModalMode("view");
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const url =
        modalMode === "create"
          ? "/api/member/lost-stolen"
          : `/api/member/lost-stolen/${selectedReport?.id}`;
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
          description: `Report ${modalMode === "create" ? "submitted" : "updated"} successfully`,
        });
        setIsModalOpen(false);
        setPagination((p) => ({ ...p, current_page: 1 }));
        fetchReports();
      } else {
        const error = await response.json();
        toast({
          title: "Error",
          description: error.message || "Failed to save report",
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to save report",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    const r = reports.find((r) => r.id === id);
    if (r?.status !== "pending") {
      toast({
        title: "Cannot Delete",
        description: "Only pending reports can be deleted",
        variant: "destructive",
      });
      return;
    }
    if (!confirm("Are you sure you want to delete this report?")) return;
    try {
      const response = await fetch(`/api/member/lost-stolen/${id}`, {
        method: "DELETE",
        credentials: "include",
        headers: { Accept: "application/json" },
      });
      if (response.ok) {
        toast({ title: "Success", description: "Report deleted successfully" });
        fetchReports();
      } else
        toast({
          title: "Error",
          description: "Failed to delete report",
          variant: "destructive",
        });
    } catch {
      toast({
        title: "Error",
        description: "Failed to delete report",
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
              <div className="p-2 bg-red-50 rounded-lg shrink-0">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div className="min-w-0">
                <h1 className="text-base sm:text-xl font-bold text-[#1a2e1a] truncate">
                  Lost/Stolen Card Reports
                </h1>
                <p className="text-xs text-[#6b8f6b]">
                  Report a lost or stolen card immediately to protect your
                  account
                </p>
              </div>
            </div>
            <button
              onClick={handleCreateClick}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Report Lost/Stolen</span>
              <span className="sm:hidden">Report</span>
            </button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-4">
          {/* Security Warning Banner — intentionally red */}
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-semibold text-red-900">
                  Important Security Notice
                </h3>
                <p className="text-xs text-red-700 mt-1 leading-relaxed">
                  We advise all members to keep their membership card safe. If
                  you do not have your card in your possession, report it
                  immediately to guarantee the security of not just your own
                  information but all members.
                </p>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white border border-[#d0e8d0] rounded-xl p-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6b8f6b] w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search reports..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setPagination((p) => ({ ...p, current_page: 1 }));
                  }}
                  onKeyDown={(e) => e.key === "Enter" && fetchReports()}
                  className={`pl-9 ${inputClass}`}
                />
              </div>
              <select
                value={filterType}
                onChange={(e) => {
                  setFilterType(e.target.value);
                  setPagination((p) => ({ ...p, current_page: 1 }));
                }}
                className={inputClass}
                style={{ width: "auto" }}
              >
                <option value="all">All Types</option>
                {REPORT_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
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
                <option value="approved">Card Deactivated</option>
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
            ) : reports.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-14 h-14 bg-[#e8f5e8] rounded-full flex items-center justify-center mb-4">
                  <CreditCard className="w-7 h-7 text-[#6b8f6b]" />
                </div>
                <h3 className="text-sm font-semibold text-[#1a2e1a] mb-1">
                  No reports found
                </h3>
                <p className="text-xs text-[#6b8f6b]">
                  Keep your card safe and secure!
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-[#f2faf2] border-b border-[#d0e8d0]">
                    <tr>
                      {[
                        "Type",
                        "Incident Date",
                        "Status",
                        "Reported On",
                        "Actions",
                      ].map((h) => (
                        <th
                          key={h}
                          className={`px-6 py-3 text-xs font-semibold text-[#3d5c3d] uppercase tracking-wide ${h === "Actions" ? "text-right" : "text-left"}`}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#d0e8d0]">
                    {reports.map((r) => {
                      const StatusIcon = STATUS_CONFIG[r.status]?.icon || Clock;
                      return (
                        <tr
                          key={r.id}
                          className="hover:bg-[#f2faf2] transition-colors"
                        >
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${r.report_type === "stolen" ? "bg-red-50 text-red-700 border-red-200" : "bg-orange-50 text-orange-700 border-orange-200"}`}
                            >
                              <AlertTriangle className="w-3 h-3" />
                              {REPORT_TYPES.find(
                                (t) => t.value === r.report_type,
                              )?.label || r.report_type}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-1.5 text-xs text-[#6b8f6b]">
                              <Calendar className="w-3.5 h-3.5" />
                              {new Date(r.incident_date).toLocaleDateString()}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${STATUS_CONFIG[r.status]?.color || "bg-gray-100 text-gray-700"}`}
                            >
                              <StatusIcon className="w-3 h-3" />
                              {STATUS_CONFIG[r.status]?.label || r.status}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-1.5 text-xs text-[#6b8f6b]">
                              <Calendar className="w-3.5 h-3.5" />
                              {new Date(r.created_at).toLocaleDateString()}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex justify-end gap-1">
                              <button
                                onClick={() => handleViewClick(r)}
                                className="p-1.5 rounded-lg text-[#1a4d1a] hover:bg-[#e8f5e8] transition-colors"
                                title="View details"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              {r.status === "pending" && (
                                <>
                                  <button
                                    onClick={() => handleEditClick(r)}
                                    className="p-1.5 rounded-lg text-[#3d5c3d] hover:bg-[#e8f5e8] transition-colors"
                                    title="Edit"
                                  >
                                    <Edit className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleDelete(r.id)}
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
                    ? "Report Details"
                    : modalMode === "create"
                      ? "Report Lost/Stolen Card"
                      : "Edit Report"}
                </h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-[#6b8f6b] hover:text-[#1a2e1a] transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {modalMode === "view" && selectedReport ? (
                <div className="p-5 space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-[#f2faf2] border border-[#d0e8d0] rounded-lg p-3">
                      <p className="text-xs text-[#6b8f6b] mb-1">Report Type</p>
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${selectedReport.report_type === "stolen" ? "bg-red-50 text-red-700 border-red-200" : "bg-orange-50 text-orange-700 border-orange-200"}`}
                      >
                        <AlertTriangle className="w-3 h-3" />
                        {REPORT_TYPES.find(
                          (t) => t.value === selectedReport.report_type,
                        )?.label || selectedReport.report_type}
                      </span>
                    </div>
                    <div className="bg-[#f2faf2] border border-[#d0e8d0] rounded-lg p-3">
                      <p className="text-xs text-[#6b8f6b] mb-1">Status</p>
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${STATUS_CONFIG[selectedReport.status]?.color || "bg-gray-100 text-gray-700"}`}
                      >
                        {React.createElement(
                          STATUS_CONFIG[selectedReport.status]?.icon || Clock,
                          { className: "w-3 h-3" },
                        )}
                        {STATUS_CONFIG[selectedReport.status]?.label ||
                          selectedReport.status}
                      </span>
                    </div>
                    <div className="bg-[#f2faf2] border border-[#d0e8d0] rounded-lg p-3">
                      <p className="text-xs text-[#6b8f6b] mb-1">
                        Incident Date
                      </p>
                      <p className="text-xs font-semibold text-[#1a2e1a]">
                        {new Date(
                          selectedReport.incident_date,
                        ).toLocaleDateString()}
                      </p>
                    </div>
                    {selectedReport.incident_location && (
                      <div className="bg-[#f2faf2] border border-[#d0e8d0] rounded-lg p-3">
                        <p className="text-xs text-[#6b8f6b] mb-1">Location</p>
                        <p className="text-xs font-semibold text-[#1a2e1a]">
                          {selectedReport.incident_location}
                        </p>
                      </div>
                    )}
                  </div>

                  <div>
                    <p className="text-xs text-[#6b8f6b] mb-1">Description</p>
                    <p className="text-xs text-[#3d5c3d] whitespace-pre-wrap leading-relaxed">
                      {selectedReport.description}
                    </p>
                  </div>

                  {selectedReport.admin_response && (
                    <div className="bg-[#e8f5e8] border border-[#d0e8d0] rounded-lg p-4">
                      <h3 className="text-xs font-semibold text-[#1a4d1a] mb-2 flex items-center gap-2">
                        <Shield className="w-3.5 h-3.5" />
                        Admin Response
                      </h3>
                      <p className="text-xs text-[#3d5c3d] whitespace-pre-wrap">
                        {selectedReport.admin_response}
                      </p>
                    </div>
                  )}

                  <div className="text-xs text-[#6b8f6b] pt-1 border-t border-[#d0e8d0]">
                    <p>
                      Reported on{" "}
                      {new Date(selectedReport.created_at).toLocaleString()}
                    </p>
                    {selectedReport.updated_at !==
                      selectedReport.created_at && (
                      <p>
                        Last updated on{" "}
                        {new Date(selectedReport.updated_at).toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="p-5 space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-[#3d5c3d] mb-1">
                      Report Type *
                    </label>
                    <select
                      required
                      value={formData.report_type}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          report_type: e.target.value as "lost" | "stolen",
                        })
                      }
                      className={inputClass}
                    >
                      {REPORT_TYPES.map((t) => (
                        <option key={t.value} value={t.value}>
                          {t.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#3d5c3d] mb-1">
                      Incident Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.incident_date}
                      max={new Date().toISOString().split("T")[0]}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          incident_date: e.target.value,
                        })
                      }
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#3d5c3d] mb-1">
                      Incident Location
                    </label>
                    <input
                      type="text"
                      value={formData.incident_location}
                      maxLength={200}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          incident_location: e.target.value,
                        })
                      }
                      placeholder="Where did the incident occur? (optional)"
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#3d5c3d] mb-1">
                      Description *
                    </label>
                    <textarea
                      required
                      value={formData.description}
                      rows={6}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      placeholder="Provide details about when and how your card was lost or stolen."
                      className={inputClass}
                    />
                  </div>

                  {/* Warning — intentionally red, it's a critical security notice */}
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-xs text-red-700">
                      <strong className="text-red-800">Important:</strong> Once
                      submitted, your card will be flagged for review. If
                      approved, it will be deactivated to protect your account.
                      You can only edit or delete this report while it's
                      pending.
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
                      className="px-4 py-2 text-xs font-semibold bg-red-600 hover:bg-red-700 text-white rounded-lg disabled:opacity-50 transition-colors"
                    >
                      {isSubmitting
                        ? "Submitting..."
                        : modalMode === "create"
                          ? "Submit Report"
                          : "Update Report"}
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
