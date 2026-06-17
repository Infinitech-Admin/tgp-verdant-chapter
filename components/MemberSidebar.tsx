"use client";

import React, { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  Home,
  ClipboardClock,
  Newspaper,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Handshake,
  Megaphone,
  BadgeCheck,
  Camera,
  User,
  BookUser,
} from "lucide-react";
import { authClient } from "@/lib/auth";
import { useToast } from "@/components/ui/use-toast";

export default function MemberSidebar({
  isCollapsed,
  setIsCollapsed,
}: {
  isCollapsed: boolean;
  setIsCollapsed: (v: boolean) => void;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();
  const [isLoggingOut, setIsLoggingOut] = React.useState(false);

  const [expandedSections, setExpandedSections] = React.useState({
    quickAccess: false,
    certificates: false,
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
    if (!isCollapsed) {
      setExpandedSections({ quickAccess: false, certificates: false });
    }
  };

  const handleLogout = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsLoggingOut(true);
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
      setIsLoggingOut(false);
    }
  };

  const isActive = (path: string) => {
    if (path === "/dashboard/member") return pathname === path;
    return pathname === path || pathname.startsWith(path + "/");
  };

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

  return (
    <aside
      className={`hidden lg:block fixed top-0 left-0 h-full overflow-visible
        bg-[#1a2e1a] text-white shadow-2xl z-50 transition-all duration-300
        ${isCollapsed ? "w-[70px]" : "w-[300px]"}`}
    >
      {/* Toggle button */}
      <button
        onClick={toggleSidebar}
        className="absolute top-4 -right-3 bg-white text-[#1a4d1a] rounded-full p-1.5 shadow-lg hover:bg-[#e8f5e8] transition-colors z-[999]"
      >
        {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>

      {/* Scrollable Content */}
      <div
        className={`h-full overflow-y-auto overflow-x-hidden flex flex-col min-h-full
          ${isCollapsed ? "py-8 px-4" : "py-8 px-6"}`}
        style={{ scrollbarWidth: "thin", scrollbarColor: "#3d5c3d #1a2e1a" }}
      >
        {/* Logo */}
        <div
          className={`flex items-center gap-3 mb-4 py-3 ${isCollapsed ? "justify-center" : ""}`}
        >
          <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-[#3d5c3d] shadow-lg shrink-0">
            <img
              src="/sigma-verdant-logo.png"
              alt="Verdant Chapter Logo"
              className="w-10 h-10 rounded-full object-cover"
            />
          </div>
          {!isCollapsed && (
            <div>
              <h1 className="font-bold text-sm text-white leading-tight">
                Verdant - Las Piñas Chapter
              </h1>
              <p className="text-xs text-[#6b8f6b]">Member Portal</p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="space-y-0.5 flex-1 py-3 border-t border-[#3d5c3d]">
          {navigationItems.map((item, index) => {
            const active = isActive(item.path);
            return (
              <div key={index} className="group relative">
                <button
                  onClick={() => router.push(item.path)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors text-sm
                    ${isCollapsed ? "justify-center" : ""}
                    ${
                      active
                        ? "bg-[#e8f5e8] text-[#1a2e1a] font-semibold"
                        : "text-[#d0e8d0] hover:bg-[#3d5c3d] hover:text-white"
                    }`}
                >
                  <item.icon size={16} className="shrink-0" />
                  {!isCollapsed && <span>{item.label}</span>}
                </button>

                {/* Collapsed flyout tooltip */}
                {isCollapsed && (
                  <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-3 py-1.5 bg-[#1a4d1a] text-white text-xs font-semibold rounded-lg shadow-xl opacity-0 translate-x-2 invisible pointer-events-none group-hover:opacity-100 group-hover:translate-x-0 group-hover:visible group-hover:pointer-events-auto transition-all duration-200 z-[9999] whitespace-nowrap">
                    {item.label}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="py-4 border-t border-[#3d5c3d]">
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm text-[#d0e8d0] hover:bg-red-900/30 hover:text-red-300
              ${isCollapsed ? "justify-center" : ""}`}
          >
            {isLoggingOut ? (
              <>
                <div className="w-4 h-4 border-2 border-[#d0e8d0] border-t-transparent rounded-full animate-spin" />
                {!isCollapsed && <span>Logging out...</span>}
              </>
            ) : (
              <>
                <LogOut size={16} />
                {!isCollapsed && <span>Logout</span>}
              </>
            )}
          </button>
        </div>
      </div>
    </aside>
  );
}
