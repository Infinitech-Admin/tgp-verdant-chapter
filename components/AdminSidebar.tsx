"use client";

import React from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Newspaper,
  Mail,
  User,
  LogOut,
  FileText,
  Megaphone,
  ChevronLeft,
  ChevronRight,
  Handshake,
  ShoppingBasket,
  ShoppingBag,
  Images,
  Video,
  Calendar,
  X,
} from "lucide-react";
import { authClient } from "@/lib/auth";
import { useToast } from "@/components/ui/use-toast";

export default function AdminSidebar({
  isCollapsed,
  setIsCollapsed,
  isMobileOpen,
  setIsMobileOpen,
}: {
  isCollapsed: boolean;
  setIsCollapsed: (v: boolean) => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (v: boolean) => void;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();
  const [isLoggingOut, setIsLoggingOut] = React.useState(false);

  const toggleSidebar = () => setIsCollapsed(!isCollapsed);
  const closeMobileSidebar = () => setIsMobileOpen(false);

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
    } catch (error) {
      console.error("Logout error:", error);
      toast({
        variant: "destructive",
        title: "Logout Failed",
        description: "An error occurred. Please try again.",
      });
      setIsLoggingOut(false);
    }
  };

  const isActive = (path: string) => {
    if (path === "/dashboard/admin") return pathname === path;
    return pathname === path || pathname.startsWith(path + "/");
  };

  const handleNavigation = (path: string) => {
    router.push(path);
    closeMobileSidebar();
  };

  const navigationItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard/admin" },
    { icon: Newspaper, label: "News", path: "/dashboard/admin/news" },
    {
      icon: Megaphone,
      label: "Announcements",
      path: "/dashboard/admin/announcements",
    },
    { icon: Calendar, label: "Events", path: "/dashboard/admin/events" },
    { icon: Mail, label: "Contact Messages", path: "/dashboard/admin/contact" },
    {
      icon: FileText,
      label: "Legitimacy",
      path: "/dashboard/admin/legitimacy",
    },
    {
      icon: ShoppingBag,
      label: "Merchandize",
      path: "/dashboard/admin/merchandize",
    },
    { icon: ShoppingBasket, label: "Orders", path: "/dashboard/admin/orders" },
    { icon: User, label: "Master List", path: "/dashboard/admin/users" },
    {
      icon: FileText,
      label: "Chapter History",
      path: "/dashboard/admin/chapter-history",
    },
    {
      icon: FileText,
      label: "Lost/Stolen Card",
      path: "/dashboard/admin/stolen",
    },
    {
      icon: FileText,
      label: "Suggestion",
      path: "/dashboard/admin/suggestion",
    },
  ];

  const customization = [
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
    { icon: Video, label: "Vlogs", path: "/dashboard/admin/vlogs" },
  ];

  const NavItem = ({
    item,
  }: {
    item: { icon: React.ElementType; label: string; path: string };
  }) => {
    const active = isActive(item.path);
    return (
      <div className="group relative">
        <button
          onClick={() => handleNavigation(item.path)}
          className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-left transition-all text-sm
            ${isCollapsed ? "lg:justify-center" : ""}
            ${
              active
                ? "bg-[#d4a017]/25 text-[#d4a017] font-semibold border border-[#d4a017]/30"
                : "text-[#a8d4a8] hover:bg-white/10 hover:text-white"
            }`}
        >
          <item.icon size={16} className={active ? "text-[#d4a017]" : ""} />
          {!isCollapsed && <span>{item.label}</span>}
        </button>

        {/* Collapsed tooltip */}
        {isCollapsed && (
          <div className="hidden lg:block absolute left-full top-1/2 ml-2 -translate-y-1/2 px-3 py-2 bg-[#1a4d1a] border border-[#d4a017]/30 text-white text-xs font-semibold rounded-md shadow-xl opacity-0 translate-x-2 invisible pointer-events-none group-hover:opacity-100 group-hover:translate-x-0 group-hover:visible group-hover:pointer-events-auto transition-all duration-200 z-[9999] whitespace-nowrap">
            {item.label}
          </div>
        )}
      </div>
    );
  };

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div
        className={`flex items-center gap-3 mb-6 pb-4 border-b border-[#2d7a2d]/50 ${isCollapsed ? "justify-center" : ""}`}
      >
        <div className="w-10 h-10 rounded-full flex-shrink-0 ring-2 ring-[#d4a017]/50 shadow-lg overflow-hidden">
          <img
            src="/sigma-verdant-logo.png"
            alt="Verdant Chapter Logo"
            className="w-10 h-10 rounded-full object-cover"
          />
        </div>
        {!isCollapsed && (
          <div>
            <h1 className="font-bold text-base text-white">Verdant Chapter</h1>
            <p className="text-xs text-[#a8d4a8]">Admin Panel</p>
          </div>
        )}
      </div>

      {/* TGP badge */}
      {!isCollapsed && (
        <div className="mb-4 px-3 py-2 bg-[#d4a017]/10 border border-[#d4a017]/20 rounded-lg">
          <p className="text-[10px] font-semibold text-[#d4a017] tracking-widest">
            TAU GAMMA PHI
          </p>
          <p className="text-[10px] text-[#6b8f6b]">
            Triskelions' Grand Fraternity
          </p>
        </div>
      )}

      {/* Main Nav */}
      <nav className="space-y-0.5">
        {!isCollapsed && (
          <p className="text-[10px] font-semibold text-[#6b8f6b] tracking-widest px-3 mb-2">
            MANAGEMENT
          </p>
        )}
        {navigationItems.map((item, i) => (
          <NavItem key={i} item={item} />
        ))}
      </nav>

      {/* Customization */}
      <div className="mt-4 pt-4 border-t border-[#2d7a2d]/50">
        {!isCollapsed && (
          <p className="text-[10px] font-semibold text-[#6b8f6b] tracking-widest px-3 mb-2">
            CUSTOMIZATION
          </p>
        )}
        <nav className="space-y-0.5">
          {customization.map((item, i) => (
            <NavItem key={i} item={item} />
          ))}
        </nav>
      </div>

      {/* Logout */}
      <div className="mt-auto pt-4 border-t border-[#2d7a2d]/50">
        <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-[#a8d4a8] hover:bg-red-500/20 hover:text-red-300 transition-all
            ${isCollapsed ? "lg:justify-center" : ""}`}
        >
          {isLoggingOut ? (
            <>
              <div className="w-4 h-4 border-2 border-[#a8d4a8] border-t-transparent rounded-full animate-spin" />
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
    </>
  );

  const sidebarBg = "bg-[#0f2e0f]";
  const sidebarBorder = "border-r border-[#1a4d1a]";

  return (
    <>
      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={closeMobileSidebar}
        />
      )}

      {/* Desktop sidebar */}
      <aside
        className={`hidden lg:fixed lg:flex lg:flex-col top-0 left-0 h-full overflow-visible
          ${sidebarBg} ${sidebarBorder}
          text-white shadow-2xl z-50 transition-all duration-300
          ${isCollapsed ? "w-[70px]" : "w-[260px]"}`}
      >
        {/* Toggle button */}
        <button
          onClick={toggleSidebar}
          className="absolute top-6 -right-3 bg-[#1a4d1a] border border-[#d4a017]/40 text-[#d4a017] rounded-full p-1.5 shadow-lg hover:bg-[#2d7a2d] transition-colors z-[9999]"
        >
          {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>

        <div
          className={`h-full overflow-y-auto overflow-x-hidden flex flex-col
            ${isCollapsed ? "py-6 px-3" : "py-6 px-4"}`}
          style={{ scrollbarWidth: "thin", scrollbarColor: "#d4a017 #0f2e0f" }}
        >
          <SidebarContent />
        </div>
      </aside>

      {/* Mobile sidebar */}
      <aside
        className={`fixed lg:hidden top-0 left-0 h-full overflow-visible
          ${sidebarBg} ${sidebarBorder}
          text-white shadow-2xl z-50 transition-transform duration-300 w-[260px]
          ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <button
          onClick={closeMobileSidebar}
          className="absolute top-4 right-4 bg-[#1a4d1a] border border-[#d4a017]/40 text-[#d4a017] rounded-full p-1.5 shadow-lg hover:bg-[#2d7a2d] transition-colors z-[9999]"
        >
          <X size={14} />
        </button>

        <div
          className="h-full overflow-y-auto overflow-x-hidden py-6 px-4 flex flex-col"
          style={{ scrollbarWidth: "thin", scrollbarColor: "#d4a017 #0f2e0f" }}
        >
          <SidebarContent />
        </div>
      </aside>
    </>
  );
}
