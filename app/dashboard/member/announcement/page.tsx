"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Calendar,
  Eye,
  Share2,
  Bookmark,
  Newspaper,
  Megaphone,
} from "lucide-react";
import Image from "next/image";
import MemberLayout from "@/components/memberLayout";
import { ArticleModal } from "@/components/member/article-modal";

interface AnnouncementArticle {
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

interface ApiAnnouncementArticle {
  id: number;
  title: string;
  description: string;
  category: string;
  content: string;
  image_url: string | null;
  status: string;
  priority: string;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  author: { name: string } | null;
}

export default function AnnouncementPage() {
  const [announcements, setAnnouncements] = useState<AnnouncementArticle[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [loading, setLoading] = useState(true);
  const [selectedArticle, setSelectedArticle] =
    useState<AnnouncementArticle | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const transformArticle = (
    article: ApiAnnouncementArticle,
    category: string,
  ): AnnouncementArticle => {
    return {
      id: `${category}-${article.id}`,
      title: article.title,
      excerpt:
        article.description || article.content?.substring(0, 150) + "...",
      content: article.content,
      category: article.category,
      image: article.image_url ?? undefined,
      publishedAt: article.published_at
        ? new Date(article.published_at).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })
        : article.created_at
          ? new Date(article.created_at).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })
          : "Date not available",
      views: Math.floor(Math.random() * 1000),
      author: article.author?.name || "Admin",
    };
  };

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/announcements");
        if (!res.ok) {
          const err = await res.json().catch(() => null);
          throw new Error(err?.message || "Failed to fetch announcements");
        }
        const data = await res.json();
        if (!data?.success || !data?.data)
          throw new Error(data?.message || "Invalid API response");
        const raw = data.data.data ?? data.data ?? [];
        setAnnouncements(
          raw.map((a: ApiAnnouncementArticle) =>
            transformArticle(a, "announcements"),
          ),
        );
      } catch (error) {
        console.error("Announcements fetch error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAnnouncements();
  }, []);

  const allArticles = [...announcements];

  const categories = useMemo(() => {
    const catSet = new Set<string>();
    allArticles.forEach((a) => catSet.add(a.category));
    const dynamic = Array.from(catSet).map((cat) => ({
      value: cat,
      label: `${cat.charAt(0).toUpperCase() + cat.slice(1)} (${allArticles.filter((a) => a.category === cat).length})`,
    }));
    return [{ value: "all", label: `All (${allArticles.length})` }, ...dynamic];
  }, [allArticles]);

  const filteredNews =
    selectedCategory === "all"
      ? allArticles
      : allArticles.filter((a) => a.category === selectedCategory);

  return (
    <MemberLayout>
      <div className="min-h-screen bg-[#f2faf2] overflow-x-hidden">
        {/* Header */}
        <div className="bg-white border-b border-[#d0e8d0] sticky top-0 z-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <div className="p-2 bg-[#e8f5e8] rounded-lg shrink-0">
                <Megaphone className="w-5 h-5 text-[#1a4d1a]" />
              </div>
              <div className="min-w-0">
                <h1 className="text-base sm:text-xl font-bold text-[#1a2e1a] truncate">
                  Verdant Announcements
                </h1>
                <p className="text-xs text-[#6b8f6b]">
                  Latest announcements from Verdant
                </p>
              </div>
            </div>

            {!loading && (
              <span className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-[#1a4d1a] bg-[#e8f5e8] border border-[#d0e8d0] px-3 py-1.5 rounded-full shrink-0">
                <Newspaper className="w-3.5 h-3.5" />
                {filteredNews.length} Articles
              </span>
            )}
          </div>
        </div>

        {/* Category Filter */}
        <div className="bg-white border-b border-[#d0e8d0] sticky top-[61px] sm:top-[69px] z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 overflow-x-auto">
            <div className="flex items-center gap-2 w-max">
              {categories.map((category) => (
                <button
                  key={category.value}
                  onClick={() => setSelectedCategory(category.value)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all
                    ${
                      selectedCategory === category.value
                        ? "bg-[#1a4d1a] text-white shadow-sm"
                        : "bg-[#e8f5e8] text-[#3d5c3d] hover:bg-[#d0e8d0]"
                    }`}
                >
                  {category.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <main className="px-4 sm:px-6 py-6 max-w-7xl mx-auto">
          {/* Loading */}
          {loading && (
            <div className="flex items-center justify-center py-20">
              <div className="w-10 h-10 border-4 border-[#1a4d1a] border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {/* Empty */}
          {!loading && filteredNews.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center bg-white border border-[#d0e8d0] rounded-xl">
              <div className="w-14 h-14 bg-[#e8f5e8] rounded-full flex items-center justify-center mb-4">
                <Megaphone className="w-7 h-7 text-[#6b8f6b]" />
              </div>
              <h3 className="text-sm font-semibold text-[#1a2e1a] mb-1">
                No announcements
              </h3>
              <p className="text-xs text-[#6b8f6b] max-w-xs">
                Check back later for updates from the college.
              </p>
            </div>
          )}

          {/* Grid */}
          {!loading && filteredNews.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {filteredNews.map((article) => (
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
                    <div className="relative aspect-video overflow-hidden bg-[#e8f5e8]">
                      <Image
                        src={article.image}
                        alt={article.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                    </div>
                  ) : (
                    <div className="relative aspect-video bg-[#e8f5e8] flex items-center justify-center">
                      <Megaphone className="w-10 h-10 text-[#6b8f6b] opacity-40" />
                    </div>
                  )}

                  {/* Body */}
                  <div className="p-4">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#e8f5e8] text-[#1a4d1a] border border-[#d0e8d0]">
                        {article.category}
                      </span>
                      <span className="text-xs text-[#6b8f6b] flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {article.publishedAt}
                      </span>
                    </div>

                    <h3 className="font-semibold text-sm text-[#1a2e1a] mb-1.5 leading-snug line-clamp-2 group-hover:text-[#1a4d1a] transition-colors">
                      {article.title}
                    </h3>

                    <p className="text-xs text-[#6b8f6b] line-clamp-2 mb-3">
                      {article.excerpt}
                    </p>

                    <div className="flex items-center justify-between text-xs text-[#6b8f6b] border-t border-[#d0e8d0] pt-3">
                      <span className="truncate max-w-[140px]">
                        By {article.author}
                      </span>
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <Eye className="w-3.5 h-3.5" />
                          {article.views}
                        </span>
                        <button
                          onClick={(e) => e.stopPropagation()}
                          className="hover:text-[#1a4d1a] transition-colors"
                        >
                          <Share2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => e.stopPropagation()}
                          className="hover:text-[#1a4d1a] transition-colors"
                        >
                          <Bookmark className="w-3.5 h-3.5" />
                        </button>
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
