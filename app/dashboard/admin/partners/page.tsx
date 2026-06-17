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
  Plus,
  Handshake,
} from "lucide-react";
import AdminLayout from "@/components/adminLayout";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/components/ui/use-toast";
import ViewBusinessModal from "@/components/admin/partners/view-modal";
import AdminBusinessModal from "@/components/admin/partners/edit-modal";
import { AdminDeleteBusinessModal } from "@/components/admin/partners/delete-modal";

interface BusinessPartner {
  id: number;
  business_name: string;
  website_link?: string;
  category: string;
  description?: string;
  photo?: string;
  status: "pending" | "approved" | "rejected";
  admin_note?: string;
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

export default function AdminPartnersPage() {
  const { user, loading: authLoading } = useAuth(true);
  const { toast } = useToast();
  const [partners, setPartners] = useState<BusinessPartner[]>([]);
  const [loading, setLoading] = useState(true);
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

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [selectedPartner, setSelectedPartner] =
    useState<BusinessPartner | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<BusinessPartner | null>(
    null,
  );

  const fetchPartners = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.current_page.toString(),
        per_page: pagination.per_page.toString(),
      });
      if (statusFilter !== "all") params.append("status", statusFilter);
      if (searchQuery) params.append("search", searchQuery);

      const res = await fetch(
        `/api/admin/business-partners?${params.toString()}`,
        {
          credentials: "include",
        },
      );
      const data = await res.json();

      if (res.ok && data.success) {
        setPartners(data.data.data || []);
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
          description: data.message || "Failed to fetch partners",
        });
      }
    } catch (err) {
      console.error(err);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch partners",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && user) fetchPartners();
  }, [authLoading, user, pagination.current_page, statusFilter]);

  const openCreateModal = () => {
    setSelectedPartner(null);
    setModalMode("create");
    setIsModalOpen(true);
  };

  const openEditModal = (partner: BusinessPartner) => {
    setSelectedPartner(partner);
    setModalMode("edit");
    setIsModalOpen(true);
  };

  const openDeleteModal = (partner: BusinessPartner) => {
    setDeleteTarget(partner);
    setIsDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      const res = await fetch(
        `/api/admin/business-partners/${deleteTarget.id}`,
        {
          method: "DELETE",
          credentials: "include",
        },
      );
      const data = await res.json();
      if (data.success) {
        toast({
          title: "Success",
          description: "Partner deleted successfully",
        });
        fetchPartners();
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: data.message || "Failed to delete partner",
        });
      }
    } catch {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete partner",
      });
    } finally {
      setIsDeleteOpen(false);
      setDeleteTarget(null);
    }
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
        {/* Header */}
        <div className="bg-white border-b border-[#d0e8d0] sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#e8f5e8] rounded-lg">
                <Handshake className="w-6 h-6 text-[#1a4d1a]" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-[#1a2e1a]">
                  Business Partners Management
                </h1>
                <p className="text-xs sm:text-sm text-[#6b8f6b] mt-0.5">
                  Manage all business partners showcase
                </p>
              </div>
            </div>
            <button
              onClick={openCreateModal}
              className="flex items-center gap-2 px-4 py-2 bg-[#1a4d1a] text-white rounded-lg text-sm font-medium hover:bg-[#2d7a2d] transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add Business Partner</span>
            </button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5">
          {/* Search & Filter */}
          <div className="bg-white rounded-xl border border-[#d0e8d0] p-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6b8f6b]" />
                <input
                  type="text"
                  placeholder="Search by business name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && fetchPartners()}
                  className="w-full pl-9 pr-3 py-2 border border-[#c8e6c8] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a4d1a] focus:border-transparent"
                />
              </div>
              <div className="relative sm:w-48">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6b8f6b]" />
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setPagination((p) => ({ ...p, current_page: 1 }));
                  }}
                  className="w-full pl-9 pr-3 py-2 border border-[#c8e6c8] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a4d1a] focus:border-transparent appearance-none bg-white text-[#1a2e1a]"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
              <button
                onClick={fetchPartners}
                className="px-4 py-2 bg-[#1a4d1a] text-white rounded-lg text-sm font-medium hover:bg-[#2d7a2d] transition-colors"
              >
                Search
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl border border-[#d0e8d0] overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center py-14">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#1a4d1a] mx-auto mb-3" />
                  <p className="text-[#6b8f6b] text-sm">Loading partners...</p>
                </div>
              </div>
            ) : partners.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-14">
                <Handshake className="w-12 h-12 text-[#a8d4a8] mb-3" />
                <p className="text-[#1a2e1a] font-medium">
                  No business partners found
                </p>
                <p className="text-[#6b8f6b] text-sm mt-1">
                  Add your first partner using the button above
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-[#f2faf2] border-b border-[#d0e8d0]">
                    <tr>
                      {[
                        "Business Name",
                        "Category",
                        "Description",
                        "Status",
                        "Created At",
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
                    {partners.map((partner) => (
                      <tr
                        key={partner.id}
                        className="hover:bg-[#f9fdf9] transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#1a2e1a]">
                          {partner.business_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-[#3d5c3d]">
                          {partner.category}
                        </td>
                        <td className="px-6 py-4 text-sm text-[#6b8f6b] max-w-xs truncate">
                          {partner.description || "-"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2.5 py-1 inline-flex text-xs font-semibold rounded-full ${
                              partner.status === "approved"
                                ? "bg-green-100 text-green-800"
                                : partner.status === "pending"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-red-100 text-red-800"
                            }`}
                          >
                            {partner.status.charAt(0).toUpperCase() +
                              partner.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-[#6b8f6b]">
                          {formatDate(partner.created_at)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => {
                                setSelectedPartner(partner);
                                setIsViewOpen(true);
                              }}
                              className="p-1.5 text-[#1a4d1a] hover:bg-[#e8f5e8] rounded-lg transition-colors"
                              title="View details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => openEditModal(partner)}
                              className="p-1.5 text-[#3d5c3d] hover:bg-[#e8f5e8] rounded-lg transition-colors"
                              title="Edit partner"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => openDeleteModal(partner)}
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete partner"
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
            {pagination.total > pagination.per_page && !loading && (
              <div className="px-6 py-4 border-t border-[#d0e8d0] flex flex-col sm:flex-row items-center justify-between gap-3">
                <p className="text-sm text-[#6b8f6b]">
                  Showing {pagination.from} to {pagination.to} of{" "}
                  {pagination.total} entries
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
                    className="p-2 border border-[#c8e6c8] rounded-lg hover:bg-[#f2faf2] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4 text-[#1a4d1a]" />
                  </button>
                  <div className="flex items-center gap-1">
                    {Array.from(
                      { length: Math.min(5, pagination.last_page) },
                      (_, i) => {
                        let pageNum;
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
                            key={i}
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
                        current_page: Math.min(p.current_page + 1, p.last_page),
                      }))
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
      </div>

      {/* Modals */}
      <ViewBusinessModal
        isOpen={isViewOpen}
        selectedItem={selectedPartner}
        onClose={() => {
          setIsViewOpen(false);
          setSelectedPartner(null);
        }}
      />
      {isModalOpen && (
        <AdminBusinessModal
          isOpen={isModalOpen}
          mode={modalMode}
          initialData={selectedPartner}
          onClose={() => setIsModalOpen(false)}
          onSubmitSuccess={fetchPartners}
        />
      )}
      <AdminDeleteBusinessModal
        isOpen={isDeleteOpen}
        itemName={deleteTarget?.business_name || ""}
        onClose={() => {
          setIsDeleteOpen(false);
          setDeleteTarget(null);
        }}
        onConfirm={confirmDelete}
      />
    </AdminLayout>
  );
}
