"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { User, AlertTriangle, UserCircle2 } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";

interface MemberProfile {
  name: string;
  alias?: string;
  tenure?: string;
  membership?: string;
  projects?: string;
  status: string;
  positions?: string;
  achievements?: string;
  membership_id?: string;
  member_since?: string;
  profile_image?: string;
}

interface UserData {
  id: number;
  name: string;
  email: string;
  phone_number?: string;
  address?: string;
  fraternity_number?: string;
  member_profile?: MemberProfile;
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

const memberAPI = {
  get: async () => {
    const res = await fetch("/api/member/profile", {
      credentials: "include",
      headers: { Accept: "application/json" },
    });
    const text = await res.text();
    const data = text ? JSON.parse(text) : {};
    return data?.data ?? data ?? null;
  },
};

export default function ProfilePreview() {
  const router = useRouter();
  const [profile, setProfile] = useState<MemberProfile | null>(null);
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const userRes = await userAPI.me();
      setUser(userRes.user);

      if (userRes.user?.member_profile) {
        setProfile(userRes.user.member_profile);
      } else {
        try {
          const profileData = await memberAPI.get();
          setProfile(profileData);
        } catch {
          setProfile(null);
        }
      }
    } catch {
      toast.error("Failed to load profile");
      router.push("/login");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // Loading skeleton
  if (loading) {
    return (
      <section className="bg-white border border-[#d0e8d0] rounded-xl p-5 h-full">
        <div className="flex items-center gap-3 mb-5 pb-4 border-b border-[#d0e8d0]">
          <div className="p-2 bg-[#e8f5e8] rounded-lg">
            <UserCircle2 className="w-5 h-5 text-[#1a4d1a]" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[#1a2e1a]">My Profile</h2>
            <p className="text-xs text-[#6b8f6b]">Member information</p>
          </div>
        </div>
        <div className="animate-pulse flex items-center gap-4">
          <div className="w-16 h-16 bg-[#e8f5e8] rounded-full shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-3.5 bg-[#e8f5e8] rounded w-3/4" />
            <div className="h-3 bg-[#e8f5e8] rounded w-1/2" />
            <div className="h-3 bg-[#e8f5e8] rounded w-1/3" />
          </div>
        </div>
      </section>
    );
  }

  const hasProfile = !!profile;
  const hasAlias = !!profile?.alias;
  const isProfileIncomplete = !hasProfile || !hasAlias;

  // Incomplete profile warning
  if (isProfileIncomplete) {
    return (
      <section className="bg-white border border-[#d0e8d0] rounded-xl p-5 h-full">
        <div className="flex items-center gap-3 mb-5 pb-4 border-b border-[#d0e8d0]">
          <div className="p-2 bg-[#e8f5e8] rounded-lg">
            <UserCircle2 className="w-5 h-5 text-[#1a4d1a]" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[#1a2e1a]">My Profile</h2>
            <p className="text-xs text-[#6b8f6b]">Member information</p>
          </div>
        </div>
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-lg p-4">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm text-amber-800">
              Your profile is incomplete. Update it to get the best experience.
            </p>
            <button
              onClick={() => router.push("/dashboard/member/profile")}
              className="mt-2 px-3 py-1.5 bg-[#1a4d1a] text-white text-xs font-semibold rounded-lg hover:bg-[#1a2e1a] transition-colors"
            >
              Update Profile
            </button>
          </div>
        </div>
      </section>
    );
  }

  // Complete profile
  return (
    <section className="bg-white border border-[#d0e8d0] rounded-xl p-5 h-full">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5 pb-4 border-b border-[#d0e8d0]">
        <div className="p-2 bg-[#e8f5e8] rounded-lg">
          <UserCircle2 className="w-5 h-5 text-[#1a4d1a]" />
        </div>
        <div>
          <h2 className="text-base font-bold text-[#1a2e1a]">My Profile</h2>
          <p className="text-xs text-[#6b8f6b]">Member information</p>
        </div>
      </div>

      {/* Avatar + Info */}
      <div className="flex items-center gap-4">
        <div className="relative w-16 h-16 rounded-full overflow-hidden bg-[#e8f5e8] shrink-0">
          {profile?.profile_image ? (
            <Image
              src={profile.profile_image}
              alt={user?.name || "Profile"}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-[#e8f5e8]">
              <User className="w-8 h-8 text-[#1a4d1a]" />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold text-[#1a2e1a] truncate">
            {user?.name || "Member"}
          </h3>
          <p className="text-xs text-[#3d5c3d] mt-0.5">
            {profile?.alias || "—"}
          </p>

          <div className="flex items-center gap-2 mt-1.5">
            <span className="text-xs text-[#6b8f6b]">
              #{profile?.membership_id || user?.fraternity_number || "—"}
            </span>
            {profile?.status && (
              <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-semibold bg-[#e8f5e8] text-[#1a4d1a] border border-[#d0e8d0]">
                {profile.status}
              </span>
            )}
          </div>

          {profile?.member_since && (
            <p className="text-xs text-[#6b8f6b] mt-1">
              Member since {profile.member_since}
            </p>
          )}
        </div>
      </div>

      {/* Additional Info */}
      {(profile?.positions || profile?.tenure) && (
        <div className="mt-4 pt-4 border-t border-[#d0e8d0]">
          <div className="grid grid-cols-2 gap-3">
            {profile.positions && (
              <div className="bg-[#f2faf2] rounded-lg p-2.5">
                <p className="text-xs text-[#6b8f6b]">Position</p>
                <p className="text-xs font-semibold text-[#1a2e1a] mt-0.5 truncate">
                  {profile.positions}
                </p>
              </div>
            )}
            {profile.tenure && (
              <div className="bg-[#f2faf2] rounded-lg p-2.5">
                <p className="text-xs text-[#6b8f6b]">Tenure</p>
                <p className="text-xs font-semibold text-[#1a2e1a] mt-0.5">
                  {profile.tenure}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
