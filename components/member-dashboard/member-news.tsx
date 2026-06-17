"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Calendar, User, Newspaper, Clock } from "lucide-react";

interface NewsArticle {
  id: number;
  title: string;
  content: string;
  category: string;
  image?: string;
  status: string;
  published_at?: string;
  created_at: string;
  author?: {
    id: number;
    name: string;
    email: string;
  };
}

const ITEMS_PER_PAGE = 6;

export default function NewsSection() {
  const [news, setNews] = React.useState<NewsArticle[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [selectedArticle, setSelectedArticle] =
    React.useState<NewsArticle | null>(null);
  const [currentPage, setCurrentPage] = React.useState(1);

  const getImageUrl = (imagePath?: string) => {
    if (!imagePath) return "/placeholder.svg";
    if (imagePath.startsWith("http")) return imagePath;
    const baseUrl =
      process.env.NEXT_PUBLIC_IMAGE_URL || "http://localhost:8000";
    return `${baseUrl}/${imagePath.replace(/^\/+/, "")}`;
  };

  React.useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/news/published?per_page=50");
        const result = await response.json();
        if (result.success) {
          setNews(result.data?.data || result.data || []);
        } else {
          throw new Error(result.message);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load news");
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
  }, []);

  React.useEffect(() => {
    document.body.style.overflow = selectedArticle ? "hidden" : "unset";
  }, [selectedArticle]);

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  const totalPages = Math.ceil(news.length / ITEMS_PER_PAGE);

  const paginatedNews = React.useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return news.slice(start, start + ITEMS_PER_PAGE);
  }, [news, currentPage]);

  return (
    <>
      <section className="bg-white border border-[#d0e8d0] rounded-xl p-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[#d0e8d0]">
          <div className="p-2 bg-[#e8f5e8] rounded-lg">
            <Newspaper className="w-5 h-5 text-[#1a4d1a]" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#1a2e1a]">
              Latest News & Updates
            </h2>
            <p className="text-xs text-[#6b8f6b]">
              Stories and community highlights
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto">
          {/* Loading */}
          {loading && (
            <div className="flex justify-center py-16">
              <div className="w-10 h-10 border-4 border-[#1a4d1a] border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {/* Error */}
          {error && !loading && (
            <div className="text-center py-12 bg-[#f2faf2] rounded-xl">
              <Newspaper className="w-9 h-9 text-[#6b8f6b] mx-auto mb-3" />
              <p className="text-red-600 text-sm mb-4">
                Failed to load news: {error}
              </p>
            </div>
          )}

          {/* Empty */}
          {!loading && !error && paginatedNews.length === 0 && (
            <div className="text-center py-16 bg-[#f2faf2] rounded-xl">
              <Newspaper className="w-10 h-10 text-[#6b8f6b] mx-auto mb-3" />
              <p className="text-[#6b8f6b] text-sm">No news available</p>
            </div>
          )}

          {/* Grid */}
          {!loading && !error && paginatedNews.length > 0 && (
            <>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                {paginatedNews.map((article, index) => (
                  <motion.div
                    key={article.id}
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    viewport={{ once: true }}
                    whileHover={{ y: -4 }}
                    onClick={() => setSelectedArticle(article)}
                    className="group bg-[#f2faf2] border border-[#d0e8d0] rounded-xl overflow-hidden cursor-pointer hover:border-[#1a4d1a] hover:bg-[#e8f5e8] transition-all duration-200"
                  >
                    {/* Image */}
                    <div className="h-44 overflow-hidden bg-[#e8f5e8]">
                      <img
                        src={getImageUrl(article.image)}
                        alt={article.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      />
                    </div>

                    {/* Body */}
                    <div className="p-4">
                      <div className="flex items-center gap-1.5 text-xs text-[#6b8f6b] mb-2">
                        <Clock className="w-3.5 h-3.5" />
                        {formatDate(article.published_at || article.created_at)}
                      </div>
                      <h3 className="font-semibold text-[#1a2e1a] text-sm mb-1.5 line-clamp-2">
                        {article.title}
                      </h3>
                      <p className="text-xs text-[#6b8f6b] line-clamp-3">
                        {article.content.slice(0, 150)}...
                      </p>
                      <div className="mt-3 text-xs font-semibold text-[#1a4d1a] flex items-center gap-1">
                        Read More{" "}
                        <span className="text-base leading-none">›</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-4 mt-10">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    className="px-5 py-2 rounded-lg text-sm font-semibold border border-[#d0e8d0] text-[#3d5c3d] bg-white hover:bg-[#e8f5e8] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    Previous
                  </button>

                  <span className="text-sm font-medium text-[#3d5c3d]">
                    Page {currentPage} of {totalPages}
                  </span>

                  <button
                    disabled={currentPage === totalPages}
                    onClick={() =>
                      setCurrentPage((p) => Math.min(totalPages, p + 1))
                    }
                    className="px-5 py-2 rounded-lg text-sm font-semibold bg-[#1a4d1a] text-white hover:bg-[#1a2e1a] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Modal */}
      <AnimatePresence>
        {selectedArticle && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedArticle(null)}
            className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white border border-[#d0e8d0] rounded-xl max-w-2xl w-full overflow-hidden"
            >
              {/* Modal image */}
              {selectedArticle.image && (
                <div className="h-52 overflow-hidden">
                  <img
                    src={getImageUrl(selectedArticle.image)}
                    alt={selectedArticle.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="p-6">
                {/* Modal header */}
                <div className="flex items-start justify-between mb-4 pb-4 border-b border-[#d0e8d0]">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-[#e8f5e8] rounded-lg shrink-0">
                      <Newspaper className="w-4 h-4 text-[#1a4d1a]" />
                    </div>
                    <h2 className="text-lg font-bold text-[#1a2e1a]">
                      {selectedArticle.title}
                    </h2>
                  </div>
                  <button
                    onClick={() => setSelectedArticle(null)}
                    className="p-1.5 rounded-lg hover:bg-[#e8f5e8] transition-colors ml-3 shrink-0"
                  >
                    <X className="w-4 h-4 text-[#3d5c3d]" />
                  </button>
                </div>

                {/* Meta */}
                <div className="flex items-center gap-4 text-xs text-[#6b8f6b] mb-4">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {formatDate(
                      selectedArticle.published_at ||
                        selectedArticle.created_at,
                    )}
                  </span>
                  {selectedArticle.author && (
                    <span className="flex items-center gap-1">
                      <User className="w-3.5 h-3.5" />
                      {selectedArticle.author.name}
                    </span>
                  )}
                </div>

                {/* Content */}
                <p className="text-sm text-[#3d5c3d] whitespace-pre-line leading-relaxed max-h-72 overflow-y-auto">
                  {selectedArticle.content}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
