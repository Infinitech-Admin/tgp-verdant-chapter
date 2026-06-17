"use client";

import { useEffect, useState } from "react";
import {
  Users,
  FileCheck,
  Clock,
  CheckCircle,
  Calendar,
  BarChart3,
  Activity,
  TrendingUp,
  TrendingDown,
  Newspaper,
  Bell,
} from "lucide-react";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import AdminLayout from "@/components/adminLayout";

interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  issuedCertificates: number;
  pendingApprovals: number;
}

interface User {
  id: number;
  status: "pending" | "approved" | "rejected" | "deactivated";
  created_at: string;
}

interface News {
  id: number;
  status: "draft" | "published" | "archived";
  category: string;
  created_at: string;
}

interface Announcement {
  id: number;
  category: string;
  is_active: boolean;
  created_at: string;
}

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    activeUsers: 0,
    issuedCertificates: 0,
    pendingApprovals: 0,
  });
  const [userStatusChart, setUserStatusChart] = useState<any[]>([]);
  const [newsPieChart, setNewsPieChart] = useState<any[]>([]);
  const [weeklyRegistrationChart, setWeeklyRegistrationChart] = useState<any[]>(
    [],
  );
  const [announcementCategoryChart, setAnnouncementCategoryChart] = useState<
    any[]
  >([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [usersRes, newsRes, announcementsRes] = await Promise.all([
        fetch("/api/users", { credentials: "include" }),
        fetch("/api/admin/news", { credentials: "include" }),
        fetch("/api/announcements", { credentials: "include" }),
      ]);

      const usersJson = await usersRes.json();
      const newsJson = await newsRes.json();
      const announcementsJson = await announcementsRes.json();

      const users: User[] =
        usersJson.data && Array.isArray(usersJson.data)
          ? usersJson.data
          : usersJson.data?.data || [];
      const news: News[] =
        newsJson.data && Array.isArray(newsJson.data)
          ? newsJson.data
          : newsJson.data?.data || [];
      const announcements: Announcement[] =
        announcementsJson.data && Array.isArray(announcementsJson.data)
          ? announcementsJson.data
          : announcementsJson.data?.data || [];

      const approvedUsers = users.filter((u) => u.status === "approved").length;
      const pendingUsers = users.filter((u) => u.status === "pending").length;
      const rejectedUsers = users.filter((u) => u.status === "rejected").length;
      const deactivatedUsers = users.filter(
        (u) => u.status === "deactivated",
      ).length;

      setStats({
        totalUsers: users.length,
        activeUsers: approvedUsers,
        issuedCertificates: news.filter((n) => n.status === "published").length,
        pendingApprovals: pendingUsers,
      });

      setUserStatusChart([
        { name: "Pending", value: pendingUsers, color: "#d4a017" },
        { name: "Approved", value: approvedUsers, color: "#2d7a2d" },
        { name: "Rejected", value: rejectedUsers, color: "#7a2020" },
        { name: "Deactivated", value: deactivatedUsers, color: "#3d5c3d" },
      ]);

      const weeklyMap: Record<string, number> = {
        Mon: 0,
        Tue: 0,
        Wed: 0,
        Thu: 0,
        Fri: 0,
        Sat: 0,
        Sun: 0,
      };
      users.forEach((u) => {
        const day = new Date(u.created_at).toLocaleDateString("en-US", {
          weekday: "short",
        });
        if (weeklyMap[day] !== undefined) weeklyMap[day]++;
      });
      setWeeklyRegistrationChart(
        Object.entries(weeklyMap).map(([day, value]) => ({ day, value })),
      );

      setNewsPieChart([
        {
          name: "Published",
          value: news.filter((n) => n.status === "published").length,
          color: "#2d7a2d",
        },
        {
          name: "Drafts",
          value: news.filter((n) => n.status === "draft").length,
          color: "#6b8f6b",
        },
        {
          name: "Archived",
          value: news.filter((n) => n.status === "archived").length,
          color: "#d4a017",
        },
      ]);

      const announcementMap: Record<string, number> = {};
      announcements.forEach((a) => {
        const category = a.category || "Other";
        announcementMap[category] = (announcementMap[category] || 0) + 1;
      });
      setAnnouncementCategoryChart(
        Object.entries(announcementMap)
          .map(([name, value]) => ({ name, value }))
          .sort((a, b) => b.value - a.value),
      );
    } catch (err) {
      console.error("Dashboard error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f2faf2] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1a4d1a] mx-auto" />
          <p className="mt-4 text-[#6b8f6b]">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <AdminLayout>
      <div className="min-h-screen bg-[#f2faf2]">
        {/* Header */}
        <div className="bg-white border-b border-[#d0e8d0] sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#e8f5e8] rounded-lg">
                <BarChart3 className="w-6 h-6 text-[#1a4d1a]" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-[#1a2e1a]">Dashboard</h1>
                <p className="text-sm text-[#6b8f6b]">
                  Overview of system statistics
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Total Users"
              value={stats.totalUsers}
              icon={Users}
              accent="#1a4d1a"
              trend="+12%"
            />
            <StatCard
              title="Active Users"
              value={stats.activeUsers}
              icon={CheckCircle}
              accent="#2d7a2d"
              trend="+8%"
            />
            <StatCard
              title="Published News"
              value={stats.issuedCertificates}
              icon={FileCheck}
              accent="#d4a017"
              trend="+15%"
            />
            <StatCard
              title="Pending Approvals"
              value={stats.pendingApprovals}
              icon={Clock}
              accent="#7a5c0a"
              trend="-5%"
            />
          </div>

          {/* Charts Row 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartCard title="User Status Distribution" icon={Users}>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={userStatusChart}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label
                  >
                    {userStatusChart.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="News & Articles Status" icon={Newspaper}>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={newsPieChart}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label
                  >
                    {newsPieChart.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>

          {/* Charts Row 2 */}
          <div className="grid grid-cols-1 gap-6">
            <ChartCard title="Weekly Registration Activity" icon={Calendar}>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={weeklyRegistrationChart}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#d0e8d0" />
                  <XAxis dataKey="day" tick={{ fill: "#6b8f6b" }} />
                  <YAxis tick={{ fill: "#6b8f6b" }} />
                  <Tooltip
                    contentStyle={{ borderColor: "#c8e6c8", borderRadius: 8 }}
                  />
                  <Bar dataKey="value" fill="#1a4d1a" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Announcements by Category" icon={Bell}>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={announcementCategoryChart}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#d0e8d0" />
                  <XAxis
                    dataKey="name"
                    angle={-45}
                    textAnchor="end"
                    height={100}
                    tick={{ fill: "#6b8f6b" }}
                  />
                  <YAxis tick={{ fill: "#6b8f6b" }} />
                  <Tooltip
                    contentStyle={{ borderColor: "#c8e6c8", borderRadius: 8 }}
                  />
                  <Bar dataKey="value" fill="#d4a017" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>

          {/* Summary */}
          <div className="bg-white rounded-lg border border-[#d0e8d0] p-6">
            <h2 className="text-lg font-bold text-[#1a2e1a] mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-[#1a4d1a]" />
              Quick Summary
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <SummaryItem
                label="Total Registered Users"
                value={stats.totalUsers}
                description="All users in the system"
              />
              <SummaryItem
                label="Approval Rate"
                value={`${stats.totalUsers > 0 ? Math.round((stats.activeUsers / stats.totalUsers) * 100) : 0}%`}
                description="Approved vs total users"
              />
              <SummaryItem
                label="Pending Review"
                value={stats.pendingApprovals}
                description="Awaiting admin action"
              />
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

/* ── Helper Components ── */

const StatCard = ({ title, value, icon: Icon, accent, trend }: any) => {
  const isPositive = trend?.startsWith("+");
  return (
    <div className="bg-white rounded-lg border border-[#d0e8d0] p-6 hover:shadow-lg hover:border-[#1a4d1a]/30 transition-all">
      <div className="flex items-center justify-between mb-4">
        <div className="p-3 rounded-lg" style={{ background: `${accent}18` }}>
          <Icon className="w-6 h-6" style={{ color: accent }} />
        </div>
        {trend && (
          <div
            className={`flex items-center gap-1 text-sm font-medium ${isPositive ? "text-[#2d7a2d]" : "text-[#7a2020]"}`}
          >
            {isPositive ? (
              <TrendingUp className="w-4 h-4" />
            ) : (
              <TrendingDown className="w-4 h-4" />
            )}
            {trend}
          </div>
        )}
      </div>
      <p className="text-3xl font-bold text-[#1a2e1a]">{value}</p>
      <p className="text-sm text-[#6b8f6b] mt-1">{title}</p>
    </div>
  );
};

const ChartCard = ({ title, icon: Icon, children }: any) => (
  <div className="bg-white rounded-lg border border-[#d0e8d0] p-6">
    <h2 className="text-lg font-bold text-[#1a2e1a] mb-4 flex items-center gap-2">
      <Icon className="w-5 h-5 text-[#1a4d1a]" />
      {title}
    </h2>
    {children}
  </div>
);

const SummaryItem = ({ label, value, description }: any) => (
  <div className="p-4 bg-[#f2faf2] border border-[#d0e8d0] rounded-lg">
    <p className="text-sm text-[#6b8f6b] mb-1">{label}</p>
    <p className="text-2xl font-bold text-[#1a2e1a]">{value}</p>
    <p className="text-xs text-[#6b8f6b] mt-1">{description}</p>
  </div>
);
