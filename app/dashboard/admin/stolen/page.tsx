"use client";
import { useState, useEffect } from "react";
import {
  Search,
  Eye,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  X,
  Calendar,
  CheckCircle,
  Clock,
  XCircle,
  Shield,
  User,
  CreditCard,
} from "lucide-react";
import AdminLayout from "@/components/adminLayout";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/components/ui/use-toast";
import React from "react";

interface LostStolenReport {
  id: number;
  user_id: number;
  user_name?: string;
  user_email?: string;
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
    color: "bg-yellow-100 text-yellow-800",
    icon: Clock,
  },
  under_review: {
    label: "Under Review",
    color: "bg-blue-100 text-blue-800",
    icon: Eye,
  },
  approved: {
    label: "Card Deactivated",
    color: "bg-green-100 text-green-800",
    icon: CheckCircle,
  },
  rejected: {
    label: "Rejected",
    color: "bg-red-100 text-red-800",
    icon: XCircle,
  },
};

export default function AdminLostStolenPage() {
  const { user, loading: authLoading } = useAuth(true);
  const { toast } = useToast();

  const [reports, setReports] = useState<LostStolenReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedReport, setSelectedReport] = useState<LostStolenReport | null>(
    null,
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");

  const [pagination, setPagination] = useState<PaginationData>({
    current_page: 1,
    last_page: 1,
    per_page: 15,
    total: 0,
    from: 0,
    to: 0,
  });

  const [formData, setFormData] = useState({
    status: "pending" as "pending" | "approved" | "rejected" | "under_review",
    admin_response: "",
  });

  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    under_review: 0,
    approved: 0,
    rejected: 0,
    lost_cards: 0,
    stolen_cards: 0,
  });

  useEffect(() => {
    if (!authLoading && user) {
      fetchReports();
      fetchStats();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

      const response = await fetch(`/api/admin/lost-stolen?${params}`, {
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
      } else if (response.status === 401) {
        toast({
          title: "Unauthorized",
          description: "Please log in again",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch reports",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching reports:", error);
      toast({
        title: "Error",
        description: "Failed to fetch reports",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/admin/lost-stolen/stats", {
        credentials: "include",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      });
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const handleViewClick = (report: LostStolenReport) => {
    setSelectedReport(report);
    setFormData({
      status: report.status,
      admin_response: report.admin_response || "",
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await fetch(
        `/api/admin/lost-stolen/${selectedReport?.id}`,
        {
          method: "PUT",
          credentials: "include",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        },
      );
      if (response.ok) {
        toast({ title: "Success", description: "Report updated successfully" });
        setIsModalOpen(false);
        fetchReports();
        fetchStats();
      } else {
        const error = await response.json();
        toast({
          title: "Error",
          description: error.message || "Failed to update report",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error updating report:", error);
      toast({
        title: "Error",
        description: "Failed to update report",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setPagination({ ...pagination, current_page: 1 });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPagination({ ...pagination, current_page: 1 });
    fetchReports();
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
        {/* Header */}
        <div className="bg-white border-b border-[#d0e8d0] sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#e8f5e8] rounded-lg">
                <Shield className="w-6 h-6 text-[#1a4d1a]" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-[#1a2e1a]">
                  Lost/Stolen Card Reports
                </h1>
                <p className="text-xs sm:text-sm text-[#6b8f6b] mt-0.5">
                  Review and manage member card security reports
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5">
          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
            {[
              {
                label: "Total",
                value: stats.total,
                icon: AlertTriangle,
                color: "text-[#6b8f6b]",
              },
              {
                label: "Pending",
                value: stats.pending,
                icon: Clock,
                color: "text-yellow-600",
              },
              {
                label: "Under Review",
                value: stats.under_review,
                icon: Eye,
                color: "text-blue-600",
              },
              {
                label: "Deactivated",
                value: stats.approved,
                icon: CheckCircle,
                color: "text-[#1a4d1a]",
              },
              {
                label: "Rejected",
                value: stats.rejected,
                icon: XCircle,
                color: "text-red-600",
              },
              {
                label: "Lost",
                value: stats.lost_cards,
                icon: CreditCard,
                color: "text-orange-600",
              },
              {
                label: "Stolen",
                value: stats.stolen_cards,
                icon: AlertTriangle,
                color: "text-red-600",
              },
            ].map(({ label, value, icon: Icon, color }) => (
              <div
                key={label}
                className="bg-white rounded-xl border border-[#d0e8d0] p-4"
              >
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className={`text-xs font-medium ${color}`}>{label}</p>
                    <p className="text-2xl font-bold text-[#1a2e1a]">{value}</p>
                  </div>
                  <Icon
                    className={`w-7 h-7 ${color} opacity-60 flex-shrink-0`}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Search & Filters */}
          <div className="bg-white rounded-xl border border-[#d0e8d0] p-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <form onSubmit={handleSearchSubmit} className="flex-1 flex gap-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6b8f6b]" />
                  <input
                    type="text"
                    placeholder="Search by user or description..."
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
              </form>
              <select
                value={filterType}
                onChange={(e) => {
                  setFilterType(e.target.value);
                  setPagination({ ...pagination, current_page: 1 });
                }}
                className="px-3 py-2 border border-[#c8e6c8] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a4d1a] text-[#1a2e1a]"
              >
                <option value="all">All Types</option>
                {REPORT_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
              <select
                value={filterStatus}
                onChange={(e) => {
                  setFilterStatus(e.target.value);
                  setPagination({ ...pagination, current_page: 1 });
                }}
                className="px-3 py-2 border border-[#c8e6c8] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a4d1a] text-[#1a2e1a]"
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
          <div className="bg-white rounded-xl border border-[#d0e8d0] overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center py-14">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#1a4d1a] mx-auto mb-3" />
                  <p className="text-[#6b8f6b] text-sm">Loading reports...</p>
                </div>
              </div>
            ) : reports.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-14">
                <Shield className="w-12 h-12 text-[#a8d4a8] mb-3" />
                <p className="text-[#1a2e1a] font-medium">No reports found</p>
                <p className="text-[#6b8f6b] text-sm mt-1">
                  Reports submitted by members will appear here
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-[#f2faf2] border-b border-[#d0e8d0]">
                    <tr>
                      {[
                        "User",
                        "Type",
                        "Incident Date",
                        "Status",
                        "Reported On",
                        "Actions",
                      ].map((h) => (
                        <th
                          key={h}
                          className={`px-6 py-3 text-xs font-semibold text-[#6b8f6b] uppercase tracking-wider whitespace-nowrap ${h === "Actions" ? "text-right" : "text-left"}`}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e8f5e8] bg-white">
                    {reports.map((report) => {
                      const StatusIcon =
                        STATUS_CONFIG[report.status]?.icon || Clock;
                      return (
                        <tr
                          key={report.id}
                          className="hover:bg-[#f9fdf9] transition-colors"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4 text-[#6b8f6b]" />
                              <div>
                                <p className="text-sm font-medium text-[#1a2e1a]">
                                  {report.user_name || "N/A"}
                                </p>
                                <p className="text-xs text-[#6b8f6b]">
                                  {report.user_email || ""}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${report.report_type === "stolen" ? "bg-red-100 text-red-800" : "bg-orange-100 text-orange-800"}`}
                            >
                              <AlertTriangle className="w-3 h-3" />
                              {REPORT_TYPES.find(
                                (t) => t.value === report.report_type,
                              )?.label || report.report_type}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2 text-sm text-[#1a2e1a]">
                              <Calendar className="w-4 h-4 text-[#6b8f6b]" />
                              {new Date(
                                report.incident_date,
                              ).toLocaleDateString()}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_CONFIG[report.status]?.color || "bg-gray-100 text-gray-800"}`}
                            >
                              <StatusIcon className="w-3.5 h-3.5" />
                              {STATUS_CONFIG[report.status]?.label ||
                                report.status}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2 text-sm text-[#6b8f6b]">
                              <Calendar className="w-4 h-4" />
                              {new Date(report.created_at).toLocaleDateString()}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex justify-end">
                              <button
                                onClick={() => handleViewClick(report)}
                                className="p-1.5 text-[#1a4d1a] hover:bg-[#e8f5e8] rounded-lg transition-colors"
                                title="View and respond"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
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
                        className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${pagination.current_page === page ? "bg-[#1a4d1a] text-white" : "border border-[#c8e6c8] text-[#3d5c3d] hover:bg-[#f2faf2]"}`}
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

        {/* Modal */}
        {isModalOpen && selectedReport && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col bg-white rounded-xl border border-[#d0e8d0] shadow-2xl">
              {/* Modal header */}
              <div className="bg-[#f2faf2] border-b border-[#d0e8d0] px-6 py-4 flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#e8f5e8] rounded-lg">
                    <Shield className="w-5 h-5 text-[#1a4d1a]" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-[#1a2e1a]">
                      Review Lost/Stolen Report
                    </h2>
                    <p className="text-xs text-[#6b8f6b] mt-0.5">
                      Update status and respond to member
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
              <div className="flex-1 overflow-y-auto p-6 space-y-5">
                {/* Report details */}
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-[#f2faf2] border border-[#d0e8d0] rounded-lg p-4">
                      <p className="text-xs font-medium text-[#6b8f6b] uppercase tracking-wide mb-2">
                        Reported By
                      </p>
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-[#6b8f6b]" />
                        <div>
                          <p className="text-sm font-semibold text-[#1a2e1a]">
                            {selectedReport.user_name || "N/A"}
                          </p>
                          <p className="text-xs text-[#6b8f6b]">
                            {selectedReport.user_email || ""}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-[#f2faf2] border border-[#d0e8d0] rounded-lg p-4">
                      <p className="text-xs font-medium text-[#6b8f6b] uppercase tracking-wide mb-2">
                        Report Type
                      </p>
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${selectedReport.report_type === "stolen" ? "bg-red-100 text-red-800" : "bg-orange-100 text-orange-800"}`}
                      >
                        <AlertTriangle className="w-3 h-3" />
                        {REPORT_TYPES.find(
                          (t) => t.value === selectedReport.report_type,
                        )?.label || selectedReport.report_type}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-[#f2faf2] border border-[#d0e8d0] rounded-lg p-4">
                      <p className="text-xs font-medium text-[#6b8f6b] uppercase tracking-wide mb-2">
                        Incident Date
                      </p>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-[#6b8f6b]" />
                        <span className="text-sm font-semibold text-[#1a2e1a]">
                          {new Date(
                            selectedReport.incident_date,
                          ).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                    </div>
                    <div className="bg-[#f2faf2] border border-[#d0e8d0] rounded-lg p-4">
                      <p className="text-xs font-medium text-[#6b8f6b] uppercase tracking-wide mb-2">
                        Reported On
                      </p>
                      <p className="text-sm text-[#1a2e1a]">
                        {new Date(selectedReport.created_at).toLocaleDateString(
                          "en-US",
                          { year: "numeric", month: "short", day: "numeric" },
                        )}
                      </p>
                    </div>
                  </div>

                  {selectedReport.incident_location && (
                    <div className="bg-[#f2faf2] border border-[#d0e8d0] rounded-lg p-4">
                      <p className="text-xs font-medium text-[#6b8f6b] uppercase tracking-wide mb-2">
                        Incident Location
                      </p>
                      <p className="text-sm text-[#1a2e1a]">
                        {selectedReport.incident_location}
                      </p>
                    </div>
                  )}

                  <div className="bg-[#f2faf2] border border-[#d0e8d0] rounded-lg p-4">
                    <p className="text-xs font-medium text-[#6b8f6b] uppercase tracking-wide mb-3">
                      Description
                    </p>
                    <p className="text-sm text-[#1a2e1a] whitespace-pre-wrap leading-relaxed">
                      {selectedReport.description}
                    </p>
                  </div>
                </div>

                {/* Admin response form */}
                <form
                  onSubmit={handleSubmit}
                  className="space-y-4"
                  id="report-form"
                >
                  <div>
                    <label className="block text-sm font-medium text-[#1a2e1a] mb-1.5">
                      Status <span className="text-red-500">*</span>
                    </label>
                    <select
                      required
                      value={formData.status}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          status: e.target.value as any,
                        })
                      }
                      className="w-full px-3 py-2 border border-[#c8e6c8] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a4d1a] focus:border-transparent"
                    >
                      <option value="pending">Pending</option>
                      <option value="under_review">Under Review</option>
                      <option value="approved">
                        Approve & Deactivate Card
                      </option>
                      <option value="rejected">Reject Report</option>
                    </select>
                    {formData.status === "approved" && (
                      <p className="text-xs text-red-600 mt-1">
                        ⚠️ This will deactivate the member's card to protect
                        their account and all member information.
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#1a2e1a] mb-1.5">
                      Admin Response
                    </label>
                    <textarea
                      value={formData.admin_response}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          admin_response: e.target.value,
                        })
                      }
                      rows={6}
                      className="w-full px-3 py-2 border border-[#c8e6c8] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a4d1a] focus:border-transparent resize-none"
                      placeholder="Provide feedback to the member about their report and next steps..."
                    />
                    <p className="text-xs text-[#6b8f6b] mt-1">
                      This response will be visible to the member who submitted
                      the report.
                    </p>
                  </div>
                </form>
              </div>

              {/* Modal footer */}
              <div className="border-t border-[#d0e8d0] px-6 py-4 bg-white flex-shrink-0 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 border border-[#c8e6c8] text-[#3d5c3d] rounded-lg hover:bg-[#f2faf2] transition-colors text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  form="report-form"
                  disabled={isSubmitting}
                  className="px-4 py-2.5 bg-[#1a4d1a] text-white rounded-lg hover:bg-[#2d7a2d] transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Shield className="w-4 h-4" />
                      Update Report
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
