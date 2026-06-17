"use client";

import { useState, useEffect } from "react";
import {
  Search,
  Filter,
  Eye,
  ChevronRight,
  ChevronLeft,
  ScrollText,
} from "lucide-react";
import MemberLayout from "@/components/memberLayout";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/components/ui/use-toast";
import MemberLegitimacyModal from "@/components/member/legitimacy/add-modal";
import MemberLegitimacyEditModal from "@/components/member/legitimacy/edit-modal";
import { MemberDeleteLegitimacyModal } from "@/components/member/legitimacy/delete-form";
import ViewLegitimacyModal from "@/components/member/legitimacy/view-modal";

interface Signatory {
  id?: number;
  name: string;
  signed_date?: string;
}

interface LegitimacyRequest {
  id: number;
  alias: string;
  chapter: string;
  position: string;
  fraternity_number: string;
  status: "pending" | "approved" | "rejected";
  admin_note?: string;
  certificate_date?: string;
  signatories: Signatory[];
  approved_at?: string;
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

export default function LegitimacyPage() {
  const { user, loading: authLoading } = useAuth(true);
  const { toast } = useToast();
  const [applications, setApplications] = useState<LegitimacyRequest[]>([]);
  const [pagination, setPagination] = useState<PaginationData>({
    current_page: 1,
    last_page: 1,
    per_page: 10,
    total: 0,
    from: 0,
    to: 0,
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedApplication, setSelectedApplication] =
    useState<LegitimacyRequest | null>(null);

  const fetchLegitimacy = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.current_page.toString(),
        per_page: pagination.per_page.toString(),
      });
      if (statusFilter !== "all") params.append("status", statusFilter);
      if (searchQuery) params.append("search", searchQuery);

      const res = await fetch(`/api/legitimacy?${params.toString()}`, {
        credentials: "include",
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setApplications(data.data.data || []);
        setPagination({
          current_page: data.data.current_page,
          last_page: data.data.last_page,
          per_page: data.data.per_page,
          total: data.data.total,
          from: data.data.from,
          to: data.data.to,
        });
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: data.message || "Failed to fetch applications",
        });
      }
    } catch (err) {
      console.error(err);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch applications",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && user) fetchLegitimacy();
  }, [authLoading, user, pagination.current_page, statusFilter]);

  const openCreateModal = () => {
    setSelectedApplication(null);
    setIsCreateModalOpen(true);
  };
  const handleView = (app: LegitimacyRequest) => {
    setSelectedApplication(app);
    setIsViewOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedApplication) return;
    try {
      const res = await fetch(`/api/legitimacy/${selectedApplication.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) {
        toast({
          title: "Success",
          description: "Application deleted successfully",
        });
        fetchLegitimacy();
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: data.message || "Failed to delete application",
        });
      }
    } catch {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete application",
      });
    } finally {
      setIsDeleteOpen(false);
      setSelectedApplication(null);
    }
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  const statusStyle = (status: string) => {
    if (status === "approved")
      return "bg-[#e8f5e8] text-[#1a4d1a] border border-[#d0e8d0]";
    if (status === "pending")
      return "bg-yellow-50 text-yellow-700 border border-yellow-200";
    return "bg-red-50 text-red-700 border border-red-200";
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#f2faf2]">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-[#1a4d1a] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-sm text-[#6b8f6b]">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <MemberLayout>
      <div className="min-h-screen bg-[#f2faf2] overflow-x-hidden">
        {/* Header */}
        <div className="bg-white border-b border-[#d0e8d0] sticky top-0 z-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <div className="p-2 bg-[#e8f5e8] rounded-lg shrink-0">
                <ScrollText className="w-5 h-5 text-[#1a4d1a]" />
              </div>
              <div className="min-w-0">
                <h1 className="text-base sm:text-xl font-bold text-[#1a2e1a] truncate">
                  Certificate of Legitimacy
                </h1>
                <p className="text-xs text-[#6b8f6b]">
                  Manage your applications
                </p>
              </div>
            </div>

            <button
              onClick={openCreateModal}
              className="bg-[#1a4d1a] hover:bg-[#163f16] text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors shrink-0"
            >
              + New Application
            </button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-4">
          {/* Search & Filter */}
          <div className="bg-white border border-[#d0e8d0] rounded-xl p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6b8f6b] w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search by alias, chapter, or position..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && fetchLegitimacy()}
                  className="w-full pl-9 pr-3 py-2 border border-[#d0e8d0] rounded-lg text-sm text-[#1a2e1a] placeholder-[#6b8f6b] focus:outline-none focus:ring-2 focus:ring-[#1a4d1a] focus:border-transparent"
                />
              </div>

              <div className="relative">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6b8f6b] w-4 h-4 pointer-events-none" />
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setPagination((p) => ({ ...p, current_page: 1 }));
                  }}
                  className="w-full pl-9 pr-3 py-2 border border-[#d0e8d0] rounded-lg text-sm text-[#1a2e1a] focus:outline-none focus:ring-2 focus:ring-[#1a4d1a] focus:border-transparent appearance-none bg-white"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white border border-[#d0e8d0] rounded-xl overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <div className="w-10 h-10 border-4 border-[#1a4d1a] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : applications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-14 h-14 bg-[#e8f5e8] rounded-full flex items-center justify-center mb-4">
                  <ScrollText className="w-7 h-7 text-[#6b8f6b]" />
                </div>
                <h3 className="text-sm font-semibold text-[#1a2e1a] mb-1">
                  No applications found
                </h3>
                <p className="text-xs text-[#6b8f6b]">
                  Submit a new application to get started.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-[#f2faf2] border-b border-[#d0e8d0]">
                    <tr>
                      {[
                        "Alias",
                        "Chapter",
                        "Position",
                        "Status",
                        "Certificate Date",
                        "Actions",
                      ].map((h) => (
                        <th
                          key={h}
                          className="px-6 py-3 text-left text-xs font-semibold text-[#3d5c3d] uppercase tracking-wide"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#d0e8d0]">
                    {applications.map((app) => (
                      <tr
                        key={app.id}
                        className="hover:bg-[#f2faf2] transition-colors"
                      >
                        <td className="px-6 py-4 text-sm font-medium text-[#1a2e1a]">
                          {app.alias}
                        </td>
                        <td className="px-6 py-4 text-sm text-[#3d5c3d]">
                          {app.chapter}
                        </td>
                        <td className="px-6 py-4 text-sm text-[#3d5c3d]">
                          {app.position}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-2.5 py-0.5 text-xs font-semibold rounded-full ${statusStyle(app.status)}`}
                          >
                            {app.status.charAt(0).toUpperCase() +
                              app.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-[#6b8f6b]">
                          {app.certificate_date
                            ? formatDate(app.certificate_date)
                            : "—"}
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => handleView(app)}
                            className="p-1.5 rounded-lg text-[#1a4d1a] hover:bg-[#e8f5e8] transition-colors"
                            title="View details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Pagination */}
          {pagination.total > pagination.per_page && (
            <div className="bg-white border border-[#d0e8d0] rounded-xl px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-xs text-[#6b8f6b]">
                Showing {pagination.from}–{pagination.to} of {pagination.total}{" "}
                results
              </p>

              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    setPagination((p) => ({
                      ...p,
                      current_page: Math.max(p.current_page - 1, 1),
                    }))
                  }
                  disabled={pagination.current_page === 1}
                  className="p-2 border border-[#d0e8d0] rounded-lg text-[#1a4d1a] hover:bg-[#e8f5e8] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-1">
                  {Array.from(
                    { length: Math.min(5, pagination.last_page) },
                    (_, i) => {
                      let pageNum: number;
                      if (pagination.last_page <= 5) pageNum = i + 1;
                      else if (pagination.current_page <= 3) pageNum = i + 1;
                      else if (
                        pagination.current_page >=
                        pagination.last_page - 2
                      )
                        pageNum = pagination.last_page - 4 + i;
                      else pageNum = pagination.current_page - 2 + i;

                      return (
                        <button
                          key={pageNum}
                          onClick={() =>
                            setPagination((p) => ({
                              ...p,
                              current_page: pageNum,
                            }))
                          }
                          className={`w-8 h-8 rounded-lg text-xs font-semibold transition-colors ${
                            pagination.current_page === pageNum
                              ? "bg-[#1a4d1a] text-white"
                              : "border border-[#d0e8d0] text-[#3d5c3d] hover:bg-[#e8f5e8]"
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
                    setPagination((p) => ({
                      ...p,
                      current_page: Math.min(p.current_page + 1, p.last_page),
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

        {/* Modals */}
        {isCreateModalOpen && (
          <MemberLegitimacyModal
            isOpen={isCreateModalOpen}
            onClose={() => setIsCreateModalOpen(false)}
            onSubmitSuccess={fetchLegitimacy}
          />
        )}

        {isEditModalOpen && (
          <MemberLegitimacyEditModal
            isOpen={isEditModalOpen}
            initialData={selectedApplication || undefined}
            onClose={() => {
              setIsEditModalOpen(false);
              setSelectedApplication(null);
            }}
            onSubmitSuccess={fetchLegitimacy}
          />
        )}

        <ViewLegitimacyModal
          isOpen={isViewOpen}
          selectedItem={selectedApplication}
          onClose={() => {
            setIsViewOpen(false);
            setSelectedApplication(null);
          }}
        />

        <MemberDeleteLegitimacyModal
          isOpen={isDeleteOpen}
          itemName={selectedApplication?.alias || "Application"}
          onClose={() => {
            setIsDeleteOpen(false);
            setSelectedApplication(null);
          }}
          onConfirm={confirmDelete}
        />
      </div>
    </MemberLayout>
  );
}
