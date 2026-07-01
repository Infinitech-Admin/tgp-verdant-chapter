"use client";

import { useEffect, useState } from "react";
import Header from "@/components/header";
import Footer from "@/components/footer";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Zap,
  Clock,
  X,
  Calendar,
  User,
  FileText,
  Image as ImageIcon,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

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
  poster?: string;
}

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

interface AnnouncementItem {
  id: number;
  title: string;
  content: string;
  category: string;
  created_at: string;
}

interface Testimonial {
  id: number;
  name: string;
  role: string;
  message: string;
}

interface BusinessPartner {
  id: number;
  business_name: string;
  category?: string;
  description?: string;
  website_link?: string;
  photo?: string;
  status: "pending" | "approved" | "rejected";
  admin_note?: string;
  created_at: string;
  updated_at: string;
}

interface Gallery {
  id: number;
  title: string;
  description?: string;
  image_url: string;
  type?: string;
  created_at: string;
  updated_at?: string;
}

export default function Home() {
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([]);
  const [announcementLoading, setAnnouncementLoading] = useState(true);
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [selectedAnnouncement, setSelectedAnnouncement] =
    useState<AnnouncementItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(
    null,
  );
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [businessPartners, setBusinessPartners] = useState<BusinessPartner[]>(
    [],
  );
  const [partnersLoading, setPartnersLoading] = useState(true);
  const [videos, setVideos] = useState<Vlog[]>([]);
  const [galleries, setGalleries] = useState<Gallery[]>([]);
  const [galleriesLoading, setGalleriesLoading] = useState(true);
  const [selectedGalleryImage, setSelectedGalleryImage] =
    useState<Gallery | null>(null);

  const staticTestimonials: Testimonial[] = [
    {
      id: 1,
      name: "Marco Santos",
      role: "Grand Master, Tau Gamma Philippines",
      message:
        "This platform has completely transformed how our organization connects and shares knowledge. The interactive features and community engagement have strengthened our brotherhood and mission.",
    },
    {
      id: 2,
      name: "Anton Reyes",
      role: "Vice Grand Master, Tau Gamma Philippines",
      message:
        "Exceptional tool for keeping our members informed and engaged. The communication capabilities have made coordination seamless across all chapters.",
    },
    {
      id: 3,
      name: "Carlos Villarreal",
      role: "Treasurer, Tau Gamma Philippines",
      message:
        "Outstanding platform for managing our organization's activities and events. The transparency and accessibility features are remarkable.",
    },
    {
      id: 4,
      name: "Rafael Gutierrez",
      role: "Secretary, Tau Gamma Philippines",
      message:
        "Perfect solution for documentation and record-keeping. Our organizational efficiency has improved significantly since using this platform.",
    },
    {
      id: 5,
      name: "Juan Mercado",
      role: "Member Relations Director, Tau Gamma Philippines",
      message:
        "Invaluable for fostering stronger connections among our members. The collaborative features enable better engagement and support within the fraternity.",
    },
    {
      id: 6,
      name: "Luis Fernandez",
      role: "Events Coordinator, Tau Gamma Philippines",
      message:
        "An excellent resource for organizing and promoting our events. The reach and engagement we've achieved have exceeded our expectations.",
    },
    {
      id: 7,
      name: "Diego Morales",
      role: "Scholarship Chair, Tau Gamma Philippines",
      message:
        "Great platform for disseminating scholarship opportunities and supporting member development. It's making a real impact on our members' futures.",
    },
    {
      id: 8,
      name: "Miguel Castillo",
      role: "Pledge Master, Tau Gamma Philippines",
      message:
        "Excellent tool for guiding and mentoring our new members. The resources available help new pledges understand our values and traditions.",
    },
    {
      id: 9,
      name: "Alfonso Ramos",
      role: "Alumni Relations Officer, Tau Gamma Philippines",
      message:
        "Perfect bridge between our active members and alumni community. Reconnecting with graduates has never been easier.",
    },
    {
      id: 10,
      name: "Roberto Villanueva",
      role: "Social Events Chair, Tau Gamma Philippines",
      message:
        "Outstanding platform for building camaraderie and fostering brotherhood. Our social activities have become more inclusive and engaging.",
    },
    {
      id: 11,
      name: "Enrique Domingo",
      role: "Community Service Director, Tau Gamma Philippines",
      message:
        "Powerful tool for organizing our community outreach programs. We can now coordinate with greater efficiency and track our impact better.",
    },
    {
      id: 12,
      name: "Vicente Torres",
      role: "Standards Chair, Tau Gamma Philippines",
      message:
        "Comprehensive platform for upholding our fraternity's standards and values. Communication with members regarding expectations is now seamless.",
    },
  ];

  useEffect(() => {
    const fetchVlogs = async () => {
      try {
        const res = await fetch("/api/vlogs");
        if (!res.ok) throw new Error("Failed to fetch vlogs");
        const data = await res.json();
        setVideos(Array.isArray(data.data) ? data.data : []);
      } catch (err) {
        console.error("Error fetching vlogs:", err);
      }
    };
    fetchVlogs();
  }, []);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        setAnnouncementLoading(true);
        const res = await fetch("/api/announcements/published?per_page=8");
        if (!res.ok) throw new Error(`HTTP error ${res.status}`);
        const result = await res.json();
        if (result?.success) {
          const data =
            result.data?.data && Array.isArray(result.data.data)
              ? result.data.data
              : Array.isArray(result.data)
                ? result.data
                : [];
          setAnnouncements(data);
        }
      } catch (err) {
        console.error("[Home] Failed to fetch announcements:", err);
      } finally {
        setAnnouncementLoading(false);
      }
    };
    fetchAnnouncements();
  }, []);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/news/published?per_page=3");
        if (!response.ok)
          throw new Error(`HTTP error! status: ${response.status}`);
        const result = await response.json();
        if (result.success) {
          let newsData: NewsArticle[] = [];
          if (result.data && typeof result.data === "object") {
            if (Array.isArray(result.data.data)) newsData = result.data.data;
            else if (Array.isArray(result.data)) newsData = result.data;
          }
          setNews(newsData);
        }
      } catch (error) {
        console.error("[Home] Failed to fetch news:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
  }, []);

  useEffect(() => {
    const fetchBusinessPartners = async () => {
      try {
        setPartnersLoading(true);
        const res = await fetch("/api/business-partners");
        const data = await res.json();
        if (data.success && data.data) {
          setBusinessPartners(data.data.data || data.data);
        }
      } catch (err) {
        console.error("[Home] Error fetching business partners:", err);
      } finally {
        setPartnersLoading(false);
      }
    };
    fetchBusinessPartners();
  }, []);

  useEffect(() => {
    const fetchGalleries = async () => {
      try {
        setGalleriesLoading(true);
        const res = await fetch("/api/galleries");
        const data = await res.json();
        if (data.success) {
          let galleriesData: Gallery[] = [];
          if (Array.isArray(data.data)) galleriesData = data.data;
          else if (data.data && Array.isArray(data.data.data))
            galleriesData = data.data.data;
          else if (data.data && typeof data.data === "object")
            galleriesData = [data.data];
          setGalleries(galleriesData);
        }
      } catch (err) {
        console.error("[Home] Error fetching galleries:", err);
      } finally {
        setGalleriesLoading(false);
      }
    };
    fetchGalleries();
  }, []);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSelectedArticle(null);
        setSelectedGalleryImage(null);
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, []);

  useEffect(() => {
    if (selectedArticle || selectedGalleryImage) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [selectedArticle, selectedGalleryImage]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getCategoryLabel = (category: string) => {
    const categoryMap: Record<string, string> = {
      announcement: "Announcement",
      event: "Event",
      alert: "Alert",
      update: "Update",
      news: "News",
    };
    return categoryMap[category?.toLowerCase()] || "Update";
  };

  const getVideoUrl = (videoUrl?: string) => {
    if (!videoUrl) return "";
    if (videoUrl.startsWith("http://") || videoUrl.startsWith("https://"))
      return videoUrl;
    if (videoUrl.startsWith("/"))
      return `${process.env.NEXT_PUBLIC_IMAGE_URL}${videoUrl}`;
    return `${process.env.NEXT_PUBLIC_IMAGE_URL}/${videoUrl}`;
  };

  const getImageUrl = (imageUrl?: string) => {
    if (!imageUrl) return "";
    if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://"))
      return imageUrl;
    const baseUrl =
      process.env.NEXT_PUBLIC_IMAGE_URL || "http://localhost:8000";
    return imageUrl.startsWith("/")
      ? `${baseUrl}${imageUrl}`
      : `${baseUrl}/${imageUrl}`;
  };

  return (
    <main className="min-h-screen w-full bg-white">
      <Header />

      {/* ── Hero Section ── */}
      <section className="relative w-full min-h-[70vh] lg:min-h-[75vh] flex items-center py-12 md:py-20 z-20 overflow-hidden bg-gradient-to-br from-[#f0f9f0] via-[#e8f5e8] to-[#fdf8ec]">
        {/* Decorative glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#2d7a2d]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#d4a017]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="w-full"
          >
            {/* Video Carousel */}
            <div className="w-full px-0">
              <Carousel
                opts={{ align: "start", loop: true }}
                className="w-full"
                setApi={(api) => {
                  api?.on("select", () =>
                    setCarouselIndex(api.selectedScrollSnap()),
                  );
                }}
              >
                <CarouselContent className="-ml-2 sm:-ml-3 md:-ml-4">
                  {videos.map((video) => (
                    <CarouselItem
                      key={`${video.id}-${carouselIndex}`}
                      className="basis-full sm:basis-full md:basis-1/2 lg:basis-1/2 pl-2 sm:pl-3 md:pl-4"
                    >
                      <Card className="border-0 py-0 gap-0 bg-transparent">
                        <CardContent className="relative overflow-hidden rounded-lg sm:rounded-xl border border-[#c8e6c8] p-0">
                          <video
                            key={`video-${video.id}-${carouselIndex}`}
                            className="w-full h-48 sm:h-56 md:h-64 lg:h-72 object-cover"
                            src={
                              video.video
                                ? getVideoUrl(video.video as string)
                                : ""
                            }
                            poster={
                              video.poster
                                ? getVideoUrl(video.poster as string)
                                : ""
                            }
                            controls
                            controlsList="nodownload"
                            playsInline
                            preload="metadata"
                          />
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3 sm:p-4">
                            <p className="text-white text-xs sm:text-sm font-medium truncate">
                              {video.title}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="hidden sm:flex border-[#c8e6c8] text-[#1a4d1a] hover:bg-[#e8f5e8]" />
                <CarouselNext className="hidden sm:flex border-[#c8e6c8] text-[#1a4d1a] hover:bg-[#e8f5e8]" />
              </Carousel>
            </div>

            {/* Hero Text */}
            <div className="flex flex-col justify-center items-center text-center py-10">
              <span className="inline-block mb-4 px-5 py-2 rounded-full text-xs font-bold tracking-widest uppercase bg-[#1a4d1a] text-white shadow-sm">
                Fortis Voluntas Fraternitas/Sororitas
              </span>

              <h1 className="text-4xl lg:text-6xl font-light mb-6 text-[#1a2e1a]">
                Welcome to{" "}
                <span className="font-bold text-[#1a4d1a]">Verdan Chapter</span>
              </h1>

              <p className="leading-relaxed text-center text-[#3d5c3d] mb-8 max-w-2xl text-lg">
                Triskelion (Tau Gamma Phi & Tau Gamma Sigma) codes of conduct
                and tenets are grounded in the principles of reason,
                self-preservation, and unyielding brotherhood/sisterhood. They
                define the Triskelion way of life and core values
              </p>

              <div className="flex gap-4 justify-center flex-wrap">
                <Button
                  asChild
                  size="lg"
                  className="bg-[#1a4d1a] hover:bg-[#2d7a2d] text-white font-semibold shadow-md"
                >
                  <Link href="/handbook">Learn More</Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="border-[#1a4d1a] text-[#1a4d1a] hover:bg-[#e8f5e8] font-semibold"
                >
                  <Link href="/gallery">View Gallery</Link>
                </Button>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Bottom wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg
            className="w-full h-16 md:h-24"
            viewBox="0 0 1440 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="none"
          >
            <path
              d="M0 0L60 8.33333C120 16.6667 240 33.3333 360 41.6667C480 50 600 50 720 41.6667C840 33.3333 960 16.6667 1080 16.6667C1200 16.6667 1320 33.3333 1380 41.6667L1440 50V100H1380C1320 100 1200 100 1080 100C960 100 840 100 720 100C600 100 480 100 360 100C240 100 120 100 60 100H0V0Z"
              fill="#f2faf2"
            />
          </svg>
        </div>
      </section>

      {/* ── Gallery Section ── */}
      <section className="w-full py-20 px-4 sm:px-6 lg:px-8 bg-[#f2faf2]">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16 text-center"
          >
            <p className="text-xs tracking-widest uppercase text-[#b8870c] mb-3 font-semibold">
              Memories
            </p>
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-[#1a2e1a]">
              <span className="uppercase">Photo Gallery</span>
            </h2>
            <div className="w-12 h-1 bg-[#1a4d1a] rounded-full mx-auto mb-4" />
            <p className="text-lg text-[#6b8f6b] max-w-2xl mx-auto">
              Capturing moments and memories of the Verdan Chapter
            </p>
          </motion.div>

          {galleriesLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-12">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="aspect-square rounded-2xl bg-[#d0e8d0] animate-pulse"
                />
              ))}
            </div>
          ) : galleries.length > 0 ? (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-12">
                {galleries.slice(0, 8).map((gallery, i) => (
                  <motion.div
                    key={gallery.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05, duration: 0.4 }}
                    viewport={{ once: true }}
                    whileHover={{ scale: 1.05, y: -6 }}
                    onClick={() => setSelectedGalleryImage(gallery)}
                    className="aspect-square rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all cursor-pointer border border-[#c8e6c8] hover:border-[#2d7a2d] group"
                  >
                    <div className="relative w-full h-full bg-[#e8f5e8]">
                      <img
                        src={getImageUrl(gallery.image_url)}
                        alt={gallery.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                          const parent = e.currentTarget.parentElement;
                          if (parent) {
                            parent.innerHTML = `<div class="w-full h-full bg-gradient-to-br from-[#c8e6c8] to-[#a8d4a8] flex items-center justify-center"><span class="text-4xl">🖼️</span></div>`;
                          }
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#1a4d1a]/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="absolute bottom-0 left-0 right-0 p-4">
                          <p className="text-white font-bold text-sm line-clamp-2">
                            {gallery.title}
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <Link href="/gallery">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-10 py-4 rounded-full bg-[#1a4d1a] hover:bg-[#2d7a2d] text-white font-bold inline-flex items-center gap-3 shadow-md transition-all text-lg"
                  >
                    View Full Gallery <ArrowRight className="w-5 h-5" />
                  </motion.button>
                </Link>
              </motion.div>
            </>
          ) : (
            <div className="text-center py-12">
              <div className="inline-flex flex-col items-center gap-4">
                <div className="w-20 h-20 bg-[#d0e8d0] rounded-full flex items-center justify-center">
                  <ImageIcon className="w-10 h-10 text-[#2d7a2d]" />
                </div>
                <p className="text-[#6b8f6b]">
                  No gallery images available at the moment.
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── Announcement Section ── */}
      <section className="w-full py-20 px-4 sm:px-6 lg:px-8 relative z-10 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16 text-center"
          >
            <p className="text-xs tracking-widest uppercase text-[#b8870c] mb-3 font-semibold">
              Updates
            </p>
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-[#1a2e1a]">
              <span className="uppercase">Announcements</span>
            </h2>
            <div className="w-12 h-1 bg-[#1a4d1a] rounded-full mx-auto mb-4" />
            <p className="text-lg text-[#6b8f6b] max-w-2xl mx-auto">
              Stay updated with the latest from Verdan Chapter
            </p>
          </motion.div>

          {announcementLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="p-8 rounded-3xl bg-[#e8f5e8] animate-pulse h-64"
                />
              ))}
            </div>
          ) : announcements.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              {announcements.map((item, i) => {
                const Icon =
                  item.category === "event"
                    ? Calendar
                    : item.category === "alert"
                      ? Zap
                      : FileText;
                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08, duration: 0.5 }}
                    viewport={{ once: true }}
                    whileHover={{ y: -8, scale: 1.02 }}
                    onClick={() => setSelectedAnnouncement(item)}
                    className="p-6 rounded-3xl bg-[#f2faf2] border border-[#d0e8d0] hover:border-[#2d7a2d] hover:shadow-lg hover:shadow-[#1a4d1a]/10 transition-all group cursor-pointer"
                  >
                    <div className="w-14 h-14 bg-[#1a4d1a] border-2 border-[#d4a017] rounded-full flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform">
                      <Icon className="w-7 h-7 text-[#d4a017]" />
                    </div>
                    <h3 className="text-base font-bold text-[#1a2e1a] mb-2 group-hover:text-[#1a4d1a] transition-colors line-clamp-2">
                      {item.title}
                    </h3>
                    <p className="text-[#6b8f6b] leading-relaxed line-clamp-2 text-sm">
                      {item.content}
                    </p>
                    <p className="text-xs text-[#b8870c] font-medium mt-3">
                      {new Date(item.created_at).toLocaleDateString()}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 text-[#6b8f6b]">
              No announcements available.
            </div>
          )}

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <Link href="/announcements">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-10 py-4 rounded-full bg-[#1a4d1a] hover:bg-[#2d7a2d] text-white font-bold inline-flex items-center gap-3 shadow-md transition-all text-lg"
              >
                View More Announcements <ArrowRight className="w-5 h-5" />
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── News Section ── */}
      <section className="w-full py-10 px-4 sm:px-6 lg:px-8 bg-[#f2faf2]">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16 text-center"
          >
            <p className="text-xs tracking-widest uppercase text-[#b8870c] mb-3 font-semibold">
              Latest
            </p>
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-[#1a2e1a]">
              <span className="uppercase">Latest Updates</span>
            </h2>
            <div className="w-12 h-1 bg-[#1a4d1a] rounded-full mx-auto mb-4" />
            <p className="text-lg text-[#6b8f6b] max-w-2xl mx-auto">
              Stay informed with recent chapter news
            </p>
          </motion.div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="p-6 rounded-3xl bg-[#d0e8d0] animate-pulse h-96"
                />
              ))}
            </div>
          ) : news.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              {news.slice(0, 3).map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -8, scale: 1.02 }}
                  onClick={() => setSelectedArticle(item)}
                  className="group rounded-3xl bg-white overflow-hidden shadow-sm hover:shadow-xl hover:shadow-[#1a4d1a]/10 transition-all cursor-pointer border border-[#d0e8d0] hover:border-[#2d7a2d]"
                >
                  <div className="relative h-56 overflow-hidden bg-gradient-to-br from-[#1a4d1a] to-[#2d7a2d]">
                    {item.image ? (
                      <img
                        src={getImageUrl(item.image)}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-6xl">
                        📰
                      </div>
                    )}
                    <div className="absolute top-4 right-4">
                      <span className="px-3 py-1.5 rounded-full text-xs font-bold uppercase bg-[#d4a017] text-white shadow-sm">
                        {getCategoryLabel(item.category)}
                      </span>
                    </div>
                  </div>
                  <div className="p-6">
                    <p className="text-sm text-[#b8870c] mb-3 flex items-center gap-2 font-medium">
                      <Clock className="w-4 h-4" />
                      {item.published_at
                        ? formatDate(item.published_at)
                        : formatDate(item.created_at)}
                    </p>
                    <h3 className="text-xl font-bold text-[#1a2e1a] mb-3 line-clamp-2 group-hover:text-[#1a4d1a] transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-[#6b8f6b] line-clamp-3 leading-relaxed mb-4">
                      {item.content.substring(0, 120)}...
                    </p>
                    <motion.div
                      whileHover={{ x: 5 }}
                      className="inline-flex items-center gap-2 text-sm font-bold text-[#2d7a2d]"
                    >
                      Read More <ArrowRight className="w-4 h-4" />
                    </motion.div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-[#6b8f6b]">No news available at the moment.</p>
            </div>
          )}

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <Link href="/news">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-10 py-4 rounded-full bg-[#1a4d1a] hover:bg-[#2d7a2d] text-white font-bold inline-flex items-center gap-3 shadow-md transition-all text-lg"
              >
                View All News <ArrowRight className="w-5 h-5" />
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── News Modal ── */}
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
                    src={getImageUrl(selectedArticle.image)}
                    alt={selectedArticle.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-[#1a4d1a] to-[#2d7a2d] flex items-center justify-center text-8xl">
                    📰
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setSelectedArticle(null)}
                  className="absolute top-6 right-6 bg-white/90 backdrop-blur-sm rounded-full p-3 shadow-lg hover:bg-white transition-colors z-10"
                  aria-label="Close modal"
                >
                  <X className="w-6 h-6 text-[#1a4d1a]" />
                </motion.button>
                <div className="absolute bottom-6 left-6">
                  <span className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-sm font-bold uppercase bg-[#d4a017] text-white shadow-lg">
                    {getCategoryLabel(selectedArticle.category)}
                  </span>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-8 md:p-10">
                <h2 className="text-3xl md:text-4xl font-bold text-[#1a2e1a] leading-tight mb-6">
                  {selectedArticle.title}
                </h2>
                <div className="flex flex-wrap items-center gap-6 pb-6 border-b border-[#d0e8d0]">
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
                <div className="prose prose-lg max-w-none mt-6">
                  <p className="text-[#3d5c3d] text-lg leading-relaxed whitespace-pre-line">
                    {selectedArticle.content}
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Gallery Image Modal ── */}
      <AnimatePresence>
        {selectedGalleryImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedGalleryImage(null)}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.button
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setSelectedGalleryImage(null)}
              className="absolute top-6 right-6 bg-white/90 rounded-full p-3 shadow-xl hover:bg-white transition-colors z-10"
              aria-label="Close modal"
            >
              <X className="w-6 h-6 text-[#1a4d1a]" />
            </motion.button>
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", damping: 25 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-5xl w-full"
            >
              <img
                src={getImageUrl(selectedGalleryImage.image_url)}
                alt={selectedGalleryImage.title}
                className="w-full h-auto max-h-[85vh] object-contain rounded-2xl shadow-2xl"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 rounded-b-2xl">
                <h3 className="text-white text-2xl font-bold mb-2">
                  {selectedGalleryImage.title}
                </h3>
                {selectedGalleryImage.description && (
                  <p className="text-white/80 text-sm">
                    {selectedGalleryImage.description}
                  </p>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Testimonials Section ── */}
      <section className="w-full pt-10 px-4 sm:px-6 lg:px-8 bg-white border-t border-[#e0ede0] relative z-10">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16 text-center"
          >
            <p className="text-xs tracking-widest uppercase text-[#b8870c] mb-3 font-semibold">
              Voices
            </p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 text-[#1a2e1a]">
              <span className="uppercase">What Our Members Say</span>
            </h2>
            <div className="w-12 h-1 bg-[#1a4d1a] rounded-full mx-auto mb-4" />
            <p className="text-base sm:text-lg text-[#6b8f6b] max-w-2xl mx-auto">
              Stories from within the brotherhood
            </p>

            <div className="relative w-full mt-12 overflow-hidden cursor-grab active:cursor-grabbing">
              <motion.div
                className="flex gap-4 sm:gap-6 md:gap-8"
                animate={{ x: ["0%", "-50%"] }}
                transition={{
                  repeat: Infinity,
                  repeatType: "loop",
                  duration: 50,
                  ease: "linear",
                }}
                drag="x"
                dragElastic={0.2}
                dragMomentum={true}
              >
                {[...staticTestimonials, ...staticTestimonials].map((t, i) => (
                  <motion.div
                    key={`${t.id}-${i}`}
                    whileHover={{ y: -6 }}
                    className="flex-shrink-0 w-72 sm:w-80 md:w-96 bg-[#f2faf2] p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-[#d0e8d0] hover:border-[#2d7a2d] hover:shadow-lg hover:shadow-[#1a4d1a]/10 transition-all flex flex-col"
                  >
                    <div className="flex gap-1 mb-4">
                      {[...Array(5)].map((_, j) => (
                        <span
                          key={j}
                          className="text-[#d4a017] text-sm sm:text-base"
                        >
                          ★
                        </span>
                      ))}
                    </div>
                    <p className="italic text-[#3d5c3d] mb-6 text-xs sm:text-sm leading-relaxed flex-1">
                      &apos;{t.message}&apos;
                    </p>
                    <div className="flex items-center gap-3 mt-4">
                      <div className="w-12 sm:w-14 h-12 sm:h-14 rounded-full bg-[#1a4d1a] border-2 border-[#d4a017] flex-shrink-0 flex items-center justify-center text-[#d4a017] font-bold text-base sm:text-lg">
                        {t.name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-[#1a2e1a] text-xs sm:text-sm leading-tight truncate">
                          {t.name}
                        </h4>
                        <p className="text-xs text-[#6b8f6b] mt-1 line-clamp-2">
                          {t.role}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
              <div className="absolute left-0 top-0 bottom-0 w-8 sm:w-12 md:w-16 bg-gradient-to-r from-white to-transparent pointer-events-none" />
              <div className="absolute right-0 top-0 bottom-0 w-8 sm:w-12 md:w-16 bg-gradient-to-l from-white to-transparent pointer-events-none" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Business Partners Section ── */}
      <section className="w-full pb-24 px-4 sm:px-6 lg:px-8 bg-[#f2faf2]">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12 text-center"
          >
            <p className="text-xs tracking-widest uppercase text-[#b8870c] mb-3 font-semibold">
              Partners
            </p>
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-[#1a2e1a]">
              <span className="uppercase">Our Business Partners</span>
            </h2>
            <div className="w-12 h-1 bg-[#1a4d1a] rounded-full mx-auto mb-4" />
            <p className="text-lg text-[#6b8f6b] max-w-2xl mx-auto">
              Trusted organizations working with us to serve the community
              better
            </p>
          </motion.div>

          {partnersLoading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1a4d1a]"></div>
            </div>
          ) : businessPartners.length > 0 ? (
            <div className="relative w-full overflow-hidden">
              <motion.div
                className="flex gap-4 sm:gap-6 md:gap-8"
                animate={{ x: ["0%", "-50%"] }}
                transition={{
                  repeat: Infinity,
                  repeatType: "loop",
                  duration: 45,
                  ease: "linear",
                }}
              >
                {[...businessPartners, ...businessPartners].map(
                  (partner, i) => (
                    <PartnerCard key={`partner-${i}`} partner={partner} />
                  ),
                )}
              </motion.div>
              <div className="absolute left-0 top-0 bottom-0 w-12 sm:w-16 md:w-24 bg-gradient-to-r from-[#f2faf2] to-transparent pointer-events-none" />
              <div className="absolute right-0 top-0 bottom-0 w-12 sm:w-16 md:w-24 bg-gradient-to-l from-[#f2faf2] to-transparent pointer-events-none" />
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-[#6b8f6b]">
                No business partners to display at this time.
              </p>
            </div>
          )}
        </div>
      </section>

      <Footer />

      {/* ── Announcement Detail Modal ── */}
      <AnimatePresence>
        {selectedAnnouncement && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedAnnouncement(null)}
            className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative border border-[#d0e8d0]"
            >
              <button
                onClick={() => setSelectedAnnouncement(null)}
                className="absolute top-6 right-6 p-2 hover:bg-[#e8f5e8] rounded-full transition-all z-10"
              >
                <X className="w-6 h-6 text-[#1a4d1a]" />
              </button>

              <div className="p-8 md:p-12">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-[#1a4d1a] border-2 border-[#d4a017] rounded-full flex items-center justify-center shadow-md">
                    {selectedAnnouncement.category === "event" ? (
                      <Calendar className="w-8 h-8 text-[#d4a017]" />
                    ) : selectedAnnouncement.category === "alert" ? (
                      <Zap className="w-8 h-8 text-[#d4a017]" />
                    ) : (
                      <FileText className="w-8 h-8 text-[#d4a017]" />
                    )}
                  </div>
                  <div>
                    <span className="inline-block px-3 py-1 bg-[#e8f5e8] text-[#1a4d1a] border border-[#c8e6c8] rounded-full text-sm font-semibold capitalize">
                      {selectedAnnouncement.category}
                    </span>
                  </div>
                </div>

                <h2 className="text-3xl md:text-4xl font-bold text-[#1a2e1a] mb-4">
                  {selectedAnnouncement.title}
                </h2>

                <p className="text-[#b8870c] text-sm font-medium mb-6">
                  {new Date(selectedAnnouncement.created_at).toLocaleDateString(
                    "en-US",
                    {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    },
                  )}
                </p>

                <div className="prose prose-lg max-w-none">
                  <p className="text-[#3d5c3d] leading-relaxed whitespace-pre-wrap">
                    {selectedAnnouncement.content}
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

function PartnerCard({ partner }: { partner: BusinessPartner }) {
  const [imageError, setImageError] = useState(false);
  const hasValidImage = !!partner.photo;

  const CardContent = (
    <div className="flex-shrink-0 w-72 sm:w-80 md:w-88 bg-white border border-[#d0e8d0] hover:border-[#2d7a2d] rounded-lg sm:rounded-xl md:rounded-2xl shadow-sm overflow-hidden hover:shadow-lg hover:shadow-[#1a4d1a]/10 transition-all flex flex-col">
      <div className="relative w-full h-44 sm:h-54 md:h-64 flex items-center justify-center flex-shrink-0 bg-[#f2faf2]">
        {hasValidImage && !imageError ? (
          <img
            src={partner.photo!}
            alt={partner.business_name}
            className="object-cover w-full h-full"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-20 h-20 bg-[#1a4d1a] border-2 border-[#d4a017] rounded-full flex items-center justify-center">
            <span className="text-2xl font-bold text-[#d4a017]">
              {partner.business_name.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
      </div>
      <div className="p-4 sm:p-5">
        <p className="font-bold text-[#1a2e1a] text-sm sm:text-base text-center line-clamp-2">
          {partner.business_name}
        </p>
      </div>
    </div>
  );

  if (partner.website_link) {
    return (
      <a
        href={partner.website_link}
        target="_blank"
        rel="noopener noreferrer"
        className="block"
      >
        {CardContent}
      </a>
    );
  }

  return CardContent;
}
