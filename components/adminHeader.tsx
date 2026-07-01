"use client";

import React, { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { authClient } from "@/lib/auth";
import { useToast } from "@/components/ui/use-toast";
import {
  LayoutDashboard,
  Newspaper,
  Mail,
  LogOut,
  FileText,
  Megaphone,
  Handshake,
  Images,
  Menu,
  X,
  Camera,
  ChevronDown,
  ChevronUp,
  User,
} from "lucide-react";

export default function AdminHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();

  const [menuOpen, setMenuOpen] = useState(false);
  const [customizationOpen, setCustomizationOpen] = useState(false);

  const navigationItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard/admin" },
    { icon: Newspaper, label: "News", path: "/dashboard/admin/news" },
    {
      icon: Megaphone,
      label: "Announcements",
      path: "/dashboard/admin/announcements",
    },
    { icon: FileText, label: "Events", path: "/dashboard/admin/events" },
    { icon: Mail, label: "Contact Messages", path: "/dashboard/admin/contact" },
    {
      icon: FileText,
      label: "Legitimacy",
      path: "/dashboard/admin/legitimacy",
    },
    {
      icon: User,
      label: "Chapter History",
      path: "/dashboard/admin/chapter-history",
    },
    { icon: User, label: "Suggestion", path: "/dashboard/admin/suggestion" },
    {
      icon: FileText,
      label: "Lost/Stolen Card",
      path: "/dashboard/admin/stolen",
    },
    { icon: Camera, label: "Vlogs", path: "/dashboard/admin/vlogs" },
    { icon: User, label: "Master List", path: "/dashboard/admin/users" },
  ];

  const customizationItems = [
    { icon: FileText, label: "About Us", path: "/dashboard/admin/about-us" },
    {
      icon: FileText,
      label: "Contact Information",
      path: "/dashboard/admin/office-contact",
    },
    {
      icon: Handshake,
      label: "Partnerships",
      path: "/dashboard/admin/partners",
    },
    { icon: Images, label: "Gallery", path: "/dashboard/admin/gallery" },
  ];

  const handleNavigate = (path: string) => {
    router.push(path);
    setMenuOpen(false);
    setCustomizationOpen(false);
  };

  const handleLogout = async () => {
    try {
      await authClient.logout();

      toast({
        title: "✓ Logged Out Successfully",
        description: "You have been securely logged out.",
        className: "bg-green-50 border-green-200",
        duration: 2000,
      });

      setTimeout(() => {
        router.push("/login");
      }, 500);
    } catch (error) {
      console.error("Logout error:", error);

      toast({
        variant: "destructive",
        title: "Logout Failed",
        description: "An error occurred. Please try again.",
      });
    }
  };

  const isActive = (path: string) =>
    pathname === path || pathname.startsWith(path + "/");

  const isCustomizationActive = customizationItems.some((item) =>
    isActive(item.path),
  );

  return (
    <>
      {/* Desktop Header */}
      <header className="hidden lg:block shadow-sm sticky top-0 z-30 bg-[#f2faf2] border-b border-[#d0e8d0]" />

      {/* Mobile Header */}
      <header className="lg:hidden shadow-sm sticky top-0 z-30 px-4 py-3 bg-[#f2faf2] border-b border-[#d0e8d0]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img
              src="/two-seal.png"
              alt="Verdant Chapter Logo"
              className="w-10 h-10 rounded-full object-cover ring-2 ring-[#d0e8d0] shadow-lg"
            />
            <div>
              <h1 className="font-bold text-sm text-[#1a2e1a]">
                Verdant Chapter
              </h1>
              <p className="text-xs text-[#6b8f6b]">Admin Dashboard</p>
            </div>
          </div>

          <button
            onClick={() => setMenuOpen(true)}
            className="p-2 rounded-lg hover:bg-[#e8f5e8] text-[#1a4d1a] transition-colors"
          >
            <Menu size={24} />
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

      {/* Hamburger Menu */}
      <div
        className={`fixed top-0 left-0 right-0 z-50 bg-[#f2faf2] shadow-xl transition-transform duration-300 ${
          menuOpen ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        {/* Menu Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-[#d0e8d0] bg-white">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-[#e8f5e8] rounded-lg">
              <LayoutDashboard size={18} className="text-[#1a4d1a]" />
            </div>
            <span className="font-bold text-lg text-[#1a2e1a]">Admin Menu</span>
          </div>
          <button
            onClick={() => setMenuOpen(false)}
            className="p-1.5 rounded-lg hover:bg-[#e8f5e8] text-[#1a4d1a] transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Menu Content */}
        <nav className="py-2 bg-white">
          {/* Main Links */}
          {navigationItems.map((item, index) => (
            <button
              key={index}
              onClick={() => handleNavigate(item.path)}
              className={`w-full flex items-center gap-4 px-5 py-3 text-left transition-colors ${
                isActive(item.path)
                  ? "bg-[#e8f5e8] text-[#1a4d1a] font-semibold border-l-4 border-[#1a4d1a]"
                  : "text-[#3d5c3d] hover:bg-[#f2faf2] hover:text-[#1a4d1a]"
              }`}
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </button>
          ))}

          {/* Customization Section */}
          <button
            onClick={() => setCustomizationOpen((prev) => !prev)}
            className={`w-full flex items-center justify-between px-5 py-3 text-left transition-colors ${
              isCustomizationActive
                ? "bg-[#e8f5e8] text-[#1a4d1a] font-semibold border-l-4 border-[#1a4d1a]"
                : "text-[#3d5c3d] hover:bg-[#f2faf2] hover:text-[#1a4d1a]"
            }`}
          >
            <div className="flex items-center gap-4">
              <FileText size={20} />
              <span>Customization</span>
            </div>
            {customizationOpen ? (
              <ChevronUp size={18} />
            ) : (
              <ChevronDown size={18} />
            )}
          </button>

          {customizationOpen && (
            <div className="pl-6 bg-[#f2faf2]">
              {customizationItems.map((item, index) => (
                <button
                  key={index}
                  onClick={() => handleNavigate(item.path)}
                  className={`w-full flex items-center gap-3 px-5 py-2.5 text-left text-sm transition-colors ${
                    isActive(item.path)
                      ? "text-[#1a4d1a] font-semibold"
                      : "text-[#6b8f6b] hover:text-[#1a4d1a]"
                  }`}
                >
                  <item.icon size={16} />
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          )}

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-4 px-5 py-3 text-left text-red-600 hover:bg-red-50 border-t border-[#d0e8d0] mt-2 transition-colors"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </nav>
      </div>
    </>
  );
}
