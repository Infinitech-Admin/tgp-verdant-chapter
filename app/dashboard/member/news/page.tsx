"use client";

import { useState, useEffect } from "react";
import { Calendar, Eye, Share2, Bookmark, Newspaper } from "lucide-react";
import MemberLayout from "@/components/memberLayout";
import { ArticleModal } from "@/components/member/article-modal";

interface NewsArticle {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  image?: string;
  publishedAt: string;
  views: number;
  author: string;
}

interface ApiNewsArticle {
  id: number;
  title: string;
  description?: string;
  content: string;
  image_url?: string | null;
  published_at?: string | null;
  created_at: string;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const normalizeApiList = (res: any): ApiNewsArticle[] =>
  res?.data?.data ?? res?.data ?? res ?? [];

const getImageUrl = (path?: string | null) => {
  if (!path) return undefined;
  if (path.startsWith("http")) return path;
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE}${cleanPath}`;
};

const transformArticle = (article: ApiNewsArticle): NewsArticle => ({
  id: `news-${article.id}`,
  title: article.title,
  excerpt: article.description || article.content.slice(0, 150) + "...",
  content: article.content,
  category: "news",
  image: getImageUrl(article.image_url),
  publishedAt: new Date(
    article.published_at || article.created_at,
  ).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }),
  views: Math.floor(Math.random() * 1000),
  author: "Admin",
});

export default function NewsPage() {
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(
    null,
  );
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/news/published?per_page=50");
        const json = await res.json();
        const articles = normalizeApiList(json).map(transformArticle);
        setNews(articles);
      } catch (err) {
        console.error("Error fetching news:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
  }, []);

  return (
    <MemberLayout>
      <div className="min-h-screen bg-[#f2faf2]">
        {/* Header */}
        <div className="bg-white border-b border-[#d0e8d0] sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#e8f5e8] rounded-lg">
                <Newspaper className="w-5 h-5 text-[#1a4d1a]" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-[#1a2e1a]">
                  Verdant News
                </h1>
                <p className="text-xs text-[#6b8f6b]">
                  Latest updates from Verdant
                </p>
              </div>
            </div>

            {!loading && news.length > 0 && (
              <span className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-[#1a4d1a] bg-[#e8f5e8] border border-[#d0e8d0] px-3 py-1.5 rounded-full">
                <Newspaper className="w-3.5 h-3.5" />
                {news.length} Articles
              </span>
            )}
          </div>
        </div>

        {/* Content */}
        <main className="px-4 sm:px-6 py-6 max-w-7xl mx-auto">
          {/* Loading */}
          {loading && (
            <div className="text-center py-16">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#1a4d1a] mx-auto mb-4" />
              <p className="text-[#6b8f6b] text-sm">Loading news…</p>
            </div>
          )}

          {/* Empty */}
          {!loading && news.length === 0 && (
            <div className="text-center py-16 bg-white border border-[#d0e8d0] rounded-xl">
              <Newspaper className="w-12 h-12 mx-auto mb-3 text-[#6b8f6b]" />
              <p className="text-[#6b8f6b] text-sm">
                No news articles available
              </p>
            </div>
          )}

          {/* Grid */}
          {!loading && news.length > 0 && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {news.map((article) => (
                <div
                  key={article.id}
                  onClick={() => {
                    setSelectedArticle(article);
                    setModalOpen(true);
                  }}
                  className="group bg-white border border-[#d0e8d0] rounded-xl overflow-hidden cursor-pointer hover:border-[#1a4d1a] hover:shadow-md transition-all duration-200"
                >
                  {/* Image */}
                  {article.image ? (
                    <div className="relative aspect-video bg-[#e8f5e8]">
                      <img
                        src={article.image}
                        alt={article.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    </div>
                  ) : (
                    <div className="relative aspect-video bg-[#e8f5e8] flex items-center justify-center">
                      <Newspaper className="w-12 h-12 text-[#6b8f6b] opacity-50" />
                    </div>
                  )}

                  {/* Body */}
                  <div className="p-4">
                    <div className="flex items-center gap-1.5 mb-2 text-xs text-[#6b8f6b]">
                      <Calendar className="w-3.5 h-3.5" />
                      {article.publishedAt}
                    </div>

                    <h3 className="font-semibold text-sm text-[#1a2e1a] mb-1.5 line-clamp-2 group-hover:text-[#1a4d1a] transition-colors">
                      {article.title}
                    </h3>

                    <p className="text-xs text-[#6b8f6b] line-clamp-2">
                      {article.excerpt}
                    </p>

                    <div className="flex justify-between items-center text-xs text-[#6b8f6b] mt-4 pt-3 border-t border-[#d0e8d0]">
                      <span>By {article.author}</span>
                      <div className="flex gap-3">
                        <Eye className="w-3.5 h-3.5 hover:text-[#1a4d1a] transition-colors cursor-pointer" />
                        <Share2 className="w-3.5 h-3.5 hover:text-[#1a4d1a] transition-colors cursor-pointer" />
                        <Bookmark className="w-3.5 h-3.5 hover:text-[#1a4d1a] transition-colors cursor-pointer" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <ArticleModal
            article={selectedArticle}
            isOpen={modalOpen}
            onClose={() => setModalOpen(false)}
          />
        </main>
      </div>
    </MemberLayout>
  );
}
