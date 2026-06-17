"use client";

import { useState, useEffect } from "react";
import MemberLayout from "@/components/memberLayout";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Images } from "lucide-react";

interface GalleryItem {
  id: number;
  title: string;
  description?: string;
  image_url: string;
  type: "photo" | "video" | "interaction" | "event" | "gathering";
  created_at: string;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function MemberGalleryPage() {
  const [galleries, setGalleries] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<GalleryItem | null>(null);
  const [filter, setFilter] = useState<GalleryItem["type"] | "all">("all");

  useEffect(() => {
    const fetchGalleries = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/galleries", { credentials: "include" });
        const data = await res.json();

        let galleriesData: GalleryItem[] = [];
        if (data.success) {
          if (Array.isArray(data.data)) galleriesData = data.data;
          else if (data.data && Array.isArray(data.data.data))
            galleriesData = data.data.data;
          else if (data.data && typeof data.data === "object")
            galleriesData = [data.data];
        } else if (Array.isArray(data)) {
          galleriesData = data;
        }

        setGalleries(galleriesData);
      } catch (err) {
        console.error("[MemberGallery] Error fetching galleries:", err);
        setGalleries([]);
      } finally {
        setLoading(false);
      }
    };
    fetchGalleries();
  }, []);

  const filteredGalleries =
    filter === "all"
      ? galleries
      : galleries.filter((item) => item.type === filter);

  const TYPES = [
    "all",
    "photo",
    "video",
    "interaction",
    "event",
    "gathering",
  ] as const;

  return (
    <MemberLayout>
      <div className="min-h-screen bg-[#f2faf2] overflow-x-hidden">
        {/* Header */}
        <div className="bg-white border-b border-[#d0e8d0] sticky top-0 z-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <div className="p-2 bg-[#e8f5e8] rounded-lg shrink-0">
                <Images className="w-5 h-5 text-[#1a4d1a]" />
              </div>
              <div className="min-w-0">
                <h1 className="text-base sm:text-xl font-bold text-[#1a2e1a] truncate">
                  Gallery
                </h1>
                <p className="text-xs text-[#6b8f6b]">
                  Explore the latest images and moments
                </p>
              </div>
            </div>

            {!loading && (
              <span className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-[#1a4d1a] bg-[#e8f5e8] border border-[#d0e8d0] px-3 py-1.5 rounded-full shrink-0">
                <Images className="w-3.5 h-3.5" />
                {filteredGalleries.length} Items
              </span>
            )}
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-white border-b border-[#d0e8d0] sticky top-[61px] sm:top-[69px] z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 overflow-x-auto">
            <div className="flex items-center gap-2 w-max">
              {TYPES.map((type) => (
                <button
                  key={type}
                  onClick={() => setFilter(type as GalleryItem["type"] | "all")}
                  className={`px-4 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all
                    ${
                      filter === type
                        ? "bg-[#1a4d1a] text-white shadow-sm"
                        : "bg-[#e8f5e8] text-[#3d5c3d] hover:bg-[#d0e8d0]"
                    }`}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                  {type === "all"
                    ? ` (${galleries.length})`
                    : ` (${galleries.filter((g) => g.type === type).length})`}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main */}
        <main className="px-4 sm:px-6 py-6 max-w-7xl mx-auto">
          {/* Loading */}
          {loading && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {[...Array(12)].map((_, i) => (
                <div
                  key={i}
                  className="aspect-square rounded-xl bg-[#e8f5e8] animate-pulse"
                />
              ))}
            </div>
          )}

          {/* Empty */}
          {!loading && filteredGalleries.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center bg-white border border-[#d0e8d0] rounded-xl">
              <div className="w-14 h-14 bg-[#e8f5e8] rounded-full flex items-center justify-center mb-4">
                <Images className="w-7 h-7 text-[#6b8f6b]" />
              </div>
              <h3 className="text-sm font-semibold text-[#1a2e1a] mb-1">
                No items found
              </h3>
              <p className="text-xs text-[#6b8f6b] max-w-xs">
                {filter !== "all"
                  ? `No ${filter} items available yet.`
                  : "No gallery items available yet."}
              </p>
            </div>
          )}

          {/* Grid */}
          {!loading && filteredGalleries.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {filteredGalleries.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setSelected(item)}
                  className="group relative aspect-square rounded-xl overflow-hidden bg-[#e8f5e8] border border-[#d0e8d0] cursor-pointer hover:border-[#1a4d1a] hover:shadow-md transition-all duration-200"
                >
                  <img
                    src={item.image_url}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      e.currentTarget.src = "/placeholder.png";
                    }}
                  />
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-[#1a2e1a]/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col items-center justify-center gap-2 p-3">
                    <span className="text-white text-xs font-semibold text-center leading-snug line-clamp-3">
                      {item.title}
                    </span>
                    <span className="px-2 py-0.5 bg-[#e8f5e8] text-[#1a4d1a] text-xs font-semibold rounded-full">
                      {item.type}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>

        {/* Modal */}
        {selected && (
          <Dialog
            open={!!selected}
            onOpenChange={(open) => !open && setSelected(null)}
          >
            <DialogContent className="max-w-3xl w-full p-0 overflow-hidden rounded-xl border border-[#d0e8d0]">
              <DialogHeader className="p-0">
                <div className="w-full bg-[#e8f5e8]">
                  <img
                    src={selected.image_url}
                    alt={selected.title}
                    className="w-full max-h-[70vh] object-contain"
                    onError={(e) => {
                      e.currentTarget.src = "/placeholder.png";
                    }}
                  />
                </div>
                <div className="p-4 bg-white">
                  <div className="flex items-center gap-2 mb-1">
                    <DialogTitle className="text-base font-bold text-[#1a2e1a]">
                      {selected.title}
                    </DialogTitle>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#e8f5e8] text-[#1a4d1a] border border-[#d0e8d0]">
                      {selected.type}
                    </span>
                  </div>
                  {selected.description && (
                    <DialogDescription className="text-xs text-[#6b8f6b] mt-1">
                      {selected.description}
                    </DialogDescription>
                  )}
                  <p className="mt-2 text-xs text-[#6b8f6b]">
                    {new Date(selected.created_at).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </DialogHeader>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </MemberLayout>
  );
}
