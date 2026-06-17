"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Calendar,
  CheckCircle,
  XCircle,
  MapPin,
  Users,
  CalendarDays,
} from "lucide-react";
import Image from "next/image";
import MemberLayout from "@/components/memberLayout";

interface EventItem {
  id: string;
  title: string;
  description: string;
  category: string;
  image?: string;
  eventDate: string;
  location: string;
  status: "pending" | "accepted" | "declined";
  organizer: string;
}

interface ApiEvent {
  id: number;
  title: string;
  description: string;
  category: string;
  image_url: string | null;
  event_date: string;
  location: string;
  invite_status: "pending" | "accepted" | "declined";
  organizer: { name: string } | null;
}

export default function EventsPage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [loading, setLoading] = useState(true);

  const transformEvent = (event: ApiEvent): EventItem => ({
    id: String(event.id),
    title: event.title,
    description: event.description,
    category: event.category ?? "General",
    image: event.image_url ?? undefined,
    eventDate: new Date(event.event_date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }),
    location: event.location,
    status: event.invite_status,
    organizer: event.organizer?.name || "Admin",
  });

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/events/invites", {
          credentials: "include",
          headers: { Accept: "application/json" },
        });
        if (!res.ok) throw new Error("Failed to fetch events");
        const data = await res.json();
        const raw: ApiEvent[] = Array.isArray(data.data) ? data.data : [];
        setEvents(raw.map(transformEvent));
      } catch (err) {
        console.error("Event fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const categories = useMemo(() => {
    const set = new Set(events.map((e) => e.category));
    return [
      { value: "all", label: `All (${events.length})` },
      ...Array.from(set).map((cat) => ({
        value: cat,
        label: `${cat} (${events.filter((e) => e.category === cat).length})`,
      })),
    ];
  }, [events]);

  const filteredEvents =
    selectedCategory === "all"
      ? events
      : events.filter((e) => e.category === selectedCategory);

  const handleInviteAction = async (
    id: string,
    action: "accept" | "decline",
  ) => {
    try {
      const res = await fetch(`/api/events/${id}/action`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (!res.ok) throw new Error("Action failed");
      setEvents((prev) =>
        prev.map((e) =>
          e.id === id
            ? { ...e, status: action === "accept" ? "accepted" : "declined" }
            : e,
        ),
      );
    } catch (err) {
      console.error("Invite action error:", err);
    }
  };

  return (
    <MemberLayout>
      <div className="min-h-screen bg-[#f2faf2] overflow-x-hidden">
        {/* Header */}
        <div className="bg-white border-b border-[#d0e8d0] sticky top-0 z-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <div className="p-2 bg-[#e8f5e8] rounded-lg shrink-0">
                <CalendarDays className="w-5 h-5 text-[#1a4d1a]" />
              </div>
              <div className="min-w-0">
                <h1 className="text-base sm:text-xl font-bold text-[#1a2e1a] truncate">
                  Chapter Events
                </h1>
                <p className="text-xs text-[#6b8f6b]">
                  View and respond to your event invitations
                </p>
              </div>
            </div>

            {!loading && (
              <span className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-[#1a4d1a] bg-[#e8f5e8] border border-[#d0e8d0] px-3 py-1.5 rounded-full shrink-0">
                <CalendarDays className="w-3.5 h-3.5" />
                {filteredEvents.length} Events
              </span>
            )}
          </div>
        </div>

        {/* Category Filter */}
        <div className="bg-white border-b border-[#d0e8d0] sticky top-[61px] sm:top-[69px] z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 overflow-x-auto">
            <div className="flex items-center gap-2 w-max">
              {categories.map((cat) => (
                <button
                  key={cat.value}
                  aria-pressed={selectedCategory === cat.value}
                  onClick={() => setSelectedCategory(cat.value)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all
                    ${
                      selectedCategory === cat.value
                        ? "bg-[#1a4d1a] text-white shadow-sm"
                        : "bg-[#e8f5e8] text-[#3d5c3d] hover:bg-[#d0e8d0]"
                    }`}
                >
                  {cat.label}
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
          {!loading && filteredEvents.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center bg-white border border-[#d0e8d0] rounded-xl">
              <div className="w-14 h-14 bg-[#e8f5e8] rounded-full flex items-center justify-center mb-4">
                <CalendarDays className="w-7 h-7 text-[#6b8f6b]" />
              </div>
              <h3 className="text-sm font-semibold text-[#1a2e1a] mb-1">
                No events found
              </h3>
              <p className="text-xs text-[#6b8f6b] max-w-xs">
                You have no event invitations at the moment.
              </p>
            </div>
          )}

          {/* Grid */}
          {!loading && filteredEvents.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {filteredEvents.map((event) => (
                <div
                  key={event.id}
                  className="group bg-white border border-[#d0e8d0] rounded-xl overflow-hidden hover:border-[#1a4d1a] hover:shadow-md transition-all duration-200"
                >
                  {/* Image */}
                  {event.image ? (
                    <div className="relative aspect-video overflow-hidden bg-[#e8f5e8]">
                      <Image
                        src={event.image}
                        alt={event.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                    </div>
                  ) : (
                    <div className="relative aspect-video bg-[#e8f5e8] flex items-center justify-center">
                      <CalendarDays className="w-10 h-10 text-[#6b8f6b] opacity-40" />
                    </div>
                  )}

                  {/* Body */}
                  <div className="p-4">
                    {/* Category + Date */}
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#e8f5e8] text-[#1a4d1a] border border-[#d0e8d0]">
                        {event.category}
                      </span>
                      <span className="text-xs text-[#6b8f6b] flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {event.eventDate}
                      </span>
                    </div>

                    <h3 className="font-semibold text-sm text-[#1a2e1a] mb-1.5 leading-snug line-clamp-2 group-hover:text-[#1a4d1a] transition-colors">
                      {event.title}
                    </h3>

                    <p className="text-xs text-[#6b8f6b] line-clamp-2 mb-3">
                      {event.description}
                    </p>

                    {/* Meta */}
                    <div className="space-y-1 mb-3">
                      <div className="flex items-center gap-1.5 text-xs text-[#6b8f6b]">
                        <MapPin className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{event.location}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-[#6b8f6b]">
                        <Users className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{event.organizer}</span>
                      </div>
                    </div>

                    {/* Invite Actions */}
                    <div className="border-t border-[#d0e8d0] pt-3">
                      {event.status === "pending" ? (
                        <div className="flex gap-2">
                          <button
                            onClick={() =>
                              handleInviteAction(event.id, "accept")
                            }
                            className="flex-1 flex items-center justify-center gap-1.5 bg-[#1a4d1a] hover:bg-[#163f16] text-white py-2 rounded-lg text-xs font-semibold transition-colors"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                            Accept
                          </button>
                          <button
                            onClick={() =>
                              handleInviteAction(event.id, "decline")
                            }
                            className="flex-1 flex items-center justify-center gap-1.5 bg-[#e8f5e8] hover:bg-[#d0e8d0] text-[#3d5c3d] py-2 rounded-lg text-xs font-semibold transition-colors"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            Decline
                          </button>
                        </div>
                      ) : (
                        <div
                          className={`text-xs font-bold text-center py-1.5 rounded-lg ${
                            event.status === "accepted"
                              ? "bg-[#e8f5e8] text-[#1a4d1a]"
                              : "bg-red-50 text-red-600"
                          }`}
                        >
                          {event.status === "accepted"
                            ? "✓ Accepted"
                            : "✕ Declined"}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </MemberLayout>
  );
}
