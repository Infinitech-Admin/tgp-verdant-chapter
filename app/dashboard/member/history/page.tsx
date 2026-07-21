"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { BookOpen, AlertCircle } from "lucide-react";
import MemberLayout from "@/components/memberLayout";

interface HistoryItem {
  id: string;
  title: string;
  content: string;
  year: string;
  image?: string;
}

interface ApiHistory {
  id: number;
  title: string;
  content: string;
  year: string;
  image_url?: string | null;
}

export default function ChapterHistoryPage() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const transformHistory = (item: ApiHistory): HistoryItem => ({
    id: String(item.id),
    title: item.title,
    content: item.content,
    year: item.year,
    image: item.image_url ?? undefined,
  });

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch("/api/chapter-history", {
          credentials: "include",
          headers: { Accept: "application/json" },
        });
        if (!res.ok) throw new Error(`Failed to fetch history: ${res.status}`);
        const data = await res.json();
        if (!data.success)
          throw new Error(data.message || "Failed to load history");
        setHistory((data.data ?? []).map(transformHistory));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to load history");
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  return (
    <MemberLayout>
      <div className="min-h-screen bg-[#f2faf2] overflow-x-hidden">
        {/* Header */}
        <div className="bg-white border-b border-[#d0e8d0] sticky top-0 z-20">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-3">
            <div className="p-2 bg-[#e8f5e8] rounded-lg shrink-0">
              <BookOpen className="w-5 h-5 text-[#1a4d1a]" />
            </div>
            <div className="min-w-0">
              <h1 className="text-base sm:text-xl font-bold text-[#1a2e1a] truncate">
                Chapter History
              </h1>
              <p className="text-xs text-[#6b8f6b]">
                A chronicle of our chapter's milestones and legacy
              </p>
            </div>
          </div>
        </div>

        {/* Intro Banner */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
          <div className="bg-white border border-[#d0e8d0] border-l-4 border-l-[#1a4d1a] rounded-xl p-5">
            <h2 className="text-sm font-bold text-[#1a2e1a] mb-2">
              Our Legacy
            </h2>
            <p className="text-xs text-[#3d5c3d] leading-relaxed">
              The Tau Gamma Phi TRISKELION'S Grand Fraternity chapter at the
              University of Verdant - Las Piñas has a rich history rooted
              in the principles of honor, loyalty, brotherhood, integrity, and
              service. From its humble beginnings to its current stature, the
              chapter has fostered generations of leaders who contribute
              positively to society. Below, explore key milestones and events
              that have shaped our journey.
            </p>
          </div>
        </section>

        {/* Main Content */}
        <main className="max-w-6xl mx-auto px-4 sm:px-6 pb-12">
          {/* Loading */}
          {loading && (
            <div className="flex items-center justify-center py-20">
              <div className="w-10 h-10 border-4 border-[#1a4d1a] border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <div className="flex flex-col items-center justify-center py-16 text-center bg-white border border-[#d0e8d0] rounded-xl max-w-md mx-auto p-8">
              <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mb-4">
                <AlertCircle className="w-7 h-7 text-red-500" />
              </div>
              <h3 className="text-sm font-semibold text-[#1a2e1a] mb-1">
                Unable to Load History
              </h3>
              <p className="text-xs text-red-500 mb-4">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="bg-[#1a4d1a] hover:bg-[#163f16] text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Empty */}
          {!loading && !error && history.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center bg-white border border-[#d0e8d0] rounded-xl">
              <div className="w-14 h-14 bg-[#e8f5e8] rounded-full flex items-center justify-center mb-4">
                <BookOpen className="w-7 h-7 text-[#6b8f6b]" />
              </div>
              <h3 className="text-sm font-semibold text-[#1a2e1a] mb-1">
                No History Records Yet
              </h3>
              <p className="text-xs text-[#6b8f6b] max-w-xs">
                Chapter history records will appear here once they are added by
                administrators.
              </p>
            </div>
          )}

          {/* Timeline */}
          {!loading && !error && history.length > 0 && (
            <div className="space-y-4">
              {history.map((item) => (
                <div
                  key={item.id}
                  className="group bg-white border border-[#d0e8d0] rounded-xl overflow-hidden hover:border-[#1a4d1a] hover:shadow-md transition-all duration-200"
                >
                  {item.image && (
                    <div className="relative aspect-video overflow-hidden bg-[#e8f5e8]">
                      <Image
                        src={item.image}
                        alt={item.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 640px) 100vw, 896px"
                      />
                    </div>
                  )}

                  <div className="p-5">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <h3 className="font-bold text-sm text-[#1a2e1a] leading-snug group-hover:text-[#1a4d1a] transition-colors flex-1">
                        {item.title}
                      </h3>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#e8f5e8] text-[#1a4d1a] border border-[#d0e8d0] shrink-0">
                        {item.year}
                      </span>
                    </div>

                    <div
                      className="text-xs text-[#3d5c3d] leading-relaxed prose prose-sm max-w-none
                        prose-p:text-[#3d5c3d] prose-headings:text-[#1a2e1a] prose-strong:text-[#1a2e1a]"
                      dangerouslySetInnerHTML={{ __html: item.content }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>

        {/* Footer Banner */}
        <footer className="max-w-6xl mx-auto px-4 sm:px-6 pb-10">
          <div className="bg-white border border-[#d0e8d0] border-l-4 border-l-[#1a4d1a] rounded-xl p-5">
            <h3 className="text-sm font-bold text-[#1a2e1a] mb-2">
              Contribute to Our History
            </h3>
            <p className="text-xs text-[#3d5c3d] leading-relaxed">
              If you have photos, stories, or records from past events, please
              contact the chapter officers to add them to our digital archive.
              Together, we preserve and build upon our legacy.
            </p>
          </div>
        </footer>
      </div>
    </MemberLayout>
  );
}
