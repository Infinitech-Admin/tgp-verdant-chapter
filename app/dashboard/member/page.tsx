"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import MemberLayout from "@/components/memberLayout";
import AnnouncementsSection from "@/components/member-dashboard/member-announcement";
import NewsSection from "@/components/member-dashboard/member-news";
import EventsPreview from "@/components/member-dashboard/member-event";
import ProfilePreview from "@/components/member-dashboard/member-profile";
import { toast } from "sonner";

interface User {
  id: number;
  name: string;
  email: string;
}

async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
  const res = await fetch(endpoint, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options,
  });
  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    throw new Error("Invalid server response");
  }
  if (!res.ok) throw new Error(data.message || "Request failed");
  return data;
}

const userAPI = {
  me: () => fetchWithAuth("/api/auth/me"),
};

export default function MemberDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await userAPI.me();
      setUser(res.user);
    } catch {
      toast.error("An error occurred");
      router.push("/login");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <MemberLayout>
        <div className="min-h-screen flex items-center justify-center bg-[#f2faf2]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1a4d1a] mx-auto mb-4" />
            <p className="text-[#6b8f6b]">Loading your dashboard...</p>
          </div>
        </div>
      </MemberLayout>
    );
  }

  if (error) {
    return (
      <MemberLayout>
        <div className="min-h-screen flex items-center justify-center bg-[#f2faf2] px-4">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={fetchUser}
              className="px-4 py-2 bg-[#1a4d1a] text-white rounded-lg hover:bg-[#1a2e1a] transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </MemberLayout>
    );
  }

  return (
    <MemberLayout>
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 text-[#1a2e1a]">
          Welcome,{" "}
          <span
            style={{
              background: "linear-gradient(to right, #1a4d1a, #3d8b3d)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            {user?.name || "Member"}!
          </span>
        </h1>
        <p className="text-[#6b8f6b] text-lg">Dashboard</p>
      </div>

      {/* Top Grid: Profile + Events */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-8">
        <div className="bg-white border border-[#d0e8d0] rounded-xl p-4">
          <ProfilePreview />
        </div>
        <div className="bg-white border border-[#d0e8d0] rounded-xl p-4">
          <EventsPreview />
        </div>
      </div>

      {/* Bottom Grid: Announcements + News */}
      <div className="grid grid-cols-1 gap-4 mb-8">
        <div className="bg-white border border-[#d0e8d0] rounded-xl p-4">
          <AnnouncementsSection />
        </div>
        <div className="bg-white border border-[#d0e8d0] rounded-xl p-4">
          <NewsSection />
        </div>
      </div>
    </MemberLayout>
  );
}
