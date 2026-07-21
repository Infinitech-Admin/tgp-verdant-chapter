"use client";

import { useState, useEffect, JSX } from "react";
import {
  Search,
  Filter,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  ChevronLeft,
  ChevronRight,
  Users,
  X,
  MapPin,
  Phone,
  Mail,
  User,
  Calendar,
  FileText,
  CreditCard,
  AlertCircle,
  Hash,
  Printer,
} from "lucide-react";
import AdminLayout from "@/components/adminLayout";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/components/ui/use-toast";

interface AdminUser {
  id: number;
  name: string;
  email: string;
  phone_number?: string;
  address?: string;
  fraternity_number?: string;
  membership_id?: string;
  status: "pending" | "approved" | "rejected" | "deactivated";
  rejection_reason?: string;
  role: string;
  created_at: string;
  updated_at: string;
  email_verified_at?: string;
}

interface PaginationData {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
}

export default function AdminUsersPage() {
  const { user, loading: authLoading } = useAuth(true);
  const { toast } = useToast();

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [actionType, setActionType] = useState<
    "approved" | "rejected" | "deactivated" | null
  >(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfProgress, setPdfProgress] = useState(0);
  const [emailSending, setEmailSending] = useState(false);
  const [pagination, setPagination] = useState<PaginationData>({
    current_page: 1,
    last_page: 1,
    per_page: 15,
    total: 0,
    from: 0,
    to: 0,
  });

  useEffect(() => {
    if (!authLoading && user) {
      fetchUsers();
    }
  }, [authLoading, user, pagination.current_page, statusFilter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.current_page.toString(),
        per_page: pagination.per_page.toString(),
      });
      if (statusFilter !== "all") params.append("status", statusFilter);
      if (searchQuery) params.append("search", searchQuery);

      const response = await fetch(`/api/users?${params}`, {
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          setUsers(data.data.data || []);
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
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch users.",
        });
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load users.",
      });
    } finally {
      setLoading(false);
    }
  };

  const sendApprovalEmail = async (user: AdminUser) => {
    try {
      setEmailSending(true);
      const response = await fetch("/api/member/send-approval-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          to: user.email,
          name: user.name,
          membershipId: user.membership_id,
          email: user.email,
          phoneNumber: user.phone_number,
          fraternityNumber: user.fraternity_number,
          address: user.address,
        }),
      });
      const data = await response.json();
      if (response.ok && data.success) {
        toast({
          title: "Email Sent",
          description: `Approval email sent successfully to ${user.email}`,
        });
        return true;
      } else {
        throw new Error(data.message || "Failed to send email");
      }
    } catch (error) {
      console.error("Error sending approval email:", error);
      toast({
        variant: "destructive",
        title: "Email Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to send approval email. User was approved but email notification failed.",
      });
      return false;
    } finally {
      setEmailSending(false);
    }
  };

  const handleViewUser = (user: AdminUser) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
    setIsConfirmModalOpen(false);
    setActionType(null);
    setRejectionReason("");
  };

  const openConfirmModal = (type: "approved" | "rejected" | "deactivated") => {
    setActionType(type);
    setIsConfirmModalOpen(true);
  };

  const handleUpdateStatus = async () => {
    if (!selectedUser || !actionType) return;
    try {
      if (
        (actionType === "rejected" || actionType === "deactivated") &&
        !rejectionReason.trim()
      ) {
        toast({
          variant: "destructive",
          title: "Error",
          description: `${actionType === "rejected" ? "Rejection" : "Deactivation"} reason is required.`,
        });
        return;
      }

      const response = await fetch(`/api/users`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          userId: selectedUser.id,
          status: actionType,
          rejection_reason:
            actionType === "rejected" || actionType === "deactivated"
              ? rejectionReason
              : null,
        }),
      });

      const contentType = response.headers.get("content-type");
      let data;

      if (contentType && contentType.includes("application/json")) {
        const text = await response.text();
        if (text && text.trim() !== "") {
          try {
            data = JSON.parse(text);
          } catch {
            throw new Error("Invalid response from server");
          }
        } else {
          data = response.ok
            ? { success: true, message: "Status updated successfully" }
            : (() => {
                throw new Error(
                  `Server returned ${response.status} with empty response`,
                );
              })();
        }
      } else {
        throw new Error("Server did not return JSON response");
      }

      if (!response.ok || !data.success)
        throw new Error(data.message || "Failed to update status");

      toast({
        title: "Success",
        description: data.message || `User ${actionType} successfully.`,
      });

      if (actionType === "approved" && selectedUser.membership_id) {
        await sendApprovalEmail(selectedUser);
      }

      closeModal();
      fetchUsers();
    } catch (error) {
      console.error("Error updating status:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to update user status.",
      });
    }
  };

  const handleSearch = () => {
    setPagination((prev) => ({ ...prev, current_page: 1 }));
    fetchUsers();
  };

  const handlePageChange = (page: number) => {
    setPagination((prev) => ({ ...prev, current_page: page }));
  };

  const handlePrintPDF = async () => {
    try {
      setPdfLoading(true);
      setPdfProgress(0);
      const progressInterval = setInterval(() => {
        setPdfProgress((prev) => {
          const next = prev + Math.random() * 30;
          return next > 90 ? 90 : next;
        });
      }, 300);

      const params = new URLSearchParams();
      if (statusFilter !== "all") params.append("status", statusFilter);
      if (searchQuery) params.append("search", searchQuery);
      const url = params.toString()
        ? `/api/export-pdf?${params}`
        : "/api/export-pdf";

      const response = await fetch(url, { credentials: "include" });
      clearInterval(progressInterval);
      setPdfProgress(95);

      if (response.ok) {
        const blob = await response.blob();
        const downloadUrl = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = downloadUrl;
        a.download = `users-report-${new Date().toISOString().split("T")[0]}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(downloadUrl);
        document.body.removeChild(a);
        setPdfProgress(100);
        toast({
          title: "Success",
          description: "PDF report generated successfully.",
        });
      } else {
        const errorData = await response.json();
        toast({
          variant: "destructive",
          title: "Error",
          description: errorData.message || "Failed to generate PDF report.",
        });
      }
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to generate PDF report.",
      });
    } finally {
      setTimeout(() => {
        setPdfLoading(false);
        setPdfProgress(0);
      }, 500);
    }
  };

  const getStatusBadge = (status: string) => {
    const map: Record<
      string,
      { bg: string; text: string; icon: JSX.Element; label: string }
    > = {
      Confirmed: {
        bg: "bg-[#e8f5e8]",
        text: "text-[#1a4d1a]",
        icon: <CheckCircle className="w-3 h-3" />,
        label: "Confirmed",
      },
      "No-Record": {
        bg: "bg-[#fdf8e7]",
        text: "text-[#b8870c]",
        icon: <Clock className="w-3 h-3" />,
        label: "No-Record",
      },
      rejected: {
        bg: "bg-red-50",
        text: "text-red-700",
        icon: <XCircle className="w-3 h-3" />,
        label: "Rejected",
      },
      deactivated: {
        bg: "bg-gray-100",
        text: "text-gray-600",
        icon: <XCircle className="w-3 h-3" />,
        label: "Deactivated",
      },
    };
    const cfg = map[status] ?? {
      bg: "bg-gray-100",
      text: "text-gray-600",
      icon: null,
      label: status,
    };
    return (
      <span
        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${cfg.bg} ${cfg.text}`}
      >
        {cfg.icon}
        {cfg.label}
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
                <Users className="w-6 h-6 text-[#1a4d1a]" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-[#1a2e1a]">
                  User Management
                </h1>
                <p className="text-xs sm:text-sm text-[#6b8f6b] mt-0.5">
                  Manage and review citizen registrations
                </p>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-2 text-sm text-[#3d5c3d] bg-[#e8f5e8] px-3 py-1.5 rounded-lg border border-[#c8e6c8]">
              <Users className="w-4 h-4 text-[#1a4d1a]" />
              <span className="font-medium">{pagination.total} Total</span>
            </div>
          </div>
        </div>

        {/* ── Main ── */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5">
          {/* Filters */}
          <div className="bg-white rounded-xl border border-[#d0e8d0] p-4">
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6b8f6b]" />
                <input
                  type="text"
                  placeholder="Search by name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="w-full pl-9 pr-3 py-2 border border-[#c8e6c8] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a4d1a] focus:border-transparent"
                />
              </div>

              <div className="flex gap-2">
                {/* Status select */}
                <div className="relative flex-1 sm:flex-none sm:w-44">
                  <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6b8f6b]" />
                  <select
                    value={statusFilter}
                    onChange={(e) => {
                      setStatusFilter(e.target.value);
                      setPagination((prev) => ({ ...prev, current_page: 1 }));
                    }}
                    className="w-full pl-9 pr-3 py-2 border border-[#c8e6c8] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a4d1a] focus:border-transparent appearance-none bg-white text-[#1a2e1a]"
                  >
                    <option value="all">All Status</option>
                    <option value="pending">No-Record</option>
                    <option value="approved">Confirmed</option>
                  </select>
                </div>

                <button
                  onClick={handleSearch}
                  className="px-4 py-2 bg-[#1a4d1a] text-white rounded-lg text-sm font-medium hover:bg-[#2d7a2d] transition-colors"
                >
                  Search
                </button>

                {/* PDF button */}
                <div className="relative">
                  <button
                    onClick={handlePrintPDF}
                    disabled={pdfLoading}
                    className="px-4 py-2 bg-[#3b6d11] text-white rounded-lg text-sm font-medium hover:bg-[#27500a] transition-colors flex items-center gap-2 disabled:opacity-75 disabled:cursor-not-allowed"
                  >
                    {pdfLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                        <span className="hidden sm:inline">Generating...</span>
                      </>
                    ) : (
                      <>
                        <Printer className="w-4 h-4" />
                        <span className="hidden sm:inline">Print PDF</span>
                      </>
                    )}
                  </button>
                  {pdfLoading && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#a8d4a8] rounded-b-lg overflow-hidden">
                      <div
                        className="h-full bg-[#1a4d1a] transition-all duration-300"
                        style={{ width: `${pdfProgress}%` }}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Table card */}
          <div className="bg-white rounded-xl border border-[#d0e8d0] overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center py-14">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#1a4d1a] mx-auto mb-3" />
                  <p className="text-[#6b8f6b] text-sm">Loading users...</p>
                </div>
              </div>
            ) : users.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-14">
                <Users className="w-12 h-12 text-[#a8d4a8] mb-3" />
                <p className="text-[#1a2e1a] font-medium">No users found</p>
                <p className="text-[#6b8f6b] text-sm mt-1">
                  Try adjusting your filters
                </p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead className="bg-[#f2faf2] border-b border-[#d0e8d0]">
                      <tr>
                        {[
                          "Name",
                          "Email",
                          "Phone",
                          "Address",
                          "Membership ID",
                          "Role",
                          "Status",
                          "Registered",
                          "Actions",
                        ].map((h) => (
                          <th
                            key={h}
                            className={`px-4 py-3 text-left text-xs font-semibold text-[#6b8f6b] uppercase tracking-wider whitespace-nowrap ${h === "Actions" ? "text-center sticky right-0 bg-[#f2faf2]" : ""}`}
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#e8f5e8] bg-white">
                      {users.map((u) => (
                        <tr
                          key={u.id}
                          className="hover:bg-[#f9fdf9] transition-colors"
                        >
                          <td className="px-4 py-3 text-sm font-medium text-[#1a2e1a] whitespace-nowrap">
                            <div
                              className="max-w-[150px] truncate"
                              title={u.name}
                            >
                              {u.name}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-[#6b8f6b] whitespace-nowrap">
                            <div
                              className="max-w-[180px] truncate"
                              title={u.email}
                            >
                              {u.email}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-[#6b8f6b] whitespace-nowrap">
                            {u.phone_number || "N/A"}
                          </td>
                          <td className="px-4 py-3 text-sm text-[#6b8f6b] whitespace-nowrap">
                            <div
                              className="max-w-[200px] truncate"
                              title={u.address || ""}
                            >
                              {u.address || "N/A"}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm whitespace-nowrap font-mono text-[#3d5c3d]">
                            {u.membership_id || "N/A"}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium capitalize ${
                                u.role === "admin"
                                  ? "bg-[#e0eef9] text-[#1a3d5c]"
                                  : "bg-[#f0f0f0] text-[#4a4a4a]"
                              }`}
                            >
                              {u.role}
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            {getStatusBadge(
                              u.status === "approved"
                                ? "Confirmed"
                                : u.status === "pending"
                                  ? "No-Record"
                                  : u.status,
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm text-[#6b8f6b] whitespace-nowrap">
                            {formatDate(u.created_at)}
                          </td>
                          <td className="px-4 py-3 text-center whitespace-nowrap sticky right-0 bg-white">
                            <button
                              onClick={() => handleViewUser(u)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#e8f5e8] text-[#1a4d1a] rounded-lg text-xs font-medium hover:bg-[#d0e8d0] transition-colors"
                            >
                              <Eye className="w-3 h-3" />
                              <span className="hidden sm:inline">View</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Swipe hint */}
                <div className="lg:hidden bg-[#e8f5e8] border-t border-[#d0e8d0] px-4 py-2 text-center">
                  <p className="text-xs text-[#3d5c3d] flex items-center justify-center gap-1">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 16l-4-4m0 0l4-4m-4 4h18"
                      />
                    </svg>
                    Swipe left to see more
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 8l4 4m0 0l-4 4m4-4H3"
                      />
                    </svg>
                  </p>
                </div>

                {/* Pagination */}
                <div className="px-4 py-3 border-t border-[#d0e8d0] flex flex-col sm:flex-row items-center justify-between gap-3">
                  <p className="text-sm text-[#6b8f6b]">
                    Showing {pagination.from} to {pagination.to} of{" "}
                    {pagination.total} results
                  </p>
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
              </>
            )}
          </div>
        </div>

        {/* ── View Modal ── */}
        {isModalOpen && selectedUser && (
          <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
            <div className="bg-white sm:rounded-xl shadow-2xl w-full sm:max-w-3xl h-[95vh] sm:h-auto sm:max-h-[90vh] overflow-hidden flex flex-col border border-[#d0e8d0]">
              {/* Modal header */}
              <div className="bg-[#f2faf2] border-b border-[#d0e8d0] px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between sticky top-0 z-10">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                  <div className="p-2 bg-[#e8f5e8] rounded-lg flex-shrink-0">
                    <User className="w-5 h-5 text-[#1a4d1a]" />
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-base sm:text-lg font-bold text-[#1a2e1a] truncate">
                      Citizen Details
                    </h2>
                    <p className="text-xs text-[#6b8f6b]">
                      User #{selectedUser.id}
                    </p>
                  </div>
                </div>
                <button
                  onClick={closeModal}
                  className="p-1.5 sm:p-2 hover:bg-[#d0e8d0] rounded-lg transition-colors flex-shrink-0"
                >
                  <X className="w-5 h-5 text-[#6b8f6b]" />
                </button>
              </div>

              {/* Modal body */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 overscroll-contain space-y-5">
                {/* Status */}
                <div className="bg-[#f2faf2] rounded-lg p-3 sm:p-4 border border-[#d0e8d0]">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <span className="text-sm font-medium text-[#3d5c3d]">
                      Account Status
                    </span>
                    {getStatusBadge(
                      selectedUser.status === "approved"
                        ? "Confirmed"
                        : selectedUser.status === "pending"
                          ? "No-Record"
                          : selectedUser.status,
                    )}
                  </div>
                  {selectedUser.rejection_reason &&
                    (selectedUser.status === "rejected" ||
                      selectedUser.status === "deactivated") && (
                      <div
                        className={`mt-2 p-3 border rounded-lg ${selectedUser.status === "deactivated" ? "bg-gray-50 border-gray-300" : "bg-red-50 border-red-200"}`}
                      >
                        <p
                          className={`text-sm flex items-start gap-2 ${selectedUser.status === "deactivated" ? "text-gray-800" : "text-red-800"}`}
                        >
                          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                          <span>
                            <span className="font-medium">
                              {selectedUser.status === "deactivated"
                                ? "Deactivation"
                                : "Rejection"}{" "}
                              Reason:{" "}
                            </span>
                            {selectedUser.rejection_reason}
                          </span>
                        </p>
                      </div>
                    )}
                </div>

                {/* Personal */}
                <div>
                  <h3 className="text-sm font-semibold text-[#6b8f6b] uppercase tracking-wide mb-3 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Personal Information
                  </h3>
                  <div className="bg-[#f2faf2] border border-[#d0e8d0] rounded-lg p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-medium text-[#6b8f6b] flex items-center gap-1 mb-1">
                        <User className="w-3 h-3" /> Full Name
                      </label>
                      <p className="text-sm text-[#1a2e1a] break-words">
                        {selectedUser.name}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-[#6b8f6b] flex items-center gap-1 mb-1">
                        <Mail className="w-3 h-3" /> Email Address
                      </label>
                      <p className="text-sm text-[#1a2e1a] break-all">
                        {selectedUser.email}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-[#6b8f6b] flex items-center gap-1 mb-1">
                        <Phone className="w-3 h-3" /> Phone Number
                      </label>
                      <p className="text-sm text-[#1a2e1a]">
                        {selectedUser.phone_number || "Not provided"}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-[#6b8f6b] mb-1 block">
                        Role
                      </label>
                      <p className="text-sm text-[#1a2e1a] capitalize">
                        {selectedUser.role}
                      </p>
                    </div>
                    <div className="sm:col-span-2">
                      <label className="text-xs font-medium text-[#6b8f6b] flex items-center gap-1 mb-1">
                        <MapPin className="w-3 h-3" /> Address
                      </label>
                      <p className="text-sm text-[#1a2e1a] break-words">
                        {selectedUser.address || "Not provided"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Registration */}
                <div>
                  <h3 className="text-sm font-semibold text-[#6b8f6b] uppercase tracking-wide mb-3 flex items-center gap-2">
                    <Hash className="w-4 h-4" />
                    Registration Information
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="border border-[#d0e8d0] rounded-lg p-3 bg-[#f2faf2]">
                      <label className="text-xs font-medium text-[#6b8f6b] flex items-center gap-1 mb-1">
                        <Hash className="w-3 h-3" /> Fraternity Number
                      </label>
                      <p className="text-sm text-[#1a2e1a] font-mono mt-1">
                        {selectedUser.fraternity_number || "Not provided"}
                      </p>
                    </div>
                    <div className="border border-[#d0e8d0] rounded-lg p-3 bg-[#f2faf2]">
                      <label className="text-xs font-medium text-[#6b8f6b] flex items-center gap-1 mb-1">
                        <CreditCard className="w-3 h-3" /> Membership ID
                      </label>
                      <p className="text-sm text-[#1a2e1a] font-mono mt-1">
                        {selectedUser.membership_id || "Not provided"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Account dates */}
                <div>
                  <h3 className="text-sm font-semibold text-[#6b8f6b] uppercase tracking-wide mb-3 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Account Information
                  </h3>
                  <div className="bg-[#f2faf2] border border-[#d0e8d0] rounded-lg p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-medium text-[#6b8f6b] mb-1 block">
                        Registration Date
                      </label>
                      <p className="text-sm text-[#1a2e1a]">
                        {formatDate(selectedUser.created_at)}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-[#6b8f6b] mb-1 block">
                        Last Updated
                      </label>
                      <p className="text-sm text-[#1a2e1a]">
                        {formatDate(selectedUser.updated_at)}
                      </p>
                    </div>
                    {selectedUser.email_verified_at && (
                      <div>
                        <label className="text-xs font-medium text-[#6b8f6b] mb-1 block">
                          Email Verified
                        </label>
                        <p className="text-sm text-[#1a2e1a]">
                          {formatDate(selectedUser.email_verified_at)}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Modal footer */}
              <div className="border-t border-[#d0e8d0] px-4 sm:px-6 py-3 bg-white flex-shrink-0">
                <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3">
                  {selectedUser.status === "pending" ? (
                    <>
                      <button
                        onClick={closeModal}
                        className="w-full sm:w-auto px-4 py-2.5 border border-[#c8e6c8] rounded-lg text-[#3d5c3d] hover:bg-[#f2faf2] transition-colors text-sm font-medium"
                      >
                        Close
                      </button>
                      <button
                        onClick={() => openConfirmModal("rejected")}
                        className="w-full sm:w-auto px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                      >
                        <XCircle className="w-4 h-4" /> Reject
                      </button>
                      <button
                        onClick={() => openConfirmModal("approved")}
                        disabled={emailSending}
                        className="w-full sm:w-auto px-4 py-2.5 bg-[#1a4d1a] text-white rounded-lg hover:bg-[#2d7a2d] transition-colors text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <CheckCircle className="w-4 h-4" />{" "}
                        {emailSending ? "Sending..." : "Approve"}
                      </button>
                    </>
                  ) : selectedUser.status === "rejected" ? (
                    <>
                      <button
                        onClick={closeModal}
                        className="w-full sm:w-auto px-4 py-2.5 border border-[#c8e6c8] rounded-lg text-[#3d5c3d] hover:bg-[#f2faf2] transition-colors text-sm font-medium"
                      >
                        Close
                      </button>
                      <button
                        onClick={() => openConfirmModal("approved")}
                        disabled={emailSending}
                        className="w-full sm:w-auto px-4 py-2.5 bg-[#1a4d1a] text-white rounded-lg hover:bg-[#2d7a2d] transition-colors text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <CheckCircle className="w-4 h-4" />{" "}
                        {emailSending ? "Sending..." : "Re-approve User"}
                      </button>
                    </>
                  ) : selectedUser.status === "approved" ? (
                    <>
                      <button
                        onClick={closeModal}
                        className="w-full sm:w-auto px-4 py-2.5 border border-[#c8e6c8] rounded-lg text-[#3d5c3d] hover:bg-[#f2faf2] transition-colors text-sm font-medium"
                      >
                        Close
                      </button>
                      <button
                        onClick={() => openConfirmModal("deactivated")}
                        className="w-full sm:w-auto px-4 py-2.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                      >
                        <XCircle className="w-4 h-4" /> Deactivate User
                      </button>
                    </>
                  ) : selectedUser.status === "deactivated" ? (
                    <>
                      <button
                        onClick={closeModal}
                        className="w-full sm:w-auto px-4 py-2.5 border border-[#c8e6c8] rounded-lg text-[#3d5c3d] hover:bg-[#f2faf2] transition-colors text-sm font-medium"
                      >
                        Close
                      </button>
                      <button
                        onClick={() => openConfirmModal("approved")}
                        disabled={emailSending}
                        className="w-full sm:w-auto px-4 py-2.5 bg-[#1a4d1a] text-white rounded-lg hover:bg-[#2d7a2d] transition-colors text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <CheckCircle className="w-4 h-4" />{" "}
                        {emailSending ? "Sending..." : "Reactivate User"}
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={closeModal}
                      className="w-full sm:w-auto px-4 py-2.5 border border-[#c8e6c8] rounded-lg text-[#3d5c3d] hover:bg-[#f2faf2] transition-colors text-sm font-medium"
                    >
                      Close
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Confirm Modal ── */}
        {isConfirmModalOpen && selectedUser && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden border border-[#d0e8d0]">
              {/* Confirm header */}
              <div
                className={`px-6 py-4 text-white ${actionType === "approved" ? "bg-[#1a4d1a]" : actionType === "deactivated" ? "bg-gray-600" : "bg-red-600"}`}
              >
                <h3 className="text-base font-bold flex items-center gap-2">
                  {actionType === "approved" ? (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      {selectedUser.status === "rejected"
                        ? "Re-approve User"
                        : selectedUser.status === "deactivated"
                          ? "Reactivate User"
                          : "Approve User"}
                    </>
                  ) : actionType === "deactivated" ? (
                    <>
                      <XCircle className="w-5 h-5" />
                      Deactivate User
                    </>
                  ) : (
                    <>
                      <XCircle className="w-5 h-5" />
                      Reject User
                    </>
                  )}
                </h3>
              </div>

              {/* Confirm body */}
              <div className="p-6">
                <p className="text-sm text-[#3d5c3d] mb-4 leading-relaxed">
                  {actionType === "approved"
                    ? selectedUser.status === "rejected"
                      ? `Are you sure you want to re-approve ${selectedUser.name}'s registration? This will override the previous rejection. An email notification will be sent.`
                      : selectedUser.status === "deactivated"
                        ? `Are you sure you want to reactivate ${selectedUser.name}'s account? They will regain access to the system. An email notification will be sent.`
                        : `Are you sure you want to approve ${selectedUser.name}'s registration? They will receive an email notification with their login credentials.`
                    : actionType === "deactivated"
                      ? `Are you sure you want to deactivate ${selectedUser.name}'s account? They will lose access until reactivated.`
                      : `Are you sure you want to reject ${selectedUser.name}'s registration? Please provide a reason.`}
                </p>

                {(actionType === "rejected" ||
                  actionType === "deactivated") && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-[#1a2e1a] mb-2">
                      {actionType === "deactivated"
                        ? "Deactivation"
                        : "Rejection"}{" "}
                      Reason <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder={`Enter reason for ${actionType === "deactivated" ? "deactivation" : "rejection"}...`}
                      rows={4}
                      className="w-full px-3 py-2 border border-[#c8e6c8] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a4d1a] focus:border-transparent resize-none"
                    />
                    <p className="text-xs text-[#6b8f6b] mt-1">
                      This reason will be saved and displayed to administrators.
                    </p>
                  </div>
                )}

                {actionType === "approved" && selectedUser.rejection_reason && (
                  <div className="mb-4 p-3 bg-[#fdf8e7] border border-[#f0d080] rounded-lg">
                    <p className="text-sm text-[#854f0b] flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <span>
                        <span className="font-medium">
                          Previous{" "}
                          {selectedUser.status === "deactivated"
                            ? "deactivation"
                            : "rejection"}{" "}
                          reason:{" "}
                        </span>
                        {selectedUser.rejection_reason}
                      </span>
                    </p>
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setIsConfirmModalOpen(false);
                      setActionType(null);
                      setRejectionReason("");
                    }}
                    className="flex-1 px-4 py-2.5 border border-[#c8e6c8] rounded-lg text-[#3d5c3d] hover:bg-[#f2faf2] transition-colors text-sm font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpdateStatus}
                    disabled={emailSending}
                    className={`flex-1 px-4 py-2.5 rounded-lg text-white text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${
                      actionType === "approved"
                        ? "bg-[#1a4d1a] hover:bg-[#2d7a2d]"
                        : actionType === "deactivated"
                          ? "bg-gray-600 hover:bg-gray-700"
                          : "bg-red-600 hover:bg-red-700"
                    }`}
                  >
                    {emailSending
                      ? "Processing..."
                      : actionType === "approved"
                        ? selectedUser.status === "rejected"
                          ? "Re-approve"
                          : selectedUser.status === "deactivated"
                            ? "Reactivate"
                            : "Approve"
                        : actionType === "deactivated"
                          ? "Deactivate"
                          : "Reject"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
