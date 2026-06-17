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

export default function NewsSection() {
  const [news, setNews] = React.useState<NewsArticle[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [selectedArticle, setSelectedArticle] =
    React.useState<NewsArticle | null>(null);

  const getImageUrl = (imagePath?: string) => {
    if (!imagePath) return "/placeholder.svg";
    if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
      return imagePath;
    }
    const baseUrl =
      process.env.NEXT_PUBLIC_IMAGE_URL || "http://localhost:8000";
    const cleanPath = imagePath.startsWith("/")
      ? imagePath.slice(1)
      : imagePath;
    return `${baseUrl}/${cleanPath}`;
  };

  React.useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        setError(null);

        const apiUrl = "/api/news/published?per_page=12";
        const response = await fetch(apiUrl);

        if (!response.ok) {
          const errorText = await response.text();
          console.error("Response error:", errorText);
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        if (result.success) {
          let newsData: NewsArticle[] = [];

          if (result.data && typeof result.data === "object") {
            if (Array.isArray(result.data.data)) {
              newsData = result.data.data;
            } else if (Array.isArray(result.data)) {
              newsData = result.data;
            }
          }

          setNews(newsData);
        } else {
          throw new Error(result.message || "Failed to fetch news");
        }
      } catch (err) {
        console.error("Error fetching news:", err);
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedArticle(null);
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, []);

  React.useEffect(() => {
    if (selectedArticle) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [selectedArticle]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <>
      <div className="py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-[#f2faf2]">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#2d7a2d]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#d4a017]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="relative w-16 h-16 mx-auto mb-4">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="absolute inset-0 border-4 border-transparent border-t-[#1a4d1a] border-r-[#2d7a2d] border-b-[#d4a017] rounded-full"
                  />
                </div>
                <p className="text-[#3d5c3d] font-medium">Loading news...</p>
              </div>
            </div>
          ) : error ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-16"
            >
              <div className="w-16 h-16 bg-[#1a4d1a] border-2 border-[#d4a017] rounded-full flex items-center justify-center mx-auto mb-4">
                <X className="w-8 h-8 text-[#d4a017]" />
              </div>
              <p className="text-[#6b8f6b] mb-6 font-semibold text-lg">
                Failed to load news: {error}
              </p>
              <button
                onClick={() => window.location.reload()}
                className="px-8 py-4 bg-[#1a4d1a] hover:bg-[#2d7a2d] text-white rounded-full transition-all font-semibold text-lg hover:scale-105"
              >
                Try Again
              </button>
            </motion.div>
          ) : news.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-20"
            >
              <div className="w-24 h-24 bg-[#1a4d1a] border-2 border-[#d4a017] rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
                <Newspaper className="w-12 h-12 text-[#d4a017]" />
              </div>
              <h3 className="text-2xl font-bold text-[#1a2e1a] mb-3">
                No News Available
              </h3>
              <p className="text-[#6b8f6b] text-lg">
                Check back later for community updates and stories.
              </p>
            </motion.div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {news.map((article, index) => (
                <motion.div
                  key={article.id}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.2, duration: 0.4 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -12, scale: 1.02 }}
                  onClick={() => setSelectedArticle(article)}
                  className="group relative bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all cursor-pointer border-2 border-[#d0e8d0] hover:border-[#2d7a2d]"
                >
                  <div className="absolute inset-0 bg-[#1a4d1a]/5 opacity-0 group-hover:opacity-100 transition-opacity" />

                  <div className="relative h-56 overflow-hidden bg-[#e8f5e8] flex items-center justify-center">
                    <img
                      src={getImageUrl(article.image)}
                      alt={article.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      onError={(e) => {
                        e.currentTarget.src = "/placeholder.svg";
                      }}
                    />
                  </div>

                  <div className="p-6 relative z-10">
                    <div className="flex items-center gap-2 text-sm text-[#b8870c] mb-3">
                      <Clock className="w-4 h-4" />
                      <span className="font-medium">
                        {formatDate(article.published_at || article.created_at)}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-[#1a2e1a] mb-3 group-hover:text-[#1a4d1a] transition-all line-clamp-2">
                      {article.title}
                    </h3>

                    <p className="text-[#6b8f6b] line-clamp-3 leading-relaxed mb-4">
                      {article.content.substring(0, 150)}...
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {selectedArticle && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedArticle(null)}
            className="fixed inset-0 bg-black/50 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 50 }}
              transition={{ type: "spring", damping: 25 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col border border-[#d0e8d0]"
            >
              <div className="relative h-72 md:h-96 overflow-hidden">
                {selectedArticle.image ? (
                  <img
                    src={`${process.env.NEXT_PUBLIC_IMAGE_URL || "http://localhost:8000"}/${selectedArticle.image}`}
                    alt={selectedArticle.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-[#1a4d1a] flex items-center justify-center text-white text-8xl">
                    📰
                  </div>
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setSelectedArticle(null)}
                  className="absolute top-6 right-6 bg-white/90 backdrop-blur-sm rounded-full p-3 shadow-xl hover:bg-white transition-colors z-10"
                  aria-label="Close modal"
                >
                  <X className="w-6 h-6 text-[#1a4d1a]" />
                </motion.button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 md:p-10">
                <div className="space-y-6">
                  <h2 className="text-3xl md:text-4xl font-bold text-[#1a2e1a] leading-tight">
                    {selectedArticle.title}
                  </h2>

                  <div className="flex flex-wrap items-center gap-6 pb-6 border-b-2 border-[#d0e8d0]">
                    <div className="flex items-center gap-2 text-[#6b8f6b]">
                      <div className="w-10 h-10 bg-[#e8f5e8] rounded-full flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-[#1a4d1a]" />
                      </div>
                      <span className="font-medium">
                        {selectedArticle.published_at
                          ? formatDate(selectedArticle.published_at)
                          : formatDate(selectedArticle.created_at)}
                      </span>
                    </div>

                    {selectedArticle.author && (
                      <div className="flex items-center gap-2 text-[#6b8f6b]">
                        <div className="w-10 h-10 bg-[#e8f5e8] rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-[#1a4d1a]" />
                        </div>
                        <span className="font-medium">
                          By {selectedArticle.author.name}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="prose prose-lg max-w-none">
                    <p className="text-[#3d5c3d] text-lg leading-relaxed whitespace-pre-line">
                      {selectedArticle.content}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
