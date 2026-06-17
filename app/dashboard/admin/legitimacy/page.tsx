"use client";

import { useState, useEffect } from "react";
import {
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  ChevronRight,
  ChevronLeft,
  Printer,
  Download,
} from "lucide-react";
import AdminLayout from "@/components/adminLayout";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/components/ui/use-toast";
import AdminLegitimacyModal from "@/components/admin/legitimacy/add-edit-form";
import { AdminDeleteLegitimacyModal } from "@/components/admin/legitimacy/delete-form";
import ViewLegitimacyModal from "@/components/admin/legitimacy/view-modal";

interface User {
  id: number;
  name: string;
  email: string;
}

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
  user: User;
}

interface PaginationData {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
}

export default function AdminLegitimacyPage() {
  const { user, loading: authLoading } = useAuth(true);
  const { toast } = useToast();
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<LegitimacyRequest | null>(
    null,
  );
  const [applications, setApplications] = useState<LegitimacyRequest[]>([]);
  const [isViewOpen, setIsViewOpen] = useState(false);
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
  const [generatingPDFId, setGeneratingPDFId] = useState<number | null>(null);
  const [downloadProgress, setDownloadProgress] = useState(0);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
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

      const res = await fetch(`/api/admin/legitimacy?${params.toString()}`, {
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
    setModalMode("create");
    setIsModalOpen(true);
  };

  const openEditModal = (app: LegitimacyRequest) => {
    setSelectedApplication(app);
    setModalMode("edit");
    setTimeout(() => setIsModalOpen(true), 0);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedApplication(null), 300);
  };

  const openDeleteModal = (app: LegitimacyRequest) => {
    setDeleteTarget(app);
    setIsDeleteOpen(true);
  };

  const handlePrint = async (app: LegitimacyRequest) => {
    try {
      setGeneratingPDFId(app.id);
      setDownloadProgress(0);

      const progressInterval = setInterval(() => {
        setDownloadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const response = await fetch(`/api/admin/legitimacy/${app.id}/pdf`, {
        credentials: "include",
      });
      clearInterval(progressInterval);
      setDownloadProgress(95);

      if (response.ok) {
        const blob = await response.blob();
        setDownloadProgress(100);
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `certificate-${app.alias}-${new Date().toISOString().split("T")[0]}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast({
          title: "Success",
          description: "Certificate downloaded successfully",
        });
        setTimeout(() => setDownloadProgress(0), 1000);
      } else {
        const errorData = await response.json();
        setDownloadProgress(0);
        toast({
          variant: "destructive",
          title: "Error",
          description: errorData.message || "Failed to generate certificate",
        });
      }
    } catch (error) {
      console.error("Error downloading certificate:", error);
      setDownloadProgress(0);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to download certificate",
      });
    } finally {
      setGeneratingPDFId(null);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      const res = await fetch(`/api/admin/legitimacy/${deleteTarget.id}`, {
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
        setLoading(true);
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
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  if (loading) {
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
        {/* PDF Progress Overlay */}
        {generatingPDFId !== null && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
            <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl border border-[#d0e8d0]">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-[#e8f5e8] rounded-lg">
                  <Download className="w-5 h-5 text-[#1a4d1a] animate-bounce" />
                </div>
                <h3 className="text-lg font-semibold text-[#1a2e1a]">
                  Generating Certificate
                </h3>
              </div>
              <div className="space-y-2">
                <div className="w-full bg-[#e8f5e8] rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-[#1a4d1a] h-full rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${downloadProgress}%` }}
                  />
                </div>
                <p className="text-sm text-[#6b8f6b] text-center">
                  {downloadProgress < 30 && "Preparing certificate..."}
                  {downloadProgress >= 30 &&
                    downloadProgress < 60 &&
                    "Generating PDF..."}
                  {downloadProgress >= 60 &&
                    downloadProgress < 95 &&
                    "Finalizing document..."}
                  {downloadProgress >= 95 && "Download starting..."}
                </p>
                <p className="text-xs text-[#3d5c3d] text-center font-medium">
                  {downloadProgress}%
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="bg-white border-b border-[#d0e8d0] sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-[#1a2e1a]">
                  Certificate of Legitimacy Applications
                </h1>
                <p className="text-sm text-[#6b8f6b]">
                  Manage all applications
                </p>
              </div>
              <button
                onClick={openCreateModal}
                className="hidden sm:flex items-center gap-2 px-4 py-2 bg-[#1a4d1a] text-white rounded-lg hover:bg-[#2d7a2d] transition-all text-sm font-medium"
              >
                + New Application
              </button>
              <button
                onClick={openCreateModal}
                className="sm:hidden px-3 py-2 bg-[#1a4d1a] text-white rounded-lg hover:bg-[#2d7a2d] transition-all text-sm font-medium"
              >
                + New
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
                  placeholder="Search by alias, chapter, or position..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && fetchLegitimacy()}
                  className="w-full pl-9 pr-3 py-2 border border-[#c8e6c8] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a4d1a]"
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
                  className="w-full pl-9 pr-3 py-2 border border-[#c8e6c8] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a4d1a] appearance-none bg-white"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>
            <button
              onClick={fetchLegitimacy}
              className="mt-4 w-full sm:w-auto px-6 py-2 bg-[#1a4d1a] text-white rounded-lg hover:bg-[#2d7a2d] transition-colors text-sm font-medium"
            >
              Search
            </button>
          </div>

          {/* Table */}
          <div className="bg-white rounded-lg border border-[#d0e8d0] overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1a4d1a] mx-auto" />
                  <p className="mt-4 text-[#6b8f6b]">Loading applications...</p>
                </div>
              </div>
            ) : applications.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-[#6b8f6b]">No applications found.</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-[#f2faf2] border-b border-[#d0e8d0]">
                      <tr>
                        {[
                          "Name",
                          "Email",
                          "Alias",
                          "Chapter",
                          "Position",
                          "Status",
                          "Certificate Date",
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
                      {applications.map((app) => (
                        <tr
                          key={app.id}
                          className="hover:bg-[#f9fdf9] transition-colors"
                        >
                          <td className="px-6 py-4 text-sm text-[#1a2e1a]">
                            {app.user.name}
                          </td>
                          <td className="px-6 py-4 text-sm text-[#6b8f6b]">
                            {app.user.email}
                          </td>
                          <td className="px-6 py-4 text-sm text-[#1a2e1a]">
                            {app.alias}
                          </td>
                          <td className="px-6 py-4 text-sm text-[#1a2e1a]">
                            {app.chapter}
                          </td>
                          <td className="px-6 py-4 text-sm text-[#1a2e1a]">
                            {app.position}
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                app.status === "approved"
                                  ? "bg-[#e8f5e8] text-[#1a4d1a]"
                                  : app.status === "pending"
                                    ? "bg-[#fdf8e7] text-[#b8870c]"
                                    : "bg-red-50 text-red-700"
                              }`}
                            >
                              {app.status.charAt(0).toUpperCase() +
                                app.status.slice(1)}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-[#6b8f6b]">
                            {app.certificate_date
                              ? formatDate(app.certificate_date)
                              : "-"}
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => {
                                  setSelectedApplication(app);
                                  setIsViewOpen(true);
                                }}
                                className="p-1.5 text-[#1a4d1a] hover:bg-[#e8f5e8] rounded transition-colors"
                                title="View details"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handlePrint(app)}
                                disabled={
                                  app.status !== "approved" ||
                                  generatingPDFId === app.id
                                }
                                className={`p-1.5 rounded transition-colors ${
                                  app.status === "approved" &&
                                  generatingPDFId !== app.id
                                    ? "text-[#2d7a2d] hover:bg-[#e8f5e8]"
                                    : "text-[#a8d4a8] cursor-not-allowed"
                                }`}
                                title={
                                  app.status === "approved"
                                    ? "Download certificate"
                                    : "Only approved certificates can be downloaded"
                                }
                              >
                                <Printer
                                  className={`w-4 h-4 ${generatingPDFId === app.id ? "animate-spin" : ""}`}
                                />
                              </button>
                              <button
                                onClick={() => openEditModal(app)}
                                className="p-1.5 text-[#d4a017] hover:bg-[#fdf8e7] rounded transition-colors"
                                title="Edit application"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => openDeleteModal(app)}
                                className="p-1.5 text-red-500 hover:bg-red-50 rounded transition-colors"
                                title="Delete application"
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

                {/* Pagination */}
                {pagination.total > pagination.per_page && (
                  <div className="px-6 py-4 border-t border-[#d0e8d0] flex flex-col sm:flex-row items-center justify-between gap-4">
                    <span className="text-sm text-[#6b8f6b]">
                      Showing {pagination.from} to {pagination.to} of{" "}
                      {pagination.total} results
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          setPagination((p) => ({
                            ...p,
                            current_page: Math.max(p.current_page - 1, 1),
                          }))
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
                                onClick={() =>
                                  setPagination((p) => ({
                                    ...p,
                                    current_page: pageNum,
                                  }))
                                }
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
                          setPagination((p) => ({
                            ...p,
                            current_page: Math.min(
                              p.current_page + 1,
                              p.last_page,
                            ),
                          }))
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

        {/* Modals */}
        <ViewLegitimacyModal
          isOpen={isViewOpen}
          selectedItem={selectedApplication}
          onClose={() => {
            setIsViewOpen(false);
            setSelectedApplication(null);
          }}
        />
        {isModalOpen &&
          (modalMode === "create" ||
            (modalMode === "edit" && selectedApplication?.id)) && (
            <AdminLegitimacyModal
              isOpen={isModalOpen}
              mode={modalMode}
              initialData={selectedApplication || undefined}
              onClose={closeModal}
              onSubmitSuccess={() => {
                fetchLegitimacy();
                closeModal();
              }}
            />
          )}
        <AdminDeleteLegitimacyModal
          isOpen={isDeleteOpen}
          itemName={deleteTarget?.alias || "Application"}
          onClose={() => {
            setIsDeleteOpen(false);
            setDeleteTarget(null);
          }}
          onConfirm={confirmDelete}
        />
      </div>
    </AdminLayout>
  );
}
