"use client";

import React, { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { authClient } from "@/lib/auth";
import { useToast } from "@/components/ui/use-toast";
import {
  Bell,
  LogOut,
  Menu,
  X,
  Home,
  Newspaper,
  Megaphone,
  Handshake,
  BadgeCheck,
  Camera,
  User,
  BookUser,
  ClipboardClock,
} from "lucide-react";

export default function MemberHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();
  const [menuOpen, setMenuOpen] = useState(false);

  const navigationItems = [
    { icon: Home, label: "Home", path: "/" },
    { icon: BookUser, label: "Dashboard", path: "/dashboard/member" },
    { icon: Newspaper, label: "News", path: "/dashboard/member/news" },
    {
      icon: Megaphone,
      label: "Announcements",
      path: "/dashboard/member/announcement",
    },
    { icon: Camera, label: "Gallery", path: "/dashboard/member/gallery" },
    {
      icon: BadgeCheck,
      label: "Certificate of Legitimacy",
      path: "/dashboard/member/legitimacy",
    },
    { icon: Handshake, label: "Events", path: "/dashboard/member/events" },
    {
      icon: ClipboardClock,
      label: "Chapter's History",
      path: "/dashboard/member/history",
    },
    { icon: BookUser, label: "Handbook", path: "/dashboard/member/handbook" },
    { icon: User, label: "Profile", path: "/dashboard/member/profile" },
    { icon: User, label: "Suggestion", path: "/dashboard/member/suggestion" },
    {
      icon: BadgeCheck,
      label: "Lost/Stolen Card",
      path: "/dashboard/member/stolen",
    },
  ];

  const handleLogout = async () => {
    try {
      await authClient.logout();
      toast({
        title: "✓ Logged Out Successfully",
        description: "You have been securely logged out.",
        className: "bg-green-50 border-green-200",
        duration: 2000,
      });
      setTimeout(() => router.push("/login"), 500);
    } catch {
      toast({
        variant: "destructive",
        title: "Logout Failed",
        description: "An error occurred. Please try again.",
      });
    }
  };

  const handleNavigate = (path: string) => {
    router.push(path);
    setMenuOpen(false);
  };

  const isActive = (path: string) =>
    path === "/dashboard/member"
      ? pathname === path
      : pathname === path || pathname.startsWith(path + "/");

  return (
    <>
      {/* Desktop Header — slim spacer only */}
      <header className="hidden lg:block bg-white border-b border-[#d0e8d0] sticky top-0 z-30 h-14" />

      {/* Mobile Header */}
      <header className="lg:hidden bg-white border-b border-[#d0e8d0] sticky top-0 z-30 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full ring-2 ring-[#d0e8d0] bg-white flex items-center justify-center overflow-hidden flex-shrink-0">
              <img
                src="/two-seal.png"
                alt="Verdant Logo"
                className="w-full h-full object-contain p-0.5"
              />
            </div>
            <span className="font-bold text-sm text-[#1a2e1a]">
              Verdant Chapter
            </span>
          </div>

          <button
            onClick={() => setMenuOpen(true)}
            className="p-2 rounded-lg hover:bg-[#e8f5e8] text-[#1a4d1a] transition-colors"
          >
            <Menu size={22} />
          </button>
        </div>
      </header>

      {/* Overlay */}
      {menuOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40"
          onClick={() => setMenuOpen(false)}
        />
      )}

      {/* Slide-down Menu */}
      <div
        className={`fixed top-0 right-0 left-0 z-50 bg-white shadow-xl transform transition-transform duration-300
          ${menuOpen ? "translate-y-0" : "-translate-y-full"}`}
      >
        {/* Menu Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-[#d0e8d0] bg-[#f2faf2]">
          <div className="flex items-center gap-3">
            <img
              src="/sigma-verdant-logo.png"
              alt="Verdant Logo"
              className="w-9 h-9 rounded-full object-cover ring-2 ring-[#d0e8d0]"
            />
            <span className="font-bold text-sm text-[#1a2e1a]">
              Verdant Chapter
            </span>
          </div>
          <button
            onClick={() => setMenuOpen(false)}
            className="p-1.5 rounded-lg hover:bg-[#e8f5e8] text-[#3d5c3d] transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Menu Items */}
        <nav className="py-2 overflow-y-auto max-h-[calc(100vh-80px)]">
          {navigationItems.map((item, index) => {
            const active = isActive(item.path);
            return (
              <button
                key={index}
                onClick={() => handleNavigate(item.path)}
                className={`w-full flex items-center gap-4 px-5 py-3 text-left transition-colors text-sm
                  ${
                    active
                      ? "bg-[#e8f5e8] text-[#1a4d1a] font-semibold border-l-4 border-[#1a4d1a]"
                      : "text-[#3d5c3d] hover:bg-[#f2faf2]"
                  }`}
              >
                <item.icon size={18} />
                <span>{item.label}</span>
              </button>
            );
          })}

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-4 px-5 py-3 text-left text-red-600 hover:bg-red-50 border-t border-[#d0e8d0] mt-1 text-sm"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </nav>
      </div>
    </>
  );
}
