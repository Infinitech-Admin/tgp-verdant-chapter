"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Bell, Calendar, X, AlertTriangle, ChevronRight } from "lucide-react";

interface Announcement {
  id: number;
  title: string;
  date: string;
  category: "Update" | "Event" | "Alert" | "Development" | "Notice" | "Health";
  description: string;
  content: string;
  is_active: boolean;
  priority: number;
  image_url?: string;
  created_at: string;
  updated_at: string;
}

export default function AnnouncementSection() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAnnouncement, setSelectedAnnouncement] =
    useState<Announcement | null>(null);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/announcements?per_page=6");

      if (!response.ok) {
        const err = await response.json().catch(() => null);
        throw new Error(err?.message || "Failed to load announcements");
      }

      const data = await response.json();

      if (!data?.success || !data?.data) {
        throw new Error(data?.message || "Invalid API response");
      }

      const raw = data.data.data ?? data.data ?? [];

      const normalized: Announcement[] = raw.map((item: any) => ({
        ...item,
        date: item.date || item.created_at,
        description: item.description || item.content?.slice(0, 140) || "",
      }));

      setAnnouncements(normalized);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load announcements",
      );
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  return (
    <>
      <section className="bg-white border border-[#d0e8d0] rounded-xl p-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[#d0e8d0]">
          <div className="p-2 bg-[#e8f5e8] rounded-lg">
            <Bell className="w-5 h-5 text-[#1a4d1a]" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#1a2e1a]">Announcements</h2>
            <p className="text-xs text-[#6b8f6b]">
              Stay informed with the latest updates
            </p>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-16">
            <div className="w-10 h-10 border-4 border-[#1a4d1a] border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="text-center py-12 rounded-xl bg-[#f2faf2]">
            <AlertTriangle className="w-9 h-9 text-red-500 mx-auto mb-3" />
            <p className="text-red-600 mb-4 text-sm">{error}</p>
            <button
              onClick={fetchAnnouncements}
              className="px-5 py-2 bg-[#1a4d1a] text-white text-sm rounded-lg hover:bg-[#1a2e1a] transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Announcements Grid */}
        {!loading && !error && announcements.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {announcements.map((a, i) => (
              <motion.div
                key={a.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                onClick={() => setSelectedAnnouncement(a)}
                className="bg-[#f2faf2] border border-[#d0e8d0] p-4 rounded-lg cursor-pointer hover:border-[#1a4d1a] hover:bg-[#e8f5e8] transition-all duration-200"
              >
                <div className="flex items-center gap-2 text-xs text-[#6b8f6b] mb-2">
                  <Calendar className="w-3.5 h-3.5" />
                  {formatDate(a.date)}
                </div>
                <h3 className="font-semibold text-[#1a2e1a] text-sm mb-1 line-clamp-2">
                  {a.title}
                </h3>
                <p className="text-xs text-[#6b8f6b] line-clamp-2 mb-3">
                  {a.description}
                </p>
                <div className="text-[#1a4d1a] font-semibold text-xs flex items-center gap-1">
                  Read More <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Empty */}
        {!loading && !error && announcements.length === 0 && (
          <div className="text-center py-16 bg-[#f2faf2] rounded-xl">
            <Bell className="w-9 h-9 text-[#6b8f6b] mx-auto mb-3" />
            <p className="text-[#6b8f6b] text-sm">No announcements yet</p>
          </div>
        )}
      </section>

      {/* Modal */}
      {selectedAnnouncement && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => setSelectedAnnouncement(null)}
          className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white border border-[#d0e8d0] rounded-xl max-w-2xl w-full p-6"
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between mb-4 pb-4 border-b border-[#d0e8d0]">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#e8f5e8] rounded-lg shrink-0">
                  <Bell className="w-4 h-4 text-[#1a4d1a]" />
                </div>
                <h2 className="text-lg font-bold text-[#1a2e1a]">
                  {selectedAnnouncement.title}
                </h2>
              </div>
              <button
                onClick={() => setSelectedAnnouncement(null)}
                className="p-1.5 rounded-lg hover:bg-[#e8f5e8] transition-colors ml-3 shrink-0"
              >
                <X className="w-4 h-4 text-[#3d5c3d]" />
              </button>
            </div>

            {/* Modal Date */}
            <div className="flex items-center gap-2 text-xs text-[#6b8f6b] mb-4">
              <Calendar className="w-3.5 h-3.5" />
              {formatDate(selectedAnnouncement.date)}
            </div>

            {/* Modal Body */}
            <p className="text-sm text-[#3d5c3d] whitespace-pre-line leading-relaxed">
              {selectedAnnouncement.content || selectedAnnouncement.description}
            </p>
          </motion.div>
        </motion.div>
      )}
    </>
  );
}
