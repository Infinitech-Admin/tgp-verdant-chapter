"use client";

import React, { useEffect, useState } from "react";
import MemberLayout from "@/components/memberLayout";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import {
  User,
  Trophy,
  Mail,
  Phone,
  MapPin,
  Edit,
  Save,
  Loader2,
  Camera,
  Calendar,
} from "lucide-react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

const API_IMG = process.env.NEXT_PUBLIC_API_IMG || "";

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

interface JuanTapProfile {
  id: number;
  profile_url: string | null;
  qr_code: string | null;
  status: "active" | "inactive";
  subscription: "silver" | "gold" | "black";
}

interface UserProfile {
  id: number;
  name: string;
  email: string;
  phone_number?: string;
  address?: string;
  fraternity_number?: string;
  membership_id?: string;
  status?: string;
  juantap_profile: JuanTapProfile | null;
}

interface MemberProfilePayload {
  alias?: string;
  tenure?: string;
  projects?: string;
  positions?: string;
  achievements?: string;
  member_since?: string;
  status?: string;
}

async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
  const res = await fetch(endpoint, { ...options, credentials: "include" });
  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    throw new Error("Invalid server response");
  }
  if (!res.ok) throw new Error(data.message || "Request failed");
  return data?.data ?? null;
}

const juantapAPI = {
  get: async () => {
    const data = await fetchWithAuth("/api/juantap");
    return data ?? null;
  },
  create: (payload: any) =>
    fetchWithAuth("/api/juantap", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }),
  update: (id: number, payload: any) =>
    fetchWithAuth(`/api/juantap/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }),
  delete: (id: number) =>
    fetchWithAuth(`/api/juantap/${id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
    }),
};

const memberAPI = {
  get: async (): Promise<MemberProfile | null> => {
    const data = await fetchWithAuth("/api/member/profile");
    return data ?? null;
  },
  update: async (payload: MemberProfilePayload): Promise<MemberProfile> =>
    fetchWithAuth("/api/member/profile", {
      method: "PUT",
      body: JSON.stringify(payload),
      headers: { "Content-Type": "application/json" },
    }),
  create: async (payload: MemberProfilePayload): Promise<MemberProfile> =>
    fetchWithAuth("/api/member/profile", {
      method: "POST",
      body: JSON.stringify(payload),
      headers: { "Content-Type": "application/json" },
    }),
};

const getImageUrl = (imagePath: string | null | undefined): string => {
  if (!imagePath) return "/default-profile.png";
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://"))
    return imagePath;
  if (imagePath.startsWith("data:image/")) return imagePath;
  return `${API_IMG}${imagePath.startsWith("/") ? imagePath : `/${imagePath}`}`;
};

export default function MemberProfilePage() {
  const { user } = useAuth(true);
  const [juantapProfile, setJuanTapProfile] = useState<JuanTapProfile | null>(
    null,
  );
  const [profile, setProfile] = useState<MemberProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [qrPreview, setQrPreview] = useState<string | null>(null);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);

  const [formData, setFormData] = useState({
    alias: "",
    tenure: "",
    member_since: "",
    projects: "",
    positions: "",
    achievements: "",
    status: "",
    juantap_nfc: false,
    profile_url: "",
    qr_code: "",
    member_status: "inactive" as "active" | "inactive",
    subscription: "silver" as "silver" | "gold" | "black",
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setProfileImageFile(file);
    setProfileImage(URL.createObjectURL(file));
  };

  const fetchJuanTapProfileData = async () => {
    try {
      const data = await juantapAPI.get();
      if (data) {
        setJuanTapProfile(data);
        setFormData((p) => ({ ...p, juantap_nfc: true }));
      } else {
        setJuanTapProfile(null);
        setFormData((p) => ({ ...p, juantap_nfc: false }));
      }
    } catch {
      setJuanTapProfile(null);
    }
  };

  useEffect(() => {
    if (!user?.id) return;
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const profileData = await memberAPI.get();
        setProfile(profileData);
        setProfileImage(getImageUrl(profileData?.profile_image));
        setFormData({
          alias: profileData?.alias || "",
          tenure: profileData?.tenure || "",
          member_since: profileData?.member_since || "",
          projects: profileData?.projects || "",
          positions: profileData?.positions || "",
          achievements: profileData?.achievements || "",
          status: profileData?.status || "",
          juantap_nfc: false,
          profile_url: "",
          qr_code: "",
          member_status: "inactive",
          subscription: "silver",
        });
        await fetchJuanTapProfileData();
      } catch {
        toast.error("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const fd = new FormData();
      fd.append("alias", formData.alias || "");
      fd.append("tenure", formData.tenure || "");
      fd.append("projects", formData.projects || "");
      fd.append("positions", formData.positions || "");
      fd.append("achievements", formData.achievements || "");
      fd.append("member_since", formData.member_since?.toString().trim() || "");
      if (profileImageFile) fd.append("profile_image", profileImageFile);

      const res = await fetch("/api/member/profile", {
        method: "PUT",
        body: fd,
        credentials: "include",
      });
      const text = await res.text();
      const data = text ? JSON.parse(text) : {};
      if (!res.ok) throw new Error(data.message || "Failed to save profile");

      const updated = data.data || data;
      setProfile(updated);
      if (updated?.profile_image)
        setProfileImage(getImageUrl(updated.profile_image));
      setProfileImageFile(null);
      setFormData((prev) => ({
        ...prev,
        alias: data.data?.alias || "",
        tenure: data.data?.tenure || "",
        projects: data.data?.projects || "",
        positions: data.data?.positions || "",
        achievements: data.data?.achievements || "",
        member_since: data.data?.member_since || "",
        status: data.data?.status || "",
      }));
      setIsEditing(false);
      toast.success("Profile updated successfully");
    } catch (err: any) {
      toast.error(err.message || "Failed to save profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData((p) => ({
      ...p,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const openModal = () => {
    if (juantapProfile) {
      setFormData((prev) => ({
        ...prev,
        profile_url: juantapProfile.profile_url || "",
        qr_code: juantapProfile.qr_code || "",
        member_status: juantapProfile.status,
        subscription: juantapProfile.subscription,
        juantap_nfc: true,
      }));
      setQrPreview(getImageUrl(juantapProfile.qr_code));
    } else {
      setFormData((prev) => ({
        ...prev,
        profile_url: "",
        qr_code: "",
        member_status: "inactive",
        subscription: "silver",
        juantap_nfc: false,
      }));
      setQrPreview(null);
    }
    setShowModal(true);
  };

  const handleQrUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const b64 = reader.result as string;
      setFormData((p) => ({ ...p, qr_code: b64 }));
      setQrPreview(b64);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError("");
    try {
      const payload = {
        profile_url: formData.profile_url,
        qr_code: formData.qr_code,
        status: formData.member_status,
        subscription: formData.subscription,
      };
      if (juantapProfile) await juantapAPI.update(juantapProfile.id, payload);
      else await juantapAPI.create(payload);
      await fetchJuanTapProfileData();
      setShowModal(false);
      toast.success("JuanTap profile saved");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to save profile";
      setFormError(msg);
      toast.error(msg);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    if (
      !juantapProfile ||
      !confirm("Delete your OneTap profile? This cannot be undone.")
    )
      return;
    setFormLoading(true);
    try {
      await juantapAPI.delete(juantapProfile.id);
      setJuanTapProfile(null);
      setShowModal(false);
      toast.success("OneTap profile deleted");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setFormLoading(false);
    }
  };

  if (loading) {
    return (
      <MemberLayout>
        <div className="flex items-center justify-center min-h-screen bg-[#f2faf2]">
          <div className="w-10 h-10 border-4 border-[#1a4d1a] border-t-transparent rounded-full animate-spin" />
        </div>
      </MemberLayout>
    );
  }

  if (!profile) {
    return (
      <MemberLayout>
        <div className="flex items-center justify-center min-h-screen bg-[#f2faf2]">
          <p className="text-sm text-[#6b8f6b]">Profile not found.</p>
        </div>
      </MemberLayout>
    );
  }

  return (
    <MemberLayout>
      <div className="min-h-screen bg-[#f2faf2] overflow-x-hidden">
        {/* Profile Header */}
        <div className="bg-[#1a4d1a] text-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 flex flex-col sm:flex-row sm:items-end gap-6">
            {/* Avatar */}
            <div className="relative shrink-0 self-center sm:self-end">
              <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-xl overflow-hidden bg-[#e8f5e8] border-4 border-[#e8f5e8]/30 shadow-lg">
                <Image
                  src={profileImage || "/default-profile.png"}
                  alt="Profile"
                  width={144}
                  height={144}
                  className="object-cover w-full h-full"
                  unoptimized={
                    profileImage?.startsWith(API_IMG) ||
                    profileImage?.startsWith("blob:")
                  }
                />
              </div>
              {isEditing && (
                <label className="absolute bottom-2 right-2 bg-[#e8f5e8] p-1.5 rounded-full cursor-pointer shadow-lg hover:bg-white transition">
                  <Camera className="w-4 h-4 text-[#1a4d1a]" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {/* Identity */}
            <div className="flex-1 space-y-2 text-center sm:text-left">
              <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#e8f5e8] text-[#1a4d1a]">
                {profile.status || "Active"}
              </span>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-white">
                  {user?.name}
                </h1>
                <span className="text-[#a8cca8] text-sm">
                  #{user?.membership_id}
                </span>
              </div>
              {isEditing ? (
                <div className="flex items-center gap-2 justify-center sm:justify-start">
                  <Calendar className="w-3.5 h-3.5 text-[#a8cca8]" />
                  <input
                    type="text"
                    name="member_since"
                    value={formData.member_since}
                    onChange={handleChange}
                    placeholder="2022"
                    pattern="\d{4}"
                    maxLength={4}
                    className="px-3 py-1 rounded-lg text-xs text-[#1a2e1a] bg-white/90 focus:outline-none focus:ring-2 focus:ring-[#e8f5e8] w-28"
                  />
                </div>
              ) : (
                <p className="text-xs text-[#a8cca8]">
                  Member since {profile.member_since || "—"}
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="flex justify-center sm:justify-end shrink-0">
              {isEditing ? (
                <div className="flex gap-2">
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex items-center gap-2 px-4 py-2 bg-[#e8f5e8] text-[#1a4d1a] text-xs font-semibold rounded-lg hover:bg-white disabled:opacity-50 transition"
                  >
                    {isSaving ? (
                      <Loader2 className="animate-spin w-3.5 h-3.5" />
                    ) : (
                      <Save className="w-3.5 h-3.5" />
                    )}
                    {isSaving ? "Saving…" : "Save Changes"}
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 bg-white/10 text-white text-xs font-semibold rounded-lg hover:bg-white/20 transition"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="p-2 bg-[#e8f5e8]/20 hover:bg-[#e8f5e8]/30 text-white rounded-lg transition"
                >
                  <Edit className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-4">
          {/* Contact + Profile Fields */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border border-[#d0e8d0] rounded-xl p-6 space-y-6"
          >
            {/* Contact Info */}
            <div>
              <h2 className="flex items-center gap-2 text-sm font-semibold text-[#1a2e1a] mb-4">
                <User className="w-4 h-4 text-[#6b8f6b]" />
                Contact Information
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <Info icon={Mail} label="Email" value={user?.email || ""} />
                <Info
                  icon={Phone}
                  label="Phone"
                  value={user?.phone_number || ""}
                />
                <Info
                  icon={MapPin}
                  label="Address"
                  value={user?.address || ""}
                />
              </div>
            </div>

            {/* Profile Fields */}
            <div>
              <h2 className="flex items-center gap-2 text-sm font-semibold text-[#1a2e1a] mb-4">
                <Edit className="w-4 h-4 text-[#6b8f6b]" />
                Profile Details
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <Field
                  label="Alias"
                  name="alias"
                  value={isEditing ? formData.alias : profile?.alias || ""}
                  editable={isEditing}
                  onChange={handleChange}
                />
                <Field
                  label="Tenure"
                  name="tenure"
                  value={isEditing ? formData.tenure : profile.tenure || ""}
                  editable={isEditing}
                  onChange={handleChange}
                />
                <Field
                  label="Status"
                  name="status"
                  value={isEditing ? formData.status : profile.status || ""}
                  editable={isEditing}
                  onChange={handleChange}
                />
              </div>
            </div>
          </motion.div>

          {/* Projects & Achievements */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white border border-[#d0e8d0] rounded-xl p-6"
          >
            <h2 className="flex items-center gap-2 text-sm font-semibold text-[#1a2e1a] mb-4">
              <Trophy className="w-4 h-4 text-[#6b8f6b]" />
              Projects & Membership
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Field
                label="Projects"
                name="projects"
                value={isEditing ? formData.projects : profile.projects || ""}
                editable={isEditing}
                onChange={handleChange}
              />
              <Field
                label="Membership"
                name="achievements"
                value={
                  isEditing ? formData.achievements : profile.achievements || ""
                }
                editable={isEditing}
                onChange={handleChange}
              />
              <Field
                label="Positions"
                name="positions"
                value={isEditing ? formData.positions : profile.positions || ""}
                editable={isEditing}
                onChange={handleChange}
              />
            </div>
          </motion.div>
        </div>

        {/* Modal */}
        <AnimatePresence>
          {showModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white w-full max-w-xl rounded-xl shadow-xl border border-[#d0e8d0] overflow-hidden"
              >
                <div className="flex items-center justify-between px-5 py-4 border-b border-[#d0e8d0] bg-[#f2faf2]">
                  <h2 className="text-sm font-bold text-[#1a2e1a]">
                    {juantapProfile
                      ? "Update OneTap Profile"
                      : "Add Existing OneTap Profile"}
                  </h2>
                  <button
                    onClick={() => setShowModal(false)}
                    className="text-[#6b8f6b] hover:text-[#1a2e1a] text-lg leading-none"
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="p-5 space-y-4">
                  {formError && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600">
                      {formError}
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-medium text-[#3d5c3d] mb-1">
                      OneTap Profile URL
                    </label>
                    <input
                      type="url"
                      value={formData.profile_url}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          profile_url: e.target.value,
                        })
                      }
                      placeholder="https://juantap.info/your-profile"
                      className="w-full px-3 py-2 border border-[#d0e8d0] rounded-lg text-sm text-[#1a2e1a] focus:outline-none focus:ring-2 focus:ring-[#1a4d1a]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#3d5c3d] mb-1">
                      Upload QR Code
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleQrUpload}
                      className="block w-full text-xs text-[#6b8f6b]"
                    />
                    {qrPreview && (
                      <div className="mt-3 flex justify-center">
                        <Image
                          src={qrPreview}
                          alt="QR Preview"
                          width={128}
                          height={128}
                          className="rounded-lg border border-[#d0e8d0]"
                          unoptimized
                        />
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#3d5c3d] mb-1">
                      Subscription
                    </label>
                    <select
                      value={formData.subscription}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          subscription: e.target.value as
                            | "silver"
                            | "gold"
                            | "black",
                        })
                      }
                      className="w-full px-3 py-2 border border-[#d0e8d0] rounded-lg text-sm text-[#1a2e1a] focus:outline-none focus:ring-2 focus:ring-[#1a4d1a] bg-white"
                    >
                      <option value="silver">Silver</option>
                      <option value="gold">Gold</option>
                      <option value="black">Black</option>
                    </select>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="flex-1 px-4 py-2 text-xs font-semibold border border-[#d0e8d0] text-[#3d5c3d] rounded-lg hover:bg-[#f2faf2] transition"
                    >
                      Cancel
                    </button>
                    {juantapProfile && (
                      <button
                        type="button"
                        onClick={handleDelete}
                        disabled={formLoading}
                        className="flex-1 px-4 py-2 text-xs font-semibold bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 disabled:opacity-50 transition"
                      >
                        {formLoading ? "Deleting..." : "Delete"}
                      </button>
                    )}
                    <button
                      type="submit"
                      disabled={formLoading}
                      className="flex-1 px-4 py-2 text-xs font-semibold bg-[#1a4d1a] text-white rounded-lg hover:bg-[#163f16] disabled:opacity-50 transition"
                    >
                      {formLoading ? "Saving..." : "Save Profile"}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </MemberLayout>
  );
}

interface InfoProps {
  icon: React.ElementType;
  label: string;
  value: string;
}
function Info({ icon: Icon, label, value }: InfoProps) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-lg bg-[#f2faf2] border border-[#d0e8d0]">
      <Icon className="w-4 h-4 text-[#6b8f6b] mt-0.5 shrink-0" />
      <div className="min-w-0">
        <p className="text-xs text-[#6b8f6b]">{label}</p>
        <p className="text-xs font-semibold text-[#1a2e1a] break-words">
          {value || "—"}
        </p>
      </div>
    </div>
  );
}

interface FieldProps {
  label: string;
  name: string;
  value: string | boolean;
  editable: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: "text" | "checkbox" | "date";
}
function Field({
  label,
  name,
  value,
  editable,
  onChange,
  type = "text",
}: FieldProps) {
  const renderValue = (val: string | boolean) => {
    if (type === "checkbox") return val ? "Yes" : "No";
    if (name === "positions" && typeof val === "string" && val.includes(",")) {
      return (
        <div className="space-y-0.5">
          {val.split(",").map((item, i) => (
            <div key={i} className="text-xs font-semibold text-[#1a2e1a]">
              {item.trim()}
            </div>
          ))}
        </div>
      );
    }
    return (
      <p className="text-xs font-semibold text-[#1a2e1a]">
        {(val as string) || "—"}
      </p>
    );
  };

  return (
    <div className="space-y-1">
      <label className="text-xs text-[#6b8f6b]">{label}</label>
      {editable ? (
        type === "checkbox" ? (
          <input
            type="checkbox"
            name={name}
            checked={value as boolean}
            onChange={onChange}
            className="h-4 w-4 accent-[#1a4d1a]"
          />
        ) : (
          <input
            type={type}
            name={name}
            value={(value as string) || ""}
            onChange={onChange}
            className="w-full rounded-lg border border-[#d0e8d0] px-3 py-2 text-xs text-[#1a2e1a] focus:outline-none focus:ring-2 focus:ring-[#1a4d1a] focus:border-transparent"
          />
        )
      ) : (
        renderValue(value)
      )}
    </div>
  );
}
