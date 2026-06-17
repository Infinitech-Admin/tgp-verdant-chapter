"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  Calendar,
  Loader2,
  X,
  Tag,
  Sparkles,
  AlertTriangle,
  FileText,
  Zap,
} from "lucide-react";

interface Announcement {
  id: number;
  title: string;
  date: string;
  category: "Update" | "Event" | "Alert" | "Development" | "Health" | "Notice";
  description: string;
  content: string;
  is_active: boolean;
  priority: number;
  created_at: string;
  updated_at: string;
}

export default function AnnouncementsSection() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [subscribing, setSubscribing] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] =
    useState<Announcement | null>(null);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/announcements?per_page=12`);
      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ message: "Failed to fetch announcements" }));
        throw new Error(errorData.message || "Failed to load announcements");
      }
      const data = await response.json();
      if (data.success && data.data) {
        const announcementsArray = data.data.data || data.data || [];
        setAnnouncements(announcementsArray);
      } else {
        throw new Error(data.message || "Failed to load announcements");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load announcements";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async () => {
    if (!email || !email.includes("@")) {
      alert("Please enter a valid email address.");
      return;
    }
    setSubscribing(true);
    try {
      const subscribeResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/subscribers/subscribe`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        },
      );
      const subscribeData = await subscribeResponse.json();
      if (!subscribeData.success) {
        alert(
          subscribeData.message || "Failed to subscribe. Please try again.",
        );
        setSubscribing(false);
        return;
      }
      const emailResponse = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: email,
          type: "verification",
          data: {
            email,
            verifyUrl: `${window.location.origin}/verify-subscription?token=${subscribeData.data.token}`,
          },
        }),
      });
      const emailData = await emailResponse.json();
      if (emailData.success) {
        setEmail("");
        alert(
          "Successfully subscribed! Please check your email to verify your subscription.",
        );
      } else {
        alert(
          "Subscribed, but failed to send verification email. Please contact support.",
        );
      }
    } catch (error) {
      alert("Failed to subscribe. Please try again later.");
    } finally {
      setSubscribing(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    if (category === "Event") return Calendar;
    if (category === "Alert") return Zap;
    return FileText;
  };

  const getCategoryStyle = (category: string) => {
    const styles: Record<string, string> = {
      Alert: "bg-[#1a4d1a] text-[#d4a017] border border-[#d4a017]",
      Event: "bg-[#2d7a2d] text-white border border-[#2d7a2d]",
      Update: "bg-[#e8f5e8] text-[#1a4d1a] border border-[#c8e6c8]",
      Development: "bg-[#f2faf2] text-[#1a4d1a] border border-[#c8e6c8]",
      Health: "bg-[#d4a017]/10 text-[#7a5c0a] border border-[#d4a017]/30",
      Notice: "bg-[#e8f5e8] text-[#1a4d1a] border border-[#c8e6c8]",
    };
    return (
      styles[category] ?? "bg-[#e8f5e8] text-[#1a4d1a] border border-[#c8e6c8]"
    );
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  return (
    <div className="pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden z-10 bg-[#f2faf2]">
      {/* Decorative glows */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#2d7a2d]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#d4a017]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="relative w-16 h-16 mx-auto mb-4">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 border-4 border-transparent border-t-[#1a4d1a] border-r-[#2d7a2d] border-b-[#d4a017] rounded-full"
                />
              </div>
              <p className="text-[#3d5c3d] font-medium">
                Loading announcements...
              </p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16"
          >
            <div className="w-20 h-20 bg-[#1a4d1a] border-2 border-[#d4a017] rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl">
              <AlertTriangle className="w-10 h-10 text-[#d4a017]" />
            </div>
            <h3 className="text-2xl font-bold text-[#1a2e1a] mb-3">
              Unable to Load Announcements
            </h3>
            <p className="text-[#6b8f6b] mb-6 max-w-md mx-auto">{error}</p>
            <button
              onClick={fetchAnnouncements}
              className="px-8 py-4 bg-[#1a4d1a] hover:bg-[#2d7a2d] text-white rounded-full font-semibold text-lg transition-all hover:scale-105"
            >
              Try Again
            </button>
          </motion.div>
        )}

        {/* Announcements Grid */}
        {!loading && !error && announcements.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
              {announcements.map((announcement, i) => {
                const Icon = getCategoryIcon(announcement.category);
                return (
                  <motion.div
                    key={announcement.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08, duration: 0.5 }}
                    viewport={{ once: true }}
                    whileHover={{ y: -8, scale: 1.02 }}
                    onClick={() => setSelectedAnnouncement(announcement)}
                    className="p-6 rounded-3xl bg-white border border-[#d0e8d0] hover:border-[#2d7a2d] hover:shadow-lg hover:shadow-[#1a4d1a]/10 transition-all group cursor-pointer"
                  >
                    {/* Icon */}
                    <div className="w-14 h-14 bg-[#1a4d1a] border-2 border-[#d4a017] rounded-full flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform">
                      <Icon className="w-7 h-7 text-[#d4a017]" />
                    </div>

                    {/* Category badge */}
                    <div className="mb-3">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase ${getCategoryStyle(announcement.category)}`}
                      >
                        <Tag className="w-3 h-3" />
                        {announcement.category}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-[#b8870c] mb-3 font-medium">
                      <Calendar className="w-3.5 h-3.5" />
                      {formatDate(announcement.date)}
                    </div>

                    <h3 className="text-base font-bold text-[#1a2e1a] mb-2 group-hover:text-[#1a4d1a] transition-colors line-clamp-2">
                      {announcement.title}
                    </h3>

                    <p className="text-[#6b8f6b] line-clamp-3 leading-relaxed text-sm mb-4">
                      {announcement.description}
                    </p>

                    <motion.div
                      whileHover={{ x: 5 }}
                      className="inline-flex items-center gap-2 text-sm font-bold text-[#2d7a2d]"
                    >
                      Read More
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
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </motion.div>
                  </motion.div>
                );
              })}
            </div>

            {/* Subscribe CTA */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="relative rounded-3xl bg-white border border-[#d0e8d0] p-10 md:p-16 text-center shadow-sm overflow-hidden"
            >
              {/* Subtle bg tint */}
              <div className="absolute inset-0 bg-[#f2faf2] opacity-60 pointer-events-none" />

              <div className="relative z-10">
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{
                    duration: 20,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                  className="w-20 h-20 mx-auto mb-6 bg-[#1a4d1a] border-2 border-[#d4a017] rounded-full flex items-center justify-center shadow-lg"
                >
                  <Sparkles className="w-10 h-10 text-[#d4a017]" />
                </motion.div>

                <h2 className="text-3xl md:text-4xl font-bold mb-4 text-[#1a2e1a]">
                  Never Miss an Update
                </h2>
                <p className="text-[#6b8f6b] mb-8 max-w-2xl mx-auto text-lg">
                  Subscribe to receive the latest announcements and community
                  news directly to your inbox.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSubscribe()}
                    placeholder="Enter your email address"
                    className="flex-1 px-6 py-4 rounded-full text-[#1a2e1a] bg-[#f2faf2] border border-[#c8e6c8] placeholder-[#6b8f6b] focus:outline-none focus:ring-2 focus:ring-[#2d7a2d]/30 focus:border-[#2d7a2d] text-base font-medium"
                  />
                  <motion.button
                    onClick={handleSubscribe}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    disabled={subscribing}
                    className="px-8 py-4 bg-[#1a4d1a] hover:bg-[#2d7a2d] text-white font-bold rounded-full transition-all disabled:opacity-50 flex items-center justify-center gap-2 whitespace-nowrap shadow-md text-base"
                  >
                    {subscribing ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Subscribing...
                      </>
                    ) : (
                      "Subscribe Now"
                    )}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </>
        )}

        {/* Empty State */}
        {!loading && !error && announcements.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20"
          >
            <div className="w-24 h-24 bg-[#1a4d1a] border-2 border-[#d4a017] rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
              <Bell className="w-12 h-12 text-[#d4a017]" />
            </div>
            <h3 className="text-2xl font-bold text-[#1a2e1a] mb-3">
              No Announcements Yet
            </h3>
            <p className="text-[#6b8f6b] text-lg">
              Check back later for community updates and news.
            </p>
          </motion.div>
        )}
      </div>

      {/* Announcement Modal */}
      <AnimatePresence>
        {selectedAnnouncement && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedAnnouncement(null)}
            className="fixed inset-0 bg-black/40 z-[9999] flex items-center justify-center p-4 overflow-y-auto"
            style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0 }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl max-w-2xl w-full max-h-[80vh] shadow-2xl relative flex flex-col my-8 border border-[#d0e8d0]"
            >
              {/* Close bar */}
              <div className="flex-shrink-0 flex justify-end p-3 sm:p-4 bg-white rounded-t-3xl border-b border-[#e8f5e8]">
                <button
                  onClick={() => setSelectedAnnouncement(null)}
                  className="p-2 hover:bg-[#e8f5e8] rounded-full transition-all"
                  aria-label="Close modal"
                >
                  <X className="w-5 h-5 sm:w-6 sm:h-6 text-[#1a4d1a]" />
                </button>
              </div>

              {/* Content */}
              <div className="px-6 pb-8 sm:px-10 sm:pb-10 overflow-y-auto flex-1">
                <div className="flex items-center gap-4 mb-6 pt-2">
                  <div className="w-14 h-14 bg-[#1a4d1a] border-2 border-[#d4a017] rounded-full flex items-center justify-center shadow-md flex-shrink-0">
                    {(() => {
                      const Icon = getCategoryIcon(
                        selectedAnnouncement.category,
                      );
                      return <Icon className="w-7 h-7 text-[#d4a017]" />;
                    })()}
                  </div>
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-sm font-semibold capitalize ${getCategoryStyle(selectedAnnouncement.category)}`}
                  >
                    {selectedAnnouncement.category}
                  </span>
                </div>

                <h2 className="text-2xl sm:text-3xl font-bold text-[#1a2e1a] mb-3 leading-tight">
                  {selectedAnnouncement.title}
                </h2>

                <p className="text-[#b8870c] text-sm font-medium mb-6">
                  {formatDate(selectedAnnouncement.date)}
                </p>

                <div className="prose prose-lg max-w-none">
                  <p className="text-[#3d5c3d] leading-relaxed whitespace-pre-wrap mb-4">
                    {selectedAnnouncement.description}
                  </p>
                  <p className="text-[#3d5c3d] leading-relaxed whitespace-pre-wrap">
                    {selectedAnnouncement.content}
                  </p>
                </div>

                <div className="mt-8">
                  <button
                    onClick={() => setSelectedAnnouncement(null)}
                    className="w-full px-6 py-3 rounded-full bg-[#e8f5e8] hover:bg-[#d0e8d0] text-[#1a4d1a] font-semibold transition-all border border-[#c8e6c8]"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
