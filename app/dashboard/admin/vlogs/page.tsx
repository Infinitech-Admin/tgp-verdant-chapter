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
  Video,
} from "lucide-react";
import AdminLayout from "@/components/adminLayout";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/components/ui/use-toast";
import ViewVlogsModal from "@/components/admin/vlogs/view-modal";
import AdminVlogsModal from "@/components/admin/vlogs/add-edit-modal";
import { AdminDeleteVlogsModal } from "@/components/admin/vlogs/delete-modal";

interface Vlog {
  id: number;
  title: string;
  category: string;
  description?: string;
  is_active: boolean;
  date: string;
  created_at: string;
  video?: File | string;
  content: string;
}

interface PaginationData {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
}

export default function AdminVlogsPage() {
  const { user, loading: authLoading } = useAuth(true);
  const { toast } = useToast();
  const [vlogs, setVlogs] = useState<Vlog[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [selectedVlog, setSelectedVlog] = useState<Vlog | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Vlog | null>(null);
  const [pagination, setPagination] = useState<PaginationData>({
    current_page: 1,
    last_page: 1,
    per_page: 10,
    total: 0,
    from: 0,
    to: 0,
  });

  const fetchVlogs = async (page = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        per_page: pagination.per_page.toString(),
      });
      if (search) params.append("search", search);
      if (category) params.append("category", category);

      const res = await fetch(`/api/admin/vlogs?${params.toString()}`, {
        credentials: "include",
      });
      const json = await res.json();

      if (res.ok && json.success) {
        setVlogs(json.data.data);
        setPagination({
          current_page: json.data.current_page,
          last_page: json.data.last_page,
          per_page: json.data.per_page,
          total: json.data.total,
          from: json.data.from,
          to: json.data.to,
        });
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: json.message || "Failed to load vlogs",
        });
      }
    } catch (err) {
      console.error(err);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Server error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const uniqueCategories = Array.from(new Set(vlogs.map((v) => v.category)));
    setCategories(uniqueCategories);
  }, [vlogs]);

  useEffect(() => {
    fetchVlogs(1);
  }, [search, category]);

  useEffect(() => {
    if (!authLoading && user) fetchVlogs();
  }, [authLoading, user, pagination.current_page]);

  const openCreateModal = () => {
    setSelectedVlog(null);
    setModalMode("create");
    setIsModalOpen(true);
  };

  const openEditModal = (vlog: Vlog) => {
    setSelectedVlog(vlog);
    setModalMode("edit");
    setIsModalOpen(true);
  };

  const openDeleteModal = (vlog: Vlog) => {
    setDeleteTarget(vlog);
    setIsDeleteOpen(true);
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
                <Video className="w-6 h-6 text-[#1a4d1a]" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-[#1a2e1a]">
                  Vlogs Management
                </h1>
                <p className="text-xs sm:text-sm text-[#6b8f6b] mt-0.5">
                  Manage and review all vlogs
                </p>
              </div>
            </div>
            <button
              onClick={openCreateModal}
              className="flex items-center gap-2 px-4 py-2 bg-[#1a4d1a] text-white rounded-lg text-sm font-medium hover:bg-[#2d7a2d] transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">New Vlog</span>
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
                  placeholder="Search by title, category, or description..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && fetchVlogs()}
                  className="w-full pl-9 pr-3 py-2 border border-[#c8e6c8] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a4d1a] focus:border-transparent"
                />
              </div>
              <div className="relative sm:w-48">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6b8f6b] pointer-events-none" />
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-[#c8e6c8] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a4d1a] focus:border-transparent appearance-none bg-white text-[#1a2e1a]"
                >
                  <option value="">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              <button
                onClick={() => fetchVlogs()}
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
                  <p className="text-[#6b8f6b] text-sm">Loading vlogs...</p>
                </div>
              </div>
            ) : vlogs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-14">
                <Video className="w-12 h-12 text-[#a8d4a8] mb-3" />
                <p className="text-[#1a2e1a] font-medium">No vlogs found</p>
                <p className="text-[#6b8f6b] text-sm mt-1">
                  Add your first vlog using the button above
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-[#f2faf2] border-b border-[#d0e8d0]">
                    <tr>
                      {[
                        "Title",
                        "Category",
                        "Date",
                        "Status",
                        "Created",
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
                    {vlogs.map((vlog) => (
                      <tr
                        key={vlog.id}
                        className="hover:bg-[#f9fdf9] transition-colors"
                      >
                        <td className="px-6 py-4 text-sm font-medium text-[#1a2e1a]">
                          {vlog.title}
                        </td>
                        <td className="px-6 py-4 text-sm text-[#3d5c3d]">
                          {vlog.category}
                        </td>
                        <td className="px-6 py-4 text-sm text-[#6b8f6b]">
                          {formatDate(vlog.date) || "-"}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                              vlog.is_active
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {vlog.is_active ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-[#6b8f6b]">
                          {formatDate(vlog.created_at)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => {
                                setSelectedVlog(vlog);
                                setIsViewOpen(true);
                              }}
                              className="p-1.5 text-[#1a4d1a] hover:bg-[#e8f5e8] rounded-lg transition-colors"
                              title="View details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => openEditModal(vlog)}
                              className="p-1.5 text-[#3d5c3d] hover:bg-[#e8f5e8] rounded-lg transition-colors"
                              title="Edit vlog"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                openDeleteModal(vlog);
                                setSelectedVlog(vlog);
                              }}
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete vlog"
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

        {/* Modals */}
        <ViewVlogsModal
          isOpen={isViewOpen}
          selectedItem={selectedVlog}
          onClose={() => {
            setIsViewOpen(false);
            setSelectedVlog(null);
          }}
        />
        {isModalOpen && (
          <AdminVlogsModal
            isOpen={isModalOpen}
            mode={modalMode}
            initialData={selectedVlog || undefined}
            onClose={() => setIsModalOpen(false)}
            onSubmitSuccess={fetchVlogs}
          />
        )}
        <AdminDeleteVlogsModal
          isOpen={isDeleteOpen}
          itemName={deleteTarget?.title || "Title"}
          vlogId={selectedVlog}
          onClose={() => {
            setIsDeleteOpen(false);
            setDeleteTarget(null);
          }}
          onDeleted={fetchVlogs}
        />
      </div>
    </AdminLayout>
  );
}
