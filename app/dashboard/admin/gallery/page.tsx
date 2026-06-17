"use client";

import { useEffect, useState } from "react";
import {
  Plus,
  Trash2,
  Edit,
  Image as ImageIcon,
  X,
  Upload,
} from "lucide-react";
import Image from "next/image";
import AdminLayout from "@/components/adminLayout";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/components/ui/use-toast";

interface Gallery {
  id: number;
  title: string;
  description?: string;
  image_url: string;
  type: string;
  created_at: string;
}

export default function AdminGalleryPage() {
  const { user, loading: authLoading } = useAuth(true);
  const { toast } = useToast();

  const [galleries, setGalleries] = useState<Gallery[]>([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mode, setMode] = useState<"create" | "edit">("create");
  const [editingId, setEditingId] = useState<number | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<string>("photo");
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState("");

  const typeOptions = [
    { value: "photo", label: "Photo" },
    { value: "video", label: "Video" },
    { value: "interaction", label: "Interaction" },
    { value: "event", label: "Event" },
    { value: "gathering", label: "Gathering" },
  ];

  const fetchGalleries = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/galleries", { credentials: "include" });
      const data = await res.json();
      if (Array.isArray(data)) {
        setGalleries(data);
      } else {
        setGalleries([]);
      }
    } catch (error) {
      console.error("[Gallery] Fetch error:", error);
      toast({ variant: "destructive", title: "Failed to load gallery" });
      setGalleries([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && user) fetchGalleries();
  }, [authLoading, user]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 12 * 1024 * 1024) {
      toast({
        variant: "destructive",
        title: "Image too large",
        description: "Max 12MB",
      });
      return;
    }
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const openCreate = () => {
    setMode("create");
    setEditingId(null);
    setTitle("");
    setDescription("");
    setType("photo");
    setImage(null);
    setPreview("");
    setIsModalOpen(true);
  };

  const openEdit = (g: Gallery) => {
    setMode("edit");
    setEditingId(g.id);
    setTitle(g.title);
    setDescription(g.description ?? "");
    setType(g.type || "photo");
    setPreview(g.image_url);
    setImage(null);
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  const handleSubmit = async () => {
    if (!title || (!image && mode === "create")) {
      toast({ variant: "destructive", title: "Title & image required" });
      return;
    }
    const form = new FormData();
    form.append("title", title);
    form.append("description", description);
    form.append("type", type);
    if (image) form.append("image", image);

    const url =
      mode === "edit"
        ? `/api/admin/galleries/${editingId}`
        : "/api/admin/galleries";
    const method = mode === "edit" ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        credentials: "include",
        body: form,
      });
      const data = await res.json();
      if (res.ok) {
        toast({
          title: "Success",
          description: `Gallery ${mode === "create" ? "added" : "updated"} successfully`,
        });
        closeModal();
        fetchGalleries();
      } else {
        toast({
          variant: "destructive",
          title: "Failed to save",
          description: data.message || "An error occurred",
        });
      }
    } catch (error) {
      console.error("[Gallery] Submit error:", error);
      toast({ variant: "destructive", title: "Failed to save" });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this image?")) return;
    try {
      const res = await fetch(`/api/admin/galleries/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        toast({
          title: "Deleted",
          description: "Gallery image removed successfully",
        });
        fetchGalleries();
      } else {
        toast({ variant: "destructive", title: "Failed to delete" });
      }
    } catch (error) {
      console.error("[Gallery] Delete error:", error);
      toast({ variant: "destructive", title: "Failed to delete" });
    }
  };

  if (authLoading) return null;

  return (
    <AdminLayout>
      <div className="min-h-screen bg-[#f2faf2]">
        {/* Header */}
        <div className="bg-white border-b border-[#d0e8d0] sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#e8f5e8] rounded-lg">
                <ImageIcon className="w-6 h-6 text-[#1a4d1a]" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-[#1a2e1a]">
                  Gallery
                </h1>
                <p className="text-xs sm:text-sm text-[#6b8f6b] mt-0.5">
                  Manage images and visual content
                </p>
              </div>
            </div>
            <button
              onClick={openCreate}
              className="flex items-center gap-2 px-4 py-2 bg-[#1a4d1a] text-white rounded-lg text-sm font-medium hover:bg-[#2d7a2d] transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">New Image</span>
            </button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {loading ? (
            <div className="flex items-center justify-center py-14">
              <div className="text-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#1a4d1a] mx-auto mb-3" />
                <p className="text-[#6b8f6b] text-sm">Loading gallery...</p>
              </div>
            </div>
          ) : galleries.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-14">
              <ImageIcon className="w-12 h-12 text-[#a8d4a8] mb-3" />
              <p className="text-[#1a2e1a] font-medium">No images yet</p>
              <p className="text-[#6b8f6b] text-sm mt-1">
                Click "New Image" to add your first gallery image.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {galleries.map((g) => (
                <div
                  key={g.id}
                  className="bg-white border border-[#d0e8d0] rounded-xl overflow-hidden hover:shadow-md transition-shadow flex flex-col"
                >
                  <div className="relative h-48 flex-shrink-0">
                    <Image
                      src={g.image_url}
                      alt={g.title || "Gallery image"}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                    <div className="absolute top-2 right-2 bg-[#1a4d1a]/80 text-white text-xs px-2 py-1 rounded-full">
                      {g.type}
                    </div>
                  </div>
                  <div className="p-3 flex flex-col flex-grow">
                    <p className="font-medium text-[#1a2e1a] truncate">
                      {g.title || "Untitled"}
                    </p>
                    <div className="min-h-[2.5rem] mt-1">
                      {g.description && (
                        <p className="text-xs text-[#6b8f6b] line-clamp-2">
                          {g.description}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2 pt-2 mt-auto">
                      <button
                        onClick={() => openEdit(g)}
                        className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 border border-[#c8e6c8] text-[#1a4d1a] rounded-lg hover:bg-[#e8f5e8] transition-colors text-xs font-medium"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(g.id)}
                        className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors text-xs font-medium"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col bg-white rounded-xl border border-[#d0e8d0] shadow-2xl">
              {/* Modal header */}
              <div className="bg-[#f2faf2] border-b border-[#d0e8d0] px-6 py-4 flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#e8f5e8] rounded-lg">
                    <ImageIcon className="w-5 h-5 text-[#1a4d1a]" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-[#1a2e1a]">
                      {mode === "create" ? "Add Image" : "Edit Image"}
                    </h2>
                    <p className="text-xs text-[#6b8f6b] mt-0.5">
                      Fill in the fields below
                    </p>
                  </div>
                </div>
                <button
                  onClick={closeModal}
                  className="p-1.5 hover:bg-[#d0e8d0] rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-[#6b8f6b]" />
                </button>
              </div>

              {/* Modal body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#1a2e1a] mb-1.5">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    className="w-full px-3 py-2 border border-[#c8e6c8] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a4d1a] focus:border-transparent"
                    placeholder="Enter image title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#1a2e1a] mb-1.5">
                    Description{" "}
                    <span className="text-[#6b8f6b] font-normal">
                      (optional)
                    </span>
                  </label>
                  <textarea
                    className="w-full px-3 py-2 border border-[#c8e6c8] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a4d1a] focus:border-transparent resize-none"
                    placeholder="Enter description"
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#1a2e1a] mb-1.5">
                    Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full px-3 py-2 border border-[#c8e6c8] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a4d1a] focus:border-transparent bg-white text-[#1a2e1a]"
                  >
                    {typeOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {preview ? (
                  <div className="space-y-2">
                    <div className="relative h-56 border border-[#c8e6c8] rounded-xl overflow-hidden">
                      <Image
                        src={preview}
                        alt="Preview"
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                    <button
                      onClick={() => {
                        setImage(null);
                        setPreview("");
                      }}
                      className="text-sm text-red-600 hover:text-red-700"
                    >
                      Remove image
                    </button>
                  </div>
                ) : (
                  <label className="border-dashed border-2 border-[#c8e6c8] p-8 flex flex-col items-center cursor-pointer hover:border-[#1a4d1a] hover:bg-[#f2faf2] transition-colors rounded-xl">
                    <Upload className="w-10 h-10 text-[#6b8f6b] mb-2" />
                    <span className="text-sm text-[#3d5c3d] font-medium">
                      Click to upload image
                    </span>
                    <span className="text-xs text-[#6b8f6b] mt-1">
                      Max 12MB
                    </span>
                    <input
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={handleImageChange}
                    />
                  </label>
                )}
              </div>

              {/* Modal footer */}
              <div className="border-t border-[#d0e8d0] px-6 py-4 bg-white flex-shrink-0 flex justify-end gap-3">
                <button
                  onClick={closeModal}
                  className="px-4 py-2.5 border border-[#c8e6c8] text-[#3d5c3d] rounded-lg hover:bg-[#f2faf2] transition-colors text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  className="px-4 py-2.5 bg-[#1a4d1a] text-white rounded-lg hover:bg-[#2d7a2d] transition-colors text-sm font-medium flex items-center gap-2"
                >
                  <ImageIcon className="w-4 h-4" />
                  {mode === "create" ? "Add Image" : "Update Image"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
