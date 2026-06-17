"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Calendar, AlertTriangle, CalendarDays } from "lucide-react";
import { toast } from "sonner";

interface Invitation {
  id: number;
  title: string;
  category: string;
  event_date: string;
  status: "pending" | "accepted" | "declined";
}

export default function EventsPreview() {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchInvitations = async () => {
    try {
      const res = await fetch("/api/events/invites", {
        credentials: "include",
        headers: { Accept: "application/json" },
      });

      if (!res.ok) throw new Error("Failed to fetch events");

      const data = await res.json();

      const invs: Invitation[] = Array.isArray(data.data)
        ? data.data.map((inv: any) => ({
            id: inv.id,
            title: inv.title,
            category: inv.category ?? "General",
            event_date: inv.event_date,
            status: inv.invite_status,
          }))
        : [];

      setInvitations(invs);
    } catch (err) {
      toast.error("Failed to load events");
    } finally {
      setLoading(false);
    }
  };

  const respond = async (id: number, action: "accept" | "decline") => {
    try {
      const res = await fetch(`/api/events/${id}/action`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });

      if (!res.ok) throw new Error("Action failed");

      setInvitations((prev) =>
        prev.map((inv) =>
          inv.id === id
            ? { ...inv, status: action === "accept" ? "accepted" : "declined" }
            : inv,
        ),
      );

      toast.success(
        `Invitation ${action === "accept" ? "accepted" : "declined"}`,
      );
    } catch (err) {
      toast.error("Failed to respond to invitation");
    }
  };

  useEffect(() => {
    fetchInvitations();
  }, []);

  return (
    <section className="bg-white border border-[#d0e8d0] rounded-xl p-5 h-full">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5 pb-4 border-b border-[#d0e8d0]">
        <div className="p-2 bg-[#e8f5e8] rounded-lg">
          <CalendarDays className="w-5 h-5 text-[#1a4d1a]" />
        </div>
        <div>
          <h2 className="text-base font-bold text-[#1a2e1a]">
            Upcoming Events
          </h2>
          <p className="text-xs text-[#6b8f6b]">Your event invitations</p>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex justify-center py-8">
          <div className="w-8 h-8 border-4 border-[#1a4d1a] border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Empty */}
      {!loading && invitations.length === 0 && (
        <div className="text-center py-10 bg-[#f2faf2] rounded-xl">
          <CalendarDays className="w-8 h-8 text-[#6b8f6b] mx-auto mb-2" />
          <p className="text-[#6b8f6b] text-sm">No upcoming invitations</p>
        </div>
      )}

      {/* List */}
      <div className="flex flex-col gap-3">
        {invitations.map((inv) => (
          <motion.div
            key={inv.id}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="bg-[#f2faf2] border border-[#d0e8d0] rounded-lg p-3 flex flex-col md:flex-row md:justify-between md:items-center gap-2"
          >
            <div>
              <h3 className="text-sm font-semibold text-[#1a2e1a]">
                {inv.title}
              </h3>
              <p className="text-xs text-[#3d5c3d] mt-0.5">{inv.category}</p>
              <p className="text-xs text-[#6b8f6b] flex items-center gap-1 mt-1">
                <Calendar className="w-3 h-3" />
                {new Date(inv.event_date).toLocaleString()}
              </p>
            </div>

            <div className="flex gap-2 shrink-0">
              {inv.status === "pending" && (
                <>
                  <button
                    onClick={() => respond(inv.id, "accept")}
                    className="px-3 py-1.5 bg-[#1a4d1a] text-white text-xs font-semibold rounded-lg hover:bg-[#1a2e1a] transition-colors"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => respond(inv.id, "decline")}
                    className="px-3 py-1.5 border border-[#d0e8d0] text-[#3d5c3d] text-xs font-semibold rounded-lg hover:bg-[#e8f5e8] transition-colors"
                  >
                    Decline
                  </button>
                </>
              )}

              {inv.status === "accepted" && (
                <span className="px-2.5 py-1 bg-[#e8f5e8] text-[#1a4d1a] text-xs font-semibold rounded-lg border border-[#d0e8d0]">
                  Accepted
                </span>
              )}

              {inv.status === "declined" && (
                <span className="px-2.5 py-1 bg-red-50 text-red-600 text-xs font-semibold rounded-lg border border-red-100">
                  Declined
                </span>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
