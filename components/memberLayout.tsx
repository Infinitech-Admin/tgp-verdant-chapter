"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import MemberSidebar from "@/components/MemberSidebar";
import MemberHeader from "@/components/memberHeader";
import { authClient } from "@/lib/auth";

interface MemberLayoutProps {
  children: React.ReactNode;
}

export default function MemberLayout({ children }: MemberLayoutProps) {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  useEffect(() => {
    async function checkAuth() {
      try {
        const currentUser = await authClient.getCurrentUser();

        if (!currentUser) {
          router.push("/login");
          return;
        }

        if (currentUser.role !== "member") {
          router.push("/register");
          return;
        }

        setUser(currentUser);
      } catch (error) {
        router.push("/login");
      } finally {
        setIsChecking(false);
      }
    }

    checkAuth();
  }, []);

  if (isChecking) {
    return (
      <div className="min-h-screen bg-[#f2faf2] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1a4d1a] mx-auto mb-4" />
          <p className="text-[#6b8f6b]">Verifying authentication...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#f2faf2]">
      {/* Sidebar - Desktop only */}
      <MemberSidebar
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
      />

      {/* Main Content */}
      <div
        className={`pb-20 lg:pb-0 transition-all duration-300 ${
          isSidebarCollapsed ? "lg:ml-[70px]" : "lg:ml-[300px]"
        }`}
      >
        {/* Header */}
        <MemberHeader />

        {/* Page Content */}
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
